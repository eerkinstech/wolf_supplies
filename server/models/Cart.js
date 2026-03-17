const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  quantity: { type: Number, default: 1 },
  price: Number,
  selectedVariants: { type: Object },
  image: String,
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', sparse: true, index: true },
  guestId: { type: String, sparse: true, index: true }, // UUID for guest tracking
  items: [cartItemSchema],
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

