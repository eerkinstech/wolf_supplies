const express = require('express');
const {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  incrementCouponUsage,
  incrementCouponUsageByCode,
  getCouponStatusByCode
} = require('../controllers/couponController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Public route - validate coupon
router.post('/validate', validateCoupon);

// Public routes - coupon status and increment by code
router.get('/status/:code', getCouponStatusByCode);
router.post('/increment-by-code', incrementCouponUsageByCode);

// Admin routes
router.get('/', protect, admin, getAllCoupons);
router.get('/:id', protect, admin, getCouponById);
router.post('/', protect, admin, createCoupon);
router.put('/:id', protect, admin, updateCoupon);
router.delete('/:id', protect, admin, deleteCoupon);

// Increment usage (can be called during checkout)
router.post('/:id/increment-usage', incrementCouponUsage);

module.exports = router;
