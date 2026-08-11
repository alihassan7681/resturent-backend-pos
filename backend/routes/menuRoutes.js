const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  toggleMenuItemAvailability,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Categories
router.get('/categories', protect, getCategories);
router.post('/categories', protect, authorize('admin'), createCategory);
router.put('/categories/:id', protect, authorize('admin'), updateCategory);
router.delete('/categories/:id', protect, authorize('admin'), deleteCategory);

// Menu Items
router.get('/items', protect, getMenuItems);
router.post('/items', protect, authorize('admin'), createMenuItem);
router.put('/items/:id', protect, authorize('admin'), updateMenuItem);
router.patch('/items/:id/availability', protect, authorize('admin', 'cashier'), toggleMenuItemAvailability);
router.delete('/items/:id', protect, authorize('admin'), deleteMenuItem);

module.exports = router;
