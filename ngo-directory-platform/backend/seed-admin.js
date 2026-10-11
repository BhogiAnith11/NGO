/**
 * Admin Seed Script
 * Creates an admin user in MongoDB.
 * Usage: node seed-admin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL = 'admin@district.gov.in';
const ADMIN_PASSWORD = 'Admin@2026';
const ADMIN_NAME = 'District Admin';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: String,
  phone: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const seed = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log('ℹ️  Admin user already exists:', ADMIN_EMAIL);
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        passwordHash,
        role: 'admin',
      });
      console.log('✅ Admin user created!');
      console.log('   Email   :', ADMIN_EMAIL);
      console.log('   Password:', ADMIN_PASSWORD);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
