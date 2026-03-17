import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
    createNode,
    findNode,
    findNodeWithPath,
    insertNode,
    removeNode,
    updateNode,
    moveNode,
    duplicateNode,
    reorderChildren,
    getBreadcrumb,
    flattenTree
} from '../utils/nodeSchema';
import { convertOldPageToNewSchema, isNewSchema } from '../utils/schemaMigration';
import { useAuth } from './AuthContext';

const ElementorBuilderContext = createContext();

// Initialize with sample page content
const initializeSamplePage = () => {
    // Root node
    const root = {
        id: 'root',
        kind: 'root',
        props: {},
        style: {},
        advanced: {},
        children: []
    };

    // Section 1 - Hero
    const section1 = {
        id: 'section-1',
        kind: 'section',
        props: { contentWidth: 'full', numColumns: 4, contentWidthMode: 'full_width', boxedMaxWidth: 1140, horizontalPadding: 15 },
        style: { backgroundColor: 'var(--color-accent-secondary)', minHeight: '400px', gap: '20px' },
        advanced: { display: 'grid', direction: 'column' },
        responsive: {
            tablet: {
                props: { numColumns: 2 },
                style: { minHeight: '300px', gap: '16px' }
            },
            mobile: {
                props: { numColumns: 1 },
                style: { minHeight: '250px', gap: '16px' }
            }
        },
        children: []
    };

    // Column 1 - Heading 1
    const col1 = {
        id: 'col-1',
        kind: 'column',
        props: { verticalAlign: 'flex-start', horizontalAlign: 'flex-start', gap: '16px' },
        style: { display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', flex: 1, minWidth: '0' },
        advanced: {},
        children: [
            {
                id: 'heading-1',
                kind: 'widget',
                widgetType: 'heading',
                props: { level: 'h1', content: 'Heading 1' },
                style: { color: 'var(--color-bg-primary)', fontSize: '32px', wordBreak: 'break-word' },
                advanced: {},
                children: []
            }
        ]
    };

    // Column 2 - Heading 2
    const col2 = {
        id: 'col-2',
        kind: 'column',
        props: { verticalAlign: 'flex-start', horizontalAlign: 'flex-start', gap: '16px' },
        style: { display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', flex: 1, minWidth: '0' },
        advanced: {},
        children: [
            {
                id: 'heading-2',
                kind: 'widget',
                widgetType: 'heading',
                props: { level: 'h1', content: 'Heading 2' },
                style: { color: 'var(--color-bg-primary)', fontSize: '32px', wordBreak: 'break-word' },
                advanced: {},
                children: []
            }
        ]
    };

    // Column 3 - Heading 3
    const col3 = {
        id: 'col-3',
        kind: 'column',
        props: { verticalAlign: 'flex-start', horizontalAlign: 'flex-start', gap: '16px' },
        style: { display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', flex: 1, minWidth: '0' },
        advanced: {},
        children: [
            {
                id: 'heading-3',
                kind: 'widget',
                widgetType: 'heading',
                props: { level: 'h1', content: 'Heading 3' },
                style: { color: 'var(--color-bg-primary)', fontSize: '32px', wordBreak: 'break-word' },
                advanced: {},
                children: []
            }
        ]
    };

    // Column 4 - Heading 4
    const col4 = {
        id: 'col-4',
        kind: 'column',
        props: { verticalAlign: 'flex-start', horizontalAlign: 'flex-start', gap: '16px' },
        style: { display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', flex: 1, minWidth: '0' },
        advanced: {},
        children: [
            {
                id: 'heading-4',
                kind: 'widget',
                widgetType: 'heading',
                props: { level: 'h1', content: 'Heading 4' },
                style: { color: 'var(--color-bg-primary)', fontSize: '32px', wordBreak: 'break-word' },
                advanced: {},
                children: []
            }
        ]
    };

    section1.children = [col1, col2, col3, col4];

    // Section 2 - Features
    const section2 = {
        id: 'section-2',
        kind: 'section',
        props: { contentWidth: 'boxed', numColumns: 3, contentWidthMode: 'boxed', boxedMaxWidth: 1140, horizontalPadding: 15 },
        style: { backgroundColor: 'var(--color-bg-primary)', gap: '24px', minHeight: '300px' },
        advanced: { display: 'grid', direction: 'column' },
        responsive: {
            tablet: {
                props: { numColumns: 2 },
                style: { gap: '20px', minHeight: '250px' }
            },
            mobile: {
                props: { numColumns: 1 },
                style: { gap: '16px', minHeight: '200px' }
            }
        },
        children: []
    };

    // Feature columns
    const features = ['Live Editing', 'Responsive Design', 'Easy to Use'].map((name, idx) => ({
        id: `col-feature-${idx}`,
        kind: 'column',
        props: { verticalAlign: 'flex-start', horizontalAlign: 'center' },
        style: { display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' },
        advanced: {},
        children: [
            {
                id: `heading-feature-${idx}`,
                kind: 'widget',
                widgetType: 'heading',
                props: { level: 'h3', content: name },
                style: { color: 'var(--color-text-primary)' },
                advanced: {},
                children: []
            },
            {
                id: `text-feature-${idx}`,
                kind: 'widget',
                widgetType: 'text',
                props: { content: 'Build amazing pages without coding' },
                style: { color: 'var(--color-text-light)', fontSize: '14px' },
                advanced: {},
                children: []
            }
        ]
    }));

    section2.children = features;

    root.children = [section1, section2];
    return root;
};

export const ElementorBuilderProvider = ({ children }) => {
    // Get auth context using the custom hook
    const authContext = useAuth();
    // State - Initialize empty, will be loaded from server
    const [rootNode, setRootNode] = useState(() => {
        // Start with empty root, will be populated by loadPage
        return {
            id: 'root',
            kind: 'root',
            props: {},
            style: {},
            advanced: {},
            children: []
        };
    });
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState('home');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
    const [currentDevice, setCurrentDevice] = useState('desktop'); // 'desktop', 'tablet', 'mobile'

    // History for undo/redo
    const historyRef = useRef([createNode('root', 'root', {}, {}, [])]);
    const historyIndexRef = useRef(0);

    // Debounce timer for autosave
    const autosaveTimerRef = useRef(null);

    // ===== TREE OPERATIONS =====

    /**
     * Update history after state change
     */
    const pushToHistory = useCallback((newRootNode) => {
        // Remove any redo history if we're not at the end
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
        // Add new state
        historyRef.current.push(newRootNode);
        historyIndexRef.current = historyRef.current.length - 1;
    }, []);

    /**
     * Insert new node under parent
     */
    const insertNewNode = useCallback(
        (parentId, nodeOrType, props = {}, style = {}, index = -1) => {
            // Handle two cases:
            // 1. New case: insertNewNode(parentId, nodeObject) from LeftPanel
            // 2. Old case: insertNewNode(parentId, nodeType, props, style, index) from legacy code

            let newNode;
            if (typeof nodeOrType === 'object' && nodeOrType !== null && nodeOrType.id) {
                // Case 1: node object passed directly
                newNode = nodeOrType;
            } else {
                // Case 2: legacy parameters (nodeType, props, style)
                const nodeType = nodeOrType;
                const nodeId = `${nodeType}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
                newNode = createNode(nodeId, nodeType, props, style, []);
            }

            setRootNode((prev) => {
                const updated = insertNode(prev, parentId, newNode, index);
                pushToHistory(updated);
                return updated;
            });

            setSelectedNodeId(newNode.id);
            return newNode.id;
        },
        [pushToHistory]
    );

    /**
     * Delete a node
     */
    const deleteNode = useCallback(
        (nodeId) => {
            if (nodeId === 'root') return;

            setRootNode((prev) => {
                const updated = removeNode(prev, nodeId);
                pushToHistory(updated);
                return updated;
            });

            setSelectedNodeId(null);
        },
        [pushToHistory]
    );

    /**
     * Duplicate a node (insert copy after it in parent)
     */
    const duplicateNodeAction = useCallback(
        (nodeId) => {
            if (nodeId === 'root') return;

            setRootNode((prev) => {
                // Find the node to duplicate
                const nodeToDuplicate = findNode(prev, nodeId);
                if (!nodeToDuplicate) return prev;

                // Deep clone the node with new IDs
                const cloneWithNewIds = (node) => {
                    const newId = `${node.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    return {
                        ...node,
                        id: newId,
                        children: node.children ? node.children.map(cloneWithNewIds) : []
                    };
                };

                const clonedNode = cloneWithNewIds(nodeToDuplicate);

                // Find parent and insert after the original node
                let updated = prev;
                const findAndInsertAfter = (parent) => {
                    if (!parent.children) return false;

                    const index = parent.children.findIndex(child => child.id === nodeId);
                    if (index !== -1) {
                        parent.children.splice(index + 1, 0, clonedNode);
                        return true;
                    }

                    return parent.children.some(child => findAndInsertAfter(child));
                };

                if (nodeId === 'root') return prev;

                // If not root, find parent
                const findParentAndInsert = (node) => {
                    if (!node.children) return false;

                    const index = node.children.findIndex(child => child.id === nodeId);
                    if (index !== -1) {
                        node.children.splice(index + 1, 0, clonedNode);
                        return true;
                    }

                    return node.children.some(child => findParentAndInsert(child));
                };

                findParentAndInsert(updated);
                pushToHistory(updated);
                setSelectedNodeId(clonedNode.id);
                return updated;
            });
        },
        [pushToHistory]
    );

    /**
     * Update node properties
     */
    const updateNodeProps = useCallback(
        (nodeId, updates) => {
            setRootNode((prev) => {
                const updated = updateNode(prev, nodeId, updates);
                pushToHistory(updated);
                return updated;
            });
        },
        [pushToHistory]
    );

    /**
     * Update node style
     */
    const updateNodeStyle = useCallback(
        (nodeId, styleUpdates) => {
            setRootNode((prev) => {
                const currentNode = findNode(prev, nodeId);
                if (!currentNode) return prev;

                const updated = updateNode(prev, nodeId, {
                    style: { ...currentNode.style, ...styleUpdates }
                });
                pushToHistory(updated);
                return updated;
            });
        },
        [pushToHistory]
    );

    /**
     * Update node advanced settings
     */
    const updateNodeAdvanced = useCallback(
        (nodeId, advancedUpdates) => {
            setRootNode((prev) => {
                const currentNode = findNode(prev, nodeId);
                if (!currentNode) return prev;

                const updated = updateNode(prev, nodeId, {
                    advanced: { ...currentNode.advanced, ...advancedUpdates }
                });
                pushToHistory(updated);
                return updated;
            });
        },
        [pushToHistory]
    );

    /**
     * Update node responsive style for tablet/mobile
     */
    const updateNodeResponsiveStyle = useCallback(
        (nodeId, device, styleName, value) => {
            setRootNode((prev) => {
                const currentNode = findNode(prev, nodeId);
                if (!currentNode) {
                    return prev;
                }

                const responsive = currentNode.responsive || {};
                const deviceResponsive = responsive[device] || {};
                const deviceStyle = deviceResponsive.style || {};

                const updated = updateNode(prev, nodeId, {
                    responsive: {
                        ...responsive,
                        [device]: {
                            ...deviceResponsive,
                            style: {
                                ...deviceStyle,
                                [styleName]: value
                            }
                        }
                    }
                });
                pushToHistory(updated);

                return updated;
            });
        },
        [pushToHistory]
    );

    /**
     * Update node responsive advanced for tablet/mobile
     */
    const updateNodeResponsiveAdvanced = useCallback(
        (nodeId, device, advancedName, value) => {
            setRootNode((prev) => {
                const currentNode = findNode(prev, nodeId);
                if (!currentNode) return prev;

                const responsive = currentNode.responsive || {};
                const deviceResponsive = responsive[device] || {};
                const deviceAdvanced = deviceResponsive.advanced || {};

                const updated = updateNode(prev, nodeId, {
                    responsive: {
                        ...responsive,
                        [device]: {
                            ...deviceResponsive,
                            advanced: {
                                ...deviceAdvanced,
                                [advancedName]: value
                            }
                        }
                    }
                });
                pushToHistory(updated);
                return updated;
            });
        },
        [pushToHistory]
    );

    /**
     * Clear responsive override for a property (reset to inherit from desktop)
     */
    const clearResponsiveStyle = useCallback(
        (nodeId, device, styleName) => {
            if (device === 'desktop') return; // Cannot clear desktop styles

            setRootNode((prev) => {
                const currentNode = findNode(prev, nodeId);
                if (!currentNode) return prev;

                const responsive = currentNode.responsive || {};
                const deviceResponsive = responsive[device] || {};
                const deviceStyle = deviceResponsive.style || {};

                // Remove the property from device overrides
                const newDeviceStyle = { ...deviceStyle };
                delete newDeviceStyle[styleName];

                const updated = updateNode(prev, nodeId, {
                    responsive: {
                        ...responsive,
                        [device]: {
                            ...deviceResponsive,
                            style: newDeviceStyle
                        }
                    }
                });
                pushToHistory(updated);
                return updated;
            });
        },
        [pushToHistory]
    );

    /**
     * Clear responsive override for advanced property
     */
    const clearResponsiveAdvanced = useCallback(
        (nodeId, device, advancedName) => {
            if (device === 'desktop') return; // Cannot clear desktop advanced

            setRootNode((prev) => {
                const currentNode = findNode(prev, nodeId);
                if (!currentNode) return prev;

                const responsive = currentNode.responsive || {};
                const deviceResponsive = responsive[device] || {};
                const deviceAdvanced = deviceResponsive.advanced || {};

                // Remove the property from device overrides
                const newDeviceAdvanced = { ...deviceAdvanced };
                delete newDeviceAdvanced[advancedName];

                const updated = updateNode(prev, nodeId, {
                    responsive: {
                        ...responsive,
                        [device]: {
                            ...deviceResponsive,
                            advanced: newDeviceAdvanced
                        }
                    }
                });
                pushToHistory(updated);
                return updated;
            });
        },
        [pushToHistory]
    );

    /**
     * Move node to new parent
     */
    const moveNodeToParent = useCallback(
        (nodeId, targetParentId, index = -1) => {
            setRootNode((prev) => {
                const updated = moveNode(prev, nodeId, targetParentId, index);
                pushToHistory(updated);
                return updated;
            });
        },
        [pushToHistory]
    );

    /**
     * Reorder children of a node
     */
    const reorderChildrenAction = useCallback(
        (parentId, fromIndex, toIndex) => {
            setRootNode((prev) => {
                const updated = reorderChildren(prev, parentId, fromIndex, toIndex);
                pushToHistory(updated);
                return updated;
            });
        },
        [pushToHistory]
    );

    // ===== HISTORY OPERATIONS =====

    const undo = useCallback(() => {
        if (historyIndexRef.current > 0) {
            historyIndexRef.current -= 1;
            setRootNode(historyRef.current[historyIndexRef.current]);
            setSelectedNodeId(null);
        }
    }, []);

    const redo = useCallback(() => {
        if (historyIndexRef.current < historyRef.current.length - 1) {
            historyIndexRef.current += 1;
            setRootNode(historyRef.current[historyIndexRef.current]);
            setSelectedNodeId(null);
        }
    }, []);

    const canUndo = historyIndexRef.current > 0;
    const canRedo = historyIndexRef.current < historyRef.current.length - 1;

    // ===== DATA OPERATIONS =====

    /**
     * Fix corrupted data where children are strings instead of arrays
     */
    const fixCorruptedChildren = useCallback((nodes) => {
        if (!Array.isArray(nodes)) return nodes;
        return nodes.map(node => {
            if (node && typeof node === 'object') {
                // If children is a string (corrupted), convert to empty array
                if (typeof node.children === 'string') {
                    node.children = [];
                } else if (Array.isArray(node.children)) {
                    // Recursively fix nested children
                    node.children = fixCorruptedChildren(node.children);
                }
            }
            return node;
        });
    }, []);

    /**
     * Load page configuration from server
     */
    const loadPage = useCallback(
        async (pageName) => {
            try {
                const response = await fetch(`/api/page-config/${pageName}`);
                if (response.ok) {
                    const pageData = await response.json();
                    let nodeData;

                    // Check if we have a sections array (new format)
                    if (pageData.sections && Array.isArray(pageData.sections)) {
                        // Fix corrupted children in sections
                        const fixedSections = fixCorruptedChildren(pageData.sections);
                        
                        // If sections is not empty, wrap it in a root node
                        if (fixedSections.length > 0) {
                            nodeData = {
                                id: 'root',
                                kind: 'root',
                                props: {},
                                style: {},
                                advanced: {},
                                children: fixedSections
                            };
                        } else {
                            // Empty sections, create empty root
                            nodeData = createNode('root', 'root', {}, {}, []);
                        }
                    } else {
                        // Already in tree format or invalid
                        nodeData = pageData.kind ? pageData : createNode('root', 'root', {}, {}, []);
                    }

                    // Auto-convert old schema to new if needed
                    if (!isNewSchema(nodeData)) {
                        nodeData = convertOldPageToNewSchema(nodeData);
                    }

                    setRootNode(nodeData);
                    historyRef.current = [nodeData];
                    historyIndexRef.current = 0;
                    setSelectedNodeId(null);
                    return nodeData;
                } else if (response.status === 404) {
                    // Create new empty page
                    const newRoot = createNode('root', 'root', {}, {}, []);
                    setRootNode(newRoot);
                    historyRef.current = [newRoot];
                    historyIndexRef.current = 0;
                    return newRoot;
                }
            } catch (error) {setSaveStatus('error');
            }
        },
        [fixCorruptedChildren]
    );

    /**
     * Save page to server with debounce
     */
    const savePage = useCallback(
        async (force = false) => {
            return new Promise((resolve, reject) => {
                const doSave = async () => {
                    setSaveStatus('saving');
                    try {
                        // Check if user is authenticated
                        if (!authContext?.token && !authContext?.user) {
                            throw new Error('Save failed: You must be logged in to save. Please login with your admin account.');
                        }

                        // Check if user is admin
                        if (!authContext?.isAdmin) {
                            throw new Error('Save failed: Only admins can save pages. Please login with an admin account.');
                        }

                        const token =
                            localStorage.getItem('token') || localStorage.getItem('adminToken') || localStorage.getItem('authToken');

                        if (!token) {
                            throw new Error('Save failed: No authentication token found. Please login again.');
                        }

                        // Transform rootNode tree structure into the format expected by the server
                        // Include full node structure with responsive data
                        const payload = {
                            sections: rootNode.children || [],
                            meta: {
                                title: currentPage,
                                description: '',
                                layout: 'default'
                            }
                        };

                        // Check for responsive data in payload
                        const findResponsive = (nodes) => {
                            if (!Array.isArray(nodes)) return [];
                            const responsive = [];
                            for (const node of nodes) {
                                if (node.responsive) {
                                    responsive.push({
                                        id: node.id,
                                        responsive: node.responsive
                                    });
                                }
                                if (node.children) {
                                    responsive.push(...findResponsive(node.children));
                                }
                            }
                            return responsive;
                        };

                        const responsiveData = findResponsive(payload.sections);

                        const response = await fetch(`/api/page-config/${currentPage}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify(payload)
                        });

                        if (!response.ok) {
                            const errorData = await response.json().catch(() => ({}));
                            const errorMsg = errorData.message || response.statusText;
                            if (response.status === 401) {
                                throw new Error(`Save failed: Unauthorized - ${errorMsg}. Your session may have expired. Please login again.`);
                            }
                            if (response.status === 403) {
                                throw new Error(`Save failed: Forbidden - ${errorMsg}. Admin access required.`);
                            }
                            throw new Error(`Save failed: ${errorMsg}`);
                        }

                        setSaveStatus('saved');
                        setTimeout(() => setSaveStatus('idle'), 2000);
                        resolve({ success: true });
                    } catch (error) {
                        setSaveStatus('error');
                        reject(error);
                    }
                };

                if (force) {
                    doSave();
                } else {
                    // Debounce: wait 2 seconds after last change
                    if (autosaveTimerRef.current) {
                        clearTimeout(autosaveTimerRef.current);
                    }
                    autosaveTimerRef.current = setTimeout(doSave, 2000);
                }
            });
        },
        [currentPage, rootNode]
    );

    /**
     * Toggle edit mode
     */
    const toggleEditMode = useCallback(
        async (pageName = 'home') => {
            if (!isEditing) {
                setCurrentPage(pageName);
                await loadPage(pageName);
            }
            setIsEditing(!isEditing);
        },
        [isEditing, loadPage]
    );

    // ===== SELECTION & NAVIGATION =====

    const selectNode = useCallback((nodeId) => {
        setSelectedNodeId(nodeId);
    }, []);

    const getSelectedNode = useCallback(() => {
        return findNode(rootNode, selectedNodeId || '');
    }, [rootNode, selectedNodeId]);

    const getBreadcrumbPath = useCallback(() => {
        return getBreadcrumb(rootNode, selectedNodeId || '');
    }, [rootNode, selectedNodeId]);

    const flattenedNodes = flattenTree(rootNode);

    // ===== AUTO-SAVE EFFECT =====
    useEffect(() => {
        // Trigger autosave when rootNode changes (with debounce)
        if (isEditing && rootNode) {
            if (autosaveTimerRef.current) {
                clearTimeout(autosaveTimerRef.current);
            }
            autosaveTimerRef.current = setTimeout(() => {
                savePage(false);
            }, 2000); // Wait 2 seconds after last change before autosaving
        }

        return () => {
            if (autosaveTimerRef.current) {
                clearTimeout(autosaveTimerRef.current);
            }
        };
    }, [rootNode, isEditing, savePage]);

    // ===== CONTEXT VALUE =====

    const value = {
        // State
        rootNode,
        selectedNodeId,
        isEditing,
        currentPage,
        isSaving,
        saveStatus,
        currentDevice,
        setCurrentDevice,
        canUndo,
        canRedo,
        flattenedNodes,

        // Tree operations
        insertNewNode,
        deleteNode,
        updateNodeProps,
        updateNodeStyle,
        updateNodeAdvanced,
        updateNodeResponsiveStyle,
        updateNodeResponsiveAdvanced,
        clearResponsiveStyle,
        clearResponsiveAdvanced,
        moveNodeToParent,
        duplicateNodeAction,
        reorderChildrenAction,
        // History
        undo,
        redo,
        // Data operations
        loadPage,
        savePage,
        toggleEditMode,
        // Selection
        selectNode,
        getSelectedNode,
        getBreadcrumbPath,
        // Utilities
        findNode: (nodeId) => findNode(rootNode, nodeId),
        setRootNode
    };

    return (
        <ElementorBuilderContext.Provider value={value}>{children}</ElementorBuilderContext.Provider>
    );
};

export const useElementorBuilder = () => {
    const context = useContext(ElementorBuilderContext);
    if (!context) {
        throw new Error('useElementorBuilder must be used within ElementorBuilderProvider');
    }
    return context;
};

export default ElementorBuilderContext;