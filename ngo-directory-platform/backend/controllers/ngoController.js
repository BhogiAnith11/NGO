const asyncHandler = require('express-async-handler');
const NGO = require('../models/NGO');
const Activity = require('../models/Activity');

// @desc    Get all approved NGOs (with search & filter)
// @route   GET /api/ngos
// @access  Public
const getNGOs = asyncHandler(async (req, res) => {
  const { search, category, region, status } = req.query;

  const filter = {};

  // Public always sees only approved; admin can pass status param
  filter.status = status || 'approved';

  if (search) {
    filter.$or = [
      { ngoName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    filter.focusAreas = { $in: [category] };
  }

  if (region) {
    filter.serviceRegion = { $in: [new RegExp(region, 'i')] };
  }

  const ngos = await NGO.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: ngos.length, data: ngos });
});

// @desc    Get single NGO profile with activities
// @route   GET /api/ngos/:id
// @access  Public
const getNGOById = asyncHandler(async (req, res) => {
  const ngo = await NGO.findById(req.params.id);
  if (!ngo) {
    res.status(404);
    throw new Error('NGO not found');
  }

  const activities = await Activity.find({ ngoId: ngo._id }).sort({
    date: -1,
  });

  res.json({ success: true, data: { ...ngo.toObject(), activities } });
});

// @desc    Create NGO profile (status = pending)
// @route   POST /api/ngos
// @access  NGO only
const createNGO = asyncHandler(async (req, res) => {
  const existing = await NGO.findOne({ userId: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('You already have an NGO profile');
  }

  const {
    ngoName,
    registrationNumber,
    focusAreas,
    serviceRegion,
    address,
    latitude,
    longitude,
    contactEmail,
    contactPhone,
    website,
    socialLinks,
    description,
  } = req.body;

  const logoUrl = req.file ? `/uploads/${req.file.filename}` : '';

  const ngo = await NGO.create({
    userId: req.user._id,
    ngoName,
    registrationNumber,
    focusAreas: Array.isArray(focusAreas)
      ? focusAreas
      : JSON.parse(focusAreas || '[]'),
    serviceRegion: Array.isArray(serviceRegion)
      ? serviceRegion
      : serviceRegion.split(',').map((s) => s.trim()),
    address,
    latitude,
    longitude,
    contactEmail,
    contactPhone,
    website,
    socialLinks: socialLinks
      ? typeof socialLinks === 'string'
        ? JSON.parse(socialLinks)
        : socialLinks
      : {},
    description,
    logoUrl,
    status: 'pending',
  });

  res.status(201).json({ success: true, data: ngo });
});

// @desc    Update own NGO profile
// @route   PUT /api/ngos/:id
// @access  NGO (owner)
const updateNGO = asyncHandler(async (req, res) => {
  const ngo = await NGO.findById(req.params.id);
  if (!ngo) {
    res.status(404);
    throw new Error('NGO not found');
  }

  if (ngo.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only update your own NGO profile');
  }

  const updates = { ...req.body };

  // Handle array fields sent as string
  if (updates.focusAreas && typeof updates.focusAreas === 'string') {
    updates.focusAreas = JSON.parse(updates.focusAreas);
  }
  if (updates.serviceRegion && typeof updates.serviceRegion === 'string') {
    updates.serviceRegion = updates.serviceRegion
      .split(',')
      .map((s) => s.trim());
  }
  if (updates.socialLinks && typeof updates.socialLinks === 'string') {
    updates.socialLinks = JSON.parse(updates.socialLinks);
  }

  if (req.file) {
    updates.logoUrl = `/uploads/${req.file.filename}`;
  }

  // Prevent status manipulation via this endpoint
  delete updates.status;

  const updated = await NGO.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: updated });
});

// @desc    Get own NGO profile
// @route   GET /api/ngos/mine
// @access  NGO only
const getMyNGO = asyncHandler(async (req, res) => {
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo) {
    res.status(404);
    throw new Error('No NGO profile found for this account');
  }
  res.json({ success: true, data: ngo });
});

module.exports = { getNGOs, getNGOById, createNGO, updateNGO, getMyNGO };
