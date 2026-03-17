'use client';

import React, { useState, useEffect } from 'react';

import CategoryProducts from './CategoryProducts';
import SEOMetaForm from '../SEOMetaForm/SEOMetaForm';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../../redux/slices/categorySlice';
import toast from 'react-hot-toast';
import axios from 'axios';
import useURLRedirect from '../../../hooks/useURLRedirect';

const API = import.meta.env.VITE_API_URL || '';

// Extract CategoryModal as separate component to prevent re-render on formData change
const CategoryModal = ({ showModal, onClose, title, formData, setFormData, handleAddCategory, handleImageUpload, editingCategory, originalSlug, shouldCreateRedirect, setShouldCreateRedirect }) => {
    if (!showModal) return null;

    // Check if slug has changed
    const slugChanged = editingCategory && originalSlug && formData.slug && originalSlug !== formData.slug;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                <div className="flex justify-between items-center p-6 transition duration-300" style={{ borderBottomWidth: '1px', borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-section)' }}>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
                    <button
                        onClick={onClose}
                        className="transition duration-300 p-1 rounded-lg"
                        style={{ color: 'var(--color-text-primary)' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-border-light)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Category Image</label>
                        <label className="flex items-center justify-center px-4 py-4 border-2 border-dashed rounded-xl cursor-pointer transition duration-300" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-section)' }} onMouseEnter={(e) => e.target.style.borderColor = 'var(--color-accent-primary)'} onMouseLeave={(e) => e.target.style.borderColor = 'var(--color-border-light)'}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                                <i className="fas fa-cloud-upload-alt text-3xl" style={{ color: 'var(--color-text-primary)' }}></i>
                                <span className="text-sm font-semibold">Click to upload</span>
                                <span className="text-xs" style={{ color: 'var(--color-text-light)' }}>PNG, JPG up to 10MB</span>
                            </div>
                        </label>
                        {formData.image && (
                            <div className="mt-4">
                                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-light)' }}>Current Image Preview:</p>
                                <div className="relative inline-block">
                                    <img
                                        src={formData.image}
                                        alt="Preview"
                                        className="w-32 h-32 object-cover rounded-lg border-2 shadow-md"
                                        style={{ borderColor: 'var(--color-accent-primary)' }}
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22sans-serif%22 font-size=%2214%22 fill=%22%23999%22%3EFailed to load%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: null })}
                                        className="absolute -top-3 -right-3 text-white p-2 rounded-full transition duration-300 shadow-lg"
                                        style={{ backgroundColor: '#ef4444' }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                                        title="Remove image"
                                    >
                                        <i className="fas fa-times text-sm"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Category Name */}
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 border rounded-lg outline-none transition duration-300"
                            style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-primary)' }}
                            onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent-primary)'; e.target.style.boxShadow = '0 0 0 2px rgba(165, 99, 42, 0.1)'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border-light)'; e.target.style.boxShadow = 'none'; }}
                            placeholder="Enter category name"
                        />
                    </div>

                    {/* URL Slug */}
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>URL Slug *</label>
                        <input
                            type="text"
                            value={formData.slug || ''}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full px-4 py-2.5 border rounded-lg outline-none transition duration-300"
                            style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-primary)' }}
                            onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent-primary)'; e.target.style.boxShadow = '0 0 0 2px rgba(165, 99, 42, 0.1)'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border-light)'; e.target.style.boxShadow = 'none'; }}
                            placeholder="e.g., corner"
                        />
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-light)' }}>Current URL: /category/{formData.slug || 'your-slug'}</p>
                    </div>

                    {/* URL Redirect - Show when slug has changed */}
                    {slugChanged && (
                        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                            <div className="space-y-2 mb-3 p-3 bg-white rounded border border-amber-300">
                                <div>
                                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Old URL (from):</p>
                                    <p className="text-sm p-2 bg-gray-100 rounded" style={{ color: 'var(--color-text-primary)' }}>
                                        /category/{originalSlug}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>New URL (to):</p>
                                    <p className="text-sm p-2 bg-gray-100 rounded" style={{ color: 'var(--color-text-primary)' }}>
                                        /category/{formData.slug}
                                    </p>
                                </div>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="createRedirect"
                                    checked={shouldCreateRedirect}
                                    onChange={(e) => setShouldCreateRedirect(e.target.checked)}
                                    className="rounded w-4 h-4"
                                />
                                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                    Redirect old slug to new slug?
                                </span>
                            </label>
                            {shouldCreateRedirect && (
                                <p className="text-xs mt-2" style={{ color: '#666' }}>✓ Redirect will be created automatically when you update</p>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-2.5 border rounded-lg outline-none transition duration-300"
                            style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-primary)' }}
                            onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent-primary)'; e.target.style.boxShadow = '0 0 0 2px rgba(165, 99, 42, 0.1)'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border-light)'; e.target.style.boxShadow = 'none'; }}
                            placeholder="Enter category description"
                        />
                    </div>

                    {/* SEO Meta Information */}
                    <div className="border-t pt-4 mt-4">
                        <SEOMetaForm
                            metaTitle={formData.metaTitle}
                            metaDescription={formData.metaDescription}
                            metaKeywords={formData.metaKeywords}
                            onChange={(field, value) => setFormData({ ...formData, [field]: value })}
                            defaultTitle={formData.name}
                        />
                    </div>
                </div>

                <div className="flex gap-3 p-6 transition duration-300" style={{ borderTopWidth: '1px', borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-section)' }}>
                    <button
                        onClick={() => {
                            onClose();
                            setFormData({ name: '', slug: '', description: '', image: null, productCount: 0, metaTitle: '', metaDescription: '', metaKeywords: '' });
                        }}
                        className="flex-1 px-4 py-2.5 border rounded-lg font-semibold transition duration-300"
                        style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-primary)' }}
                        onMouseEnter={(e) => { e.target.style.backgroundColor = 'var(--color-bg-section)'; }}
                        onMouseLeave={(e) => { e.target.style.backgroundColor = 'var(--color-bg-primary)'; }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddCategory}
                        className="flex-1 px-4 py-2.5 text-white rounded-lg font-semibold transition duration-300 flex items-center justify-center gap-2 shadow-md"
                        style={{ backgroundColor: 'var(--color-accent-primary)' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}
                    >
                        <i className="fas fa-plus"></i> {editingCategory ? 'Update' : 'Add'} Category
                    </button>
                </div>
            </div>
        </div>
    );
};

