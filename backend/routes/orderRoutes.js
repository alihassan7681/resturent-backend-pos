const express = require('express');
const router = express.Router();
const {
  createOrder,
  getActiveOrders,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateItemStatus,
  checkoutOrder,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin', 'cashier'), createOrder);
router.get('/active', protect, getActiveOrders);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);

// Support both PUT and PATCH for status updates
router.put('/:id/status', protect, updateOrderStatus);
router.patch('/:id/status', protect, updateOrderStatus);

router.put('/:id/item-status', protect, updateItemStatus);
router.patch('/:id/item-status', protect, updateItemStatus);

router.put('/:id/checkout', protect, authorize('admin', 'cashier'), checkoutOrder);

module.exports = router;
