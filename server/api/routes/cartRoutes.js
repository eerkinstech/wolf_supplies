const express = require('express');
const { getCart, updateCart, clearCart } = require('../controllers/cartController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Cart routes - allow both authenticated and guest users
router.get('/', getCart);
router.post('/', updateCart);
router.delete('/', clearCart);

module.exports = router;

