/**
 * Button Widget Registration
 */

import { registerWidget } from '../registry';
import ButtonWidget from '../../../widgets/ButtonWidget';

registerWidget({
    widgetType: 'button',
    name: 'Button',
    icon: 'Button',
    renderer: ButtonWidget,
    schema: {
        content: [
            {
                type: 'text',
                label: 'Button Text',
                name: 'text',
                default: 'Click Me'
            } as any,
            {
                type: 'text',
                label: 'Icon Class',
                name: 'icon',
                placeholder: 'e.g., fas fa-arrow-right or leave empty',
                default: ''
            } as any,
            {
                type: 'text',
                label: 'Link URL',
                name: 'link',
                placeholder: 'e.g., /about or https://example.com',
                default: ''
            } as any,
            {
                type: 'toggle',
                label: 'Open in New Tab',
                name: 'openNewTab',
                default: false
            } as any,
            {
                type: 'select',
                label: 'Style',
                name: 'style',
                options: [
                    { label: 'Primary', value: 'primary' },
                    { label: 'Secondary', value: 'secondary' },
                    { label: 'Outline', value: 'outline' }
                ],
                default: 'primary'
            } as any
        ],
        style: [
            {
                type: 'heading',
                label: 'Sizing',
                name: 'sizing'
            } as any,
            {
                type: 'unit-number',
                label: 'Parent Width',
                name: 'width',
                units: ['px', 'rem', 'em', '%', 'vw', 'auto'],
                defaultUnit: '%',
                default: '100%',
                responsive: true
            } as any,
            {
                type: 'unit-number',
                label: 'Button Width',
                name: 'buttonWidth',
                units: ['px', 'rem', 'em', '%', 'auto'],
                defaultUnit: 'auto',
                default: 'auto',
                responsive: true
            } as any,
            {
                type: 'heading',
                label: 'Typography',
                name: 'typography'
            } as any,
            {
                type: 'slider',
                label: 'Font Size',
                name: 'fontSize',
                min: 12,
                max: 32,
                unit: 'px',
                default: 16,
                responsive: true
            } as any,
            {
                type: 'color',
                label: 'Text Color',
                name: 'textColor',
                default: '#ffffff'
            } as any,
            {
                type: 'color',
                label: 'Text Hover Color',
                name: 'textHoverColor',
                default: '#ffffff'
            } as any,
            {
                type: 'color',
                label: 'Background Color',
                name: 'bgColor',
                default: '#2563eb'
            } as any,
            {
                type: 'color',
                label: 'Background Hover Color',
                name: 'hoverBgColor',
                default: '#1d4ed8'
            } as any,
            {
                type: 'heading',
                label: 'Button Styling',
                name: 'buttonStyling'
            } as any,
            {
                type: 'number',
                label: 'Padding Top',
                name: 'paddingTop',
                min: 0,
                max: 100,
                unit: 'px',
                default: 12,
                responsive: true
            } as any,
            {
                type: 'number',
                label: 'Padding Right',
                name: 'paddingRight',
                min: 0,
                max: 100,
                unit: 'px',
                default: 24,
                responsive: true
            } as any,
            {
                type: 'number',
                label: 'Padding Bottom',
                name: 'paddingBottom',
                min: 0,
                max: 100,
                unit: 'px',
                default: 12,
                responsive: true
            } as any,
            {
                type: 'number',
                label: 'Padding Left',
                name: 'paddingLeft',
                min: 0,
                max: 100,
                unit: 'px',
                default: 24,
                responsive: true
            } as any,
            {
                type: 'slider',
                label: 'Border Radius',
                name: 'borderRadius',
                min: 0,
                max: 50,
                unit: 'px',
                default: 0
            } as any,
            {
                type: 'align',
                label: 'Alignment',
                name: 'alignment',
                options: ['left', 'center', 'right'],
                default: 'center',
                responsive: true
            } as any,
            {
                type: 'heading',
                label: 'Icon Styling',
                name: 'iconStyling'
            } as any,
            {
                type: 'select',
                label: 'Icon Position',
                name: 'iconPosition',
                options: [
                    { label: 'Left', value: 'left' },
                    { label: 'Right', value: 'right' }
                ],
                default: 'left'
            } as any,
            {
                type: 'slider',
                label: 'Icon Size',
                name: 'iconSize',
                min: 8,
                max: 64,
                unit: 'px',
                default: 16
            } as any,
            {
                type: 'slider',
                label: 'Icon Padding',
                name: 'iconPadding',
                min: 0,
                max: 20,
                unit: 'px',
                default: 6
            } as any,
            {
                type: 'slider',
                label: 'Gap Between Icon & Text',
                name: 'iconGap',
                min: 0,
                max: 32,
                unit: 'px',
                default: 8
            } as any,
            {
                type: 'color',
                label: 'Icon Color',
                name: 'iconColor',
                default: '#ffffff'
            } as any,
            {
                type: 'color',
                label: 'Icon Hover Color',
                name: 'iconHoverColor',
                default: '#ffffff'
            } as any,
            {
                type: 'color',
                label: 'Icon Background Color',
                name: 'iconBackgroundColor',
                default: 'transparent'
            } as any,
            {
                type: 'color',
                label: 'Icon Hover Background Color',
                name: 'iconHoverBackgroundColor',
                default: 'transparent'
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
                label: 'Spacing',
                name: 'spacing'
            } as any,
            {
                type: 'dimensions',
                label: 'Margin',
                name: 'margin',
                unit: 'px',
                responsive: true
            } as any,
            {
                type: 'dimensions',
                label: 'Padding',
                name: 'padding',
                unit: 'px',
                responsive: true
            } as any
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
            } as any
        ]
    },
    defaultProps: {
        text: 'Click Me',
        link: '#',
        style: 'primary'
    },
    category: 'Basic'
});
