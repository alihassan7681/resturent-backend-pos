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
    console.log('Connected to MongoDB for Seeding Sangat Menu...');

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
      { name: 'Admin User', email: 'admin@restro.com', password: 'password123', role: 'admin', active: true },
      { name: 'Sangat Cashier', email: 'cashier@restro.com', password: 'password123', role: 'cashier', active: true },
      { name: 'Sangat Kitchen', email: 'kitchen@restro.com', password: 'password123', role: 'kitchen', active: true },
    ]);
    
    // 2. Create Categories
    const categoriesData = [
      { name: 'Deals', icon: 'Tag', color: '#f59e0b', order: 1 },
      { name: 'Special Pizza', icon: 'Pizza', color: '#ef4444', order: 2 },
      { name: 'Traditional Pizza', icon: 'Pizza', color: '#ef4444', order: 3 },
      { name: 'Burgers', icon: 'Sandwich', color: '#10b981', order: 4 },
      { name: 'Shawarma', icon: 'UtensilsCrossed', color: '#3b82f6', order: 5 },
      { name: 'Pasta', icon: 'UtensilsCrossed', color: '#ec4899', order: 6 },
      { name: 'Roll & Stick', icon: 'UtensilsCrossed', color: '#8b5cf6', order: 7 },
      { name: 'Parathas', icon: 'UtensilsCrossed', color: '#f97316', order: 8 },
      { name: 'Sandwich', icon: 'Sandwich', color: '#06b6d4', order: 9 },
      { name: 'Crispy & Fried Chicken', icon: 'Drumstick', color: '#eab308', order: 10 },
      { name: 'Fries', icon: 'UtensilsCrossed', color: '#fb923c', order: 11 },
      { name: 'Chai Shai & Coffee', icon: 'Coffee', color: '#6366f1', order: 12 },
      { name: 'Cold Drinks', icon: 'CupSoda', color: '#14b8a6', order: 13 },
    ];
    const categories = await Category.create(categoriesData);
    
    const catMap = {};
    categories.forEach(c => { catMap[c.name] = c._id; });

    // 3. Create Menu Items
    const menuItemsData = [
      // Deals
      { name: '1 Person Deal', category: catMap['Deals'], price: 700, description: '1 Zinger Burger, 5 Hot Wings, 1 Half Ltr Drink' },
      { name: '2 Person Deal', category: catMap['Deals'], price: 850, description: '2 Patty Burger, 5 Hot Wings, 1 Half Ltr Drink' },
      { name: 'Student Deal 1', category: catMap['Deals'], price: 1000, description: '3 Zinger Burger, 1 Ltr Drink' },
      { name: 'Student Deal 2', category: catMap['Deals'], price: 1000, description: '5 Chicken Shawarma, 1 Ltr Drink' },
      { name: 'Friends Deal 1', category: catMap['Deals'], price: 1000, description: '2 Small Pizza, 1 Ltr Drink' },
      { name: 'Brother\'s Deal', category: catMap['Deals'], price: 1500, description: '1 Med Pizza, 1 Flamming Pasta, 1 Patty Burger, 1.5 Ltr' },
      { name: 'Friends Deal 2', category: catMap['Deals'], price: 1700, description: '5 Zinger Burger, 1.5 Ltr Drink' },
      { name: 'Family Deal 1', category: catMap['Deals'], price: 2000, description: '1 Large Pizza, 10 Hot Wings, 1.5 Ltr Drink' },
      { name: 'Family Deal 2', category: catMap['Deals'], price: 2000, description: '1 Med Pizza, 2 Patty Burger, 2 Zinger Paratha Roll, 1.5 Ltr Drink' },
      { name: 'Party Deal 1', category: catMap['Deals'], price: 2500, description: '1 Med Pizza, 1 Large Pizza, 1 Half Fries, 1.5 Ltr Drink' },
      { name: 'Party Deal 2', category: catMap['Deals'], price: 3000, description: '2 Large Pizza, 1 Half Fries, 2 Ltr Drink' },
      { name: 'Birthday Deal', category: catMap['Deals'], price: 5000, description: '3 Large Pizza, 10 Hot Wings, 10 Nuggets, Two 1.5 Ltr Drinks' },

      // Special Pizza (Sangat Special, Malai Botti, Behari Kabab, Crown Crust, Cheez Stufer, Kabab Stufer - 1100, 1500, 1850)
      ...['Sangat Special Pizza', 'Malai Botti Pizza', 'Behari Kabab Pizza', 'Crown Crust Pizza', 'Cheez Stufer Pizza', 'Kabab Stufer Pizza'].flatMap(name => [
        { name: `${name} (M)`, category: catMap['Special Pizza'], price: 1100 },
        { name: `${name} (L)`, category: catMap['Special Pizza'], price: 1500 },
        { name: `${name} (XL)`, category: catMap['Special Pizza'], price: 1850 },
      ]),
      // Special Pizza Extra (Royal Crust, Extream, Lazania - 1200, 1600, 2000)
      ...['Royal Crust Pizza', 'Extream Pizza', 'Lazania Pizza'].flatMap(name => [
        { name: `${name} (M)`, category: catMap['Special Pizza'], price: 1200 },
        { name: `${name} (L)`, category: catMap['Special Pizza'], price: 1600 },
        { name: `${name} (XL)`, category: catMap['Special Pizza'], price: 2000 },
      ]),

      // Traditional Pizza (450, 950, 1350, 1750)
      ...['Chicken Tikka Pizza', 'Chicken Fajita Pizza', 'Chicken Superme Pizza', 'Peri Peri Pizza', 'Achari Pizza', 'Tandori Flavored Pizza', 'Sicilian Pizza', 'Cheese Lover Pizza', 'Veggie Lover Pizza'].flatMap(name => [
        { name: `${name} (S)`, category: catMap['Traditional Pizza'], price: 450 },
        { name: `${name} (M)`, category: catMap['Traditional Pizza'], price: 950 },
        { name: `${name} (L)`, category: catMap['Traditional Pizza'], price: 1350 },
        { name: `${name} (XL)`, category: catMap['Traditional Pizza'], price: 1750 },
      ]),

      // Burgers
      { name: 'Sangat Special Burger', category: catMap['Burgers'], price: 400 },
      { name: 'Zinger Burger', category: catMap['Burgers'], price: 350 },
      { name: 'Double Dacker Burger', category: catMap['Burgers'], price: 600 },
      { name: 'Tower Burger', category: catMap['Burgers'], price: 550 },
      { name: 'Chicken Patty Burger', category: catMap['Burgers'], price: 250 },
      { name: 'Chappli Patty Burger', category: catMap['Burgers'], price: 350 },
      { name: 'Grilled Burger', category: catMap['Burgers'], price: 400 },
      { name: 'Pizza Burger', category: catMap['Burgers'], price: 500 },

      // Shawarma
      { name: 'Arabic Shawarma', category: catMap['Shawarma'], price: 400 },
      { name: 'Chicken Shawarma', category: catMap['Shawarma'], price: 180 },
      { name: 'Chicken Cheese Shawarma', category: catMap['Shawarma'], price: 220 },
      { name: 'Malai Botti Shawarma', category: catMap['Shawarma'], price: 250 },
      { name: 'Zinger Shawarma', category: catMap['Shawarma'], price: 250 },
      { name: 'Kabab Shawarma', category: catMap['Shawarma'], price: 250 },
      { name: 'Platter Shawarma', category: catMap['Shawarma'], price: 400 },

      // Pasta
      ...['Al-Fredo Pasta', 'Malai Botti Pasta'].flatMap(name => [
        { name: `${name} (H)`, category: catMap['Pasta'], price: 400 },
        { name: `${name} (F)`, category: catMap['Pasta'], price: 750 },
      ]),
      ...['Crunchy Pasta'].flatMap(name => [
        { name: `${name} (H)`, category: catMap['Pasta'], price: 450 },
        { name: `${name} (F)`, category: catMap['Pasta'], price: 800 },
      ]),
      ...['Flamming Pasta'].flatMap(name => [
        { name: `${name} (H)`, category: catMap['Pasta'], price: 300 },
        { name: `${name} (F)`, category: catMap['Pasta'], price: 600 },
      ]),
      ...['Sicilian Pasta'].flatMap(name => [
        { name: `${name} (H)`, category: catMap['Pasta'], price: 350 },
        { name: `${name} (F)`, category: catMap['Pasta'], price: 650 },
      ]),

      // Roll & Stick
      { name: 'Spin Roll', category: catMap['Roll & Stick'], price: 400 },
      { name: 'Behari Roll', category: catMap['Roll & Stick'], price: 450 },
      { name: 'Arabic Roll', category: catMap['Roll & Stick'], price: 450 },
      { name: 'Cheese Stick', category: catMap['Roll & Stick'], price: 900 },

      // Parathas
      { name: 'Chicken Paratha Roll', category: catMap['Parathas'], price: 230 },
      { name: 'Chicken Cheese Paratha Roll', category: catMap['Parathas'], price: 280 },
      { name: 'Zinger Paratha Roll', category: catMap['Parathas'], price: 300 },
      { name: 'Pizza Paratha', category: catMap['Parathas'], price: 500 },
      { name: 'Malai Botti Chicken Paratha Roll', category: catMap['Parathas'], price: 300 },

      // Sandwich
      { name: 'Crunchy Sandwich', category: catMap['Sandwich'], price: 600 },
      { name: 'Grill Sandwich', category: catMap['Sandwich'], price: 450 },
      { name: 'Peri Peri Sandwich', category: catMap['Sandwich'], price: 500 },

      // Crispy & Fried Chicken
      { name: 'Crispy Candy (1 Pc)', category: catMap['Crispy & Fried Chicken'], price: 200 },
      { name: 'Crispy Candy (3 Pc)', category: catMap['Crispy & Fried Chicken'], price: 500 },
      { name: 'Hot Wings (5 Pc)', category: catMap['Crispy & Fried Chicken'], price: 300 },
      { name: 'Hot Wings (10 Pc)', category: catMap['Crispy & Fried Chicken'], price: 580 },
      { name: 'Hot Shot (5 Pc)', category: catMap['Crispy & Fried Chicken'], price: 300 },
      { name: 'Hot Shot (10 Pc)', category: catMap['Crispy & Fried Chicken'], price: 580 },
      { name: 'Peri Peri Wings (5 Pc)', category: catMap['Crispy & Fried Chicken'], price: 350 },
      { name: 'Peri Peri Wings (10 Pc)', category: catMap['Crispy & Fried Chicken'], price: 650 },
      { name: 'Oven Baked Wings (5 Pc)', category: catMap['Crispy & Fried Chicken'], price: 350 },
      { name: 'Oven Baked Wings (10 Pc)', category: catMap['Crispy & Fried Chicken'], price: 650 },
      { name: 'Nuggets (5 Pc)', category: catMap['Crispy & Fried Chicken'], price: 250 },
      { name: 'Nuggets (10 Pc)', category: catMap['Crispy & Fried Chicken'], price: 480 },

      // Fries
      { name: 'Loaded Fries (H)', category: catMap['Fries'], price: 350 },
      { name: 'Loaded Fries (F)', category: catMap['Fries'], price: 650 },
      { name: 'Maslala Fries (H)', category: catMap['Fries'], price: 250 },
      { name: 'Maslala Fries (F)', category: catMap['Fries'], price: 450 },
      { name: 'Plain Fries (H)', category: catMap['Fries'], price: 200 },
      { name: 'Plain Fries (F)', category: catMap['Fries'], price: 400 },

      // Chai Shai & Coffee
      { name: 'Karrak Chai', category: catMap['Chai Shai & Coffee'], price: 100 },
      { name: 'Gurh Wali Chai', category: catMap['Chai Shai & Coffee'], price: 100 },
      { name: 'Elaichi Wali Chai', category: catMap['Chai Shai & Coffee'], price: 150 },
      { name: 'Adrak Wali Chai', category: catMap['Chai Shai & Coffee'], price: 130 },
      { name: 'Chocolate Chai', category: catMap['Chai Shai & Coffee'], price: 180 },
      { name: 'Sabaz Chai', category: catMap['Chai Shai & Coffee'], price: 200 },
      { name: 'Cappuccino Coffee', category: catMap['Chai Shai & Coffee'], price: 480 },
      { name: 'Cardamom Coffee', category: catMap['Chai Shai & Coffee'], price: 300 },
      { name: 'Cream Coffee', category: catMap['Chai Shai & Coffee'], price: 350 },
      { name: 'Chocolate Coffee', category: catMap['Chai Shai & Coffee'], price: 380 },

      // Cold Drinks
      { name: 'Mint Margrita', category: catMap['Cold Drinks'], price: 200 },
      { name: 'Lemonade', category: catMap['Cold Drinks'], price: 200 },
      { name: 'Soft Drink', category: catMap['Cold Drinks'], price: 100 }, // No price provided, assumed 100
      { name: 'Mineral Water', category: catMap['Cold Drinks'], price: 80 }, // No price provided, assumed 80
    ];

    await MenuItem.create(menuItemsData.map(m => ({ ...m, isAvailable: true, isVeg: false })));
    console.log(`Created ${menuItemsData.length} menu items.`);

    // 4. Create Tables
    const tablesData = [];
    for(let i=1; i<=10; i++) tablesData.push({ tableNumber: `T-${i}`, capacity: 4, status: 'available' });
    await Table.create(tablesData);
    console.log(`Created tables.`);

    // 5. Create Settings
    await Setting.create({
      restaurantName: 'Sangat Café',
      tagline: 'A Taste You\'ll Remember',
      address: 'Fareed Town near, Ghareeb Nawaz Hotel, Mini Bypass Canal Road, Samundri',
      phone: '0307-9397232',
      email: 'contact@sangatcafe.com',
      taxRatePercent: 0,
      currencySymbol: 'Rs.',
      receiptFooter: 'Thank you for visiting Sangat Café!',
    });
    console.log('Created default restaurant settings.');

    console.log('\n--- Sangat Menu Seeding Completed Successfully! ---');
    process.exit(0);
  } catch (error) {
    console.error('Database Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
