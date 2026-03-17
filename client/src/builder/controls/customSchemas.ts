/**
 * Custom Widget Schemas - ProductCard, CategoryCard, Slider, Newsletter, etc.
 * These schemas define controls for your e-commerce custom blocks
 */

import { WidgetControls } from './types/index';

// ============================================================================
// PRODUCT CARD SCHEMA
// ============================================================================

export const productCardSchema: WidgetControls={
    content: [
        {
            name: 'product',
            label: 'Product',
            type: 'heading',
        },
        {
            name: 'productId',
            label: 'Select Product',
            type: 'select',
            options: [],
            help: 'Choose a product to display',
        },
        {
            name: 'showTitle',
            label: 'Show Title',
            type: 'toggle',
            default: true,
        },
        {
            name: 'showPrice',
            label: 'Show Price',
            type: 'toggle',
            default: true,
        },
        {
            name: 'showRating',
            label: 'Show Rating',
            type: 'toggle',
            default: true,
        },
        {
            name: 'showDescription',
            label: 'Show Description',
            type: 'toggle',
            default: false,
        },
        {
            name: 'showAddToCart',
            label: 'Show Add to Cart',
            type: 'toggle',
            default: true,
        },
    ],

    style: [
        {
            name: 'card',
            label: 'Card',
            type: 'heading',
        },
        {
            name: 'backgroundColor',
            label: 'Background Color',
            type: 'color',
        },
        {
            name: 'border',
            label: 'Border',
            type: 'border',
        },
        {
            name: 'borderRadius',
            label: 'Border Radius',
            type: 'number',
            unit: 'px',
            default: 8,
        },
        {
            name: 'boxShadow',
            label: 'Shadow',
            type: 'shadow',
        },
        {
            name: 'padding',
            label: 'Padding',
            type: 'dimensions',
            unit: 'px',
        },

        {
            name: 'image',
            label: 'Image',
            type: 'heading',
        },
        {
            name: 'imageHeight',
            label: 'Image Height',
            type: 'number',
            unit: 'px',
            default: 300,
        },
        {
            name: 'imageBorderRadius',
            label: 'Image Border Radius',
            type: 'number',
            unit: 'px',
        },

        {
            name: 'typography',
            label: 'Typography',
            type: 'heading',
        },
        {
            name: 'titleColor',
            label: 'Title Color',
            type: 'color',
        },
        {
            name: 'titleFontSize',
            label: 'Title Size',
            type: 'unit-number',
            units: ['px', 'rem', 'em'],
            defaultUnit: 'px',
            default: '16px',
        },
        {
            name: 'priceColor',
            label: 'Price Color',
            type: 'color',
        },
        {
            name: 'priceFontSize',
            label: 'Price Size',
            type: 'unit-number',
            units: ['px', 'rem', 'em'],
            defaultUnit: 'px',
            default: '18px',
        },
    ],

    advanced: [
        {
            name: 'hoverEffect',
            label: 'Hover Effect',
            type: 'select',
            options: [
                { label: 'None', value: 'none' },
                { label: 'Scale', value: 'scale' },
                { label: 'Shadow', value: 'shadow' },
                { label: 'Lift', value: 'lift' },
            ],
            default: 'scale',
        },
        {
            name: 'hoverTransition',
            label: 'Transition Duration',
            type: 'number',
            unit: 'ms',
            default: 300,
        },
        {
            name: 'className',
            label: 'CSS Classes',
            type: 'text',
        },
        {
            name: 'hidden',
            label: 'Hide Element',
            type: 'toggle',
            default: false,
            help: 'Hide this element from the frontend'
        },
        {
            name: 'hideDesktop',
            label: 'Hide on Desktop',
            type: 'toggle',
            default: false
        },
        {
            name: 'hideTablet',
            label: 'Hide on Tablet',
            type: 'toggle',
            default: false
        },
        {
            name: 'hideMobile',
            label: 'Hide on Mobile',
            type: 'toggle',
            default: false
        },
    ],
};

// ============================================================================
// CATEGORY CARD SCHEMA
// ============================================================================

