import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import ElementorEditButton from '../components/ElementorBuilder/ElementorEditButton';
import NodeRenderer from '../components/ElementorBuilder/NodeRenderer';
import { useElementorBuilder } from '../context/ElementorBuilderContext';
import { fetchProducts } from '../redux/slices/productSlice';
import { fetchCategories } from '../redux/slices/categorySlice';

/**
 * HomePageElementor - New Elementor-based home page
 * Uses the new node-tree schema and responsive builder
 */
const HomePageElementor = () => {
    const dispatch = useDispatch();
    const { rootNode, isEditing, selectNode, selectedNodeId, loadPage } = useElementorBuilder();

    // Load page config on mount
    useEffect(() => {
        loadPage('home');
        dispatch(fetchCategories());
        dispatch(fetchProducts());
    }, [loadPage, dispatch]);

    if (!rootNode) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <div className={isEditing ? 'bg-gray-50' : 'bg-white'}>
            {/* Render node tree */}
            <div className={isEditing ? 'p-4' : ''}>
                <NodeRenderer
                    node={rootNode}
                    device='desktop'
                    isSelected={false}
                    onSelect={isEditing ? selectNode : undefined}
                />
            </div>

            {/* Edit button (visible to admins) */}
            <ElementorEditButton pageName="home" />
        </div>
    );
};

export default HomePageElementor;