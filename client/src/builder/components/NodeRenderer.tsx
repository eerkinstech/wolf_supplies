/**
 * NodeRenderer - Main node renderer that coordinates section, column, and widget rendering
 */

import React from 'react';
import { Node } from '../controls/types/index';
import { styleMerge, advancedMerge, styleToCss } from '../utils/styleMerge';
import { SectionRenderer } from './SectionRenderer';
import { ColumnRenderer } from './ColumnRenderer';
import { WidgetRenderer } from './WidgetRenderer';
import { stripBorderAndShadow } from './nodeUtils';

interface NodeRendererProps {
    node: Node;
    device?: 'desktop'|'tablet'|'mobile';
    isSelected?: boolean;
    onSelect?: (nodeId: string) => void;
}

export const NodeRenderer: React.FC<NodeRendererProps>=({
    node,
    device='desktop',
    isSelected=false,
    onSelect
}) => {
    // Merge styles for current device
    const mergedStyle=styleMerge(node, device);
    const mergedAdvanced=advancedMerge(node, device);

    // Convert to CSS
    const cssStyle=styleToCss(mergedStyle);

    // Determine if element is hidden on current device
    const hiddenCheckNames={
        'desktop': 'hideDesktop',
        'tablet': 'hideTablet',
        'mobile': 'hideMobile'
    };
    const deviceHideCheck=hiddenCheckNames[device as 'desktop'|'tablet'|'mobile'];
    const isHiddenOnDevice=mergedAdvanced[deviceHideCheck]===true||mergedAdvanced.hidden===true;

    // Build className
    const className=[
        mergedAdvanced.customClass,
        isSelected? 'node-selected':'',
        isHiddenOnDevice? 'hidden':''
    ]
        .filter(Boolean)
        .join(' ');

    // Apply hidden opacity in builder
    let nodeStyle=cssStyle;
    if (isHiddenOnDevice) {
        nodeStyle={ ...nodeStyle, opacity: 0.5, pointerEvents: 'auto' as const };
    }

    const handleClick=(e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect?.(node.id);
    };

    // Render based on node kind
    switch (node.kind) {
        case 'section':
            return (
                <SectionRenderer
                    node={node}
                    device={device}
                    isSelected={isSelected}
                    onSelect={onSelect}
                    cssStyle={nodeStyle}
                    _className={className}
                    onClick={handleClick}
                />
            );

        case 'column':
            return (
                <ColumnRenderer
                    node={node}
                    device={device}
                    isSelected={isSelected}
                    onSelect={onSelect}
                    cssStyle={nodeStyle}
                    _className={className}
                    onClick={handleClick}
                />
            );

        case 'widget':
            // For image widgets, keep border and shadow properties
            // For other widgets, strip them (they're for containers, not widgets)
            const widgetCssStyle=node.widgetType==='image'
                ? nodeStyle
                : stripBorderAndShadow(nodeStyle);
            
            return (
                <WidgetRenderer
                    node={node}
                    device={device}
                    isSelected={isSelected}
                    onSelect={onSelect}
                    cssStyle={widgetCssStyle}
                    className={className}
                    onClick={handleClick}
                />
            );

        case 'root':
            return (
                <div key={node.id} data-node-id={node.id} data-node-type="root">
                    {node.children && node.children.length > 0
                        ? node.children.map((child: Node) => (
                            <NodeRenderer
                                key={child.id}
                                node={child}
                                device={device}
                                onSelect={onSelect}
                                isSelected={false}
                            />
                        ))
                        : null}
                </div>
            );

        default:
            return null;
    }
};

export default NodeRenderer;