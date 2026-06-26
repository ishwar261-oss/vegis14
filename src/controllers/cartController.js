const { Cart } = require('../models/Cart');
const { Product } = require('../models/Product');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/apiError');
const { calculateCart, getOption } = require('../services/pricingService');

async function getCartForUser(userId) {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart.populate('items.product');
}

const getCart = asyncHandler(async (req, res) => {
  const cart = await getCartForUser(req.user._id);
  const pricing = await calculateCart(cart.items, cart.couponCode);
  res.json({ success: true, cart, pricing });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, weightOptionId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');
  const option = getOption(product, weightOptionId);
  if (!option || option.stock < quantity) throw new ApiError(400, 'Selected quantity is not available');
  const cart = await getCartForUser(req.user._id);
  const existing = cart.items.find((item) => item.product._id.toString() === productId && item.weightOptionId.toString() === option._id.toString());
  if (existing) existing.quantity += Number(quantity);
  else cart.items.push({ product: productId, weightOptionId: option._id, quantity });
  await cart.save();
  await cart.populate('items.product');
  const pricing = await calculateCart(cart.items, cart.couponCode);
  res.json({ success: true, cart, pricing });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await getCartForUser(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw new ApiError(404, 'Cart item not found');
  item.quantity = Math.max(Number(req.body.quantity || 1), 1);
  await cart.save();
  await cart.populate('items.product');
  res.json({ success: true, cart, pricing: await calculateCart(cart.items, cart.couponCode) });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getCartForUser(req.user._id);
  cart.items.pull(req.params.itemId);
  await cart.save();
  await cart.populate('items.product');
  res.json({ success: true, cart, pricing: await calculateCart(cart.items, cart.couponCode) });
});

const applyCoupon = asyncHandler(async (req, res) => {
  const cart = await getCartForUser(req.user._id);
  cart.couponCode = req.body.code;
  await cart.save();
  res.json({ success: true, cart, pricing: await calculateCart(cart.items, cart.couponCode) });
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, applyCoupon, getCartForUser };