// Extract SubcategoryModal as separate component
const SubcategoryModal = ({ showModal, onClose, title, formData, setFormData, handleAddSubcategory, handleImageUpload, editingCategory, originalSlug, shouldCreateRedirect, setShouldCreateRedirect }) => {
    if (!showModal) return null;

    // Check if slug has changed
    const slugChanged = editingCategory && originalSlug && formData.slug && originalSlug !== formData.slug;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                <div className="flex justify-between items-center p-6 transition duration-300" style={{ borderBottomWidth: '1px', borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-section)' }}>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
                    <button
                        onClick={onClose}
                        className="transition duration-300 p-1 rounded-lg"
                        style={{ color: 'var(--color-text-primary)' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-border-light)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Subcategory Image</label>
                        <label className="flex items-center justify-center px-4 py-4 border-2 border-dashed rounded-xl cursor-pointer transition duration-300" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-section)' }} onMouseEnter={(e) => e.target.style.borderColor = 'var(--color-accent-primary)'} onMouseLeave={(e) => e.target.style.borderColor = 'var(--color-border-light)'}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                                <i className="fas fa-cloud-upload-alt text-3xl" style={{ color: 'var(--color-text-light)' }}></i>
                                <span className="text-sm font-semibold">Click to upload</span>
                                <span className="text-xs" style={{ color: 'var(--color-text-light)' }}>PNG, JPG up to 10MB</span>
                            </div>
                        </label>
                        {formData.image && (
                            <div className="mt-4">
                                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-light)' }}>Current Image Preview:</p>
                                <div className="relative inline-block">
                                    <img
                                        src={formData.image.startsWith('http') ? formData.image : `${API}${formData.image}`}
                                        alt="Preview"
                                        className="w-32 h-32 object-cover rounded-lg border-2 shadow-md"
                                        style={{ borderColor: 'var(--color-accent-primary)' }}
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22sans-serif%22 font-size=%2214%22 fill=%22%23999%22%3EFailed to load%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: null })}
                                        className="absolute -top-3 -right-3 text-white p-2 rounded-full transition duration-300 shadow-lg"
                                        style={{ backgroundColor: '#ef4444' }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                                        title="Remove image"
                                    >
                                        <i className="fas fa-times text-sm"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Subcategory Name */}
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 border rounded-lg outline-none transition duration-300"
                            style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-primary)' }}
                            onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent-primary)'; e.target.style.boxShadow = '0 0 0 2px rgba(165, 99, 42, 0.1)'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border-light)'; e.target.style.boxShadow = 'none'; }}
                            placeholder="Enter subcategory name"
                        />
                    </div>

                    {/* URL Slug */}
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>URL Slug *</label>
                        <input
                            type="text"
                            value={formData.slug || ''}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full px-4 py-2.5 border rounded-lg outline-none transition duration-300"
                            style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-primary)' }}
                            onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent-primary)'; e.target.style.boxShadow = '0 0 0 2px rgba(165, 99, 42, 0.1)'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border-light)'; e.target.style.boxShadow = 'none'; }}
                            placeholder="e.g., corner-profiles or cornerprofile"
                        />
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-light)' }}>Used in URL: /category/{formData.slug || 'your-slug'}</p>
                    </div>

                    {/* URL Redirect - Show when slug has changed */}
                    {slugChanged && (
                        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                            <div className="space-y-2 mb-3 p-3 bg-white rounded border border-amber-300">
                                <div>
                                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Old URL (from):</p>
                                    <p className="text-sm p-2 bg-gray-100 rounded" style={{ color: 'var(--color-text-primary)' }}>
                                        /category/{originalSlug}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>New URL (to):</p>
                                    <p className="text-sm p-2 bg-gray-100 rounded" style={{ color: 'var(--color-text-primary)' }}>
                                        /category/{formData.slug}
                                    </p>
                                </div>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="createRedirectSub"
                                    checked={shouldCreateRedirect}
                                    onChange={(e) => setShouldCreateRedirect(e.target.checked)}
                                    className="rounded w-4 h-4"
                                />
                                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                    Redirect old slug to new slug?
                                </span>
                            </label>
                            {shouldCreateRedirect && (
                                <p className="text-xs mt-2" style={{ color: '#666' }}>✓ Redirect will be created automatically when you update</p>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-2.5 border rounded-lg outline-none transition duration-300"
                            style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-primary)' }}
                            onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent-primary)'; e.target.style.boxShadow = '0 0 0 2px rgba(165, 99, 42, 0.1)'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border-light)'; e.target.style.boxShadow = 'none'; }}
                            placeholder="Enter subcategory description"
                        />
                    </div>

                    {/* SEO Meta Information */}
                    <div className="border-t pt-4 mt-4">
                        <SEOMetaForm
                            metaTitle={formData.metaTitle}
                            metaDescription={formData.metaDescription}
                            metaKeywords={formData.metaKeywords}
                            onChange={(field, value) => setFormData({ ...formData, [field]: value })}
                            defaultTitle={formData.name}
                        />
                    </div>
                </div>

                <div className="flex gap-3 p-6 transition duration-300" style={{ borderTopWidth: '1px', borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-section)' }}>
                    <button
                        onClick={() => {
                            onClose();
                            setFormData({ name: '', slug: '', description: '', image: null, productCount: 0, metaTitle: '', metaDescription: '', metaKeywords: '' });
                        }}
                        className="flex-1 px-4 py-2.5 border rounded-lg font-semibold transition duration-300"
                        style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-primary)' }}
                        onMouseEnter={(e) => { e.target.style.backgroundColor = 'var(--color-bg-section)'; }}
                        onMouseLeave={(e) => { e.target.style.backgroundColor = 'var(--color-bg-primary)'; }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddSubcategory}
                        className="flex-1 px-4 py-2.5 text-white rounded-lg font-semibold transition duration-300 flex items-center justify-center gap-2 shadow-md"
                        style={{ backgroundColor: 'var(--color-accent-primary)' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}
                    >
                        <i className="fas fa-plus"></i> {editingCategory ? 'Update' : 'Add'} Subcategory
                    </button>
                </div>
            </div>
        </div>
    );
};

