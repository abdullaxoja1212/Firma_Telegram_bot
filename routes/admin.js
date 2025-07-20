const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Admin dashboard ma'lumotlari
router.get('/dashboard', async (req, res) => {
  try {
    const stats = {
      totalOrders: await Order.countDocuments(),
      todayOrders: await Order.countDocuments({
        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
      }),
      totalCustomers: await User.countDocuments({ role: 'sotuvchi' }),
      totalRevenue: await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      pendingOrders: await Order.countDocuments({ status: 'new' }),
      debtAmount: await User.aggregate([
        { $group: { _id: null, total: { $sum: '$debt.amount' } } }
      ])
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buyurtmalar ro'yxati
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, region } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    
    const orders = await Order.find(filter)
      .populate('customer', 'name shopName phone location')
      .populate('items.product', 'nameUz')
      .populate('deliveryInfo.driver', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments(filter);
    
    // Group orders by region for better assignment
    const ordersByRegion = {};
    orders.forEach(order => {
      const region = order.customer?.location?.region || 'Noma\'lum';
      if (!ordersByRegion[region]) {
        ordersByRegion[region] = [];
      }
      ordersByRegion[region].push(order);
    });
    
    res.json({
      orders,
      ordersByRegion,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Haydovchilarga buyurtma tayinlash
router.post('/assign-orders', async (req, res) => {
  try {
    const { driverId, orderIds } = req.body;
    
    await Order.updateMany(
      { _id: { $in: orderIds } },
      { 
        'deliveryInfo.driver': driverId,
        'deliveryInfo.status': 'assigned'
      }
    );
    
    res.json({ message: 'Buyurtmalar tayinlandi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mahsulot qo'shish
router.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mahsulot o'chirish
router.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Mahsulot o\'chirildi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mahsulot yangilash
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kategoriya qo'shish
router.post('/categories', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kategoriya o'chirish
router.delete('/categories/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Kategoriya o\'chirildi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kategoriya yangilash
router.put('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Haydovchi qo'shish
router.post('/drivers', async (req, res) => {
  try {
    const driver = new User({
      ...req.body,
      role: 'haydovchi'
    });
    await driver.save();
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Statistika
router.get('/statistics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const stats = {
      salesByRegion: await Order.aggregate([
        { $match: dateFilter },
        { $lookup: { from: 'users', localField: 'customer', foreignField: '_id', as: 'customer' } },
        { $unwind: '$customer' },
        { $group: { 
          _id: '$customer.location.address', 
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }}
      ]),
      topProducts: await Order.aggregate([
        { $match: dateFilter },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $group: {
          _id: '$product.nameUz',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.total' }
        }},
        { $sort: { totalSold: -1 } },
        { $limit: 10 }
      ])
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;