require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4014),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vegi14',
  jwtSecret: process.env.JWT_SECRET || 'development-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  otpExpiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES || 10),
  baseUrl: process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 4014}`,
  corsOrigin: process.env.CORS_ORIGIN || true,
  ownerPhones: (process.env.OWNER_PHONES || '').split(',').map((v) => v.trim()).filter(Boolean),
  ownerEmails: (process.env.OWNER_EMAILS || '').split(',').map((v) => v.trim()).filter(Boolean),
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  },
  email: {
    host: process.env.EMAIL_HOST || '',
    port: Number(process.env.EMAIL_PORT || 587),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
};

module.exports = { env };
