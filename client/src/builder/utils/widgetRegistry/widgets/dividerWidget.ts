import { registerWidget } from '../registry';
import DividerWidget from '../../../widgets/DividerWidget';

registerWidget({
    widgetType: 'divider',
    name: 'Divider',
    icon: '─',
    renderer: DividerWidget,
    schema: {
        content: [],

        style: [
            {
                type: 'select',
                label: 'Divider Type',
                name: 'dividerType',
                options: [
                    { label: 'Simple Line', value: 'simple' },
                    { label: 'Dotted', value: 'dotted' },
                    { label: 'Text', value: 'text' },
                ],
                default: 'simple'
            } as any,

            // ===== SIMPLE & TEXT DIVIDER OPTIONS =====
            {
                type: 'heading',
                label: '━━━ Line Style',
                name: 'lineStyleSection',
                condition: { dividerType: ['simple', 'text'] }
            } as any,
            {
                type: 'select',
                label: 'Line Style',
                name: 'lineStyle',
                options: [
                    { label: 'Solid', value: 'solid' },
                    { label: 'Dashed', value: 'dashed' },
                    { label: 'Dotted', value: 'dotted' },
                    { label: 'Double', value: 'double' },
                ],
                default: 'solid',
                condition: { dividerType: ['simple', 'text'] }
            } as any,
            {
                type: 'color',
                label: 'Color',
                name: 'color',
                default: '#cccccc'
            } as any,
            {
                type: 'slider',
                label: 'Thickness',
                name: 'thickness',
                min: 1,
                max: 10,
                unit: 'px',
                default: 2,
                responsive: true
            } as any,

            // ===== TEXT DIVIDER SPECIFIC =====
            {
                type: 'heading',
                label: '✏️ Text Options',
                name: 'textSection',
                condition: { dividerType: 'text' }
            } as any,
            {
                type: 'text',
                label: 'Text',
                name: 'text',
                placeholder: 'Enter divider text',
                default: '',
                condition: { dividerType: 'text' }
            } as any,
            {
                type: 'color',
                label: 'Text Color',
                name: 'textColor',
                default: '#666666',
                condition: { dividerType: 'text' }
            } as any,
            {
                type: 'slider',
                label: 'Text Size',
                name: 'textSize',
                min: 8,
                max: 48,
                unit: 'px',
                default: 14,
                responsive: true,
                condition: { dividerType: 'text' }
            } as any,
            {
                type: 'select',
                label: 'Text Weight',
                name: 'textWeight',
                options: [
                    { label: 'Normal', value: 'normal' },
                    { label: 'Semi Bold', value: 'semi-bold' },
                    { label: 'Bold', value: 'bold' },
                ],
                default: 'normal',
                condition: { dividerType: 'text' }
            } as any,
            {
                type: 'slider',
                label: 'Text Gap',
                name: 'textGap',
                min: 0,
                max: 50,
                unit: 'px',
                default: 16,
                responsive: true,
                condition: { dividerType: 'text' }
            } as any,

            // ===== DOTTED DIVIDER SPECIFIC =====
            {
                type: 'heading',
                label: '●●● Dot Options',
                name: 'dotSection',
                condition: { dividerType: 'dotted' }
            } as any,
            {
                type: 'slider',
                label: 'Dot Size',
                name: 'dotSize',
                min: 2,
                max: 20,
                unit: 'px',
                default: 6,
                responsive: true,
                condition: { dividerType: 'dotted' }
            } as any,
            {
                type: 'slider',
                label: 'Dot Spacing',
                name: 'dotSpacing',
                min: 2,
                max: 30,
                unit: 'px',
                default: 8,
                responsive: true,
                condition: { dividerType: 'dotted' }
            } as any,

            {
                type: 'heading',
                label: '↔️ Width & Alignment',
                name: 'widthAlignment'
            } as any,
            {
                type: 'unit-number',
                label: 'Width',
                name: 'width',
                units: ['px', '%', 'em', 'rem'],
                defaultUnit: '%',
                default: '100%'
            } as any,
            {
                type: 'align',
                label: 'Alignment',
                name: 'alignment',
                options: ['left', 'center', 'right'],
                default: 'center'
            } as any,

            {
                type: 'heading',
                label: '⬍ Spacing',
                name: 'spacing'
            } as any,
            {
                type: 'slider',
                label: 'Vertical Gap (Above/Below)',
                name: 'gap',
                min: 0,
                max: 100,
                unit: 'px',
                default: 0,
                responsive: true
            } as any,
            {
                type: 'slider',
                label: 'Horizontal Padding (Left)',
                name: 'paddingLeft',
                min: 0,
                max: 100,
                unit: 'px',
                default: 0,
                responsive: true
            } as any,
            {
                type: 'slider',
                label: 'Horizontal Padding (Right)',
                name: 'paddingRight',
                min: 0,
                max: 100,
                unit: 'px',
                default: 0,
                responsive: true
            } as any,
            {
                type: 'slider',
                label: 'Top Padding',
                name: 'paddingTop',
                min: 0,
                max: 100,
                unit: 'px',
                default: 0,
                responsive: true
            } as any,
            {
                type: 'slider',
                label: 'Bottom Padding',
                name: 'paddingBottom',
                min: 0,
                max: 100,
                unit: 'px',
                default: 0,
                responsive: true
            } as any,
        ],

        advanced: [
            {
                type: 'text',
                label: 'CSS Classes',
                name: 'customClass',
                placeholder: 'e.g. my-custom-class',
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
                multiple: true,
                default: []
            } as any,
        ]
    },
    defaultProps: {
        dividerType: 'simple',
        lineStyle: 'solid',
        thickness: 2,
        color: '#cccccc',
        width: '100%',
        alignment: 'center',
        gap: 0,
        text: '',
        textColor: '#666666',
        textSize: 14,
        textWeight: 'normal',
        textGap: 16,
        dotSize: 6,
        dotSpacing: 8
    },
    category: 'Basic'
});
