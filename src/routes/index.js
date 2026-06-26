const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/cart', require('./cartRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/account', require('./accountRoutes'));
router.use('/dashboards', require('./dashboardRoutes'));
router.use('/content', require('./contentRoutes'));

module.exports = router;
