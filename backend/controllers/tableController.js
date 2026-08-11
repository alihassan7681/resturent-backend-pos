const Table = require('../models/Table');

const getTables = async (req, res) => {
  try {
    const tables = await Table.find({}).populate('currentOrderId', 'orderNumber grandTotal orderStatus items createdAt').sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;
    const exists = await Table.findOne({ tableNumber });
    if (exists) {
      return res.status(400).json({ message: 'Table number already exists' });
    }
    const table = await Table.create({ tableNumber, capacity });
    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });

    table.tableNumber = req.body.tableNumber || table.tableNumber;
    table.capacity = req.body.capacity || table.capacity;
    table.status = req.body.status || table.status;
    if (req.body.currentOrderId !== undefined) table.currentOrderId = req.body.currentOrderId;

    const updated = await table.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTable = async (req, res) => {
  try {
    await Table.findByIdAndDelete(req.params.id);
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTables,
  createTable,
  updateTable,
  deleteTable,
};
