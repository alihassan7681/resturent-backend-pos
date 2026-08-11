const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Order = require('../models/Order');
const Expense = require('../models/Expense');
const Setting = require('../models/Setting');

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/restropos';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for Seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await MenuItem.deleteMany({});
    await Table.deleteMany({});
    await Order.deleteMany({});
    await Expense.deleteMany({});
    await Setting.deleteMany({});

    console.log('Cleared existing database records.');

    // 1. Create Users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@restro.com',
        password: 'password123',
        role: 'admin',
        active: true,
      },
      {
        name: 'Alex Cashier',
        email: 'cashier@restro.com',
        password: 'password123',
        role: 'cashier',
        active: true,
      },
      {
        name: 'Chef Mario (Kitchen)',
        email: 'kitchen@restro.com',
        password: 'password123',
        role: 'kitchen',
        active: true,
      },
    ]);
    console.log(`Created ${users.length} default users.`);

    // 2. Create Categories
    const categories = await Category.create([
      { name: 'Starters & Appetizers', icon: 'Soup', color: '#f59e0b', order: 1 },
      { name: 'Pizzas & Burgers', icon: 'Pizza', color: '#ef4444', order: 2 },
      { name: 'Main Course', icon: 'UtensilsCrossed', color: '#10b981', order: 3 },
      { name: 'Beverages & Drinks', icon: 'CupSoda', color: '#3b82f6', order: 4 },
      { name: 'Desserts & Sweets', icon: 'Cake', color: '#ec4899', order: 5 },
    ]);
    console.log(`Created ${categories.length} menu categories.`);

    const catMap = {};
    categories.forEach((c) => {
      catMap[c.name] = c._id;
    });

    // 3. Create Menu Items
    const menuItemsData = [
      // Starters
      {
        name: 'Paneer Tikka Grill',
        code: 'STR-01',
        category: catMap['Starters & Appetizers'],
        price: 840,
        description: 'Cottage cheese marinated in yogurt and Indian spices cooked in clay oven.',
        image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      {
        name: 'Crispy Chicken Wings (6pcs)',
        code: 'STR-02',
        category: catMap['Starters & Appetizers'],
        price: 960,
        description: 'Deep fried chicken wings tossed in spicy BBQ garlic glaze.',
        image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: false,
      },
      {
        name: 'Garlic Butter Mushrooms',
        code: 'STR-03',
        category: catMap['Starters & Appetizers'],
        price: 720,
        description: 'Button mushrooms sauteed in rich garlic herb butter.',
        image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      // Pizzas & Burgers
      {
        name: 'Margherita Basil Pizza',
        code: 'PZ-01',
        category: catMap['Pizzas & Burgers'],
        price: 1140,
        description: 'Fresh mozzarella cheese, San Marzano tomato sauce, and fresh basil leaves.',
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      {
        name: 'Loaded Pepperoni Feast Pizza',
        code: 'PZ-02',
        category: catMap['Pizzas & Burgers'],
        price: 1470,
        description: 'Double layer pepperoni slices with molten mozzarella and chili flakes.',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: false,
      },
      {
        name: 'Smokey Bacon Cheeseburger',
        code: 'BG-01',
        category: catMap['Pizzas & Burgers'],
        price: 1020,
        description: 'Juicy beef patty, crispy bacon, cheddar slice, lettuce, and secret mayo sauce.',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: false,
      },
      {
        name: 'Veggie Supreme Crunch Burger',
        code: 'BG-02',
        category: catMap['Pizzas & Burgers'],
        price: 660,
        description: 'Crispy potato-herb patty, spicy jalapeños, cheese, and tomato salsa.',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      // Main Course
      {
        name: 'Butter Chicken Masala',
        code: 'MC-01',
        category: catMap['Main Course'],
        price: 1260,
        description: 'Tandoori chicken simmered in rich creamy tomato butter gravy.',
        image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: false,
      },
      {
        name: 'Dal Makhani Royal',
        code: 'MC-02',
        category: catMap['Main Course'],
        price: 930,
        description: 'Slow-cooked black lentils finished with fresh cream and white butter.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      {
        name: 'Garlic Naan Bread',
        code: 'MC-03',
        category: catMap['Main Course'],
        price: 180,
        description: 'Traditional tandoori flatbread topped with minced garlic and coriander.',
        image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      {
        name: 'Chicken Dum Biryani',
        code: 'MC-04',
        category: catMap['Main Course'],
        price: 1170,
        description: 'Aromatic basmati rice layered with spiced chicken served with cucumber raita.',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: false,
      },
      // Beverages
      {
        name: 'Fresh Mango Lassi',
        code: 'BV-01',
        category: catMap['Beverages & Drinks'],
        price: 390,
        description: 'Chilled yogurt drink blended with Alphonso mango pulp.',
        image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      {
        name: 'Iced Lemon Mint Mojito',
        code: 'BV-02',
        category: catMap['Beverages & Drinks'],
        price: 450,
        description: 'Refreshing sparkling soda with fresh mint, lime juice, and crushed ice.',
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      {
        name: 'Cold Coffee with Ice Cream',
        code: 'BV-03',
        category: catMap['Beverages & Drinks'],
        price: 510,
        description: 'Rich espresso blended with milk and topped with vanilla ice cream scoop.',
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      // Desserts
      {
        name: 'Warm Chocolate Lava Cake',
        code: 'DS-01',
        category: catMap['Desserts & Sweets'],
        price: 630,
        description: 'Decadent chocolate cake with molten center served with vanilla gelato.',
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
      {
        name: 'Classic Gulab Jamun (2pcs)',
        code: 'DS-02',
        category: catMap['Desserts & Sweets'],
        price: 360,
        description: 'Soft milk dumplings soaked in cardamom scented rose syrup.',
        image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVeg: true,
      },
    ];

    const menuItems = await MenuItem.create(menuItemsData);
    console.log(`Created ${menuItems.length} menu items.`);

    // 4. Create Tables
    const tablesData = [
      { tableNumber: 'T-1', capacity: 2, status: 'available' },
      { tableNumber: 'T-2', capacity: 2, status: 'available' },
      { tableNumber: 'T-3', capacity: 4, status: 'available' },
      { tableNumber: 'T-4', capacity: 4, status: 'available' },
      { tableNumber: 'T-5', capacity: 6, status: 'available' },
      { tableNumber: 'T-6', capacity: 6, status: 'available' },
      { tableNumber: 'T-7', capacity: 8, status: 'available' },
      { tableNumber: 'T-8', capacity: 4, status: 'available' },
    ];
    const tables = await Table.create(tablesData);
    console.log(`Created ${tables.length} restaurant tables.`);

    // 5. Create Settings
    await Setting.create({
      restaurantName: 'RestroPOS Fine Dining',
      tagline: 'Authentic Flavor & Premium Service',
      address: 'Plot 45, Commercial Bay, Tech Quarter, Mumbai - 400051',
      phone: '+91 98200 12345',
      email: 'contact@restropos.com',
      gstNumber: '27AABCU9603R1ZM',
      taxRatePercent: 5,
      currencySymbol: 'Rs.',
      receiptFooter: 'Thank you for visiting RestroPOS! Have a wonderful day.',
    });
    console.log('Created default restaurant settings.');

    // 6. Create Demo Active Orders (for POS & Kitchen display)
    const cashierUser = users.find((u) => u.role === 'cashier');
    const order1 = await Order.create({
      orderNumber: 'ORD-1001',
      orderType: 'dine-in',
      tableNumber: 'T-3',
      customerName: 'Rahul Sharma',
      customerPhone: '9876543210',
      items: [
        {
          menuItem: menuItems[0]._id,
          name: menuItems[0].name,
          price: menuItems[0].price,
          quantity: 2,
          notes: 'Make it extra spicy',
          itemStatus: 'preparing',
        },
        {
          menuItem: menuItems[3]._id,
          name: menuItems[3].name,
          price: menuItems[3].price,
          quantity: 1,
          notes: 'Thin crust',
          itemStatus: 'pending',
        },
      ],
      subtotal: 2820,
      discountType: 'percent',
      discountValue: 10,
      discountAmount: 94,
      taxRate: 5,
      taxAmount: 126.89999999999999,
      grandTotal: 2664.8999999999996,
      paymentMethod: 'unpaid',
      paymentStatus: 'pending',
      orderStatus: 'preparing',
      cashier: cashierUser._id,
    });

    await Table.findOneAndUpdate({ tableNumber: 'T-3' }, { status: 'occupied', currentOrderId: order1._id });

    const order2 = await Order.create({
      orderNumber: 'ORD-1002',
      orderType: 'takeaway',
      tableNumber: '',
      customerName: 'Priya Verma',
      customerPhone: '9811223344',
      items: [
        {
          menuItem: menuItems[7]._id,
          name: menuItems[7].name,
          price: menuItems[7].price,
          quantity: 1,
          notes: 'Extra cream',
          itemStatus: 'ready',
        },
        {
          menuItem: menuItems[9]._id,
          name: menuItems[9].name,
          price: menuItems[9].price,
          quantity: 3,
          notes: '',
          itemStatus: 'ready',
        },
      ],
      subtotal: 1800,
      discountType: 'flat',
      discountValue: 50,
      discountAmount: 50,
      taxRate: 5,
      taxAmount: 82.5,
      grandTotal: 1732.5,
      paymentMethod: 'upi',
      paymentStatus: 'completed',
      orderStatus: 'ready',
      cashier: cashierUser._id,
    });

    // Seed Completed Historical Orders (for analytics)
    const pastOrders = [];
    for (let i = 1; i <= 15; i++) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - (i % 7));

      pastOrders.push({
        orderNumber: `ORD-90${i}`,
        orderType: i % 2 === 0 ? 'dine-in' : 'takeaway',
        tableNumber: i % 2 === 0 ? `T-${(i % 6) + 1}` : '',
        customerName: `Customer ${i}`,
        items: [
          {
            menuItem: menuItems[i % menuItems.length]._id,
            name: menuItems[i % menuItems.length].name,
            price: menuItems[i % menuItems.length].price,
            quantity: (i % 3) + 1,
            itemStatus: 'ready',
          },
        ],
        subtotal: menuItems[i % menuItems.length].price * ((i % 3) + 1),
        discountAmount: 0,
        taxRate: 5,
        taxAmount: (menuItems[i % menuItems.length].price * ((i % 3) + 1) * 5) / 100,
        grandTotal: menuItems[i % menuItems.length].price * ((i % 3) + 1) * 1.05,
        paymentMethod: i % 3 === 0 ? 'cash' : i % 3 === 1 ? 'card' : 'upi',
        paymentStatus: 'completed',
        orderStatus: 'completed',
        cashier: cashierUser._id,
        createdAt: pastDate,
      });
    }

    await Order.insertMany(pastOrders);
    console.log('Created sample active & past orders.');

    // 7. Seed Sample Expenses
    await Expense.create([
      {
        title: 'Fresh Vegetable Supply (Daily)',
        amount: 10500,
        category: 'Inventory',
        notes: 'Purchased from Mandi Market',
        recordedBy: users[0]._id,
      },
      {
        title: 'Electricity & Gas Bill',
        amount: 24600,
        category: 'Utilities',
        notes: 'Monthly power consumption',
        recordedBy: users[0]._id,
      },
      {
        title: 'Kitchen Cookware Maintenance',
        amount: 4200,
        category: 'Maintenance',
        notes: 'Oven serviced',
        recordedBy: users[0]._id,
      },
    ]);
    console.log('Created sample expense entries.');

    console.log('\n--- RestroPOS Database Seeding Completed Successfully! ---');
    console.log('Default Credentials:');
    console.log('Admin: admin@restro.com / password123');
    console.log('Cashier: cashier@restro.com / password123');
    console.log('Kitchen Staff: kitchen@restro.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Database Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
