const express = require('express');
const {
  getSliders,
  getAllSliders,
  getSlider,
  createSlider,
  updateSlider,
  deleteSlider,
  reorderSliders,
} = require('../controllers/sliderController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin routes with specific paths (must come first)
router.get('/admin/all', protect, admin, getAllSliders);
router.post('/admin/reorder', protect, admin, reorderSliders);

// CRUD routes (admin protected)
router.post('/', protect, admin, createSlider);
router.put('/:id', protect, admin, updateSlider);
router.delete('/:id', protect, admin, deleteSlider);

// Public routes (must come last)
router.get('/', getSliders);
router.get('/:id', getSlider);

module.exports = router;
