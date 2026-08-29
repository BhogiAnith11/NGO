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
  });

  res.status(201).json({ success: true, data: activity });
});

// @desc    Get all activities for an NGO
// @route   GET /api/ngos/:id/activities
// @access  Public
const getActivities = asyncHandler(async (req, res) => {
  const activities = await Activity.find({ ngoId: req.params.id }).sort({
    date: -1,
  });
  res.json({ success: true, count: activities.length, data: activities });
});

module.exports = { createActivity, getActivities };
