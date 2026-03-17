const express = require('express');
const { generateSitemap, generateProductSitemap } = require('../controllers/sitemapController.js');

const router = express.Router();

// GET /api/sitemap.xml - Generate main sitemap
router.get('/sitemap.xml', generateSitemap);

// GET /api/sitemap-products.xml - Generate products-specific sitemap
router.get('/sitemap-products.xml', generateProductSitemap);

module.exports = router;
