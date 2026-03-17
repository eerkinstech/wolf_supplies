/**
 * Heading Widget Registration
 */

import { registerWidget } from '../registry';
import HeadingWidget from '../../../widgets/HeadingWidget';

registerWidget({
    widgetType: 'heading',
    name: 'Heading',
    icon: 'H',
    renderer: HeadingWidget,
    schema: {
        content: [
            {
                type: 'text',
                label: 'Content',
                name: 'content',
                default: 'Heading'
            } as any,
            {
                type: 'text',
                label: 'Link',
                name: 'link',
                placeholder: '/page or https://example.com',
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
                label: 'Heading Level',
                name: 'level',
                options: [
                    { label: 'H1', value: 'h1' },
                    { label: 'H2', value: 'h2' },
                    { label: 'H3', value: 'h3' },
                    { label: 'H4', value: 'h4' },
                    { label: 'H5', value: 'h5' },
                    { label: 'H6', value: 'h6' }
                ],
                default: 'h2'
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
                label: 'Width',
                name: 'width',
                units: ['px', 'rem', 'em', '%', 'vw', 'auto'],
                defaultUnit: '%',
                default: '100%',
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
                max: 72,
                unit: 'px',
                responsive: true
            } as any,
            {
                type: 'color',
                label: 'Color',
                name: 'color',
                default: '#000000'
            } as any,
            {
                type: 'color',
                label: 'Hover Color',
                name: 'hoverColor',
                default: '#0066cc'
            } as any,
            {
                type: 'select',
                label: 'Font Weight',
                name: 'fontWeight',
                options: [
                    { label: 'Light', value: '300' },
                    { label: 'Normal', value: '400' },
                    { label: 'Medium', value: '500' },
                    { label: 'Bold', value: '700' },
                    { label: 'Extra Bold', value: '900' }
                ],
                default: '700'
            } as any,
            {
                type: 'select',
                label: 'Text Align',
                name: 'textAlign',
                options: [
                    { label: 'Left', value: 'left' },
                    { label: 'Center', value: 'center' },
                    { label: 'Right', value: 'right' },
                    { label: 'Justify', value: 'justify' }
                ],
                default: 'left',
                responsive: true
            } as any,
            {
                type: 'slider',
                label: 'Line Height',
                name: 'lineHeight',
                min: 1,
                max: 3,
                step: 0.1,
                default: 1.2,
                responsive: true
            } as any,
            {
                type: 'slider',
                label: 'Letter Spacing',
                name: 'letterSpacing',
                min: -2,
                max: 5,
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
        content: 'Heading',
        level: 'h2'
    },
    category: 'Basic'
});
