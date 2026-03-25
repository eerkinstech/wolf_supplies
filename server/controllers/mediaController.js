/**
 * Media Controller - Handle media uploads, listing, and serving
 */

const fs = require('fs');
const path = require('path');
const MediaAsset = require('../models/MediaAsset');
const { getImageDimensions } = require('../utils/mediaUtils');

// ============================================================================
// UPLOAD - POST /api/media/upload
// ============================================================================

const uploadMedia = async (req, res) => {
  try {
    // Multer middleware should have processed the file
    const file = req.file;
if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Extract mime type and validate
    const mime = file.mimetype;
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/ogg'].includes(mime)) {
      fs.unlinkSync(file.path); // Clean up uploaded file
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Determine asset type
    const type = mime.startsWith('image') ? 'image' : 'video';

    // Get dimensions for images
    let width, height;
    if (type === 'image') {
      const dims = await getImageDimensions(file.path);
      width = dims?.width;
      height = dims?.height;
    }

    // Create MediaAsset document
    const asset = new MediaAsset({
      filename: file.originalname || file.filename,
      mime,
      size: file.size,
      type,
      storageKeyOrPath: file.path,
      url: `/api/media/serve/${generateAssetId()}`, // Will be updated with actual ID
      width,
      height,
      uploadedBy: req.user?._id || null,
    });

    await asset.save();

    // Update URL with actual asset ID
    asset.url = `/api/media/serve/${asset._id}`;
    await asset.save();
res.json({
      success: true,
      asset: {
        _id: asset._id,
        assetId: asset._id.toString(),
        type: asset.type,
        filename: asset.filename,
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl,
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
        size: asset.size,
      },
    });
  } catch (error) {

    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Upload failed' });
  }
};

// ============================================================================
// LIST - GET /api/media (with pagination, search, filter)
// ============================================================================

const getMediaAssets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      all = 'false',
      type, // 'image' | 'video' | undefined (all)
      search, // search in filename
      sort = '-createdAt', // sort field
    } = req.query;
    const shouldReturnAll = all === 'true' || String(limit).toLowerCase() === 'all';

    // Build query
    let query = MediaAsset.find().active();

    if (type && ['image', 'video'].includes(type)) {
      query = query.where('type', type);
    }

    if (search) {
      query = query.where('filename', { $regex: search, $options: 'i' });
    }

    // Count total for pagination
    const total = await MediaAsset.countDocuments(query);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.max(parseInt(limit, 10) || 20, 1);
    const skip = shouldReturnAll ? 0 : (parsedPage - 1) * parsedLimit;

    let assetQuery = query
      .sort(sort)
      .select('_id filename mime type url thumbnailUrl width height duration size createdAt');

    if (!shouldReturnAll) {
      assetQuery = assetQuery.skip(skip).limit(parsedLimit);
    }

    const assets = await assetQuery;
    const pageCount = shouldReturnAll ? 1 : Math.max(Math.ceil(total / parsedLimit), 1);

    res.json({
      success: true,
      assets: assets.map((asset) => ({
        _id: asset._id,
        assetId: asset._id.toString(),
        filename: asset.filename,
        type: asset.type,
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl,
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
        size: asset.size,
        createdAt: asset.createdAt,
      })),
      pagination: {
        page: shouldReturnAll ? 1 : parsedPage,
        limit: shouldReturnAll ? total : parsedLimit,
        total,
        pages: pageCount,
      },
    });
  } catch (error) {

    res.status(500).json({ error: 'Failed to fetch assets' });
  }
};

// ============================================================================
// GET ASSET - GET /api/media/:id
// ============================================================================

const getMediaAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await MediaAsset.findById(id).active();

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json({
      success: true,
      asset: {
        _id: asset._id,
        assetId: asset._id.toString(),
        filename: asset.filename,
        type: asset.type,
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl,
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
        size: asset.size,
        mime: asset.mime,
        createdAt: asset.createdAt,
      },
    });
  } catch (error) {

    res.status(500).json({ error: 'Failed to fetch asset' });
  }
};

// ============================================================================
// SERVE - GET /api/media/serve/:id (serve actual file)
// ============================================================================

const serveMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { thumbnail } = req.query;

    const asset = await MediaAsset.findById(id).active();

    if (!asset) {

      return res.status(404).json({ error: 'Asset not found' });
    }

    // Check if file exists
    const filePath = asset.storageKeyOrPath;

    if (!fs.existsSync(filePath)) {

      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', asset.mime);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache

    // Serve file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {

      res.status(500).json({ error: 'Failed to serve file' });
    });
  } catch (error) {

    res.status(500).json({ error: 'Failed to serve asset' });
  }
};

// ============================================================================
// DELETE - DELETE /api/media/:id (soft delete)
// ============================================================================

const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await MediaAsset.findById(id).active();

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Hard-delete file from disk
    if (fs.existsSync(asset.storageKeyOrPath)) {
      try {
        fs.unlinkSync(asset.storageKeyOrPath);
      } catch (fileErr) {
        console.error('Error deleting file:', fileErr);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Soft delete in database
    asset.deletedAt = new Date();
    await asset.save();

    res.json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
};

// ============================================================================
// BULK DELETE - DELETE /api/media/bulk (soft delete multiple)
// ============================================================================

const bulkDeleteMedia = async (req, res) => {
  try {
    const { ids } = req.body;

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No media IDs provided' });
    }

    // Get all assets to be deleted
    const assetsToDelete = await MediaAsset.find({
      _id: { $in: ids },
      deletedAt: null,
    });

    // Hard-delete files from disk
    for (const asset of assetsToDelete) {
      if (fs.existsSync(asset.storageKeyOrPath)) {
        try {
          fs.unlinkSync(asset.storageKeyOrPath);
        } catch (fileErr) {
          console.error(`Error deleting file ${asset.filename}:`, fileErr);
          // Continue with deletion of other files
        }
      }
    }

    // Soft delete all assets in database
    const result = await MediaAsset.updateMany(
      { _id: { $in: ids }, deletedAt: null },
      { deletedAt: new Date() }
    );

    res.json({
      success: true,
      message: `Deleted ${result.modifiedCount} assets`,
      deleted: result.modifiedCount,
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: 'Failed to delete assets' });
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateAssetId() {
  return `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = {
  uploadMedia,
  getMediaAssets,
  getMediaAsset,
  serveMedia,
  deleteMedia,
  bulkDeleteMedia
};

