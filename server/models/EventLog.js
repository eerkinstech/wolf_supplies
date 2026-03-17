const mongoose = require('mongoose');

const eventLogSchema = new mongoose.Schema({
  guestId: { type: String, required: true, index: true }, // UUID for guest tracking
  eventType: {
    type: String,
    enum: ['page_view', 'add_to_cart', 'remove_from_cart', 'begin_checkout', 'purchase', 'add_to_wishlist', 'remove_from_wishlist'],
    required: true,
    index: true,
  },
  metadata: {
    productId: String,
    orderId: String,
    cartValue: Number,
    itemCount: Number,
    sessionId: String,
    userAgent: String,
  },
  ipAddress: String,
  createdAt: { type: Date, default: Date.now }
});

// TTL index to automatically delete old events after 90 days (for privacy)
eventLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Compound index for efficient queries (guestId + eventType + createdAt)
eventLogSchema.index({ guestId: 1, eventType: 1, createdAt: -1 });

const EventLog = mongoose.model('EventLog', eventLogSchema);

module.exports = EventLog;