export const categoryCardSchema: WidgetControls={
    content: [
        {
            name: 'category',
            label: 'Category',
            type: 'heading',
        },
        {
            name: 'categoryId',
            label: 'Select Category',
            type: 'select',
            options: [],
        },
        {
            name: 'showTitle',
            label: 'Show Title',
            type: 'toggle',
            default: true,
        },
        {
            name: 'showDescription',
            label: 'Show Description',
            type: 'toggle',
            default: false,
        },
        {
            name: 'showProductCount',
            label: 'Show Product Count',
            type: 'toggle',
            default: true,
        },
    ],

    style: [
        {
            name: 'card',
            label: 'Card',
            type: 'heading',
        },
        {
            name: 'backgroundColor',
            label: 'Background Color',
            type: 'color',
        },
        {
            name: 'border',
            label: 'Border',
            type: 'border',
        },
        {
            name: 'borderRadius',
            label: 'Border Radius',
            type: 'number',
            unit: 'px',
            default: 8,
        },
        {
            name: 'boxShadow',
            label: 'Shadow',
            type: 'shadow',
        },
        {
            name: 'padding',
            label: 'Padding',
            type: 'dimensions',
            unit: 'px',
        },

        {
            name: 'image',
            label: 'Image',
            type: 'heading',
        },
        {
            name: 'imageHeight',
            label: 'Image Height',
            type: 'number',
            unit: 'px',
            default: 200,
        },
        {
            name: 'imageBorderRadius',
            label: 'Image Border Radius',
            type: 'number',
            unit: 'px',
        },

        {
            name: 'typography',
            label: 'Typography',
            type: 'heading',
        },
        {
            name: 'titleColor',
            label: 'Title Color',
            type: 'color',
        },
        {
            name: 'titleFontSize',
            label: 'Title Size',
            type: 'number',
            unit: 'px',
            default: 18,
        },
    ],

    advanced: [
        {
            name: 'hoverEffect',
            label: 'Hover Effect',
            type: 'select',
            options: [
                { label: 'None', value: 'none' },
                { label: 'Scale', value: 'scale' },
                { label: 'Overlay', value: 'overlay' },
            ],
            default: 'overlay',
        },
        {
            name: 'className',
            label: 'CSS Classes',
            type: 'text',
        },
        {
            name: 'hidden',
            label: 'Hide Element',
            type: 'toggle',
            default: false,
            help: 'Hide this element from the frontend'
        },
        {
            name: 'hideDesktop',
            label: 'Hide on Desktop',
            type: 'toggle',
            default: false
        },
        {
            name: 'hideTablet',
            label: 'Hide on Tablet',
            type: 'toggle',
            default: false
        },
        {
            name: 'hideMobile',
            label: 'Hide on Mobile',
            type: 'toggle',
            default: false
        },
    ],
};

// ============================================================================
// FEATURED PRODUCTS SCHEMA
// ============================================================================

