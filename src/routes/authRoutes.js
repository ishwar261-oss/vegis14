const router = require('express').Router();
const { requestOtp, verifyOtp, me, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', authenticate, me);
router.post('/logout', logout);

module.exports = router;
