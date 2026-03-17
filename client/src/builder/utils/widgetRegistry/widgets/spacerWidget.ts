/**
 * Spacer Widget Registration
 */

import { registerWidget } from '../registry';
import SpacerWidget from '../../../widgets/SpacerWidget';

registerWidget({
    widgetType: 'spacer',
    name: 'Spacer',
    icon: 'Spacer',
    renderer: SpacerWidget,
    schema: {
        content: [
            {
                type: 'number',
                label: 'Height (px)',
                name: 'height',
                default: 20,
                min: 0,
                max: 500,
                unit: 'px'
            } as any
        ],
        style: [
            {
                type: 'slider',
                label: 'Height',
                name: 'height',
                min: 0,
                max: 500,
                unit: 'px',
                default: 20
            } as any,
            {
                type: 'color',
                label: 'Background Color',
                name: 'backgroundColor',
                default: 'transparent'
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
        height: 20
    },
    category: 'Basic'
});
