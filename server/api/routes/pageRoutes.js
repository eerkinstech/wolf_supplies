const express = require('express');
const {
  getAllPages,
  getPage,
  getPageById,
  createPage,
  updatePage,
  deletePage
} = require('../controllers/pageController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Create page (admin) - must be before /:id routes
router.post('/', protect, admin, createPage);

// Get all pages (public - for menu selector)
router.get('/', getAllPages);

// Get page by ID (admin) - MUST be before /:slug to avoid conflict
router.get('/admin/id/:id', protect, admin, getPageById);

// Update page (admin) - MUST be before /:slug to avoid conflict
router.put('/:id', protect, admin, updatePage);
router.patch('/:id', protect, admin, updatePage);

// Delete page (admin) - MUST be before /:slug to avoid conflict
router.delete('/:id', protect, admin, deletePage);

// Get single page by slug (public) - MUST be last as it's least specific
router.get('/:slug', getPage);
router.delete('/:id', protect, admin, deletePage);

module.exports = router;

