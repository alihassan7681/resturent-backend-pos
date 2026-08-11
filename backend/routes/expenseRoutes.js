const express = require('express');
const router = express.Router();
const {
  getExpenses,
  createExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getExpenses);
router.post('/', protect, authorize('admin'), createExpense);
router.delete('/:id', protect, authorize('admin'), deleteExpense);

module.exports = router;
