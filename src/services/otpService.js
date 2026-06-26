const { env } = require('../config/env');

function generateOtp() {
  if (env.nodeEnv === 'development') return '141414';
  return String(Math.floor(100000 + Math.random() * 900000));
}

function expiryDate() {
  return new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);
}

module.exports = { generateOtp, expiryDate };
