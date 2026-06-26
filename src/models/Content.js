const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  type: { type: String, enum: ['blog', 'recipe', 'banner', 'page', 'faq'], required: true, index: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, index: true },
  excerpt: String,
  body: String,
  imageUrl: String,
  tags: [String],
  isPublished: { type: Boolean, default: true },
  metadata: Object
}, { timestamps: true });

contentSchema.index({ type: 1, slug: 1 }, { unique: true });

const Content = mongoose.model('Content', contentSchema);
module.exports = { Content };
