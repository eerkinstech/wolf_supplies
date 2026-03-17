const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, admin } = require('../middleware/authMiddleware.js');
const MediaAsset = require('../models/MediaAsset');
const { getImageDimensions } = require('../utils/mediaUtils.js');

// In CommonJS, __dirname and __filename are automatically available

const router = express.Router();

// Ensure uploads directory exists, use env variable for VPS compatibility
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
console.log('UPLOADS_DIR at runtime:', uploadsDir);
// Configure local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: name-timestamp-randomstring.ext
    // Sanitize the original filename: remove spaces and special characters
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000000000).toString();
    const ext = path.extname(file.originalname);

    // Get basename and sanitize: remove spaces, special chars, keep only alphanumeric, dash, underscore
    let name = path.basename(file.originalname, ext);
    name = name
      .toLowerCase()
      .replace(/\s+/g, '-')  // Replace spaces with dashes
      .replace(/[^a-z0-9\-_]/g, '')  // Remove special characters, keep only alphanumeric, dash, underscore
      .replace(/^-+|-+$/g, '');  // Remove leading/trailing dashes

    // Ensure name is not empty
    if (!name) name = 'file';

    const filename = `${name}-${timestamp}-${random}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

// GET endpoint to test uploads directory
router.get('/test', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    res.json({
      uploadsDir,
      filesCount: files.length,
      recentFiles: files.slice(-10)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error reading uploads directory', error: error.message });
  }
});

// Single image upload - only requires authentication (not admin)
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ message: 'No file uploaded', success: false });
    }

    // Verify file exists
    const filePath = path.join(uploadsDir, req.file.filename);
    const fileExists = fs.existsSync(filePath);

    if (!fileExists) {
      console.error('File not saved:', filePath);
      return res.status(500).json({ message: 'File was not saved properly', success: false });
    }

    // Return the absolute URL path for the uploaded file
    const apiBaseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${apiBaseUrl}/uploads/${req.file.filename}`;

    // Get image dimensions for images
    let width, height;
    if (req.file.mimetype.startsWith('image')) {
      try {
        const dims = await getImageDimensions(filePath);
        width = dims?.width;
        height = dims?.height;
      } catch (dimErr) {
        console.warn('Could not get image dimensions:', dimErr.message);
      }
    }

    // Create MediaAsset record in database
    const mediaAsset = new MediaAsset({
      filename: req.file.originalname,
      mime: req.file.mimetype,
      size: req.file.size,
      type: req.file.mimetype.startsWith('image') ? 'image' : 'video',
      storageKeyOrPath: filePath,
      url: `/api/media/serve/${req.file.filename}`,
      width,
      height,
      uploadedBy: req.user?._id || null,
    });

    await mediaAsset.save();

    // Update URL with actual asset ID
    mediaAsset.url = `/api/media/serve/${mediaAsset._id}`;
    await mediaAsset.save();

    console.log('File uploaded successfully:', fileUrl);
    res.json({
      success: true,
      url: fileUrl,  // For backward compatibility with product/category uploads
      filename: req.file.originalname,
      asset: {
        _id: mediaAsset._id,
        url: fileUrl,
        filename: req.file.originalname,
        serverUrl: mediaAsset.url,
        width,
        height,
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    // Clean up file if database save failed
    if (req.file) {
      try {
        fs.unlinkSync(path.join(uploadsDir, req.file.filename));
      } catch (e) {
        console.warn('Could not delete file after failed save:', e.message);
      }
    }
    res.status(500).json({ message: 'Upload failed: ' + error.message, success: false });
  }
});