export const featuredProductsSchema: WidgetControls={
    content: [
        {
            name: 'header',
            label: 'Header',
            type: 'heading',
        },
        {
            name: 'title',
            label: 'Title',
            type: 'text',
            default: 'Featured Products',
        },
        {
            name: 'showTitle',
            label: 'Show Title',
            type: 'toggle',
            default: true,
        },
        {
            name: 'subtitle',
            label: 'Subtitle',
            type: 'text',
        },
        {
            name: 'showSubtitle',
            label: 'Show Subtitle',
            type: 'toggle',
            default: false,
        },

        {
            name: 'products',
            label: 'Products',
            type: 'heading',
        },
        {
            name: 'limit',
            label: 'Number of Products',
            type: 'slider',
            min: 1,
            max: 50,
            step: 1,
            default: 8,
        },
        {
            name: 'columns',
            label: 'Columns',
            type: 'select',
            options: [
                { label: '1', value: 1 },
                { label: '2', value: 2 },
                { label: '3', value: 3 },
                { label: '4', value: 4 },
                { label: '6', value: 6 },
            ],
            default: 3,
            responsive: true,
        },
        {
            name: 'layout',
            label: 'Layout',
            type: 'select',
            options: [
                { label: 'Grid', value: 'grid' },
                { label: 'Carousel', value: 'carousel' },
            ],
            default: 'grid',
        },
    ],

    style: [
        {
            name: 'container',
            label: 'Container',
            type: 'heading',
        },
        {
            name: 'backgroundColor',
            label: 'Background Color',
            type: 'color',
        },
        {
            name: 'padding',
            label: 'Padding',
            type: 'dimensions',
            unit: 'px',
        },

        {
            name: 'spacing',
            label: 'Spacing',
            type: 'heading',
        },
        {
            name: 'gap',
            label: 'Gap Between Items',
            type: 'number',
            unit: 'px',
            default: 20,
            responsive: true,
        },
        {
            name: 'margin',
            label: 'Margin',
            type: 'dimensions',
            unit: 'px',
        },

        {
            name: 'header',
            label: 'Header',
            type: 'heading',
        },
        {
            name: 'titleColor',
            label: 'Title Color',
            type: 'color',
        },
        {
            name: 'titleFontSize',
            label: 'Title Size',
            type: 'number',
            unit: 'px',
            default: 28,
        },
        {
            name: 'subtitleColor',
            label: 'Subtitle Color',
            type: 'color',
        },
        {
            name: 'subtitleFontSize',
            label: 'Subtitle Size',
            type: 'number',
            unit: 'px',
            default: 16,
        },
    ],

    advanced: [
        {
            name: 'className',
            label: 'CSS Classes',
            type: 'text',
        },
        {
            name: 'hidden',
            label: 'Hide Element',
            type: 'toggle',
            default: false,
            help: 'Hide this element from the frontend'
        },
        {
            name: 'hideDesktop',
            label: 'Hide on Desktop',
            type: 'toggle',
            default: false
        },
        {
            name: 'hideTablet',
            label: 'Hide on Tablet',
            type: 'toggle',
            default: false
        },
        {
            name: 'hideMobile',
            label: 'Hide on Mobile',
            type: 'toggle',
            default: false
        },
    ],
};

// ============================================================================
// FEATURED CATEGORIES SCHEMA
// ============================================================================

export const featuredCategoriesSchema: WidgetControls={
    content: [
        {
            name: 'header',
            label: 'Header',
            type: 'heading',
        },
        {
            name: 'title',
            label: 'Title',
            type: 'text',
            default: 'Shop by Category',
        },
        {
            name: 'showTitle',
            label: 'Show Title',
            type: 'toggle',
            default: true,
        },

        {
            name: 'categories',
            label: 'Categories',
            type: 'heading',
        },
        {
            name: 'limit',
            label: 'Number of Categories',
            type: 'slider',
            min: 1,
            max: 50,
            step: 1,
            default: 6,
        },
        {
            name: 'columns',
            label: 'Columns',
            type: 'select',
            options: [
                { label: '1', value: 1 },
                { label: '2', value: 2 },
                { label: '3', value: 3 },
                { label: '4', value: 4 },
                { label: '6', value: 6 },
            ],
            default: 3,
            responsive: true,
        },
    ],

    style: [
        {
            name: 'container',
            label: 'Container',
            type: 'heading',
        },
        {
            name: 'backgroundColor',
            label: 'Background Color',
            type: 'color',
        },
        {
            name: 'padding',
            label: 'Padding',
            type: 'dimensions',
            unit: 'px',
        },

        {
            name: 'spacing',
            label: 'Spacing',
            type: 'heading',
        },
        {
            name: 'gap',
            label: 'Gap Between Items',
            type: 'number',
            unit: 'px',
            default: 20,
            responsive: true,
        },

        {
            name: 'header',
            label: 'Header',
            type: 'heading',
        },
        {
            name: 'titleColor',
            label: 'Title Color',
            type: 'color',
        },
        {
            name: 'titleFontSize',
            label: 'Title Size',
            type: 'number',
            unit: 'px',
            default: 28,
        },
    ],

    advanced: [
        {
            name: 'className',
            label: 'CSS Classes',
            type: 'text',
        },
        {
            name: 'hidden',
            label: 'Hide Element',
            type: 'toggle',
            default: false,
            help: 'Hide this element from the frontend'
        },
        {
            name: 'hideDesktop',
            label: 'Hide on Desktop',
            type: 'toggle',
            default: false
        },
        {
            name: 'hideTablet',
            label: 'Hide on Tablet',
            type: 'toggle',
            default: false
        },
        {
            name: 'hideMobile',
            label: 'Hide on Mobile',
            type: 'toggle',
            default: false
        },
    ],
};

