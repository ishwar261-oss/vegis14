const mongoose = require('mongoose');
const slugify = require('slugify');

const weightOptionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  grams: Number,
  price: { type: Number, required: true },
  discountPrice: Number,
  stock: { type: Number, default: 0 },
  sku: String
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: 'text' },
  slug: { type: String, unique: true, index: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', index: true },
  images: [String],
  description: String,
  nutrition: {
    calories: String,
    fiber: String,
    vitamins: [String],
    minerals: [String]
  },
  farmLocation: String,
  harvestDate: Date,
  deliveryEstimate: { type: String, default: 'Today or tomorrow' },
  organic: { type: Boolean, default: false, index: true },
  badges: [String],
  tags: [{ type: String, index: true }],
  weightOptions: [weightOptionSchema],
  rating: { type: Number, default: 4.7 },
  reviewCount: { type: Number, default: 0 },
  salesCount: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true, index: true },
  isTrending: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isSeasonal: { type: Boolean, default: false },
  priceHistory: [{
    price: Number,
    discountPrice: Number,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    reason: String
  }]
}, { timestamps: true });

productSchema.pre('validate', function setSlug(next) {
  if (!this.slug && this.name) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

productSchema.virtual('availableStock').get(function availableStock() {
  return this.weightOptions.reduce((sum, item) => sum + item.stock, 0);
});

const Product = mongoose.model('Product', productSchema);
module.exports = { Product };
