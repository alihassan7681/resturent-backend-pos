const express = require('express');
const router = express.Router();
const {
  getTables,
  createTable,
  updateTable,
  deleteTable,
} = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getTables);
router.post('/', protect, authorize('admin'), createTable);
router.put('/:id', protect, authorize('admin', 'cashier'), updateTable);
router.delete('/:id', protect, authorize('admin'), deleteTable);

module.exports = router;
