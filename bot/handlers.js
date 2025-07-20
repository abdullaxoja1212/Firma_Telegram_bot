const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const languages = require('./languages');

// Foydalanuvchi holatini saqlash
const userStates = new Map();
const userData = new Map();

module.exports = (bot) => {
  // Start komandasi
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    
    try {
      let user = await User.findOne({ telegramId });
      
      if (!user) {
        // Til tanlash
        const keyboard = {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🇺🇿 O'zbekcha", callback_data: 'lang_uz' }],
              [{ text: "🇺🇿 Ўзбекча", callback_data: 'lang_uzc' }],
              [{ text: "🇷🇺 Русский", callback_data: 'lang_ru' }]
            ]
          }
        };
        
        bot.sendMessage(chatId, 
          `🎉 Xush kelibsiz! | Хуш келибсиз! | Добро пожаловать!\n\n` +
          `SlotkayaSloboda botiga xush kelibsiz!\n` +
          `Tilni tanlang:`, 
          keyboard
        );
      } else {
        // Mavjud foydalanuvchi
        showMainMenu(bot, chatId, user);
      }
    } catch (error) {
      console.error('Start xatosi:', error);
      bot.sendMessage(chatId, '❌ Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
  });

  // Telegram ID ni topish uchun
  bot.onText(/\/myid/, (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    bot.sendMessage(chatId, `Sizning Telegram ID: ${telegramId}`);
  });

  // Super admin ID
  const SUPER_ADMIN_ID = "7911256909";

  // Admin qilish komandasi
  bot.onText(/\/makeadmin/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    
    if (telegramId !== SUPER_ADMIN_ID) {
      bot.sendMessage(chatId, '❌ Sizda bu komandani ishlatish huquqi yo\'q');
      return;
    }
    
    try {
      let user = await User.findOne({ telegramId });
      
      if (!user) {
        user = new User({
          telegramId,
          role: 'admin',
          name: msg.from.first_name || 'Admin',
          language: 'uz',
          isActive: true
        });
        await user.save();
        bot.sendMessage(chatId, '✅ Siz admin sifatida ro\'yhatdan o\'tdingiz!');
      } else {
        user.role = 'admin';
        await user.save();
        bot.sendMessage(chatId, '✅ Siz admin huquqlarini oldingiz!');
      }
      
      showMainMenu(bot, chatId, user);
    } catch (error) {
      console.error('Admin yaratish xatosi:', error);
      bot.sendMessage(chatId, '❌ Xatolik yuz berdi');
    }
  });

  // Callback query handler
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    const telegramId = query.from.id.toString();
    
    try {
      // Til tanlash
      if (data.startsWith('lang_')) {
        const selectedLang = data.replace('lang_', '');
        await saveUserData(telegramId, 'language', selectedLang);
        
        const lang = languages[selectedLang];
        
        const keyboard = {
          reply_markup: {
            keyboard: [
              [{ text: lang.register }],
              [{ text: lang.help }]
            ],
            resize_keyboard: true
          }
        };
        
        bot.sendMessage(chatId, 
          `${lang.language_selected}\n\n${lang.welcome}`, 
          keyboard
        );
      }
      // Web app tugmalari
      else if (data === 'open_company_management') {
        const webAppUrl = `${process.env.WEB_URL || 'http://localhost:4000'}/admin?userId=${telegramId}`;
        bot.sendMessage(chatId, '🏢 Firma boshqaruvi paneli ochilmoqda...', {
          reply_markup: {
            inline_keyboard: [[
              { text: '🌐 Firma boshqaruvi', web_app: { url: webAppUrl } }
            ]]
          }
        });
      }
      else if (data === 'open_shop_management') {
        const webAppUrl = `${process.env.WEB_URL || 'http://localhost:4000'}/shop?userId=${telegramId}`;
        bot.sendMessage(chatId, '🏪 Do\'kon boshqaruvi paneli ochilmoqda...', {
          reply_markup: {
            inline_keyboard: [[
              { text: '🌐 Mening do\'konim', web_app: { url: webAppUrl } }
            ]]
          }
        });
      }
      else if (data === 'open_delivery_panel') {
        const webAppUrl = `${process.env.WEB_URL || 'http://localhost:4000'}/delivery?userId=${telegramId}`;
        bot.sendMessage(chatId, '🚚 Yetkazib berish paneli ochilmoqda...', {
          reply_markup: {
            inline_keyboard: [[
              { text: '🌐 Yetkazib berish', web_app: { url: webAppUrl } }
            ]]
          }
        });
      }
      
      bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error('Callback query xatosi:', error);
      bot.answerCallbackQuery(query.id, { text: 'Xatolik yuz berdi' });
    }
  });

  // Message handler
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const telegramId = msg.from.id.toString();

    if (!text || text.startsWith('/')) return;

    try {
      const user = await User.findOne({ telegramId });
      const userLang = user?.language || 'uz';
      const lang = languages[userLang];
      const userState = getUserState(telegramId);

      // Ro'yhatdan o'tish jarayoni
      if (text === lang?.register || text === '📝 Ro\'yhatdan o\'tish' || text === '📝 Рўйхатдан ўтиш' || text === '📝 Регистрация') {
        const userData = await getUserData(telegramId);
        const selectedLang = userData.language || 'uz';
        const lang = languages[selectedLang];
        
        bot.sendMessage(chatId, lang.enter_name, { reply_markup: { remove_keyboard: true } });
        saveUserState(telegramId, 'waiting_name');
        return;
      }

      // Web app tugmalari
      if (text === '🏢 Firma boshqaruvi' && user?.role === 'admin') {
        bot.sendMessage(chatId, 
          `🏢 Firma boshqaruvi paneli\n\n` +
          `Admin panel: http://localhost:4000/admin?userId=${telegramId}\n\n` +
          `Bu linkni brauzerda oching va admin panelini boshqaring.`
        );
        return;
      }

      if (text === '🏪 Mening do\'konim boshqaruvi' && user?.role === 'sotuvchi') {
        bot.sendMessage(chatId, 
          `🏪 Do'kon boshqaruvi paneli\n\n` +
          `Do'kon panel: http://localhost:4000/shop?userId=${telegramId}\n\n` +
          `Bu linkni brauzerda oching va do'koningizni boshqaring.`
        );
        return;
      }

      if (text === '🚚 Yetkazib berish' && user?.role === 'haydovchi') {
        bot.sendMessage(chatId, 
          `🚚 Yetkazib berish paneli\n\n` +
          `Haydovchi panel: http://localhost:4000/delivery?userId=${telegramId}\n\n` +
          `Bu linkni brauzerda oching va buyurtmalarni ko'ring.`
        );
        return;
      }

      // Ro'yhatdan o'tish holatlari
      switch (userState) {
        case 'waiting_name':
          await saveUserData(telegramId, 'name', text);
          await saveUserState(telegramId, 'waiting_shop_name');
          const userData1 = await getUserData(telegramId);
          const lang1 = languages[userData1.language];
          bot.sendMessage(chatId, lang1.enter_shop);
          break;
          
        case 'waiting_shop_name':
          await saveUserData(telegramId, 'shopName', text);
          await saveUserState(telegramId, 'waiting_phone');
          const userData2 = await getUserData(telegramId);
          const lang2 = languages[userData2.language];
          bot.sendMessage(chatId, lang2.enter_phone);
          break;
          
        case 'waiting_phone':
          await saveUserData(telegramId, 'phone', text);
          await saveUserState(telegramId, 'waiting_region');
          const userData3 = await getUserData(telegramId);
          const lang3 = languages[userData3.language];
          bot.sendMessage(chatId, lang3.enter_region);
          break;
          
        case 'waiting_region':
          await saveUserData(telegramId, 'region', text);
          await saveUserState(telegramId, 'waiting_district');
          const userData4 = await getUserData(telegramId);
          const lang4 = languages[userData4.language];
          bot.sendMessage(chatId, lang4.enter_district);
          break;
          
        case 'waiting_district':
          await saveUserData(telegramId, 'district', text);
          await saveUserState(telegramId, 'waiting_location');
          const userData5 = await getUserData(telegramId);
          const lang5 = languages[userData5.language];
          bot.sendMessage(chatId, lang5.enter_location, {
            reply_markup: {
              keyboard: [[{ text: lang5.location_button, request_location: true }]],
              resize_keyboard: true,
              one_time_keyboard: true
            }
          });
          break;
      }
    } catch (error) {
      console.error('Message handler xatosi:', error);
    }
  });

  // Location handler
  bot.on('location', async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    const location = msg.location;
    
    try {
      const userData = await getUserData(telegramId);
      const lang = languages[userData.language];
      
      const newUser = new User({
        telegramId,
        role: 'sotuvchi',
        language: userData.language,
        name: userData.name,
        shopName: userData.shopName,
        phone: userData.phone,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: `${location.latitude}, ${location.longitude}`,
          region: userData.region,
          district: userData.district
        }
      });
      
      await newUser.save();
      await clearUserState(telegramId);
      
      bot.sendMessage(chatId, 
        `${lang.registration_success}\n\n` +
        `👤 ${userData.name}\n` +
        `🏪 ${userData.shopName}\n` +
        `📱 ${userData.phone}\n` +
        `📍 Joylashuv saqlandi`
      );
      
      showMainMenu(bot, chatId, newUser);
    } catch (error) {
      console.error('Location handler xatosi:', error);
      bot.sendMessage(chatId, '❌ Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
  });
};

