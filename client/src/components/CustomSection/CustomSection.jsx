'use client';

import React from 'react';
import { useNavigate, useLocation } from "react-router-dom";

const CustomSection = ({
    title = '',
    items = [],
    sectionHeight = '500px',
    backgroundColor = 'var(--color-bg-primary)',
    editorContent,
    editorStyle
}) => {
    const navigate = useNavigate();

    // State for interactive elements
    const [expandedIconLists, setExpandedIconLists] = React.useState({});
    const [openAccordionItems, setOpenAccordionItems] = React.useState({});
    const [emailStates, setEmailStates] = React.useState({});
    // Use the flexDirection from editor content exactly as set by user
    const sectionFlexDirection = editorContent?.flexDirection || 'row';
    // Add responsive CSS styles
    React.useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            /* Accordion animation */
            @keyframes slideDown {
                from {
                    opacity: 0;
                    max-height: 0;
                }
                to {
                    opacity: 1;
                    max-height: 500px;
                }
            }

            /* Mobile - Stack vertically ONLY */
            @media (max-width: 767px) {
                [data-mobile-display="none"] { display: none !important; }
                [data-mobile-display="inline-block"] { display: inline-block !important; }
                [data-mobile-display="block"] { display: block !important; }
                [data-mobile-width="50%"] { width: 50% !important; }
                [data-mobile-width="33%"] { width: 33% !important; }
                [data-mobile-width="fit-content"] { width: fit-content !important; }
                [data-mobile-width="auto"] { width: 100% !important; }
                [data-mobile-padding] { padding: var(--mobile-padding); }
                [data-mobile-font-size] { font-size: var(--mobile-font-size); }
                [data-mobile-image-height] { height: var(--mobile-image-height); }
                [data-flex-mobile="column"] { flex-direction: column !important; }
            }

            /* Tablet - Responsive */
            @media (min-width: 768px) and (max-width: 1023px) {
                [data-tablet-display="none"] { display: none !important; }
                [data-tablet-display="inline-block"] { display: inline-block !important; }
                [data-tablet-display="block"] { display: block !important; }
                [data-tablet-padding] { padding: var(--tablet-padding); }
            }
        `;
        document.head.appendChild(style);
        return () => {
            if (style.parentElement) {
                style.parentElement.removeChild(style);
            }
        };
    }, []);
    let displayTitle = title;
    let displayItems = items;
    let displaySectionHeight = sectionHeight;
    let displayBackgroundColor = backgroundColor;
    let displayBackgroundImage = '';
    let displayBackgroundSize = 'cover';
    let displayBackgroundPosition = 'center';
    let displayBackgroundRepeat = 'no-repeat';
    let displayBackgroundOpacity = 1;

    if (editorContent) {
        displayTitle = editorContent.title || title;
        displayItems = editorContent.items || items;
        displaySectionHeight = editorContent.sectionHeight || sectionHeight;
        displayBackgroundColor = editorContent.backgroundColor || backgroundColor;
        displayBackgroundImage = editorContent.backgroundImage || '';
        displayBackgroundSize = editorContent.backgroundSize || 'cover';
        displayBackgroundPosition = editorContent.backgroundPosition || 'center';
        displayBackgroundRepeat = editorContent.backgroundRepeat || 'no-repeat';
        displayBackgroundOpacity = editorContent.backgroundOpacity !== undefined ? editorContent.backgroundOpacity : 1;
    }

    // Helper function to generate box shadow CSS
    const getBoxShadow = (boxShadow) => {
        if (!boxShadow) return 'none';
        const { offsetX = 0, offsetY = 0, blur = 0, spread = 0, color = 'rgba(0, 0, 0, 0.1)' } = boxShadow;
        return `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`;
    };

    // Helper function to render Font Awesome icons
    const renderIcon = (iconValue, size, color) => {
        if (!iconValue) return '★';

        const trimmedIcon = iconValue.trim().toLowerCase();

        // Check if it's a Font Awesome icon
        if (trimmedIcon.startsWith('fa-')) {
            return (
                <i
                    className={`fa-solid ${trimmedIcon}`}
                    style={{
                        fontSize: size || '24px',
                        color: color || 'var(--color-accent-primary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    aria-hidden="true"
                />
            );
        }

        // Otherwise render as text/emoji
        return iconValue;
    };

    // Helper function to render responsive font size
    const getResponsiveFontSize = (size) => {
        // If size is a number, it's in pixels
        if (typeof size === 'number' || (!isNaN(size) && size !== '')) {
            const pxSize = parseInt(size);
            return {
                mobile: `${Math.max(pxSize - 4, 12)}px`,
                tablet: `${Math.max(pxSize - 2, 12)}px`,
                desktop: `${pxSize}px`
            };
        }

        // Otherwise use preset sizes
        const sizes = {
            xs: { mobile: '12px', tablet: '14px', desktop: '16px' },
            sm: { mobile: '14px', tablet: '16px', desktop: '20px' },
            md: { mobile: '16px', tablet: '18px', desktop: '24px' },
            lg: { mobile: '20px', tablet: '26px', desktop: '32px' },
            xl: { mobile: '24px', tablet: '32px', desktop: '40px' }
        };
        return sizes[size] || sizes.md;
    };

    // Helper to get responsive gap
    const getResponsiveGap = (gap) => {
        const gapValue = gap || 16;
        return `clamp(${Math.max(8, gapValue - 8)}px, 2vw, ${gapValue}px)`;
    };

    // Helper to get responsive item styles based on screen size
    const getResponsiveItemStyles = (item) => {
        const styles = {};

        // Mobile styles (below 768px)
        if (item.mobileDisplay) {
            styles['@media (max-width: 767px)'] = { display: item.mobileDisplay };
        }

        if (item.mobileWidth) {
            styles['@media (max-width: 767px)'] = {
                ...styles['@media (max-width: 767px)'],
                width: item.mobileWidth
            };
        }

        if (item.mobilePadding !== undefined) {
            styles['@media (max-width: 767px)'] = {
                ...styles['@media (max-width: 767px)'],
                padding: `${item.mobilePadding}px`
            };
        }

        if (item.mobileFontSize && item.mobileFontSize !== 'auto') {
            const sizeMap = { xs: '12px', sm: '14px', md: '16px', lg: '18px', xl: '20px' };
            styles['@media (max-width: 767px)'] = {
                ...styles['@media (max-width: 767px)'],
                fontSize: sizeMap[item.mobileFontSize] || 'inherit'
            };
        }

        return styles;
    };

    // Render content based on type
    const renderContent = (item) => {
        switch (item.type) {
            case 'heading':
                const headingSize = getResponsiveFontSize(item.size);
                const headingFontSize = typeof item.size === 'number' || (!isNaN(item.size) && item.size !== '')
                    ? `clamp(${headingSize.mobile}, 4vw, ${headingSize.desktop})`
                    : `clamp(${headingSize.mobile}, 4vw, ${headingSize.desktop})`;
                return (
                    <div style={{
                        fontSize: headingFontSize,
                        color: item.color || 'var(--color-text-primary)',
                        fontWeight: 'bold',
                        margin: 0,
                        textAlign: item.textAlign || 'left',
                        lineHeight: '1.2',
                        wordBreak: 'break-word'
                    }}>
                        {item.text}
                    </div>
                );

            case 'text':
                const textSize = getResponsiveFontSize(item.size);
                const textFontSize = typeof item.size === 'number' || (!isNaN(item.size) && item.size !== '')
                    ? `clamp(${textSize.mobile}, 2.5vw, ${textSize.desktop})`
                    : `clamp(${textSize.mobile}, 2.5vw, ${textSize.desktop})`;
                return (
                    <div style={{
                        fontSize: textFontSize,
                        color: item.color || '#1f2937',
                        lineHeight: '1.6',
                        margin: 0,
                        textAlign: item.textAlign || 'left',
                        wordBreak: 'break-word'
                    }}>
                        {item.text}
                    </div>
                );

            case 'image':
                const imageSrc = item.src && item.src.trim() ? item.src : null;
                if (!imageSrc) {
                    return (
                        <div style={{
                            width: item.width || '100%',
                            height: item.height || '200px',
                            backgroundColor: 'var(--color-bg-section)',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-text-muted)',
                            fontSize: 'clamp(10px, 2vw, 12px)'
                        }}>
                            No image uploaded
                        </div>
                    );
                }
                return (
                    <img
                        src={imageSrc}
                        alt={item.alt || 'Image'}
                        onError={(e) => {
e.target.style.display = 'none';
                            e.target.parentElement.style.backgroundColor = 'var(--color-bg-section)';
                            const errorDiv = document.createElement('div');
                            errorDiv.textContent = 'Image failed to load';
                            errorDiv.style.color = 'var(--color-error)';
                            e.target.parentElement.appendChild(errorDiv);
                        }}
                        onLoad={(e) => {
                        }}
                        style={{
                            width: item.width || '100%',
                            height: item.height ? `${item.height}px` : 'auto',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            display: 'block',
                            maxWidth: '100%',
                            boxShadow: getBoxShadow(item.boxShadow)
                        }}
                    />
                );

            case 'icon':
                const iconSizes = {
                    'sm': 'text-2xl',
                    'md': 'text-4xl',
                    'lg': 'text-6xl',
                    'xl': 'text-8xl'
                };
                return (
                    <div className={`${iconSizes[item.size] || 'text-4xl'} ${item.color || 'text-gray-700'}`}>
                        {item.symbol || '⭐'}
                    </div>
                );

            case 'button':
                const buttonStyles = {
                    'primary': 'bg-gray-800 hover:bg-black text-white',
                    'secondary': 'bg-gray-200 hover:bg-gray-300 text-gray-800',
                    'success': 'bg-black hover:bg-black text-white',
                    'danger': 'bg-black hover:bg-gray-900 text-white',
                    'outline': 'border-2 border-gray-800 text-gray-700 hover:bg-gray-100'
                };
                const isCentered = item.textAlign === 'center';
                const defaultButtonShadow = isCentered ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none';
                const customBoxShadow = item.boxShadow ? getBoxShadow(item.boxShadow) : defaultButtonShadow;

                return (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: isCentered ? 'center' : item.textAlign === 'right' ? 'flex-end' : item.textAlign === 'justify' ? 'space-between' : 'flex-start',
                            width: '100%'
                        }}
                    >
                        <button
                            onClick={() => {
                                if (item.link) {
                                    if (item.link.startsWith('http://') || item.link.startsWith('https://')) {
                                        // External link - open in new tab
                                        window.open(item.link, '_blank');
                                    } else if (item.link.startsWith('/')) {
                                        // Internal route - use React Router
                                        navigate(item.link);
                                    } else {
                                        // Relative path - use React Router
                                        navigate('/' + item.link);
                                    }
                                }
                            }}
                            style={{
                                display: 'inline-block',
                                padding: `clamp(8px, 2vw, 12px) clamp(16px, 4vw, 24px)`,
                                backgroundColor: item.bgColor || 'var(--color-accent-primary)',
                                color: item.color || '#fff',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontSize: typeof item.size === 'number' || (!isNaN(item.size) && item.size !== '')
                                    ? `${parseInt(item.size)}px`
                                    : item.size === 'xs' ? 'clamp(10px, 1.5vw, 12px)' : item.size === 'sm' ? 'clamp(12px, 1.8vw, 14px)' : item.size === 'md' ? 'clamp(14px, 2vw, 16px)' : item.size === 'lg' ? 'clamp(16px, 2.5vw, 18px)' : 'clamp(18px, 3vw, 20px)',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: customBoxShadow,
                                transform: 'translateY(0)',
                                whiteSpace: 'nowrap',
                                border: 'none'
                            }}
                            onMouseEnter={(e) => {
                                const shadow = item.boxShadow ? getBoxShadow({
                                    offsetX: (item.boxShadow.offsetX || 0),
                                    offsetY: (item.boxShadow.offsetY || 0) + 2,
                                    blur: (item.boxShadow.blur || 0) + 4,
                                    spread: item.boxShadow.spread || 0,
                                    color: item.boxShadow.color || 'rgba(0, 0, 0, 0.15)'
                                }) : '0 6px 12px rgba(0, 0, 0, 0.15)';
                                e.target.style.boxShadow = shadow;
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.boxShadow = customBoxShadow;
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            {item.text || 'Button'}
                        </button>
                    </div>
                );

            case 'video':
                return (
                    <div style={{ width: item.width || '100%', height: item.height || '400px' }}>
                        <iframe
                            width="100%"
                            height="100%"
                            src={item.src || ''}
                            title={item.title || 'Video'}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    </div>
                );

            case 'icon-list':
                return (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        width: '100%'
                    }}>
                        {item.items && item.items.map((listItem, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <div style={{
                                    fontSize: '24px',
                                    color: item.iconColor || 'var(--color-accent-primary)',
                                    minWidth: item.iconBgSize ? `${item.iconBgSize}px` : '24px',
                                    width: item.iconBgSize ? `${item.iconBgSize}px` : '24px',
                                    height: item.iconBgSize ? `${item.iconBgSize}px` : '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: item.iconBackgroundColor || 'transparent',
                                    borderRadius: item.iconBgRadius ? `${item.iconBgRadius}px` : '0px'
                                }}>
                                    {renderIcon(listItem.icon || '✓', '24px', item.iconColor || 'var(--color-accent-primary)')}
                                </div>
                                <div style={{
                                    color: item.color || 'var(--color-text-primary)',
                                    fontSize: item.size === 'sm' ? '14px' : item.size === 'lg' ? '18px' : '16px'
                                }}>
                                    {listItem.text}
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'icon-box':
                return (
                    <div style={{
                        backgroundColor: item.backgroundColor || 'var(--color-bg-section)',
                        borderRadius: item.borderRadius || '8px',
                        padding: item.padding || '24px',
                        textAlign: 'center',
                        width: '100%',
                        boxShadow: item.boxShadow === 'Light' ? '0 1px 3px rgba(0, 0, 0, 0.1)' :
                            item.boxShadow === 'Medium' ? '0 4px 6px rgba(0, 0, 0, 0.1)' :
                                item.boxShadow === 'Heavy' ? '0 10px 15px rgba(0, 0, 0, 0.2)' : 'none'
                    }}>
                        <div style={{
                            fontSize: item.iconSize || '48px',
                            color: item.iconColor || 'var(--color-accent-primary)',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: item.iconSize || '48px',
                            width: item.iconBgSize ? `${item.iconBgSize}px` : 'auto',
                            height: item.iconBgSize ? `${item.iconBgSize}px` : 'auto',
                            backgroundColor: item.iconBackgroundColor || 'transparent',
                            borderRadius: item.iconBgRadius ? `${item.iconBgRadius}px` : '0px',
                            marginLeft: 'auto',
                            marginRight: 'auto'
                        }}>
                            {renderIcon(item.icon || '★', item.iconSize || '48px', item.iconColor || 'var(--color-accent-primary)')}
                        </div>
                        <h3 style={{
                            fontSize: item.titleFontSize ? `${item.titleFontSize}px` : '18px',
                            fontWeight: 'bold',
                            color: item.titleColor || '#000',
                            margin: '0 0 8px 0'
                        }}>
                            {item.title}
                        </h3>
                        <p style={{
                            fontSize: item.descFontSize ? `${item.descFontSize}px` : '14px',
                            color: item.descriptionColor || item.color || 'var(--color-text-light)',
                            margin: '0',
                            lineHeight: '1.5'
                        }}>
                            {item.description}
                        </p>
                    </div>
                );

            case 'email-signup':
                const itemId = item.id || 'email-' + Math.random().toString();
                const email = emailStates[itemId] || '';
                const handleSubscribe = () => {
                    if (email && email.includes('@')) {
                        setEmailStates(prev => ({ ...prev, [itemId]: '' }));
                        alert('Thanks for subscribing!');
                    } else {
                        alert('Please enter a valid email');
                    }
                };
                return (
                    <div style={{
                        backgroundColor: item.backgroundColor || 'var(--color-bg-section)',
                        borderRadius: item.borderRadius || '8px',
                        padding: item.padding || '24px',
                        width: `${item.innerWidth || 100}%`,
                        maxWidth: '500px',
                        margin: '0 auto'
                    }}>
                        <h3 style={{
                            fontSize: item.titleFontSize ? `${item.titleFontSize}px` : '20px',
                            fontWeight: 'bold',
                            color: item.titleColor || 'var(--color-text-primary)',
                            margin: '0 0 8px 0',
                            textAlign: 'center'
                        }}>
                            {item.title || 'Subscribe to our Newsletter'}
                        </h3>
                        <p style={{
                            fontSize: '14px',
                            color: item.color || 'var(--color-text-light)',
                            margin: '0 0 16px 0',
                            textAlign: 'center'
                        }}>
                            {item.subtitle || 'Get updates delivered to your inbox'}
                        </p>
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            marginBottom: '8px',
                            width: `${item.inputWidth || 100}%`,
                            margin: '0 auto 8px auto'
                        }}>
                            <input
                                type="email"
                                placeholder={item.placeholder || 'Enter your email'}
                                value={email}
                                onChange={(e) => setEmailStates(prev => ({ ...prev, [itemId]: e.target.value }))}
                                onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
                                style={{
                                    flex: 1,
                                    padding: '10px 12px',
                                    border: `1px solid ${item.inputBorderColor || '#ddd'}`,
                                    borderRadius: `${item.inputBorderRadius || 4}px`,
                                    backgroundColor: item.inputBgColor || 'var(--color-bg-primary)',
                                    color: item.inputTextColor || '#000',
                                    fontSize: '14px',
                                    fontFamily: 'inherit'
                                }}
                            />
                            <button
                                onClick={handleSubscribe}
                                style={{
                                    width: item.buttonWidth ? `${item.buttonWidth}%` : 'auto',
                                    padding: '10px 16px',
                                    backgroundColor: item.buttonColor || 'var(--color-accent-primary)',
                                    color: 'var(--color-bg-primary)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '14px'
                                }}
                            >
                                {item.buttonText || 'Subscribe'}
                            </button>
                        </div>
                        {item.privacyText && (
                            <p style={{
                                fontSize: '12px',
                                color: 'var(--color-text-muted)',
                                margin: '0',
                                textAlign: 'center'
                            }}>
                                {item.privacyText}
                            </p>
                        )}
                    </div>
                );

            case 'accordion':
                const accItemId = item.id || 'acc-' + Math.random().toString();
                const openAccordion = openAccordionItems[accItemId] || 0;
                return (
                    <div style={{
                        width: '100%',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: `1px solid ${item.borderColor || '#ddd'}`
                    }}>
                        {item.items && item.items.map((accItem, idx) => (
                            <div key={idx} style={{
                                borderBottom: idx < item.items.length - 1 ? `1px solid ${item.borderColor || '#ddd'}` : 'none'
                            }}>
                                <button
                                    onClick={() => setOpenAccordionItems(prev => ({ ...prev, [accItemId]: openAccordion === idx ? -1 : idx }))}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        backgroundColor: openAccordion === idx ? (item.activeColor || 'var(--color-bg-section)') : (item.backgroundColor || 'var(--color-bg-primary)'),
                                        border: 'none',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        fontWeight: 'bold',
                                        fontSize: '16px',
                                        color: openAccordion === idx ? (item.activeTitleColor || 'var(--color-text-primary)') : (item.titleColor || 'var(--color-text-primary)'),
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <span>{accItem.title}</span>
                                    <span style={{
                                        transform: openAccordion === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s ease'
                                    }}>
                                        ▼
                                    </span>
                                </button>
                                {openAccordion === idx && (
                                    <div style={{
                                        padding: '16px',
                                        backgroundColor: item.contentBackgroundColor || 'var(--color-bg-secondary)',
                                        color: item.contentColor || 'var(--color-text-light)',
                                        fontSize: '14px',
                                        lineHeight: '1.6',
                                        animation: 'slideDown 0.3s ease'
                                    }}>
                                        {accItem.content}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    // Check if there are any items to display (either standalone items or groups)
    const hasItems = (displayItems && displayItems.length > 0) || (editorContent?.groups && editorContent.groups.length > 0);

    if (!hasItems) {
        return (
            <section style={{
                width: '100%',
                backgroundColor: displayBackgroundColor,
                backgroundImage: displayBackgroundImage ? `url('${displayBackgroundImage}')` : 'none',
                backgroundSize: displayBackgroundSize,
                backgroundPosition: displayBackgroundPosition,
                backgroundRepeat: displayBackgroundRepeat,
                backgroundAttachment: 'scroll',
                paddingTop: '48px',
                paddingBottom: '48px',
                paddingLeft: '16px',
                paddingRight: '16px',
                position: 'relative'
            }}>
                {/* Background overlay for opacity if image exists */}
                {displayBackgroundImage && displayBackgroundOpacity < 1 && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: displayBackgroundColor,
                        opacity: 1 - displayBackgroundOpacity,
                        pointerEvents: 'none'
                    }}></div>
                )}
                <div style={{
                    maxWidth: '80rem',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    position: 'relative',
                    zIndex: 10,
                    width: '100%',
                    padding: '0 clamp(12px, 3vw, 24px)'
                }}>
                    {displayTitle && (
                        <div style={{ marginBottom: 'clamp(24px, 5vw, 48px)', width: '100%' }}>
                            <h2 style={{
                                fontSize: 'clamp(1.5rem, 6vw, 3.5rem)',
                                fontWeight: 'bold',
                                color: 'var(--color-text-primary)',
                                marginBottom: '16px',
                                margin: 0,
                                paddingBottom: '16px'
                            }}>{displayTitle}</h2>
                            <div style={{
                                height: '4px',
                                width: '80px',
                                background: 'linear-gradient(to right, #2563eb, #60a5fa)',
                                borderRadius: '9999px'
                            }}></div>
                        </div>
                    )}
                    <div style={{
                        textAlign: 'center',
                        paddingTop: '80px',
                        paddingBottom: '80px',
                        backgroundColor: 'var(--color-bg-primary)',
                        borderRadius: '16px',
                        border: '2px dashed #d1d5db'
                    }}>
                        <p style={{
                            color: 'var(--color-text-light)',
                            fontSize: '18px'
                        }}>No items to display. Add items in editor.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section style={{
            width: '100%',
            backgroundColor: displayBackgroundColor,
            backgroundImage: displayBackgroundImage ? `url('${displayBackgroundImage}')` : 'none',
            backgroundSize: displayBackgroundSize,
            backgroundPosition: displayBackgroundPosition,
            backgroundRepeat: displayBackgroundRepeat,
            backgroundAttachment: 'scroll',
            paddingTop: '48px',
            paddingBottom: '48px',
            paddingLeft: '16px',
            paddingRight: '16px',
            position: 'relative'
        }}>
            {/* Background overlay for opacity if image exists */}
            {displayBackgroundImage && displayBackgroundOpacity < 1 && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: displayBackgroundColor,
                    opacity: 1 - displayBackgroundOpacity,
                    pointerEvents: 'none'
                }}></div>
            )}
            {/* TITLE SECTION - Outside of flex layout */}
            {displayTitle && (
                <div style={{ marginBottom: 'clamp(24px, 5vw, 48px)', width: '100%', padding: '0 clamp(12px, 3vw, 24px)' }}>
                    <h2 style={{
                        fontSize: 'clamp(1.5rem, 6vw, 3.5rem)',
                        fontWeight: 'bold',
                        color: 'var(--color-text-primary)',
                        marginBottom: 'clamp(8px, 2vw, 16px)',
                        margin: 0,
                        paddingBottom: 'clamp(8px, 2vw, 16px)'
                    }}>{displayTitle}</h2>
                    <div style={{
                        height: '4px',
                        width: 'clamp(60px, 10vw, 80px)',
                        background: 'linear-gradient(to right, #2563eb, #60a5fa)',
                        borderRadius: '9999px'
                    }}></div>
                </div>
            )}

            {/* CONTENT FLEX CONTAINER */}
            <div
                data-flex-mobile={sectionFlexDirection === 'row' || sectionFlexDirection === 'row-reverse' ? 'column' : undefined}
                style={{
                    display: editorContent?.display === 'grid' ? 'grid' : 'flex',
                    flexDirection: editorContent?.display === 'grid' ? undefined : sectionFlexDirection,
                    justifyContent: editorContent?.justifyContent || 'flex-start',
                    alignItems: editorContent?.alignItems || 'stretch',
                    flexWrap: 'wrap',
                    gridTemplateColumns: editorContent?.display === 'grid' ? `repeat(auto-fit, minmax(280px, 1fr))` : undefined,
                    gap: getResponsiveGap(editorContent?.gap),
                    padding: `clamp(8px, 3vw, ${editorContent?.sectionPadding || 16}px)`,
                    width: '100%'
                }}
            >
                {/* Render Groups */}
                {(editorContent?.groups || []).map((group) => (
                    <div
                        key={group.id}
                        data-flex-mobile={group.flexDirection === 'row' || group.flexDirection === 'row-reverse' ? 'column' : undefined}
                        style={{
                            display: 'flex',
                            flexDirection: group.flexDirection || 'row',
                            justifyContent: group.justifyContent || 'flex-start',
                            alignItems: group.alignItems || 'center',
                            gap: getResponsiveGap(group.gap),
                            padding: `clamp(4px, 2vw, ${group.padding || 0}px)`,
                            backgroundColor: group.backgroundColor || 'transparent',
                            width: group.width || '100%',
                            height: group.height || 'auto',
                            borderRadius: '4px',
                            minWidth: '0',
                            minHeight: '0'
                        }}
                    >
                        {group.items.map((item) => (
                            <div
                                key={item.id}
                                data-mobile-display={item.mobileDisplay || undefined}
                                data-mobile-width={item.mobileWidth || undefined}
                                data-tablet-display={item.tabletDisplay || undefined}
                                data-mobile-padding={item.mobilePadding ? 'true' : undefined}
                                data-mobile-font-size={item.mobileFontSize && item.mobileFontSize !== 'auto' ? 'true' : undefined}
                                data-mobile-image-height={item.mobileImageHeight ? 'true' : undefined}
                                data-tablet-padding={item.tabletPadding ? 'true' : undefined}
                                style={{
                                    '--mobile-padding': item.mobilePadding ? `${item.mobilePadding}px` : 'auto',
                                    '--mobile-font-size': item.mobileFontSize && item.mobileFontSize !== 'auto' ? { xs: '12px', sm: '14px', md: '16px', lg: '18px', xl: '20px' }[item.mobileFontSize] : 'inherit',
                                    '--mobile-image-height': item.mobileImageHeight ? `${item.mobileImageHeight}px` : 'auto',
                                    '--tablet-padding': item.tabletPadding ? `${item.tabletPadding}px` : 'auto',
                                    width: item.width || 'auto',
                                    padding: `clamp(2px, 1.5vw, ${item.padding || 0}px)`,
                                    margin: `clamp(2px, 1vw, ${item.margin || 0}px)`,
                                    textAlign: item.align || 'left',
                                    opacity: item.opacity !== undefined ? item.opacity : 1,
                                    flex: item.width && item.width !== '100%' ? '0 0 auto' : '1 1 auto',
                                    minWidth: '0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: item.align === 'center' ? 'center' : item.align === 'right' ? 'flex-end' : 'flex-start'
                                }}
                            >
                                {renderContent(item)}
                            </div>
                        ))}
                    </div>
                ))}

                {/* Render Standalone Items */}
                {displayItems.map((item) => (
                    <div
                        key={item.id}
                        data-mobile-display={item.mobileDisplay || undefined}
                        data-mobile-width={item.mobileWidth || undefined}
                        data-tablet-display={item.tabletDisplay || undefined}
                        data-mobile-padding={item.mobilePadding ? 'true' : undefined}
                        data-mobile-font-size={item.mobileFontSize && item.mobileFontSize !== 'auto' ? 'true' : undefined}
                        data-mobile-image-height={item.mobileImageHeight ? 'true' : undefined}
                        data-tablet-padding={item.tabletPadding ? 'true' : undefined}
                        style={{
                            '--mobile-padding': item.mobilePadding ? `${item.mobilePadding}px` : 'auto',
                            '--mobile-font-size': item.mobileFontSize && item.mobileFontSize !== 'auto' ? { xs: '12px', sm: '14px', md: '16px', lg: '18px', xl: '20px' }[item.mobileFontSize] : 'inherit',
                            '--mobile-image-height': item.mobileImageHeight ? `${item.mobileImageHeight}px` : 'auto',
                            '--tablet-padding': item.tabletPadding ? `${item.tabletPadding}px` : 'auto',
                            width: item.width || '100%',
                            padding: `clamp(2px, 1.5vw, ${item.padding || 0}px)`,
                            margin: `clamp(2px, 1vw, ${item.margin || 0}px)`,
                            textAlign: item.align || 'left',
                            opacity: item.opacity !== undefined ? item.opacity : 1
                        }}
                    >
                        {renderContent(item)}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CustomSection;