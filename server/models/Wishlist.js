const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const WishlistItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  snapshot: { type: Schema.Types.Mixed, default: null },
  addedAt: { type: Date, default: Date.now },
});

const WishlistSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', sparse: true, index: true },
  guestId: { type: String, sparse: true, index: true }, // UUID for guest tracking
  items: { type: [WishlistItemSchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = model('Wishlist', WishlistSchema);

