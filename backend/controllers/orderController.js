const Order = require('../models/Order');
const Table = require('../models/Table');

// Helper to get socket io instance
const getIo = (req) => req.app.get('io');

// @desc Create new order
// @route POST /api/orders
// @access Private (Cashier, Admin)
const createOrder = async (req, res) => {
  try {
    const {
      orderType,
      tableNumber,
      customerName,
      customerPhone,
      items,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      taxRate,
      taxAmount,
      grandTotal,
      paymentMethod,
      paymentStatus,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Auto-generate Order Number
    const count = await Order.countDocuments();
    const orderNumber = `ORD-${1001 + count}`;

    const order = new Order({
      orderNumber,
      orderType: orderType || 'dine-in',
      tableNumber: tableNumber || '',
      customerName: customerName || 'Guest',
      customerPhone: customerPhone || '',
      items: items.map((item) => ({
        menuItem: item.menuItem || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes || '',
        itemStatus: 'pending',
      })),
      subtotal,
      discountType: discountType || 'flat',
      discountValue: discountValue || 0,
      discountAmount: discountAmount || 0,
      taxRate: taxRate || 5,
      taxAmount: taxAmount || 0,
      grandTotal,
      paymentMethod: paymentMethod || 'unpaid',
      paymentStatus: paymentStatus || 'pending',
      orderStatus: 'pending',
      cashier: req.user ? req.user._id : null,
    });

    const savedOrder = await order.save();

    // If Dine-in & Table assigned, update Table status to occupied
    if (orderType === 'dine-in' && tableNumber) {
      await Table.findOneAndUpdate(
        { tableNumber },
        { status: 'occupied', currentOrderId: savedOrder._id }
      );
    }

    // Real-time Socket.io Notification
    const io = getIo(req);
    if (io) {
      io.emit('order:created', savedOrder);
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get active orders (for POS & Kitchen Display)
// @route GET /api/orders/active
// @access Private
const getActiveOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: { $in: ['pending', 'preparing', 'ready'] },
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get order history with filters
// @route GET /api/orders
// @access Private
const getOrders = async (req, res) => {
  try {
    const { status, paymentStatus, type, startDate, endDate, search } = req.query;
    let filter = {};

    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (type) filter.orderType = type;

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { tableNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const orders = await Order.find(filter)
      .populate('cashier', 'name')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single order by ID
// @route GET /api/orders/:id
// @access Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('cashier', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update overall order status (Kitchen or Cashier)
// @route PUT /api/orders/:id/status
// @access Private
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.orderStatus = orderStatus;

    // If completed or cancelled, release associated table if occupied
    if (['completed', 'cancelled'].includes(orderStatus) && order.tableNumber) {
      await Table.findOneAndUpdate(
        { tableNumber: order.tableNumber },
        { status: 'available', currentOrderId: null }
      );
    }

    const updatedOrder = await order.save();

    // Socket.io Broadcast
    const io = getIo(req);
    if (io) {
      io.emit('order:updated', updatedOrder);
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update item status within an order (e.g. Kitchen marking dish as Preparing / Ready)
// @route PUT /api/orders/:id/item-status
// @access Private (Kitchen, Cashier)
const updateItemStatus = async (req, res) => {
  try {
    const { itemId, itemStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const item = order.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Order item not found' });

    item.itemStatus = itemStatus;

    // Auto update order status based on items
    const allReady = order.items.every((i) => i.itemStatus === 'ready');
    const anyPreparing = order.items.some((i) => ['preparing', 'ready'].includes(i.itemStatus));

    if (allReady) {
      order.orderStatus = 'ready';
    } else if (anyPreparing) {
      order.orderStatus = 'preparing';
    }

    const updatedOrder = await order.save();

    const io = getIo(req);
    if (io) {
      io.emit('order:updated', updatedOrder);
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Process order checkout & payment
// @route PUT /api/orders/:id/checkout
// @access Private (Cashier, Admin)
const checkoutOrder = async (req, res) => {
  try {
    const { paymentMethod, discountType, discountValue, discountAmount, taxRate, taxAmount, grandTotal } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (paymentMethod) order.paymentMethod = paymentMethod;
    order.paymentStatus = 'completed';
    // Keep orderStatus as 'pending' so it shows in Kitchen Display
    // Kitchen will move it to preparing -> ready -> completed

    if (discountType !== undefined) order.discountType = discountType;
    if (discountValue !== undefined) order.discountValue = discountValue;
    if (discountAmount !== undefined) order.discountAmount = discountAmount;
    if (taxRate !== undefined) order.taxRate = taxRate;
    if (taxAmount !== undefined) order.taxAmount = taxAmount;
    if (grandTotal !== undefined) order.grandTotal = grandTotal;

    const updatedOrder = await order.save();

    const io = getIo(req);
    if (io) {
      io.emit('order:updated', updatedOrder);
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getActiveOrders,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateItemStatus,
  checkoutOrder,
};
