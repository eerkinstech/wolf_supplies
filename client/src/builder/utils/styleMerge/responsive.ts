/**
 * Responsive Design Utilities
 */

import { Node } from '../../controls/types/index';
import { advancedMerge } from './merge';
import type { Device } from './merge';

/**
 * Get viewport breakpoints
 */
export const breakpoints={
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
};

/**
 * Generate media query for device
 */
export const getMediaQuery=(device: Device): string => {
    switch (device) {
        case 'mobile':
            return `@media (max-width: 767px)`;
        case 'tablet':
            return `@media (min-width: 768px) and (max-width: 1023px)`;
        case 'desktop':
            return `@media (min-width: 1024px)`;
        default:
            return '';
    }
};

/**
 * Check if node should be hidden on device
 */
export const isHiddenOnDevice=(node: Node, device: Device): boolean => {
    const advanced=advancedMerge(node, device);
    const hideOn=advanced.hideOn||[];
    return hideOn.includes(device);
};
