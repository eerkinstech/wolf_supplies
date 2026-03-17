import React from 'react';
import { Node } from '../controls/types/index';

interface ButtonWidgetProps {
    node: Node;
    device?: 'desktop'|'tablet'|'mobile';
    isEditing?: boolean;
    onEdit?: () => void;
    cssStyle?: Record<string, any>;
}

export const ButtonWidget: React.FC<ButtonWidgetProps>=({ node, device='desktop', isEditing, onEdit, cssStyle={} }) => {
    const text=node.props?.text||'Click Me';
    const icon=node.props?.icon||'';
    const __link=node.props?.link||'#';
    const __style=node.props?.style||'primary';
    const [isHovering, setIsHovering]=React.useState(false);

    // Helper function to get responsive value with fallback
    const getResponsiveValue=(propName: string, defaultVal: any) => {
        const baseValue=(node.style as any)?.[propName];
        const responsiveValue=(node.responsive as any)?.[device]?.style?.[propName];
        return responsiveValue!==undefined? responsiveValue:(baseValue!==undefined? baseValue:defaultVal);
    };

    const paddingTop=getResponsiveValue('paddingTop', 12);
    const paddingRight=getResponsiveValue('paddingRight', 24);
    const paddingBottom=getResponsiveValue('paddingBottom', 12);
    const paddingLeft=getResponsiveValue('paddingLeft', 24);
    const borderRadius=getResponsiveValue('borderRadius', 6);
    const fontSize=getResponsiveValue('fontSize', 16);
    const iconPosition=getResponsiveValue('iconPosition', 'left');

    // Button colors: prioritize cssStyle (final merged style), then node.style
    const textColor=cssStyle?.color||cssStyle?.textColor||node.style?.textColor||'var(--color-bg-primary)';
    const bgColor=cssStyle?.backgroundColor||node.style?.bgColor||node.style?.backgroundColor||'var(--color-accent-primary)';
    const hoverBgColor=cssStyle?.hoverBackgroundColor||node.style?.hoverBgColor||node.style?.hoverBackgroundColor||bgColor;
    const hoverTextColor=cssStyle?.hoverTextColor||cssStyle?.hoverColor||node.style?.textHoverColor||node.style?.hoverTextColor||textColor;

    // Icon styles
    const iconSize=node.style?.iconSize||16;
    const iconPadding=node.style?.iconPadding||6;
    const iconGap=node.style?.iconGap||8;
    const iconBorderRadius=node.style?.iconBorderRadius||0;
    const iconColor=isHovering? (node.style?.iconHoverColor||'var(--color-bg-primary)'):(node.style?.iconColor||'var(--color-bg-primary)');
    const iconBgColor=isHovering? (node.style?.iconHoverBackgroundColor||'transparent'):(node.style?.iconBackgroundColor||'transparent');

    const alignment=getResponsiveValue('alignment', 'center');

    // Container styles - convert text alignment to flex justification
    const getJustifyContent=(align: string) => {
        switch (align) {
            case 'left': return 'flex-start';
            case 'right': return 'flex-end';
            case 'center': return 'center';
            case 'justify': return 'space-between';
            default: return 'center';
        }
    };

    // Container styles
    const containerStyle: React.CSSProperties={
        cursor: isEditing? 'pointer':'default',
        width: node.style?.width? (typeof node.style.width==='string'? node.style.width:`${node.style.width}px`):'100%' as any,
        display: 'flex' as any,
        justifyContent: getJustifyContent(alignment as string) as any,
        alignItems: 'center' as any,
        // Margin
        marginTop: node.style?.margin?.top? `${node.style.margin.top}px`:undefined,
        marginRight: node.style?.margin?.right? `${node.style.margin.right}px`:undefined,
        marginBottom: node.style?.margin?.bottom? `${node.style.margin.bottom}px`:undefined,
        marginLeft: node.style?.margin?.left? `${node.style.margin.left}px`:undefined,
        // Padding on container
        paddingTop: node.style?.padding?.top? `${node.style.padding.top}px`:undefined,
        paddingRight: node.style?.padding?.right? `${node.style.padding.right}px`:undefined,
        paddingBottom: node.style?.padding?.bottom? `${node.style.padding.bottom}px`:undefined,
        paddingLeft: node.style?.padding?.left? `${node.style.padding.left}px`:undefined,
    };

    const buttonStyle={
        padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
        fontSize: `${fontSize}px`,
        fontWeight: node.style?.fontWeight||'600',
        borderRadius: `${borderRadius}px`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        width: node.style?.buttonWidth||'auto',
        display: 'inline-flex' as const,
        alignItems: 'center',
        justifyContent: 'center',
        gap: `${iconGap}px`,
        flexDirection: iconPosition==='right'? 'row-reverse' as const:'row' as const,
        color: isHovering? hoverTextColor:textColor,
        backgroundColor: isHovering? hoverBgColor:bgColor,
        border: 'none'
    } as React.CSSProperties;

    // Icon wrapper style
    const iconWrapperStyle: React.CSSProperties={
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${iconSize+iconPadding*2}px`,
        height: `${iconSize+iconPadding*2}px`,
        padding: `${iconPadding}px`,
        borderRadius: `${iconBorderRadius}px`,
        backgroundColor: iconBgColor,
        color: iconColor,
        transition: 'all 0.3s ease',
        fontSize: `${iconSize}px`,
    };

    return (
        <div style={containerStyle} onClick={onEdit}>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    onEdit?.();
                }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                style={buttonStyle}
                className={`transition ${isEditing? 'ring-2 ring-blue-500':''}`}
            >
                {icon&&<span style={iconWrapperStyle}><i className={icon}></i></span>}
                {text}
            </button>
        </div>
    );
};

export default ButtonWidget;