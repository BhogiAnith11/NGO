const asyncHandler = require('express-async-handler');
const Donation = require('../models/Donation');
const NGO = require('../models/NGO');

// @desc    Submit a new donation (money, food, clothing, education, medical)
// @route   POST /api/donations
// @access  Public
const createDonation = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    email,
    date,
    location,
    donationType,
    amount,
    targetNgoId,
    itemDescription,
  } = req.body;

  if (!name || name.trim() === '') {
    res.status(400);
    throw new Error('Name is required');
  }
  if (!phone || !/^\d{10}$/.test(phone.replace(/[\s\-\+]/g, '').slice(-10))) {
    res.status(400);
    throw new Error('Valid 10-digit phone number is required');
  }
  if (!location || location.trim() === '') {
    res.status(400);
    throw new Error('Location is required');
  }
  if (!donationType) {
    res.status(400);
    throw new Error('Donation type is required');
  }
  if (donationType === 'money' && (!amount || Number(amount) <= 0)) {
    res.status(400);
    throw new Error('Valid donation amount is required for financial contributions');
  }

  let targetNgoName = 'District General Welfare Fund';
  if (targetNgoId) {
    const ngo = await NGO.findById(targetNgoId);
    if (ngo) {
      targetNgoName = ngo.ngoName;
    }
  }

  const donation = await Donation.create({
    name: name.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : undefined,
    date: date ? new Date(date) : new Date(),
    location: location.trim(),
    donationType,
    amount: donationType === 'money' ? Number(amount) : undefined,
    targetNgoId: targetNgoId || null,
    targetNgoName,
    itemDescription: itemDescription ? itemDescription.trim() : undefined,
    status: 'received',
  });

  res.status(201).json({
    success: true,
    message: 'Donation registered successfully! Thank you for supporting our community.',
    data: donation,
  });
});

// @desc    Get all donations (Admin)
// @route   GET /api/donations
// @access  Admin
const getDonations = asyncHandler(async (req, res) => {
  const { type, status } = req.query;
  const filter = {};
  if (type) filter.donationType = type;
  if (status) filter.status = status;

  const donations = await Donation.find(filter)
    .populate('targetNgoId', 'ngoName registrationNumber')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: donations.length,
    data: donations,
  });
});

// @desc    Get donations for a specific NGO
// @route   GET /api/donations/ngo/:ngoId
// @access  NGO (owner) / Admin
const getNgoDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.find({ targetNgoId: req.params.ngoId })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: donations.length,
    data: donations,
  });
});

module.exports = {
  createDonation,
  getDonations,
  getNgoDonations,
};
