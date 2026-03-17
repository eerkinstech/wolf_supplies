/**
 * Text Widget Registration
 */

import { registerWidget } from '../registry';
import TextWidget from '../../../widgets/TextWidget';

registerWidget({
    widgetType: 'text',
    name: 'Text',
    icon: 'Text',
    renderer: TextWidget,
    schema: {
        content: [
            {
                type: 'textarea',
                label: 'Content',
                name: 'content',
                default: 'Lorem ipsum dolor sit amet',
                richText: true
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
                min: 10,
                max: 48,
                unit: 'px',
                default: 16,
                responsive: true
            } as any,
            {
                type: 'color',
                label: 'Color',
                name: 'color',
                default: '#333333'
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
                    { label: 'Bold', value: '700' }
                ],
                default: '400'
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
                default: 1.6,
                responsive: true
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
        content: 'Lorem ipsum dolor sit amet'
    },
    category: 'Basic'
});
