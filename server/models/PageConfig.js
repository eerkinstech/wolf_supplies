const mongoose = require('mongoose');

// Node schema - matches the builder's node structure
const nodeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  kind: {
    type: String,
    enum: ['root', 'section', 'column', 'widget'],
    required: true
  },
  widgetType: String, // For widgets
  props: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  style: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  advanced: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  children: [{
    type: mongoose.Schema.Types.Mixed
  }]
}, { _id: false });

const pageConfigSchema = new mongoose.Schema({
  pageName: {
    type: String,
    enum: ['home', 'categories', 'products', 'about', 'contact'],
    required: true,
    unique: true
  },
  // Store the complete node tree structure from the builder
  sections: [{
    type: mongoose.Schema.Types.Mixed
  }],
  // Legacy: kept for backward compatibility
  meta: {
    title: String,
    description: String,
    keywords: String
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
pageConfigSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('PageConfig', pageConfigSchema);

