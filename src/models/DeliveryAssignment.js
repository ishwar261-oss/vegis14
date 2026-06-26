const mongoose = require('mongoose');

const deliveryAssignmentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['assigned', 'picked_up', 'completed', 'failed'], default: 'assigned' },
  routeUrl: String,
  earnings: { type: Number, default: 0 },
  completedAt: Date
}, { timestamps: true });

const DeliveryAssignment = mongoose.model('DeliveryAssignment', deliveryAssignmentSchema);
module.exports = { DeliveryAssignment };
