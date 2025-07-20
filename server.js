const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Telegram Bot tokenini tekshirish
if (!process.env.BOT_TOKEN || process.env.BOT_TOKEN === 'YOUR_NEW_BOT_TOKEN_HERE') {
  console.error('❌ BOT_TOKEN .env faylida to\'g\'ri o\'rnatilmagan!');
  console.log('📝 BotFather dan yangi token oling va .env fayliga qo\'ying');
  process.exit(1);
}

const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB ulanish
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/savdo_bot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('✅ MongoDB ga ulandi'))
  .catch(err => console.error('❌ MongoDB xatosi:', err));

// Telegram Bot yaratish
let bot;
try {
  bot = new TelegramBot(process.env.BOT_TOKEN, { 
    polling: {
      interval: 1000,
      autoStart: true,
      params: {
        timeout: 20
      }
    }
  });
  
  bot.on('polling_error', (error) => {
    console.error('❌ Telegram polling xatosi:', error.message);
    if (error.message.includes('404')) {
      console.log('🔑 Bot token noto\'g\'ri yoki bekor qilingan');
      console.log('📝 BotFather dan yangi token oling');
    } else if (error.message.includes('409')) {
      console.log('⚠️  Boshqa bot instance ishlamoqda. Barcha node jarayonlarini to\'xtating.');
    }
  });
  
  bot.on('error', (error) => {
    console.error('❌ Bot xatosi:', error);
  });
  
  console.log('✅ Telegram bot ishga tushdi');
} catch (error) {
  console.error('❌ Bot yaratishda xatolik:', error.message);
  process.exit(1);
}

// Models
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Category = require('./models/Category');

// Bot handlers
require('./bot/handlers')(bot);

// API Routes
try {
  console.log('Admin route yuklanmoqda...');
  app.use('/api/admin', require('./routes/admin'));
  console.log('✅ Admin route yuklandi');
} catch (error) {
  console.error('❌ Admin route xatosi:', error.message);
}

try {
  console.log('Orders route yuklanmoqda...');
  app.use('/api/orders', require('./routes/orders'));
  console.log('✅ Orders route yuklandi');
} catch (error) {
  console.error('❌ Orders route xatosi:', error.message);
}

try {
  console.log('Products route yuklanmoqda...');
  app.use('/api/products', require('./routes/products'));
  console.log('✅ Products route yuklandi');
} catch (error) {
  console.error('❌ Products route xatosi:', error.message);
}

try {
  console.log('Users route yuklanmoqda...');
  app.use('/api/users', require('./routes/users'));
  console.log('✅ Users route yuklandi');
} catch (error) {
  console.error('❌ Users route xatosi:', error.message);
}

try {
  console.log('Support route yuklanmoqda...');
  app.use('/api/support', require('./routes/support'));
  console.log('✅ Support route yuklandi');
} catch (error) {
  console.error('❌ Support route xatosi:', error.message);
}

// Web interface routes
app.get('/', (req, res) => {
  res.redirect('/admin');
});

app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/public/admin.html');
});

app.get('/shop', (req, res) => {
  res.sendFile(__dirname + '/public/shop.html');
});

app.get('/delivery', (req, res) => {
  res.sendFile(__dirname + '/public/delivery.html');
});

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portda ishlamoqda`);
  console.log(`🌐 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`🏪 Do'kon panel: http://localhost:${PORT}/shop`);
  console.log(`🚚 Yetkazib berish: http://localhost:${PORT}/delivery`);
});

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});