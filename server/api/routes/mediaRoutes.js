/**
 * Media Routes - Upload, list, get, serve, and delete media assets
 * Endpoints:
 *   POST   /api/media/upload   - Upload a file
 *   GET    /api/media          - List all media (with pagination, search, filter)
 *   GET    /api/media/:id      - Get asset metadata
 *   GET    /api/media/serve/:id - Serve actual file
 *   DELETE /api/media/:id      - Delete asset (soft delete)
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const mediaController = require('../controllers/mediaController.js');
const { ensureUploadsDir, generateFilename } = require('../utils/mediaUtils.js');

const router = express.Router();

// ============================================================================
// MULTER CONFIGURATION
// ============================================================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = ensureUploadsDir();
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, generateFilename(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    // Allow images and videos only
    const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'video/mp4',
        'video/webm',
        'video/ogg',
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max
    },
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /api/media/upload
 * Upload a single media file
 */
router.post('/upload', upload.single('file'), mediaController.uploadMedia);

/**
 * GET /api/media
 * List all media assets with pagination, search, and filtering
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number (default: 20)
 *   - type: 'image' | 'video'
 *   - search: string (search in filename)
 *   - sort: string (default: '-createdAt')
 */
router.get('/', mediaController.getMediaAssets);

/**
 * GET /api/media/:id
 * Get a single asset metadata
 */
router.get('/:id', mediaController.getMediaAsset);

/**
 * GET /api/media/serve/:id
 * Serve the actual media file (with caching headers)
 * Query params:
 *   - thumbnail: 'true' (optional, for thumbnails)
 */
router.get('/serve/:id', mediaController.serveMedia);

/**
 * DELETE /api/media/bulk
 * Soft delete multiple assets
 * Body: { ids: [id1, id2, ...] }
 */
router.post('/bulk', mediaController.bulkDeleteMedia);

/**
 * DELETE /api/media/:id
 * Soft delete an asset
 */
router.delete('/:id', mediaController.deleteMedia);

// ============================================================================
// ERROR HANDLING
// ============================================================================

router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large (max 100MB)' });
        }
        return res.status(400).json({ error: error.message });
    }

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    next();
});

module.exports = router;

