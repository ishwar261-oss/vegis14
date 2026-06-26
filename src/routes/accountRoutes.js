const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { updateProfile, addAddress, deleteAddress, listUsers, updateUserRole } = require('../controllers/accountController');

router.use(authenticate);
router.patch('/profile', updateProfile);
router.post('/addresses', addAddress);
router.delete('/addresses/:id', deleteAddress);
router.get('/users', authorize('admin', 'owner'), listUsers);
router.patch('/users/:id', authorize('admin', 'owner'), updateUserRole);

module.exports = router;