// Yordamchi funksiyalar
async function showMainMenu(bot, chatId, user) {
  const lang = languages[user.language || 'uz'];
  
  let keyboard;
  
  if (user.role === 'admin') {
    keyboard = {
      reply_markup: {
        keyboard: [
          [{ text: '🏢 Firma boshqaruvi' }],
          [{ text: lang.help }]
        ],
        resize_keyboard: true
      }
    };
    
    bot.sendMessage(chatId, 
      `${lang.admin_panel}\n\n` +
      `Salom ${user.name}!\n` +
      `Admin panel: http://localhost:4000/admin?userId=${user.telegramId}`, 
      { reply_markup: { remove_keyboard: true } }
    );
  } else if (user.role === 'haydovchi') {
    bot.sendMessage(chatId, 
      `${lang.driver_panel}\n\n` +
      `Salom ${user.name}!\n` +
      `Yetkazib berish panel: http://localhost:4000/delivery?userId=${user.telegramId}`, 
      { reply_markup: { remove_keyboard: true } }
    );
  } else {
    bot.sendMessage(chatId, 
      `${lang.shop_panel}\n\n` +
      `Salom ${user.name}!\n` +
      `Do'kon: ${user.shopName}\n\n` +
      `Do'kon panel: http://localhost:4000/shop?userId=${user.telegramId}`, 
      { reply_markup: { remove_keyboard: true } }
    );
  }
}

// State management functions
function saveUserState(telegramId, state) {
  userStates.set(telegramId, state);
}

function getUserState(telegramId) {
  return userStates.get(telegramId);
}

async function saveUserData(telegramId, key, value) {
  if (!userData.has(telegramId)) {
    userData.set(telegramId, {});
  }
  userData.get(telegramId)[key] = value;
}

async function getUserData(telegramId) {
  return userData.get(telegramId) || {};
}

async function clearUserState(telegramId) {
  userStates.delete(telegramId);
  userData.delete(telegramId);
}