'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MediaLibrary = () => {
  const API = import.meta.env.VITE_API_URL || '';
  const [token, setToken] = useState(null);

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState(''); // 'image', 'video', or ''
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMedia, setTotalMedia] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deletingBulk, setDeletingBulk] = useState(false);

  const limit = 12;

  // Read token on client only (module can be evaluated on server)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        setToken(window.localStorage.getItem('token'));
      }
    } catch (e) {
      setToken(null);
    }
  }, []);

  // Fetch media from API
  const fetchMedia = async (page = 1, search = '', type = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (search) params.append('search', search);
      if (type) params.append('type', type);

      const response = await axios.get(`${API}/api/media?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.data.success) {
        setMedia(response.data.assets || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotalMedia(response.data.pagination?.total || 0);
        setCurrentPage(response.data.pagination?.page || 1);
      }
    } catch (err) {
      console.error('Failed to fetch media:', err);
      toast.error('Failed to load media library');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (!token) return;
    fetchMedia(1, searchTerm, filterType);
  }, [token]);

  // Fetch media when search or filter changes
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchMedia(1, value, filterType);
  };

  const handleFilterType = (type) => {
    setFilterType(type);
    setCurrentPage(1);
    fetchMedia(1, searchTerm, type);
  };

  // Delete media
  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('Are you sure you want to delete this media?')) return;

    try {
      setDeleting(mediaId);
      await axios.delete(`${API}/api/media/${mediaId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast.success('Media deleted successfully');
      setMedia(media.filter((m) => m._id !== mediaId));
      setShowPreview(false);
      setSelectedMedia(null);
    } catch (err) {
      console.error('Failed to delete media:', err);
      toast.error('Failed to delete media');
    } finally {
      setDeleting(null);
    }
  };

  // Toggle media selection
  const handleToggleSelect = (mediaId) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(mediaId)) {
      newSelectedIds.delete(mediaId);
    } else {
      newSelectedIds.add(mediaId);
    }
    setSelectedIds(newSelectedIds);
  };

  // Toggle select all
  const handleSelectAll = () => {
    if (selectedIds.size === media.length) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Select all
      const allIds = new Set(media.map((m) => m._id));
      setSelectedIds(allIds);
    }
  };

  // Bulk delete media
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      toast.error('No media selected');
      return;
    }

    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} media item${count > 1 ? 's' : ''}?`))
      return;

    try {
      setDeletingBulk(true);
      await axios.post(
        `${API}/api/media/bulk`,
        { ids: Array.from(selectedIds) },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      toast.success(`Deleted ${count} media item${count > 1 ? 's' : ''}`);
      setMedia(media.filter((m) => !selectedIds.has(m._id)));
      setSelectedIds(new Set());
      setShowPreview(false);
      setSelectedMedia(null);
    } catch (err) {
      console.error('Failed to bulk delete media:', err);
      toast.error('Failed to delete media');
    } finally {
      setDeletingBulk(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMediaUrl = (asset) => {
    if (!asset.url) return '';
    if (asset.url.startsWith('http')) return asset.url;
    return `${API}${asset.url}`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Media Library</h1>
        <p className="text-gray-600">Manage all uploaded images and videos</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search by filename..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
            />
          </div>

          {/* Filter Type */}
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterType('')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${filterType === ''
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
            >
              All Media
            </button>
            <button
              onClick={() => handleFilterType('image')}
              className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${filterType === 'image'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
            >
              <i className="fas fa-image"></i> Images
            </button>
            <button
              onClick={() => handleFilterType('video')}
              className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${filterType === 'video'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
            >
              <i className="fas fa-video"></i> Videos
            </button>
          </div>
        </div>

        {/* Bottom Row - Media Count & Selection Info */}
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            <p>
              Showing <span className="font-semibold">{media.length}</span> of{' '}
              <span className="font-semibold">{totalMedia}</span> media items
            </p>
          </div>

          {/* Selection & Bulk Delete */}
          {media.length > 0 && (
            <div className="flex items-center gap-3">
              {selectedIds.size > 0 && (
                <>
                  <span className="text-sm font-semibold text-gray-700">
                    {selectedIds.size} selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    disabled={deletingBulk}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <i className="fas fa-trash-alt"></i>
                    {deletingBulk ? 'Deleting...' : 'Delete Selected'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">Loading media...</p>
          </div>
        </div>
      ) : media.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <i className="fas fa-image text-5xl text-gray-300 mb-4"></i>
          <p className="text-gray-600 text-lg">
            {searchTerm || filterType ? 'No media found matching your search' : 'No media uploaded yet'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {media.map((asset) => (
              <div
                key={asset._id}
                className="bg-white rounded-lg shadow-lg overflow-hidden group relative"
              >
                {/* Checkbox */}
                <div
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(asset._id)}
                    onChange={() => handleToggleSelect(asset._id)}
                    className="w-4 h-4 cursor-pointer accent-gray-900"
                  />
                </div>

                {/* Media Item */}
                <div
                  onClick={() => {
                    setSelectedMedia(asset);
                    setShowPreview(true);
                  }}
                  className="cursor-pointer hover:shadow-xl transition"
                >
                  <div className="relative bg-gray-100 aspect-square flex items-center justify-center overflow-hidden">
                    {asset.type === 'image' ? (
                      <img
                        src={getMediaUrl(asset)}
                        alt={asset.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <i className="fas fa-video text-4xl text-gray-400"></i>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        className="bg-white text-gray-900 px-3 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-100"
                      >
                        <i className="fas fa-eye"></i> View
                      </button>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-2 right-2 bg-gray-900 text-white px-2 py-1 rounded text-xs font-semibold">
                      {asset.type === 'image' ? (
                        <>
                          <i className="fas fa-image mr-1"></i> IMG
                        </>
                      ) : (
                        <>
                          <i className="fas fa-video mr-1"></i> VID
                        </>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2">
                    <p className="text-xs font-semibold text-gray-900 truncate" title={asset.filename}>
                      {asset.filename}
                    </p>
                    <p className="text-xs text-gray-600">{formatFileSize(asset.size)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => fetchMedia(Math.max(1, currentPage - 1), searchTerm, filterType)}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <i className="fas fa-chevron-left"></i>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchMedia(page, searchTerm, filterType)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${currentPage === page
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => fetchMedia(Math.min(totalPages, currentPage + 1), searchTerm, filterType)}
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      {showPreview && selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">Media Details</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex-1">
              {/*Preview */}
              <div className="mb-6 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-64">
                {selectedMedia.type === 'image' ? (
                  <img
                    src={getMediaUrl(selectedMedia)}
                    alt={selectedMedia.filename}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <video
                    src={getMediaUrl(selectedMedia)}
                    controls
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">Filename</p>
                  <p className="text-sm text-gray-900 break-all">{selectedMedia.filename}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-1">File Size</p>
                    <p className="text-sm text-gray-900">{formatFileSize(selectedMedia.size)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-1">Type</p>
                    <p className="text-sm text-gray-900 capitalize">{selectedMedia.type}</p>
                  </div>
                </div>

                {selectedMedia.width && selectedMedia.height && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">Width</p>
                      <p className="text-sm text-gray-900">{selectedMedia.width}px</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">Height</p>
                      <p className="text-sm text-gray-900">{selectedMedia.height}px</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">Uploaded</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedMedia.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMedia(selectedMedia._id)}
                disabled={deleting === selectedMedia._id}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <i className="fas fa-trash-alt"></i>
                {deleting === selectedMedia._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
