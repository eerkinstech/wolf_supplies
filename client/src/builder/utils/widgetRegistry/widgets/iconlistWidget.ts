/**
 * IconList Widget Registration
 */

import { registerWidget } from '../registry';
import IconListWidget from '../../../widgets/IconListWidget';

registerWidget({
    widgetType: 'iconlist',
    name: 'Icon List',
    icon: 'List',
    renderer: IconListWidget,
    schema: {
        content: [
            {
                type: 'repeater',
                label: 'Icon Items',
                name: 'items',
                default: [
                    { id: '1', icon: 'fas fa-check', heading: 'Item 1', text: 'Description text', link: '', openNewTab: false },
                    { id: '2', icon: 'fas fa-star', heading: 'Item 2', text: 'Description text', link: '', openNewTab: false },
                    { id: '3', icon: 'fas fa-heart', heading: 'Item 3', text: 'Description text', link: '', openNewTab: false },
                ],
                fields: [
                    {
                        type: 'icon',
                        label: 'Icon',
                        name: 'icon',
                        default: 'fas fa-check'
                    } as any,
                    {
                        type: 'text',
                        label: 'Heading',
                        name: 'heading',
                        placeholder: 'Item heading',
                        default: 'Item'
                    } as any,
                    {
                        type: 'textarea',
                        label: 'Description',
                        name: 'text',
                        placeholder: 'Item description',
                        default: 'Description text'
                    } as any,
                    {
                        type: 'text',
                        label: 'Link',
                        name: 'link',
                        placeholder: 'https://example.com or /page',
                        default: ''
                    } as any,
                    {
                        type: 'toggle',
                        label: 'Open in New Tab',
                        name: 'openNewTab',
                        default: false
                    } as any,
                ],
                help: 'Click on an item to edit its details'
            } as any,
        ],

        style: [
            {
                type: 'heading',
                label: 'Layout',
                name: 'layout'
            } as any,
            {
                type: 'select',
                label: 'Items Layout',
                name: 'itemsLayout',
                options: [
                    { label: 'Vertical', value: 'vertical' },
                    { label: 'Horizontal', value: 'horizontal' },
                ],
                default: 'vertical'
            } as any,
            {
                type: 'select',
                label: 'Parent Items Alignment',
                name: 'containerAlignment',
                options: [
                    { label: 'Flex Start', value: 'flex-start' },
                    { label: 'Center', value: 'center' },
                    { label: 'Flex End', value: 'flex-end' },
                    { label: 'Space Between', value: 'space-between' },
                    { label: 'Space Around', value: 'space-around' },
                    { label: 'Space Evenly', value: 'space-evenly' },
                ],
                default: 'flex-start'
            } as any,
            {
                type: 'select',
                label: 'Single Item Alignment',
                name: 'itemAlignment',
                options: [
                    { label: 'Start', value: 'flex-start' },
                    { label: 'Center', value: 'center' },
                    { label: 'End', value: 'flex-end' },
                    { label: 'Stretch', value: 'stretch' },
                ],
                default: 'flex-start'
            } as any,
            {
                type: 'select',
                label: 'Items Vertical Alignment',
                name: 'itemsVerticalAlign',
                options: [
                    { label: 'Start', value: 'flex-start' },
                    { label: 'Center', value: 'center' },
                    { label: 'End', value: 'flex-end' },
                ],
                default: 'flex-start'
            } as any,
            {
                type: 'select',
                label: 'Icon Position',
                name: 'iconPosition',
                options: [
                    { label: 'Icon Left', value: 'left' },
                    { label: 'Icon Top', value: 'top' },
                ],
                default: 'left'
            } as any,
            {
                type: 'slider',
                label: 'Gap Between Items',
                name: 'gap',
                min: 0,
                max: 50,
                unit: 'px',
                default: 16,
                responsive: true
            } as any,
            {
                type: 'slider',
                label: 'Gap Inside Items (Icon to Text)',
                name: 'itemGap',
                min: 0,
                max: 50,
                unit: 'px',
                default: 12,
                responsive: true
            } as any,
            {
                type: 'slider',
                label: 'Gap Between Heading and Description',
                name: 'descriptionGap',
                min: 0,
                max: 30,
                unit: 'px',
                default: 4,
                responsive: true
            } as any,
            {
                type: 'heading',
                label: 'Icon Styling',
                name: 'iconStyling'
            } as any,
            {
                type: 'slider',
                label: 'Icon Size',
                name: 'iconSize',
                min: 12,
                max: 100,
                unit: 'px',
                default: 24
            } as any,
            {
                type: 'color',
                label: 'Icon Color',
                name: 'iconColor',
                default: '#3b82f6'
            } as any,
            {
                type: 'color',
                label: 'Icon Background Color',
                name: 'iconBackgroundColor',
                default: 'transparent'
            } as any,
            {
                type: 'slider',
                label: 'Icon Background Padding',
                name: 'iconPadding',
                min: 0,
                max: 30,
                unit: 'px',
                default: 8
            } as any,
            {
                type: 'slider',
                label: 'Icon Border Radius',
                name: 'iconBorderRadius',
                min: 0,
                max: 50,
                unit: 'px',
                default: 0
            } as any,
            {
                type: 'heading',
                label: 'Heading Styling',
                name: 'headingStyling'
            } as any,
            {
                type: 'slider',
                label: 'Heading Font Size',
                name: 'headingFontSize',
                min: 12,
                max: 48,
                unit: 'px',
                default: 18,
                responsive: true
            } as any,
            {
                type: 'color',
                label: 'Heading Color',
                name: 'headingColor',
                default: '#000000'
            } as any,
            {
                type: 'select',
                label: 'Heading Font Weight',
                name: 'headingFontWeight',
                options: [
                    { label: 'Light', value: '300' },
                    { label: 'Normal', value: '400' },
                    { label: 'Medium', value: '500' },
                    { label: 'Semi Bold', value: '600' },
                    { label: 'Bold', value: '700' },
                    { label: 'Extra Bold', value: '900' }
                ],
                default: '600'
            } as any,
            {
                type: 'heading',
                label: 'Text Styling',
                name: 'textStyling'
            } as any,
            {
                type: 'slider',
                label: 'Text Font Size',
                name: 'textFontSize',
                min: 10,
                max: 36,
                unit: 'px',
                default: 14,
                responsive: true
            } as any,
            {
                type: 'color',
                label: 'Text Color',
                name: 'textColor',
                default: '#666666'
            } as any,
            {
                type: 'slider',
                label: 'Text Gap',
                name: 'textGap',
                min: 0,
                max: 20,
                unit: 'px',
                default: 4
            } as any,
            {
                type: 'heading',
                label: 'Item Styling',
                name: 'itemStyling'
            } as any,
            {
                type: 'color',
                label: 'Item Background Color',
                name: 'itemBackgroundColor',
                default: 'transparent'
            } as any,
            {
                type: 'slider',
                label: 'Item Border Radius',
                name: 'itemBorderRadius',
                min: 0,
                max: 50,
                unit: 'px',
                default: 0,
                responsive: true
            } as any,
            {
                type: 'heading',
                label: 'Item Border',
                name: 'itemBorderHeading'
            } as any,
            {
                type: 'slider',
                label: 'Border Width',
                name: 'itemBorderWidth',
                min: 0,
                max: 10,
                unit: 'px',
                default: 0
            } as any,
            {
                type: 'select',
                label: 'Border Style',
                name: 'itemBorderStyle',
                options: [
                    { label: 'Solid', value: 'solid' },
                    { label: 'Dashed', value: 'dashed' },
                    { label: 'Dotted', value: 'dotted' },
                    { label: 'Double', value: 'double' },
                ],
                default: 'solid'
            } as any,
            {
                type: 'color',
                label: 'Border Color',
                name: 'itemBorderColor',
                default: '#000000'
            } as any,
            {
                type: 'heading',
                label: 'Item Box Shadow',
                name: 'itemBoxShadowHeading'
            } as any,
            {
                type: 'slider',
                label: 'Shadow Horizontal Offset',
                name: 'itemShadowOffsetX',
                min: -20,
                max: 20,
                unit: 'px',
                default: 0
            } as any,
            {
                type: 'slider',
                label: 'Shadow Vertical Offset',
                name: 'itemShadowOffsetY',
                min: -20,
                max: 20,
                unit: 'px',
                default: 0
            } as any,
            {
                type: 'slider',
                label: 'Shadow Blur',
                name: 'itemShadowBlur',
                min: 0,
                max: 50,
                unit: 'px',
                default: 0
            } as any,
            {
                type: 'slider',
                label: 'Shadow Spread',
                name: 'itemShadowSpread',
                min: -20,
                max: 20,
                unit: 'px',
                default: 0
            } as any,
            {
                type: 'color',
                label: 'Shadow Color',
                name: 'itemShadowColor',
                default: 'rgba(0, 0, 0, 0.1)'
            } as any,
            {
                type: 'heading',
                label: 'Item Hover Effects',
                name: 'itemHoverHeading'
            } as any,
            {
                type: 'color',
                label: 'Item Background Hover',
                name: 'itemBackgroundHover',
                default: 'transparent'
            } as any,
            {
                type: 'color',
                label: 'Icon Color Hover',
                name: 'iconColorHover',
                default: ''
            } as any,
            {
                type: 'color',
                label: 'Icon Background Hover',
                name: 'iconBackgroundHover',
                default: 'transparent'
            } as any,
            {
                type: 'color',
                label: 'Heading Text Hover',
                name: 'headingColorHover',
                default: ''
            } as any,
            {
                type: 'color',
                label: 'Description Text Hover',
                name: 'textColorHover',
                default: ''
            } as any,
            {
                type: 'heading',
                label: 'Hover Box Shadow',
                name: 'itemHoverShadowHeading'
            } as any,
            {
                type: 'slider',
                label: 'Hover Shadow Horizontal',
                name: 'itemHoverShadowOffsetX',
                min: -20,
                max: 20,
                unit: 'px',
                default: 0
            } as any,
            {
                type: 'slider',
                label: 'Hover Shadow Vertical',
                name: 'itemHoverShadowOffsetY',
                min: -20,
                max: 20,
                unit: 'px',
                default: 5
            } as any,
            {
                type: 'slider',
                label: 'Hover Shadow Blur',
                name: 'itemHoverShadowBlur',
                min: 0,
                max: 50,
                unit: 'px',
                default: 10
            } as any,
            {
                type: 'slider',
                label: 'Hover Shadow Spread',
                name: 'itemHoverShadowSpread',
                min: -20,
                max: 20,
                unit: 'px',
                default: 0
            } as any,
            {
                type: 'color',
                label: 'Hover Shadow Color',
                name: 'itemHoverShadowColor',
                default: 'rgba(0, 0, 0, 0.2)'
            } as any,
            {
                type: 'heading',
                label: 'Item Size & Spacing',
                name: 'itemSizeHeading'
            } as any,
            {
                type: 'slider',
                label: 'Item Width',
                name: 'itemWidth',
                min: 50,
                max: 600,
                unit: 'px',
                default: 0,
                responsive: true
            } as any,
            {
                type: 'slider',
                label: 'Item Padding',
                name: 'itemPadding',
                min: 0,
                max: 50,
                unit: 'px',
                default: 16,
                responsive: true
            } as any,
            {
                type: 'slider',
                label: 'Item Margin',
                name: 'itemMargin',
                min: 0,
                max: 50,
                unit: 'px',
                default: 0,
                responsive: true
            } as any,
            {
                type: 'heading',
                label: 'Spacing',
                name: 'spacing'
            } as any,
            {
                type: 'dimensions',
                label: 'Padding',
                name: 'padding',
                unit: 'px',
                responsive: true
            } as any,
            {
                type: 'dimensions',
                label: 'Margin',
                name: 'margin',
                unit: 'px',
                responsive: true
            } as any,
        ],

        advanced: [
            {
                type: 'text',
                label: 'CSS Classes',
                name: 'customClass',
                default: ''
            } as any,
            {
                type: 'select',
                label: 'Hide On Device',
                name: 'hideOn',
                options: [
                    { label: 'Desktop', value: 'desktop' },
                    { label: 'Tablet', value: 'tablet' },
                    { label: 'Mobile', value: 'mobile' }
                ],
                multiple: true
            } as any,
        ]
    },
    defaultProps: {
        items: [
            { id: '1', icon: 'fas fa-check', heading: 'Item 1', text: 'Description text', link: '', openNewTab: false },
            { id: '2', icon: 'fas fa-star', heading: 'Item 2', text: 'Description text', link: '', openNewTab: false },
            { id: '3', icon: 'fas fa-heart', heading: 'Item 3', text: 'Description text', link: '', openNewTab: false },
        ],
        iconPosition: 'left'
    },
    category: 'Advanced'
});
