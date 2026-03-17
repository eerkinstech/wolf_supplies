/**
 * WidgetRenderer - Renders widget nodes with proper styling
 */

import React from 'react';
import { Node } from '../controls/types/index';
import { getWidgetRenderer } from '../utils/widgetRegistry';

interface WidgetNodeProps {
    node: Node;
    device?: 'desktop'|'tablet'|'mobile';
    isSelected?: boolean;
    onSelect?: (nodeId: string) => void;
    cssStyle: Record<string, any>;
    className: string;
    onClick: (e: React.MouseEvent) => void;
}

export const WidgetRenderer: React.FC<WidgetNodeProps>=({ node, device, isSelected, onSelect, cssStyle, className, onClick }) => {
    if (!node.widgetType) {
        return (
            <div className="text-gray-900 p-2 border border-gray-300 rounded text-xs">
                Node type: {node.kind}
            </div>
        );
    }

    const WidgetComponent=getWidgetRenderer(node.widgetType);

    if (!WidgetComponent) {
        return (
            <div
                className="bg-gray-50 border-2 border-dashed border-gray-300 p-4 rounded text-center text-sm text-gray-600 cursor-pointer hover:bg-gray-100 transition"
                onClick={onClick}
            >
                <p className="font-medium">[{node.widgetType}]</p>
                <p className="text-xs mt-1">Widget not registered</p>
                <p className="text-xs text-gray-400 mt-2">
                    Content: {JSON.stringify(node.props)?.substring(0, 50)}...
                </p>
            </div>
        );
    }

    // Clean widget styles - exclude container properties but keep widget-specific styling
    // Image/Video widgets: exclude border, shadow, radius, opacity (applied directly to tag)
    // Other widgets: keep everything
    const shouldKeepBorders=node.widgetType!=='image'&&node.widgetType!=='video';

    const { backgroundColor, ...baseClean }=cssStyle;

    const cleanCssStyle=shouldKeepBorders
        ? baseClean  // Keep all properties for non-image/video widgets
        :(() => {
            // For image/video widgets, exclude styling that goes on the tag
            const { borderWidth, borderStyle, borderColor, borderRadius, boxShadow, shadow, opacity, padding, ...rest }=baseClean;
            return rest;
        })();

    const widgetStyle: Record<string, any>={
        width: '100%',
        position: 'relative',
        ...cleanCssStyle
    };

    return (
        <div
            style={widgetStyle as React.CSSProperties}
            className={`widget-node cursor-pointer transition ${isSelected? 'ring-2 ring-blue-500 bg-blue-50 ring-inset':'hover:ring-1 hover:ring-blue-300'} ${className}`}
            onClick={onClick}
        >
            <WidgetComponent
                node={node}
                device={device}
                isEditing={isSelected}
                onEdit={() => onSelect?.(node.id)}
                cssStyle={cssStyle}
            />
        </div>
    );
};
