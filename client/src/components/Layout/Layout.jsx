import Header from '../Header/Header';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from 'react-router-dom';
import { cachedJsonFetch } from '@/utils/apiCache';
import { getApiUrl } from '@/utils/envHelper';



const Layout = ({ children, showMenuSlider = false }) => {
    const navigate = useNavigate();
    const [browseMenu, setBrowseMenu] = useState([]);
    const [mainNavMenu, setMainNavMenu] = useState([]);
    const [activeMenuPath, setActiveMenuPath] = useState([]); // Track path for progressive menu
    const [browseOpen, setBrowseOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slides, setSlides] = useState([]);
    const browseMenuTimeoutRef = useRef(null);
    const sliderImageBase = getApiUrl();

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

    // Load menus from API on component mount (same endpoint as Header, cached per session)
    useEffect(() => {
        const loadMenus = async () => {
            try {
                const apiBase = getApiUrl();
                const url = apiBase ? `${apiBase}/api/settings/menus` : '/api/settings/menus';
                const data = await cachedJsonFetch(url);

                if (data.browseMenu && Array.isArray(data.browseMenu)) {
                    validateMenuLinks(data.browseMenu);
                    setBrowseMenu(data.browseMenu);
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

    // Load sliders from API (cached per session)
    useEffect(() => {
        const loadSliders = async () => {
            try {
                const apiBase = getApiUrl();
                const url = apiBase ? `${apiBase}/api/sliders/all` : '/api/sliders/all';
                const data = await cachedJsonFetch(url);
                if (Array.isArray(data) && data.length > 0) {
                    setSlides(data);
                }
            } catch (err) {
                console.error('Error loading sliders:', err);
            }
        };
        loadSliders();
    }, []);

    // Auto-rotate slides every 5 seconds
    useEffect(() => {
        if (slides.length === 0) return;

        const slideTimer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(slideTimer);
    }, [slides.length]);

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

    if (!showMenuSlider) {
        return (
            <>
                {children}
            </>
        );
    }

    // Home Page Layout with Menu Mega Menu (Same as Header)
    return (
        <div className="w-full bg-[var(--color-bg-primary)] pb-10 md:pb-0">
            {/* Top Navigation Bar */}
            <div className="w-full hidden md:block bg-[var(--color-bg-primary)] sticky top-0 z-30">
                <div className="flex items-center gap-0 px-4 overflow-x-auto border-y border-[var(--color-border-light)]">
                    {/* Browse Categories Button */}
                    <button
                        className="group flex items-center gap-2 text-black hover:bg-[var(--color-accent-primary)] hover:text-white transition duration-300 font-bold text-lg whitespace-nowrap w-[268px] px-6 py-3"
                    >
                        <i
                            className="fas fa-burger text-black transition-colors duration-300 group-hover:text-white"
                            style={{ marginRight: '0.5rem' }}
                        ></i>
                        <span className="text-black transition-colors duration-300 group-hover:text-white">
                            Shop By Category
                        </span>
                    </button>

                    {/* Vertical Divider */}
                    <div className="h-10 w-[4px] bg-[var(--color-border-light)] flex-shrink-0"></div>

                    {/* Main Navigation - Dynamic from mainNavMenu */}
                    {mainNavMenu.length > 0 ? (
                        mainNavMenu.map((item, index) => (
                            <Link
                                key={item.id || item.name}
                                to={item.url || item.link || '#'}
                                className={`px-8 py-2 hover:text-[var(--color-accent-primary)] font-semibold text-[var(--color-text-light)] whitespace-nowrap ${index > 0 ? 'border-l border-[var(--color-border-light)]' : ''}`}
                            >
                                {item.label || item.name}
                            </Link>
                        ))
                    ) : (
                        <>
                            <Link to="/" className="px-4 py-2 hover:text-[var(--color-accent-primary)] font-semibold text-[var(--color-text-light)] whitespace-nowrap">
                                Home
                            </Link>
                            <Link to="/about" className="px-4 py-2 hover:text-[var(--color-accent-primary)] font-semibold text-[var(--color-text-light)] whitespace-nowrap">
                                About Us
                            </Link>
                            <Link to="/products" className="px-4 py-2 hover:text-[var(--color-accent-primary)] font-semibold text-[var(--color-text-light)] whitespace-nowrap">
                                Shop
                            </Link>
                            <Link to="/contact" className="px-4 py-2 hover:text-[var(--color-accent-primary)] font-semibold text-[var(--color-text-light)] whitespace-nowrap">
                                Contact Us
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content Area with Progressive Menu and Right Slider */}
            <div className="w-full bg-white relative" onMouseLeave={() => { setBrowseOpen(false); setActiveMenuPath([]); }}>
                <div className="flex w-full h-auto">
                    {/* Left Sidebar - Menu Mega Panel */}
                    <div className="hidden md:flex md:flex-col w-72 border-r-4 border-[var(--color-border-light)] bg-[var(--color-bg-primary)] shadow-lg relative">
                        {/* Menu Items List */}
                        <div className="border-b border-[var(--color-border-light)] overflow-y-auto flex-1">
                            {browseMenu.map((item, idx) => {
                                const hasLink = item.url || item.link;
                                const link = item.url || item.link || '#';
                                const hasSubmenu = (item.submenu && item.submenu.length > 0) || (item.sub && item.sub.length > 0);

                                return (
                                    <Link
                                        key={item.id || `m_${idx}`}
                                        to={link}
                                        onMouseEnter={() => {
                                            setActiveMenuPath([idx]);
                                            setBrowseOpen(hasSubmenu);
                                        }}
                                        onClick={() => { setBrowseOpen(false); setActiveMenuPath([]); }}
                                        className={`w-full text-left px-6 py-4 border-b border-[var(--color-border-light)] transition duration-150 font-semibold text-base flex items-center justify-between no-underline ${activeMenuPath[0] === idx
                                            ? 'bg-white text-[var(--color-accent-primary)]'
                                            : 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]'
                                              }`}
                                      >
                                        <span>{item.label || item.name || 'Menu Item'}</span>
                                        {hasSubmenu && (
                                            <i
                                                className={`fas fa-chevron-down transition-transform duration-200 ${activeMenuPath[0] === idx ? 'rotate-270' : ''}`}
                                                style={{ fontSize: 'inherit', color: 'var(--color-text-light)' }}
                                            ></i>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Submenu Columns - Progressive Reveal - Absolute Positioned Above Slider */}
                        {browseOpen && (
                            <div
                                className="absolute left-72 top-0 z-50 bg-white overflow-hidden h-96 border border-[var(--color-border-light)] shadow-2xl"
                                style={{ width: 'calc(100vw - 288px)' }}
                                onMouseEnter={() => {
                                    if (browseMenuTimeoutRef.current) clearTimeout(browseMenuTimeoutRef.current);
                                    setBrowseOpen(true);
                                }}
                                onMouseLeave={() => {
                                    browseMenuTimeoutRef.current = setTimeout(() => {
                                        setBrowseOpen(false);
                                        setActiveMenuPath([]);
                                    }, 150);
                                }}
                            >
                                {(() => {
                                    const activeMainItem = browseMenu[activeMenuPath[0]];
                                    const activeSubmenuItems = getActiveSubmenuItems(browseMenu, activeMenuPath);

                                    return (
                                        <div className="bg-white h-full flex flex-col">
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
                                                                onClick={() => { setBrowseOpen(false); setActiveMenuPath([]); }}
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
                        )}
                    </div>

                    {/* Right Side - Slider + Overlaid Menu */}
                    <div className="flex-1 bg-[var(--color-bg-primary)] relative h-96">
                        {/* Slider Container */}
                        {slides.length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                <div className="text-center">
                                    <i className="fas fa-image text-5xl text-gray-400 mb-4"></i>
                                    <p className="text-gray-600 font-semibold">No sliders available</p>
                                    <p className="text-sm text-gray-500">Create a slider from the admin panel to display here</p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full relative overflow-hidden">
                                {slides.map((slide, idx) => {
                                    const imageSrc = slide.bgImage?.startsWith('http')
                                        ? slide.bgImage
                                        : `${sliderImageBase}${slide.bgImage}`;

                                    return (
                                        <div
                                            key={slide._id || slide.id || idx}
                                            className={`absolute inset-0 transition-opacity duration-700 ease-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                                                }`}
                                        >
                                            <img
                                                src={imageSrc}
                                                alt={slide.title || 'Promotional banner'}
                                                className="absolute inset-0 h-full w-full object-cover object-center"
                                                loading={idx === 0 ? 'eager' : 'lazy'}
                                                fetchpriority={idx === 0 ? 'high' : 'auto'}
                                                decoding="async"
                                            />
                                            <div
                                                className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.82)_0%,rgba(34,24,16,0.66)_42%,rgba(17,24,39,0.2)_100%)]"
                                                aria-hidden="true"
                                            ></div>
                                        </div>
                                    );
                                })}

                                <div className="relative z-20 flex h-full items-center px-6 sm:px-10 lg:px-14">
                                    <div className="max-w-3xl text-white">
                                        
                                        <h2 className="text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
                                            {slides[currentSlide]?.title}
                                        </h2>
                                        {slides[currentSlide]?.description && (
                                            <p className="mt-4 max-w-2xl text-base leading-8 text-white/88 sm:text-lg">
                                                {slides[currentSlide].description}
                                            </p>
                                        )}
                                        {slides[currentSlide]?.buttonLink && slides[currentSlide]?.buttonText && (
                                            <Link
                                                to={slides[currentSlide].buttonLink}
                                                className="mt-8 inline-block rounded-xl bg-[var(--color-accent-primary)] px-8 py-4 text-xl font-bold text-white shadow-lg transition duration-300 hover:bg-[var(--color-accent-light)]"
                                            >
                                                {slides[currentSlide].buttonText}
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Navigation Arrows */}
                                <button
                                    onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-[var(--color-bg-primary)] bg-opacity-70 hover:bg-opacity-100 text-[var(--color-accent-primary)] p-2 rounded-full z-20 transition duration-300"
                                    aria-label="Previous slide"
                                >
                                    <i className="fas fa-chevron-left sm:text-lg text-sm"></i>
                                </button>

                                <button
                                    onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[var(--color-bg-primary)] bg-opacity-70 hover:bg-opacity-100 text-[var(--color-accent-primary)] p-2 rounded-full z-20 transition duration-300"
                                    aria-label="Next slide"
                                >
                                    <i className="fas fa-chevron-right sm:text-lg text-sm"></i>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="w-full">
                {children}
            </main>

        </div>
    );
};

export default Layout;
