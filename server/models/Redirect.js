const mongoose = require('mongoose');

const redirectSchema = new mongoose.Schema(
  {
    fromUrl: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      help: 'Original broken or old URL path (e.g., /old-product-name)'
    },
    toUrl: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      help: 'New destination URL path (e.g., /new-product-name)'
    },
    isActive: {
      type: Boolean,
      default: true,
      help: 'Whether this redirect is currently active'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for faster lookups
redirectSchema.index({ isActive: 1 });

module.exports = mongoose.model('Redirect', redirectSchema);
