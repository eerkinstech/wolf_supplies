/**
 * Icon Widget Registration
 */

import { registerWidget } from '../registry';
import IconWidget from '../../../widgets/IconWidget';

registerWidget({
    widgetType: 'icon',
    name: 'Icon',
    icon: 'Heart',
    renderer: IconWidget,
    schema: {
        content: [
            {
                type: 'icon',
                label: 'Select Icon',
                name: 'icon',
                default: 'fas fa-star'
            } as any,
        ],

        style: [
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
                max: 200,
                unit: 'px',
                default: 48,
                responsive: true
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
                label: 'Icon Padding',
                name: 'iconPadding',
                min: 0,
                max: 50,
                unit: 'px',
                default: 0,
                responsive: true
            } as any,
            {
                type: 'slider',
                label: 'Icon Border Radius',
                name: 'iconBorderRadius',
                min: 0,
                max: 100,
                unit: 'px',
                default: 0,
                responsive: true
            } as any,
            {
                type: 'heading',
                label: 'Icon Border',
                name: 'iconBorderHeading'
            } as any,
            {
                type: 'slider',
                label: 'Border Width',
                name: 'iconBorderWidth',
                min: 0,
                max: 10,
                unit: 'px',
                default: 0
            } as any,
            {
                type: 'select',
                label: 'Border Style',
                name: 'iconBorderStyle',
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
                name: 'iconBorderColor',
                default: '#000000'
            } as any,
            {
                type: 'heading',
                label: 'Icon Box Shadow',
                name: 'iconShadowHeading'
            } as any,
            {
                type: 'slider',
                label: 'Shadow Horizontal Offset',
                name: 'iconShadowOffsetX',
                min: -20,
                max: 20,
                unit: 'px',
                default: 0
            } as any,
            {
                type: 'slider',
                label: 'Shadow Vertical Offset',
                name: 'iconShadowOffsetY',
                min: -20,
                max: 20,
                unit: 'px',
                default: 0
            } as any,
            {
                type: 'slider',
                label: 'Shadow Blur',
                name: 'iconShadowBlur',
                min: 0,
                max: 50,
                unit: 'px',
                default: 0
            } as any,
            {
                type: 'slider',
                label: 'Shadow Spread',
                name: 'iconShadowSpread',
                min: -20,
                max: 20,
                unit: 'px',
                default: 0
            } as any,
            {
                type: 'color',
                label: 'Shadow Color',
                name: 'iconShadowColor',
                default: 'rgba(0, 0, 0, 0.1)'
            } as any,
            {
                type: 'heading',
                label: 'Alignment',
                name: 'alignmentHeading'
            } as any,
            {
                type: 'select',
                label: 'Horizontal Alignment',
                name: 'alignment',
                options: [
                    { label: 'Left', value: 'flex-start' },
                    { label: 'Center', value: 'center' },
                    { label: 'Right', value: 'flex-end' },
                ],
                default: 'center'
            } as any,
            {
                type: 'heading',
                label: 'Icon Hover Effects',
                name: 'iconHoverHeading'
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
                type: 'heading',
                label: 'Hover Box Shadow',
                name: 'iconHoverShadowHeading'
            } as any,
            {
                type: 'slider',
                label: 'Hover Shadow Horizontal',
                name: 'iconHoverShadowOffsetX',
                min: -20,
                max: 20,
                unit: 'px',
                default: 0
            } as any,
            {
                type: 'slider',
                label: 'Hover Shadow Vertical',
                name: 'iconHoverShadowOffsetY',
                min: -20,
                max: 20,
                unit: 'px',
                default: 5
            } as any,
            {
                type: 'slider',
                label: 'Hover Shadow Blur',
                name: 'iconHoverShadowBlur',
                min: 0,
                max: 50,
                unit: 'px',
                default: 10
            } as any,
            {
                type: 'slider',
                label: 'Hover Shadow Spread',
                name: 'iconHoverShadowSpread',
                min: -20,
                max: 20,
                unit: 'px',
                default: 0
            } as any,
            {
                type: 'color',
                label: 'Hover Shadow Color',
                name: 'iconHoverShadowColor',
                default: 'rgba(0, 0, 0, 0.2)'
            } as any,
            {
                type: 'heading',
                label: 'Spacing',
                name: 'spacing'
            } as any,
            {
                type: 'unit-number',
                label: 'Width',
                name: 'width',
                min: 0,
                max: 800,
                step: 1,
                defaultUnit: 'px',
                units: ['px', 'rem', 'em', '%', 'vw'],
                default: '',
                responsive: true
            } as any,
            {
                type: 'dimensions',
                label: 'Margin',
                name: 'margin',
                default: { top: '', right: '', bottom: '', left: '' },
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
        icon: 'fas fa-star'
    },
    category: 'Basic'
});
