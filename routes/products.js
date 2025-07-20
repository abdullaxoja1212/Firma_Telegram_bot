const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

// Barcha kategoriyalar
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kategoriya bo'yicha mahsulotlar
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ 
      category: categoryId, 
      isActive: true 
    }).populate('category');
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mahsulot qidirish
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { nameUz: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    }).populate('category');
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;