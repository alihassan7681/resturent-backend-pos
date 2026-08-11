const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/restropos';

const imageMap = {
  'Deals': 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
  'Special Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
  'Traditional Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
  'Burgers': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  'Shawarma': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
  'Pasta': 'https://images.unsplash.com/photo-1621996316585-883750f55338?auto=format&fit=crop&w=600&q=80',
  'Roll & Stick': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
  'Parathas': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80', // Indian flatbread/roll
  'Sandwich': 'https://images.unsplash.com/photo-1619860860505-642d55b00b52?auto=format&fit=crop&w=600&q=80',
  'Crispy & Fried Chicken': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
  'Fries': 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
  'Chai Shai & Coffee': 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
  'Cold Drinks': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80'
};

const updateImages = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for Image Update...');

    const categories = await Category.find();
    
    for (const cat of categories) {
      if (imageMap[cat.name]) {
        const result = await MenuItem.updateMany(
          { category: cat._id },
          { $set: { image: imageMap[cat.name] } }
        );
        console.log(`Updated ${result.modifiedCount} items in category: ${cat.name}`);
      }
    }

    console.log('--- Image Update Completed Successfully! ---');
    process.exit(0);
  } catch (error) {
    console.error('Image Update Error:', error);
    process.exit(1);
  }
};

updateImages();
