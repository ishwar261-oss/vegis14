const crypto = require('crypto');
const { ApiError } = require('../utils/apiError');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function csrfProtection(req, res, next) {
  let token = req.cookies.csrf_token;
  if (!token) {
    token = crypto.randomBytes(24).toString('hex');
    res.cookie('csrf_token', token, {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false
    });
  }
  res.setHeader('X-CSRF-Token', token);

  if (SAFE_METHODS.has(req.method)) return next();
  if (!req.cookies.token) return next();

  const submitted = req.headers['x-csrf-token'];
  if (submitted !== token) return next(new ApiError(403, 'Invalid CSRF token'));
  next();
}

module.exports = { csrfProtection };
