import React, { useState } from 'react';
import { Node } from '../controls/types/index';

interface IconListWidgetProps {
    node: Node;
    device?: 'desktop'|'tablet'|'mobile';
    isEditing?: boolean;
    onEdit?: () => void;
    _cssStyle?: Record<string, any>;
}

export const IconListWidget: React.FC<IconListWidgetProps>=({ node, device='desktop', isEditing, onEdit, _cssStyle={} }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    
    // Get items from props
    const items=node.props?.items||[
        { id: '1', icon: 'fas fa-check', heading: 'Item 1', text: 'Description text', link: '', openNewTab: false },
        { id: '2', icon: 'fas fa-star', heading: 'Item 2', text: 'Description text', link: '', openNewTab: false },
        { id: '3', icon: 'fas fa-heart', heading: 'Item 3', text: 'Description text', link: '', openNewTab: false },
    ];
    const iconPosition=node.props?.iconPosition||node.style?.iconPosition||'left';
    const __gap=node.style?.gap||'16px';

    // Helper function to get responsive value
    const getResponsiveValue=(propName: string, defaultVal: any) => {
        const baseValue=(node.style as any)?.[propName];
        const responsiveValue=(node.responsive as any)?.[device]?.style?.[propName];
        return responsiveValue!==undefined? responsiveValue:(baseValue!==undefined? baseValue:defaultVal);
    };

    const containerGap=getResponsiveValue('gap', '16px');
    const itemGap=getResponsiveValue('itemGap', '12px');
    const descriptionGap=getResponsiveValue('descriptionGap', '4px');
    const itemsLayout=node.style?.itemsLayout||'vertical';
    const containerAlignment=node.style?.containerAlignment||'flex-start';
    const itemAlignment=node.style?.itemAlignment||'flex-start';
    const itemsVerticalAlign=node.style?.itemsVerticalAlign||'flex-start';

    // Container styles
    const containerStyle: React.CSSProperties={
        display: 'flex',
        flexDirection: itemsLayout==='horizontal'? 'row':'column',
        gap: containerGap,
        width: '100%',
        cursor: isEditing? 'pointer':'default',
        flexWrap: itemsLayout==='horizontal'? 'wrap':'nowrap',
        justifyContent: containerAlignment as any,
        alignItems: itemsLayout==='horizontal'? itemsVerticalAlign as any:'stretch',
    };

    // Item container style
    const itemContainerStyle: React.CSSProperties={
        display: 'flex',
        flexDirection: iconPosition==='top'? 'column':'row',
        gap: itemGap,
        alignItems: itemAlignment as any,
        width: (node.style?.itemWidth||0)>0? `${node.style?.itemWidth}px`:(itemsLayout==='horizontal'? 'auto':'100%'),
        flex: (node.style?.itemWidth||0)>0? 'none':(itemsLayout==='horizontal'? '0 1 auto':'1'),
        backgroundColor: node.style?.itemBackgroundColor||'transparent',
        borderRadius: `${node.style?.itemBorderRadius||0}px`,
        border: (node.style?.itemBorderWidth||0)>0? `${node.style?.itemBorderWidth}px ${node.style?.itemBorderStyle||'solid'} ${node.style?.itemBorderColor||'#000000'}`: 'none',
        boxShadow: (node.style?.itemShadowBlur||0)>0? `${node.style?.itemShadowOffsetX||0}px ${node.style?.itemShadowOffsetY||0}px ${node.style?.itemShadowBlur}px ${node.style?.itemShadowSpread||0}px ${node.style?.itemShadowColor||'rgba(0,0,0,0.1)'}`: 'none',
        padding: `${node.style?.itemPadding||16}px`,
        margin: `${node.style?.itemMargin||0}px`,
    };

    // Icon styles
    const iconSize=node.style?.iconSize||24;
    const iconColor=node.style?.iconColor||'#3b82f6';
    const iconPadding=node.style?.iconPadding||8;
    const iconBgColor=node.style?.iconBackgroundColor||'transparent';
    const iconBgSize=iconSize+(iconPadding*2);

    const iconStyle: React.CSSProperties={
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${iconBgSize}px`,
        height: `${iconBgSize}px`,
        padding: `${iconPadding}px`,
        borderRadius: node.style?.iconBorderRadius||'0px',
        backgroundColor: iconBgColor,
        color: iconColor,
        fontSize: `${iconSize}px`,
        flexShrink: 0,
        minHeight: `${iconBgSize}px`,
        minWidth: `${iconBgSize}px`,
    };

    // Content wrapper (heading + text)
    const contentStyle: React.CSSProperties={
        display: 'flex',
        flexDirection: 'column',
        gap: descriptionGap,
        flex: 1,
    };

    // Heading styles
    const headingSize=node.style?.headingFontSize||18;
    const headingColor=node.style?.headingColor||'#000000';
    const headingWeight=node.style?.headingFontWeight||'600';

    const headingStyle: React.CSSProperties={
        fontSize: `${headingSize}px`,
        fontWeight: headingWeight as any,
        color: headingColor,
        margin: 0,
        padding: 0,
        lineHeight: '1.2',
        wordBreak: 'break-word',
    };

    // Text styles
    const textSize=node.style?.textFontSize||14;
    const textColor=node.style?.textColor||'#666666';

    const textStyle: React.CSSProperties={
        fontSize: `${textSize}px`,
        color: textColor,
        margin: 0,
        padding: 0,
        lineHeight: '1.5',
        wordBreak: 'break-word',
    };

    // Hover styles
    const itemBgHover = node.style?.itemBackgroundHover || node.style?.itemBackgroundColor || 'transparent';
    const iconColorHover = node.style?.iconColorHover || iconColor;
    const iconBgHover = node.style?.iconBackgroundHover || iconBgColor;
    const headingHover = node.style?.headingColorHover || headingColor;
    const textHover = node.style?.textColorHover || textColor;

    // Item hover style
    const itemHoverStyle: React.CSSProperties = {
        backgroundColor: itemBgHover,
        borderRadius: `${node.style?.itemBorderRadius||0}px`,
        border: (node.style?.itemBorderWidth||0)>0? `${node.style?.itemBorderWidth}px ${node.style?.itemBorderStyle||'solid'} ${node.style?.itemBorderColor||'#000000'}`: 'none',
        boxShadow: (node.style?.itemHoverShadowBlur||10)>0? `${node.style?.itemHoverShadowOffsetX||0}px ${node.style?.itemHoverShadowOffsetY||5}px ${node.style?.itemHoverShadowBlur||10}px ${node.style?.itemHoverShadowSpread||0}px ${node.style?.itemHoverShadowColor||'rgba(0,0,0,0.2)'}`: 'none',
    };

    return (
        <div style={containerStyle} onClick={onEdit}>
            {items?.map((item: any, index: number) => (
                <div 
                    key={item.id} 
                    style={{
                        ...itemContainerStyle,
                        ...(hoveredIndex === index ? itemHoverStyle : {}),
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    {item.icon&&(
                        <div style={{
                            ...iconStyle,
                            color: hoveredIndex === index ? iconColorHover : iconColor,
                            backgroundColor: hoveredIndex === index ? iconBgHover : iconBgColor,
                            transition: 'all 0.3s ease'
                        }}>
                            <i className={item.icon}></i>
                        </div>
                    )}
                    <div style={contentStyle}>
                        {item.heading&&(
                            <h3 style={{
                                ...headingStyle,
                                color: hoveredIndex === index ? headingHover : headingColor,
                                transition: 'all 0.3s ease'
                            }}>{item.heading}</h3>
                        )}
                        {item.text&&(
                            <p style={{
                                ...textStyle,
                                color: hoveredIndex === index ? textHover : textColor,
                                transition: 'all 0.3s ease'
                            }}>{item.text}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default IconListWidget;
