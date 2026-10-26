const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
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
const medicalAssistanceRoutes = require('./routes/medicalAssistanceRoutes');

// Models (for public stats)
const NGO = require('./models/NGO');
const Activity = require('./models/Activity');
const Donation = require('./models/Donation');
const Event = require('./models/Event');
const MedicalAssistance = require('./models/MedicalAssistance');

dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    // Allow any localhost port in development
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
    // If CLIENT_URL is not configured or is wildcard, allow all origins
    if (!process.env.CLIENT_URL || process.env.CLIENT_URL === '*') return callback(null, true);
    // Allow configured CLIENT_URL(s) (handles comma-separated list and strips trailing slashes)
    const allowedOrigins = process.env.CLIENT_URL.split(',').map((u) => u.trim().replace(/\/$/, ''));
    if (allowedOrigins.includes(origin.replace(/\/$/, ''))) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SECURITY: Strictly deny unrestricted public access to private medical records
app.use('/uploads/private_medical', (req, res) => {
  res.status(403).json({
    success: false,
    message: 'Access denied. Private medical files can only be accessed through authorized endpoints.',
  });
});

// Serve uploaded public files (photos, logos) statically
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
app.use('/api/medical-assistance', medicalAssistanceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'NGO Directory & Social Impact API is running 🚀' });
});

// Public platform stats — no auth required
app.get('/api/stats', async (req, res) => {
  try {
    const [
      totalNGOs,
      approvedNGOs,
      focusAreaAgg,
      regionAgg,
      beneficiaryAgg,
      totalDonations,
      totalEvents,
      totalMedicalCampaigns,
      approvedMedicalCampaigns,
      medicalDonationAgg,
    ] = await Promise.all([
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
      MedicalAssistance.countDocuments(),
      MedicalAssistance.countDocuments({ verificationStatus: 'Approved' }),
      Donation.aggregate([
        { $match: { transactionStatus: 'successful', targetType: 'medical_campaign' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
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
        totalMedicalCampaigns,
        approvedMedicalCampaigns,
        totalMedicalAidRaised: medicalDonationAgg[0]?.total ?? 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Serve frontend static build in production (if available)
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error Handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
