'use client';

import React, { useEffect } from 'react';

import { useElementorBuilder } from '../../context/ElementorBuilderContext';
import toast from 'react-hot-toast';
import BuilderLayout from '../../builder/components/BuilderLayout';

/**
 * ElementorBuilder - Main entry point for the builder
 * This component manages the editing mode and delegates to BuilderLayout
 */
const ElementorBuilder = ({ pageId = 'home' }) => {
    const {
        isEditing,
        currentPage,
        saveStatus,
        isSaving,
        toggleEditMode,
        savePage,
    } = useElementorBuilder();

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isEditing) return;

            // Ctrl+S or Cmd+S = Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                savePage(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isEditing, savePage]);

    if (!isEditing) {
        return null;
    }

    const handleSave = async () => {
        toast.loading('Saving page...', { id: 'save' });
        try {
            await savePage(true);
            toast.success('Page saved successfully!', { id: 'save' });
        } catch (error) {
            toast.error(error.message || 'Failed to save page', { id: 'save' });
        }
    };

    const handleExit = () => {
        if (saveStatus === 'unsaved') {
            const confirmed = window.confirm('You have unsaved changes. Are you sure you want to exit?');
            if (!confirmed) return;
        }
        toggleEditMode();
    };

    return (
        <div className="elementor-builder-wrapper fixed inset-0 z-50 bg-white overflow-hidden flex flex-col">
            {/* BuilderLayout with all controls */}
            <BuilderLayout title={`Editing: ${currentPage || 'home'}`} />
        </div>
    );
};

export default ElementorBuilder;
