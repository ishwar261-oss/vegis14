const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  line1: String,
  line2: String,
  city: String,
  state: String,
  pincode: String,
  landmark: String,
  instructions: String,
  location: {
    lat: Number,
    lng: Number
  },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  phone: { type: String, required: true, unique: true, index: true },
  email: { type: String, lowercase: true, trim: true },
  passwordHash: String,
  role: { type: String, enum: ['customer', 'admin', 'farmer', 'delivery', 'owner'], default: 'customer', index: true },
  avatarUrl: String,
  language: { type: String, default: 'en' },
  isActive: { type: Boolean, default: true },
  darkMode: { type: Boolean, default: false },
  addresses: [addressSchema],
  walletBalance: { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 0 },
  referralCode: { type: String, index: true },
  referredBy: String,
  savedPayments: [{
    provider: String,
    label: String,
    token: String,
    last4: String
  }],
  notificationPrefs: {
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  otp: {
    code: String,
    expiresAt: Date,
    attempts: { type: Number, default: 0 }
  },
  lastLoginAt: Date
}, { timestamps: true });

userSchema.methods.setPassword = async function setPassword(password) {
  this.passwordHash = await bcrypt.hash(password, 12);
};

userSchema.methods.verifyPassword = function verifyPassword(password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
module.exports = { User, addressSchema };
