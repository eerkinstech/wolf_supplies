const express = require('express');
const router = express.Router();
const redirectController = require('../controllers/redirectController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin routes (protected - require authentication and admin role)
router.get('/admin/redirects', protect, admin, redirectController.getAllRedirects);
router.get('/admin/redirects/stats', protect, admin, redirectController.getRedirectStats);
router.get('/admin/redirects/:id', protect, admin, redirectController.getRedirectById);
router.post('/admin/redirects', protect, admin, redirectController.createRedirect);
router.put('/admin/redirects/:id', protect, admin, redirectController.updateRedirect);
router.delete('/admin/redirects/:id', protect, admin, redirectController.deleteRedirect);
router.post('/admin/redirects/bulk-delete', protect, admin, redirectController.bulkDeleteRedirects);
router.patch('/admin/redirects/:id/toggle', protect, admin, redirectController.toggleRedirectStatus);

// Public route for resolving redirects (no auth needed - used by customers)
router.get('/resolve-redirect', redirectController.resolveRedirect);

// Search route for admin (to find existing redirects)
router.get('/redirects/search', protect, admin, redirectController.searchRedirect);

module.exports = router;
