/**
 * Node Renderer Utilities
 * Shared utility functions for node rendering
 */

/**
 * Strip layout and container properties from style object
 * Used to prevent layout properties (display, flex, grid, etc.) from cascading to widgets
 * Removes: border, outline, display, flexbox properties, grid properties, position
 * Keeps: shadow (boxShadow, textShadow) - these are widget styling
 */
export const stripBorderAndShadow=(style: Record<string, any>): Record<string, any> => {
    const cleaned: Record<string, any>={};
    const excludePatterns=['border', 'outline', 'Box'];  // Removed 'shadow' - widgets should have shadow
    const excludeProperties=new Set([
        'display', 'flexDirection', 'justifyContent', 'alignItems', 'alignContent',
        'flexWrap', 'flex', 'flexGrow', 'flexShrink', 'flexBasis', 'gap',
        'gridTemplateColumns', 'gridTemplateRows', 'gridAutoColumns', 'gridAutoRows',
        'gridTemplate', 'grid', 'gridGap', 'gridAutoFlow', 'gridColumn', 'gridRow',
        'position', 'top', 'right', 'bottom', 'left', 'zIndex'
    ]);

    for (const [key, value] of Object.entries(style||{})) {
        // Skip if exact match in exclude set
        if (excludeProperties.has(key)) {
            continue;
        }

        // Skip if matches pattern (border, outline, Box - but NOT shadow)
        let shouldSkip=false;
        for (const pattern of excludePatterns) {
            if (key.includes(pattern)) {
                shouldSkip=true;
                break;
            }
        }
        if (!shouldSkip) {
            cleaned[key]=value;
        }
    }
    return cleaned;
};
