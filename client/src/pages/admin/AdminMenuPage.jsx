'use client';

import React, { useEffect, useState, Fragment } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';

const AdminMenuPage = () => {
    const [activeTab, setActiveTab] = useState('browse');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [browseMenu, setBrowseMenu] = useState([]);
    const [topBarMenu, setTopBarMenu] = useState([]);
    const [mainNavMenu, setMainNavMenu] = useState([]);
    const [footerMenu, setFooterMenu] = useState([]);
    const [policiesMenu, setPoliciesMenu] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);
    const [expandedItems, setExpandedItems] = useState({});
    const [showSelectorModal, setShowSelectorModal] = useState(false);
    const [selectorType, setSelectorType] = useState('category');
    const [categoriesList, setCategoriesList] = useState([]);
    const [productsList, setProductsList] = useState([]);
    const [pagesList, setPagesList] = useState([]);
    const [policiesList, setPoliciesList] = useState([]);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [selectorLoading, setSelectorLoading] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);
    const [editingMenuType, setEditingMenuType] = useState('browse');
    const [editLabel, setEditLabel] = useState('');
    const [editUrl, setEditUrl] = useState('');

    const menuConfig = {
        browse: { state: browseMenu, setState: setBrowseMenu, title: 'Shop Category', icon: 'fa-sitemap' },
        topBar: { state: topBarMenu, setState: setTopBarMenu, title: 'Top Bar', icon: 'fa-stream' },
        mainNav: { state: mainNavMenu, setState: setMainNavMenu, title: 'Main Nav', icon: 'fa-bars' },
        footer: { state: footerMenu, setState: setFooterMenu, title: 'Footer', icon: 'fa-link' },
        policies: { state: policiesMenu, setState: setPoliciesMenu, title: 'Policies', icon: 'fa-file' }
    };

    const API = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        const loadMenus = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const url = `${API}/api/settings/menus`;
                console.log(`[AdminMenuPage] Loading menus from: ${url}`);

                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log(`[AdminMenuPage] Menus response status: ${res.status}`);

                if (!res.ok) {
                    throw new Error(`Failed to load menus (${res.status})`);
                }

                const data = await res.json();
                console.log(`[AdminMenuPage] Menus data:`, data);

                setBrowseMenu(data.browseMenu || []);
                setTopBarMenu(data.topBarMenu || []);
                setMainNavMenu(data.mainNavMenu || []);
                setFooterMenu(data.footerMenu || []);
                setPoliciesMenu(data.policiesMenu || []);

                console.log(`[AdminMenuPage] Menus loaded successfully`);
            } catch (error) {
                console.error('[AdminMenuPage] Failed to load menus:', error);
                toast.error(`Failed to load menus: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        loadMenus();
    }, [API]);

    // Reset selected items when selector type changes
    useEffect(() => {
        setSelectedItems(new Set());
    }, [selectorType]);

    const loadSelectorData = async (type) => {
        try {
            setSelectorLoading(true);
            // Use settings API for pages and policies, regular API for categories and products
            const endpoints = {
                category: 'categories',
                product: 'products',
                page: 'settings/pages',  // Changed to settings API
                policy: 'settings/policies'  // Changed to settings API
            };
            const url = `${API}/api/${endpoints[type]}`;
            console.log(`[AdminMenuPage] Loading ${type} from: ${url}`);

            const res = await fetch(url, {
                headers: { 'Accept': 'application/json' }
            });

            console.log(`[AdminMenuPage] Response status for ${type}: ${res.status}`);

            if (!res.ok) {
                console.error(`Failed to load ${type}:`, res.status, res.statusText);
                throw new Error(`Failed to load ${type} (${res.status}). Endpoint may not be available.`);
            }

            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error(`Invalid content type for ${type}:`, contentType);
                throw new Error('Server returned invalid response format (expected JSON)');
            }

            let data;
            try {
                data = await res.json();
                console.log(`[AdminMenuPage] Raw data for ${type}:`, data);
            } catch (parseError) {
                console.error('JSON parse error for', type, ':', parseError);
                throw new Error('Unable to parse server response - endpoint may be misconfigured');
            }

            if (type === 'category') {
                const categories = Array.isArray(data) ? data : data.categories || data.data || [];
                console.log(`[AdminMenuPage] Categories list:`, categories);
                setCategoriesList(categories);
            }
            else if (type === 'product') {
                const products = Array.isArray(data) ? data : data.products || data.data || [];
                console.log(`[AdminMenuPage] Products list:`, products);
                setProductsList(products);
            }
            else if (type === 'page') {
                const pages = Array.isArray(data) ? data : data.pages || data.data || [];
                console.log(`[AdminMenuPage] Pages list:`, pages);
                setPagesList(pages);
            }
            else if (type === 'policy') {
                const policies = Array.isArray(data) ? data : data.policies || data.data || [];
                console.log(`[AdminMenuPage] Policies list:`, policies);
                setPoliciesList(policies);
            }
        } catch (error) {
            console.error('[AdminMenuPage] Selector load error for', type, ':', error.message);
            toast.error(`Failed to load ${type}s: ${error.message}`);
        } finally {
            setSelectorLoading(false);
        }
    };

    const saveAllMenus = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API}/api/settings/menus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ browseMenu, topBarMenu, mainNavMenu, footerMenu, policiesMenu })
            });
            if (!res.ok) throw new Error('Failed');
            toast.success('✓ Menus saved');
        } catch (error) {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const generateMenuItemUrl = (data, type) => {
        if (!data || !data.slug) return '#';
        if (type === 'page') return `/${data.slug}`;
        if (type === 'policy') return `/policies/${data.slug}`;
        return `/${type}/${data.slug}`;
    };

    const addMenuItem = (menuType) => {
        const newItem = { id: `item_${Date.now()}`, label: 'New Item', url: '#', link: '#' };
        if (menuType === 'browse') newItem.submenu = [];
        const currentState = menuConfig[menuType].state;
        menuConfig[menuType].setState([...currentState, newItem]);
        toast.success('Item added');
    };

    const updateMenuItem = (menuType, itemId, updates) => {
        const updateRecursive = (items) => items.map(item =>
            item.id === itemId ? { ...item, ...updates } :
                item.submenu ? { ...item, submenu: updateRecursive(item.submenu) } : item
        );
        const currentState = menuConfig[menuType].state;
        menuConfig[menuType].setState(updateRecursive(currentState));
    };

    const deleteMenuItem = (menuType, itemId) => {
        const deleteRecursive = (items) =>
            items.filter(item => item.id !== itemId).map(item =>
                item.submenu ? { ...item, submenu: deleteRecursive(item.submenu) } : item
            );
        const currentState = menuConfig[menuType].state;
        menuConfig[menuType].setState(deleteRecursive(currentState));
        toast.success('Item deleted');
    };

    const promoteItem = (menuType, itemId) => {
        let found = false;
        const promoteRecursive = (items, parentItems = null, parentIdx = -1) => {
            for (let i = 0; i < items.length; i++) {
                if (items[i].id === itemId && parentItems && parentIdx !== -1) {
                    // Move this item to parent's level, right after parent
                    const item = items[i];
                    items.splice(i, 1);
                    const insertIdx = parentIdx + 1;
                    parentItems.splice(insertIdx, 0, item);
                    found = true;
                    return;
                }
                if (items[i].submenu && items[i].submenu.length > 0) {
                    promoteRecursive(items[i].submenu, items, i);
                }
            }
        };
        promoteRecursive(menuConfig[menuType].state);
        if (found) {
            menuConfig[menuType].setState([...menuConfig[menuType].state]);
            toast.success('Item promoted');
        }
    };

    const demoteItem = (menuType, itemId, position) => {
        let found = false;
        const demoteRecursive = (items) => {
            for (let i = 0; i < items.length; i++) {
                if (items[i].id === itemId && i > 0) {
                    // Make it a child of the previous item
                    const item = items[i];
                    if (!items[i - 1].submenu) items[i - 1].submenu = [];
                    items[i - 1].submenu.push(item);
                    items.splice(i, 1);
                    found = true;
                    return;
                }
                if (items[i].submenu && items[i].submenu.length > 0) {
                    demoteRecursive(items[i].submenu);
                }
            }
        };
        demoteRecursive(menuConfig[menuType].state);
        if (found) {
            menuConfig[menuType].setState([...menuConfig[menuType].state]);
            toast.success('Item demoted');
        }
    };

    const moveItem = (menuType, itemId, direction) => {
        const moveRecursive = (items) => {
            const idx = items.findIndex(i => i.id === itemId);
            if (idx === -1) {
                return items.map(item =>
                    item.submenu ? { ...item, submenu: moveRecursive(item.submenu) } : item
                );
            }
            const newItems = [...items];
            if (direction === 'up' && idx > 0) [newItems[idx], newItems[idx - 1]] = [newItems[idx - 1], newItems[idx]];
            else if (direction === 'down' && idx < items.length - 1) [newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]];
            return newItems;
        };
        const currentState = menuConfig[menuType].state;
        menuConfig[menuType].setState(moveRecursive(currentState));
    };

    const handleDragStart = (e, itemId) => {
        setDraggedItem({ itemId });
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDropReorder = (e, targetId, menuItems, setMenuItems) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggedItem || draggedItem.itemId === targetId) {
            setDraggedItem(null);
            return;
        }

        // Recursively reorder items at any level
        const reorder = (items) => {
            const dragIdx = items.findIndex(i => i.id === draggedItem.itemId);
            const targetIdx = items.findIndex(i => i.id === targetId);

            // Both at this level - swap them
            if (dragIdx !== -1 && targetIdx !== -1) {
                const newItems = [...items];
                const temp = newItems[dragIdx];
                newItems[dragIdx] = newItems[targetIdx];
                newItems[targetIdx] = temp;
                return { items: newItems, found: true };
            }

            // Neither at this level - search in all submenus
            if (dragIdx === -1 && targetIdx === -1) {
                let found = false;
                const newItems = items.map(item => {
                    if (item.submenu && item.submenu.length > 0 && !found) {
                        const result = reorder(item.submenu);
                        if (result.found) {
                            found = true;
                            return { ...item, submenu: result.items };
                        }
                    }
                    return item;
                });
                return { items: newItems, found };
            }

            // One at this level, one not - search in submenus
            const newItems = items.map(item => {
                if (item.submenu && item.submenu.length > 0) {
                    const result = reorder(item.submenu);
                    if (result.found) {
                        return { ...item, submenu: result.items };
                    }
                }
                return item;
            });
            return { items: newItems, found: false };
        };

        const result = reorder(menuItems);
        if (result.found) {
            setMenuItems(result.items);
        }
        setDraggedItem(null);
    };

    const toggleExpanded = (itemId) => {
        setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    const renderBrowseMenu = (items, level = 0, menuType = 'browse') => {
        if (!items?.length) return <div className="text-center py-4 text-gray-400 text-xs"><i className="fas fa-inbox mr-1"></i>No items</div>;

        return (
            <div className={`space-y-2 ${level > 0 ? 'ml-4 pl-3 border-l-2 border-blue-300' : ''}`}>
                {items.map((item, idx) => (
                    <div key={item.id} className="group">
                        <div draggable onDragStart={(e) => handleDragStart(e, item.id)}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'move'; }}
                            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleDropReorder(e, item.id, menuConfig[menuType].state, menuConfig[menuType].setState); }}
                            className={`bg-white border-2 transition ${draggedItem?.itemId === item.id ? 'opacity-50 border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'} rounded-lg p-3 cursor-move`}>

                            <div className="flex items-center gap-2.5">
                                {/* Drag Handle */}
                                <i className="fas fa-grip-vertical text-gray-400 text-sm flex-shrink-0"></i>

                                {/* Item Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-900 text-sm truncate">{item.label}</div>
                                    <div className="text-xs text-gray-500 truncate">{item.url}</div>
                                </div>

                                {/* Type Badge */}
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap flex-shrink-0 ${item.type === 'category' ? 'bg-purple-100 text-purple-700' :
                                    item.type === 'product' ? 'bg-blue-100 text-blue-700' :
                                        item.type === 'page' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}>{item.type || 'custom'}</span>

                                {/* Action Buttons */}
                                <div className="hidden group-hover:flex gap-1 flex-shrink-0">
                                    <button onClick={() => moveItem(menuType, item.id, 'up')} disabled={idx === 0}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 disabled:opacity-30 rounded text-xs transition"
                                        title="Move up">
                                        <i className="fas fa-arrow-up"></i>
                                    </button>
                                    <button onClick={() => moveItem(menuType, item.id, 'down')} disabled={idx === items.length - 1}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 disabled:opacity-30 rounded text-xs transition"
                                        title="Move down">
                                        <i className="fas fa-arrow-down"></i>
                                    </button>
                                    <button onClick={() => demoteItem(menuType, item.id)} disabled={idx === 0}
                                        className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 disabled:opacity-30 rounded text-xs transition"
                                        title="Indent (make submenu)">
                                        <i className="fas fa-indent"></i>
                                    </button>
                                    <button onClick={() => promoteItem(menuType, item.id)} disabled={level === 0}
                                        className="p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 disabled:opacity-30 rounded text-xs transition"
                                        title="Outdent (promote)">
                                        <i className="fas fa-outdent"></i>
                                    </button>
                                    <button onClick={() => {
                                        setEditingItemId(item.id);
                                        setEditingMenuType(menuType);
                                        setEditLabel(item.label);
                                        setEditUrl(item.url);
                                    }} className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded text-xs transition"
                                        title="Edit">
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button onClick={() => deleteMenuItem(menuType, item.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded text-xs transition"
                                        title="Delete">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>

                                {/* Expand/Collapse */}
                                {item.submenu?.length > 0 && (
                                    <button onClick={() => toggleExpanded(item.id)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition"
                                        title={expandedItems[item.id] ? 'Collapse' : 'Expand'}>
                                        <i className={`fas fa-chevron-${expandedItems[item.id] ? 'down' : 'right'} text-sm`}></i>
                                    </button>
                                )}
                            </div>

                            {/* Nested Submenus */}
                            {item.submenu?.length > 0 && expandedItems[item.id] && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                    {renderBrowseMenu(item.submenu, level + 1, menuType)}
                                    <button onClick={() => {
                                        const newItem = { id: `item_${Date.now()}`, label: 'New Item', url: '#', link: '#', submenu: [] };
                                        const updateRecursive = (items) => items.map(i =>
                                            i.id === item.id && i.submenu ? { ...i, submenu: [...i.submenu, newItem] } :
                                                i.submenu ? { ...i, submenu: updateRecursive(i.submenu) } : i
                                        );
                                        menuConfig[menuType].setState(updateRecursive(menuConfig[menuType].state));
                                        toast.success('Submenu item added');
                                    }}
                                        className="w-full mt-2 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded border border-blue-300 font-medium transition">
                                        <i className="fas fa-plus mr-1"></i>Add to {item.label}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderSimpleMenu = (items, menuType) => {
        if (!items?.length) return <div className="text-center py-4 text-gray-400 text-xs"><i className="fas fa-inbox mr-1"></i>No items</div>;

        return (
            <div className="space-y-2">
                {items.map((item, idx) => (
                    <div key={item.id} className="group">
                        <div draggable onDragStart={(e) => handleDragStart(e, item.id)}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'move'; }}
                            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleDropReorder(e, item.id, menuConfig[menuType].state, menuConfig[menuType].setState); }}
                            className={`bg-white border-2 transition ${draggedItem?.itemId === item.id ? 'opacity-50 border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'} rounded-lg p-3 cursor-move`}>

                            <div className="flex items-center gap-2.5">
                                {/* Drag Handle */}
                                <i className="fas fa-grip-vertical text-gray-400 text-sm flex-shrink-0"></i>

                                {/* Item Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-900 text-sm truncate">{item.label}</div>
                                    <div className="text-xs text-gray-500 truncate">{item.url}</div>
                                </div>

                                {/* Action Buttons */}
                                <div className="hidden group-hover:flex gap-1 flex-shrink-0">
                                    <button onClick={() => moveItem(menuType, item.id, 'up')} disabled={idx === 0}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 disabled:opacity-30 rounded text-xs transition"
                                        title="Move up">
                                        <i className="fas fa-arrow-up"></i>
                                    </button>
                                    <button onClick={() => moveItem(menuType, item.id, 'down')} disabled={idx === items.length - 1}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 disabled:opacity-30 rounded text-xs transition"
                                        title="Move down">
                                        <i className="fas fa-arrow-down"></i>
                                    </button>
                                    <button onClick={() => {
                                        setEditingItemId(item.id);
                                        setEditingMenuType(menuType);
                                        setEditLabel(item.label);
                                        setEditUrl(item.url);
                                    }} className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded text-xs transition"
                                        title="Edit">
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button onClick={() => deleteMenuItem(menuType, item.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded text-xs transition"
                                        title="Delete">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const cfg = menuConfig[activeTab];

    return (
        <AdminLayout>
            <div className="p-3 max-w-5xl mx-auto">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-900"><i className="fas fa-list mr-2 text-blue-600"></i>Menu Manager</h1>
                    <p className="text-xs text-gray-600 mt-1">Manage navigation and footer menus</p>
                </div>

                <div className="flex gap-1.5 mb-4 flex-wrap">
                    {Object.entries(menuConfig).map(([key, cfg]) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${activeTab === key
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            <i className={`fas ${cfg.icon} mr-1`}></i>{cfg.title}
                        </button>
                    ))}
                </div>

                {!loading && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3.5">
                        <div className="mb-3">
                            <h2 className="text-lg font-bold text-gray-900">{cfg.title}</h2>
                        </div>

                        <div className="mb-3.5 max-h-[550px] overflow-y-auto">
                            {activeTab === 'browse' ? renderBrowseMenu(cfg.state, 0, activeTab) : renderSimpleMenu(cfg.state, activeTab)}
                        </div>

                        <div className="flex gap-1.5 flex-wrap">
                            <button onClick={() => addMenuItem(activeTab)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-semibold transition">
                                <i className="fas fa-plus mr-1"></i>Add Item
                            </button>
                            <button onClick={() => { setSelectorType('category'); loadSelectorData('category'); setShowSelectorModal(true); }}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg font-semibold transition">
                                <i className="fas fa-folder mr-1"></i>Category
                            </button>
                            <button onClick={() => { setSelectorType('product'); loadSelectorData('product'); setShowSelectorModal(true); }}
                                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded-lg font-semibold transition">
                                <i className="fas fa-box mr-1"></i>Product
                            </button>
                            <button onClick={() => { setSelectorType('page'); loadSelectorData('page'); setShowSelectorModal(true); }}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg font-semibold transition">
                                <i className="fas fa-file mr-1"></i>Page
                            </button>
                            <button onClick={() => { setSelectorType('policy'); loadSelectorData('policy'); setShowSelectorModal(true); }}
                                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-lg font-semibold transition">
                                <i className="fas fa-shield-alt mr-1"></i>Policy
                            </button>
                            <button onClick={saveAllMenus} disabled={saving}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg font-semibold transition disabled:opacity-50 ml-auto">
                                <i className="fas fa-save mr-1"></i>{saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="text-center py-10">
                        <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-2"></i>
                        <p className="text-sm text-gray-600">Loading menus...</p>
                    </div>
                )}

                {/* Edit Modal */}
                {editingItemId && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                            <div className="border-b border-gray-200 p-3 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 text-sm"><i className="fas fa-pen mr-2 text-blue-600"></i>Edit Item</h3>
                                <button onClick={() => setEditingItemId(null)} className="text-gray-400 hover:text-gray-600 text-lg">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="p-3 space-y-2.5">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Label</label>
                                    <input type="text" value={editLabel} onChange={(e) => setEditLabel(e.target.value)}
                                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">URL</label>
                                    <input type="text" value={editUrl} onChange={(e) => setEditUrl(e.target.value)}
                                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                            <div className="border-t border-gray-200 p-3 flex gap-2 justify-end">
                                <button onClick={() => setEditingItemId(null)} className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs rounded-lg font-semibold">
                                    Cancel
                                </button>
                                <button onClick={() => {
                                    updateMenuItem(editingMenuType, editingItemId, { label: editLabel, url: editUrl, link: editUrl });
                                    setEditingItemId(null);
                                    toast.success('Updated');
                                }} className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-semibold">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Selector Modal */}
                {showSelectorModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-3 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 text-sm"><i className="fas fa-check-circle mr-2 text-blue-600"></i>Select {selectorType}s</h3>
                                <button onClick={() => setShowSelectorModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <i className="fas fa-times text-lg"></i>
                                </button>
                            </div>
                            <div className="p-3">
                                {selectorLoading ? (
                                    <div className="text-center py-4"><i className="fas fa-spinner fa-spin text-2xl text-blue-600"></i></div>
                                ) : (
                                    <div className="space-y-1 max-h-64 overflow-y-auto">
                                        {selectorType === 'category' && Array.isArray(categoriesList) && (
                                            <Fragment key="category-list">
                                                {categoriesList.length > 0 ? (
                                                    categoriesList.map(cat => (
                                                        <label key={cat._id} className="flex items-center gap-2 p-1.5 hover:bg-blue-50 rounded cursor-pointer">
                                                            <input type="checkbox" checked={selectedItems.has(cat._id)} onChange={(e) => {
                                                                const newSet = new Set(selectedItems);
                                                                e.target.checked ? newSet.add(cat._id) : newSet.delete(cat._id);
                                                                setSelectedItems(newSet);
                                                            }} className="w-4 h-4" />
                                                            <span className="text-xs text-gray-900">{cat.name}</span>
                                                        </label>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-4 text-gray-400 text-xs">No categories found</div>
                                                )}
                                            </Fragment>
                                        )}
                                        {selectorType === 'product' && Array.isArray(productsList) && (
                                            <Fragment key="product-list">
                                                {productsList.length > 0 ? (
                                                    productsList.slice(0, 50).map(prod => (
                                                        <label key={prod._id} className="flex items-center gap-2 p-1.5 hover:bg-blue-50 rounded cursor-pointer">
                                                            <input type="checkbox" checked={selectedItems.has(prod._id)} onChange={(e) => {
                                                                const newSet = new Set(selectedItems);
                                                                e.target.checked ? newSet.add(prod._id) : newSet.delete(prod._id);
                                                                setSelectedItems(newSet);
                                                            }} className="w-4 h-4" />
                                                            <span className="text-xs text-gray-900">{prod.name}</span>
                                                        </label>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-4 text-gray-400 text-xs">No products found</div>
                                                )}
                                            </Fragment>
                                        )}
                                        {selectorType === 'page' && Array.isArray(pagesList) && (
                                            <Fragment key="page-list">
                                                {pagesList.length > 0 ? (
                                                    pagesList.map(page => (
                                                        <label key={page._id} className="flex items-center gap-2 p-1.5 hover:bg-blue-50 rounded cursor-pointer">
                                                            <input type="checkbox" checked={selectedItems.has(page._id)} onChange={(e) => {
                                                                const newSet = new Set(selectedItems);
                                                                e.target.checked ? newSet.add(page._id) : newSet.delete(page._id);
                                                                setSelectedItems(newSet);
                                                            }} className="w-4 h-4" />
                                                            <span className="text-xs text-gray-900">{page.title}</span>
                                                        </label>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-4 text-gray-400 text-xs">No pages found</div>
                                                )}
                                            </Fragment>
                                        )}
                                        {selectorType === 'policy' && Array.isArray(policiesList) && (
                                            <Fragment key="policy-list">
                                                {policiesList.length > 0 ? (
                                                    policiesList.map(policy => (
                                                        <label key={policy._id} className="flex items-center gap-2 p-1.5 hover:bg-blue-50 rounded cursor-pointer">
                                                            <input type="checkbox" checked={selectedItems.has(policy._id)} onChange={(e) => {
                                                                const newSet = new Set(selectedItems);
                                                                e.target.checked ? newSet.add(policy._id) : newSet.delete(policy._id);
                                                                setSelectedItems(newSet);
                                                            }} className="w-4 h-4" />
                                                            <span className="text-xs text-gray-900">{policy.title || policy.name}</span>
                                                        </label>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-4 text-gray-400 text-xs">No policies found</div>
                                                )}
                                            </Fragment>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 flex gap-2 justify-end">
                                <button onClick={() => setShowSelectorModal(false)} className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs rounded-lg font-semibold">
                                    Cancel
                                </button>
                                <button onClick={() => {
                                    if (selectedItems.size === 0) { toast.error('Select items'); return; }
                                    let itemsToAdd = [];
                                    selectedItems.forEach(id => {
                                        let data = null;
                                        if (selectorType === 'category' && Array.isArray(categoriesList)) data = categoriesList.find(c => c._id === id);
                                        else if (selectorType === 'product' && Array.isArray(productsList)) data = productsList.find(p => p._id === id);
                                        else if (selectorType === 'page' && Array.isArray(pagesList)) data = pagesList.find(p => p._id === id);
                                        else if (selectorType === 'policy' && Array.isArray(policiesList)) data = policiesList.find(p => p._id === id);

                                        if (data) {
                                            itemsToAdd.push({
                                                id: `${selectorType}_${id}`,
                                                label: data.name || data.title,
                                                url: generateMenuItemUrl(data, selectorType),
                                                link: generateMenuItemUrl(data, selectorType),
                                                type: selectorType,
                                                submenu: []
                                            });
                                        }
                                    });

                                    const currentState = menuConfig[activeTab].state;
                                    menuConfig[activeTab].setState([...currentState, ...itemsToAdd]);
                                    toast.success(`✓ Added ${itemsToAdd.length}`);
                                    setShowSelectorModal(false);
                                    setSelectedItems(new Set());
                                }} disabled={selectedItems.size === 0} className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-semibold disabled:opacity-50">
                                    <i className="fas fa-plus mr-1"></i>Add ({selectedItems.size})
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminMenuPage;
