/**
 * Image Widget Registration
 */

import { registerWidget } from '../registry';
import ImageWidget from '../../../widgets/ImageWidget';

registerWidget({
    widgetType: 'image',
    name: 'Image',
    icon: 'Image',
    renderer: ImageWidget,
    schema: {
        content: [
            {
                type: 'mediapicker',
                label: 'Image (Upload or URL)',
                name: 'src',
                default: 'https://via.placeholder.com/400x300?text=Image'
            } as any,
            {
                type: 'text',
                label: 'Alt Text',
                name: 'alt',
                default: 'Image'
            } as any,
            {
                type: 'text',
                label: 'Caption',
                name: 'caption',
                placeholder: 'Optional image caption'
            } as any,
            {
                type: 'link',
                label: 'Link',
                name: 'link',
                placeholder: 'e.g., /page or https://example.com'
            } as any,
            {
                type: 'toggle',
                label: 'Open Link in New Tab',
                name: 'openNewTab',
                default: false
            } as any,
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
                units: ['px', '%', 'em', 'rem', 'auto'],
                defaultUnit: '%',
                default: '100%',
                responsive: true
            } as any,
            {
                type: 'unit-number',
                label: 'Height',
                name: 'height',
                units: ['px', 'em', 'rem', 'auto'],
                defaultUnit: 'auto',
                default: 'auto',
                responsive: true
            } as any,
            {
                type: 'heading',
                label: 'Border & Shadow',
                name: 'borderShadow'
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
                type: 'slider',
                label: 'Border Width',
                name: 'borderWidth',
                min: 0,
                max: 10,
                unit: 'px',
                default: 0
            } as any,
            {
                type: 'color',
                label: 'Border Color',
                name: 'borderColor',
                default: '#000000'
            } as any,
            {
                type: 'shadow',
                label: 'Shadow',
                name: 'boxShadow'
            } as any,
            {
                type: 'heading',
                label: 'Effects',
                name: 'effects'
            } as any,
            {
                type: 'slider',
                label: 'Opacity',
                name: 'opacity',
                min: 0,
                max: 1,
                step: 0.1,
                default: 1
            } as any,
            {
                type: 'heading',
                label: 'Image Fit',
                name: 'imageFit'
            } as any,
            {
                type: 'select',
                label: 'Object Fit',
                name: 'objectFit',
                options: [
                    { label: 'Cover', value: 'cover' },
                    { label: 'Contain', value: 'contain' },
                    { label: 'Fill', value: 'fill' },
                    { label: 'Scale Down', value: 'scale-down' }
                ],
                default: 'cover'
            } as any,
            {
                type: 'select',
                label: 'Object Position',
                name: 'objectPosition',
                options: [
                    { label: 'Center', value: 'center' },
                    { label: 'Top', value: 'top' },
                    { label: 'Bottom', value: 'bottom' },
                    { label: 'Left', value: 'left' },
                    { label: 'Right', value: 'right' },
                    { label: 'Top Left', value: 'top left' },
                    { label: 'Top Right', value: 'top right' },
                    { label: 'Bottom Left', value: 'bottom left' },
                    { label: 'Bottom Right', value: 'bottom right' }
                ],
                default: 'center'
            } as any,
            {
                type: 'heading',
                label: 'Caption',
                name: 'caption'
            } as any,
            {
                type: 'slider',
                label: 'Caption Font Size',
                name: 'captionFontSize',
                min: 10,
                max: 36,
                unit: 'px',
                default: 14
            } as any,
            {
                type: 'color',
                label: 'Caption Color',
                name: 'captionColor',
                default: '#666666'
            } as any,
            {
                type: 'slider',
                label: 'Caption Gap',
                name: 'captionGap',
                min: 0,
                max: 30,
                unit: 'px',
                default: 8
            } as any,
            {
                type: 'heading',
                label: 'Alignment',
                name: 'alignment'
            } as any,
            {
                type: 'align',
                label: 'Image Alignment',
                name: 'alignment',
                options: ['left', 'center', 'right'],
                default: 'center',
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
        src: 'https://via.placeholder.com/400x300?text=Image',
        alt: 'Image',
        caption: ''
    },
    category: 'Content'
});
