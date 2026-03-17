const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: String,
  email: String,
  rating: Number,
  comment: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isApproved: { type: Boolean, default: false }, // Admin approval flag
}, { timestamps: true });

const variantSchema = new mongoose.Schema({
  name: String,                    // e.g., "Size", "Color", "Material"
  values: [String],                // e.g., ["Small", "Medium", "Large"]
}, { _id: false });

const variantCombinationSchema = new mongoose.Schema({
  variantValues: {
    type: Map,
    of: String,                     // e.g., { Size: "Large", Color: "Red" }
  },
  sku: String,                      // Unique SKU for this combination
  price: Number,                    // Price for this specific combination (optional)
  stock: { type: Number, default: 0 },  // Stock for this specific combination
  image: String,                   // Optional image URL for this variant combination
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],  // Multiple categories

  // Basic pricing and stock (used when no variants)
  price: { type: Number, required: true, default: 0 },
  originalPrice: Number,
  discount: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },  // Stock for basic (non-variant) products

  // Images
  images: [String],

  // Variants (optional)
  variants: [variantSchema],         // Array of variant types (e.g., Size, Color)
  variantCombinations: [variantCombinationSchema],  // Specific combinations with stock

  // Stock status
  inStock: { type: Boolean, default: true },

  // Reviews
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
  // Key selling points shown on PDP - now stored as HTML from rich text editor
  benefitsHeading: { type: String, default: 'Why Buy This Product' },
  benefits: String,

  // SEO Metadata
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  metaKeywords: { type: String, default: '' },

  // Admin Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Draft flag: true = not published yet
  isDraft: { type: Boolean, default: false },
}, { timestamps: true });

// Pre-save hook to calculate inStock status (synchronous)
productSchema.pre('save', function () {
  // Check if product has variants
  if (this.variants && this.variants.length > 0) {
    // If has variants, check if any variant combination has stock
    this.inStock = this.variantCombinations && this.variantCombinations.some(vc => vc.stock > 0);
  } else {
    // If no variants, check basic stock
    this.inStock = this.stock > 0;
  }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;

