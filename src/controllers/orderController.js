const { Order } = require('../models/Order');
const { Product } = require('../models/Product');
const { DeliveryAssignment } = require('../models/DeliveryAssignment');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/apiError');
const { calculateCart, getOption } = require('../services/pricingService');
const { createPaymentIntent } = require('../services/paymentService');
const { notifyOwners, sendSms, sendEmail, sendPush } = require('../services/notificationService');
const { audit } = require('../services/auditService');
const { buildDirectionsUrl } = require('../services/mapsService');
const { getCartForUser } = require('./cartController');

const createOrder = asyncHandler(async (req, res) => {
  const cart = await getCartForUser(req.user._id);
  if (!cart.items.length) throw new ApiError(400, 'Cart is empty');
  const pricing = await calculateCart(cart.items, cart.couponCode);
  const items = cart.items.map((item) => {
    const option = getOption(item.product, item.weightOptionId);
    const price = option.discountPrice || option.price;
    return {
      product: item.product._id,
      name: item.product.name,
      image: item.product.images[0],
      farmer: item.product.farmer,
      weightLabel: option.label,
      price,
      quantity: item.quantity,
      total: price * item.quantity
    };
  });
  const order = await Order.create({
    customer: req.user._id,
    items,
    address: req.body.address,
    deliveryInstructions: req.body.deliveryInstructions,
    deliverySlot: req.body.deliverySlot,
    payment: { method: req.body.paymentMethod || 'cod' },
    pricing,
    couponCode: cart.couponCode,
    deliveryOtp: String(Math.floor(1000 + Math.random() * 9000)),
    eta: '35-55 minutes',
    trackingEvents: [{ status: 'pending', note: 'Order placed successfully' }]
  });
  const payment = await createPaymentIntent(order, order.payment.method);
  order.payment.status = payment.status;
  order.payment.transactionId = payment.transactionId;
  await order.save();
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    const option = getOption(product, item.weightOptionId);
    option.stock = Math.max(option.stock - item.quantity, 0);
    product.salesCount += item.quantity;
    product.isAvailable = product.weightOptions.some((entry) => entry.stock > 0);
    await product.save();
  }
  cart.items = [];
  cart.couponCode = undefined;
  await cart.save();
  await notifyOwners('New VEGI14 order', `${order.orderNumber} worth Rs ${pricing.total}`);
  await sendSms(req.user.phone, `VEGI14 order ${order.orderNumber} confirmed. Delivery OTP: ${order.deliveryOtp}`);
  if (req.user.email) await sendEmail(req.user.email, 'VEGI14 order confirmed', `Your order ${order.orderNumber} is confirmed.`);
  res.status(201).json({ success: true, order });
});

const listOrders = asyncHandler(async (req, res) => {
  const filter = ['admin', 'owner'].includes(req.user.role) ? {} : { customer: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(100).populate('customer', 'name phone');
  res.json({ success: true, orders });
});

const getOrder = asyncHandler(async (req, res) => {
  const filter = { orderNumber: req.params.orderNumber };
  if (!['admin', 'owner'].includes(req.user.role)) filter.customer = req.user._id;
  const order = await Order.findOne(filter).populate('customer', 'name phone');
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, order });
});

const publicTrackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber }).select('orderNumber status eta trackingEvents createdAt');
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, order });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  order.status = req.body.status;
  order.trackingEvents.push({ status: req.body.status, note: req.body.note || `Order marked ${req.body.status}` });
  await order.save();
  await audit(req, 'order.status_update', 'Order', order._id, { status: order.status });
  await sendPush(order.customer, 'Order update', `Your order is now ${order.status}`);
  res.json({ success: true, order });
});

const assignDelivery = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.body.orderId);
  if (!order) throw new ApiError(404, 'Order not found');
  const assignment = await DeliveryAssignment.create({
    order: req.body.orderId,
    partner: req.body.partnerId,
    routeUrl: req.body.routeUrl || buildDirectionsUrl('VEGI14 freshness hub', `${order.address?.line1 || ''} ${order.address?.city || ''}`),
    earnings: req.body.earnings || 45
  });
  await audit(req, 'delivery.assign', 'DeliveryAssignment', assignment._id);
  res.status(201).json({ success: true, assignment });
});

const completeDelivery = asyncHandler(async (req, res) => {
  const assignment = await DeliveryAssignment.findById(req.params.assignmentId).populate('order');
  if (!assignment) throw new ApiError(404, 'Assignment not found');
  if (assignment.partner.toString() !== req.user._id.toString() && !['admin', 'owner'].includes(req.user.role)) throw new ApiError(403, 'Not your assignment');
  if (assignment.order.deliveryOtp !== req.body.otp) throw new ApiError(400, 'Invalid delivery OTP');
  assignment.status = 'completed';
  assignment.completedAt = new Date();
  assignment.order.status = 'delivered';
  assignment.order.trackingEvents.push({ status: 'delivered', note: 'Delivered after customer OTP verification' });
  await assignment.order.save();
  await assignment.save();
  res.json({ success: true, assignment });
});

module.exports = { createOrder, listOrders, getOrder, publicTrackOrder, updateOrderStatus, assignDelivery, completeDelivery };
