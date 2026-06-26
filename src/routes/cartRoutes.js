const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getCart, addToCart, updateCartItem, removeCartItem, applyCoupon } = require('../controllers/cartController');

router.use(authenticate);
router.get('/', getCart);
router.post('/items', addToCart);
router.patch('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeCartItem);
router.post('/coupon', applyCoupon);

module.exports = router;
