const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');

// Yangi buyurtma yaratish
router.post('/', async (req, res) => {
  try {
    const { customerId, items, paymentMethod } = req.body;
    
    // Mijozni tekshirish
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Mijoz topilmadi' });
    }
    
    // Qarz tekshiruvi
    if (customer.debt.blocked && paymentMethod === 'debt') {
      return res.status(400).json({ error: 'Qarz limiti oshgan. Avval qarzni to\'lang' });
    }
    
    // Umumiy summani hisoblash
    let totalAmount = 0;
    items.forEach(item => {
      item.total = item.price * item.quantity;
      totalAmount += item.total;
    });
    
    const order = new Order({
      customer: customerId,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'debt' ? 'debt' : 'pending',
      deliveryInfo: {
        address: customer.location.address,
        location: customer.location
      }
    });
    
    await order.save();
    
    // Agar qarzga bo'lsa, mijoz qarzini yangilash
    if (paymentMethod === 'debt') {
      customer.debt.amount += totalAmount;
      await customer.save();
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mijoz buyurtmalari
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const orders = await Order.find({ customer: customerId })
      .populate('items.product', 'nameUz')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments({ customer: customerId });
    
    // Oylik statistika
    const monthlyStats = await Order.aggregate([
      { 
        $match: { 
          customer: mongoose.Types.ObjectId(customerId),
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalDebt: { 
            $sum: { 
              $cond: [{ $eq: ['$paymentMethod', 'debt'] }, '$totalAmount', 0] 
            }
          }
        }
      }
    ]);
    
    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      monthlyStats: monthlyStats[0] || { totalOrders: 0, totalAmount: 0, totalDebt: 0 }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Haydovchi buyurtmalari
router.get('/driver/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    
    const orders = await Order.find({ 
      'deliveryInfo.driver': driverId,
      'deliveryInfo.status': { $in: ['assigned', 'delivering'] }
    })
    .populate('customer', 'name shopName phone location')
    .populate('items.product', 'nameUz')
    .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buyurtma holatini yangilash
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, deliveryStatus } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (deliveryStatus) updateData['deliveryInfo.status'] = deliveryStatus;
    
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }
    
    const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;