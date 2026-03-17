/**
 * ColumnRenderer - Renders column nodes with drag-and-drop support
 */

import React, { useContext, useState } from 'react';
import { Node } from '../controls/types/index';
import { advancedMerge } from '../utils/styleMerge';
import ElementorBuilderContext from '../../context/ElementorBuilderContext';
import { NodeRenderer } from './NodeRenderer';
import { createWidgetNode } from '../utils/nodeFactory';

interface ColumnNodeProps {
    node: Node;
    device?: 'desktop'|'tablet'|'mobile';
    isSelected?: boolean;
    onSelect?: (nodeId: string) => void;
    cssStyle: Record<string, any>;
    _className?: string;
    onClick: (e: React.MouseEvent) => void;
}

// Default widget props
const WIDGET_DEFAULTS: Record<string, Record<string, any>>={
    heading: { content: 'Heading', level: 'h2' },
    text: { content: 'Enter your text here' },
    button: { content: 'Click Me', link: '#' },
    image: { src: '', alt: 'Image' },
    video: { src: '', autoplay: false },
    divider: { type: 'solid' },
    spacer: { height: '20px' },
    iconList: { items: [] }
};

export const ColumnRenderer: React.FC<ColumnNodeProps>=({ node, device, isSelected, onSelect, cssStyle, _className, onClick }) => {
    const [isDragOver, setIsDragOver]=useState(false);
    const context=useContext(ElementorBuilderContext) as any;
    const mergedAdvanced=advancedMerge(node, device);

    // Get column layout properties
    const display=mergedAdvanced?.display||'flex';
    const direction=mergedAdvanced?.direction||mergedAdvanced?.flexDirection||'column';
    const width=mergedAdvanced?.width||cssStyle?.width;
    const gap=node.style?.gap??node.props?.gap??'0px';
    const verticalAlign=node.props?.verticalAlign||'flex-start';
    const horizontalAlign=node.props?.horizontalAlign||'flex-start';

    // Get box shadow if set
    const getBoxShadow=() => {
        return cssStyle?.boxShadow??undefined;
    };

    const handleDragOver=(e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect='copy';
        setIsDragOver(true);
    };

    const handleDragLeave=(e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop=(e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const widgetType=e.dataTransfer.getData('widgetType');
        if (widgetType&&context?.insertNewNode) {
            const widgetNode=createWidgetNode(widgetType, WIDGET_DEFAULTS[widgetType]||{});
            context.insertNewNode(node.id, widgetNode);
        }
    };

    // Build column style
    const columnStyle={
        display: display,
        flexDirection: direction,
        alignItems: verticalAlign,
        justifyContent: horizontalAlign,
        position: 'relative' as const,
        ...(width&&{ width: width }),
        minWidth: '0px',
        gap: gap,
        transition: 'all 0.2s ease',
        boxSizing: 'border-box' as const,
        ...(cssStyle?.padding&&{ padding: cssStyle.padding }),
        ...(cssStyle?.paddingTop&&{ paddingTop: cssStyle.paddingTop }),
        ...(cssStyle?.paddingRight&&{ paddingRight: cssStyle.paddingRight }),
        ...(cssStyle?.paddingBottom&&{ paddingBottom: cssStyle.paddingBottom }),
        ...(cssStyle?.paddingLeft&&{ paddingLeft: cssStyle.paddingLeft }),
        ...(cssStyle?.backgroundColor&&{ backgroundColor: isDragOver? '#eff6ff':cssStyle.backgroundColor }),
        ...(!cssStyle?.backgroundColor&&isDragOver&&{ backgroundColor: '#eff6ff' }),
        // Prevent parent section's background from showing through
        ...(!cssStyle?.backgroundColor&&!isDragOver&&!cssStyle?.backgroundImage&&{ backgroundColor: 'transparent' }),
        ...(cssStyle?.borderRadius&&{ borderRadius: cssStyle.borderRadius }),
        ...(cssStyle?.height&&{ height: cssStyle.height }),
        ...(cssStyle?.minHeight&&{ minHeight: cssStyle.minHeight }),
        ...(cssStyle?.borderWidth&&{ borderWidth: cssStyle.borderWidth, borderStyle: cssStyle.borderStyle||'solid', borderColor: cssStyle.borderColor||'#000000' }),
        ...(getBoxShadow()&&{ boxShadow: getBoxShadow() }),
        ...(cssStyle?.margin&&{ margin: cssStyle.margin }),
        ...(cssStyle?.marginTop&&{ marginTop: cssStyle.marginTop }),
        ...(cssStyle?.marginRight&&{ marginRight: cssStyle.marginRight }),
        ...(cssStyle?.marginBottom&&{ marginBottom: cssStyle.marginBottom }),
        ...(cssStyle?.marginLeft&&{ marginLeft: cssStyle.marginLeft }),
    };

    return (
        <div
            style={columnStyle as any}
            className={`column-node cursor-pointer hover:border-blue-400 ${isSelected? 'ring-2 ring-blue-500 shadow-lg':'shadow-sm'}`}
            onClick={onClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {node.children?.map((child: Node) => (
                <NodeRenderer
                    key={child.id}
                    node={child}
                    device={device}
                    onSelect={onSelect}
                    isSelected={false}
                />
            ))}

            {(!node.children||node.children.length===0)&&(
                <div className="flex items-center justify-center h-20 w-full text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded">
                    + Add Widget
                </div>
            )}
        </div>
    );
};
