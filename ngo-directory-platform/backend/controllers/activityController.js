const asyncHandler = require('express-async-handler');
const Activity = require('../models/Activity');
const NGO = require('../models/NGO');

// @desc    Post a new activity/impact update
// @route   POST /api/ngos/:id/activities
// @access  NGO (owner)
const createActivity = asyncHandler(async (req, res) => {
  const ngo = await NGO.findById(req.params.id);
  if (!ngo) {
    res.status(404);
    throw new Error('NGO not found');
  }

  if (ngo.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only post activities for your own NGO');
  }

  const { title, description, date, beneficiaryCount, category } = req.body;

  const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

  const activity = await Activity.create({
    ngoId: ngo._id,
    title,
    description,
    date,
    images,
    beneficiaryCount: beneficiaryCount || 0,
    category,
    status: 'pending',
  });

  res.status(201).json({ success: true, data: activity });
});

// @desc    Get all activities for an NGO
// @route   GET /api/ngos/:id/activities
// @access  Public
const getActivities = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { ngoId: req.params.id };

  if (status && status !== 'all') {
    filter.status = status;
  }

  const activities = await Activity.find(filter).sort({
    date: -1,
  });
  res.json({ success: true, count: activities.length, data: activities });
});

const adminGetActivities = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};

  if (status) filter.status = status;

  const activities = await Activity.find(filter)
    .populate('ngoId', 'ngoName registrationNumber')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: activities.length, data: activities });
});

const updateActivityStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'approved', 'rejected'];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const activity = await Activity.findById(req.params.id);
  if (!activity) {
    res.status(404);
    throw new Error('Activity not found');
  }

  activity.status = status;
  await activity.save();

  res.json({ success: true, data: activity });
});

const deleteActivity = asyncHandler(async (req, res) => {
  const ngo = await NGO.findById(req.params.id);
  if (!ngo) {
    res.status(404);
    throw new Error('NGO not found');
  }

  if (ngo.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only delete activities for your own NGO');
  }

  const activity = await Activity.findById(req.params.activityId);
  if (!activity) {
    res.status(404);
    throw new Error('Activity not found');
  }

  if (activity.ngoId.toString() !== ngo._id.toString()) {
    res.status(403);
    throw new Error('This activity does not belong to your NGO');
  }

  await activity.deleteOne();

  res.json({ success: true, message: 'Activity deleted successfully' });
});

module.exports = {
  createActivity,
  getActivities,
  adminGetActivities,
  updateActivityStatus,
  deleteActivity,
};
