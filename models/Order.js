const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    variant: String,
    quantity: Number,
    price: Number,
    total: Number
  }],
  totalAmount: Number,
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'debt'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'debt'],
    default: 'pending'
  },
  deliveryInfo: {
    address: String,
    location: {
      latitude: Number,
      longitude: Number
    },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'delivering', 'delivered'],
      default: 'pending'
    }
  },
  status: {
    type: String,
    enum: ['new', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'new'
  },
  createdAt: { type: Date, default: Date.now },
  deliveredAt: Date
});

// Order raqamini avtomatik yaratish
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);