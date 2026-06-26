const router = require('express').Router();
const { listProducts, getProduct, createProduct, updateProduct, bulkPriceUpdate, listCategories } = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/categories', listCategories);
router.get('/', listProducts);
router.get('/:slug', getProduct);
router.post('/', authenticate, authorize('admin', 'owner', 'farmer'), createProduct);
router.patch('/:id', authenticate, authorize('admin', 'owner', 'farmer'), updateProduct);
router.post('/admin/bulk-price-update', authenticate, authorize('admin', 'owner'), bulkPriceUpdate);

module.exports = router;
