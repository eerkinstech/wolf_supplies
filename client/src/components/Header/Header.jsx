'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cachedJsonFetch } from '@/utils/apiCache';

const Header = ({ hideMenu = false }) => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [mobileSearchQuery, setMobileSearchQuery] = useState('');
    const [desktopSearchQuery, setDesktopSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isMobileListening, setIsMobileListening] = useState(false);
    const [employeeFirstPage, setEmployeeFirstPage] = useState(null);
    const navigate = useNavigate();
    const { logout, isAuthenticated, user, isAdmin } = useAuth();
    const { totalQuantity } = useSelector((state) => state.cart);
    const { totalItems: wishlistCount } = useSelector((state) => state.wishlist);
    const { categories } = useSelector((state) => state.category);
    const dispatch = useDispatch();
    const desktopSearchRef = useRef(null);
    const mobileSearchRef = useRef(null);
    const browseMenuTimeoutRef = useRef(null);

    // local saved menu from settings (fetched below)
    const [browseMenu, setBrowseMenu] = useState([]);
    const [topBarMenu, setTopBarMenu] = useState([]);
    const [mainNavMenu, setMainNavMenu] = useState([]);

    // Get only main categories from Redux (defensive: ensure array)
    const mainCategories = Array.isArray(categories) ? categories.filter(c => c && c.level === 'main') : [];

    // Menu source: prefer saved browseMenu from settings, otherwise fall back to categories
    const menuSource = (browseMenu && browseMenu.length > 0) ? browseMenu : mainCategories;
    const [activeMenuPath, setActiveMenuPath] = useState([0]); // Track path: [mainIdx, level2Idx, level3Idx, ...]
    const [browseOpen, setBrowseOpen] = useState(false);
    const [expandedMobileMenus, setExpandedMobileMenus] = useState({});

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const handleMobileSearchSubmit = (e) => {
        e?.preventDefault();
        const q = mobileSearchQuery?.trim();
        setMobileSearchOpen(false);
        if (q) {
            navigate(`/products?search=${encodeURIComponent(q)}`);
        } else {
            navigate('/products');
        }
    };

    const handleDesktopSearchSubmit = (e) => {
        e?.preventDefault();
        const q = desktopSearchQuery?.trim();
        if (q) {
            navigate(`/products?search=${encodeURIComponent(q)}`);
        } else {
            navigate('/products');
        }
    };

    // Voice Search Handler
    const startVoiceSearch = (isMobile = false) => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.error('Voice search is not supported in your browser');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = true;

        if (isMobile) {
            setIsMobileListening(true);
        } else {
            setIsListening(true);
        }

        recognition.onstart = () => {
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            if (isMobile) {
                setMobileSearchQuery(finalTranscript || interimTranscript);
            } else {
                setDesktopSearchQuery(finalTranscript || interimTranscript);
            }
        };

        recognition.onerror = (event) => {
            if (event.error !== 'no-speech') {
                toast.error('Error in voice search. Please try again.');
            }
            if (isMobile) {
                setIsMobileListening(false);
            } else {
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            if (isMobile) {
                setIsMobileListening(false);
            } else {
                setIsListening(false);
            }
        };

        recognition.start();
    };

    // Close mobile menu/search on Escape and prevent background scroll when open
    const mobileMenuRef = useRef(null);
    const searchInputRef = useRef(null);
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                if (mobileMenuOpen) setMobileMenuOpen(false);
                if (mobileSearchOpen) setMobileSearchOpen(false);
            }
        };
        document.addEventListener('keydown', onKey);

        // lock scroll when either overlay is open
        if (mobileMenuOpen || mobileSearchOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen, mobileSearchOpen]);

    // Autofocus the mobile search input when opening the modal
    useEffect(() => {
        if (mobileSearchOpen && searchInputRef.current) {
            // small timeout to wait for animation
            setTimeout(() => searchInputRef.current.focus(), 80);
        }
    }, [mobileSearchOpen]);

    // Validate that all menu items have links (recursively check nested items)
    const validateMenuLinks = (items, path = 'root') => {
        if (!items || !Array.isArray(items)) return;
        items.forEach((item, idx) => {
            const itemPath = `${path}[${idx}]`;
            const hasLink = item.url || item.link;
            const linkValue = item.url || item.link;
            // Recursively check submenu items
            const submenuItems = item.submenu || item.sub || [];
            if (submenuItems.length > 0) {
                validateMenuLinks(submenuItems, itemPath);
            }
        });
    };

    // Load saved menus from server (falls back to defaults if empty)
    useEffect(() => {
        const loadMenus = async () => {
            try {
                const API = import.meta.env.VITE_API_URL || '';
                const url = API ? `${API}/api/settings/menus` : '/api/settings/menus';
                const data = await cachedJsonFetch(url);

                if (data.browseMenu && Array.isArray(data.browseMenu)) {
                    validateMenuLinks(data.browseMenu);
                    setBrowseMenu(data.browseMenu);
                }
                if (data.topBarMenu && Array.isArray(data.topBarMenu)) {
                    validateMenuLinks(data.topBarMenu);
                    setTopBarMenu(data.topBarMenu);
                }
                if (data.mainNavMenu && Array.isArray(data.mainNavMenu)) {
                    validateMenuLinks(data.mainNavMenu);
                    setMainNavMenu(data.mainNavMenu);
                }
            } catch (err) {
            }
        };
        loadMenus();
    }, []);

    // Fetch wishlist count if authenticated
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            import('../../redux/slices/wishlistSlice').then(module => {
                if (module.fetchWishlist) dispatch(module.fetchWishlist());
            }).catch(() => { });
        }
    }, [dispatch]);

    // Load employee first accessible page from localStorage
    useEffect(() => {
        const firstPage = localStorage.getItem('employeeFirstAccessiblePage');
        if (firstPage) {
            setEmployeeFirstPage(firstPage);
        }
    }, [isAuthenticated]);

    // Recursive function to render nested menus as dropdowns on hover
    const renderNestedMenu = (items, level = 0) => {
        if (!items || items.length === 0) return null;

        return (
            <div className="space-y-0">
                {items.map((item, idx) => {
                    const hasSubmenu = (item.submenu && item.submenu.length > 0) || (item.sub && item.sub.length > 0);
                    const submenuItems = item.submenu || item.sub || [];

                    return (
                        <div key={item.id || `item_${level}_${idx}`} className="relative group">
                            <Link
                                to={item.url || item.link || '#'}
                                className={`block px-4 py-2 rounded transition duration-150 ${level === 0
                                    ? 'text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] font-semibold text-sm'
                                    : 'text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] text-sm px-3 py-2'
                                    } ${hasSubmenu ? 'flex items-center justify-between' : ''}`}
                            >
                                {item.label || item.name}
                                {hasSubmenu && level === 0 && <i className="fas fa-chevron-down text-xs ml-2"></i>}
                            </Link>

                            {/* Dropdown submenu - only visible on hover */}
                            {hasSubmenu && (
                                <div className="absolute left-0 top-full hidden group-hover:block bg-white shadow-lg rounded-lg z-50 min-w-max border border-[var(--color-border-light)]">
                                    {renderNestedMenu(submenuItems, level + 1)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Recursive function for mobile menu rendering with expand/collapse
    const toggleMobileMenuExpand = (itemId) => {
        setExpandedMobileMenus((prev) => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const renderMobileNestedMenu = (items, parentId = 'root') => {
        if (!items || items.length === 0) return null;

        return (
            <div className="space-y-1">
                {items.map((item, idx) => {
                    const itemId = `${parentId}_${item.id || idx}`;
                    const submenuItems = item.submenu || item.sub || [];
                    const hasSubmenu = submenuItems && submenuItems.length > 0;
                    const isExpanded = expandedMobileMenus[itemId];

                    return (
                        <div key={itemId} className="ml-4">
                            <div className="flex items-center justify-between">
                                <Link
                                    to={item.url || item.link || '#'}
                                    className="flex-1 px-3 py-2 text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg text-sm font-semibold transition duration-150"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.label || item.name}
                                </Link>
                                {hasSubmenu && (
                                    <button
                                        onClick={() => toggleMobileMenuExpand(itemId)}
                                        className="px-3 py-2 text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] rounded-lg transition duration-150"
                                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                    >
                                        {isExpanded ? '▼' : '▶'}
                                    </button>
                                )}
                            </div>
                            {hasSubmenu && isExpanded && renderMobileNestedMenu(submenuItems, itemId)}
                        </div>
                    );
                })}
            </div>
        );
    };

    const getActiveSubmenuItems = (items, currentPath) => {
        let currentLevel = items;
        let nextLevel = [];

        for (let depth = 0; depth < currentPath.length; depth++) {
            const itemIndex = currentPath[depth];
            if (itemIndex == null || itemIndex < 0 || itemIndex >= currentLevel.length) {
                break;
            }

            const currentItem = currentLevel[itemIndex];
            nextLevel = (currentItem?.submenu || currentItem?.sub) || [];
            if (nextLevel.length === 0) {
                break;
            }

            currentLevel = nextLevel;
        }

        return nextLevel;
    };

    return (
        <header className="w-full bg-[var(--color-bg-primary)] z-50">
            {/* Top Navigation Bar - Hide on Home Page if duplicate */}

            <div className="bg-[var(--color-accent-primary)] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
                    <div className="flex justify-between items-center text-xs sm:text-sm md:text-base">
                        <div className="flex items-center gap-4 sm:gap-6">
                            {/* Mobile Phone - Shown on mobile, hidden on desktop */}
                            <a href="tel:+447398998101" className="hover:text-[var(--color-bg-section)] md:hidden flex items-center gap-1.5 transition duration-300 font-semibold whitespace-nowrap">
                                <i className="fas fa-phone"></i> <span>+447398998101</span>
                            </a>

                            {topBarMenu.length > 0 ? (
                                topBarMenu.map((item, idx) => (
                                    <div key={item.id || `topbar_${idx}`} className="flex items-center gap-4 sm:gap-6">
                                        <Link to={item.url || item.link || '#'} className="hover:text-[var(--color-bg-section)] hidden sm:block transition duration-300 font-semibold whitespace-nowrap">
                                            {item.label || item.name}
                                        </Link>
                                        {idx < topBarMenu.length - 1 && (
                                            <div className="hidden sm:block text-white text-opacity-60">|</div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <>
                                    <Link to="/about" className="hover:text-[var(--color-bg-section)] hidden sm:block transition duration-300 font-semibold whitespace-nowrap">
                                        About Us
                                    </Link>
                                    <div className="hidden sm:block text-white text-opacity-60">|</div>
                                    <Link to="/policies/shipping" className="hidden sm:block hover:text-[var(--color-bg-section)] transition duration-300 font-semibold">
                                        Shipping
                                    </Link>
                                    <div className="hidden sm:block text-white text-opacity-60">|</div>
                                    <Link to="/policies/returns" className="hidden md:block hover:text-[var(--color-bg-section)] transition duration-300 font-semibold">
                                        Return & Refunds
                                    </Link>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-3 sm:gap-5">
                            <a href="mailto:sales@wolfsupplies.co.uk" className="hover:text-[var(--color-bg-section)] transition duration-300 font-semibold whitespace-nowrap flex items-center gap-1.5">
                                <i className="fas fa-envelope"></i> sales@wolfsupplies.co.uk
                            </a>
                            {isAuthenticated ? (
                                <div className="flex items-center gap-3">
                                    <div className="relative group hidden sm:block">
                                        <button className="hover:text-[var(--color-bg-section)] transition duration-300 font-semibold flex items-center gap-1.5 whitespace-nowrap">
                                            <i className="fas fa-user"></i> {user?.name || 'User'} <i className="fas fa-chevron-down text-xs"></i>
                                        </button>
                                        <div className="absolute right-0 mt-1 w-48 bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-300 z-50">
                                            <div className="px-4 py-2.5 border-b border-[var(--color-border-light)] text-xs text-[var(--color-text-light)]">
                                                {user?.email}
                                            </div>
                                            {(isAdmin || user?.customRole) && (
                                                <>
                                                    <Link to={isAdmin ? '/admin/dashboard' : (employeeFirstPage || '/admin/dashboard')} className="px-4 py-2.5 hover:bg-[var(--color-bg-section)] text-sm flex items-center gap-2">
                                                        <i className="fas fa-user-shield" style={{ color: 'var(--color-accent-primary)' }}></i> {isAdmin ? 'Admin Dashboard' : 'Employee'}
                                                    </Link>
                                                    <div className="border-b border-[var(--color-border-light)]"></div>
                                                </>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2.5 hover:bg-[var(--color-border-light)] text-sm rounded-b-lg flex items-center gap-2 text-[var(--color-text-primary)] font-semibold"
                                            >
                                                <i className="fas fa-sign-out-alt"></i> Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>


            {/* Main Header */}
            <div className="bg-[var(--color-bg-primary)] border-b border-[var(--color-border-light)]">
                <div className="max-w-7xl mx-auto sm:px-2 lg:px-2">
                    <div className='px-2 py-4 border-b border-[var(--color-border-light)]'>
                        <div className="flex md:flex-row flex-row items-center md:justify-between md:gap-6 gap-0">
                            {/* Mobile Menu Toggle - Left Column */}
                            <button
                                onClick={() => { setMobileSearchOpen(false); setMobileMenuOpen(!mobileMenuOpen); }}
                                className="md:hidden text-2xl text-gray-700 ml-2 hover:text-gray-400 transition duration-300 flex-shrink-0"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? <i className="fas fa-times"></i> : <i className="fas fa-bars"></i>}
                            </button>

                            {/* Logo - Center on Mobile, Left on Desktop */}
                            <Link to="/" className="flex items-center gap-2 flex-shrink-0 md:flex-shrink-0 md:flex-1 md:flex-none md:order-first flex-1 justify-center md:justify-start">
                                <img src="/Wolf Supplies LTD.png" alt="Wolf Supplies" className="h-24 w-auto object-contain" />
                            </Link>

                            {/* Search Bar - Main (Desktop Only) */}
                            <div className="flex-1 mx-4 md:mx-6 hidden lg:block">
                                <form onSubmit={handleDesktopSearchSubmit} className="relative w-full flex items-center">
                                    <input
                                        ref={desktopSearchRef}
                                        type="text"
                                        value={desktopSearchQuery}
                                        onChange={(e) => setDesktopSearchQuery(e.target.value)}
                                        placeholder={isListening ? "Speak..." : "Search for a product or brand"}
                                        className="w-full h-12 md:h-14 px-6 rounded-l-full border border-[var(--color-border-light)] placeholder-[var(--color-text-muted)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] transition duration-200 bg-[var(--color-bg-primary)]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => startVoiceSearch(false)}
                                        className={`h-12 md:h-14 px-4 flex items-center justify-center transition duration-300 ${isListening ? 'bg-[var(--color-error)] text-white' : 'bg-[var(--color-bg-section)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'}`}
                                        title="Voice Search"
                                        aria-label="Voice search"
                                    >
                                        <i className="fas fa-microphone text-lg"></i>
                                    </button>
                                    <button
                                        type="submit"
                                        className="h-12 md:h-14 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] text-white px-5 rounded-r-full flex items-center justify-center shadow-md transition duration-300">
                                        <i className="fas fa-magnifying-glass text-lg md:text-xl"></i>
                                    </button>
                                </form>
                            </div>

                            {/* Right Actions - Right Column */}
                            <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
                                {/* Mobile Search Toggle */}
                                <button
                                    onClick={() => { setMobileMenuOpen(false); setMobileSearchOpen(true); setMobileSearchQuery(''); }}
                                    className="md:hidden ml-2 text-lg text-gray-700 hover:text-gray-400 transition duration-300"
                                    aria-label="Open search"
                                >
                                    <i className="fas fa-magnifying-glass"></i>
                                </button>

                                {/* Edit Page Button - Only for Admin/Editor
                                {isAdmin && (
                                    <button
                                        onClick={() => toggleEditMode()}
                                        className="text-gray-700 hover:text-gray-900 transition duration-300 p-2 hover:bg-gray-200 rounded-lg"
                                        title="Edit Page"
                                    >
                                        <i className="fas fa-pen text-lg md:text-xl"></i>
                                    </button>
                                )} */}

                                {/* Wishlist */}
                                <Link to="/wishlist" className="relative text-[var(--color-text-light)] hidden lg:block hover:text-[var(--color-accent-primary)] transition duration-300 p-2 hover:bg-[var(--color-bg-section)] rounded-lg">
                                    <i className="fas fa-heart text-lg md:text-xl"></i>
                                    {wishlistCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-[var(--color-error)] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Order Lookup */}
                                <Link to="/order-lookup" className="text-[var(--color-text-light)] hidden lg:block hover:text-[var(--color-accent-primary)] transition duration-300 p-2 hover:bg-[var(--color-bg-section)] rounded-lg" title="Order Lookup">
                                    <i className="fas fa-box text-lg md:text-xl"></i>
                                </Link>

                                {/* Cart */}
                                <Link to="/cart" className="relative text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-300 p-2 hover:bg-[var(--color-bg-section)] rounded-lg">
                                    <i className="fas fa-shopping-cart text-lg md:text-xl"></i>
                                    {totalQuantity > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-[var(--color-error)] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                            {totalQuantity}
                                        </span>
                                    )}
                                </Link>

                                {/* Phone - Hidden on Mobile */}
                                <div className="hidden md:flex items-center gap-2 bg-[var(--color-accent-primary)] text-white px-3 md:px-4 py-2 rounded-lg whitespace-nowrap">
                                    <i className="fas fa-phone text-base md:text-lg"></i>
                                    <span className="font-bold text-sm md:text-base">
                                        <a href="tel:+447398998101">
                                            +447398998101
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category Menu - Desktop Only - Multi-Column Progressive Menu */}
                    {!hideMenu && location.pathname !== '/' && (
                        <div
                            className="hidden md:block sticky top-0 w-full bg-white z-30"
                            onMouseEnter={() => {
                                if (browseMenuTimeoutRef.current) clearTimeout(browseMenuTimeoutRef.current);
                            }}
                            onMouseLeave={() => {
                                browseMenuTimeoutRef.current = setTimeout(() => {
                                    setBrowseOpen(false);
                                    setActiveMenuPath([0]);
                                }, 150);
                            }}
                        >
                            {/* Top Bar: Browse Button + Main Navigation */}
                            <div className="flex items-center gap-0 px-4 overflow-x-auto border-y border-[var(--color-border-light)]">
                                {/* Browse Categories Button */}
                                <button
                                    onMouseEnter={() => {
                                        if (browseMenuTimeoutRef.current) clearTimeout(browseMenuTimeoutRef.current);
                                        setBrowseOpen(true);
                                    }}
                                className="group flex items-center gap-2 text-black hover:bg-[var(--color-accent-primary)] hover:text-white transition duration-300 font-bold text-lg whitespace-nowrap w-[270px] px-6 py-3"
                                >
                                    <svg
                                        viewBox="0 0 16 12"
                                        width="22"
                                        height="22"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.4"
                                        className="text-black transition-colors duration-300 group-hover:text-white"
                                    >
                                        <line x1="1" y1="2" x2="15" y2="2"></line>
                                        <line x1="1" y1="6" x2="12" y2="6"></line>
                                        <line x1="1" y1="10" x2="8" y2="10"></line>
                                    </svg>
                                    <span className="text-black transition-colors duration-300 group-hover:text-white">
                                        Shop By Category
                                    </span>
                                </button>

                                {/* Vertical Divider */}
                                <div className="h-7 w-px bg-[var(--color-border-light)] flex-shrink-0"></div>

                                {/* Main Navigation - Shows all items from menuSource */}
                                <nav className="flex items-center gap-0 flex-1">
                                    {mainNavMenu.length > 0 ? (
                                        mainNavMenu.map((item, index) => (
                                            <Link
                                                key={item.id || item.name}
                                                to={item.url || item.link || '#'}
                                                className={`px-10 py-2 hover:text-[var(--color-accent-primary)] font-semibold text-[var(--color-text-light)] whitespace-nowrap ${index > 0 ? 'border-l border-[var(--color-border-light)]' : ''}`}
                                            >
                                                {item.label || item.name}
                                            </Link>
                                        ))
                                    ) : (
                                        <>
                                            <Link
                                                to="/"
                                                className="px-4 py-2 hover:text-[var(--color-accent-primary)] font-semibold text-[var(--color-text-light)] whitespace-nowrap"
                                            >
                                                Home
                                            </Link>
                                            <Link
                                                to="/about"
                                                className="px-4 py-2 hover:text-[var(--color-accent-primary)] font-semibold text-[var(--color-text-light)] whitespace-nowrap"
                                            >
                                                About Us
                                            </Link>
                                            <Link
                                                to="/products"
                                                className="px-4 py-2 hover:text-[var(--color-accent-primary)] font-semibold text-[var(--color-text-light)] whitespace-nowrap"
                                            >
                                                Shop
                                            </Link>

                                            <Link
                                                to="/contact"
                                                className="px-4 py-2 hover:text-[var(--color-accent-primary)] font-semibold text-[var(--color-text-light)] whitespace-nowrap"
                                            >
                                                Contact
                                            </Link>
                                        </>
                                    )}
                                </nav>
                            </div>

                            {/* Mega Menu Panel - Progressive Multi-Column Layout */}
                            {browseOpen && (
                                <div
                                    className="absolute left-0 right-0 top-full z-40 opacity-100 visible translate-y-0"
                                    onMouseEnter={() => {
                                        if (browseMenuTimeoutRef.current) clearTimeout(browseMenuTimeoutRef.current);
                                        setBrowseOpen(true);
                                    }}
                                >
                                    <div className="w-full bg-white shadow-2xl border-t border-[var(--color-border-light)] grid grid-cols-[18rem_minmax(0,1fr)] h-96 overflow-hidden">
                                        {/* Left Column - All Main Categories */}
                                        <div className="bg-[var(--color-bg-primary)] border-r border-[var(--color-border-light)] overflow-y-auto p-0 flex flex-col min-h-0">
                                            {menuSource.map((item, idx) => {
                                                const hasLink = item.url || item.link;
                                                const link = item.url || item.link || '#';
                                                const hasSubmenu = (item.submenu && item.submenu.length > 0) || (item.sub && item.sub.length > 0);
                                                const isActive = activeMenuPath[0] === idx;

                                                return (
                                                    <Link
                                                        key={item.id || `m_${idx}`}
                                                        to={link}
                                                        onMouseEnter={() => {
                                                            setActiveMenuPath([idx]);
                                                            setBrowseOpen(true);
                                                        }}
                                                        onClick={() => { setBrowseOpen(false); setActiveMenuPath([0]); }}
                                                        className={`w-full text-left px-6 py-4 border-b border-[var(--color-border-light)] transition duration-150 font-semibold text-base flex items-center justify-between no-underline ${isActive
                                                            ? 'bg-white text-[var(--color-accent-primary)]'
                                                            : 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] hover:bg-white hover:text-[var(--color-accent-primary)]'
                                                            }`}
                                                    >
                                                        <span>{item.label || item.name || 'Menu Item'}</span>
                                                        {hasSubmenu && (
                                                            <i
                                                                className={`fas fa-chevron-down transition-transform duration-200 ${isActive ? 'rotate-270' : ''}`}
                                                                style={{ fontSize: 'inherit', color: 'var(--color-text-light)' }}
                                                            ></i>
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>

                                        {/* Active Submenu Grid */}
                                        {(() => {
                                            const activeMainItem = menuSource[activeMenuPath[0]];
                                            const activeSubmenuItems = getActiveSubmenuItems(menuSource, activeMenuPath);

                                            return (
                                                <div className="bg-white min-h-0 flex flex-col">
                                                    <div className="px-8 py-5 border-b border-[var(--color-border-light)]">
                                                        <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">
                                                            {activeMainItem?.label || activeMainItem?.name || 'Category'}
                                                        </h3>
                                                    </div>
                                                    {activeSubmenuItems.length > 0 ? (
                                                        <div className="flex-1 overflow-hidden px-8 py-6 [column-count:4] [column-gap:3rem] [column-fill:auto]">
                                                            {activeSubmenuItems.map((item, idx) => {
                                                                const hasSubmenu = (item.submenu && item.submenu.length > 0) || (item.sub && item.sub.length > 0);
                                                                return (
                                                                    <Link
                                                                        key={item.id || `submenu_${idx}`}
                                                                        to={item.url || item.link || '#'}
                                                                        onClick={() => { setBrowseOpen(false); setActiveMenuPath([0]); }}
                                                                        onMouseEnter={() => {
                                                                            if (hasSubmenu) {
                                                                                setActiveMenuPath([...activeMenuPath, idx]);
                                                                            }
                                                                        }}
                                                                        className="block mb-5 break-inside-avoid text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] transition duration-150 text-base leading-snug no-underline"
                                                                    >
                                                                        {item.label || item.name}
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="px-8 py-6 text-[var(--color-text-light)]">No subcategories</div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/* Mobile Menu Slide-over */}
            <div
                ref={mobileMenuRef}
                aria-hidden={!mobileMenuOpen}
                className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${mobileMenuOpen ? 'visible' : 'invisible'}`}
            >
                {/* Backdrop */}
                <button
                    aria-label="Close menu"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`absolute inset-0 bg-black bg-opacity-40 transition-opacity ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Panel */}
                <nav className={`absolute left-0 top-0 bottom-0 w-full sm:w-4/5 bg-[var(--color-bg-primary)] shadow-2xl overflow-auto transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <Link to="/" className="flex items-center gap-2">
                                <img src="/Wolf Supplies LTD.png" alt="Wolf Supplies" className="h-10 w-auto" />
                            </Link>
                            <button onClick={() => setMobileMenuOpen(false)} className="text-2xl p-2 rounded-md hover:bg-[var(--color-bg-section)]">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* (mobile search modal moved out of nav - kept placeholder here) */}

                        {/* duplicate inline search removed; mobile search uses modal */}

                        <div className="border-t border-[var(--color-border-light)] pt-4">
                            <Link
                                to="/categories"
                                className="font-bold text-[var(--color-text-primary)] mb-3 text-sm flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-bg-section)] hover:text-[var(--color-accent-primary)] rounded-lg"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <i className="fas fa-list" style={{ color: 'var(--color-accent-primary)' }}></i> Browse All Categories
                            </Link>

                            {/* Recursive Nested Mobile Menu */}
                            {renderMobileNestedMenu(menuSource)}
                        </div>

                        <div className="border-t border-[var(--color-border-light)] pt-4 space-y-2">
                            {/* Dynamic Main Navigation Menu from Database */}
                            {mainNavMenu.length > 0 ? (
                                mainNavMenu.map((item) => (
                                    <Link
                                        key={item.id || item.name}
                                        to={item.url || item.link || '#'}
                                        className="block px-3 py-2 text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg font-semibold text-sm"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.label || item.name}
                                    </Link>
                                ))
                            ) : (
                                <>
                                    <Link
                                        to="/"
                                        className="block px-3 py-2 text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg font-semibold text-sm"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        to="/about"
                                        className="block px-3 py-2 text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg font-semibold text-sm"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        About Us
                                    </Link>
                                    <Link
                                        to="/products"
                                        className="block px-3 py-2 text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg font-semibold text-sm"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Shop
                                    </Link>
                                    <Link
                                        to="/contact"
                                        className="block px-3 py-2 text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg font-semibold text-sm"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Contact Us
                                    </Link>
                                </>
                            )}
                            <Link
                                to="/order-lookup"
                                className="block px-3 py-2 text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg font-semibold text-sm flex items-center gap-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <i className="fas fa-box" style={{ color: 'var(--color-accent-primary)' }}></i> Order Lookup
                            </Link>
                            {(isAdmin || user?.customRole) && (
                                <Link
                                    to={isAdmin ? '/admin/dashboard' : (employeeFirstPage || '/admin/dashboard')}
                                    className="px-3 py-2 text-white bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] rounded-lg font-semibold text-sm flex items-center gap-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <i className="fas fa-user-shield"></i> {isAdmin ? 'Admin Panel' : 'Employee Dashboard'}
                                </Link>
                            )}
                        </div>

                        {/* Phone and Email in Mobile Menu */}
                        <div className="border-t border-[var(--color-border-light)] pt-4 space-y-2">
                            <a
                                href="tel:+447398998101"
                                className="block px-3 py-2 text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg font-semibold text-sm flex items-center gap-2"
                            >
                                <i className="fas fa-phone" style={{ color: 'var(--color-accent-primary)' }}></i> +447398998101
                            </a>
                            <a
                                href="mailto:sales@wolfsupplies.co.uk"
                                className="block px-3 py-2 text-[var(--color-text-light)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg font-semibold text-sm flex items-center gap-2"
                            >
                                <i className="fas fa-envelope" style={{ color: 'var(--color-accent-primary)' }}></i> sales@wolfsupplies.co.uk
                            </a>
                        </div>

                        <div className="border-t border-[var(--color-border-light)] pt-4">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-semibold py-2 px-3 text-sm">
                                        <i className="fas fa-user" style={{ color: 'var(--color-accent-primary)' }}></i>
                                        <span>{user?.name || 'User'}</span>
                                    </div>
                                    <p className="text-xs text-[var(--color-text-light)] px-3 py-1">{user?.email}</p>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 text-[var(--color-text-primary)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-section)] rounded-lg font-semibold text-sm mt-2 flex items-center gap-2"
                                    >
                                        <i className="fas fa-sign-out-alt"></i> Logout
                                    </button>
                                </>
                            ) : null}
                        </div>
                    </div>
                </nav>
            </div>
            {/* Mobile Search Modal (sibling of mobile menu so fixed positioning works) */}
            <div
                aria-hidden={!mobileSearchOpen}
                role="dialog"
                aria-modal={mobileSearchOpen}
                aria-labelledby="mobile-search-title"
                className={`fixed inset-0 md:hidden transition-all duration-200 ${mobileSearchOpen ? 'visible' : 'invisible'}`}
                style={{ zIndex: 9999 }}
            >
                {/* Backdrop */}
                <button
                    aria-label="Close search"
                    onClick={() => setMobileSearchOpen(false)}
                    className={`absolute inset-0 bg-black bg-opacity-40 transition-opacity ${mobileSearchOpen ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Centered Panel */}
                <div className={`absolute left-1/2 top-16 transform -translate-x-1/2 w-[calc(100%-1rem)] sm:w-11/12 max-w-md bg-[var(--color-bg-primary)] rounded-lg shadow-2xl p-3 sm:p-4 transition-all duration-200 ${mobileSearchOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-6'}`}>
                    <div className="flex items-stretch gap-1 sm:gap-2">
                        <form onSubmit={handleMobileSearchSubmit} className="flex-1 w-full">
                            <label id="mobile-search-title" className="sr-only">Search products</label>
                            <div className="flex items-center gap-1 sm:gap-2 w-full">
                                <input
                                    ref={mobileSearchRef}
                                    type="text"
                                    value={mobileSearchQuery}
                                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                                    placeholder={isMobileListening ? "Speak..." : "Search products..."}
                                    className="flex-1 h-10 sm:h-12 px-3 sm:px-4 rounded-l-full border border-[var(--color-border-light)] placeholder-[var(--color-text-muted)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] text-xs sm:text-sm"
                                />

                                {mobileSearchQuery.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => { setMobileSearchQuery(''); if (mobileSearchRef.current) mobileSearchRef.current.focus(); }}
                                        aria-label="Clear search"
                                        className="text-[var(--color-text-primary)] hover:text-[var(--color-text-light)] p-1 sm:p-2 flex-shrink-0"
                                    >
                                        ✕
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => startVoiceSearch(true)}
                                    className={`h-10 sm:h-12 px-2 sm:px-3 flex items-center justify-center transition duration-300 rounded-full flex-shrink-0 ${isMobileListening ? 'bg-[var(--color-error)] text-white' : 'bg-[var(--color-bg-section)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'}`}
                                    title="Voice Search"
                                    aria-label="Voice search"
                                >
                                    <i className="fas fa-microphone" style={{ fontSize: 'inherit' }}></i>
                                </button>

                                <button type="submit" className="h-10 sm:h-12 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] text-white px-2 sm:px-4 rounded-r-full flex items-center justify-center flex-shrink-0">
                                    <i className="fas fa-search" style={{ fontSize: 'inherit' }}></i>
                                </button>
                            </div>
                        </form>
                        <button onClick={() => setMobileSearchOpen(false)} aria-label="Close search" className="text-2xl text-[var(--color-text-light)] p-2 hover:bg-[var(--color-bg-section)] rounded-md">
                            <i className="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>
            </div>

        </header>
    );
};
export default Header;
