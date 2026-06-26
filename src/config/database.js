const mongoose = require('mongoose');
const { env } = require('./env');

async function connectDatabase() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.mongodbUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.warn(`MongoDB unavailable: ${error.message}`);
    console.warn('Frontend will run, but API persistence requires MongoDB.');
  }
}

module.exports = { connectDatabase };
