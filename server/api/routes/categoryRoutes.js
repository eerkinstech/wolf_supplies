const express = require('express');
const {
  getCategories,
  createCategory,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, admin, createCategory);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategoryById);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;

