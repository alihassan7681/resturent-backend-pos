const Expense = require('../models/Expense');

const getExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    let filter = {};

    if (category) filter.category = category;

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const expenses = await Expense.find(filter)
      .populate('recordedBy', 'name')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createExpense = async (req, res) => {
  try {
    const { title, amount, category, notes, date } = req.body;
    const expense = await Expense.create({
      title,
      amount,
      category,
      notes,
      date: date || Date.now(),
      recordedBy: req.user ? req.user._id : null,
    });
    const populated = await Expense.findById(expense._id).populate('recordedBy', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  deleteExpense,
};
