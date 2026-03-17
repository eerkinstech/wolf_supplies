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
  subtitle = 'Choose from product images or media library',
  defaultTab = 'product'
}) => {
  const API = import.meta.env.VITE_API_URL || '';

  // States
  const [token, setToken] = useState('');
  const [mediaAssets, setMediaAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('image');
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [mediaPage, setMediaPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
  const fetchMediaLibrary = useCallback(async (page, filter, search) => {
    try {
      setLoading(true);
      abortControllerRef.current = new AbortController();

      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 24);
      params.append('type', filter);
      if (search) params.append('search', search);

      const response = await axios.get(`${API}/api/media?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: abortControllerRef.current.signal,
      });

      if (response.data.success) {
        setMediaAssets(response.data.assets || []);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        setMediaAssets([]);
        setTotalPages(1);
      }
    } catch (err) {
      if (err.name !== 'CanceledError') {
        console.error('Failed to fetch media:', err);
        toast.error('Failed to load media library');
      }
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  // Effect to handle modal open/close state
  useEffect(() => {
    if (!show) {
      setActiveTab(defaultTab);
      setMediaPage(1);
      setSearchTerm('');
      setFilterType('image');
      lastFetchRef.current = null;
    } else {
      // When modal opens, reset to default tab
      setActiveTab(defaultTab);
    }
  }, [show, defaultTab]);

  // Effect to handle media library fetching
  useEffect(() => {
    if (!show || activeTab !== 'media') return;

    const fetchKey = `${mediaPage}-${filterType}-${searchTerm}`;
    if (lastFetchRef.current === fetchKey) return;

    lastFetchRef.current = fetchKey;
    fetchMediaLibrary(mediaPage, filterType, searchTerm);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [show, activeTab, mediaPage, filterType, searchTerm, fetchMediaLibrary]);

  // Handle upload
  const handleUploadImage = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        await uploadImageToServer(file);
      }
      setMediaPage(1);
      setSearchTerm('');
      setFilterType('image');
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload some images');
    } finally {
      setUploading(false);
    }
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
                  setMediaPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFilterType('image');
                  setMediaPage(1);
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
                  setMediaPage(1);
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
            <label className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50">
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

          {/* Tabs */}
          <div className="flex gap-6 border-b border-gray-200 -mb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('product')}
              className={`px-4 py-3 font-semibold transition border-b-2 whitespace-nowrap ${activeTab === 'product'
                ? 'border-blue-600 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              <i className="fas fa-images mr-2"></i>Product ({productImages.length})
            </button>
            {variantImages.length > 0 && (
              <button
                onClick={() => setActiveTab('variants')}
                className={`px-4 py-3 font-semibold transition border-b-2 whitespace-nowrap ${activeTab === 'variants'
                  ? 'border-blue-600 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                <i className="fas fa-layer-group mr-2"></i>Variants ({variantImages.length})
              </button>
            )}
            {groupImages.length > 0 && (
              <button
                onClick={() => setActiveTab('groups')}
                className={`px-4 py-3 font-semibold transition border-b-2 whitespace-nowrap ${activeTab === 'groups'
                  ? 'border-blue-600 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                <i className="fas fa-object-group mr-2"></i>Groups ({groupImages.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab('media')}
              className={`px-4 py-3 font-semibold transition border-b-2 whitespace-nowrap ${activeTab === 'media'
                ? 'border-blue-600 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              <i className="fas fa-library mr-2"></i>Media Library
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-6">
          {activeTab === 'product' ? (
            // Product Images Tab
            <>
              {productImages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-image text-6xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500 text-lg">No product images yet</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {productImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSelectImage(img)}
                      className="group relative rounded-lg overflow-hidden bg-white border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition h-28 shadow-sm hover:shadow-md"
                    >
                      <img
                        src={img}
                        alt={`Product ${idx}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <i className="fas fa-check text-white text-2xl"></i>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : activeTab === 'variants' ? (
            // Variant Images Tab
            <>
              {variantImages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-layer-group text-6xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500 text-lg">No variant images yet</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {variantImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSelectImage(img)}
                      className="group relative rounded-lg overflow-hidden bg-white border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition h-28 shadow-sm hover:shadow-md"
                    >
                      <img
                        src={img}
                        alt={`Variant ${idx}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <i className="fas fa-check text-white text-2xl"></i>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : activeTab === 'groups' ? (
            // Group Images Tab
            <>
              {groupImages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-object-group text-6xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500 text-lg">No group images yet</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {groupImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSelectImage(img)}
                      className="group relative rounded-lg overflow-hidden bg-white border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition h-28 shadow-sm hover:shadow-md"
                    >
                      <img
                        src={img}
                        alt={`Group ${idx}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <i className="fas fa-check text-white text-2xl"></i>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Media Library Tab
            <>
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-100">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-600 font-medium">Loading media library...</p>
                  </div>
                </div>
              ) : mediaAssets.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500 text-lg">No media found</p>
                    <p className="text-gray-400 text-sm mt-2">Upload some images to get started</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {mediaAssets.map((asset) => (
                    <div
                      key={asset._id}
                      onClick={() => onSelectImage(asset.url)}
                      className="group relative rounded-lg overflow-hidden bg-white border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition h-28 shadow-sm hover:shadow-md"
                    >
                      {asset.type === 'image' ? (
                        <img
                          src={asset.url}
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
                      <div className="absolute top-2 right-2 px-2 py-1 bg-gray-900 text-white text-xs font-semibold rounded">
                        {asset.type === 'image' ? 'IMG' : 'VID'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {activeTab === 'media' && totalPages > 1 && (
          <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-center gap-2">
            <button
              onClick={() => setMediaPage(Math.max(1, mediaPage - 1))}
              disabled={mediaPage === 1 || loading}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <i className="fas fa-chevron-left"></i>
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const startPage = Math.max(1, mediaPage - 2);
                return startPage + i;
              }).map((page) => (
                <button
                  key={page}
                  onClick={() => setMediaPage(page)}
                  disabled={loading}
                  className={`px-3 py-2 rounded-lg font-medium transition ${mediaPage === page
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setMediaPage(Math.min(totalPages, mediaPage + 1))}
              disabled={mediaPage === totalPages || loading}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}

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
