const asyncHandler = require('express-async-handler');
const ConnectRequest = require('../models/ConnectRequest');
const NGO = require('../models/NGO');

// @desc    Send a connect request to an NGO
// @route   POST /api/connect/:ngoId
// @access  Donor / Volunteer / NGO (logged-in)
const sendConnectRequest = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) {
    res.status(400);
    throw new Error('Message is required');
  }

  const ngo = await NGO.findById(req.params.ngoId);
  if (!ngo || ngo.status !== 'approved') {
    res.status(404);
    throw new Error('NGO not found or not approved');
  }

  // Prevent the NGO from connecting to itself
  if (ngo.userId.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot send a connect request to your own NGO');
  }

  const request = await ConnectRequest.create({
    fromUserId: req.user._id,
    toNgoId: ngo._id,
    senderName: req.user.name,
    senderEmail: req.user.email,
    senderRole: req.user.role,
    message,
  });

  res.status(201).json({ success: true, data: request });
});

// @desc    Get connect request inbox for logged-in NGO
// @route   GET /api/connect/inbox
// @access  NGO only
const getInbox = asyncHandler(async (req, res) => {
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo) {
    res.status(404);
    throw new Error('No NGO profile found');
  }

  const requests = await ConnectRequest.find({ toNgoId: ngo._id })
    .sort({ createdAt: -1 })
    .populate('fromUserId', 'name email role phone');

  res.json({ success: true, count: requests.length, data: requests });
});

// @desc    Mark a connect request as read / responded
// @route   PATCH /api/connect/:requestId
// @access  NGO only
const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status, response } = req.body;

  const request = await ConnectRequest.findById(req.params.requestId);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  // Make sure this NGO owns the request
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo || request.toNgoId.toString() !== ngo._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (status) request.status = status;
  if (response) request.response = response;
  await request.save();

  res.json({ success: true, data: request });
});

module.exports = { sendConnectRequest, getInbox, updateRequestStatus };
