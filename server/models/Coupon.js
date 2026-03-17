const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: String,
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    // For percentage: 0-100, For fixed: amount in currency
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        sparse: true, // Optional - null means applicable to all products
    },
    maxUses: Number, // Maximum number of times coupon can be used
    currentUses: {
        type: Number,
        default: 0
    },
    validFrom: Date,
    validUntil: Date,
    isActive: {
        type: Boolean,
        default: true
    },
    minimumOrderValue: {
        type: Number,
        default: 0
    }, // Minimum order value to apply coupon
    createdBy: {
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
}, { timestamps: true });

// Index for isActive lookup (code has unique constraint which creates index automatically)
couponSchema.index({ isActive: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
