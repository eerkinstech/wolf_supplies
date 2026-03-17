const Redirect = require('../models/Redirect');

/**
 * Get all redirects with optional filtering and search
 */
exports.getAllRedirects = async (req, res) => {
  try {
    const { isActive, search } = req.query;
    const query = {};

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Search in fromUrl or toUrl
    if (search) {
      query.$or = [
        { fromUrl: { $regex: search, $options: 'i' } },
        { toUrl: { $regex: search, $options: 'i' } }
      ];
    }

    const redirects = await Redirect.find(query).sort({ createdAt: -1 });

    res.json(redirects);
  } catch (error) {
    console.error('Error fetching redirects:', error);
    res.status(500).json({ error: 'Failed to fetch redirects' });
  }
};

/**
 * Get redirect statistics
 */
exports.getRedirectStats = async (req, res) => {
  try {
    const total = await Redirect.countDocuments();
    const active = await Redirect.countDocuments({ isActive: true });
    const inactive = await Redirect.countDocuments({ isActive: false });

    res.json({ total, active, inactive });
  } catch (error) {
    console.error('Error fetching redirect stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

/**
 * Get a single redirect by ID
 */
exports.getRedirectById = async (req, res) => {
  try {
    const redirect = await Redirect.findById(req.params.id);

    if (!redirect) {
      return res.status(404).json({ error: 'Redirect not found' });
    }

    res.json(redirect);
  } catch (error) {
    console.error('Error fetching redirect:', error);
    res.status(500).json({ error: 'Failed to fetch redirect' });
  }
};

/**
 * Create a new redirect
 */
exports.createRedirect = async (req, res) => {
  try {
    const { fromUrl, toUrl, isActive } = req.body;

    // Validate required fields
    if (!fromUrl || !toUrl) {
      return res.status(400).json({ error: 'Both fromUrl and toUrl are required' });
    }

    // Check if redirect already exists
    const existingRedirect = await Redirect.findOne({ fromUrl });
    if (existingRedirect) {
      return res.status(409).json({ error: 'A redirect for this URL already exists' });
    }

    // Create new redirect
    const redirect = new Redirect({
      fromUrl,
      toUrl,
      isActive: isActive !== undefined ? isActive : true
    });

    await redirect.save();

    res.status(201).json({
      message: 'Redirect created successfully',
      redirect
    });
  } catch (error) {
    console.error('Error creating redirect:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A redirect for this URL already exists' });
    }
    res.status(500).json({ error: error.message || 'Failed to create redirect' });
  }
};

/**
 * Update a redirect
 */
exports.updateRedirect = async (req, res) => {
  try {
    const { id } = req.params;
    const { fromUrl, toUrl, isActive } = req.body;

    // Validate required fields
    if (!fromUrl || !toUrl) {
      return res.status(400).json({ error: 'Both fromUrl and toUrl are required' });
    }

    // Check if the new fromUrl is already used by another redirect
    if (fromUrl) {
      const existingRedirect = await Redirect.findOne({
        fromUrl,
        _id: { $ne: id }
      });
      if (existingRedirect) {
        return res.status(409).json({ error: 'A redirect for this URL already exists' });
      }
    }

    // Update redirect
    const redirect = await Redirect.findByIdAndUpdate(
      id,
      {
        fromUrl,
        toUrl,
        isActive: isActive !== undefined ? isActive : undefined,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!redirect) {
      return res.status(404).json({ error: 'Redirect not found' });
    }

    res.json({
      message: 'Redirect updated successfully',
      redirect
    });
  } catch (error) {
    console.error('Error updating redirect:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A redirect for this URL already exists' });
    }
    res.status(500).json({ error: error.message || 'Failed to update redirect' });
  }
};

/**
 * Delete a redirect
 */
exports.deleteRedirect = async (req, res) => {
  try {
    const { id } = req.params;

    const redirect = await Redirect.findByIdAndDelete(id);

    if (!redirect) {
      return res.status(404).json({ error: 'Redirect not found' });
    }

    res.json({
      message: 'Redirect deleted successfully',
      redirect
    });
  } catch (error) {
    console.error('Error deleting redirect:', error);
    res.status(500).json({ error: 'Failed to delete redirect' });
  }
};

/**
 * Bulk delete redirects
 */
exports.bulkDeleteRedirects = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No redirect IDs provided' });
    }

    const result = await Redirect.deleteMany({
      _id: { $in: ids }
    });

    res.json({
      message: `${result.deletedCount} redirect(s) deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error bulk deleting redirects:', error);
    res.status(500).json({ error: 'Failed to delete redirects' });
  }
};

/**
 * Toggle redirect status (active/inactive)
 */
exports.toggleRedirectStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Get current redirect
    const redirect = await Redirect.findById(id);

    if (!redirect) {
      return res.status(404).json({ error: 'Redirect not found' });
    }

    // Toggle the status
    redirect.isActive = !redirect.isActive;
    redirect.updatedAt = new Date();

    await redirect.save();

    res.json({
      message: `Redirect is now ${redirect.isActive ? 'active' : 'inactive'}`,
      redirect
    });
  } catch (error) {
    console.error('Error toggling redirect status:', error);
    res.status(500).json({ error: 'Failed to toggle redirect status' });
  }
};

/**
 * Resolve redirect (public endpoint - used to find where to redirect a URL)
 */
exports.resolveRedirect = async (req, res) => {
  try {
    const { fromUrl } = req.query;

    if (!fromUrl) {
      return res.status(400).json({ error: 'fromUrl query parameter is required' });
    }

    // Find active redirect
    const redirect = await Redirect.findOne({
      fromUrl: fromUrl.toLowerCase(),
      isActive: true
    });

    if (!redirect) {
      return res.status(404).json({ error: 'No active redirect found for this URL' });
    }

    res.json({
      resolved: true,
      toUrl: redirect.toUrl,
      fromUrl: redirect.fromUrl
    });
  } catch (error) {
    console.error('Error resolving redirect:', error);
    res.status(500).json({ error: 'Failed to resolve redirect' });
  }
};

/**
 * Search redirects
 */
exports.searchRedirect = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await Redirect.find({
      $or: [
        { fromUrl: { $regex: q, $options: 'i' } },
        { toUrl: { $regex: q, $options: 'i' } }
      ]
    }).limit(10);

    res.json(results);
  } catch (error) {
    console.error('Error searching redirects:', error);
    res.status(500).json({ error: 'Failed to search redirects' });
  }
};
