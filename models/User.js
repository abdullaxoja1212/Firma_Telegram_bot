const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['sotuvchi', 'admin', 'haydovchi'],
    required: true
  },
  language: {
    type: String,
    enum: ['uz', 'uzc', 'ru'],
    default: 'uz'
  },
  // Sotuvchi ma'lumotlari
  name: String,
  phone: String,
  shopName: String,
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    region: String,
    district: String
  },
  // Qarz ma'lumotlari
  debt: {
    amount: { type: Number, default: 0 },
    lastPayment: Date,
    blocked: { type: Boolean, default: false }
  },
  // Haydovchi ma'lumotlari
  driverInfo: {
    name: String,
    phone: String,
    vehicle: String,
    assignedRegion: String
  },
  isActive: { type: Boolean, default: true },
  registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);