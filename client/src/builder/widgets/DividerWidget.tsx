import React from 'react';
import { Node } from '../controls/types/index';

interface DividerWidgetProps {
    node: Node;
    device?: 'desktop'|'tablet'|'mobile';
    isEditing?: boolean;
    onEdit?: () => void;
    cssStyle?: Record<string, any>;
}

export const DividerWidget: React.FC<DividerWidgetProps>=({ node, device='desktop', isEditing, onEdit, cssStyle={} }) => {
    // Get responsive-aware values
    const getResponsiveValue=(propName: string, defaultVal: any) => {
        const baseValue=(node.style as any)?.[propName];
        const responsiveValue=(node.responsive as any)?.[device]?.style?.[propName];
        return responsiveValue!==undefined? responsiveValue:(baseValue!==undefined? baseValue:defaultVal);
    };

    // Get props with defaults from schema
    const dividerType=getResponsiveValue('dividerType', 'simple');
    const lineStyle=getResponsiveValue('lineStyle', 'solid');
    const thickness=getResponsiveValue('thickness', 2);
    const color=getResponsiveValue('color', 'var(--color-border)');
    const width=getResponsiveValue('width', '100%');
    const alignment=getResponsiveValue('alignment', 'center');
    const gap=getResponsiveValue('gap', 0);

    // Text divider specific
    const text=getResponsiveValue('text', '');
    const textColor=getResponsiveValue('textColor', 'var(--color-text-light)');
    const textSize=getResponsiveValue('textSize', 14);
    const textWeight=getResponsiveValue('textWeight', 'normal');
    const textGap=getResponsiveValue('textGap', 16);

    // Dotted divider specific
    const dotSize=getResponsiveValue('dotSize', 6);
    const dotSpacing=getResponsiveValue('dotSpacing', 8);

    // Padding and margin
    const padding=(node.style as any)?.padding||{};
    const margin=(node.style as any)?.margin||{};
    const customClass=(node.advanced as any)?.customClass||'';
    const hideOn=(node.advanced as any)?.hideOn||[];

    // Check if should be hidden on this device
    if (hideOn&&Array.isArray(hideOn)&&hideOn.includes(device)) {
        return null;
    }

    // Parse padding object to CSS string
    const getPaddingValue=() => {
        if (typeof padding==='string') return padding;
        if (typeof padding==='object'&&padding) {
            const { top=0, right=0, bottom=0, left=0 }=padding as any;
            return `${top}px ${right}px ${bottom}px ${left}px`;
        }
        return '0';
    };

    // Parse margin object to CSS string
    const getMarginValue=() => {
        if (typeof margin==='string') return margin;
        if (typeof margin==='object'&&margin) {
            const { top=0, right=0, bottom=0, left=0 }=margin as any;
            return `${top}px ${right}px ${bottom}px ${left}px`;
        }
        return '0';
    };

    // Container alignment map
    const alignmentMap: Record<string, string>={
        'left': 'flex-start',
        'center': 'center',
        'right': 'flex-end'
    };

    const justifyContent=alignmentMap[alignment as string]||'center';

    // Container style
    const containerStyle: React.CSSProperties={
        display: 'flex',
        justifyContent: justifyContent as any,
        alignItems: 'center',
        width: '100%',
        padding: getPaddingValue(),
        margin: getMarginValue(),
        gap: `${gap}px`,
        cursor: isEditing? 'pointer':'default',
        transition: 'all 0.3s ease',
        ...cssStyle
    };

    // ===== SIMPLE DIVIDER =====
    if (dividerType==='simple') {
        const dividerStyle: React.CSSProperties={
            width: width,
            height: lineStyle==='solid'? `${thickness}px`:'0px',
            backgroundColor: lineStyle==='solid'? color:'transparent',
            border: 'none',
            ...(lineStyle!=='solid'&&{
                borderStyle: lineStyle as any,
                borderWidth: `${thickness}px`,
                borderColor: color,
                height: '0px',
            }),
            flexShrink: 0,
            transition: 'all 0.3s ease',
        };

        return (
            <div
                style={containerStyle}
                className={customClass}
                onClick={onEdit}
                role="separator"
                aria-orientation="horizontal"
            >
                <div style={dividerStyle} />
            </div>
        );
    }

    // ===== DOTTED DIVIDER =====
    if (dividerType==='dotted') {
        // Calculate number of dots to fill width
        const containerWidth=typeof width==='string'
            ? (width==='100%'? 500:parseInt(width)||500)
            :(width as number)||500;
        const dotsCount=Math.max(2, Math.floor(containerWidth/(dotSize+dotSpacing)));

        const dotContainerStyle: React.CSSProperties={
            width: width,
            display: 'flex',
            gap: `${dotSpacing}px`,
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
        };

        const dotStyle: React.CSSProperties={
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            borderRadius: '50%',
            backgroundColor: color,
            display: 'inline-block',
            flexShrink: 0,
            transition: 'all 0.3s ease',
        };

        return (
            <div
                style={containerStyle}
                className={customClass}
                onClick={onEdit}
                role="separator"
                aria-orientation="horizontal"
            >
                <div style={dotContainerStyle}>
                    {Array.from({ length: dotsCount }).map((_, idx) => (
                        <div key={idx} style={dotStyle} />
                    ))}
                </div>
            </div>
        );
    }

    // ===== TEXT DIVIDER =====
    if (dividerType==='text'&&text) {
        const fontWeightMap: Record<string, number>={
            'normal': 400,
            'semi-bold': 600,
            'bold': 700
        };

        const textDividerStyle: React.CSSProperties={
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: `${textGap}px`,
            width: width,
            flexShrink: 0,
        };

        const lineStyle: React.CSSProperties={
            flex: 1,
            borderTop: `${thickness}px solid ${color}`,
            height: '0',
        };

        const textStyle: React.CSSProperties={
            color: textColor,
            fontSize: `${textSize}px`,
            fontWeight: fontWeightMap[textWeight as string]||400,
            whiteSpace: 'nowrap',
            userSelect: 'none',
            transition: 'all 0.3s ease',
        };

        return (
            <div
                style={containerStyle}
                className={customClass}
                onClick={onEdit}
                role="separator"
                aria-orientation="horizontal"
            >
                <div style={textDividerStyle}>
                    <div style={lineStyle} />
                    <span style={textStyle}>{text}</span>
                    <div style={lineStyle} />
                </div>
            </div>
        );
    }

    // Default fallback to simple
    const dividerStyle: React.CSSProperties={
        width: width,
        height: `${thickness}px`,
        backgroundColor: color,
        border: 'none',
        flexShrink: 0,
        transition: 'all 0.3s ease',
    };

    return (
        <div
            style={containerStyle}
            className={customClass}
            onClick={onEdit}
            role="separator"
            aria-orientation="horizontal"
        >
            <div style={dividerStyle} />
        </div>
    );
};

export default DividerWidget;