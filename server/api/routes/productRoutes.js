const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  updateReviewApprovalStatus,
  deleteProductReview,
  importProducts,
  validateProducts,
} = require('../controllers/productController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get('/', getProducts);
router.post('/validate', validateProducts);
router.post('/', protect, admin, createProduct);
router.post('/import', protect, admin, importProducts);
router.post('/:id/reviews', protect, createProductReview);
router.patch('/:id/reviews/:index', protect, admin, updateReviewApprovalStatus);
router.delete('/:id/reviews/:index', protect, admin, deleteProductReview);
router.get('/slug/:slug', getProductById);
router.get('/:id', getProductById);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;

