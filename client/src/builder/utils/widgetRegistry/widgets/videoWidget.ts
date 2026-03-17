/**
 * Video Widget Registration
 */

import { registerWidget } from '../registry';
import VideoWidget from '../../../widgets/VideoWidget';

registerWidget({
    widgetType: 'video',
    name: 'Video',
    icon: 'Video',
    renderer: VideoWidget,
    schema: {
        content: [
            {
                type: 'select',
                label: 'Video Type',
                name: 'videoType',
                options: [
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'Vimeo', value: 'vimeo' },
                    { label: 'HTML5 Video', value: 'html5' },
                    { label: 'Direct URL', value: 'url' },
                    { label: 'Upload', value: 'upload' },
                    { label: 'Iframe Code', value: 'iframe' }
                ],
                default: 'youtube'
            } as any,
            {
                type: 'text',
                label: 'Video URL / ID',
                name: 'videoUrl',
                placeholder: 'YouTube: dQw4w9WgXcQ or https://www.youtube.com/watch?v=... | Vimeo: 123456 or https://vimeo.com/... | HTML5/URL: https://example.com/video.mp4',
                default: ''
            } as any,
            {
                type: 'mediapicker',
                label: 'Upload Video',
                name: 'videoUpload',
                assetType: 'video',
                default: ''
            } as any,
            {
                type: 'textarea',
                label: 'Iframe Code',
                name: 'iframeCode',
                placeholder: '<iframe src="..." width="560" height="315"></iframe>',
                default: ''
            } as any,
            {
                type: 'text',
                label: 'Video ID (Fallback)',
                name: 'videoId',
                placeholder: 'Fallback video ID',
                default: 'dQw4w9WgXcQ'
            } as any,
            {
                type: 'toggle',
                label: 'Autoplay',
                name: 'autoplay',
                default: false
            } as any,
            {
                type: 'toggle',
                label: 'Show Controls',
                name: 'showControls',
                default: true
            } as any,
            {
                type: 'toggle',
                label: 'Loop',
                name: 'loop',
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
                units: ['px', '%', 'em', 'rem', 'vw'],
                defaultUnit: '%',
                default: '100%',
                responsive: true
            } as any,
            {
                type: 'select',
                label: 'Aspect Ratio',
                name: 'aspectRatio',
                options: [
                    { label: '16:9', value: '16:9' },
                    { label: '4:3', value: '4:3' },
                    { label: '1:1', value: '1:1' },
                    { label: '21:9', value: '21:9' },
                ],
                default: '16:9'
            } as any,
            {
                type: 'heading',
                label: 'Styling',
                name: 'styling'
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
                type: 'number',
                label: 'Border Width',
                name: 'borderWidth',
                min: 0,
                max: 20,
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
                label: 'Box Shadow',
                name: 'boxShadow',
                default: 'none'
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
                label: 'Spacing',
                name: 'spacing'
            } as any,
            {
                type: 'number',
                label: 'Padding Top',
                name: 'paddingTop',
                min: 0,
                max: 100,
                unit: 'px',
                default: 0,
                responsive: true
            } as any,
            {
                type: 'number',
                label: 'Padding Right',
                name: 'paddingRight',
                min: 0,
                max: 100,
                unit: 'px',
                default: 0,
                responsive: true
            } as any,
            {
                type: 'number',
                label: 'Padding Bottom',
                name: 'paddingBottom',
                min: 0,
                max: 100,
                unit: 'px',
                default: 0,
                responsive: true
            } as any,
            {
                type: 'number',
                label: 'Padding Left',
                name: 'paddingLeft',
                min: 0,
                max: 100,
                unit: 'px',
                default: 0,
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
        videoUrl: '',
        videoId: 'dQw4w9WgXcQ',
        videoType: 'youtube',
        autoplay: false,
        showControls: true,
        loop: false
    },
    category: 'Content'
});
