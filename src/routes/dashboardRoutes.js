const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { adminAnalytics, farmerDashboard, deliveryDashboard } = require('../controllers/dashboardController');

router.get('/admin', authenticate, authorize('admin', 'owner'), adminAnalytics);
router.get('/farmer', authenticate, authorize('farmer', 'admin', 'owner'), farmerDashboard);
router.get('/delivery', authenticate, authorize('delivery', 'admin', 'owner'), deliveryDashboard);

module.exports = router;
