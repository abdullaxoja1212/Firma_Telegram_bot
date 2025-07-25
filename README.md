# SlotkayaSloboda Telegram Bot - Savdo Tizimi

Bu loyiha O'zbekiston sharoitida savdo agentlari uchun mo'ljallangan Telegram bot va admin panel tizimi.

## Xususiyatlar

### 🤖 Telegram Bot
- **3 ta rol:** Sotuvchi, Admin, Haydovchi
- **Ro'yhatdan o'tish:** Ism, do'kon nomi, telefon, joylashuv
- **Mahsulot katalogi:** Kategoriyalar va mahsulotlar
- **Buyurtma berish:** Miqdor tanlash va buyurtma berish
- **To'lov tizimi:** Naqd, karta, qarz
- **Qarz nazorati:** 10 kunlik muddat, avtomatik blokировка
- **Statistika:** Oylik hisobotlar

### 💻 Admin Panel
- **Dashboard:** Umumiy statistika va ko'rsatkichlar
- **Buyurtmalar:** Barcha buyurtmalarni boshqarish
- **Mahsulotlar:** Katalog boshqaruvi
- **Haydovchilar:** Yetkazib beruvchilar boshqaruvi
- **Statistika:** Grafik va hisobotlar

## Texnologiyalar

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Bot:** node-telegram-bot-api
- **Frontend:** HTML, CSS, JavaScript, Chart.js
- **Styling:** Tailwind CSS

## O'rnatish

1. **Loyihani klonlash:**
```bash
git clone <repository-url>
cd telegram-bot-system
```

2. **Dependencies o'rnatish:**
```bash
npm install
```

3. **Serverni ishga tushirish:**
```bash
npm start
```


## Foydalanish

### Sotuvchi uchun:
1. Botga `/start` yozing
2. "Ro'yhatdan o'tish" tugmasini bosing
3. Ma'lumotlaringizni kiriting
4. Joylashuvingizni yuboring
5. Mahsulotlar bo'limidan buyurtma bering

### Admin uchun:
1. `http://localhost:3000` ga kiring
2. Dashboard'da umumiy ma'lumotlarni ko'ring
3. Buyurtmalarni boshqaring
4. Haydovchilarga buyurtmalarni tayinlang

## API Endpoints

### Admin API
- `GET /api/admin/dashboard` - Dashboard ma'lumotlari
- `GET /api/admin/orders` - Buyurtmalar ro'yxati
- `POST /api/admin/assign-orders` - Buyurtmalarni tayinlash
- `GET /api/admin/statistics` - Statistika

### Orders API
- `POST /api/orders` - Yangi buyurtma yaratish
- `GET /api/orders/customer/:id` - Mijoz buyurtmalari
- `PATCH /api/orders/:id/status` - Buyurtma holatini yangilash

### Products API
- `GET /api/products/categories` - Kategoriyalar
- `GET /api/products/category/:id` - Kategoriya mahsulotlari

## Loyiha tuzilishi

```
├── models/           # MongoDB modellari
├── routes/           # API yo'nalishlari
├── bot/             # Telegram bot handlerlari
├── public/          # Frontend fayllari
├── scripts/         # Yordamchi skriptlar
├── server.js        # Asosiy server fayli
└── README.md        # Loyiha hujjati
```

## Kelajakdagi rejalar

- [ ] To'lov tizimini integratsiya qilish
- [ ] Push bildirishnomalar
- [ ] Mobil ilova
- [ ] Hisobotlarni PDF formatda eksport qilish
- [ ] Geolokatsiya asosida yetkazib berish optimizatsiyasi
- [ ] Chatbot AI yordamchisi