// ============================================================================
// SLIDER SCHEMA
// ============================================================================

export const sliderSchema: WidgetControls={
    content: [
        {
            name: 'slides',
            label: 'Slides',
            type: 'repeater',
            controls: [
                {
                    name: 'media',
                    label: 'Image',
                    type: 'mediapicker',
                    accept: 'image',
                },
                {
                    name: 'title',
                    label: 'Title',
                    type: 'text',
                },
                {
                    name: 'description',
                    label: 'Description',
                    type: 'textarea',
                },
                {
                    name: 'link',
                    label: 'Link',
                    type: 'link',
                },
                {
                    name: 'buttonText',
                    label: 'Button Text',
                    type: 'text',
                },
            ],
            minItems: 1,
        },
    ],

    style: [
        {
            name: 'sizing',
            label: 'Sizing',
            type: 'heading',
        },
        {
            name: 'height',
            label: 'Height',
            type: 'number',
            unit: 'px',
            default: 400,
            responsive: true,
        },
        {
            name: 'borderRadius',
            label: 'Border Radius',
            type: 'number',
            unit: 'px',
        },

        {
            name: 'spacing',
            label: 'Spacing',
            type: 'heading',
        },
        {
            name: 'margin',
            label: 'Margin',
            type: 'dimensions',
            unit: 'px',
        },

        {
            name: 'overlay',
            label: 'Overlay',
            type: 'heading',
        },
        {
            name: 'overlayColor',
            label: 'Overlay Color',
            type: 'color',
        },
        {
            name: 'overlayOpacity',
            label: 'Overlay Opacity',
            type: 'slider',
            min: 0,
            max: 1,
            step: 0.1,
            default: 0.3,
        },

        {
            name: 'content',
            label: 'Content',
            type: 'heading',
        },
        {
            name: 'titleColor',
            label: 'Title Color',
            type: 'color',
        },
        {
            name: 'titleFontSize',
            label: 'Title Size',
            type: 'number',
            unit: 'px',
            default: 32,
        },
        {
            name: 'descriptionColor',
            label: 'Description Color',
            type: 'color',
        },
    ],

    advanced: [
        {
            name: 'autoplay',
            label: 'Autoplay',
            type: 'toggle',
            default: true,
        },
        {
            name: 'autoplayInterval',
            label: 'Autoplay Interval',
            type: 'number',
            unit: 'ms',
            default: 5000,
        },
        {
            name: 'showDots',
            label: 'Show Dots',
            type: 'toggle',
            default: true,
        },
        {
            name: 'showArrows',
            label: 'Show Arrows',
            type: 'toggle',
            default: true,
        },
        {
            name: 'className',
            label: 'CSS Classes',
            type: 'text',
        },
    ],
};

// ============================================================================
// NEWSLETTER SCHEMA
// ============================================================================

