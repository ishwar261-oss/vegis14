const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { listContent, upsertContent, listPlans, createSubscription } = require('../controllers/contentController');

router.get('/', listContent);
router.get('/plans', listPlans);
router.post('/', authenticate, authorize('admin', 'owner'), upsertContent);
router.post('/subscriptions', authenticate, createSubscription);

module.exports = router;