// Recursive component for rendering nested categories at any depth
const NestedCategoryRows = ({
    category,
    depth = 0,
    onToggle,
    onEdit,
    onDelete,
    onAddSubcategory,
    onEditMain,
    parentId = null,
    failedImages = new Set(),
    setFailedImages = () => { }
}) => {
    const indent = depth * 32;
    const colorSchemes = [
        { bg: 'bg-indigo-50', border: 'border-indigo-400', text: 'text-gray-700', gradient: 'from-indigo-400 to-indigo-600' },
        { bg: 'bg-gray-50', border: 'border-gray-400', text: 'text-gray-400', gradient: 'from-gray-700 to-black-400' },
        { bg: 'bg-gray-100', border: 'border-blue-400', text: 'text-gray-700', gradient: 'from-blue-400 to-blue-600' },
        { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-600', gradient: 'from-purple-400 to-purple-600' },
        { bg: 'bg-pink-50', border: 'border-pink-400', text: 'text-pink-600', gradient: 'from-pink-400 to-pink-600' },
        { bg: 'bg-cyan-50', border: 'border-cyan-400', text: 'text-cyan-600', gradient: 'from-cyan-400 to-cyan-600' },
    ];
    const colors = colorSchemes[depth % colorSchemes.length];

    // Toggle function for this specific category
    const toggleThis = () => {
        onToggle(category._id);
    };

    // Use different edit handler based on depth
    const handleEdit = () => {
        if (depth === 0 && onEditMain) {
            // Main category - use main category editor
            onEditMain(category);
        } else {
            // Subcategory - use subcategory editor
            onEdit(parentId, category);
        }
    };

    return (
        <>
            <tr className={`hover:${colors.bg} transition duration-300 ${depth > 0 ? `${colors.bg} border-l-4 ${colors.border}` : 'bg-white'}`}>
                <td className="px-6 py-4">
                    <input type="checkbox" className="rounded" />
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3" style={{ marginLeft: `${indent}px` }}>
                        {/* Always show chevron for expansion */}
                        <button
                            onClick={toggleThis}
                            className={`${colors.text} hover:opacity-100 opacity-75 p-1 transition duration-300`}
                            title={category.expandedSubcategories ? 'Collapse' : 'Expand'}
                        >
                            {category.expandedSubcategories ? <i className="fas fa-chevron-down"></i> : <i className="fas fa-chevron-right"></i>}
                        </button>
                        {category.image && !failedImages.has(category._id) ? (
                            <img
                                src={category.image.startsWith('http') ? category.image : `${API}${category.image}`}
                                alt={category.name}
                                className="w-10 h-10 object-cover rounded-lg border-2 border-gray-300"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    setFailedImages(prev => new Set([...prev, category._id]));
                                }}
                            />
                        ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex text-center items-center justify-center text-xs font-semibold text-gray-600 border-2 border-gray-300">
                                No Image
                            </div>
                        )}
                        <div>
                            <h4 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                                {depth === 0 && <i className="fas fa-layer-group text-xs" style={{ color: 'var(--color-text-primary)' }}></i>}
                                {depth > 0 && <i className="fas fa-box text-xs" style={{ color: 'var(--color-text-primary)' }}></i>}
                                {category.name}
                            </h4>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 rounded-full font-semibold text-sm text-white" style={{ backgroundColor: 'var(--color-accent-primary)' }}>
                        {category.productCount || 0}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex gap-2">
                        <button
                            onClick={handleEdit}
                            className="bg-gray-800 hover:bg-black text-white p-2 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
                            title="Edit"
                        >
                            <i className="fas fa-edit text-sm"></i>
                        </button>
                        <button
                            onClick={() => onDelete(parentId, category._id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
                            title="Delete"
                        >
                            <i className="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                </td>
            </tr>

            {/* Render subcategories recursively */}
            {category.expandedSubcategories && category.subcategories && category.subcategories.length > 0 && (
                category.subcategories.map((subcategory) => (
                    <NestedCategoryRows
                        key={subcategory._id}
                        category={subcategory}
                        depth={depth + 1}
                        onToggle={onToggle}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onAddSubcategory={onAddSubcategory}
                        onEditMain={onEditMain}
                        parentId={category._id}
                        failedImages={failedImages}
                        setFailedImages={setFailedImages}
                    />
                ))
            )}

            {/* Add subcategory button */}
            {category.expandedSubcategories && (
                <tr className={`${colors.bg} border-l-4 ${colors.border}`}>
                    <td colSpan="4" className="px-6 py-4">
                        <button
                            onClick={() => onAddSubcategory(category._id)}
                            className={`w-full text-left px-4 py-2 ${colors.bg} hover:opacity-80 ${colors.text} rounded-lg font-semibold transition duration-300 flex items-center gap-2 justify-center`}
                            style={{ marginLeft: `${indent}px` }}
                        >
                            <i className="fas fa-plus"></i> Add Sub-Category to {category.name}
                        </button>
                    </td>
                </tr>
            )}
        </>
    );
};

const CategoryManagement = () => {
    const dispatch = useDispatch();
    const { categories: reduxCategories = [], loading } = useSelector((state) => state.category);
    const [categories, setCategories] = useState([]);

    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [showAddSubcategoryModal, setShowAddSubcategoryModal] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showCategoryProducts, setShowCategoryProducts] = useState(false);
    const [selectedCategoryForProducts, setSelectedCategoryForProducts] = useState(null);
    const [categoryToExpand, setCategoryToExpand] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name-asc'); // name-asc, name-desc, date-newest, date-oldest, products-max, products-min
    const [viewMode, setViewMode] = useState('menu'); // 'plain' or 'menu'
    const [failedImages, setFailedImages] = useState(new Set()); // Track failed image loads

    // Sync categories from Redux
    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    // Auto-redirect if accessed via broken URL
    useURLRedirect(false);

    useEffect(() => {
        const initializeExpandedState = (items) => {
            return (items || []).map(item => ({
                ...item,
                productCount: item.productCount || 0, // Explicitly preserve productCount
                expandedSubcategories: categoryToExpand === item._id ? true : false,
                subcategories: initializeExpandedState(item.subcategories),
            }));
        };

        setCategories(reduxCategories.map(cat => ({
            ...cat,
            productCount: cat.productCount || 0, // Explicitly preserve productCount
            expandedSubcategories: categoryToExpand === cat._id ? true : false,
            subcategories: initializeExpandedState(cat.subcategories),
        })) || []);
    }, [reduxCategories, categoryToExpand]);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        image: null,
    });

    // Redirect state
    const [originalSlug, setOriginalSlug] = useState(null);
    const [shouldCreateRedirect, setShouldCreateRedirect] = useState(false);

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

    // ==================== Category Management ====================
    const handleAddCategory = async () => {
        if (!formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        if (!formData.slug?.trim()) {
            toast.error('URL slug is required');
            return;
        }

        // DEBUG: Show slug value before saving
        console.log('📋 Form data before save:', JSON.stringify(formData, null, 2));
        console.log('🔴 SLUG BEING SAVED:', formData.slug);
        alert(`💾 Saving category with SLUG: "${formData.slug}"\n\nNew URL will be: /category/${formData.slug}`);

        try {
            const token = localStorage.getItem('token');
            const newSlug = formData.slug?.trim() || formData.name.toLowerCase().replace(/\s+/g, '-');
            console.log('🔤 Slug calculation:', { formDataSlug: formData.slug, calculatedSlug: newSlug });
            const payload = {
                name: formData.name,
                description: formData.description,
                slug: newSlug,
                image: formData.image,
                metaTitle: formData.metaTitle,
                metaDescription: formData.metaDescription,
                metaKeywords: formData.metaKeywords,
            };

            if (editingCategory) {
                // Update category
                console.log('📤 Sending category update:', { id: editingCategory._id, payload });
                const response = await fetch(`${API}/api/categories/${editingCategory._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });

                const updatedData = await response.json();
                console.log('📥 Server response:', updatedData);

                if (!response.ok) {
                    throw new Error(updatedData.message || updatedData.error || 'Failed to update category');
                }

                console.log('✅ Category updated:', { oldSlug: editingCategory.slug, newSlug: updatedData.slug, name: updatedData.name });

                // Create URL redirect if slug changed and checkbox is checked
                if (shouldCreateRedirect && originalSlug && originalSlug !== updatedData.slug) {
                    const oldUrl = `/category/${originalSlug}`.toLowerCase();
                    const newUrl = `/category/${updatedData.slug}`.toLowerCase();

                    console.log('🔗 Creating redirect:', { fromUrl: oldUrl, toUrl: newUrl });
                    await createURLRedirect(oldUrl, newUrl);
                }

                toast.success('Category updated successfully');
            } else {
                // Add new category
                const response = await fetch(`${API}/api/categories`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });
                if (!response.ok) throw new Error('Failed to create category');
                toast.success('Category created successfully');
            }
            setEditingCategory(null);
            dispatch(fetchCategories());
        } catch (error) {
            toast.error(error.message);
        }

        setFormData({ name: '', description: '', slug: '', image: null, metaTitle: '', metaDescription: '', metaKeywords: '' });
        setShouldCreateRedirect(false);
        setEditingCategory(null);
        setOriginalSlug(null);
        setShowAddCategoryModal(false);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setOriginalSlug(category.slug);
        setFormData({
            name: category.name,
            description: category.description,
            slug: category.slug,
            image: category.image,
            metaTitle: category.metaTitle || '',
            metaDescription: category.metaDescription || '',
            metaKeywords: category.metaKeywords || '',
        });
        setShouldCreateRedirect(false);
        setShowAddCategoryModal(true);
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API}/api/categories/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to delete category');
                toast.success('Category deleted successfully');
                dispatch(fetchCategories());
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    const toggleSubcategories = (categoryId) => {
        setCategories(
            categories.map((cat) =>
                cat._id === categoryId
                    ? { ...cat, expandedSubcategories: !cat.expandedSubcategories }
                    : cat
            )
        );
    };

    const toggleSubSubcategories = (categoryId, subcategoryId) => {
        setCategories(
            categories.map((cat) =>
                cat._id === categoryId
                    ? {
                        ...cat,
                        subcategories: cat.subcategories.map((sub) =>
                            sub._id === subcategoryId
                                ? { ...sub, expandedSubcategories: !sub.expandedSubcategories }
                                : sub
                        ),
                    }
                    : cat
            )
        );
    };

    // Toggle subcategories at any depth recursively
    const toggleSubcategoryAtDepth = (targetId, currentCategories) => {
        return currentCategories.map((item) => {
            if (item._id === targetId) {
                return { ...item, expandedSubcategories: !item.expandedSubcategories };
            }
            if (item.subcategories && item.subcategories.length > 0) {
                return {
                    ...item,
                    subcategories: toggleSubcategoryAtDepth(targetId, item.subcategories),
                };
            }
            return item;
        });
    };

    // ==================== Subcategory Management ====================
    const handleAddSubcategory = async () => {
        if (!formData.name.trim()) {
            toast.error('Subcategory name is required');
            return;
        }

        if (!formData.slug?.trim()) {
            toast.error('URL slug is required');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token not found');
                return;
            }

            const endpoint = editingCategory
                ? `${API}/api/categories/${editingCategory._id}`
                : `${API}/api/categories`;

            const method = editingCategory ? 'PUT' : 'POST';
            const newSlug = formData.slug?.trim() || formData.name.toLowerCase().replace(/\s+/g, '-');

            const payload = {
                name: formData.name,
                description: formData.description,
                slug: newSlug,
                image: formData.image,
                metaTitle: formData.metaTitle,
                metaDescription: formData.metaDescription,
                metaKeywords: formData.metaKeywords,
                ...(editingCategory ? {} : { parent: selectedCategoryId }),
            };

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save subcategory');
            }

            const updatedSubData = await response.json();
            toast.success(editingCategory ? 'Subcategory updated successfully' : 'Subcategory added successfully');

            // Create URL redirect if slug changed and checkbox is checked
            if (editingCategory && shouldCreateRedirect && originalSlug && originalSlug !== updatedSubData.slug) {
                const oldUrl = `/category/${originalSlug}`.toLowerCase();
                const newUrl = `/category/${updatedSubData.slug}`.toLowerCase();

                console.log('🔗 Creating subcategory redirect:', { fromUrl: oldUrl, toUrl: newUrl });
                await createURLRedirect(oldUrl, newUrl);
            }

            setFormData({ name: '', description: '', slug: '', image: null, metaTitle: '', metaDescription: '', metaKeywords: '' });
            setShouldCreateRedirect(false);
            setOriginalSlug(null);
            setShowAddSubcategoryModal(false);
            setEditingCategory(null);

            // Set category to expand after fetching
            if (selectedCategoryId) {
                setCategoryToExpand(selectedCategoryId);
            }

            // Refresh categories from backend with a small delay to ensure server has updated
            setTimeout(() => {
                dispatch(fetchCategories());
            }, 300);
        } catch (error) {
            toast.error(error.message || 'Error saving subcategory');
        }
    };

    const handleEditSubcategory = (categoryId, subcategory) => {
        setSelectedCategoryId(categoryId);
        setEditingCategory(subcategory);
        setOriginalSlug(subcategory.slug);
        setFormData({
            name: subcategory.name,
            description: subcategory.description,
            slug: subcategory.slug,
            image: subcategory.image,
            productCount: subcategory.productCount,
            metaTitle: subcategory.metaTitle || '',
            metaDescription: subcategory.metaDescription || '',
            metaKeywords: subcategory.metaKeywords || '',
        });
        setShouldCreateRedirect(false);
        setShowAddSubcategoryModal(true);
    };

    const handleDeleteSubcategory = async (categoryId, subcategoryId) => {
        if (window.confirm('Are you sure you want to delete this subcategory?')) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Authentication token not found');
                    return;
                }

                const response = await fetch(`${API}/api/categories/${subcategoryId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to delete subcategory');
                }

                toast.success('Subcategory deleted successfully');

                // Refresh categories from backend
                dispatch(fetchCategories());
            } catch (error) {
                toast.error(error.message || 'Error deleting subcategory');
            }
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }

            try {
                const formDataToSend = new FormData();
                formDataToSend.append('image', file);

                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const res = await axios.post(`${API}/api/upload`, formDataToSend, {
                    headers: {
                        ...headers,
                        'Content-Type': 'multipart/form-data',
                    },
                });

                // Store the image URL from server - use callback to ensure state updates correctly
                setFormData((prevFormData) => {
                    const updatedFormData = { ...prevFormData, image: res.data.url };
                    return updatedFormData;
                });
                toast.success('Image uploaded successfully');
            } catch (err) {
                toast.error('Failed to upload image. Please try again.');
            }
        }
    };

    const openAddCategoryModal = () => {
        setEditingCategory(null);
        setOriginalSlug(null);
        setFormData({ name: '', slug: '', description: '', image: null });
        setShouldCreateRedirect(false);
        setShowAddCategoryModal(true);
    };

    const openAddSubcategoryModal = (categoryId) => {
        setSelectedCategoryId(categoryId);
        setEditingCategory(null);
        setOriginalSlug(null);
        setFormData({ name: '', slug: '', description: '', image: null });
        setShouldCreateRedirect(false);
        setShowAddSubcategoryModal(true);
    };

    const handleViewCategoryProducts = (category) => {
        setSelectedCategoryForProducts(category);
        setShowCategoryProducts(true);
    };

    // Helper function to recursively toggle any category at any depth
    const recursiveToggle = (targetId, catArray) => {
        return catArray.map(cat => {
            if (cat._id === targetId) {
                return { ...cat, expandedSubcategories: !cat.expandedSubcategories };
            }
            if (cat.subcategories && cat.subcategories.length > 0) {
                return {
                    ...cat,
                    subcategories: recursiveToggle(targetId, cat.subcategories)
                };
            }
            return cat;
        });
    };

    // Count total categories (main + all subcategories recursively)
    const countTotalCategories = (catArray) => {
        return catArray.reduce((total, cat) => {
            let count = 1; // Count this category
            if (cat.subcategories && cat.subcategories.length > 0) {
                count += countTotalCategories(cat.subcategories);
            }
            return total + count;
        }, 0);
    };

    // Flatten all categories (main + all subcategories) for searching
    const flattenCategories = (catArray) => {
        let flattened = [];
        catArray.forEach(cat => {
            flattened.push(cat);
            if (cat.subcategories && cat.subcategories.length > 0) {
                flattened = flattened.concat(flattenCategories(cat.subcategories));
            }
        });
        return flattened;
    };

    // Filter and sort categories
    const getFilteredAndSortedCategories = () => {
        const allCategories = categories;
        let filtered = allCategories;

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = allCategories.filter(cat =>
                cat.name.toLowerCase().includes(query) ||
                (cat.description && cat.description.toLowerCase().includes(query))
            );
        }

        // Sort
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'date-newest':
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                case 'date-oldest':
                    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                case 'products-max':
                    return (b.productCount || 0) - (a.productCount || 0);
                case 'products-min':
                    return (a.productCount || 0) - (b.productCount || 0);
                default:
                    return 0;
            }
        });

        return sorted;
    };

    // Get all flattened categories for plain view (main + all subcategories)
    const getFlattenedCategoriesForPlainView = () => {
        const allCategories = categories;
        let filtered = allCategories;

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const flattened = flattenCategories(allCategories);
            filtered = flattened.filter(cat =>
                cat.name.toLowerCase().includes(query) ||
                (cat.description && cat.description.toLowerCase().includes(query))
            );
        } else {
            filtered = flattenCategories(allCategories);
        }

        // Sort
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'date-newest':
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                case 'date-oldest':
                    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                case 'products-max':
                    return (b.productCount || 0) - (a.productCount || 0);
                case 'products-min':
                    return (a.productCount || 0) - (b.productCount || 0);
                default:
                    return 0;
            }
        });

        return sorted;
    };

    // Helper to get depth of a category (how many levels deep it is)
    const getCategoryDepth = (catId, catArray, currentDepth = 0) => {
        for (let cat of catArray) {
            if (cat._id === catId) return currentDepth;
            if (cat.subcategories && cat.subcategories.length > 0) {
                const depth = getCategoryDepth(catId, cat.subcategories, currentDepth + 1);
                if (depth !== -1) return depth;
            }
        }
        return -1;
    };

    const totalCategoriesCount = countTotalCategories(categories);
    const filteredCategories = getFilteredAndSortedCategories();
    const flattenedCategories = getFlattenedCategoriesForPlainView();

    // Count visible items in menu view (main categories + expanded subcategories)
    const menuViewDisplayCount = (() => {
        if (!searchQuery.trim()) {
            // No search: count all main categories + their visible subcategories
            return filteredCategories.reduce((total, cat) => {
                let count = 1; // Count the main category
                if (cat.expandedSubcategories && cat.subcategories && cat.subcategories.length > 0) {
                    count += cat.subcategories.length; // Add visible subcategories
                }
                return total + count;
            }, 0);
        }
        // With search: only count main categories that match (same as before)
        const query = searchQuery.toLowerCase();
        return reduxCategories.filter(cat =>
            cat.name.toLowerCase().includes(query) ||
            (cat.description && cat.description.toLowerCase().includes(query))
        ).length;
    })();

    return (
        <>
            <div className="flex-1  overflow-auto">
                <div className="p-4">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-stretch gap-4 mb-8">
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                            <div className="rounded-xl shadow-lg p-4 text-white" style={{ backgroundColor: 'var(--color-accent-primary)' }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold uppercase" >Total Categories</p>
                                        <p className="text-xs mt-1" >(Main + All Sub)</p>
                                    </div>
                                    <p className="text-3xl font-bold">{totalCategoriesCount}</p>
                                </div>
                            </div>

                            <div className="rounded-xl shadow-lg p-4 text-white" style={{ backgroundColor: 'var(--color-text-secondary)' }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold uppercase" style={{ opacity: 0.8 }}>Displaying</p>
                                        <p className="text-xs mt-1" style={{ opacity: 0.7 }}>Filtered Results</p>
                                    </div>
                                    <p className="text-3xl font-bold">{viewMode === 'plain' ? flattenedCategories.length : menuViewDisplayCount}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={openAddCategoryModal}
                            className="text-white px-6 py-3 rounded-lg font-semibold transition duration-300 flex items-center justify-center gap-2 shadow-lg whitespace-nowrap h-fit"
                            style={{ backgroundColor: 'var(--color-accent-primary)' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}
                        >
                            <i className="fas fa-plus"></i> Add Category
                        </button>
                    </div>



                    {/* Search, Sort, and View Mode Controls - All in One Row */}
                    <div className="flex flex-col md:flex-row gap-3 mb-6">
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-4 py-2 border rounded-lg outline-none font-semibold transition duration-300"
                            style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-primary)' }}
                            onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent-primary)'; e.target.style.boxShadow = '0 0 0 2px rgba(165, 99, 42, 0.1)'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border-light)'; e.target.style.boxShadow = 'none'; }}
                        />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border rounded-lg outline-none font-semibold min-w-[200px] transition duration-300"
                            style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-primary)' }}
                            onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent-primary)'; e.target.style.boxShadow = '0 0 0 2px rgba(165, 99, 42, 0.1)'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border-light)'; e.target.style.boxShadow = 'none'; }}
                        >
                            <option value="name-asc">Sort: Name (A to Z)</option>
                            <option value="name-desc">Sort: Name (Z to A)</option>
                            <option value="date-newest">Sort: Date (Newest)</option>
                            <option value="date-oldest">Sort: Date (Oldest)</option>
                            <option value="products-max">Sort: Products (Maximum)</option>
                            <option value="products-min">Sort: Products (Minimum)</option>
                        </select>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setViewMode('plain')}
                                className="px-6 py-2.5 rounded-lg font-semibold transition duration-300 whitespace-nowrap"
                                style={{
                                    backgroundColor: viewMode === 'plain' ? 'var(--color-accent-primary)' : 'var(--color-bg-section)',
                                    color: viewMode === 'plain' ? 'white' : 'var(--color-text-primary)',
                                    boxShadow: viewMode === 'plain' ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    if (viewMode !== 'plain') {
                                        e.target.style.backgroundColor = 'var(--color-border-light)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (viewMode !== 'plain') {
                                        e.target.style.backgroundColor = 'var(--color-bg-section)';
                                    }
                                }}
                            >
                                Plain Category
                            </button>
                            <button
                                onClick={() => setViewMode('menu')}
                                className="px-6 py-2.5 rounded-lg font-semibold transition duration-300 whitespace-nowrap"
                                style={{
                                    backgroundColor: viewMode === 'menu' ? 'var(--color-accent-primary)' : 'var(--color-bg-section)',
                                    color: viewMode === 'menu' ? 'white' : 'var(--color-text-primary)',
                                    boxShadow: viewMode === 'menu' ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    if (viewMode !== 'menu') {
                                        e.target.style.backgroundColor = 'var(--color-border-light)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (viewMode !== 'menu') {
                                        e.target.style.backgroundColor = 'var(--color-bg-section)';
                                    }
                                }}
                            >
                                Menu Category
                            </button>
                        </div>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="px-4 py-2 text-white rounded-lg transition-colors font-semibold whitespace-nowrap"
                                style={{ backgroundColor: 'var(--color-accent-primary)' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}
                            >
                                Clear Search
                            </button>
                        )}
                    </div>

                    {/* Main Table Section */}
                    <div className="rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>


                        {/* Categories List */}
                        <div className="overflow-x-auto">
                            {(viewMode === 'plain' ? flattenedCategories : filteredCategories).length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 px-6">
                                    <i className="fas fa-layer-group text-6xl mb-4" style={{ color: 'var(--color-border-light)' }}></i>
                                    <p className="text-lg mb-4" style={{ color: 'var(--color-text-primary)' }}>
                                        {searchQuery ? 'No categories match your search' : 'No categories yet'}
                                    </p>
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="text-white px-6 py-3 rounded-lg font-semibold transition duration-300 inline-flex items-center gap-2 shadow-lg"
                                            style={{ backgroundColor: 'var(--color-accent-primary)' }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}
                                        >
                                            Clear Search
                                        </button>
                                    )}
                                    {!searchQuery && (
                                        <button
                                            onClick={openAddCategoryModal}
                                            className="text-white px-6 py-3 rounded-lg font-semibold transition duration-300 inline-flex items-center gap-2 shadow-lg"
                                            style={{ backgroundColor: 'var(--color-accent-primary)' }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}
                                        >
                                            <i className="fas fa-plus"></i> Create Your First Category
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr style={{ borderBottomWidth: '1px', borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-section)' }}>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                                                <input type="checkbox" className="rounded" />
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Title</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Products</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
                                        {viewMode === 'plain' ? (
                                            // Plain Category View - Show all categories (main + all subcategories) in flat list
                                            flattenedCategories.map((category) => {
                                                const depth = getCategoryDepth(category._id, categories);
                                                const isMain = depth === 0;
                                                const colorSchemes = [
                                                    { bg: 'var(--color-bg-primary)', border: 'var(--color-accent-primary)', tag: 'Main', bgLight: 'var(--color-bg-section)' },
                                                    { bg: 'var(--color-bg-primary)', border: 'var(--color-accent-light)', tag: 'Sub', bgLight: 'var(--color-bg-section)' },
                                                    { bg: 'var(--color-bg-primary)', border: 'var(--color-border)', tag: 'Sub-Sub', bgLight: 'var(--color-bg-section)' },
                                                    { bg: 'var(--color-bg-primary)', border: 'var(--color-accent-primary)', tag: 'Sub³', bgLight: 'var(--color-bg-section)' },
                                                ];
                                                const colorStyle = colorSchemes[Math.min(depth, colorSchemes.length - 1)];
                                                const colors = {
                                                    bg: colorStyle.bgLight,
                                                    border: `border-l-4`,
                                                    borderColor: colorStyle.border,
                                                    text: 'var(--color-text-primary)',
                                                    tag: colorStyle.tag,
                                                    gradient: 'from-indigo-500 to-indigo-600'
                                                };

                                                return (
                                                    <tr key={category._id} className={`${colors.bg} ${colors.border} hover:opacity-80 transition duration-300`}>
                                                        <td className="px-6 py-4">
                                                            <input type="checkbox" className="rounded" />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                {category.image && !failedImages.has(category._id) ? (
                                                                    <img
                                                                        src={category.image.startsWith('http') ? category.image : `${API}${category.image}`}
                                                                        alt={category.name}
                                                                        className="w-10 h-10 object-cover rounded-lg border-2"
                                                                        style={{ borderColor: 'var(--color-accent-primary)' }}
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                            setFailedImages(prev => new Set([...prev, category._id]));
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex text-center items-center justify-center text-xs font-semibold text-gray-600 border-2" style={{ borderColor: 'var(--color-border-light)' }}>
                                                                        No Image
                                                                    </div>
                                                                )}
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                                                            {category.name}
                                                                        </h4>
                                                                        <span className="inline-block px-2 py-1 text-xs font-bold rounded text-white" style={{ backgroundColor: 'var(--color-accent-primary)' }}>
                                                                            {colors.tag}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-block px-3 py-1 rounded-full font-semibold text-sm text-white" style={{ backgroundColor: 'var(--color-accent-primary)' }}>
                                                                {category.productCount || 0}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingCategory(category);
                                                                        setFormData({
                                                                            name: category.name,
                                                                            description: category.description,
                                                                            image: category.image,
                                                                        });
                                                                        setShowAddCategoryModal(true);
                                                                    }}
                                                                    className="bg-gray-800 hover:bg-black text-white p-2 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
                                                                    title="Edit"
                                                                >
                                                                    <i className="fas fa-edit text-sm"></i>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteCategory(category._id)}
                                                                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
                                                                    title="Delete"
                                                                >
                                                                    <i className="fas fa-trash text-sm"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            // Menu Category View - Show nested structure with subcategories
                                            filteredCategories.map((category) => (
                                                <NestedCategoryRows
                                                    key={category._id}
                                                    category={category}
                                                    depth={0}
                                                    onToggle={(targetId) => setCategories(recursiveToggle(targetId, categories))}
                                                    onEdit={handleEditSubcategory}
                                                    onDelete={handleDeleteSubcategory}
                                                    onAddSubcategory={openAddSubcategoryModal}
                                                    onEditMain={handleEditCategory}
                                                    failedImages={failedImages}
                                                    setFailedImages={setFailedImages}
                                                />
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CategoryModal
                showModal={showAddCategoryModal}
                onClose={() => {
                    setShowAddCategoryModal(false);
                    setEditingCategory(null);
                    setOriginalSlug(null);
                    setFormData({ name: '', description: '', image: null });
                    setShouldCreateRedirect(false);
                }}
                title={editingCategory ? 'Edit Category' : 'Add New Category'}
                formData={formData}
                setFormData={setFormData}
                handleAddCategory={handleAddCategory}
                handleImageUpload={handleImageUpload}
                editingCategory={editingCategory}
                originalSlug={originalSlug}
                shouldCreateRedirect={shouldCreateRedirect}
                setShouldCreateRedirect={setShouldCreateRedirect}
            />

            <SubcategoryModal
                showModal={showAddSubcategoryModal}
                onClose={() => {
                    setShowAddSubcategoryModal(false);
                    setEditingCategory(null);
                    setOriginalSlug(null);
                    setFormData({ name: '', description: '', image: null });
                    setShouldCreateRedirect(false);
                }}
                title={editingCategory ? 'Edit Subcategory' : 'Add New Subcategory'}
                formData={formData}
                setFormData={setFormData}
                handleAddSubcategory={handleAddSubcategory}
                handleImageUpload={handleImageUpload}
                editingCategory={editingCategory}
                originalSlug={originalSlug}
                shouldCreateRedirect={shouldCreateRedirect}
                setShouldCreateRedirect={setShouldCreateRedirect}
            />

            {/* Category Products Modal */}
            {showCategoryProducts && selectedCategoryForProducts && (
                <CategoryProducts
                    categoryId={selectedCategoryForProducts.id}
                    categoryName={selectedCategoryForProducts.name}
                    categoryImage={selectedCategoryForProducts.image}
                    productCount={selectedCategoryForProducts.productCount}
                    onClose={() => {
                        setShowCategoryProducts(false);
                        setSelectedCategoryForProducts(null);
                    }}
                    onEditProduct={(product) => {
                    }}
                />
            )}
        </>
    );
};

export default CategoryManagement;