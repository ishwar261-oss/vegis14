const slugify = require('slugify');
const { Product } = require('../models/Product');
const { Category } = require('../models/Category');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/apiError');
const { getPagination, paged } = require('../utils/pagination');
const { audit } = require('../services/auditService');

function buildProductQuery(query) {
  const filter = {};
  if (query.search) filter.$text = { $search: query.search };
  if (query.category) filter.category = query.category;
  if (query.organic === 'true') filter.organic = true;
  if (query.available === 'true') filter.isAvailable = true;
  if (query.trending === 'true') filter.isTrending = true;
  if (query.bestSeller === 'true') filter.isBestSeller = true;
  if (query.seasonal === 'true') filter.isSeasonal = true;
  if (query.tag) filter.tags = query.tag;
  return filter;
}

const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildProductQuery(req.query);
  const sortMap = {
    price_low: { 'weightOptions.0.discountPrice': 1, 'weightOptions.0.price': 1 },
    price_high: { 'weightOptions.0.discountPrice': -1, 'weightOptions.0.price': -1 },
    rating: { rating: -1 },
    newest: { createdAt: -1 },
    popular: { salesCount: -1 }
  };
  const sort = sortMap[req.query.sort] || { isBestSeller: -1, salesCount: -1, rating: -1 };
  const [products, total] = await Promise.all([
    Product.find(filter).populate('category farmer').sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter)
  ]);
  res.json({ success: true, ...paged(products, total, page, limit) });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate('category farmer');
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, slug: req.body.slug || slugify(req.body.name, { lower: true, strict: true }) });
  await audit(req, 'product.create', 'Product', product._id, { name: product.name });
  res.status(201).json({ success: true, product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) throw new ApiError(404, 'Product not found');
  await audit(req, 'product.update', 'Product', product._id, req.body);
  res.json({ success: true, product });
});

const bulkPriceUpdate = asyncHandler(async (req, res) => {
  const { updates } = req.body;
  if (!Array.isArray(updates)) throw new ApiError(400, 'updates must be an array');
  const results = [];
  for (const item of updates) {
    const product = await Product.findById(item.productId);
    if (!product) continue;
    const option = product.weightOptions.id(item.weightOptionId);
    if (!option) continue;
    option.price = item.price ?? option.price;
    option.discountPrice = item.discountPrice ?? option.discountPrice;
    option.stock = item.stock ?? option.stock;
    product.isAvailable = product.weightOptions.some((entry) => entry.stock > 0);
    product.priceHistory.push({ price: option.price, discountPrice: option.discountPrice, changedBy: req.user._id, reason: item.reason || 'Bulk price update' });
    await product.save();
    results.push(product._id);
  }
  await audit(req, 'product.bulk_price_update', 'Product', 'bulk', { count: results.length });
  res.json({ success: true, updated: results.length });
});

const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
  res.json({ success: true, categories });
});

module.exports = { listProducts, getProduct, createProduct, updateProduct, bulkPriceUpdate, listCategories };
