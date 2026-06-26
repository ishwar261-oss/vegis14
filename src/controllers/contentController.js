const { Content } = require('../models/Content');
const { Subscription } = require('../models/Subscription');
const { asyncHandler } = require('../utils/asyncHandler');

const listContent = asyncHandler(async (req, res) => {
  const filter = { isPublished: true };
  if (req.query.type) filter.type = req.query.type;
  const content = await Content.find(filter).sort({ createdAt: -1 }).limit(80);
  res.json({ success: true, content });
});

const upsertContent = asyncHandler(async (req, res) => {
  const content = await Content.findOneAndUpdate(
    { type: req.body.type, slug: req.body.slug },
    req.body,
    { upsert: true, new: true, runValidators: true }
  );
  res.json({ success: true, content });
});

const listPlans = asyncHandler(async (req, res) => {
  const plans = [
    { name: 'Weekly Fresh Box', cadence: 'weekly', price: 699, boxType: 'family', perks: ['18-22 seasonal items', 'Free delivery', 'Flexible pause'] },
    { name: 'Organic Essentials', cadence: 'weekly', price: 899, boxType: 'organic', perks: ['Certified farms', 'Nutrition picks', 'Priority slots'] },
    { name: 'Monthly Family Harvest', cadence: 'monthly', price: 2799, boxType: 'custom', perks: ['Four curated boxes', 'Recipe cards', 'Loyalty boost'] }
  ];
  res.json({ success: true, plans });
});

const createSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.create({ ...req.body, customer: req.user._id });
  res.status(201).json({ success: true, subscription });
});

module.exports = { listContent, upsertContent, listPlans, createSubscription };
