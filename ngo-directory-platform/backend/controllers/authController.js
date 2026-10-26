const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const NGO = require('../models/NGO');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (NGO / donor / volunteer)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Please provide name, email, password, and role');
  }

  const validRoles = ['ngo', 'donor', 'volunteer', 'patient'];
  if (!validRoles.includes(role)) {
    res.status(400);
    throw new Error('Invalid role. Choose ngo, donor, volunteer, or patient');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email, passwordHash, role, phone });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});

// @desc    Authenticate user and get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Attach NGO profile id if role is ngo
  let ngoId = null;
  if (user.role === 'ngo') {
    const ngo = await NGO.findOne({ userId: user._id }).select('_id');
    if (ngo) ngoId = ngo._id;
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      ngoId,
      token: generateToken(user._id),
    },
  });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  let ngoId = null;
  if (user.role === 'ngo') {
    const ngo = await NGO.findOne({ userId: user._id }).select('_id');
    if (ngo) ngoId = ngo._id;
  }
  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      ngoId,
    },
  });
});

module.exports = { registerUser, loginUser, getMe };
