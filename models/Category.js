const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  nameUz: { type: String, required: true },
  icon: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Category', categorySchema);