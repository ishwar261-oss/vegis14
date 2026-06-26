const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  planName: { type: String, required: true },
  cadence: { type: String, enum: ['weekly', 'monthly'], default: 'weekly' },
  boxType: { type: String, enum: ['family', 'organic', 'fruit', 'custom'], default: 'organic' },
  price: Number,
  status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' },
  nextDeliveryAt: Date,
  preferences: [String]
}, { timestamps: true });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = { Subscription };
