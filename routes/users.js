const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');

// Foydalanuvchi ma'lumotlari
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ telegramId: userId });
    
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Foydalanuvchi qarz ma'lumotlari
router.get('/:userId/debt', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ telegramId: userId });
    
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }
    
    res.json(user.debt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin qo'shish
router.post('/admin', async (req, res) => {
  try {
    const { telegramId, name, phone } = req.body;
    
    const admin = new User({
      telegramId,
      role: 'admin',
      name,
      phone,
      language: 'uz',
      isActive: true
    });
    
    await admin.save();
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Haydovchi qo'shish
router.post('/driver', async (req, res) => {
  try {
    const { telegramId, name, phone, vehicle, assignedRegion } = req.body;
    
    const driver = new User({
      telegramId,
      role: 'haydovchi',
      name,
      phone,
      language: 'uz',
      driverInfo: {
        name,
        phone,
        vehicle,
        assignedRegion
      },
      isActive: true
    });
    
    await driver.save();
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Barcha adminlar
router.get('/role/admin', async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin', isActive: true });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Barcha haydovchilar
router.get('/role/driver', async (req, res) => {
  try {
    const drivers = await User.find({ role: 'haydovchi', isActive: true });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Barcha mijozlar
router.get('/role/customer', async (req, res) => {
  try {
    const customers = await User.find({ role: 'sotuvchi', isActive: true });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mijoz buyurtmalari
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Bu endpoint hozircha oddiy javob qaytaradi
    res.json({ message: 'Customer orders endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;