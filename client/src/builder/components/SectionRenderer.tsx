/**
 * SectionRenderer - Renders section nodes with proper styling and layout
 */

import React from 'react';
import { Node } from '../controls/types/index';
import { styleMerge, advancedMerge } from '../utils/styleMerge';
import { NodeRenderer } from './NodeRenderer';

interface SectionNodeProps {
    node: Node;
    device?: 'desktop'|'tablet'|'mobile';
    isSelected?: boolean;
    onSelect?: (nodeId: string) => void;
    cssStyle: Record<string, any>;
    _className?: string;
    onClick: (e: React.MouseEvent) => void;
}

export const SectionRenderer: React.FC<SectionNodeProps>=({ node, device, isSelected, onSelect, cssStyle, _className, onClick }) => {
    const mergedAdvanced=advancedMerge(node, device);
    const mergedStyle=styleMerge(node, device);

    // Get responsive numColumns
    let _responseNumColumns=node.props?.numColumns||2;
    if (node.responsive&&device&&node.responsive[device]) {
        const deviceResponsive=node.responsive[device] as any;
        if (deviceResponsive?.props?.numColumns) {
            _responseNumColumns=deviceResponsive.props.numColumns;
        }
    }

    // Get direction from advanced settings
    const direction=mergedAdvanced?.direction||'column';

    // Gap from style tab with nullish coalescing
    const gap=mergedStyle?.gap??'0px';

    // Content width settings
    const contentWidthMode=node.props?.contentWidthMode||'full_width';
    const boxedMaxWidth=node.props?.boxedMaxWidth??1140;
    const horizontalPadding=node.props?.horizontalPadding??15;

    // Get box shadow if set
    const getBoxShadow=() => {
        if (cssStyle?.boxShadow) {
            return cssStyle.boxShadow;
        }
        return undefined;
    };

    // Build section style with content width control applied directly
    // Determine if we should use flex display
    const isFlexDisplay=cssStyle?.display==='flex'||direction||mergedAdvanced?.justifyContent||mergedAdvanced?.alignItems;

    const sectionStyle={
        width: '100%',
        display: isFlexDisplay? 'flex':(cssStyle?.display||'block'),
        transition: 'all 0.2s ease',
        boxSizing: 'border-box' as const,
        // Apply flex layout properties directly to section
        ...(isFlexDisplay&&{
            flexDirection: direction==='row'? 'row':'column',
            flexWrap: 'wrap',
            gap: gap,
            justifyContent: mergedAdvanced?.justifyContent||'flex-start',
            alignItems: mergedAdvanced?.alignItems||'stretch',
        }),
        // Apply all background styles
        ...(cssStyle?.backgroundColor&&{ backgroundColor: cssStyle.backgroundColor }),
        ...(cssStyle?.backgroundImage&&{ backgroundImage: cssStyle.backgroundImage }),
        ...(cssStyle?.backgroundPosition&&{ backgroundPosition: cssStyle.backgroundPosition }),
        ...(cssStyle?.backgroundSize&&{ backgroundSize: cssStyle.backgroundSize }),
        ...(cssStyle?.backgroundRepeat&&{ backgroundRepeat: cssStyle.backgroundRepeat }),
        ...(cssStyle?.backgroundAttachment&&{ backgroundAttachment: cssStyle.backgroundAttachment }),
        // Apply all border styles
        ...(cssStyle?.borderWidth&&{ borderWidth: cssStyle.borderWidth, borderStyle: cssStyle.borderStyle||'solid', borderColor: cssStyle.borderColor||'#000000' }),
        ...(cssStyle?.borderRadius&&{ borderRadius: cssStyle.borderRadius }),
        ...(cssStyle?.borderTop&&{ borderTop: cssStyle.borderTop }),
        ...(cssStyle?.borderRight&&{ borderRight: cssStyle.borderRight }),
        ...(cssStyle?.borderBottom&&{ borderBottom: cssStyle.borderBottom }),
        ...(cssStyle?.borderLeft&&{ borderLeft: cssStyle.borderLeft }),
        // Apply shadow styles
        ...(getBoxShadow()&&{ boxShadow: getBoxShadow() }),
        ...(cssStyle?.textShadow&&{ textShadow: cssStyle.textShadow }),
        // Apply dimension styles
        ...(cssStyle?.height&&{ height: cssStyle.height }),
        ...(cssStyle?.minHeight&&{ minHeight: cssStyle.minHeight }),
        ...(cssStyle?.maxHeight&&{ maxHeight: cssStyle.maxHeight }),
        ...(cssStyle?.width&&{ width: cssStyle.width }),
        ...(cssStyle?.minWidth&&{ minWidth: cssStyle.minWidth }),
        ...(cssStyle?.maxWidth&&{ maxWidth: cssStyle.maxWidth }),
        // Apply padding styles
        ...(cssStyle?.padding&&{ padding: cssStyle.padding }),
        ...(cssStyle?.paddingTop&&{ paddingTop: cssStyle.paddingTop }),
        ...(cssStyle?.paddingRight&&{ paddingRight: cssStyle.paddingRight }),
        ...(cssStyle?.paddingBottom&&{ paddingBottom: cssStyle.paddingBottom }),
        ...(cssStyle?.paddingLeft&&{ paddingLeft: cssStyle.paddingLeft }),
        // Apply margin styles
        ...(cssStyle?.margin&&{ margin: cssStyle.margin }),
        ...(cssStyle?.marginTop&&{ marginTop: cssStyle.marginTop }),
        ...(cssStyle?.marginRight&&{ marginRight: cssStyle.marginRight }),
        ...(cssStyle?.marginBottom&&{ marginBottom: cssStyle.marginBottom }),
        ...(cssStyle?.marginLeft&&{ marginLeft: cssStyle.marginLeft }),
        // Apply opacity and visibility
        ...(cssStyle?.opacity&&{ opacity: cssStyle.opacity }),
        ...(cssStyle?.visibility&&{ visibility: cssStyle.visibility }),
        ...(cssStyle?.overflow&&{ overflow: cssStyle.overflow }),
        ...(cssStyle?.overflowX&&{ overflowX: cssStyle.overflowX }),
        ...(cssStyle?.overflowY&&{ overflowY: cssStyle.overflowY }),
        // Apply position and layout styles
        ...(cssStyle?.position&&{ position: cssStyle.position }),
        ...(cssStyle?.top&&{ top: cssStyle.top }),
        ...(cssStyle?.right&&{ right: cssStyle.right }),
        ...(cssStyle?.bottom&&{ bottom: cssStyle.bottom }),
        ...(cssStyle?.left&&{ left: cssStyle.left }),
        ...(cssStyle?.zIndex&&{ zIndex: cssStyle.zIndex }),
        // Apply transform and transition
        ...(cssStyle?.transform&&{ transform: cssStyle.transform }),
        ...(cssStyle?.transformOrigin&&{ transformOrigin: cssStyle.transformOrigin }),
        // Content width control applied directly to section
        ...(contentWidthMode==='boxed'? {
            maxWidth: `${boxedMaxWidth}px`,
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingLeft: `${horizontalPadding}px`,
            paddingRight: `${horizontalPadding}px`,
        }:{
            maxWidth: 'none',
            marginLeft: 0,
            marginRight: 0,
            paddingLeft: 0,
            paddingRight: 0,
        })
    };

    const cssVariables={
        '--boxed-max': `${boxedMaxWidth}px`,
        '--pad-x': `${horizontalPadding}px`,
    } as React.CSSProperties;

    return (
        <section
            style={{ ...sectionStyle, ...cssVariables } as any}
            className={`section-node builder-section cursor-pointer ${contentWidthMode==='boxed'? 'is-boxed':'is-full'} ${isSelected? 'ring-2 ring-blue-500 shadow-lg':'shadow-md'}`}
            onClick={onClick}
        >
            {/* Render children directly without inner wrapper */}
            {node.children?.map((child: Node) => (
                <NodeRenderer
                    key={child.id}
                    node={child}
                    device={device}
                    onSelect={onSelect}
                    isSelected={false}
                />
            ))}
        </section>
    );
};