// Public image upload - no authentication required (for page builder)
router.post('/public', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file in public upload request');
      return res.status(400).json({ message: 'No file uploaded', success: false });
    }

    // Verify file exists
    const filePath = path.join(uploadsDir, req.file.filename);
    const fileExists = fs.existsSync(filePath);

    if (!fileExists) {
      console.error('File not saved in public upload:', filePath);
      return res.status(500).json({ message: 'File was not saved properly', success: false });
    }

    // Return the absolute URL path for the uploaded file
    const apiBaseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${apiBaseUrl}/uploads/${req.file.filename}`;

    // Get image dimensions for images
    let width, height;
    if (req.file.mimetype.startsWith('image')) {
      try {
        const dims = await getImageDimensions(filePath);
        width = dims?.width;
        height = dims?.height;
      } catch (dimErr) {
        console.warn('Could not get image dimensions:', dimErr.message);
      }
    }

    // Create MediaAsset record in database
    const mediaAsset = new MediaAsset({
      filename: req.file.originalname,
      mime: req.file.mimetype,
      size: req.file.size,
      type: req.file.mimetype.startsWith('image') ? 'image' : 'video',
      storageKeyOrPath: filePath,
      url: `/api/media/serve/${req.file.filename}`,
      width,
      height,
      uploadedBy: null, // No user for public uploads
    });

    await mediaAsset.save();

    // Update URL with actual asset ID
    mediaAsset.url = `/api/media/serve/${mediaAsset._id}`;
    await mediaAsset.save();

    console.log('Public file uploaded successfully:', fileUrl);
    res.json({
      success: true,
      url: fileUrl,  // For backward compatibility with product/category uploads
      filename: req.file.originalname,
      asset: {
        _id: mediaAsset._id,
        url: fileUrl,
        filename: req.file.originalname,
        serverUrl: mediaAsset.url,
        width,
        height,
      }
    });
  } catch (error) {
    console.error('Public upload error:', error);
    // Clean up file if database save failed
    if (req.file) {
      try {
        fs.unlinkSync(path.join(uploadsDir, req.file.filename));
      } catch (e) {
        console.warn('Could not delete file after failed save:', e.message);
      }
    }
    res.status(500).json({ message: 'Upload failed: ' + error.message, success: false });
  }
});

// Multiple images upload - only requires authentication (not admin)
router.post('/multiple', protect, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      console.error('No files in multiple upload request');
      return res.status(400).json({ message: 'No files uploaded', success: false });
    }

    const apiBaseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const assets = [];
    const createdAssets = [];

    // Process each file and create MediaAsset records
    for (const file of req.files) {
      try {
        const filePath = path.join(uploadsDir, file.filename);

        // Get image dimensions for images
        let width, height;
        if (file.mimetype.startsWith('image')) {
          try {
            const dims = await getImageDimensions(filePath);
            width = dims?.width;
            height = dims?.height;
          } catch (dimErr) {
            console.warn('Could not get image dimensions:', dimErr.message);
          }
        }

        // Create MediaAsset record in database
        const mediaAsset = new MediaAsset({
          filename: file.originalname,
          mime: file.mimetype,
          size: file.size,
          type: file.mimetype.startsWith('image') ? 'image' : 'video',
          storageKeyOrPath: filePath,
          url: `/api/media/serve/${file.filename}`,
          width,
          height,
          uploadedBy: req.user?._id || null,
        });

        await mediaAsset.save();

        // Update URL with actual asset ID
        mediaAsset.url = `/api/media/serve/${mediaAsset._id}`;
        await mediaAsset.save();

        assets.push({
          _id: mediaAsset._id,
          url: `${apiBaseUrl}/uploads/${file.filename}`,
          filename: file.originalname,
          serverUrl: mediaAsset.url,
          width,
          height,
        });
        createdAssets.push(mediaAsset);
      } catch (fileErr) {
        console.error('Error processing file:', file.filename, fileErr.message);
        // Continue with other files even if one fails
      }
    }

    if (assets.length === 0) {
      return res.status(500).json({ message: 'Failed to upload any files', success: false });
    }

    console.log('Multiple files uploaded successfully:', assets.length);
    res.json({ 
      success: true,
      urls: assets.map(a => a.url),  // For backward compatibility
      assets,
      count: assets.length 
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    // Clean up files if database save failed
    if (req.files) {
      for (const file of req.files) {
        try {
          fs.unlinkSync(path.join(uploadsDir, file.filename));
        } catch (e) {
          console.warn('Could not delete file after failed save:', e.message);
        }
      }
    }
    res.status(500).json({ message: 'Upload failed: ' + error.message, success: false });
  }
});

// Multer error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('Multer error:', error.code, error.message);
    if (error.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ message: 'File size exceeds 5MB limit', success: false });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files', success: false });
    }
    return res.status(400).json({ message: 'File upload error: ' + error.message, success: false });
  } else if (error) {
    console.error('Upload middleware error:', error.message);
    return res.status(400).json({ message: error.message, success: false });
  }
  next();
});

module.exports = router;

