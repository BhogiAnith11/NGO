const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');

// @desc    Get all events / welfare drives
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const { category, upcoming, status } = req.query;
  const filter = {};

  if (status) {
    filter.status = status;
  } else {
    filter.status = 'approved';
  }

  if (category) filter.category = category;
  if (upcoming === 'true') {
    filter.date = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
  }

  const events = await Event.find(filter)
    .populate('organizerNgoId', 'ngoName registrationNumber status')
    .sort({ date: 1 });

  const approvedActivities = await require('../models/Activity').find({ status: 'approved' })
    .populate('ngoId', 'ngoName registrationNumber status')
    .sort({ date: -1 });

  const mappedActivities = approvedActivities.map((activity) => ({
    _id: activity._id,
    title: activity.title,
    description: activity.description,
    category: activity.category || 'Other',
    date: activity.date,
    location: 'Community Initiative',
    organizer: activity.ngoId?.ngoName || 'Verified NGO',
    organizerNgoId: activity.ngoId || null,
    image: activity.images?.[0] || '/asset/img1.png',
    volunteersNeeded: 0,
    volunteersRegistered: 0,
    contactPhone: '',
    status: 'approved',
    type: 'activity',
  }));

  const combined = [...events, ...mappedActivities].sort((a, b) => new Date(a.date) - new Date(b.date));

  let finalEvents = combined;
  if (category) {
    finalEvents = combined.filter((item) => item.category === category);
  }

  res.json({
    success: true,
    count: finalEvents.length,
    data: finalEvents,
  });
});

const adminGetEvents = asyncHandler(async (req, res) => {
  const { status = 'pending' } = req.query;
  const validStatuses = ['pending', 'approved', 'rejected'];

  if (status && !validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const filter = status ? { status } : {};
  const events = await Event.find(filter)
    .populate('organizerNgoId', 'ngoName registrationNumber status')
    .sort({ date: 1 });

  res.json({
    success: true,
    count: events.length,
    data: events,
  });
});

// @desc    Create a new welfare drive / event
// @route   POST /api/events
// @access  NGO / Admin
const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    date,
    location,
    organizer,
    organizerNgoId,
    image,
    volunteersNeeded,
    contactPhone,
  } = req.body;

  if (!title || !description || !date || !location) {
    res.status(400);
    throw new Error('Please fill all required event details');
  }

  const event = await Event.create({
    title,
    description,
    category: category || 'Other',
    date: new Date(date),
    location,
    organizer: organizer || req.user.name,
    organizerNgoId: organizerNgoId || (req.user.role === 'ngo' ? req.user.ngoId : null),
    image: image || '/asset/img1.png',
    volunteersNeeded: Number(volunteersNeeded) || 20,
    volunteersRegistered: 0,
    contactPhone: contactPhone || req.user.phone,
    status: 'pending',
  });

  res.status(201).json({
    success: true,
    data: event,
  });
});

// @desc    Register as a volunteer for an event
// @route   POST /api/events/:id/volunteer
// @access  Public / Logged in
const volunteerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  event.volunteersRegistered = (event.volunteersRegistered || 0) + 1;
  await event.save();

  res.json({
    success: true,
    message: 'You have registered as a volunteer for this drive! The organizers will reach out.',
    data: event,
  });
});

const updateEventStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'approved', 'rejected'];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  event.status = status;
  await event.save();

  res.json({ success: true, data: event });
});

module.exports = {
  getEvents,
  adminGetEvents,
  createEvent,
  volunteerForEvent,
  updateEventStatus,
};
