/**
 * Convert structured style object to inline CSS
 * Safe conversion without eval or injection vulnerabilities
 */

import { sanitizeStyleValue } from './helpers';
import { buildPaddingStyle, buildMarginStyle, buildBorderStyle, buildShadowStyle } from './styleBuilders';

/**
 * Main conversion function: Convert structured style object to inline CSS
 * Returns camelCase keys for React inline styles
 */
export const styleToCss=(style: Record<string, any>): Record<string, string|number> => {
    const cssStyle: Record<string, string|number>={};

    // Color property mappings for normal CSS properties (not hover states)
    const colorPropertyMap: Record<string, string>={
        'color': 'color',
        'textColor': 'color',
        'bgColor': 'backgroundColor',
        'backgroundColor': 'backgroundColor'
    };

    // Hover color mappings - pass through without mapping to CSS
    const hoverColorMap: Record<string, string>={
        'hoverColor': 'hoverColor',
        'textHoverColor': 'hoverColor',
        'hoverBgColor': 'hoverBgColor'
    };

    const mappedKeys: Set<string>=new Set();

    for (const [key, value] of Object.entries(style)) {
        if (value===undefined||value===null||value==='') continue;

        // Handle hover color mappings
        if (hoverColorMap[key]) {
            cssStyle[hoverColorMap[key]]=sanitizeStyleValue(value);
            continue;
        }

        // Handle color mappings
        if (colorPropertyMap[key]) {
            const mappedKey=colorPropertyMap[key];
            if (!mappedKeys.has(mappedKey)) {
                cssStyle[mappedKey]=sanitizeStyleValue(value);
                mappedKeys.add(mappedKey);
            }
            continue;
        }

        // Handle complex style objects
        if (key==='border'&&typeof value==='object') {
            const borderStyle=buildBorderStyle(value);
            Object.assign(cssStyle, borderStyle);
            continue;
        }

        if (key==='shadow'&&typeof value==='object') {
            const shadowStyle=buildShadowStyle(value);
            Object.assign(cssStyle, shadowStyle);
            continue;
        }

        if (key==='boxShadow'&&typeof value==='object') {
            const shadowStyle=buildShadowStyle(value);
            Object.assign(cssStyle, shadowStyle);
            continue;
        }

        if (key==='padding'&&typeof value==='object') {
            const paddingStyle=buildPaddingStyle(value);
            Object.assign(cssStyle, paddingStyle);
            continue;
        }

        if (key==='margin'&&typeof value==='object') {
            const marginStyle=buildMarginStyle(value);
            Object.assign(cssStyle, marginStyle);
            continue;
        }

        // Handle backgroundImage specially - convert relative API URLs to absolute
        if (key==='backgroundImage'&&typeof value==='string') {
            let url=value;

            // If it's a relative API URL, convert to absolute URL for proper loading
            if (url.startsWith('/api/')) {
                // In dev environment, API might be on a different port
                // Use the API server origin (usually localhost:5000)
                const apiOrigin=window.location.hostname==='localhost'
                    ? `http://${window.location.hostname}:5000`
                    :window.location.origin;
                url=`${apiOrigin}${value}`;
            }

            // Check if already wrapped in url()
            if (!url.startsWith('url(')) {
                cssStyle[key]=`url('${url}')`;
            } else {
                cssStyle[key]=url;
            }
            continue;
        }

        // Convert numbers to pixels for size-related properties
        let finalValue=sanitizeStyleValue(value);
        if (typeof finalValue==='number'&&
            ['fontSize', 'padding', 'margin', 'width', 'height', 'minHeight', 'maxHeight', 'minWidth', 'maxWidth',
                'top', 'bottom', 'left', 'right', 'borderRadius', 'borderWidth', 'letterSpacing', 'lineHeight', 'gap'].includes(key)) {
            finalValue=`${finalValue}px`;
        }

        cssStyle[key]=finalValue;
    }

    return cssStyle;
};
