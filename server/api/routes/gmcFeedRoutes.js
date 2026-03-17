const express = require('express');
const { generateGMCFeed } = require('../controllers/gmcFeedController.js');

const router = express.Router();

// GET /api/gmc-feed.xml - Generate Google Merchant Center XML Feed
router.get('/gmc-feed.xml', generateGMCFeed);

module.exports = router;
