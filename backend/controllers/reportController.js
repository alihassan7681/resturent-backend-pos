const Order = require('../models/Order');
const Expense = require('../models/Expense');
const MenuItem = require('../models/MenuItem');

// @desc GET /api/dashboard/summary
const getDashboardSummary = async (req, res) => {
  try {
    const now = new Date();
    
    // Today range
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // Yesterday range
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const endOfYesterday = new Date(startOfToday);
    endOfYesterday.setMilliseconds(-1);

    // Today's completed orders
    const todayOrders = await Order.find({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
      paymentStatus: 'completed',
    });

    const todaySales = todayOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const todayOrdersCount = todayOrders.length;
    const todayAvgOrderValue = todayOrdersCount > 0 ? (todaySales / todayOrdersCount).toFixed(2) : 0;

    // Today's expenses
    const todayExpensesData = await Expense.find({
      date: { $gte: startOfToday, $lte: endOfToday },
    });
    const todayExpenses = todayExpensesData.reduce((sum, e) => sum + (e.amount || 0), 0);
    const todayProfit = todaySales - todayExpenses;

    // Yesterday's completed orders
    const yesterdayOrders = await Order.find({
      createdAt: { $gte: startOfYesterday, $lte: endOfYesterday },
      paymentStatus: 'completed',
    });
    const yesterdaySales = yesterdayOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    // Comparison %
    let salesComparisonPct = 0;
    if (yesterdaySales > 0) {
      salesComparisonPct = (((todaySales - yesterdaySales) / yesterdaySales) * 100).toFixed(1);
    } else if (todaySales > 0) {
      salesComparisonPct = 100;
    }

    // Recent 10 orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(10);

    // Alerts: pending orders > 10 mins & unavailable menu items
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const delayedOrders = await Order.find({
      orderStatus: 'pending',
      createdAt: { $lt: tenMinsAgo },
    });

    const unavailableItems = await MenuItem.find({ isAvailable: false });

    res.json({
      todaySales,
      todayProfit,
      todayOrdersCount,
      todayAvgOrderValue,
      yesterdaySales,
      salesComparisonPct: Number(salesComparisonPct),
      recentOrders,
      alerts: {
        delayedOrdersCount: delayedOrders.length,
        delayedOrders,
        unavailableItemsCount: unavailableItems.length,
        unavailableItems,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc GET /api/dashboard/sales-chart?range=7d|30d
const getSalesChart = async (req, res) => {
  try {
    const range = req.query.range === '30d' ? 30 : 7;
    const chartData = [];

    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));

      const dayOrders = await Order.find({
        createdAt: { $gte: start, $lte: end },
        paymentStatus: 'completed',
      });

      const daySales = dayOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

      chartData.push({
        date: dateStr,
        day: d.toLocaleDateString('en-US', { weekday: range === 7 ? 'short' : undefined, month: 'short', day: 'numeric' }),
        sales: daySales,
        orders: dayOrders.length,
      });
    }

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc GET /api/reports?type=daily|weekly|monthly|custom&from&to
const getAggregatedReport = async (req, res) => {
  try {
    const { type, from, to } = req.query;
    let startDate = new Date();
    let endDate = new Date();

    if (type === 'daily') {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (type === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (type === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (type === 'custom' && from && to) {
      startDate = new Date(from);
      endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default: monthly
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const orderFilter = {
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: 'completed',
    };

    const completedOrders = await Order.find(orderFilter);

    const totalSales = completedOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const totalOrders = completedOrders.length;
    const totalDiscounts = completedOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);

    // Expenses in date range
    const expenses = await Expense.find({ date: { $gte: startDate, $lte: endDate } });
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = totalSales - totalExpenses;

    // Payment methods breakdown
    const paymentMethods = { cash: 0, card: 0, upi: 0 };
    completedOrders.forEach((o) => {
      if (paymentMethods[o.paymentMethod] !== undefined) {
        paymentMethods[o.paymentMethod] += o.grandTotal;
      }
    });

    // Top selling items (Top 10)
    const itemMap = {};
    completedOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        itemMap[item.name].quantity += item.quantity;
        itemMap[item.name].revenue += item.price * item.quantity;
      });
    });

    const topSellingItems = Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    res.json({
      startDate,
      endDate,
      totalSales,
      totalOrders,
      totalDiscounts,
      totalExpenses,
      netProfit,
      paymentMethods,
      topSellingItems,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardSummary,
  getSalesChart,
  getAggregatedReport,
};
