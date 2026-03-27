'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const MediaLibraryModal = ({
  show,
  onClose,
  onSelectImage,
  productImages = [],
  variantImages = [],
  groupImages = [],
  uploadImageToServer,
  title = 'Select Image',
  subtitle = 'Choose from product images or media library'
}) => {
  const API = import.meta.env.VITE_API_URL || '';

  // States
  const [token, setToken] = useState('');
  const [mediaAssets, setMediaAssets] = useState([]);
  const [uploadedAssets, setUploadedAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('image');

  // Get token from localStorage on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token') || '');
    }
  }, []);

  // Refs for tracking
  const lastFetchRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Fetch media library with proper deduplication
  const resolveUrl = useCallback((url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${API}${url}`;
  }, [API]);

  const buildLocalAsset = useCallback((url, source, index) => ({
    _id: `${source}-${index}-${url}`,
    rawUrl: url,
    previewUrl: resolveUrl(url),
    filename: url.split('/').pop() || `${source}-${index + 1}`,
    type: 'image',
    source,
  }), [resolveUrl]);

  const fetchMediaLibrary = useCallback(async (filter, search) => {
    try {
      setLoading(true);
      abortControllerRef.current = new AbortController();

      const params = new URLSearchParams();
      params.append('all', 'true');
      params.append('type', filter);
      if (search) params.append('search', search);

      const response = await axios.get(`${API}/api/media?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: abortControllerRef.current.signal,
      });

      if (response.data.success) {
        setMediaAssets((response.data.assets || []).map((asset) => ({
          ...asset,
          rawUrl: asset.url,
          previewUrl: resolveUrl(asset.url),
          source: 'library',
        })));
      } else {
        setMediaAssets([]);
      }
    } catch (err) {
      if (err.name !== 'CanceledError') {
        console.error('Failed to fetch media:', err);
        toast.error('Failed to load media library');
      }
    } finally {
      setLoading(false);
    }
  }, [API, resolveUrl, token]);

  // Effect to handle modal open/close state
  useEffect(() => {
    if (!show) {
      setSearchTerm('');
      setFilterType('image');
      setUploadedAssets([]);
      lastFetchRef.current = null;
    }
  }, [show]);

  // Effect to handle media library fetching
  useEffect(() => {
    if (!show) return;

    const fetchKey = `${filterType}-${searchTerm}`;
    if (lastFetchRef.current === fetchKey) return;

    lastFetchRef.current = fetchKey;
    fetchMediaLibrary(filterType, searchTerm);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [show, filterType, searchTerm, fetchMediaLibrary]);

  // Handle upload
  const handleUploadImage = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const newUploads = [];
      for (const file of files) {
        const uploadedUrl = await uploadImageToServer(file);
        if (uploadedUrl) {
          newUploads.push({
            _id: `uploaded-${Date.now()}-${file.name}-${newUploads.length}`,
            rawUrl: uploadedUrl,
            previewUrl: resolveUrl(uploadedUrl),
            filename: file.name,
            type: 'image',
            source: 'uploaded',
          });
        }
      }
      if (newUploads.length > 0) {
        setUploadedAssets((prev) => [...newUploads, ...prev]);
      }
      lastFetchRef.current = null;
      await fetchMediaLibrary(filterType, searchTerm);
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload some images');
    } finally {
      setUploading(false);
    }
  };

  const combinedAssets = [
    ...uploadedAssets,
    ...productImages.map((img, index) => buildLocalAsset(img, 'product', index)),
    ...variantImages.map((img, index) => buildLocalAsset(img, 'variant', index)),
    ...groupImages.map((img, index) => buildLocalAsset(img, 'group', index)),
    ...mediaAssets,
  ].filter((asset) => {
    const matchesSearch = !searchTerm || asset.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === '' || asset.type === filterType;
    return matchesSearch && matchesType;
  }).filter((asset, index, array) => {
    return array.findIndex((item) => item.previewUrl === asset.previewUrl) === index;
  });

  const getSourceLabel = (source) => {
    if (source === 'product') return 'Product';
    if (source === 'variant') return 'Variant';
    if (source === 'group') return 'Group';
    if (source === 'uploaded') return 'New';
    return 'Library';
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-[min(1200px,95%)] h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-200 rounded-lg"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 space-y-3">
          {/* Search & Filter */}
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search by filename..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFilterType('image');
                }}
                className={`px-4 py-2.5 rounded-lg font-medium transition ${filterType === 'image'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <i className="fas fa-image mr-2"></i>Images
              </button>
              <button
                onClick={() => {
                  setFilterType('');
                }}
                className={`px-4 py-2.5 rounded-lg font-medium transition ${filterType === ''
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                All
              </button>
            </div>

            {/* Upload Button */}
            <label className="px-4 py-2.5 bg-[var(--color-accent-primary)] hover:bg-blue-700 text-white rounded-lg font-medium transition cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50">
              <i className="fas fa-cloud-upload-alt"></i>
              <span>Upload</span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleUploadImage}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          <div className="text-sm text-gray-600">
            Showing everything in one library: product, variant, group, and uploaded media.
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-6">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-100">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-[var(--color-accent-primary)] rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600 font-medium">Loading media library...</p>
              </div>
            </div>
          ) : combinedAssets.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 text-lg">No media found</p>
                <p className="text-gray-400 text-sm mt-2">Upload some images to get started</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {combinedAssets.map((asset) => (
                <div
                  key={asset._id}
                  onClick={() => onSelectImage(asset.rawUrl)}
                  className="group relative rounded-lg overflow-hidden bg-white border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition h-32 shadow-sm hover:shadow-md"
                >
                  {asset.type === 'image' ? (
                    <img
                      src={asset.previewUrl}
                      alt={asset.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                      onError={(e) => (e.target.src = '/placeholder.png')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <i className="fas fa-video text-2xl text-gray-500"></i>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <i className="fas fa-check text-white text-2xl"></i>
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 text-gray-900 text-[11px] font-semibold rounded">
                    {getSourceLabel(asset.source)}
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-1 bg-gray-900 text-white text-xs font-semibold rounded">
                    {asset.type === 'image' ? 'IMG' : 'VID'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaLibraryModal;
