/**
 * Layout Schemas - Controls for Section, Container, Column
 */

import { WidgetControls } from './types/index';

export const layoutSchemas: Record<string, WidgetControls>={
    // === SECTION ===
    section: {
        content: [
            {
                name: 'heading',
                label: 'Content Width',
                type: 'heading'
            },
            {
                name: 'contentWidthMode',
                label: 'Mode',
                type: 'buttongroup',
                options: [
                    { label: 'Full Width', value: 'full_width' },
                    { label: 'Boxed', value: 'boxed' }
                ],
                default: 'full_width',
                help: 'Choose how to layout the content'
            },
            {
                name: 'boxedMaxWidth',
                label: 'Max Width (px)',
                type: 'number',
                default: 1140,
                min: 400,
                max: 2000,
                unit: 'px',
                condition: (node) => node.contentWidthMode==='boxed',
                help: 'Maximum width when in boxed mode'
            },
            {
                name: 'horizontalPadding',
                label: 'Horizontal Padding (px)',
                type: 'number',
                default: 15,
                min: 0,
                max: 100,
                unit: 'px',
                condition: (node) => node.contentWidthMode==='boxed',
                help: 'Padding on left and right when in boxed mode'
            },
            {
                name: 'columnsDivider',
                label: 'Columns',
                type: 'heading'
            },
            {
                name: 'contentWidth',
                label: 'Content Width',
                type: 'select',
                options: [
                    { label: 'Full Width', value: 'full' },
                    { label: 'Boxed', value: 'boxed' },
                    { label: 'Custom', value: 'custom' }
                ],
                default: 'full'
            },
            {
                name: 'numColumns',
                label: 'Columns',
                type: 'slider',
                min: 1,
                max: 6,
                default: 1,
                responsive: true,
                help: 'Number of columns in the section'
            }
        ],
        style: [
            {
                name: 'backgroundColor',
                label: 'Background Color',
                type: 'color'
            },
            {
                name: 'backgroundImage',
                label: 'Background Image',
                type: 'mediapicker',
                accept: 'image'
            },
            {
                name: 'backgroundSize',
                label: 'Background Size',
                type: 'select',
                options: [
                    { label: 'Cover', value: 'cover' },
                    { label: 'Contain', value: 'contain' },
                    { label: 'Auto', value: 'auto' },
                    { label: '100% 100%', value: '100% 100%' },
                    { label: '100% Auto', value: '100% auto' },
                    { label: 'Auto 100%', value: 'auto 100%' }
                ],
                default: 'cover',
                condition: (node) => !!node.backgroundImage,
                help: 'How the background image should be sized'
            },
            {
                name: 'backgroundPosition',
                label: 'Background Position',
                type: 'select',
                options: [
                    { label: 'Center', value: 'center' },
                    { label: 'Top Left', value: 'top left' },
                    { label: 'Top Center', value: 'top center' },
                    { label: 'Top Right', value: 'top right' },
                    { label: 'Center Left', value: 'center left' },
                    { label: 'Center Right', value: 'center right' },
                    { label: 'Bottom Left', value: 'bottom left' },
                    { label: 'Bottom Center', value: 'bottom center' },
                    { label: 'Bottom Right', value: 'bottom right' }
                ],
                default: 'center',
                condition: (node) => !!node.backgroundImage,
                help: 'Position of the background image'
            },
            {
                name: 'backgroundOpacity',
                label: 'Background Image Opacity',
                type: 'slider',
                min: 0,
                max: 1,
                step: 0.1,
                default: 1,
                condition: (node) => !!node.backgroundImage,
            },
            {
                name: 'minHeight',
                label: 'Min Height',
                type: 'unit-number',
                units: ['px', 'rem', 'em', '%', 'vh', 'vw'],
                defaultUnit: 'px',
                responsive: true
            },
            {
                name: 'height',
                label: 'Height',
                type: 'unit-number',
                units: ['px', 'rem', 'em', '%', 'vh', 'vw'],
                defaultUnit: 'px',
                responsive: true
            },
            {
                name: 'border',
                label: 'Border',
                type: 'border'
            },
            {
                name: 'shadow',
                label: 'Shadow',
                type: 'shadow'
            },
            {
                name: 'padding',
                label: 'Padding',
                type: 'dimensions',
                unit: 'px',
                responsive: true
            },
            {
                name: 'margin',
                label: 'Margin',
                type: 'dimensions',
                unit: 'px',
                responsive: true
            },
            {
                name: 'gap',
                label: 'Gap Between Items',
                type: 'unit-number',
                units: ['px', 'rem', 'em', '%', 'vh', 'vw'],
                defaultUnit: 'px',
                default: '0px',
                responsive: true
            }
        ],
        advanced: [
            {
                name: 'direction',
                label: 'Layout Direction',
                type: 'buttongroup',
                options: [
                    { label: 'Down ↓', value: 'column', icon: 'fa-arrow-down' },
                    { label: 'Side →', value: 'row', icon: 'fa-arrow-right' }
                ],
                responsive: true,
                help: 'Arrange columns vertically or horizontally'
            },
            {
                name: 'display',
                label: 'Display',
                type: 'select',
                options: [
                    { label: 'Block', value: 'block' },
                    { label: 'Flex', value: 'flex' },
                    { label: 'Grid', value: 'grid' }
                ],
                responsive: true
            },
            {
                name: 'flexDirection',
                label: 'Direction',
                type: 'select',
                options: [
                    { label: 'Row', value: 'row' },
                    { label: 'Column', value: 'column' }
                ],
                responsive: true,
                condition: (node) => node.display==='flex'
            },
            {
                name: 'justifyContent',
                label: 'Justify Content',
                type: 'align',
                options: ['flex-start', 'center', 'flex-end', 'space-between']
            },
            {
                name: 'alignItems',
                label: 'Align Items',
                type: 'align',
                options: ['flex-start', 'center', 'flex-end']
            },
            {
                name: 'gap',
                label: 'Gap',
                type: 'gap',
                unit: 'px',
                responsive: true
            },
            {
                name: 'customClass',
                label: 'CSS Class',
                type: 'text'
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
            }
        ]
    },

    // === COLUMN ===
    column: {
        content: [
            {
                name: 'verticalAlign',
                label: 'Vertical Align',
                type: 'select',
                options: [
                    { label: 'Top', value: 'flex-start' },
                    { label: 'Center', value: 'center' },
                    { label: 'Bottom', value: 'flex-end' },
                    { label: 'Stretch', value: 'stretch' }
                ],
                default: 'flex-start'
            },
            {
                name: 'horizontalAlign',
                label: 'Horizontal Align',
                type: 'select',
                options: [
                    { label: 'Left', value: 'flex-start' },
                    { label: 'Center', value: 'center' },
                    { label: 'Right', value: 'flex-end' },
                    { label: 'Space Between', value: 'space-between' }
                ],
                default: 'flex-start'
            },
            {
                name: 'gap',
                label: 'Gap Between Widgets',
                type: 'unit-number',
                units: ['px', 'rem', 'em', '%', 'vh', 'vw'],
                defaultUnit: 'px',
                default: '0px',
                responsive: true,
                help: 'Space between widgets inside the column'
            }
        ],
        style: [
            {
                name: 'backgroundColor',
                label: 'Background Color',
                type: 'color'
            },
            {
                name: 'padding',
                label: 'Padding',
                type: 'dimensions',
                unit: 'px',
                responsive: true
            },
            {
                name: 'margin',
                label: 'Margin',
                type: 'dimensions',
                unit: 'px',
                responsive: true
            },
            {
                name: 'border',
                label: 'Border',
                type: 'border'
            },
            {
                name: 'shadow',
                label: 'Shadow',
                type: 'shadow'
            },
            {
                name: 'minHeight',
                label: 'Min Height',
                type: 'number',
                unit: 'px',
                responsive: true
            },
            {
                name: 'height',
                label: 'Height',
                type: 'unit-number',
                units: ['px', 'rem', 'em', '%', 'vh', 'vw'],
                defaultUnit: 'px',
                responsive: true
            }
        ],
        advanced: [
            {
                name: 'width',
                label: 'Column Width',
                type: 'unit-number',
                units: ['px', 'vh', 'vw', 'em', 'rem', '%', 'auto'],
                defaultUnit: '%',
                responsive: true,
                help: 'Set the width of this column (adjustable)'
            },
            {
                name: 'direction',
                label: 'Layout Direction',
                type: 'buttongroup',
                options: [
                    { label: 'Down ↓', value: 'column', icon: 'fa-arrow-down' },
                    { label: 'Side →', value: 'row', icon: 'fa-arrow-right' }
                ],
                responsive: true,
                help: 'Arrange child elements vertically or horizontally'
            },
            {
                name: 'display',
                label: 'Display',
                type: 'select',
                options: [
                    { label: 'Block', value: 'block' },
                    { label: 'Flex', value: 'flex' }
                ],
                default: 'flex'
            },
            {
                name: 'flexDirection',
                label: 'Direction',
                type: 'select',
                options: [
                    { label: 'Row', value: 'row' },
                    { label: 'Column', value: 'column' }
                ],
                responsive: true,
                condition: (node) => node.display==='flex'
            },
            {
                name: 'gap',
                label: 'Gap',
                type: 'gap',
                unit: 'px',
                responsive: true
            },
            {
                name: 'customClass',
                label: 'CSS Class',
                type: 'text'
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
            }
        ]
    }
};

/**
 * Get schema for layout type
 */
export const getLayoutSchema=(kind: 'section'|'column'): WidgetControls => {
    return layoutSchemas[kind]||{ content: [], style: [], advanced: [] };
};
