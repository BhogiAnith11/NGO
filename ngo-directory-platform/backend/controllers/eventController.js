const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');

// @desc    Get all events / welfare drives
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const { category, upcoming } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (upcoming === 'true') {
    filter.date = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
  }

  const events = await Event.find(filter)
    .populate('organizerNgoId', 'ngoName registrationNumber')
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

module.exports = {
  getEvents,
  createEvent,
  volunteerForEvent,
};
