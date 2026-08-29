const asyncHandler = require('express-async-handler');
const NGO = require('../models/NGO');
const User = require('../models/User');
const ConnectRequest = require('../models/ConnectRequest');
const { exportNGOsToCSV } = require('../utils/csvExport');

// @desc    List all NGOs (any status) with optional filter
// @route   GET /api/admin/ngos
// @access  Admin
const adminGetNGOs = asyncHandler(async (req, res) => {
  const { status, category, region } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (category) filter.focusAreas = { $in: [category] };
  if (region) filter.serviceRegion = { $in: [new RegExp(region, 'i')] };

  const ngos = await NGO.find(filter)
    .populate('userId', 'name email phone createdAt')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: ngos.length, data: ngos });
});

// @desc    Approve, reject, or deactivate an NGO
// @route   PATCH /api/admin/ngos/:id/status
// @access  Admin
const updateNGOStatus = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const validStatuses = ['pending', 'approved', 'rejected'];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const ngo = await NGO.findById(req.params.id);
  if (!ngo) {
    res.status(404);
    throw new Error('NGO not found');
  }

  ngo.status = status;
  if (status === 'rejected' && rejectionReason) {
    ngo.rejectionReason = rejectionReason;
  }
  await ngo.save();

  res.json({ success: true, data: ngo });
});

// @desc    Analytics dashboard data
// @route   GET /api/admin/analytics
// @access  Admin
const getAnalytics = asyncHandler(async (req, res) => {
  const totalNGOs = await NGO.countDocuments();
  const approvedNGOs = await NGO.countDocuments({ status: 'approved' });
  const pendingNGOs = await NGO.countDocuments({ status: 'pending' });
  const rejectedNGOs = await NGO.countDocuments({ status: 'rejected' });
  const totalUsers = await User.countDocuments();
  const totalConnects = await ConnectRequest.countDocuments();

  // NGOs per category (focusAreas)
  const categoryAgg = await NGO.aggregate([
    { $match: { status: 'approved' } },
    { $unwind: '$focusAreas' },
    { $group: { _id: '$focusAreas', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // NGOs per region
  const regionAgg = await NGO.aggregate([
    { $match: { status: 'approved' } },
    { $unwind: '$serviceRegion' },
    { $group: { _id: '$serviceRegion', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 15 },
  ]);

  // Recent registrations (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentRegistrations = await NGO.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  res.json({
    success: true,
    data: {
      totalNGOs,
      approvedNGOs,
      pendingNGOs,
      rejectedNGOs,
      totalUsers,
      totalConnects,
      recentRegistrations,
      byCategory: categoryAgg.map((c) => ({ name: c._id, count: c.count })),
      byRegion: regionAgg.map((r) => ({ name: r._id, count: r.count })),
    },
  });
});

// @desc    Export approved NGOs as CSV
// @route   GET /api/admin/export
// @access  Admin
const exportCSV = asyncHandler(async (req, res) => {
  const ngos = await NGO.find({}).lean();
  const csv = exportNGOsToCSV(ngos);

  res.header('Content-Type', 'text/csv');
  res.header(
    'Content-Disposition',
    `attachment; filename="ngo_export_${Date.now()}.csv"`
  );
  res.send(csv);
});

module.exports = { adminGetNGOs, updateNGOStatus, getAnalytics, exportCSV };