export const newsletterSchema: WidgetControls={
    content: [
        {
            name: 'header',
            label: 'Header',
            type: 'heading',
        },
        {
            name: 'title',
            label: 'Title',
            type: 'text',
            default: 'Subscribe to Our Newsletter',
        },
        {
            name: 'subtitle',
            label: 'Subtitle',
            type: 'textarea',
        },
        {
            name: 'description',
            label: 'Description',
            type: 'textarea',
        },

        {
            name: 'form',
            label: 'Form',
            type: 'heading',
        },
        {
            name: 'inputPlaceholder',
            label: 'Input Placeholder',
            type: 'text',
            default: 'Enter your email',
        },
        {
            name: 'buttonText',
            label: 'Button Text',
            type: 'text',
            default: 'Subscribe',
        },

        {
            name: 'success',
            label: 'Success Message',
            type: 'heading',
        },
        {
            name: 'successTitle',
            label: 'Success Title',
            type: 'text',
            default: "You're subscribed!",
        },
        {
            name: 'successMessage',
            label: 'Success Message',
            type: 'textarea',
            default: 'Thanks for subscribing!',
        },
    ],

    style: [
        {
            name: 'container',
            label: 'Container',
            type: 'heading',
        },
        {
            name: 'backgroundColor',
            label: 'Background Color',
            type: 'color',
        },
        {
            name: 'backgroundMedia',
            label: 'Background Image',
            type: 'mediapicker',
            accept: 'image',
        },
        {
            name: 'padding',
            label: 'Padding',
            type: 'dimensions',
            unit: 'px',
            default: { top: 40, right: 40, bottom: 40, left: 40 },
        },
        {
            name: 'borderRadius',
            label: 'Border Radius',
            type: 'number',
            unit: 'px',
        },

        {
            name: 'typography',
            label: 'Typography',
            type: 'heading',
        },
        {
            name: 'titleColor',
            label: 'Title Color',
            type: 'color',
        },
        {
            name: 'titleFontSize',
            label: 'Title Size',
            type: 'number',
            unit: 'px',
            default: 28,
        },
        {
            name: 'textColor',
            label: 'Text Color',
            type: 'color',
        },

        {
            name: 'button',
            label: 'Button',
            type: 'heading',
        },
        {
            name: 'buttonColor',
            label: 'Button Color',
            type: 'color',
        },
        {
            name: 'buttonTextColor',
            label: 'Button Text Color',
            type: 'color',
        },
    ],

    advanced: [
        {
            name: 'layout',
            label: 'Layout',
            type: 'select',
            options: [
                { label: 'Vertical', value: 'vertical' },
                { label: 'Horizontal', value: 'horizontal' },
            ],
            default: 'vertical',
        },
        {
            name: 'className',
            label: 'CSS Classes',
            type: 'text',
        },
        {
            name: 'hidden',
            label: 'Hide Element',
            type: 'toggle',
            default: false,
            help: 'Hide this element from the frontend'
        },
        {
            name: 'hideDesktop',
            label: 'Hide on Desktop',
            type: 'toggle',
            default: false
        },
        {
            name: 'hideTablet',
            label: 'Hide on Tablet',
            type: 'toggle',
            default: false
        },
        {
            name: 'hideMobile',
            label: 'Hide on Mobile',
            type: 'toggle',
            default: false
        },
    ],
};

// ============================================================================
// BASIC WIDGETS SCHEMAS
// ============================================================================

export const headingSchema: WidgetControls={
    content: [
        {
            name: 'content',
            label: 'Heading Text',
            type: 'text',
            placeholder: 'Enter heading text',
        },
        {
            name: 'level',
            label: 'Heading Level',
            type: 'select',
            options: [
                { label: 'H1 - Main Heading', value: 'h1' },
                { label: 'H2 - Subheading', value: 'h2' },
                { label: 'H3 - Section', value: 'h3' },
                { label: 'H4 - Subsection', value: 'h4' },
                { label: 'H5 - Minor', value: 'h5' },
                { label: 'H6 - Minimal', value: 'h6' },
            ],
            default: 'h2',
        },
    ],
    style: [
        {
            name: 'fontSize',
            label: 'Font Size',
            type: 'number',
            unit: 'px',
            default: 24,
            responsive: true,
        },
        {
            name: 'color',
            label: 'Text Color',
            type: 'color',
            default: '#000000',
            responsive: true,
        },
        {
            name: 'textAlign',
            label: 'Alignment',
            type: 'select',
            options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
                { label: 'Justify', value: 'justify' },
            ],
            default: 'left',
            responsive: true,
        },
        {
            name: 'fontWeight',
            label: 'Font Weight',
            type: 'select',
            options: [
                { label: 'Normal', value: 'normal' },
                { label: 'Bold', value: 'bold' },
                { label: '700', value: '700' },
                { label: '600', value: '600' },
            ],
            default: 'bold',
            responsive: true,
        },
        {
            name: 'lineHeight',
            label: 'Line Height',
            type: 'text',
            placeholder: '1.5',
            responsive: true,
        },
        {
            name: 'letterSpacing',
            label: 'Letter Spacing',
            type: 'text',
            placeholder: '0px',
            responsive: true,
        },
        {
            name: 'margin',
            label: 'Margin',
            type: 'text',
            placeholder: '0px',
            responsive: true,
        },
        {
            name: 'padding',
            label: 'Padding',
            type: 'text',
            placeholder: '0px',
            responsive: true,
        },
    ],
    advanced: [
        {
            name: 'className',
            label: 'CSS Classes',
            type: 'text',
        },
        {
            name: 'hidden',
            label: 'Hide Element',
            type: 'toggle',
            default: false,
            help: 'Hide this element from the frontend',
            responsive: true,
        },
    ],
};

