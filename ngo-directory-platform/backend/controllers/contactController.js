const asyncHandler = require('express-async-handler');
const Contact = require('../models/Contact');

// @desc    Submit public contact inquiry or feedback
// @route   POST /api/contacts
// @access  Public
const createContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || name.trim() === '') {
    res.status(400);
    throw new Error('Name is required');
  }
  if (!email || !/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.trim())) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }
  if (!message || message.trim() === '') {
    res.status(400);
    throw new Error('Message is required');
  }

  const contact = await Contact.create({
    name: name.trim(),
    email: email.trim(),
    phone: phone ? phone.trim() : undefined,
    subject: subject ? subject.trim() : 'General Inquiry',
    message: message.trim(),
    status: 'new',
  });

  res.status(201).json({
    success: true,
    message: 'Your inquiry has been submitted to the District Nodal Office.',
    data: contact,
  });
});

// @desc    Get all contact inquiries (Admin)
// @route   GET /api/contacts
// @access  Admin
const getContacts = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const contacts = await Contact.find(filter).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: contacts.length,
    data: contacts,
  });
});

// @desc    Update contact inquiry status
// @route   PATCH /api/contacts/:id/status
// @access  Admin
const updateContactStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    res.status(404);
    throw new Error('Inquiry not found');
  }

  contact.status = status || contact.status;
  await contact.save();

  res.json({
    success: true,
    data: contact,
  });
});

module.exports = {
  createContact,
  getContacts,
  updateContactStatus,
};
