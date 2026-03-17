import React, { useState } from 'react';
import { Node } from '../controls/types/index';

interface IconWidgetProps {
    node: Node;
    device?: 'desktop'|'tablet'|'mobile';
    isEditing?: boolean;
    onEdit?: () => void;
    __cssStyle?: Record<string, any>;
}

export const IconWidget: React.FC<IconWidgetProps>=({ node, device='desktop', isEditing, onEdit, __cssStyle={} }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    // Get icon from props
    const icon = node.props?.icon || 'fas fa-star';
    
    // Helper function to get responsive value
    const getResponsiveValue=(propName: string, defaultVal: any) => {
        const baseValue=(node.style as any)?.[propName];
        const responsiveValue=(node.responsive as any)?.[device]?.style?.[propName];
        return responsiveValue!==undefined? responsiveValue:(baseValue!==undefined? baseValue:defaultVal);
    };

    // Get styling values
    const iconSize = getResponsiveValue('iconSize', 48);
    const iconColor = node.style?.iconColor || '#3b82f6';
    const iconBgColor = node.style?.iconBackgroundColor || 'transparent';
    const iconPadding = getResponsiveValue('iconPadding', 0);
    const iconBgSize = iconSize + (iconPadding * 2);
    const alignment = node.style?.alignment || 'center';
    const width = getResponsiveValue('width', '');
    const marginObj = getResponsiveValue('margin', { top: '', right: '', bottom: '', left: '' });
    const marginTop = marginObj?.top || '0';
    const marginRight = marginObj?.right || '0';
    const marginBottom = marginObj?.bottom || '0';
    const marginLeft = marginObj?.left || '0';

    // Border styles
    const iconBorderWidth = node.style?.iconBorderWidth || 0;
    const iconBorderStyle = node.style?.iconBorderStyle || 'solid';
    const iconBorderColor = node.style?.iconBorderColor || '#000000';
    const iconBorderRadius = getResponsiveValue('iconBorderRadius', 0);

    // Shadow styles
    const iconShadowOffsetX = node.style?.iconShadowOffsetX || 0;
    const iconShadowOffsetY = node.style?.iconShadowOffsetY || 0;
    const iconShadowBlur = node.style?.iconShadowBlur || 0;
    const iconShadowSpread = node.style?.iconShadowSpread || 0;
    const iconShadowColor = node.style?.iconShadowColor || 'rgba(0, 0, 0, 0.1)';

    // Hover styles
    const iconColorHover = node.style?.iconColorHover || iconColor;
    const iconBgHover = node.style?.iconBackgroundHover || iconBgColor;
    const hoverShadowOffsetX = node.style?.iconHoverShadowOffsetX || 0;
    const hoverShadowOffsetY = node.style?.iconHoverShadowOffsetY || 5;
    const hoverShadowBlur = node.style?.iconHoverShadowBlur || 10;
    const hoverShadowSpread = node.style?.iconHoverShadowSpread || 0;
    const hoverShadowColor = node.style?.iconHoverShadowColor || 'rgba(0, 0, 0, 0.2)';

    // Container style
    const containerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: alignment as any,
        width: width ? width : '100%',
        cursor: isEditing ? 'pointer' : 'default',
        marginTop: marginTop || '0',
        marginRight: marginRight || '0',
        marginBottom: marginBottom || '0',
        marginLeft: marginLeft || '0',
    };

    // Icon style
    const iconStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${iconBgSize}px`,
        height: `${iconBgSize}px`,
        padding: `${iconPadding}px`,
        borderRadius: `${iconBorderRadius}px`,
        backgroundColor: isHovered ? iconBgHover : iconBgColor,
        color: isHovered ? iconColorHover : iconColor,
        fontSize: `${iconSize}px`,
        border: iconBorderWidth > 0 ? `${iconBorderWidth}px ${iconBorderStyle} ${iconBorderColor}` : 'none',
        boxShadow: isHovered && hoverShadowBlur > 0 ? `${hoverShadowOffsetX}px ${hoverShadowOffsetY}px ${hoverShadowBlur}px ${hoverShadowSpread}px ${hoverShadowColor}` : (iconShadowBlur > 0 ? `${iconShadowOffsetX}px ${iconShadowOffsetY}px ${iconShadowBlur}px ${iconShadowSpread}px ${iconShadowColor}` : 'none'),
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        minWidth: `${iconBgSize}px`,
        minHeight: `${iconBgSize}px`,
    };

    return (
        <div style={containerStyle} onClick={onEdit}>
            <div 
                style={iconStyle}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <i className={icon}></i>
            </div>
        </div>
    );
};

export default IconWidget;
