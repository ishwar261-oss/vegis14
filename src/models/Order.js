const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
    weightLabel: String,
    price: Number,
    quantity: Number,
    total: Number
  }],
  address: Object,
  deliveryInstructions: String,
  deliverySlot: {
    date: String,
    window: String
  },
  payment: {
    method: { type: String, enum: ['upi', 'card', 'netbanking', 'cod', 'wallet'], default: 'cod' },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    transactionId: String
  },
  pricing: {
    subtotal: Number,
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    total: Number
  },
  couponCode: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded'],
    default: 'pending',
    index: true
  },
  deliveryOtp: String,
  eta: String,
  trackingEvents: [{
    status: String,
    note: String,
    at: { type: Date, default: Date.now }
  }],
  invoiceNumber: String
}, { timestamps: true });

orderSchema.pre('validate', function numberOrder(next) {
  if (!this.orderNumber) this.orderNumber = `V14-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
  if (!this.invoiceNumber) this.invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
  next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = { Order };