export const textSchema: WidgetControls={
    content: [
        {
            name: 'content',
            label: 'Text Content',
            type: 'textarea',
            placeholder: 'Enter text content',
            rows: 3,
        },
    ],
    style: [
        {
            name: 'fontSize',
            label: 'Font Size',
            type: 'number',
            unit: 'px',
            default: 16,
            responsive: true,
        },
        {
            name: 'color',
            label: 'Text Color',
            type: 'color',
            default: '#333333',
            responsive: true,
        },
        {
            name: 'textAlign',
            label: 'Alignment',
            type: 'select',
            options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
                { label: 'Justify', value: 'justify' },
            ],
            default: 'left',
            responsive: true,
        },
        {
            name: 'lineHeight',
            label: 'Line Height',
            type: 'text',
            placeholder: '1.6',
            responsive: true,
        },
        {
            name: 'margin',
            label: 'Margin',
            type: 'text',
            placeholder: '0px',
            responsive: true,
        },
        {
            name: 'padding',
            label: 'Padding',
            type: 'text',
            placeholder: '0px',
            responsive: true,
        },
    ],
    advanced: [
        {
            name: 'className',
            label: 'CSS Classes',
            type: 'text',
        },
        {
            name: 'hidden',
            label: 'Hide Element',
            type: 'toggle',
            default: false,
            help: 'Hide this element from the frontend',
            responsive: true,
        },
    ],
};

export const buttonSchema: WidgetControls={
    content: [
        {
            name: 'text',
            label: 'Button Text',
            type: 'text',
            placeholder: 'Click me',
        },
        {
            name: 'link',
            label: 'Link URL',
            type: 'text',
            placeholder: '/products',
        },
    ],
    style: [
        {
            name: 'backgroundColor',
            label: 'Background Color',
            type: 'color',
            default: '#3b82f6',
            responsive: true,
        },
        {
            name: 'color',
            label: 'Text Color',
            type: 'color',
            default: '#ffffff',
            responsive: true,
        },
        {
            name: 'fontSize',
            label: 'Font Size',
            type: 'number',
            unit: 'px',
            default: 16,
            min: 8,
            max: 72,
            responsive: true,
        },
        {
            name: 'paddingTop',
            label: 'Padding Top',
            type: 'number',
            unit: 'px',
            default: 12,
            min: 0,
            max: 100,
            responsive: true,
        },
        {
            name: 'paddingRight',
            label: 'Padding Right',
            type: 'number',
            unit: 'px',
            default: 24,
            min: 0,
            max: 100,
            responsive: true,
        },
        {
            name: 'paddingBottom',
            label: 'Padding Bottom',
            type: 'number',
            unit: 'px',
            default: 12,
            min: 0,
            max: 100,
            responsive: true,
        },
        {
            name: 'paddingLeft',
            label: 'Padding Left',
            type: 'number',
            unit: 'px',
            default: 24,
            min: 0,
            max: 100,
            responsive: true,
        },
        {
            name: 'borderRadius',
            label: 'Border Radius',
            type: 'number',
            unit: 'px',
            default: 6,
            min: 0,
            max: 50,
            responsive: true,
        },
        {
            name: 'margin',
            label: 'Margin',
            type: 'text',
            placeholder: '0px',
            responsive: true,
        },
        {
            name: 'boxShadow',
            label: 'Box Shadow',
            type: 'toggle',
            default: false,
            responsive: true,
            help: 'Enable drop shadow effect'
        },
        {
            name: 'hoverBgColor',
            label: 'Hover Background',
            type: 'color',
            default: '#2563eb',
            responsive: true,
            help: 'Button background on hover'
        },
        {
            name: 'hoverTextColor',
            label: 'Hover Text Color',
            type: 'color',
            default: '#ffffff',
            responsive: true,
            help: 'Button text color on hover'
        },
    ],
    advanced: [
        {
            name: 'className',
            label: 'CSS Classes',
            type: 'text',
        },
        {
            name: 'hidden',
            label: 'Hide Element',
            type: 'toggle',
            default: false,
            help: 'Hide this element from the frontend',
            responsive: true,
        },
    ],
};

