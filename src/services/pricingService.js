const { Coupon } = require('../models/Coupon');

function getOption(product, optionId) {
  return product.weightOptions.id(optionId) || product.weightOptions[0];
}

async function calculateCart(items, couponCode) {
  const subtotal = items.reduce((sum, item) => {
    const option = getOption(item.product, item.weightOptionId);
    const price = option.discountPrice || option.price;
    return sum + price * item.quantity;
  }, 0);
  const deliveryCharge = subtotal >= 499 ? 0 : 29;
  const tax = Math.round(subtotal * 0.05);
  let discount = 0;
  let coupon = null;

  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    const now = new Date();
    if (coupon && subtotal >= coupon.minOrderValue && (!coupon.startsAt || coupon.startsAt <= now) && (!coupon.endsAt || coupon.endsAt >= now)) {
      discount = coupon.type === 'percent' ? subtotal * (coupon.value / 100) : coupon.value;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      discount = Math.round(discount);
    }
  }

  return { subtotal, discount, tax, deliveryCharge, total: Math.max(subtotal + tax + deliveryCharge - discount, 0), coupon };
}

module.exports = { calculateCart, getOption };
