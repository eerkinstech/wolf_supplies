const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

const getCategories = async (req, res) => {
  try {
    // Get all categories (both main and subcategories) based on query param
    const allCategories = req.query.all === 'true';

    let categories;

    if (allCategories) {
      // Get ALL categories without hierarchy filter
      categories = await Category.find({})
        .lean()
        .sort({ name: 1 });
    } else {
      // Get only main categories (no parent) with their subcategories populated
      categories = await Category.find({ parent: null })
        .populate({
          path: 'subcategories',
          populate: {
            path: 'subcategories',
            populate: {
              path: 'subcategories',
            },
          },
        })
        .lean() // Use lean() to get plain objects for better property handling
        .sort({ name: 1 });
    }

    // Add product count to each category recursively
    const addProductCount = async (categoryArray) => {
      for (let category of categoryArray) {
        // Count products directly assigned to this category
        const productCount = await Product.countDocuments({
          categories: category._id
        });

        category.productCount = productCount;

        // Recursively add product count to subcategories
        if (category.subcategories && category.subcategories.length > 0) {
          await addProductCount(category.subcategories);
        }
      }
    };

    await addProductCount(categories);
    res.json(categories);
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, slug, description, parent, image, color, metaTitle, metaDescription, metaKeywords } = req.body;

    // Generate slug from name if not provided
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const existing = await Category.findOne({ slug: finalSlug });
    if (existing) return res.status(400).json({ message: 'Category slug already exists' });

    const category = await Category.create({
      name,
      slug: finalSlug,
      description,
      parent: parent || null,
      image,
      color,
      metaTitle: metaTitle || name || '',
      metaDescription: metaDescription || '',
      metaKeywords: metaKeywords || ''
    });

    // Add product count to response
    const productCount = await Product.countDocuments({
      categories: category._id
    });
    category.productCount = productCount;

    res.status(201).json(category);
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate({
        path: 'subcategories',
        populate: {
          path: 'subcategories',
          populate: {
            path: 'subcategories',
          },
        },
      });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Add product count
    const addProductCount = async (cat) => {
      const productCount = await Product.countDocuments({
        categories: cat._id
      });
      cat.productCount = productCount;

      if (cat.subcategories && cat.subcategories.length > 0) {
        await Promise.all(cat.subcategories.map(addProductCount));
      }
    };

    await addProductCount(category);

    // Convert to plain object to ensure productCount is included
    const result = category.toObject();
    res.json(result);
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const raw = String(slug || '').trim();
    if (!raw) return res.status(400).json({ message: 'Missing category identifier' });

    const decodeSlug = (s) => {
      try { return decodeURIComponent(String(s).trim()); } catch (e) { return String(s).trim(); }
    };
    const decoded = decodeSlug(raw);

    // Escape regex special chars for exact match
    const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    let category = await Category.findOne({
      slug: { $regex: `^${escapeRegExp(decoded)}$`, $options: 'i' },
    })
      .populate({
        path: 'subcategories',
        populate: {
          path: 'subcategories',
          populate: {
            path: 'subcategories',
          },
        },
      });

    // If not found and identifier looks like an ObjectId, fall back to ID lookup
    if (!category && mongoose.Types.ObjectId.isValid(decoded)) {
      category = await Category.findById(decoded).populate({
        path: 'subcategories',
        populate: {
          path: 'subcategories',
          populate: {
            path: 'subcategories',
          },
        },
      });
    }

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Add product count
    const addProductCount = async (cat) => {
      const productCount = await Product.countDocuments({
        categories: cat._id
      });
      cat.productCount = productCount;

      if (cat.subcategories && cat.subcategories.length > 0) {
        await Promise.all(cat.subcategories.map(addProductCount));
      }
    };

    await addProductCount(category);

    // Convert to plain object to ensure productCount is included
    const result = category.toObject();
    res.json(result);
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, slug, description, parent, image, color, metaTitle, metaDescription, metaKeywords } = req.body;
    
    console.log('🔍 Received update request with payload:', { id: req.params.id, slug, name });

    const category = await Category.findById(req.params.id)
      .populate({
        path: 'subcategories',
        populate: {
          path: 'subcategories',
          populate: {
            path: 'subcategories',
          },
        },
      });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Check if slug is being changed and if it's unique
    if (slug && slug.trim() && slug.trim() !== category.slug) {
      const existingWithSlug = await Category.findOne({ slug: slug.trim() });
      if (existingWithSlug) {
        console.log('❌ Slug conflict! Tried to update to:', slug.trim(), 'but it already exists');
        return res.status(400).json({ error: 'This slug is already used by another category' });
      }
      console.log('📝 Updating slug from', category.slug, 'to', slug.trim());
      category.slug = slug.trim();
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (parent !== undefined) category.parent = parent;
    if (image) category.image = image;
    if (color) category.color = color;
    if (metaTitle !== undefined) category.metaTitle = metaTitle;
    if (metaDescription !== undefined) category.metaDescription = metaDescription;
    if (metaKeywords !== undefined) category.metaKeywords = metaKeywords;

    const updated = await category.save();
    console.log('✅ Category saved:', { id: updated._id, slug: updated.slug, name: updated.name });

    // Add product count
    const addProductCount = async (cat) => {
      const productCount = await Product.countDocuments({
        categories: cat._id
      });
      cat.productCount = productCount;

      if (cat.subcategories && cat.subcategories.length > 0) {
        await Promise.all(cat.subcategories.map(addProductCount));
      }
    };

    await addProductCount(updated);

    // Convert to plain object to ensure productCount is included
    const result = updated.toObject();
    res.json(result);
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Delete all subcategories recursively
    const deleteSubcategories = async (categoryId) => {
      const subcategories = await Category.find({ parent: categoryId });
      for (let sub of subcategories) {
        await deleteSubcategories(sub._id);
      }
      await Category.deleteOne({ _id: categoryId });
    };

    await deleteSubcategories(req.params.id);
    res.json({ message: 'Category and all subcategories removed' });
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory
};

