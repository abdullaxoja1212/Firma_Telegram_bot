const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
require('dotenv').config();

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/savdo_bot');
    
    // Kategoriyalarni qo'shish
    const categories = [
      { name: 'Beverages', nameUz: 'Ichimliklar', icon: '🥤' },
      { name: 'Sweets', nameUz: 'Shirinliklar', icon: '🍬' },
      { name: 'Household', nameUz: 'Maishiy texnika', icon: '🏠' },
      { name: 'Food', nameUz: 'Oziq-ovqat', icon: '🍞' },
      { name: 'Personal Care', nameUz: 'Shaxsiy gigiyena', icon: '🧴' }
    ];

    await Category.deleteMany({});
    const savedCategories = await Category.insertMany(categories);
    console.log('Kategoriyalar qo\'shildi');

    // Mahsulotlarni qo'shish
    const products = [
      {
        nameUz: 'Koka Kola',
        category: savedCategories[0]._id,
        image: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=300',
        description: 'Gazlangan ichimlik',
        variants: [
          { size: '0.5L', price: 8000, unit: 'dona', inStock: true },
          { size: '1L', price: 12000, unit: 'dona', inStock: true },
          { size: '1.5L', price: 15000, unit: 'dona', inStock: true }
        ]
      },
      {
        name: 'Pepsi',
        nameUz: 'Pepsi',
        category: savedCategories[0]._id,
        description: 'Gazlangan ichimlik',
        variants: [
          { size: '0.5L', price: 7500, unit: 'dona', inStock: true },
          { size: '1L', price: 11000, unit: 'dona', inStock: true },
          { size: '1.5L', price: 14000, unit: 'dona', inStock: true }
        ]
      },
      {
        name: 'Snickers',
        nameUz: 'Snikers',
        category: savedCategories[1]._id,
        description: 'Shokolad',
        variants: [
          { size: '50g', price: 12000, unit: 'dona', inStock: true },
          { size: 'Blok (24 dona)', price: 250000, unit: 'blok', inStock: true }
        ]
      },
      {
        name: 'Twix',
        nameUz: 'Tviks',
        category: savedCategories[1]._id,
        description: 'Shokolad',
        variants: [
          { size: '50g', price: 11000, unit: 'dona', inStock: true },
          { size: 'Blok (24 dona)', price: 230000, unit: 'blok', inStock: true }
        ]
      },
      {
        name: 'Bread',
        nameUz: 'Non',
        category: savedCategories[3]._id,
        description: 'Yangi non',
        variants: [
          { size: '400g', price: 3000, unit: 'dona', inStock: true },
          { size: '800g', price: 5500, unit: 'dona', inStock: true }
        ]
      }
    ];

    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Mahsulotlar qo\'shildi');

    console.log('Ma\'lumotlar muvaffaqiyatli qo\'shildi!');
    process.exit(0);
  } catch (error) {
    console.error('Xatolik:', error);
    process.exit(1);
  }
}

seedData();