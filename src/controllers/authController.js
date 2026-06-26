const { User } = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/apiError');
const { generateOtp, expiryDate } = require('../services/otpService');
const { sendSms } = require('../services/notificationService');
const { signToken } = require('../services/tokenService');

const requestOtp = asyncHandler(async (req, res) => {
  const { phone, role = 'customer' } = req.body;
  if (!phone) throw new ApiError(400, 'Phone number is required');
  const allowedRole = ['customer', 'farmer', 'delivery'].includes(role) ? role : 'customer';
  const code = generateOtp();
  const user = await User.findOneAndUpdate(
    { phone },
    { $setOnInsert: { phone, role: allowedRole, referralCode: `V14${phone.slice(-4)}${Math.floor(Math.random() * 90 + 10)}` }, otp: { code, expiresAt: expiryDate(), attempts: 0 } },
    { upsert: true, new: true }
  );
  await sendSms(phone, `Your VEGI14 login OTP is ${code}.`);
  res.json({ success: true, message: 'OTP sent', developmentOtp: process.env.NODE_ENV === 'production' ? undefined : code, userId: user._id });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp, name, email } = req.body;
  const user = await User.findOne({ phone });
  if (!user || !user.otp?.code) throw new ApiError(400, 'Please request an OTP first');
  if (user.otp.expiresAt < new Date()) throw new ApiError(400, 'OTP expired');
  if (user.otp.code !== otp) {
    user.otp.attempts += 1;
    await user.save();
    throw new ApiError(400, 'Invalid OTP');
  }
  user.name = name || user.name || 'VEGI14 Customer';
  user.email = email || user.email;
  user.otp = undefined;
  user.lastLoginAt = new Date();
  await user.save();
  const token = signToken(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ success: true, token, user });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

module.exports = { requestOtp, verifyOtp, me, logout };
