const express = require('express');
const {
  getAllOrders,
  getUserOrders,
  getOrderById,
  getOrdersByGuestId,
  createOrder,
  updateOrderStatus,
  updateOrderPayment,
  updateOrderDelivery,
  updateOrderRefund,
  updateOrderFulfillment,
  deleteOrder,
  updateOrderRemarks,
  updateOrderContact,
  updateOrderShipping,
  updateOrderBilling,
  resendOrderPDF,
} = require('../controllers/orderController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Admin routes
router.get('/', protect, admin, getAllOrders); // Get all orders (admin only)
router.delete('/:id', protect, admin, deleteOrder); // Delete order (admin only)

// User routes
router.get('/user/my-orders', protect, getUserOrders); // Get user's orders
router.get('/guest/history', getOrdersByGuestId); // Get guest orders by guestId (public, via middleware)
router.post('/', createOrder); // Create new order (guest or logged-in users)
router.get('/:id', getOrderById); // Get single order (public access)

// Admin update routes
router.put('/:id/status', protect, admin, updateOrderStatus); // Update order status
router.put('/:id/payment', protect, admin, updateOrderPayment); // Update payment status
router.put('/:id/delivery', protect, admin, updateOrderDelivery); // Update delivery status
router.put('/:id/refund', protect, admin, updateOrderRefund); // Update refund status
router.put('/:id/fulfillment', protect, admin, updateOrderFulfillment); // Update fulfillment status
router.put('/:id/remarks', protect, admin, updateOrderRemarks); // Update remarks
router.put('/:id/contact', protect, admin, updateOrderContact); // Update contact details
router.put('/:id/shipping', protect, admin, updateOrderShipping); // Update shipping address
router.put('/:id/billing', protect, admin, updateOrderBilling); // Update billing address
router.post('/:id/resend-pdf', protect, admin, resendOrderPDF); // Resend order PDF to customer
router.put('/:id', protect, admin, updateOrderStatus); // Generic update for status

module.exports = router;

