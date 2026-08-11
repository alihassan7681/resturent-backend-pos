const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getSalesChart,
  getAggregatedReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard/summary', protect, authorize('admin'), getDashboardSummary);
router.get('/dashboard/sales-chart', protect, authorize('admin'), getSalesChart);
router.get('/reports', protect, authorize('admin'), getAggregatedReport);

module.exports = router;
