const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { createOrder, listOrders, getOrder, publicTrackOrder, updateOrderStatus, assignDelivery, completeDelivery } = require('../controllers/orderController');

router.get('/track/:orderNumber', publicTrackOrder);
router.use(authenticate);
router.post('/', createOrder);
router.get('/', listOrders);
router.get('/:orderNumber', getOrder);
router.patch('/:id/status', authorize('admin', 'owner'), updateOrderStatus);
router.post('/delivery/assign', authorize('admin', 'owner'), assignDelivery);
router.post('/delivery/:assignmentId/complete', authorize('delivery', 'admin', 'owner'), completeDelivery);

module.exports = router;
