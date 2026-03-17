const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    buttonText: {
      type: String,
      default: 'Shop Now',
      trim: true,
    },
    buttonLink: {
      type: String,
      default: '/products',
      trim: true,
    },
    bgImage: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Sort by order before querying
sliderSchema.query.byOrder = function () {
  return this.sort({ order: 1 });
};

module.exports = mongoose.model('Slider', sliderSchema);
