const Page = require('../models/Page.js');

// Get all pages
const getAllPages = async (req, res) => {
    try {
        const pages = await Page.find({ isPublished: true });
        res.status(200).json({ pages, success: true });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching pages', error: err.message });
    }
};

// Get single page by slug (public)
const getPage = async (req, res) => {
    try {
        const { slug } = req.params;
        const page = await Page.findOne({ slug });
        if (!page) return res.status(404).json({ message: 'Page not found' });
        res.status(200).json(page);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching page', error: err.message });
    }
};

// Get single page by ID (admin)
const getPageById = async (req, res) => {
    try {
        const { id } = req.params;
        const page = await Page.findById(id);
        if (!page) return res.status(404).json({ message: 'Page not found' });
        res.status(200).json(page);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching page', error: err.message });
    }
};

// Create page (admin)
const createPage = async (req, res) => {
    try {
        const { title, slug, description, content, metaTitle, metaDescription, metaKeywords, isPublished } = req.body;
        
        // Check if page with same title or slug already exists
        const existingPage = await Page.findOne({
            $or: [
                { title: title },
                { slug: slug || title.toLowerCase().replace(/\s+/g, '-') }
            ]
        });
        
        if (existingPage) {
            return res.status(400).json({ 
                message: 'A page with this title or slug already exists',
                error: 'Duplicate page'
            });
        }
        
        const newPage = new Page({
            title,
            slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
            description,
            content,
            metaTitle: metaTitle || title || '',
            metaDescription,
            metaKeywords,
            isPublished: isPublished !== undefined ? isPublished : true
        });
        
        await newPage.save();
        res.status(201).json({ message: 'Page created successfully', page: newPage });
    } catch (err) {
        console.error('Error creating page:', err);
        res.status(500).json({ message: 'Error creating page', error: err.message });
    }
};

// Update page (admin)
const updatePage = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // If updating title or slug, check for duplicates (but exclude current page)
        if (updates.title || updates.slug) {
            const existingPage = await Page.findOne({
                $or: [
                    { title: updates.title },
                    { slug: updates.slug }
                ],
                _id: { $ne: id } // Exclude current page
            });
            
            if (existingPage) {
                return res.status(400).json({ 
                    message: 'A page with this title or slug already exists',
                    error: 'Duplicate page'
                });
            }
        }
        
        const page = await Page.findByIdAndUpdate(id, updates, { new: true });
        if (!page) return res.status(404).json({ message: 'Page not found' });
        
        res.status(200).json({ message: 'Page updated successfully', page });
    } catch (err) {
        console.error('Error updating page:', err);
        res.status(500).json({ message: 'Error updating page', error: err.message });
    }
};

// Delete page (admin)
const deletePage = async (req, res) => {
    try {
        const { id } = req.params;
        const page = await Page.findByIdAndDelete(id);
        if (!page) return res.status(404).json({ message: 'Page not found' });
        
        res.status(200).json({ message: 'Page deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting page', error: err.message });
    }
};

module.exports = {
    getAllPages,
    getPage,
    getPageById,
    createPage,
    updatePage,
    deletePage
};

