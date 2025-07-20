const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Support message yuborish
router.post('/message', async (req, res) => {
  try {
    const { userId, type, message } = req.body;
    
    const user = await User.findOne({ telegramId: userId });
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }
    
    // Bu yerda support message ni saqlash yoki email yuborish mumkin
    console.log(`Support message from ${user.name} (${user.shopName}):`);
    console.log(`Type: ${type}`);
    console.log(`Message: ${message}`);
    
    // Telegram bot orqali admin ga xabar yuborish
    // bot.sendMessage(ADMIN_CHAT_ID, `Support message from ${user.name}:\n${message}`);
    
    res.json({ message: 'Xabar yuborildi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;