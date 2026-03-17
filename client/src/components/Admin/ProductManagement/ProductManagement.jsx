'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import toast from 'react-hot-toast';
// AddProductForm component removed in favor of full-page editor
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../../redux/slices/productSlice';

const API = import.meta.env.VITE_API_URL || '';

const ProductManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products = [], loading } = useSelector((state) => state.product);
  const [localProducts, setLocalProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'draft'
  const [searchQuery, setSearchQuery] = useState(''); // Search query state
  const [failedImages, setFailedImages] = useState(new Set()); // Track failed image loads

  // categories removed — no longer fetching category list here

  // Sync products from Redux
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    setLocalProducts(products || []);
  }, [products]);

  const activeCount = (products || []).filter(p => !p.isDraft).length;
  const draftCount = (products || []).filter(p => p.isDraft).length;
  const allCount = (products || []).length;

  const visibleProducts = (localProducts || []).filter(p => {
    const matchesTab = activeTab === 'all' ? true : (activeTab === 'active' ? !p.isDraft : Boolean(p.isDraft));
    const matchesSearch = searchQuery.trim() === '' ||
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  // category display logic removed

  // Helper to get price display (with variant range if applicable)
  const getPriceDisplay = (product) => {
    if (!product.variantCombinations || product.variantCombinations.length === 0) {
      return `£${product.price?.toFixed(2) || '0.00'}`;
    }
    // Show price range from variants
    const variantPrices = product.variantCombinations.map(v => v.price || product.price);
    const minPrice = Math.min(...variantPrices);
    return `From £${minPrice.toFixed(2)}`;
  };

  // Helper to get total variant stock
  const getTotalVariantStock = (product) => {
    if (!product.variantCombinations || product.variantCombinations.length === 0) {
      return product.stock || 0;
    }
    return product.variantCombinations.reduce((sum, v) => sum + (v.stock || 0), 0);
  };

  // Helper to check if product has variants
  const hasVariants = (product) => {
    return product.variantCombinations && product.variantCombinations.length > 0;
  };

  const handleDelete = async (id, isBulk = false) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete product');
      // Only show toast and refetch for single deletes
      if (!isBulk) {
        toast.success('Product deleted successfully');
        dispatch(fetchProducts());
      }
      return true;
    } catch (error) {
      if (!isBulk) {
        toast.error(error.message);
      }
      return false;
    }
  };

  const handleBulkDelete = async (ids) => {
    if (window.confirm(`Delete ${ids.length} product(s)? This cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token');

        // Make all delete requests in parallel
        const deletePromises = ids.map(id =>
          fetch(`${API}/api/products/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
        );

        const responses = await Promise.all(deletePromises);
        const failedDeletes = responses.filter(r => !r.ok).length;
        const successfulDeletes = ids.length - failedDeletes;

        if (successfulDeletes > 0) {
          toast.success(`Deleted ${successfulDeletes} product(s)`);
        }
        if (failedDeletes > 0) {
          toast.error(`Failed to delete ${failedDeletes} product(s)`);
        }

        // Refetch products only once after all deletes
        dispatch(fetchProducts());
      } catch (error) {
        toast.error('Error deleting products: ' + error.message);
      }
    }
  };

  const handleToggleDraft = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const product = localProducts.find(p => p._id === id);
      if (!product) return;

      // Toggle draft status
      const newDraftStatus = !product.isDraft;
      const response = await fetch(`${API}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isDraft: newDraftStatus }),
      });

      if (!response.ok) throw new Error('Failed to update product');
      toast.success(newDraftStatus ? 'Moved to drafts' : 'Published successfully');
      dispatch(fetchProducts());
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getTotalStock = (variants) => {
    return variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
  };

  const handleOpenModal = (product = null) => {
    // Navigate to the full-page editor for this product
    if (product && product._id) {
      navigate(`/admin/products/edit/${product._id}`);
    } else {
      navigate('/admin/products/add');
    }
  };

  const handleImportProducts = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a valid CSV file');
      return;
    }

    try {
      const text = await file.text();
      const lines = text.trim().split('\n');

      if (lines.length < 2) {
        toast.error('CSV file must have headers and at least one product row');
        return;
      }

      // Helper function to parse CSV line properly with proper unescaping
      const parseCSVLine = (line) => {
        const values = [];
        let current = '';
        let insideQuotes = false;

        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          const nextChar = line[j + 1];

          if (char === '"') {
            if (insideQuotes && nextChar === '"') {
              // CSV escape: "" represents a literal "
              current += '"';
              j++; // Skip the next quote
            } else {
              // Toggle quote state
              insideQuotes = !insideQuotes;
            }
          } else if (char === ',' && !insideQuotes) {
            // End of field
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }

        // Add the last field
        values.push(current.trim());

        return values;
      };

      // Helper to normalize header names
      const normalizeHeader = (header) => {
        return header.toLowerCase().replace(/\s+/g, ' ').trim();
      };

      // Parse CSV headers
      const headerLine = lines[0];
      const rawHeaders = parseCSVLine(headerLine);
      const headers = rawHeaders.map(normalizeHeader);

      // Check for required headers - normalize search terms
      const hasName = headers.some(h => h.includes('name'));
      const hasPrice = headers.some(h => h.includes('price'));

      if (!hasName || !hasPrice) {
        toast.error(`CSV must include at least: Name, Price\nFound headers: ${rawHeaders.join(', ')}`);
        return;
      }

      // Parse products
      const productsToImport = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line);

        // Map values to headers
        const product = {};
        headers.forEach((header, idx) => {
          product[header] = values[idx] || '';
        });

        // Build product object for API
        const getFieldValue = (key) => {
          const normalKey = normalizeHeader(key);
          return Object.entries(product).find(([k]) => normalizeHeader(k) === normalKey)?.[1] || '';
        };

        const categoryStr = getFieldValue('category');
        // Split categories by " | " if there are multiple
        const categories = categoryStr && categoryStr.trim()
          ? categoryStr.split('|').map(cat => cat.trim()).filter(Boolean)
          : [];

        const productData = {
          name: getFieldValue('name'),
          slug: getFieldValue('slug') || getFieldValue('name')?.toLowerCase().replace(/\s+/g, '-'),
          description: getFieldValue('description'),
          price: parseFloat(getFieldValue('base price') || getFieldValue('price')) || 0,
          originalPrice: parseFloat(getFieldValue('original price')) || null,
          discount: parseFloat(getFieldValue('discount')) || 0,
          stock: parseInt(getFieldValue('base stock') || getFieldValue('stock')) || 0,
          categories: categories.length > 0 ? categories : [],
          isDraft: getFieldValue('status')?.toLowerCase() === 'draft',
          rating: parseFloat(getFieldValue('rating')) || 0,
          numReviews: parseInt(getFieldValue('number of reviews')) || 0,
          metaTitle: getFieldValue('meta title'),
          metaDescription: getFieldValue('meta description'),
          metaKeywords: getFieldValue('meta keywords'),
          benefitsHeading: getFieldValue('benefits heading') || 'Why Buy This Product',
          benefits: getFieldValue('benefits'),
          sku: getFieldValue('sku'),
          images: getFieldValue('images') ? getFieldValue('images').split('|').map(img => img.trim()).filter(Boolean) : [],
        };

        // Handle variants - try new format first, then JSON, then pipe-separated format
        const variantsStr = getFieldValue('variants');
        const variantCombinationsStr = getFieldValue('variant combinations');
        const variantsJsonStr = getFieldValue('variants json');
        const variantTypeStr = getFieldValue('variant type');
        const variantValuesStr = getFieldValue('variant values');

        console.log('Variant fields found:', { variantsStr: !!variantsStr, variantCombinationsStr: !!variantCombinationsStr });

        if (variantsStr && variantsStr.trim()) {
          // New format: Variants column contains the variants array
          try {
            console.log('Parsing variants from Variants column:', variantsStr.substring(0, 100));
            const parsedVariants = JSON.parse(variantsStr);
            console.log('Parsed variants:', parsedVariants);

            if (Array.isArray(parsedVariants)) {
              productData.variants = parsedVariants;
            }
          } catch (e) {
            console.warn('Failed to parse variants column:', e.message);
          }
        } else if (variantsJsonStr && variantsJsonStr.trim()) {
          // Old format: Variants JSON column
          try {
            console.log('Parsing variants from Variants JSON column:', variantsJsonStr.substring(0, 100));
            const parsedVariants = JSON.parse(variantsJsonStr);
            console.log('Parsed variants:', parsedVariants);

            if (parsedVariants.variants && Array.isArray(parsedVariants.variants)) {
              productData.variants = parsedVariants.variants;
              console.log('Set variants:', productData.variants);
            }
            if (parsedVariants.variantCombinations && Array.isArray(parsedVariants.variantCombinations)) {
              productData.variantCombinations = parsedVariants.variantCombinations;
              console.log('Set variantCombinations:', productData.variantCombinations.length, 'items');
            }
          } catch (e) {
            console.warn('Failed to parse variants JSON:', e.message);
            console.warn('Raw string was:', variantsJsonStr);
          }
        } else if (variantTypeStr && variantValuesStr) {
          // Pipe-separated format: "Colour | Size" and "Colour: blue | Size: 10mm"
          try {
            const variantTypes = variantTypeStr.split('|').map(v => v.trim());
            const variantPairs = variantValuesStr.split('|').map(v => v.trim());

            // Parse variant pairs into key-value object
            const variantValues = {};
            variantPairs.forEach(pair => {
              const [key, value] = pair.split(':').map(s => s.trim());
              if (key && value) {
                variantValues[key] = value;
              }
            });

            console.log('Parsed pipe-separated variants:', { variantTypes, variantValues });

            // Create variants array
            productData.variants = variantTypes.map(name => ({
              name: name,
              values: [] // Values will be populated from variantCombinations
            }));

            // Create single variant combination
            productData.variantCombinations = [{
              variantValues: variantValues,
              sku: getFieldValue('sku') || '',
              price: parseFloat(getFieldValue('variant price')) || parseFloat(getFieldValue('price')) || 0,
              stock: parseInt(getFieldValue('variant stock')) || parseInt(getFieldValue('stock')) || 0,
              image: getFieldValue('variant image') || getFieldValue('images')?.split('|')[0] || '',
            }];

            console.log('Created variants and combinations:', { variants: productData.variants, combinations: productData.variantCombinations });
          } catch (e) {
            console.warn('Failed to parse pipe-separated variants:', e.message);
          }
        }

        // Handle variant combination if provided as separate column
        if (variantCombinationsStr && variantCombinationsStr.trim()) {
          try {
            console.log('Parsing variant combination:', variantCombinationsStr.substring(0, 100));
            const vc = JSON.parse(variantCombinationsStr);

            // If this row has a variant combination, set it
            if (vc && vc.variantValues) {
              if (!productData.variantCombinations) {
                productData.variantCombinations = [];
              }
              productData.variantCombinations.push({
                variantValues: vc.variantValues,
                sku: vc.sku || '',
                price: parseFloat(vc.price) || productData.price || 0,
                stock: parseInt(vc.stock) || 0,
                image: vc.image || '',
              });
              console.log('Added variant combination. Total:', productData.variantCombinations.length);
            }
          } catch (e) {
            console.warn('Failed to parse variant combination:', e.message);
          }
        }

        productsToImport.push(productData);
      }

      if (productsToImport.length === 0) {
        toast.error('No valid products found in CSV');
        return;
      }

      console.log('Products to import:', JSON.stringify(productsToImport.slice(0, 2), null, 2));

      // Import products via API
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/api/products/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ products: productsToImport }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to import products');
      }

      toast.success(`Successfully imported ${productsToImport.length} product(s)`);
      dispatch(fetchProducts());

      // Reset file input
      event.target.value = '';
    } catch (error) {
      toast.error(error.message || 'Failed to import products');
    }
  };

  const handleExportSelected = () => {
    const selectedProducts = visibleProducts.filter(p => p.selected);
    if (selectedProducts.length === 0) {
      toast.error('No products selected to export');
      return;
    }

    try {
      // Define CSV headers
      const headers = [
        'Product ID',
        'Name',
        'Slug',
        'Description',
        'Base Price',
        'Original Price',
        'Discount (%)',
        'Base Stock',
        'Category',
        'Status',
        'Rating',
        'Number of Reviews',
        'Images',
        'Meta Title',
        'Meta Description',
        'Meta Keywords',
        'Benefits Heading',
        'Benefits',
        'SKU',
        'Variants',
        'Variant Combinations',
        'Created Date',
        'Updated Date'
      ];

      // Create CSV rows - one row per variant combination
      const rows = [];

      selectedProducts.forEach(product => {
        const imagesStr = product.images && product.images.length > 0
          ? product.images.join(' | ')
          : '';

        // Extract category names from categories array
        let categoryStr = '';
        if (product.categories && product.categories.length > 0) {
          categoryStr = product.categories
            .map(cat => {
              if (typeof cat === 'string') return cat;
              if (cat.name) return cat.name;
              return '';
            })
            .filter(Boolean)
            .join(' | ');
        } else if (product.category) {
          categoryStr = typeof product.category === 'string' ? product.category : product.category.name || '';
        }

        // Build variants array with values
        let variantsWithValues = [];
        if (product.variants && product.variants.length > 0) {
          variantsWithValues = product.variants.map(variant => {
            const uniqueValues = new Set();
            if (product.variantCombinations) {
              product.variantCombinations.forEach(vc => {
                if (vc.variantValues && vc.variantValues[variant.name]) {
                  uniqueValues.add(vc.variantValues[variant.name]);
                }
              });
            }
            return {
              name: variant.name,
              values: Array.from(uniqueValues)
            };
          });
        }

        // Serialize variants and combinations as JSON strings
        const variantsJSON = JSON.stringify(variantsWithValues).replace(/"/g, '""');

        // If product has variant combinations, create one row per combination
        if (product.variantCombinations && product.variantCombinations.length > 0) {
          product.variantCombinations.forEach(vc => {
            const combinationJSON = JSON.stringify(vc).replace(/"/g, '""');
            const row = [
              product._id || '',
              `"${(product.name || '').replace(/"/g, '""')}"`,
              product.slug || '',
              `"${(product.description || '').replace(/"/g, '""')}"`,
              product.price || '0',
              product.originalPrice || '',
              product.discount || '0',
              product.stock || '0',
              `"${categoryStr}"`,
              product.isDraft ? 'Draft' : 'Active',
              product.rating || '0',
              product.numReviews || '0',
              `"${imagesStr}"`,
              `"${(product.metaTitle || '').replace(/"/g, '""')}"`,
              `"${(product.metaDescription || '').replace(/"/g, '""')}"`,
              `"${(product.metaKeywords || '').replace(/"/g, '""')}"`,
              `"${(product.benefitsHeading || 'Why Buy This Product').replace(/"/g, '""')}"`,
              `"${(product.benefits || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
              product.sku || '',
              `"${variantsJSON}"`,
              `"${combinationJSON}"`,
              product.createdAt ? new Date(product.createdAt).toLocaleString() : '',
              product.updatedAt ? new Date(product.updatedAt).toLocaleString() : ''
            ];
            rows.push(row);
          });
        } else {
          // No variant combinations - create single row
          const row = [
            product._id || '',
            `"${(product.name || '').replace(/"/g, '""')}"`,
            product.slug || '',
            `"${(product.description || '').replace(/"/g, '""')}"`,
            product.price || '0',
            product.originalPrice || '',
            product.discount || '0',
            product.stock || '0',
            `"${categoryStr}"`,
            product.isDraft ? 'Draft' : 'Active',
            product.rating || '0',
            product.numReviews || '0',
            `"${imagesStr}"`,
            `"${(product.metaTitle || '').replace(/"/g, '""')}"`,
            `"${(product.metaDescription || '').replace(/"/g, '""')}"`,
            `"${(product.metaKeywords || '').replace(/"/g, '""')}"`,
            `"${(product.benefitsHeading || 'Why Buy This Product').replace(/"/g, '""')}"`,
            `"${(product.benefits || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
            product.sku || '',
            `"${variantsJSON}"`,
            '',
            product.createdAt ? new Date(product.createdAt).toLocaleString() : '',
            product.updatedAt ? new Date(product.updatedAt).toLocaleString() : ''
          ];
          rows.push(row);
        }
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products_export_${new Date().getTime()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${selectedProducts.length} product(s) to CSV successfully`);
    } catch (error) {
      toast.error('Failed to export products');
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition duration-300 cursor-pointer">
            📥 Import Products
            <input
              type="file"
              accept=".csv"
              onChange={handleImportProducts}
              className="hidden"
            />
          </label>
          <button
            onClick={() => navigate('/admin/products/add')}
            className="flex items-center gap-2 bg-gray-800 hover:bg-black text-white px-6 py-2 rounded-lg font-semibold transition duration-300"
          >
            <i className="fas fa-plus"></i> Add Product
          </button>
        </div>
      </div>

      {/* Tabs: All / Active / Draft */}
      <div className="mb-6 flex items-center gap-4 justify-between flex-wrap">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            All ({allCount})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'active' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'draft' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <i className="fas fa-search text-sm"></i>
          </div>
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
              aria-label="Clear search"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {visibleProducts.some(p => p.selected) && (
        <div className="mb-6 bg-gray-100 border border-gray-300 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">
            {visibleProducts.filter(p => p.selected).length} product(s) selected
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExportSelected()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition"
              title="Export selected products as JSON"
            >
              📥 Export
            </button>
            <button
              onClick={() => {
                const selectedIds = visibleProducts.filter(p => p.selected).map(p => p._id);
                selectedIds.forEach(id => handleToggleDraft(id));
              }}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold transition"
            >
              {activeTab === 'active' ? 'Move to Draft' : 'Publish'}
            </button>
            <button
              onClick={() => {
                const selectedIds = visibleProducts.filter(p => p.selected).map(p => p._id);
                handleBulkDelete(selectedIds);
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setLocalProducts(localProducts.map(p => ({ ...p, selected: false })))}
              className="px-4 py-2 bg-gray-300 hover:bg-black text-gray-900 rounded-lg text-sm font-semibold transition"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <i className="fas fa-spinner animate-spin text-4xl text-gray-700"></i>
        </div>
      )}

      {/* Products Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={localProducts.length > 0 && localProducts.every(p => p.selected)}
                    onChange={(e) => setLocalProducts(localProducts.map(p => ({ ...p, selected: e.target.checked })))}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visibleProducts && visibleProducts.length > 0 ? (
                visibleProducts.map((product) => {
                  const rawImg = product.images && product.images.length > 0 ? product.images[0] : (product.image || '');
                  const imgSrc = rawImg ? (rawImg.startsWith('http') ? rawImg : `${API}${rawImg}`) : null;
                  return (
                    <tr key={product._id} className="hover:bg-gray-50 transition duration-300">
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={product.selected || false}
                          onChange={(e) => setLocalProducts(localProducts.map(p => p._id === product._id ? { ...p, selected: e.target.checked } : p))}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 w-96 text-sm text-gray-900 font-semibold">
                        <div className="flex items-center">
                          {imgSrc && !failedImages.has(product._id) ? (
                            <img
                              src={imgSrc}
                              alt={product.name}
                              loading="lazy"
                              className="w-12 h-12 rounded-md object-cover mr-4"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                setFailedImages(prev => new Set([...prev, product._id]));
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-md mr-4 flex items-center justify-center text-center text-xs font-semibold text-gray-600">No Image</div>
                          )}
                          <div className=" w-64 flex items-center gap-2">
                            <span className="">{product.name}</span>
                            {product.isDraft && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                                Draft
                              </span>
                            )}
                            {!product.isDraft && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <span className="text-gray-700 font-bold">{getPriceDisplay(product)}</span>
                          {hasVariants(product) && (
                            <div className="text-xs text-gray-900 mt-1">
                              {product.variantCombinations.length} variants
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 text-sm py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getTotalVariantStock(product) > 0
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {getTotalVariantStock(product)}
                        </span>
                        {hasVariants(product) && (
                          <span className="text-xs ml-3 text-gray-900 mt-1">
                            Total stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center space-x-3">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="text-gray-700 hover:text-gray-800 transition"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-600">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
