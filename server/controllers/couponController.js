const Coupon = require('../models/Coupon');

// Get all coupons
const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find()
            .populate('productId', 'name')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single coupon
const getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id)
            .populate('productId', 'name')
            .populate('createdBy', 'name email');
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new coupon
const createCoupon = async (req, res) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            productId,
            maxUses,
            validFrom,
            validUntil,
            isActive,
            minimumOrderValue
        } = req.body;

        // Validate required fields
        if (!code || !discountType || discountValue === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate discount type
        if (!['percentage', 'fixed'].includes(discountType)) {
            return res.status(400).json({ message: 'Invalid discount type' });
        }

        // Validate discount value
        if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
            return res.status(400).json({ message: 'Percentage discount must be between 0 and 100' });
        }

        // Check if code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const coupon = new Coupon({
            code: code.toUpperCase(),
            description,
            discountType,
            discountValue,
            productId: productId || null,
            maxUses,
            validFrom,
            validUntil,
            isActive: isActive !== undefined ? isActive : true,
            minimumOrderValue: minimumOrderValue || 0,
            createdBy: req.user.id
        });

        const savedCoupon = await coupon.save();
        const populatedCoupon = await savedCoupon.populate('productId', 'name');

        res.status(201).json(populatedCoupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update coupon
const updateCoupon = async (req, res) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            productId,
            maxUses,
            validFrom,
            validUntil,
            isActive,
            minimumOrderValue
        } = req.body;

        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // If code is being changed, check if new code exists
        if (code && code.toUpperCase() !== coupon.code) {
            const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
            if (existingCoupon) {
                return res.status(400).json({ message: 'Coupon code already exists' });
            }
            coupon.code = code.toUpperCase();
        }

        // Validate discount type if changed
        if (discountType && !['percentage', 'fixed'].includes(discountType)) {
            return res.status(400).json({ message: 'Invalid discount type' });
        }

        // Update fields
        if (description !== undefined) coupon.description = description;
        if (discountType) coupon.discountType = discountType;
        if (discountValue !== undefined) coupon.discountValue = discountValue;
        if (productId !== undefined) coupon.productId = productId || null;
        if (maxUses !== undefined) coupon.maxUses = maxUses;
        if (validFrom) coupon.validFrom = validFrom;
        if (validUntil) coupon.validUntil = validUntil;
        if (isActive !== undefined) coupon.isActive = isActive;
        if (minimumOrderValue !== undefined) coupon.minimumOrderValue = minimumOrderValue;

        const updatedCoupon = await coupon.save();
        const populatedCoupon = await updatedCoupon.populate('productId', 'name');

        res.json(populatedCoupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete coupon
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Validate coupon (for checkout)
const validateCoupon = async (req, res) => {
    try {
        const { code, orderTotal, productId, productIds, cartItems } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }

        console.log(`[Coupon Validation] Validating code: ${code.toUpperCase()}`);

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
        if (!coupon) {
            console.log(`[Coupon Validation] ✗ Coupon not found: ${code.toUpperCase()}`);
            return res.status(404).json({ message: 'Coupon not found or expired' });
        }

        console.log(`[Coupon Validation] ✓ Coupon found: ${coupon.code}`);

        // Check if coupon is expired
        const now = new Date();
        if (coupon.validFrom && coupon.validFrom > now) {
            console.log(`[Coupon Validation] ✗ Coupon not yet valid`);
            return res.status(400).json({ message: 'Coupon is not yet valid' });
        }
        if (coupon.validUntil && coupon.validUntil < now) {
            console.log(`[Coupon Validation] ✗ Coupon expired by date`);
            return res.status(400).json({ message: 'Coupon has expired' });
        }

        // Check max uses
        if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
            console.log(`[Coupon Validation] ✗ Usage limit reached: ${coupon.currentUses}/${coupon.maxUses}`);
            return res.status(400).json({
                message: 'Coupon usage limit reached',
                currentUses: coupon.currentUses,
                maxUses: coupon.maxUses
            });
        }

        console.log(`[Coupon Validation] ✓ Usage check passed: ${coupon.currentUses}/${coupon.maxUses}`);

        // Calculate applicable total (for minimum order value check)
        let applicableTotal = orderTotal;
        let applicableItemsPrice = 0;

        // If coupon is for specific product, calculate discount only on matching products
        if (coupon.productId && cartItems && Array.isArray(cartItems)) {
            const couponProductIdStr = coupon.productId.toString();

            // Check if any product in cart matches coupon product
            const matchingItems = cartItems.filter(item => {
                const itemProductId = item.product || item.productId;
                return itemProductId && itemProductId.toString() === couponProductIdStr;
            });

            if (matchingItems.length === 0) {
                console.log(`[Coupon Validation] ✗ Coupon not valid for these products. Coupon is for productId: ${couponProductIdStr}`);
                return res.status(400).json({
                    message: 'Coupon is not valid for the products in your cart'
                });
            }

            // Calculate total price of matching items
            applicableItemsPrice = matchingItems.reduce((sum, item) => {
                const itemPrice = item.price || 0;
                const itemQty = item.qty || item.quantity || 1;
                return sum + (itemPrice * itemQty);
            }, 0);

            applicableTotal = applicableItemsPrice;
            console.log(`[Coupon Validation] ✓ Product check passed: Coupon is valid for ${matchingItems.length} matching product(s). Applicable price: £${applicableTotal}`);
        } else if (coupon.productId && (productId || productIds)) {
            // Fallback for single productId check (backward compatibility)
            const couponProductIdStr = coupon.productId.toString();

            let isValidForProduct = false;

            if (productId && productId.toString() === couponProductIdStr) {
                isValidForProduct = true;
            } else if (productIds && Array.isArray(productIds)) {
                isValidForProduct = productIds.some(id => {
                    return id && id.toString() === couponProductIdStr;
                });
            }

            if (!isValidForProduct) {
                console.log(`[Coupon Validation] ✗ Coupon not valid for these products. Coupon is for productId: ${couponProductIdStr}`);
                return res.status(400).json({
                    message: 'Coupon is not valid for the products in your cart'
                });
            }

            console.log(`[Coupon Validation] ✓ Product check passed: Coupon is valid for at least one product in cart`);
        }

        // Check minimum order value (against applicable total)
        if (applicableTotal && applicableTotal < coupon.minimumOrderValue) {
            console.log(`[Coupon Validation] ✗ Order total too low: £${applicableTotal} < £${coupon.minimumOrderValue}`);
            return res.status(400).json({ message: `Minimum order value of £${coupon.minimumOrderValue} required` });
        }

        // Calculate discount (ONLY on applicable items)
        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (applicableTotal * coupon.discountValue) / 100;
        } else {
            discount = coupon.discountValue;
        }

        console.log(`[Coupon Validation] ✓ Coupon valid! Discount: £${discount}`);

        res.json({
            valid: true,
            coupon: {
                _id: coupon._id,
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discount: Math.min(discount, applicableTotal) // Don't discount more than applicable items total
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Increment coupon usage
const incrementCouponUsage = async (req, res) => {
    try {
        const { couponId } = req.body;

        if (!couponId) {
            return res.status(400).json({ message: 'Coupon ID is required' });
        }

        const coupon = await Coupon.findByIdAndUpdate(
            couponId,
            { $inc: { currentUses: 1 } },
            { new: true }
        );

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        console.log('[Coupon API] ✓ Incremented coupon:', { code: coupon.code, currentUses: coupon.currentUses, maxUses: coupon.maxUses });
        res.json(coupon);
    } catch (error) {
        console.error('[Coupon API] ✗ Error incrementing coupon:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// Increment coupon usage by code
const incrementCouponUsageByCode = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }

        console.log('[Coupon API] Incrementing usage for code:', code.toUpperCase());

        const coupon = await Coupon.findOneAndUpdate(
            { code: code.toUpperCase() },
            { $inc: { currentUses: 1 } },
            { new: true }
        );

        if (!coupon) {
            console.log('[Coupon API] ✗ Coupon not found with code:', code.toUpperCase());
            return res.status(404).json({ message: 'Coupon not found' });
        }

        console.log('[Coupon API] ✓ Incremented coupon:', { code: coupon.code, currentUses: coupon.currentUses, maxUses: coupon.maxUses });
        res.json(coupon);
    } catch (error) {
        console.error('[Coupon API] ✗ Error incrementing coupon by code:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// Get coupon status by code (for debugging)
const getCouponStatusByCode = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        const isExpired = coupon.maxUses && coupon.currentUses >= coupon.maxUses;
        const daysRemaining = coupon.validUntil ? Math.ceil((coupon.validUntil - new Date()) / (1000 * 60 * 60 * 24)) : null;

        res.json({
            code: coupon.code,
            isActive: coupon.isActive,
            maxUses: coupon.maxUses,
            currentUses: coupon.currentUses,
            usageRemaining: coupon.maxUses ? coupon.maxUses - coupon.currentUses : null,
            isExpired,
            daysRemaining,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            validUntil: coupon.validUntil,
            validFrom: coupon.validFrom
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  incrementCouponUsage,
  incrementCouponUsageByCode,
  getCouponStatusByCode
};
