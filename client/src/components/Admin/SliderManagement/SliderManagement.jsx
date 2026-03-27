'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

const SliderManagement = () => {
  const [sliders, setSliders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    buttonText: 'Shop Now',
    buttonLink: '/products',
    bgImage: '',
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Load sliders on mount
  useEffect(() => {
    loadSliders();
  }, []);

  const loadSliders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/sliders/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log('Slider response status:', response.status);
      console.log('Slider response data:', response.data);
      console.log('Slider response data type:', typeof response.data);
      console.log('Is array?', Array.isArray(response.data));
      
      // Response should be an array directly
      const sliderData = Array.isArray(response.data) ? response.data : [];
      console.log('Final slider data:', sliderData);
      setSliders(sliderData);
    } catch (error) {
      console.error('Error loading sliders:', error);
      console.error('Error response:', error.response);
      toast.error('Failed to load sliders');
      setSliders([]); // Set empty array on error to prevent map error
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await axios.post(`${API}/api/upload`, formDataUpload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const uploadedImageUrl =
        response.data.serverUrl ||
        response.data.asset?.serverUrl ||
        response.data.url ||
        response.data.publicUrl;

      if (uploadedImageUrl) {
        setFormData((prev) => ({
          ...prev,
          bgImage: uploadedImageUrl,
        }));
        setImageFile(file);
        toast.success('Image uploaded successfully');
      } else if (response.data.file) {
        // Fallback for alternative response format
        setFormData((prev) => ({
          ...prev,
          bgImage: response.data.file,
        }));
        setImageFile(file);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSlider = () => {
    setEditingSlider(null);
    setFormData({
      title: '',
      description: '',
      buttonText: 'Shop Now',
      buttonLink: '/products',
      bgImage: '',
      isActive: true,
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleEditSlider = (slider) => {
    setEditingSlider(slider);
    setFormData(slider);
    setImageFile(null);
    setShowModal(true);
  };

  const handleSaveSlider = async () => {
    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.bgImage) {
        toast.error('Please fill in all required fields');
        return;
      }

      const token = localStorage.getItem('token');

      if (editingSlider) {
        // Update existing slider
        await axios.put(`${API}/api/sliders/${editingSlider._id}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        toast.success('Slider updated successfully');
      } else {
        // Create new slider
        await axios.post(`${API}/api/sliders/`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        toast.success('Slider created successfully');
      }

      setShowModal(false);
      loadSliders();
    } catch (error) {
      console.error('Error saving slider:', error);
      toast.error(error.response?.data?.message || 'Failed to save slider');
    }
  };

  const handleDeleteSlider = async (sliderId) => {
    if (!window.confirm('Are you sure you want to delete this slider?')) return;

    try {
      await axios.delete(`${API}/api/sliders/${sliderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      toast.success('Slider deleted successfully');
      loadSliders();
    } catch (error) {
      console.error('Error deleting slider:', error);
      toast.error('Failed to delete slider');
    }
  };

  const handleToggleActive = async (slider) => {
    try {
      const updatedSlider = { ...slider, isActive: !slider.isActive };
      await axios.put(`${API}/api/sliders/${slider._id}`, updatedSlider, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      toast.success(`Slider ${updatedSlider.isActive ? 'activated' : 'deactivated'}`);
      loadSliders();
    } catch (error) {
      console.error('Error toggling slider:', error);
      toast.error('Failed to update slider status');
    }
  };

  return (
    <div className="p-6 bg-[var(--color-bg-primary)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Slider Management</h1>
          <button
            onClick={handleAddSlider}
            className="bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] text-white font-semibold px-6 py-3 rounded-lg transition duration-300"
          >
            <i className="fas fa-plus mr-2"></i> Add New Slider
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-[var(--color-accent-primary)]"></i>
            <p className="mt-4 text-[var(--color-text-light)]">Loading sliders...</p>
          </div>
        ) : sliders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <i className="fas fa-image text-5xl text-gray-300 mb-4"></i>
            <p className="text-[var(--color-text-secondary)] mb-4">No sliders created yet</p>
            <button
              onClick={handleAddSlider}
              className="bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] text-white font-semibold px-6 py-3 rounded-lg transition duration-300"
            >
              <i className="fas fa-plus mr-2"></i> Create First Slider
            </button>
          </div>
        ) : (
          /* Sliders Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sliders.map((slider) => (
              <div
                key={slider._id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-[var(--color-border-light)] hover:shadow-lg transition duration-300"
              >
                {/* Image Preview */}
                <div className="h-48 overflow-hidden bg-gray-100">
                  <img
                    src={slider.bgImage.startsWith('http') ? slider.bgImage : `${API}${slider.bgImage}`}
                    alt={slider.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23ddd%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%22200%22 y=%22150%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22sans-serif%22 font-size=%2218%22 fill=%22%23999%22%3EImage not found%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2 line-clamp-2">
                    {slider.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-light)] mb-3 line-clamp-2">
                    {slider.description}
                  </p>

                  {/* Button Info */}
                  <div className="bg-[var(--color-bg-section)] p-3 rounded-lg mb-3">
                    <p className="text-xs text-[var(--color-text-light)] mb-1">Button Text:</p>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {slider.buttonText}
                    </p>
                    <p className="text-xs text-[var(--color-text-light)] mt-2 mb-1">Link:</p>
                    <p className="text-xs font-mono text-[var(--color-accent-primary)]">
                      {slider.buttonLink}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${slider.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {slider.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-[var(--color-text-light)]">
                      Order: {slider.order}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSlider(slider)}
                      className="flex-1 bg-blue-500 hover:bg-[var(--color-accent-primary)] text-white font-semibold px-4 py-2 rounded-lg transition duration-300"
                    >
                      <i className="fas fa-edit mr-2"></i>
                    </button>
                    <button
                      onClick={() => handleToggleActive(slider)}
                      className={`flex-1 font-semibold px-4 py-2 rounded-lg transition duration-300 ${slider.isActive
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                    >
                      <i className={`fas fa-${slider.isActive ? 'eye-slash' : 'eye'} mr-2`}></i>
                      {slider.isActive}
                    </button>
                    <button
                      onClick={() => handleDeleteSlider(slider._id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition duration-300"
                    >
                      <i className="fas fa-trash mr-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div
                className="flex justify-between items-center p-6 border-b border-[var(--color-border-light)]"
                style={{ backgroundColor: 'var(--color-bg-section)' }}
              >
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {editingSlider ? 'Edit Slider' : 'Create New Slider'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-[var(--color-text-primary)] hover:bg-[var(--color-border-light)] p-2 rounded-lg transition duration-300"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[var(--color-text-primary)]">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-lg outline-none transition duration-300"
                    style={{ borderColor: 'var(--color-border-light)' }}
                    placeholder="Enter slider title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[var(--color-text-primary)]">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-lg outline-none transition duration-300 resize-none"
                    style={{ borderColor: 'var(--color-border-light)' }}
                    placeholder="Enter slider description"
                    rows="4"
                  />
                </div>

                {/* Button Text */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--color-text-primary)]">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      className="w-full px-4 py-2.5 border rounded-lg outline-none transition duration-300"
                      style={{ borderColor: 'var(--color-border-light)' }}
                      placeholder="e.g., Shop Now"
                    />
                  </div>

                  {/* Button Link */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--color-text-primary)]">
                      Button Link
                    </label>
                    <input
                      type="text"
                      value={formData.buttonLink}
                      onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                      className="w-full px-4 py-2.5 border rounded-lg outline-none transition duration-300"
                      style={{ borderColor: 'var(--color-border-light)' }}
                      placeholder="e.g., /products"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[var(--color-text-primary)]">
                    Background Image *
                  </label>
                  <label className="flex items-center justify-center px-4 py-4 border-2 border-dashed rounded-xl cursor-pointer transition duration-300"
                    style={{ borderColor: 'var(--color-border-light)' }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0])}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="flex flex-col items-center gap-2 text-[var(--color-text-light)]">
                      <i className="fas fa-cloud-upload-alt text-3xl" style={{ color: 'var(--color-text-primary)' }}></i>
                      <span className="text-sm font-semibold">
                        {uploading ? 'Uploading...' : 'Click to upload'}
                      </span>
                      <span className="text-xs">PNG, JPG up to 10MB</span>
                    </div>
                  </label>

                  {/* Image Preview */}
                  {formData.bgImage && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold mb-2 text-[var(--color-text-light)]">Image Preview:</p>
                      <div className="relative inline-block">
                        <img
                          src={formData.bgImage.startsWith('http') ? formData.bgImage : `${API}${formData.bgImage}`}
                          alt="Preview"
                          className="w-48 h-32 object-cover rounded-lg border-2 shadow-md"
                          style={{ borderColor: 'var(--color-accent-primary)' }}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, bgImage: '' })}
                          className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition duration-300 shadow-lg"
                          title="Remove image"
                        >
                          <i className="fas fa-times text-sm"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Activate this Slider
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-[var(--color-border-light)] bg-[var(--color-bg-section)]">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-2.5 border border-[var(--color-border-light)] rounded-lg font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-border-light)] transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSlider}
                  disabled={uploading}
                  className="flex-1 px-6 py-2.5 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] text-white rounded-lg font-semibold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : editingSlider ? 'Update Slider' : 'Create Slider'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SliderManagement;
