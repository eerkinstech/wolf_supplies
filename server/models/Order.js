const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  price: Number,
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  image: String,
  variantImage: { type: String }, // Image of the selected variant
  selectedVariants: { type: Object },
  selectedSize: { type: String },
  selectedColor: { type: String },
  colorCode: { type: String }, // Hex color code for visual display
  variant: { type: String }, // Variant name/type
  sku: { type: String }, // Product SKU
  variantId: { type: String },
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, index: true, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', sparse: true }, // Allow null for guest orders
  guestId: { type: String, sparse: true, index: true }, // UUID for guest tracking
  orderItems: [orderItemSchema],
  contactDetails: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
  },
  shippingAddress: {
    address: String,
    apartment: String,
    city: String,
    stateRegion: String,
    postalCode: String,
    country: String,
  },
  billingAddress: {
    address: String,
    apartment: String,
    city: String,
    stateRegion: String,
    postalCode: String,
    country: String,
  },
  paymentMethod: String,
  paymentResult: { type: Object },
  itemsPrice: Number,
  taxPrice: Number,
  shippingPrice: Number,
  totalPrice: Number,
  couponCode: { type: String, default: null }, // Applied coupon code
  discountAmount: { type: Number, default: 0 }, // Discount amount applied

  paidAt: Date,
  fulfillmentStatus: { type: String, enum: ['unfulfilled', 'fulfilled'], default: 'unfulfilled' }, // Order fulfillment status
  deliveryStatus: { type: String, enum: ['', 'shipped', 'delivered', 'refunded'], default: '' }, // Delivery status field
  deliveredAt: Date,
  status: { type: String, default: 'pending' }, // Payment/processing status
  remarks: { type: String, default: '' },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;

