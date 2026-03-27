import Header from '../Header/Header';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from 'react-router-dom';
import { cachedJsonFetch } from '@/utils/apiCache';



const Layout = ({ children, showMenuSlider = false }) => {
    const navigate = useNavigate();
    const [browseMenu, setBrowseMenu] = useState([]);
    const [mainNavMenu, setMainNavMenu] = useState([]);
    const [activeMenuPath, setActiveMenuPath] = useState([0]); // Track path for progressive menu
    const [browseOpen, setBrowseOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slides, setSlides] = useState([]);
    const browseMenuTimeoutRef = useRef(null);

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
                const apiBase = import.meta.env.VITE_API_URL;
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
                const apiBase = import.meta.env.VITE_API_URL;
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
            <div className="w-full hidden md:block bg-[var(--color-bg-primary)] border-b border-[var(--color-border-light)] sticky top-0 z-30">
                <div className="flex items-center gap-4 px-4 py-2 overflow-x-auto">
                    {/* Browse Categories Button */}
                    <button
                        className="flex items-center gap-2 text-black hover:opacity-90 transition duration-300 font-bold text-lg whitespace-nowrap min-w-fit"
                    >
                        <i className="fas fa-burger" style={{ marginRight: '0.5rem' }}></i> Shop By Category
                    </button>

                    {/* Vertical Divider */}
                    <div className="h-6 w-px bg-[var(--color-border-light)] mx-2"></div>

                    {/* Main Navigation - Dynamic from mainNavMenu */}
                    {mainNavMenu.length > 0 ? (
                        mainNavMenu.map((item) => (
                            <Link
                                key={item.id || item.name}
                                to={item.url || item.link || '#'}
                                className="px-4 py-2 hover:text-[var(--color-accent-primary)] font-semibold text-[var(--color-text-light)] whitespace-nowrap"
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
            <div className="w-full bg-white relative" onMouseLeave={() => { setBrowseOpen(false); setActiveMenuPath([0]); }}>
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
                                        onClick={() => { setBrowseOpen(false); setActiveMenuPath([0]); }}
                                        className={`w-full text-left px-6 py-4 border-b border-[var(--color-border-light)] transition duration-150 font-semibold text-base flex items-center justify-between no-underline ${activeMenuPath[0] === idx
                                            ? 'bg-white text-[var(--color-accent-primary)]'
                                            : 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] hover:bg-white hover:text-[var(--color-accent-primary)]'
                                            }`}
                                    >
                                        <span>{item.label || item.name || 'Menu Item'}</span>
                                        {hasSubmenu && (
                                            <i className="fas fa-chevron-down" style={{ fontSize: 'inherit', color: 'var(--color-text-light)' }}></i>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Submenu Columns - Progressive Reveal - Absolute Positioned Above Slider */}
                        {browseOpen && (
                            <div
                                className="absolute left-72 top-0 z-50 bg-white overflow-x-auto flex h-96 border border-[var(--color-border-light)] shadow-2xl"
                                style={{ width: 'calc(100vw - 310px)' }}
                                onMouseEnter={() => {
                                    if (browseMenuTimeoutRef.current) clearTimeout(browseMenuTimeoutRef.current);
                                    setBrowseOpen(true);
                                }}
                                onMouseLeave={() => {
                                    browseMenuTimeoutRef.current = setTimeout(() => {
                                        setBrowseOpen(false);
                                        setActiveMenuPath([0]);
                                    }, 150);
                                }}
                            >
                                {/* Dynamic Columns for Nested Menus */}
                                {(() => {
                                    const columns = [];
                                    let currentLevel = browseMenu;
                                    let currentPath = [...activeMenuPath];

                                    // Always build the first submenu column
                                    if (currentPath.length > 0) {
                                        const itemIndex = currentPath[0];
                                        if (itemIndex >= 0 && itemIndex < currentLevel.length) {
                                            const currentItem = currentLevel[itemIndex];
                                            const nextLevel = (currentItem?.submenu || currentItem?.sub) || [];

                                            if (nextLevel.length > 0) {
                                                columns.push(
                                                    <div key="col_1" className="w-56 bg-white border-r border-[var(--color-border-light)] overflow-y-auto p-0 flex flex-col flex-shrink-0">
                                                        {nextLevel.map((item, idx) => {
                                                            const hasSubmenu = (item.submenu && item.submenu.length > 0) || (item.sub && item.sub.length > 0);
                                                            const isActive = idx === currentPath[1];
                                                            return (
                                                                <Link
                                                                    key={item.id || `sub_${idx}`}
                                                                    to={item.url || item.link || '#'}
                                                                    onClick={() => { setBrowseOpen(false); setActiveMenuPath([0]); }}
                                                                    onMouseEnter={() => setActiveMenuPath([currentPath[0], idx])}
                                                                    className={`w-full text-left px-6 py-4 border-b border-[var(--color-border-light)] transition duration-150 font-semibold text-base flex items-center justify-between no-underline ${isActive
                                                                        ? 'bg-[var(--color-bg-section)] text-[var(--color-accent-primary)]'
                                                                        : 'bg-white text-[var(--color-text-primary)] hover:bg-[var(--color-bg-section)] hover:text-[var(--color-accent-primary)]'
                                                                        }`}
                                                                >
                                                                    <span>{item.label || item.name}</span>
                                                                    {hasSubmenu && (
                                                                        <i className="fas fa-chevron-down text-xs" style={{ color: 'var(--color-text-light)' }}></i>
                                                                    )}
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                                currentLevel = nextLevel;
                                            }
                                        }
                                    }

                                    // Build additional columns for deeper nesting
                                    for (let depth = 1; depth < currentPath.length && currentLevel && currentLevel.length > 0; depth++) {
                                        const itemIndex = currentPath[depth];
                                        if (itemIndex >= 0 && itemIndex < currentLevel.length) {
                                            const currentItem = currentLevel[itemIndex];
                                            const nextLevel = (currentItem?.submenu || currentItem?.sub) || [];

                                            if (nextLevel.length > 0) {
                                                columns.push(
                                                    <div key={`col_${depth + 1}`} className="w-56 bg-white border-r border-[var(--color-border-light)] overflow-y-auto p-0 flex flex-col flex-shrink-0">
                                                        {nextLevel.map((item, idx) => {
                                                            const hasSubmenu = (item.submenu && item.submenu.length > 0) || (item.sub && item.sub.length > 0);
                                                            const isActive = idx === currentPath[depth + 1];
                                                            return (
                                                                <Link
                                                                    key={item.id || `item_${depth}_${idx}`}
                                                                    to={item.url || item.link || '#'}
                                                                    onClick={() => { setBrowseOpen(false); setActiveMenuPath([0]); }}
                                                                    onMouseEnter={() => setActiveMenuPath([...currentPath.slice(0, depth + 1), idx])}
                                                                    className={`w-full text-left px-6 py-4 border-b border-[var(--color-border-light)] transition duration-150 font-semibold text-base flex items-center justify-between no-underline ${isActive
                                                                        ? 'bg-[var(--color-bg-section)] text-[var(--color-accent-primary)]'
                                                                        : 'bg-white text-[var(--color-text-primary)] hover:bg-[var(--color-bg-section)] hover:text-[var(--color-accent-primary)]'
                                                                        }`}
                                                                >
                                                                    <span>{item.label || item.name}</span>
                                                                    {hasSubmenu && (
                                                                        <i className="fas fa-chevron-down text-xs" style={{ color: 'var(--color-text-light)' }}></i>
                                                                    )}
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                                currentLevel = nextLevel;
                                            }
                                        }
                                    }

                                    return columns;
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
                                {slides.map((slide, idx) => (
                                    <div
                                        key={slide._id || slide.id || idx}
                                        className={`absolute inset-0 transition-transform duration-500 ease-in-out ${idx === currentSlide
                                            ? 'translate-x-0'
                                            : idx < currentSlide
                                                ? '-translate-x-full'
                                                : 'translate-x-full'
                                            }`}
                                        style={{
                                            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${slide.bgImage.startsWith('http') ? slide.bgImage : `${import.meta.env.VITE_API_URL}${slide.bgImage}`}')`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'right center',
                                            backgroundRepeat: 'no-repeat'
                                        }}
                                    >
                                        {/* Slide Content */}
                                        <div className="flex items-center justify-between h-full px-6 relative">
                                            {/* Left Content */}
                                            <div className="flex-1 text-white z-10 sm:ml-12 ml-4">
                                                <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
                                                <p className="text-lg mb-8 leading-relaxed max-w-md">{slide.description}</p>
                                                <Link
                                                    to={slide.buttonLink}
                                                    className="inline-block bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] text-white font-bold px-8 py-3 rounded-lg transition duration-300 shadow-lg"
                                                >
                                                    {slide.buttonText}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}

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
