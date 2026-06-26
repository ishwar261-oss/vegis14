const { User } = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/apiError');

const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'email', 'avatarUrl', 'language', 'darkMode', 'notificationPrefs'];
  for (const key of allowed) if (req.body[key] !== undefined) req.user[key] = req.body[key];
  await req.user.save();
  res.json({ success: true, user: req.user });
});

const addAddress = asyncHandler(async (req, res) => {
  if (req.body.isDefault) req.user.addresses.forEach((address) => { address.isDefault = false; });
  req.user.addresses.push(req.body);
  await req.user.save();
  res.status(201).json({ success: true, addresses: req.user.addresses });
});

const deleteAddress = asyncHandler(async (req, res) => {
  req.user.addresses.pull(req.params.id);
  await req.user.save();
  res.json({ success: true, addresses: req.user.addresses });
});

const listUsers = asyncHandler(async (req, res) => {
  const filter = req.query.role ? { role: req.query.role } : {};
  const users = await User.find(filter).sort({ createdAt: -1 }).limit(200).select('-otp.code');
  res.json({ success: true, users });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.role = req.body.role || user.role;
  user.isActive = req.body.isActive ?? user.isActive;
  await user.save();
  res.json({ success: true, user });
});

module.exports = { updateProfile, addAddress, deleteAddress, listUsers, updateUserRole };
