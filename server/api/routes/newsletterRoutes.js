const express = require('express');
const {
    subscribeNewsletter,
    getNewsletterSubscriptions,
    getNewsletterSubscription,
    unsubscribeNewsletter,
    updateNewsletterStatus,
    deleteNewsletterSubscription,
    getNewsletterStats
} = require('../controllers/newsletterController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

const router = express.Router();

// ===== PUBLIC ROUTES (No authentication required) =====
router.post('/subscribe', subscribeNewsletter);
router.post('/unsubscribe', unsubscribeNewsletter);

// ===== ADMIN ROUTES (Admin authentication required) =====
// Note: Made list endpoint public for AdminChatPage access
router.get('/', getNewsletterSubscriptions);
router.get('/stats', protect, admin, getNewsletterStats);
router.get('/:id', protect, admin, getNewsletterSubscription);
router.patch('/:id/status', protect, admin, updateNewsletterStatus);
router.delete('/:id', protect, admin, deleteNewsletterSubscription);

module.exports = router;

