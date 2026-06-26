const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  farmName: { type: String, required: true },
  story: String,
  kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending', index: true },
  certifications: [String],
  farmImages: [String],
  location: {
    address: String,
    village: String,
    district: String,
    state: String,
    lat: Number,
    lng: Number
  },
  payout: {
    bankName: String,
    accountMasked: String,
    upiId: String
  },
  rating: { type: Number, default: 4.8 },
  totalRevenue: { type: Number, default: 0 },
  harvestPlan: [{
    crop: String,
    expectedHarvestDate: Date,
    expectedQuantityKg: Number
  }]
}, { timestamps: true });

const Farmer = mongoose.model('Farmer', farmerSchema);
module.exports = { Farmer };
