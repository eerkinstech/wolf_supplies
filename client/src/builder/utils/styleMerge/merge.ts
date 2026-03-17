/**
 * Style Merge - Combine base styles with responsive overrides
 * Handles desktop/tablet/mobile device-specific style merging
 */

import { Node } from '../../controls/types/index';

export type Device='desktop'|'tablet'|'mobile';

/**
 * Get merged style for a node on a specific device
 * Returns base style merged with device-specific overrides
 */
export const styleMerge=(node: Node, device: Device='desktop'): Record<string, any> => {
    const baseStyle=node.style||{};

    if (device==='desktop') {
        return { ...baseStyle };
    }

    const deviceOverrides=node.responsive?.[device]?.style||{};
    return { ...baseStyle, ...deviceOverrides };
};

/**
 * Get merged advanced settings for a node on a specific device
 */
export const advancedMerge=(node: Node, device: Device='desktop'): Record<string, any> => {
    const baseAdvanced=node.advanced||{};

    if (device==='desktop') {
        return { ...baseAdvanced };
    }

    const deviceOverrides=node.responsive?.[device]?.advanced||{};
    const merged={ ...baseAdvanced, ...deviceOverrides };
    return merged;
};

/**
 * Get all merged values (style + advanced + props) for a device
 */
export const nodeMerge=(
    node: Node,
    device: Device='desktop'
): { props: Record<string, any>; style: Record<string, any>; advanced: Record<string, any> } => {
    return {
        props: node.props||{},
        style: styleMerge(node, device),
        advanced: advancedMerge(node, device),
    };
};
