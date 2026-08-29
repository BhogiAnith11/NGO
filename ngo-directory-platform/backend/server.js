const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const ngoRoutes = require('./routes/ngoRoutes');
const activityRoutes = require('./routes/activityRoutes');
const connectRoutes = require('./routes/connectRoutes');
const adminRoutes = require('./routes/adminRoutes');
const donationRoutes = require('./routes/donationRoutes');
const contactRoutes = require('./routes/contactRoutes');
const eventRoutes = require('./routes/eventRoutes');

// Models (for public stats)
const NGO = require('./models/NGO');
const Activity = require('./models/Activity');
const Donation = require('./models/Donation');
const Event = require('./models/Event');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    // Allow any localhost port in development
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
    // Allow the configured CLIENT_URL in production
    if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/ngos/:id/activities', activityRoutes);
app.use('/api/connect', connectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/events', eventRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'NGO Directory & Social Impact API is running 🚀' });
});

// Public platform stats — no auth required
app.get('/api/stats', async (req, res) => {
  try {
    const [totalNGOs, approvedNGOs, focusAreaAgg, regionAgg, beneficiaryAgg, totalDonations, totalEvents] = await Promise.all([
      NGO.countDocuments(),
      NGO.countDocuments({ status: 'approved' }),
      NGO.aggregate([
        { $match: { status: 'approved' } },
        { $unwind: '$focusAreas' },
        { $group: { _id: '$focusAreas' } },
        { $count: 'total' },
      ]),
      NGO.aggregate([
        { $match: { status: 'approved' } },
        { $unwind: '$serviceRegion' },
        { $group: { _id: { $toLower: '$serviceRegion' } } },
        { $count: 'total' },
      ]),
      Activity.aggregate([
        { $group: { _id: null, total: { $sum: '$beneficiaryCount' } } },
      ]),
      Donation.countDocuments(),
      Event.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        totalNGOs,
        approvedNGOs,
        focusAreaCount: focusAreaAgg[0]?.total ?? 0,
        villageCount: regionAgg[0]?.total ?? 0,
        beneficiariesReached: beneficiaryAgg[0]?.total ?? 0,
        totalDonations,
        totalEvents,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Error Handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
