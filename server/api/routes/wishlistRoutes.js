const express = require('express');
const { getWishlist, addToWishlist, removeFromWishlist, clearWishlist } = require('../controllers/wishlistController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.route('/').get(getWishlist).post(addToWishlist).delete(clearWishlist);
// DELETE /api/wishlist/:productId?variantId=... will remove specific variant snapshot when provided
router.route('/:productId').delete(removeFromWishlist);

module.exports = router;

