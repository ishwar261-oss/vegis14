async function getRecommendations(Product, user, limit = 8) {
  const query = user?.addresses?.length ? { isAvailable: true } : { isAvailable: true, isTrending: true };
  return Product.find(query).sort({ salesCount: -1, rating: -1 }).limit(limit).populate('category farmer');
}

module.exports = { getRecommendations };
