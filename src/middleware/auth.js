const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { ApiError } = require('../utils/apiError');
const { env } = require('../config/env');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies.token;
    if (!token) throw new ApiError(401, 'Authentication required');
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).select('-otp.code');
    if (!user || !user.isActive) throw new ApiError(401, 'Invalid session');
    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new ApiError(401, 'Invalid or expired session'));
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'));
    if (!roles.includes(req.user.role)) return next(new ApiError(403, 'Insufficient permissions'));
    next();
  };
}

module.exports = { authenticate, authorize };
