const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController.js');
const { getMenu, saveMenu, getAllMenus, saveAllMenus } = require('../controllers/settingsController.js');
const { getFeaturedCollections, saveFeaturedCollections } = require('../controllers/settingsController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get('/', getSettings);
router.patch('/', protect, admin, updateSettings);

// Browse menu endpoints
router.get('/menu', getMenu);
router.post('/menu', protect, admin, saveMenu);

// All menus endpoints (browse, topBar, mainNav, footer)
router.get('/menus', getAllMenus);
router.post('/menus', protect, admin, saveAllMenus);

// Featured collections endpoints
router.get('/featured-collections', getFeaturedCollections);
router.post('/featured-collections', protect, admin, saveFeaturedCollections);

module.exports = router;