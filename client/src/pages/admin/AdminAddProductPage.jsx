'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import RichTextEditor from '../../components/RichTextEditor/RichTextEditor';
import SEOMetaForm from '../../components/Admin/SEOMetaForm/SEOMetaForm';
import useURLRedirect from '../../hooks/useURLRedirect';
import MediaLibraryModal from '../../components/MediaLibraryModal/MediaLibraryModal';

const API = import.meta.env.VITE_API_URL || '';

const AdminAddProductPage = ({ params }) => {
  // Get path parameters from URL (e.g., /admin/products/edit/:id)
  const routeParams = useParams();
  const id = routeParams?.id || undefined;
  console.log('[AdminAddProductPage] Route params:', routeParams);
  console.log('[AdminAddProductPage] Extracted ID:', id);

  // State for variant grouping priority
  const [priorityGroup, setPriorityGroup] = useState('');

  // State for collapsed groups in variants
  const [collapsedGroups, setCollapsedGroups] = useState({});

  // State for group bulk inputs
  const [groupBulkInputs, setGroupBulkInputs] = useState({});

  // State for new variant options in AddVariantModal
  const [newVariantOptions, setNewVariantOptions] = useState({});

  // State for media library context
  const [mediaLibraryContext, setMediaLibraryContext] = useState(null);

  // State for selected variant for image
  const [selectedVariantForImage, setSelectedVariantForImage] = useState(null);

  // State for selected group for image
  const [selectedGroupForImage, setSelectedGroupForImage] = useState(null);

  // State for shouldCreateRedirect
  const [shouldCreateRedirect, setShouldCreateRedirect] = useState(false);
  // State for variant search input
  const [searchTerm, setSearchTerm] = useState('');
  // State for variants panel open/close
  const [variantsOpen, setVariantsOpen] = useState(true);
  // State for option collapse
  const [optionCollapsed, setOptionCollapsed] = useState({});

  // State for Add Variant Modal
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  // State for Media Library Modal
  const [showMediaLibraryModal, setShowMediaLibraryModal] = useState(false);
  const navigate = useNavigate();

  // Determine if editing an existing product
  const isEditing = Boolean(id);

  // Main form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    comparePrice: '',
    stock: '',
    images: [],
    options: [],
    variants: [],
    categories: [],
    benefitsText: '',
    benefitsHeading: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    isDraft: false,
  });

  // Track original form data for discard functionality on edit
  const [originalFormData, setOriginalFormData] = useState(null);
  const isInitialLoadRef = React.useRef(true);
  const autoGenerateReadyRef = React.useRef(false);

  // Multiple undo stack for deleted variants
  const [deletedVariantsStack, setDeletedVariantsStack] = useState([]);
  const [showUndoStack, setShowUndoStack] = useState([]);
  const undoTimersRef = React.useRef({}); // Track timeouts by variant ID
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  // State for All Images Modal
  const [showAllImagesModal, setShowAllImagesModal] = useState(false);

  // Save status state
  const [saveStatus, setSaveStatus] = useState(null);

  // Loading state for form submission
  const [loading, setLoading] = useState(false);

  // Error state for displaying error messages
  const [error, setError] = useState(null);

  // State for toggling the options panel
  const [optionsOpen, setOptionsOpen] = useState(true);

  // State for categories, original slug, and groupBy
  const [categories, setCategories] = useState([]);
  const [originalSlug, setOriginalSlug] = useState('');
  const [groupBy, setGroupBy] = useState('');

  // If editing, fetch product and populate form
  React.useEffect(() => {
    if (!id) {
      console.log('[AdminAddProductPage] No id provided, skipping fetch.');
      return;
    }
    console.log('[AdminAddProductPage] Starting fetch for product ID:', id);
    const fetchProduct = async () => {
      try {
        const url = `${API}/api/products/${id}`;
        console.log('[AdminAddProductPage] Fetching from URL:', url);
        const res = await axios.get(url);
        const prod = res.data;
        console.log('[AdminAddProductPage] Fetched product (raw backend):', prod);

        // Handle benefits - could be HTML string, array, or undefined
        let benefitsText = '';
        if (typeof prod.benefits === 'string') {
          benefitsText = prod.benefits;
        } else if (Array.isArray(prod.benefits) && prod.benefits.length > 0) {
          benefitsText = `<ul>${prod.benefits.map(b => `<li>${b}</li>`).join('')}</ul>`;
        }

        setFormData((prev) => {
          const mapped = {
            ...prev,
            name: prod.name || '',
            price: prod.price || '',
            comparePrice: prod.originalPrice || '',
            slug: prod.slug || '',
            stock: prod.stock || '',
            categories: Array.isArray(prod.categories)
              ? prod.categories.map(cat => typeof cat === 'string' ? cat : cat.$oid || cat._id || '')
              : [],
            description: prod.description || '',
            benefitsHeading: prod.benefitsHeading || '',
            benefitsText,
            images: Array.isArray(prod.images) ? prod.images : (prod.images ? [prod.images] : []),
            options: Array.isArray(prod.variants)
              ? prod.variants.map(opt => ({
                name: opt.name || '',
                values: Array.isArray(opt.values) ? opt.values : [],
              }))
              : [],
            variants: Array.isArray(prod.variantCombinations)
              ? prod.variantCombinations.map((vc, idx) => ({
                id: vc._id || `variant-${idx}`,
                optionValues: vc.variantValues || {},
                sku: vc.sku || '',
                price: vc.price || '',
                stock: vc.stock || 0,
                image: vc.image || '',
              }))
              : [],
            metaTitle: prod.metaTitle || '',
            metaDescription: prod.metaDescription || '',
            metaKeywords: prod.metaKeywords || '',
            isDraft: prod.isDraft || false,
          };
          // Log mapped formData for debugging
          console.log('Mapped formData:', mapped);
          // Log key fields for quick check
          console.log('Mapped name:', mapped.name);
          console.log('Mapped price:', mapped.price);
          console.log('Mapped categories:', mapped.categories);
          console.log('Mapped options:', mapped.options);
          console.log('Mapped variants:', mapped.variants);
          return mapped;
        });
        // Set original slug for redirect detection
        setOriginalSlug(prod.slug || '');
      } catch (err) {
        console.error('[AdminAddProductPage] Error fetching product:', err);
        console.error('[AdminAddProductPage] Error details:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          url: `${API}/api/products/${id}`
        });
        setError(`Failed to load product: ${err.response?.status === 404 ? 'Product not found' : err.message}`);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch categories on mount
  React.useEffect(() => {
    fetchCategories();
    // For new products (no id), mark auto-generation as ready
    if (!id) {
      console.log('✅ New product detected - enabling auto-generation');
      isInitialLoadRef.current = false;
      autoGenerateReadyRef.current = true;
    }
  }, []);

  // Create URL redirect helper function
  const createURLRedirect = async (fromUrl, toUrl) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token available for creating redirect');
        return false;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Normalize URLs
      const normalizeUrl = (url) => {
        // Remove leading/trailing whitespace
        url = String(url || '').trim();
        // Convert to lowercase
        url = url.toLowerCase();
        // Remove any trailing slashes (except for root "/")
        if (url !== '/' && url.endsWith('/')) {
          url = url.slice(0, -1);
        }
        // Ensure URL starts with "/" if not empty
        if (url && !url.startsWith('/')) {
          url = '/' + url;
        }
        return url || '/';
      };

      const from = normalizeUrl(fromUrl);
      const to = normalizeUrl(toUrl);

      // Validation
      if (!from || !to) {
        toast.error('Invalid redirect URLs');
        return false;
      }

      if (from === to) {
        return true; // No need to create redirect if URLs are the same
      }

      console.log('Creating redirect:', { fromUrl: from, toUrl: to });

      const response = await axios.post(`${API}/api/admin/redirects`,
        { fromUrl: from, toUrl: to, isActive: true },
        { headers }
      );

      console.log('Redirect created successfully:', response.data);
      toast.success('URL redirect created successfully!');
      return true;
    } catch (err) {
      console.error('Error creating redirect:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || 'Failed to create URL redirect';
      toast.error(errorMsg);
      return false;
    }
  };

  // Set groupBy to first option when options change
  React.useEffect(() => {
    if (formData.options && formData.options.length > 0) {
      const firstOption = formData.options.find(opt => opt.name);
      if (firstOption && firstOption.name) {
        setGroupBy(firstOption.name);
      }
    }
  }, [formData.options]);

  // Auto-generate variants when options change
  React.useEffect(() => {
    // Check if we have any options with values
    const optionsWithValues = (formData.options || []).filter(
      o => o.name?.trim() && Array.isArray(o.values) && o.values.length > 0
    );

    // Don't proceed if no complete options or if not ready yet
    if (optionsWithValues.length === 0) {
      return;
    }

    // Only regenerate if ALL named options have values (complete options set)
    const allNamedOptions = (formData.options || []).filter(o => o.name?.trim());
    const hasIncompleteOptions = allNamedOptions.some(o => !Array.isArray(o.values) || o.values.length === 0);

    if (hasIncompleteOptions) {
      return;
    }

    // Safeguard: if autoGenerateReadyRef is false but we have complete options, still generate
    // This catches cases where the ref wasn't set properly
    if (!autoGenerateReadyRef.current) {
      console.warn('⚠️ Auto-generation not ready, but options exist - forcing generation');
      autoGenerateReadyRef.current = true; // Enable it now
    }

    console.log('🔄 Auto-generating variants from options:', optionsWithValues.map(o => `${o.name}(${o.values.length})`).join(', '));

    const newVariants = generateVariantsFromOptions(formData, formData.options);
    console.log('📦 Generated', newVariants.length, 'variants');

    setFormData((prev) => ({
      ...prev,
      variants: newVariants,
    }));
  }, [formData.options]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/api/categories`);
      setCategories(response.data);
    } catch (err) {
    }
  };

  // Build payload used by submit and autosave
  const buildPayload = () => {
    const images = Array.isArray(formData.images) ? formData.images : [];
    const variantsTypes = (formData.options || []).map((o) => ({ name: o.name, values: o.values }));
    const variantCombinations = (formData.variants || []).map((v) => ({
      variantValues: v.optionValues || {},
      sku: v.sku || '',
      price: v.price ? parseFloat(v.price) : (formData.price ? parseFloat(formData.price) : 0),
      stock: v.stock ? parseInt(v.stock) : 0,
      image: v.image || '',
    }));

    const generateSlug = (str) =>
      String(str || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');

    return {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description || '',
      price: formData.price ? parseFloat(formData.price) : 0,
      originalPrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
      stock: formData.stock ? parseInt(formData.stock) : 0,
      images,
      variants: variantsTypes,
      variantCombinations,
      categories: formData.categories || [],
      benefits: formData.benefitsText || '',
      benefitsHeading: formData.benefitsHeading || ' ',
      metaTitle: formData.metaTitle || '',
      metaDescription: formData.metaDescription || '',
      metaKeywords: formData.metaKeywords || '',
    };
  };

  // Store original data when loading existing product for discard functionality
  React.useEffect(() => {
    if (id && formData.name && !originalFormData) {
      console.log('✅ Existing product loaded - enabling auto-generation');
      setOriginalFormData(JSON.parse(JSON.stringify(formData)));
      // Mark initial load as complete so auto-generation can start
      isInitialLoadRef.current = false;
      autoGenerateReadyRef.current = true;
    }
  }, [id, formData]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (!originalFormData && !formData.name) {
      // New product with no data
      return false;
    }
    if (!originalFormData && formData.name) {
      // New product with data
      return true;
    }
    if (originalFormData && JSON.stringify(originalFormData) !== JSON.stringify(formData)) {
      // Existing product with changes
      return true;
    }
    return false;
  };

  // Validate: Compare Price must be greater than Price
  const comparePriceError = (() => {
    try {
      const p = formData.price === '' || formData.price === null ? NaN : parseFloat(formData.price);
      const cp = formData.comparePrice === '' || formData.comparePrice === null ? NaN : parseFloat(formData.comparePrice);
      if (!isNaN(cp) && !isNaN(p)) {
        if (cp <= p) return 'Compare price must be greater than Price';
      }
      return '';
    } catch (e) {
      return '';
    }
  })();

  // Prevent page navigation if there are unsaved changes
  React.useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData, originalFormData]);

  // Reset saveStatus when form is edited (only after originalFormData is synced)
  React.useEffect(() => {
    if (saveStatus === 'saved' && originalFormData && hasUnsavedChanges()) {
      setSaveStatus(null);
    }
  }, [formData, originalFormData, saveStatus]);

  // Prevent React Router navigation if there are unsaved changes
  const handleNavigation = (callback) => {
    if (hasUnsavedChanges()) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave without saving or discarding?'
      );
      if (confirmed) {
        callback();
      }
    } else {
      callback();
    }
  };

  // Helper: Build a map of all category IDs (including subcategories) to their names
  const getCategoryNameMap = () => {
    const map = {};
    const traverse = (items) => {
      if (!items) return;
      const list = Array.isArray(items) ? items : Object.values(items);
      for (const item of list) {
        if (item && item._id && item.name) {
          map[item._id] = item.name;
        }
        if (item && item.subcategories) {
          traverse(item.subcategories);
        }
      }
    };
    traverse(categories);
    return map;
  };

  const normalizeKey = (k) => String(k ?? '—').trim();

  const formatOptionValues = (optionValues = {}) => {
    try {
      const entries = Object.entries(optionValues || {});
      if (groupBy && Object.prototype.hasOwnProperty.call(optionValues || {}, groupBy)) {
        const first = [[groupBy, optionValues[groupBy]]];
        const rest = entries.filter(([k]) => k !== groupBy);
        return [...first, ...rest].map(([k, v]) => `${k}: ${v}`).join(' / ');
      }

      // If options order is available, use it to present values consistently
      if (formData.options && formData.options.length > 0) {
        const order = formData.options.map((o) => o.name).filter(Boolean);
        const sorted = entries.slice().sort((a, b) => {
          const ai = order.indexOf(a[0]);
          const bi = order.indexOf(b[0]);
          const aPos = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
          const bPos = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
          if (aPos === bPos) return String(a[0]).localeCompare(String(b[0]));
          return aPos - bPos;
        });
        return sorted.map(([k, v]) => `${k}: ${v}`).join(' / ');
      }

      return entries.map(([k, v]) => `${k}: ${v}`).join(' / ');
    } catch (e) {
      return '';
    }
  };

  const toggleGroup = (grp) => {
    // Toggle collapsed state
    setCollapsedGroups((prev) => ({ ...prev, [grp]: !prev[grp] }));
  };

  const toggleOptionCollapse = (key) => setOptionCollapsed((p) => ({ ...p, [key]: !p[key] }));

  const handleGroupInputChange = (grp, field, value) => {
    const key = normalizeKey(grp);
    setGroupBulkInputs((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: value },
    }));
  };

  const applyGroupField = (grp, field, value) => {
    const key = normalizeKey(grp);
    const val = value !== undefined ? value : groupBulkInputs?.[key]?.[field];
    if (val === undefined || val === null || val === '') return;

    let parsedVal = val;
    if (field === 'price') {
      const p = parseFloat(val);
      if (isNaN(p)) return;
      parsedVal = p;
    } else if (field === 'stock') {
      const s = parseInt(val);
      if (isNaN(s)) return;
      parsedVal = s;
    }

    const updatedVariants = formData.variants.map((v) => {
      const k = normalizeKey(v.optionValues && v.optionValues[groupBy]);
      if (k !== key) return v;
      return { ...v, [field]: parsedVal };
    });

    setFormData({ ...formData, variants: updatedVariants });
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { name: '', values: [] }],
    });
  };

  // Update option name and keep variant keys in sync
  const handleUpdateOptionName = (idx, name) => {
    const oldName = (formData.options[idx] && formData.options[idx].name) || '';
    const options = formData.options.map((o, i) => (i === idx ? { ...o, name } : o));

    // If the name changed, rename keys in variant.optionValues
    if (oldName !== name) {
      const updatedVariants = (formData.variants || []).map((v) => {
        const ov = { ...(v.optionValues || {}) };
        if (oldName && Object.prototype.hasOwnProperty.call(ov, oldName)) {
          const val = ov[oldName];
          delete ov[oldName];
          if (name) ov[name] = val;
        }
        return { ...v, optionValues: ov };
      });
      setFormData({ ...formData, options, variants: updatedVariants });
    } else {
      setFormData({ ...formData, options });
    }
  };

  // Remove an option and strip its values from variants
  const handleRemoveOption = (idx) => {
    const opt = formData.options[idx];
    const name = opt?.name;
    const options = formData.options.filter((_, i) => i !== idx);

    const updatedVariants = (formData.variants || []).map((v) => {
      if (!name) return v;
      const ov = { ...(v.optionValues || {}) };
      if (Object.prototype.hasOwnProperty.call(ov, name)) {
        delete ov[name];
      }
      return { ...v, optionValues: ov };
    });

    setFormData({ ...formData, options, variants: updatedVariants });
  };

  // Add a value to an option (no duplicates)
  const handleAddOptionValue = (optIdx, value) => {
    const val = String(value || '').trim();
    if (!val) return;
    setFormData((prev) => {
      const options = (prev.options || []).map((o, i) => {
        if (i !== optIdx) return o;
        const values = Array.isArray(o.values) ? [...o.values] : [];
        if (values.includes(val)) return { ...o, values };
        return { ...o, values: [...values, val] };
      });
      return { ...prev, options };
    });
  };

  // Remove a value from an option
  const handleRemoveOptionValue = (optIdx, valueIdx) => {
    setFormData((prev) => {
      const options = (prev.options || []).map((o, i) => {
        if (i !== optIdx) return o;
        const values = Array.isArray(o.values) ? o.values.filter((_, vi) => vi !== valueIdx) : [];
        return { ...o, values };
      });
      return { ...prev, options };
    });
  };

  // Generate variant combinations from current options (cartesian product)
  // This is now called automatically when options change
  const generateVariantsFromOptions = (oldFormData, newOptions) => {
    const opts = (newOptions || []).filter((o) => o.name && Array.isArray(o.values) && o.values.length > 0);

    // If no options with values, clear variants
    if (opts.length === 0) {
      return [];
    }

    const cartesian = (arrays) => arrays.reduce((a, b) => a.flatMap((d) => b.map((e) => [...d, e])), [[]]);
    const arrays = opts.map((o) => o.values);
    const combos = cartesian(arrays);

    // Get old variants for data preservation
    const oldVariants = oldFormData?.variants || [];

    const variants = combos.map((combo, idx) => {
      const optionValues = {};
      combo.forEach((val, i) => {
        optionValues[opts[i].name] = val;
      });

      // Try to find matching variant in old data and preserve it
      // Check for exact match: same keys and values
      const matchingOldVariant = oldVariants.find(oldV => {
        if (!oldV.optionValues) return false;
        const oldKeys = Object.keys(oldV.optionValues).sort();
        const newKeys = Object.keys(optionValues).sort();
        // Must have same number of keys and all values must match
        return oldKeys.length === newKeys.length &&
          newKeys.every(key => oldV.optionValues[key] === optionValues[key]);
      });

      return {
        id: matchingOldVariant?.id || `variant-${Date.now()}-${idx}`,
        optionValues,
        sku: matchingOldVariant?.sku || '',
        price: matchingOldVariant?.price || formData.price || '',
        stock: matchingOldVariant?.stock || 0,
        image: matchingOldVariant?.image || '',
      };
    });

    return variants;
  };
  const token = localStorage.getItem('token');
  // handleSubmit now supports publishing (publish = true) or saving as draft (publish = false)
  const handleSubmit = async (e, publish = true) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }

    if (comparePriceError) {
      setError(comparePriceError);
      if (typeof toast === 'function') toast.error(comparePriceError);
      return;
    }

    setLoading(true);
    setSaveStatus('saving');
    try {
      // Get token for authenticated requests
      const token = localStorage.getItem('token');
      // Build images array from unified `images` field
      const images = Array.isArray(formData.images) ? formData.images : [];

      // Map option types to `variants` (name + values) expected by server
      const variantsTypes = (formData.options || []).map((o) => ({ name: o.name, values: o.values }));

      // Map each variant to variantCombination schema expected by server
      const variantCombinations = (formData.variants || []).map((v) => ({
        variantValues: v.optionValues || {},
        sku: v.sku || '',
        price: v.price ? parseFloat(v.price) : (formData.price ? parseFloat(formData.price) : 0),
        stock: v.stock ? parseInt(v.stock) : 0,
        image: v.image || '',
      }));

      // Generate slug from name if not provided
      const generateSlug = (str) =>
        String(str || '')
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/-+/g, '-');

      const payload = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description || '',
        price: formData.price ? parseFloat(formData.price) : 0,
        originalPrice: formData.comparePrice && formData.comparePrice.trim() !== '' ? parseFloat(formData.comparePrice) : null,
        stock: formData.stock ? parseInt(formData.stock) : 0,
        images,
        variants: variantsTypes,
        variantCombinations,
        categories: formData.categories || [],
        benefits: formData.benefitsText || '',
        benefitsHeading: formData.benefitsHeading || ' ',
        metaTitle: formData.metaTitle || '',
        metaDescription: formData.metaDescription || '',
        metaKeywords: formData.metaKeywords || '',
        isDraft: publish ? false : true,
      };

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (isEditing) {
        // Update existing product
        const res = await axios.put(`${API}/api/products/${id}`, payload, { headers });
        toast.success(publish ? 'Product saved successfully!' : 'Product saved as draft');

        // Create URL redirect if slug changed and checkbox is checked
        if (shouldCreateRedirect && originalSlug && originalSlug.toLowerCase() !== (res.data.slug || '').toLowerCase()) {
          const oldUrl = `/product/${originalSlug}`.toLowerCase();
          const newUrl = `/product/${res.data.slug}`.toLowerCase();

          console.log('🔗 Creating redirect:', { fromUrl: oldUrl, toUrl: newUrl });
          await createURLRedirect(oldUrl, newUrl);
          setShouldCreateRedirect(false);
        }

        // Refresh the product data from server to ensure consistency
        const refreshRes = await axios.get(`${API}/api/products/${id}`);
        const refreshedProd = refreshRes.data;

        // Rebuild formData from refreshed product
        let refreshedBenefitsText = '';
        if (typeof refreshedProd.benefits === 'string') {
          refreshedBenefitsText = refreshedProd.benefits;
        } else if (Array.isArray(refreshedProd.benefits) && refreshedProd.benefits.length > 0) {
          refreshedBenefitsText = `<ul>${refreshedProd.benefits.map(b => `<li>${b}</li>`).join('')}</ul>`;
        }

        const refreshedFormData = {
          name: refreshedProd.name || '',
          price: refreshedProd.price || '',
          comparePrice: refreshedProd.originalPrice || '',
          slug: refreshedProd.slug || '',
          stock: refreshedProd.stock || '',
          categories: refreshedProd.categories ? refreshedProd.categories.map((c) => (c._id ? c._id : c)) : [],
          description: refreshedProd.description || '',
          benefitsText: refreshedBenefitsText,
          benefitsHeading: refreshedProd.benefitsHeading || ' ',
          images: Array.isArray(refreshedProd.images) ? refreshedProd.images : (refreshedProd.images ? [refreshedProd.images] : []),
          options: refreshedProd.variants || [],
          variants: (refreshedProd.variantCombinations || []).map((vc, idx) => ({
            id: vc._id || `variant-${idx}`,
            optionValues: vc.variantValues || {},
            sku: vc.sku || '',
            price: vc.price || '',
            stock: vc.stock || 0,
            image: vc.image || '',
          })),
          metaTitle: refreshedProd.metaTitle || '',
          metaDescription: refreshedProd.metaDescription || '',
          metaKeywords: refreshedProd.metaKeywords || '',
          isDraft: refreshedProd.isDraft || false,
        };

        setFormData(refreshedFormData);
        setOriginalFormData(JSON.parse(JSON.stringify(refreshedFormData)));
        setOriginalSlug(refreshedFormData.slug);

        // Show "Saved" status (persists until form is edited)
        setSaveStatus('saved');
      } else {
        // Create new product
        const res = await axios.post(`${API}/api/products`, payload, { headers });
        const created = res.data;
        if (publish) {
          toast.success('Product published successfully!');
          // Clear form on successful creation
          setFormData({
            name: '',
            price: '',
            comparePrice: '',
            slug: '',
            stock: '',
            categories: [],
            description: '',
            benefitsHeading: '',
            benefitsText: '',
            images: [],
            options: [],
            variants: [],
            isDraft: false,
            metaTitle: '',
            metaDescription: '',
            metaKeywords: '',
          });
          setOriginalFormData(null);
          setSaveStatus('saved');
          // Redirect after publish
          setTimeout(() => navigate('/admin/products'), 1200);
        } else {
          // If saved as draft, navigate to edit page for continued editing
          toast.success('Draft created. Redirecting to editor...');
          setSaveStatus('saved');
          setTimeout(() => navigate(`/admin/products/edit/${created._id}`), 800);
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error creating/updating product';
      toast.error(errorMsg);
      setError(errorMsg);
      setSaveStatus(null);
    } finally {
      setLoading(false);
    }
  };
  const handleAddVariant = () => {
    // Initialize modal with empty selections for each option
    const initialOptions = {};
    formData.options.forEach((opt) => {
      initialOptions[opt.name] = '';
    });
    setNewVariantOptions(initialOptions);
    setShowAddVariantModal(true);
  };

  const handleConfirmAddVariant = () => {
    // Create variant with selected option values
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          id: `variant-${Date.now()}`,
          name: `Variant ${formData.variants.length + 1}`,
          optionValues: newVariantOptions,
          sku: '',
          price: formData.price || '',
          stock: 0,
          image: '',
        },
      ],
    });
    setShowAddVariantModal(false);
    toast.success('Variant added');
  };

  const handleUpdateVariant = (id, updates) => {
    const updated = formData.variants.map((v) =>
      v.id === id ? { ...v, ...updates } : v
    );
    setFormData({ ...formData, variants: updated });
  };

  const handleDeleteVariant = (id) => {
    // Deprecated: replaced by undo-capable delete below
    setFormData({
      ...formData,
      variants: formData.variants.filter((v) => v.id !== id),
    });
  };

  // Replace delete with undo-capable function (support multiple undos)
  const handleDeleteVariantWithUndo = (id, origIndex) => {
    const variant = formData.variants.find((v) => v.id === id);
    if (!variant) return;

    // Determine which group this variant belongs to
    const groupValue = variant.optionValues && variant.optionValues[groupBy];
    const groupKey = groupValue || '—';

    // Add to undo stack with group info
    const newDeletedItem = { variant, index: origIndex, timestamp: Date.now(), id, groupKey };
    setDeletedVariantsStack((prev) => [...prev, newDeletedItem]);
    setShowUndoStack((prev) => [...prev, true]);

    // Auto-dismiss after 8 seconds - store timeout keyed by variant ID
    const timeoutId = setTimeout(() => {
      setShowUndoStack((prev) => {
        const lastIdx = prev.length - 1;
        return prev.filter((_, i) => i !== lastIdx);
      });
      setDeletedVariantsStack((prev) => {
        const lastIdx = prev.length - 1;
        return prev.filter((_, i) => i !== lastIdx);
      });
      delete undoTimersRef.current[id];
    }, 5400000); // 1.5 hours

    undoTimersRef.current[id] = timeoutId;

    // Remove variant from form
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v.id !== id),
    }));
  };

  // Undo the most recent deleted variant
  const handleUndoDelete = (index) => {
    if (index < 0 || index >= deletedVariantsStack.length) return;

    const { variant, id } = deletedVariantsStack[index];
    const insertAt = Math.max(0, Math.min(variant.index, formData.variants.length));

    // Clear the auto-dismiss timeout for this variant
    if (undoTimersRef.current[id]) {
      clearTimeout(undoTimersRef.current[id]);
      delete undoTimersRef.current[id];
    }

    setFormData((prev) => {
      const arr = Array.isArray(prev.variants) ? [...prev.variants] : [];
      arr.splice(insertAt, 0, variant);
      return { ...prev, variants: arr };
    });

    // Remove from undo stack
    setDeletedVariantsStack((prev) => prev.filter((_, i) => i !== index));
    setShowUndoStack((prev) => prev.filter((_, i) => i !== index));

    toast('Variant restored', { icon: '↩️' });
  };

  // Helper: Upload image to server and get URL
  const uploadImageToServer = async (file) => {
    try {
      // Validate file
      if (!file) {
        toast.error('No file selected');
        return null;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return null;
      }

      // Check file type
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        toast.error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
        return null;
      }

      const formData = new FormData();
      formData.append('image', file);

      // Try authenticated endpoint first (with token)
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.post(`${API}/api/upload`, formData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });

          if (res.data.success && res.data.url) {
            toast.success('Image uploaded successfully');
            return res.data.url;
          }
        } catch (authErr) {
          console.error('Authenticated upload failed:', authErr.response?.data?.message || authErr.message);

          // If authentication fails, try public endpoint
          if (authErr.response?.status === 401) {
            console.log('Auth failed, trying public upload endpoint...');
          } else {
            // Log other errors but don't fall back
            throw authErr;
          }
        }
      }

      // Fallback to public endpoint (no authentication required)
      try {
        const res = await axios.post(`${API}/api/upload/public`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (res.data.success && res.data.url) {
          toast.success('Image uploaded successfully');
          return res.data.url;
        }
      } catch (publicErr) {
        console.error('Public upload failed:', publicErr.response?.data?.message || publicErr.message);
        const errorMsg = publicErr.response?.data?.message || 'Failed to upload image. Please try again.';
        toast.error(errorMsg);
        setError(errorMsg);
        return null;
      }

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to upload image';
      console.error('Upload error:', errorMsg);
      toast.error(errorMsg);
      setError(errorMsg);
      return null;
    }
  };

  const handleAddImages = (imageData) => {
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), imageData],
    }));
  };

  const handleRemoveImage = (idx) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== idx),
    });
  };

  const handleReorderImages = (from, to) => {
    if (from === to) return;
    const imgs = Array.isArray(formData.images) ? [...formData.images] : [];
    if (from < 0 || from >= imgs.length) return;
    const [item] = imgs.splice(from, 1);
    imgs.splice(Math.max(0, Math.min(to, imgs.length)), 0, item);
    setFormData({ ...formData, images: imgs });
  };

  const handleMediaLibrarySelect = (imageUrl) => {
    // Route to appropriate handler based on mediaLibraryContext
    if (mediaLibraryContext === 'variant' && selectedVariantForImage) {
      // Update single variant image
      const updatedVariants = formData.variants.map((v) =>
        v.id === selectedVariantForImage.id ? { ...v, image: imageUrl } : v
      );
      setFormData((prev) => ({ ...prev, variants: updatedVariants }));
      toast.success('Variant image updated');
    } else if (mediaLibraryContext === 'group' && selectedGroupForImage) {
      // Update all variants in that group (bulk edit)
      const groupOptionName = selectedGroupForImage.optionName; // e.g., 'Color'
      const groupValue = selectedGroupForImage.name; // e.g., 'Ash'

      // Find all variants that belong to this group by matching the option value
      const updatedVariants = formData.variants.map((v) => {
        const variantGroupValue = v.optionValues?.[groupOptionName];
        if (variantGroupValue === groupValue) {
          return { ...v, image: imageUrl };
        }
        return v;
      });

      // Count how many variants were updated
      const updatedCount = updatedVariants.filter(
        (v) => v.optionValues?.[groupOptionName] === groupValue
      ).length;

      setFormData((prev) => ({ ...prev, variants: updatedVariants }));
      toast.success(`Image applied to ${updatedCount} variant${updatedCount !== 1 ? 's' : ''} in ${groupValue} group`);
    }

    // Close modal and reset context
    setShowMediaLibraryModal(false);
    setMediaLibraryContext(null);
    setSelectedVariantForImage(null);
    setSelectedGroupForImage(null);
  };

  const getTotalStock = (variants) => {
    return variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
  };

  // Helper to ensure image URLs are absolute (prepend API base if needed)
  const getImgSrc = (img) => {
    if (!img) return '';
    try {
      if (typeof img !== 'string') return '';
      return img.startsWith('http') ? img : `${API}${img}`;
    } catch (e) {
      return '';
    }
  };

  // Category Modal Component
  const CategoryModal = ({ show, onClose }) => {
    const [localSelected, setLocalSelected] = React.useState(formData.categories || []);

    React.useEffect(() => setLocalSelected(formData.categories || []), [formData.categories, show]);

    const toggle = (id) => {
      setLocalSelected((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
      );
    };

    const flatten = (items, depth = 0) => {
      // Normalize items to an array. Support:
      // - arrays of categories
      // - objects where values are categories (maps)
      // - a single category object
      if (!items) return [];
      let list = [];
      if (Array.isArray(items)) list = items;
      else if (typeof items === 'object') list = Object.values(items);
      else return [];

      const out = [];
      for (const it of list) {
        if (!it || !it._id) continue;
        out.push({
          _id: it._id,
          name: it.name,
          parent: it.parent,
          _depth: depth,
        });

        // subcategories may be an array or an object map; recurse safely
        if (it.subcategories && (Array.isArray(it.subcategories) || typeof it.subcategories === 'object')) {
          out.push(...flatten(it.subcategories, depth + 1));
        }
      }

      return out;
    };

    if (!show) return null;

    const flat = flatten(categories || []);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-xl w-[min(900px,95%)] max-h-[95vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-white py-3">
            <div className="flex items-center gap-3">
              <i className="fas fa-tags text-xl text-gray-700"></i>
              <div>
                <h3 className="text-lg font-semibold">Select Categories</h3>
                <p className="text-xs text-gray-900">Choose which categories this product should belong to</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
                aria-label="Close categories modal"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>

          <div className="mb-4">
            <input
              type="search"
              placeholder="Search categories..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none"
              onChange={(e) => {
                // lightweight client-side filter (visual only)
                const q = e.target.value.trim().toLowerCase();
                // Add a data attribute used by CSS/DOM filtering will be applied by browser
                // Keep functionality unchanged; this is purely presentational
                document.querySelectorAll('[data-cat-name]').forEach((el) => {
                  const name = el.getAttribute('data-cat-name') || '';
                  el.style.display = name.toLowerCase().includes(q) ? '' : 'none';
                });
              }}
            />
          </div>

          <div className="grid gap-2">
            {flat && flat.length > 0 ? (
              flat.map((cat) => (
                <label
                  key={`cat-${cat._id}`}
                  data-cat-name={cat.name}
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-white border border-gray-100 rounded-lg cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={localSelected.includes(cat._id)}
                    onChange={() => toggle(cat._id)}
                    className="w-4 h-4 cursor-pointer text-gray-700"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-gray-800 font-medium">{cat.name}</div>
                    {cat._depth ? <div className="text-xs text-gray-400">{Array(cat._depth).fill('· ').join('')}</div> : null}
                  </div>
                </label>
              ))
            ) : (
              <p className="text-gray-900 text-sm py-4">No categories available</p>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ ...formData, categories: localSelected });
                onClose();
              }}
              className="px-4 py-2 rounded bg-[var(--color-accent-primary)] text-white hover:bg-black"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal components are now imported from separate files
  // - MediaLibraryModal from '../../components/MediaLibraryModal/MediaLibraryModal'

  // Add Variant Modal Component
  // Add Variant Modal Component
  const AddVariantModal = ({ show, onClose }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-2xl w-[min(500px,95%)] p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Add New Variant</h3>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
            >
              <i className="fas fa-times" style={{ fontSize: '20px' }}></i>
            </button>
          </div>

          {formData.options.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No options added yet.</p>
              <p className="text-sm text-gray-500">Add options (like Size, Color) first to create variants.</p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {formData.options.map((opt) => (
                <div key={opt.name}>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {opt.name}
                  </label>
                  <select
                    value={newVariantOptions[opt.name] || ''}
                    onChange={(e) =>
                      setNewVariantOptions((prev) => ({
                        ...prev,
                        [opt.name]: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                  >
                    <option value="">Select {opt.name}</option>
                    {opt.values.map((val) => (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmAddVariant}
              disabled={
                formData.options.length === 0 ||
                formData.options.some((opt) => !newVariantOptions[opt.name])
              }
              className="px-4 py-2 rounded bg-[var(--color-accent-primary)] text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Variant
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => handleNavigation(() => navigate('/admin/products'))}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <i className="fas fa-arrow-left"></i> Back
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full">
            <h1 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>

            {/* Status and Save/Discard buttons */}
            <div className="ml-auto flex items-center gap-3">
              {/* Save status indicator */}
              {saveStatus === 'saving' && (
                <span className="text-sm text-gray-600">Saving...</span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-sm text-green-600 font-semibold">Saved</span>
              )}

              {/* Status select dropdown */}
              <select
                value={formData.isDraft ? 'draft' : 'published'}
                onChange={(e) => setFormData({ ...formData, isDraft: e.target.value === 'draft' })}
                className="px-3 py-1 rounded-lg text-sm font-semibold border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800"
              >
                <option value="published">Active</option>
                <option value="draft">Draft</option>
              </select>

              {/* Save button */}
              <button
                onClick={() => handleSubmit(null, !formData.isDraft)}
                disabled={loading || Boolean(comparePriceError) || (saveStatus === 'saved' && !hasUnsavedChanges())}
                className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save'}
              </button>

              {/* Preview button - Only show after save */}
              {saveStatus === 'saved' && formData.slug && (
                <a
                  href={`/product/${formData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition"
                >
                  <i className="fas fa-eye"></i>
                  <span>Preview</span>
                </a>
              )}

              {/* Discard button */}
              {!(saveStatus === 'saved' && !hasUnsavedChanges()) && (
                <button
                  onClick={() => handleNavigation(() => navigate('/admin/products'))}
                  className="px-4 py-1 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-semibold transition"
                >
                  Discard
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-gray-100 border border-gray-400 text-gray-800 rounded">
            {error}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-4">
          {/* Basic Information Section */}
          <div className="mb-8">
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                  placeholder="Enter product name"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-900">£</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Compare Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-900">£</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.comparePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, comparePrice: e.target.value })
                      }
                      className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 outline-none ${comparePriceError ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-gray-800'}`}
                      placeholder="0.00"
                    />
                    {comparePriceError && (
                      <p className="text-xs text-gray-700 mt-1">{comparePriceError}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                  placeholder="product-url-slug"
                />
                <p className="text-xs text-gray-900 mt-1">Auto-generated if empty</p>
              </div>

              {/* Redirect Section - Show when slug has changed */}
              {isEditing && originalSlug && formData.slug && originalSlug.toLowerCase() !== formData.slug.toLowerCase() && (
                <div className="border-t pt-4 bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="space-y-3 p-3 bg-white rounded border border-amber-300 mb-3">
                    <div>
                      <p className="text-xs font-semibold mb-2 text-gray-900">Old URL (from):</p>
                      <p className="text-sm p-2 bg-gray-100 rounded text-gray-900">
                        /product/{originalSlug}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-2 text-gray-900">New URL (to):</p>
                      <p className="text-sm p-2 bg-gray-100 rounded text-gray-900">
                        /product/{formData.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="createRedirect"
                      checked={shouldCreateRedirect}
                      onChange={(e) => setShouldCreateRedirect(e.target.checked)}
                      className="w-4 h-4 border border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="createRedirect" className="text-sm font-semibold text-gray-900 cursor-pointer">
                      Redirect old slug to new slug?
                    </label>
                  </div>
                  {shouldCreateRedirect && (
                    <p className="text-xs mt-2 text-gray-600">✓ Redirect will be created automatically when you save</p>
                  )}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-900">
                    Categories
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="inline-flex items-center gap-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full border border-gray-300 shadow-sm hover:shadow"
                    aria-label="Select categories"
                  >
                    <i className="fas fa-tags text-gray-700"></i>
                    <span className="font-medium">Select Categories</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.categories || []).map((catId) => {
                    const categoryNameMap = getCategoryNameMap();
                    const categoryName = categoryNameMap[catId] || catId;
                    return (
                      <span
                        key={`chip-${catId}`}
                        className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1 rounded-full text-sm font-semibold shadow-sm"
                      >
                        <span className="text-gray-700 text-xs">{categoryName && categoryName[0]}</span>
                        <span className="text-indigo-800">{categoryName}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              categories: (formData.categories || []).filter(
                                (c) => c !== catId
                              ),
                            })
                          }
                          className="text-gray-900 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
                          aria-label={`Remove category ${categoryName}`}
                        >
                          <i className="fas fa-times" style={{ fontSize: '12px' }}></i>
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(html) =>
                    setFormData({ ...formData, description: html })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Benefits Section Heading
                </label>
                <input
                  type="text"
                  value={formData.benefitsHeading}
                  onChange={(e) => setFormData({ ...formData, benefitsHeading: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none mb-4"
                  placeholder=" "
                />
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Benefits Description
                </label>
                <RichTextEditor
                  value={formData.benefitsText}
                  onChange={(html) =>
                    setFormData({ ...formData, benefitsText: html })
                  }
                />
                <p className="text-xs text-gray-900 mt-2">Use the editor to format your benefits with headings, bullets, and bold text. These will be displayed beautifully on the product page.</p>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="mb-8 pb-8 border-b">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Media</h2>
            <div className="grid grid-cols-6 gap-3">
              {/* Main Image - Left Side */}
              <div className="col-span-1">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Main</label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 w-full aspect-square flex items-center justify-center relative"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const idx = e.dataTransfer.getData('text/plain');
                    if (idx) {
                      handleReorderImages(Number(idx), 0);
                    }
                  }}
                >
                  {formData.images && formData.images[0] ? (
                    <div className="relative w-full h-full">
                      <img
                        src={getImgSrc(formData.images[0])}
                        alt="Main"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(0)}
                        className="absolute top-2 right-2 bg-gray-700 text-white p-1.5 rounded-full hover:bg-[var(--color-accent-primary)]"
                        aria-label="Remove main image"
                      >
                        <i className="fas fa-times" style={{ fontSize: '16px' }}></i>
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-full h-full cursor-pointer hover:bg-gray-100 transition">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files) {
                            Array.from(files).forEach(async (file) => {
                              const imageUrl = await uploadImageToServer(file);
                              if (imageUrl) {
                                handleAddImages(imageUrl);
                              }
                            });
                          }
                        }}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-2 text-gray-600">
                        <i className="fas fa-cloud-upload-alt text-3xl text-gray-700"></i>
                        <span className="text-xs font-semibold text-center">Drop or click to add images</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Gallery Images - Right Side */}
              <div className="col-span-5">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Gallery images</label>

                {(() => {
                  const imgs = formData.images || [];
                  const displayImages = imgs.slice(1, 20); // Show images 1-11 (full 2 rows)
                  const remainingCount = Math.max(0, imgs.length - 20);

                  return (
                    <div className="space-y-2">
                      {/* Images - Limited to 2 rows */}
                      <div className="flex flex-wrap gap-2">
                        {displayImages.map((img, idx) => {
                          const actualIdx = idx + 1;
                          return (
                            <div
                              key={actualIdx}
                              className="relative group h-20 aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-grab border border-gray-200"
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/plain', String(actualIdx));
                              }}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const from = Number(e.dataTransfer.getData('text/plain'));
                                if (!isNaN(from)) handleReorderImages(from, actualIdx);
                              }}
                              onDoubleClick={() => handleReorderImages(actualIdx, 0)}
                            >
                              <img src={getImgSrc(img)} alt={`Gallery ${actualIdx}`} className="w-full h-full object-contain" />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(actualIdx)}
                                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                aria-label="Remove image"
                              >
                                <i className="fas fa-times" style={{ fontSize: '12px' }}></i>
                              </button>
                            </div>
                          );
                        })}

                        {/* Show remaining count if there are more images */}
                        {remainingCount > 0 && (
                          <div className="h-20 aspect-square rounded-lg overflow-hidden bg-gray-600 flex items-center justify-center border border-gray-400">
                            <span className="text-white font-bold text-lg">+{remainingCount}</span>
                          </div>
                        )}

                        {/* Media Library Button */}
                        <button
                          type="button"
                          onClick={() => setShowAllImagesModal(true)}
                          className="flex items-center justify-center h-20 aspect-square rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-800 transition bg-white"
                        >
                          <span className="text-2xl">📁</span>
                        </button>

                        {/* Upload Now Button */}
                        <label className="flex items-center justify-center h-20 aspect-square rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-800 transition bg-white">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files) {
                                Array.from(files).forEach(async (file) => {
                                  const imageUrl = await uploadImageToServer(file);
                                  if (imageUrl) {
                                    handleAddImages(imageUrl);
                                  }
                                });
                              }
                            }}
                            className="hidden"
                          />
                          <span className="text-2xl">⬆️</span>
                        </label>
                      </div>
                    </div>
                  );
                })()}

              </div>

            </div>
          </div>

          {/* Variants Section */}
          <div className="mb-8 pb-8 border-b">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Variants & Options</h2>

            {/* Options Panel */}
            <div className="bg-gray-50 border rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => setOptionsOpen((s) => !s)}
                  className="flex items-center gap-2"
                >
                  <span
                    className={`transform transition-transform ${optionsOpen ? 'rotate-90' : ''
                      }`}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </span>
                  <h3 className="text-lg font-bold">Options</h3>
                </button>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="flex items-center gap-2 bg-[var(--color-accent-primary)] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-black"
                  aria-label="Add option"
                >
                  <i className="fas fa-plus" style={{ fontSize: 'inherit' }}></i>
                  <span className="hidden sm:inline-block">Add Option</span>
                </button>
              </div>

              {optionsOpen && formData.options.length === 0 && (
                <p className="text-sm text-gray-900 mb-3">
                  Add an option (e.g., Size, Color) then add its values.
                </p>
              )}

              {optionsOpen && (
                <div className="space-y-3">
                  {formData.options.map((opt, idx) => {
                    const optKey = opt.name || `opt-${idx}`;
                    const isOptOpen = !!optionCollapsed[optKey]; // true = open, false/undefined = closed by default
                    return (
                      <div key={idx} className="bg-white border rounded p-3">
                        <div className="flex items-center justify-between ">
                          <div className="flex items-center gap-2 flex-1">
                            <button
                              type="button"
                              onClick={() => toggleOptionCollapse(optKey)}
                              className="p-1"
                            >
                              <i className="fas fa-chevron-down" style={{
                                display: 'inline-block',
                                transition: 'transform 0.2s',
                                transform: isOptOpen ? 'rotateZ(0deg)' : 'rotateZ(-90deg)'
                              }}></i>
                            </button>
                            <input
                              type="text"
                              value={opt.name}
                              onChange={(e) =>
                                handleUpdateOptionName(idx, e.target.value)
                              }
                              placeholder="Option name (e.g., Size)"
                              className="px-3 py-2 border rounded flex-1"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="text-gray-700 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100 transition"
                            aria-label="Remove option"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>

                        {isOptOpen && (
                          <>
                            <div className="flex gap-2 items-center mb-2">
                              <input
                                type="text"
                                placeholder={`Add ${opt.name || 'value'}`}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddOptionValue(idx, e.target.value.trim());
                                    e.target.value = '';
                                  }
                                }}
                                className="flex-1 px-3 py-2 border rounded"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  const input = e.target
                                    .closest('.flex')
                                    ?.querySelector('input');
                                  if (input && input.value) {
                                    handleAddOptionValue(idx, input.value.trim());
                                    input.value = '';
                                  }
                                }}
                                className="bg-[var(--color-accent-primary)] text-white px-4 py-2 rounded text-sm font-medium hover:bg-black"
                              >
                                Add Value
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {opt.values.map((v, vi) => (
                                <span
                                  key={vi}
                                  className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm inline-flex items-center gap-2"
                                >
                                  {v}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOptionValue(idx, vi)}
                                    className="text-gray-700 hover:text-gray-900 font-bold p-0.5 rounded-full hover:bg-gray-100 transition"
                                    aria-label={`Remove value ${v}`}
                                  >
                                    <i className="fas fa-minus" style={{ fontSize: 'inherit' }}></i>
                                  </button>
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}


            </div>

            {/* Variants Panel */}
            {formData.variants.length > 0 && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => setVariantsOpen((s) => !s)}
                    className="flex items-center gap-2"
                  >
                    <span
                      className={`transform transition-transform ${variantsOpen ? 'rotate-90' : ''
                        }`}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </span>
                    <h3 className="text-lg font-bold">
                      Variants ({formData.variants.length})
                    </h3>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddVariant();
                      setVariantsOpen(true);
                    }}
                    className="bg-[var(--color-accent-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black"
                  >
                    Add Variant
                  </button>
                </div>

                {variantsOpen && (
                  <>
                    {/* Search and Group Controls */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="relative flex-1">
                        <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                        <input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search variants..."
                          className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Group by</label>
                        <select
                          value={groupBy}
                          onChange={(e) => setGroupBy(e.target.value)}
                          className="px-3 py-2 border rounded-lg"
                        >
                          {formData.options.map((opt) =>
                            opt.name ? (
                              <option key={opt.name} value={opt.name}>
                                {opt.name}
                              </option>
                            ) : null
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Variants Grouped View */}
                    <div className="overflow-x-auto">
                      <div className="space-y-4">
                        {(() => {
                          // Build groups keyed by selected option value
                          const groups = {};
                          const opts = formData.variants || [];
                          const search = (searchTerm || '').trim().toLowerCase();
                          opts.forEach((v) => {
                            // If a search term is active, filter variants by SKU, name, or formatted option values
                            if (search) {
                              const hay = `${v.sku || ''} ${v.name || ''} ${formatOptionValues(v.optionValues) || ''}`.toLowerCase();
                              if (!hay.includes(search)) return;
                            }
                            const key = (v.optionValues && v.optionValues[groupBy]) || '—';
                            if (!groups[key]) groups[key] = [];
                            groups[key].push(v);
                          });

                          // Sort groups by name
                          let ordered = Object.keys(groups).sort((a, b) => String(a).localeCompare(String(b)));

                          // If a priority group is selected, ensure it appears first
                          if (priorityGroup && groups[priorityGroup] && ordered.includes(priorityGroup)) {
                            ordered = [priorityGroup, ...ordered.filter((k) => k !== priorityGroup)];
                          }

                          return ordered.map((grp) => {
                            const variantsInGroup = groups[grp];
                            const isGroupOpen = !!collapsedGroups[grp]; // true = open, false/undefined = closed by default
                            const key = normalizeKey(grp);
                            return (
                              <div key={`group-${key}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => toggleGroup(grp)}
                                      className={`p-2 ${isGroupOpen ? 'rotate-90' : ''}`}
                                      aria-expanded={isGroupOpen}
                                    >
                                      <i className="fas fa-chevron-right"></i>
                                    </button>
                                    <div>
                                      <div className="text-lg font-bold">{grp}</div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-900">{variantsInGroup.length} variant(s)</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <label className="text-xs text-gray-600 font-semibold">Price:</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Price"
                                        value={(groupBulkInputs?.[key]?.price) ?? ''}
                                        onChange={(e) => {
                                          handleGroupInputChange(grp, 'price', e.target.value);
                                          applyGroupField(grp, 'price', e.target.value);
                                        }}
                                        className="w-24 px-2 py-1 border rounded text-sm"
                                      />
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <label className="text-xs text-gray-600 font-semibold">Stock:</label>
                                      <input
                                        type="number"
                                        placeholder="Stock"
                                        value={(groupBulkInputs?.[key]?.stock) ?? ''}
                                        onChange={(e) => {
                                          handleGroupInputChange(grp, 'stock', e.target.value);
                                          applyGroupField(grp, 'stock', e.target.value);
                                        }}
                                        className="w-20 px-2 py-1 border rounded text-sm"
                                      />
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <label
                                        className="flex flex-col items-center gap-2 cursor-pointer group relative h-10 px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 transition"
                                        onDragOver={(e) => {
                                          e.preventDefault();
                                          e.currentTarget.classList.add('opacity-75', 'ring-2', 'ring-gray-600');
                                        }}
                                        onDragLeave={(e) => {
                                          e.currentTarget.classList.remove('opacity-75', 'ring-2', 'ring-gray-600');
                                        }}
                                        onDrop={(e) => {
                                          e.preventDefault();
                                          e.currentTarget.classList.remove('opacity-75', 'ring-2', 'ring-gray-600');

                                          // Try to get image data from gallery drag
                                          const imageData = e.dataTransfer.getData('text/plain');
                                          if (imageData && (imageData.startsWith('/') || imageData.startsWith('http'))) {
                                            // Store the uploaded image URL directly
                                            handleGroupInputChange(grp, 'image', imageData);
                                            applyGroupField(grp, 'image', imageData);
                                          } else if (imageData && imageData.startsWith('data:')) {
                                            // If it's already a data URL, use it as-is
                                            handleGroupInputChange(grp, 'image', imageData);
                                            applyGroupField(grp, 'image', imageData);
                                          } else {
                                            // Fallback: try to read file if dragging from file system - upload to server
                                            const files = e.dataTransfer.files;
                                            if (files && files[0]) {
                                              const file = files[0];
                                              uploadImageToServer(file).then((url) => {
                                                if (url) {
                                                  handleGroupInputChange(grp, 'image', url);
                                                  applyGroupField(grp, 'image', url);
                                                }
                                              });
                                            }
                                          }
                                        }}
                                        onClick={() => {
                                          setSelectedGroupForImage({ name: grp, optionName: groupBy });
                                          setMediaLibraryContext('group');
                                          setShowMediaLibraryModal(true);
                                        }}
                                      >
                                        <span className="text-xs text-gray-700 hover:underline font-semibold">Gallery & Drag</span>
                                      </label>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleAddVariant()}
                                      className="flex items-center gap-2 bg-[var(--color-accent-primary)] text-white px-3 py-1 rounded text-sm font-medium hover:bg-black transition"
                                      aria-label="Add variant to group"
                                    >
                                      <i className="fas fa-plus text-xs"></i>
                                      <span className="hidden sm:inline-block">Add Variant</span>
                                    </button>
                                  </div>
                                </div>

                                {isGroupOpen && (
                                  <div className="grid grid-cols-2 gap-3">
                                    {/* Undo deleted variants from this group */}
                                    {deletedVariantsStack.map((deletedItem, idx) =>
                                      deletedItem.groupKey === key && showUndoStack[idx] ? (
                                        <div key={`undo-${deletedItem.timestamp}`} className="col-span-2 bg-gray-100 border border-gray-300 rounded-lg p-3 flex items-center justify-between">
                                          <div className="text-sm text-gray-800 font-medium">
                                            Variant <span className="font-semibold">{formatOptionValues(deletedItem.variant.optionValues)}</span> deleted
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => handleUndoDelete(idx)}
                                            className="px-4 py-1.5 bg-[var(--color-accent-primary)] hover:bg-black text-white rounded text-sm font-semibold transition"
                                          >
                                            ↩️ Undo
                                          </button>
                                        </div>
                                      ) : null
                                    )}
                                    {variantsInGroup.map((variant) => {
                                      const origIndex = formData.variants.findIndex((v) => v.id === variant.id);
                                      return (
                                        <div key={variant.id} className="relative border border-gray-200 rounded-lg p-3 bg-white flex gap-3 h-full shadow-sm hover:shadow-md transition">
                                          {/* Left: Option values and 3 columns (SKU, Price, Stock) */}
                                          <div className="flex-1 flex flex-col ">
                                            {/* Header: Option values */}
                                            <div className="text-sm text-gray-600 font-medium">{formatOptionValues(variant.optionValues)}</div>

                                            {/* 3 columns: SKU, Price, Stock */}
                                            <div className="grid grid-cols-3 gap-2">
                                              <div>
                                                <label className="text-xs text-gray-900 font-semibold">SKU</label>
                                                <input
                                                  type="text"
                                                  value={variant.sku || ''}
                                                  onChange={(e) => handleUpdateVariant(variant.id, { sku: e.target.value })}
                                                  placeholder="SKU"
                                                  className="w-full px-2 py-1 border rounded text-sm"
                                                />
                                              </div>
                                              <div>
                                                <label className="text-xs text-gray-900 font-semibold">Price</label>
                                                <input
                                                  type="number"
                                                  step="0.01"
                                                  value={variant.price || ''}
                                                  onChange={(e) => handleUpdateVariant(variant.id, { price: e.target.value })}
                                                  placeholder="Price"
                                                  className="w-full px-2 py-1 border rounded text-sm"
                                                />
                                              </div>
                                              <div>
                                                <label className="text-xs text-gray-900 font-semibold">Stock</label>
                                                <input
                                                  type="number"
                                                  value={variant.stock || 0}
                                                  onChange={(e) => handleUpdateVariant(variant.id, { stock: parseInt(e.target.value) || 0 })}
                                                  placeholder="Stock"
                                                  className="w-full px-2 py-1 border rounded text-sm"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                          {/* Right: Image area with drag/gallery option */}
                                          <div className="flex flex-col gap-2 h-20 w-24">
                                            <label
                                              className="flex flex-col gap-2 cursor-pointer group relative h-24"
                                              onDragOver={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.classList.add('opacity-75', 'ring-2', 'ring-gray-600');
                                              }}
                                              onDragLeave={(e) => {
                                                e.currentTarget.classList.remove('opacity-75', 'ring-2', 'ring-gray-600');
                                              }}
                                              onDrop={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.classList.remove('opacity-75', 'ring-2', 'ring-gray-600');

                                                // Try to get image data from gallery drag
                                                const imageData = e.dataTransfer.getData('text/plain');
                                                if (imageData && (imageData.startsWith('/') || imageData.startsWith('http'))) {
                                                  // Store the uploaded image URL directly
                                                  handleUpdateVariant(variant.id, { image: imageData });
                                                } else if (imageData && imageData.startsWith('data:')) {
                                                  // If it's already a data URL, use it as-is
                                                  handleUpdateVariant(variant.id, { image: imageData });
                                                } else {
                                                  // Fallback: try to read file if dragging from file system - but this would need upload
                                                  const files = e.dataTransfer.files;
                                                  if (files && files[0]) {
                                                    const file = files[0];
                                                    // Upload the file to server instead of converting to data URL
                                                    uploadImageToServer(file).then((url) => {
                                                      if (url) {
                                                        handleUpdateVariant(variant.id, { image: url });
                                                      }
                                                    });
                                                  }
                                                }
                                              }}
                                              onClick={() => {
                                                setSelectedVariantForImage(variant);
                                                setMediaLibraryContext('variant');
                                                setShowMediaLibraryModal(true);
                                              }}
                                            >

                                              {variant.image ? (
                                                <img src={getImgSrc(variant.image)} alt="v" className="w-full h-full object-cover rounded border border-gray-300 group-hover:opacity-75 transition" onError={(e) => { e.target.style.display = 'none'; }} />
                                              ) : (
                                                <div className="w-full h-full bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-900 group-hover:bg-gray-50 group-hover:border-blue-400 transition text-center px-1">
                                                  Drag or Gallery
                                                </div>
                                              )}
                                            </label>
                                          </div>

                                          {/* Delete button - top right */}
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteVariantWithUndo(variant.id, origIndex)}
                                            className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition"
                                            aria-label="Delete variant"
                                          >
                                            <i className="fas fa-trash text-sm"></i>
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <SEOMetaForm
            metaTitle={formData.metaTitle}
            metaDescription={formData.metaDescription}
            metaKeywords={formData.metaKeywords}
            onChange={(field, value) => setFormData({ ...formData, [field]: value })}
            defaultTitle={formData.name}
          />

          {/* Form Actions */}
          <div className="flex gap-4 justify-end items-center">
            {/* Save status indicator */}
            {saveStatus === 'saving' && (
              <span className="text-sm text-gray-600">Saving...</span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-sm text-green-600 font-semibold">Saved</span>
            )}

            {!(saveStatus === 'saved' && !hasUnsavedChanges()) && (
              <button
                type="button"
                onClick={() => {
                  if (isEditing && originalFormData) {
                    // Discard changes on edit - restore original data
                    setFormData(originalFormData);
                    toast('Changes discarded', {
                      icon: '↩️',
                    });
                  } else {
                    // Cancel on create - go back to products with unsaved changes check
                    handleNavigation(() => navigate('/admin/products'));
                  }
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                {isEditing ? 'Discard' : 'Cancel'}
              </button>
            )}
            {formData.isDraft ? (
              <button
                type="button"
                onClick={() => handleSubmit(null, false)}
                disabled={loading || Boolean(comparePriceError) || (saveStatus === 'saved' && !hasUnsavedChanges())}
                className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-900 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-check"></i> {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : (isEditing ? 'Save Draft' : 'Save Draft')}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || Boolean(comparePriceError) || (saveStatus === 'saved' && !hasUnsavedChanges())}
                className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent-primary)] hover:bg-black text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-check"></i> {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : (isEditing ? 'Save' : 'Publish')}
              </button>
            )}
          </div>
        </form>
      </div >

      {/* Category Modal */}
      < CategoryModal show={showCategoryModal} onClose={() => setShowCategoryModal(false)} />

      {/* All Images Modal - Select images for product gallery */}
      <MediaLibraryModal
        show={showAllImagesModal}
        onClose={() => setShowAllImagesModal(false)}
        onSelectImage={(imageUrl) => {
          handleAddImages(imageUrl);
          toast.success('Image added to gallery');
        }}
        productImages={(formData.images || []).slice(1)}
        variantImages={(formData.variants || []).filter(v => v.image).map(v => v.image)}
        groupImages={(formData.options || []).flatMap(opt =>
          (opt.groups || []).filter(grp => grp.image).map(grp => grp.image)
        )}
        uploadImageToServer={uploadImageToServer}
        title="All Gallery Images"
        subtitle="Browse all product, variant, group images and media library"
      />

      {/* Media Library Modal - Select images for variants/groups */}
      <MediaLibraryModal
        show={showMediaLibraryModal}
        onClose={() => {
          setShowMediaLibraryModal(false);
          setMediaLibraryContext(null);
          setSelectedVariantForImage(null);
          setSelectedGroupForImage(null);
        }}
        onSelectImage={handleMediaLibrarySelect}
        productImages={formData.images || []}
        variantImages={(formData.variants || []).filter(v => v.image).map(v => v.image)}
        groupImages={(formData.options || []).flatMap(opt =>
          (opt.groups || []).filter(grp => grp.image).map(grp => grp.image)
        )}
        uploadImageToServer={uploadImageToServer}
        title="Select Image"
        subtitle="Choose from product, variant, group images or media library"
        defaultTab="media"
      />

      {/* Add Variant Modal */}
      <AddVariantModal show={showAddVariantModal} onClose={() => setShowAddVariantModal(false)} />

    </div >
  );
};

export default AdminAddProductPage;
