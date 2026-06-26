const { Order } = require('../models/Order');
const { Product } = require('../models/Product');
const { Farmer } = require('../models/Farmer');
const { User } = require('../models/User');
const { DeliveryAssignment } = require('../models/DeliveryAssignment');
const { asyncHandler } = require('../utils/asyncHandler');

const adminAnalytics = asyncHandler(async (req, res) => {
  const [orders, customers, products, farmers, lowStock] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).limit(200),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Farmer.countDocuments(),
    Product.find({ 'weightOptions.stock': { $lte: 10 } }).limit(10)
  ]);
  const revenue = orders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0);
  const delivered = orders.filter((order) => order.status === 'delivered').length;
  const topProducts = await Product.find().sort({ salesCount: -1 }).limit(8).populate('category');
  res.json({
    success: true,
    analytics: {
      revenue,
      profit: Math.round(revenue * 0.18),
      dailySales: orders.slice(0, 20).reduce((sum, order) => sum + (order.pricing?.total || 0), 0),
      weeklySales: revenue,
      monthlySales: revenue,
      customerGrowth: customers,
      conversionRate: orders.length ? Math.round((delivered / orders.length) * 100) : 0,
      orders: orders.length,
      customers,
      products,
      farmers,
      topProducts,
      lowStock
    }
  });
});

const farmerDashboard = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ user: req.user._id });
  const products = farmer ? await Product.find({ farmer: farmer._id }).sort({ createdAt: -1 }) : [];
  const orders = farmer ? await Order.find({ 'items.farmer': farmer._id }).sort({ createdAt: -1 }).limit(50) : [];
  res.json({ success: true, farmer, products, orders });
});

const deliveryDashboard = asyncHandler(async (req, res) => {
  const assignments = await DeliveryAssignment.find({ partner: req.user._id }).populate('order').sort({ createdAt: -1 }).limit(100);
  const earnings = assignments.filter((item) => item.status === 'completed').reduce((sum, item) => sum + item.earnings, 0);
  res.json({ success: true, assignments, earnings });
});

module.exports = { adminAnalytics, farmerDashboard, deliveryDashboard };