export const imageSchema: WidgetControls={
    content: [
        {
            name: 'src',
            label: 'Image URL',
            type: 'text',
            placeholder: '/images/example.jpg',
        },
        {
            name: 'alt',
            label: 'Alt Text',
            type: 'text',
            placeholder: 'Image description',
        },
    ],
    style: [
        {
            name: 'width',
            label: 'Width',
            type: 'unit-number',
            units: ['px', 'vh', 'vw', 'em', 'rem', '%'],
            defaultUnit: '%',
            default: '100%',
        },
        {
            name: 'height',
            label: 'Height',
            type: 'text',
            placeholder: 'auto',
        },
        {
            name: 'objectFit',
            label: 'Object Fit',
            type: 'select',
            options: [
                { label: 'Cover', value: 'cover' },
                { label: 'Contain', value: 'contain' },
                { label: 'Fill', value: 'fill' },
                { label: 'Scale Down', value: 'scale-down' },
            ],
            default: 'cover',
        },
        {
            name: 'objectPosition',
            label: 'Object Position',
            type: 'select',
            options: [
                { label: 'Center', value: 'center' },
                { label: 'Top', value: 'top' },
                { label: 'Bottom', value: 'bottom' },
                { label: 'Left', value: 'left' },
                { label: 'Right', value: 'right' },
                { label: 'Top Left', value: 'top left' },
                { label: 'Top Right', value: 'top right' },
                { label: 'Bottom Left', value: 'bottom left' },
                { label: 'Bottom Right', value: 'bottom right' },
            ],
            default: 'center',
        },
        {
            name: 'borderRadius',
            label: 'Border Radius',
            type: 'number',
            unit: 'px',
            default: 0,
        },
        {
            name: 'opacity',
            label: 'Opacity',
            type: 'number',
            min: 0,
            max: 1,
            step: 0.1,
            default: 1,
        },
        {
            name: 'padding',
            label: 'Padding',
            type: 'number',
            unit: 'px',
            default: 0,
        },
    ],
    advanced: [
        {
            name: 'className',
            label: 'CSS Classes',
            type: 'text',
        },
    ],
};

// ============================================================================
// SCHEMAS MAP
// ============================================================================

export const customSchemas: Record<string, WidgetControls>={
    // Basic widgets
    heading: headingSchema,
    text: textSchema,
    button: buttonSchema,
    image: imageSchema,
    // Complex blocks
    productCard: productCardSchema,
    categoryCard: categoryCardSchema,
    featuredProducts: featuredProductsSchema,
    featuredCategories: featuredCategoriesSchema,
    slider: sliderSchema,
    newsletter: newsletterSchema,
};

// ============================================================================
// HELPER FUNCTION
// ============================================================================

export function getCustomSchema(widgetType: string): WidgetControls {
    return (
        customSchemas[widgetType]||{
            content: [],
            style: [],
            advanced: [],
        }
    );
}
