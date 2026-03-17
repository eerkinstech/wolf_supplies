/**
 * Style Merge Utilities - Re-exports from modular structure
 * For backward compatibility - imports from ./styleMerge folder
 */

// Re-export everything from the modular structure
export { styleMerge, advancedMerge, nodeMerge, type Device } from './styleMerge/merge';
export { styleToCss } from './styleMerge/cssConversion';
export { 
    buildPaddingStyle, 
    buildMarginStyle, 
    buildBorderStyle, 
    buildShadowStyle,
    buildTypographyStyle,
    buildBackgroundStyle,
    buildFlexStyle,
    buildPositionStyle
} from './styleMerge/styleBuilders';
export { 
    breakpoints, 
    getMediaQuery, 
    isHiddenOnDevice 
} from './styleMerge/responsive';
export { 
    deepMerge, 
    compactObject, 
    sanitizeStyleValue 
} from './styleMerge/helpers';