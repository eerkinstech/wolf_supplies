import React from 'react';

/**
 * Divider Types:
 * - simple: Basic horizontal line
 * - dotted: Dotted line style
 * - text: Text with dividers on sides
 */

interface DividerProps {
    id?: string;
    isEditing?: boolean;
    isSelected?: boolean;
    style?: React.CSSProperties;
    type?: 'simple'|'dotted'|'text';
    borderColor?: string;
    borderWidth?: number;
    borderStyle?: 'solid'|'dashed'|'dotted';
    marginTop?: number;
    marginBottom?: number;
    width?: string|number;
    opacity?: number;
    className?: string;

    // Text divider options
    text?: string;
    textColor?: string;
    textSize?: number;
    textWeight?: 'normal'|'bold'|'semi-bold';
    gap?: number;

    // Dotted divider options
    dotSize?: number;
    dotSpacing?: number;
}

const Divider: React.FC<DividerProps>=({
    isEditing=false,
    isSelected=false,
    style={},
    type='simple',
    borderColor='#e5e7eb',
    borderWidth=1,
    borderStyle='solid',
    marginTop=24,
    marginBottom=24,
    width='100%',
    opacity=1,
    className='',

    // Text divider options
    text='',
    textColor='#6b7280',
    textSize=14,
    textWeight='normal',
    gap=16,

    // Dotted divider options
    dotSize=6,
    dotSpacing=8,
}) => {
    const containerStyle: React.CSSProperties={
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        outline: isEditing&&isSelected? '2px solid #3b82f6':'none',
        outlineOffset: '2px',
        padding: isEditing? '8px':'0',
        ...style,
    };

    const fontWeightMap={
        normal: 400,
        'semi-bold': 600,
        bold: 700,
    };

    // Simple divider - basic horizontal line
    if (type==='simple') {
        const dividerStyle: React.CSSProperties={
            borderTop: `${borderWidth}px ${borderStyle} ${borderColor}`,
            width: width,
            opacity: opacity,
            flex: 1,
        };

        return (
            <div style={containerStyle} className={className}>
                <div style={dividerStyle} />
            </div>
        );
    }

    // Dotted divider - series of dots
    if (type==='dotted') {
        const dotDividerStyle: React.CSSProperties={
            width: width,
            opacity: opacity,
            display: 'flex',
            gap: `${dotSpacing}px`,
            justifyContent: 'center',
            alignItems: 'center',
        };

        const dotStyle: React.CSSProperties={
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            borderRadius: '50%',
            backgroundColor: borderColor,
            display: 'inline-block',
        };

        // Calculate number of dots to fill the width
        const containerWidth=typeof width==='string'
            ? (width==='100%'? 500:parseInt(width))
            :width;
        const dotsCount=Math.floor(containerWidth/(dotSize+dotSpacing));

        return (
            <div style={containerStyle} className={className}>
                <div style={dotDividerStyle}>
                    {Array.from({ length: dotsCount }).map((_, index) => (
                        <div key={index} style={dotStyle} />
                    ))}
                </div>
            </div>
        );
    }

    // Text divider - text with divider lines on both sides
    if (type==='text'&&text) {
        const textDividerStyle: React.CSSProperties={
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: `${gap}px`,
            width: width,
            opacity: opacity,
        };

        const lineStyle: React.CSSProperties={
            flex: 1,
            borderTop: `${borderWidth}px ${borderStyle} ${borderColor}`,
            height: '0',
        };

        const textStyle: React.CSSProperties={
            color: textColor,
            fontSize: `${textSize}px`,
            fontWeight: fontWeightMap[textWeight],
            whiteSpace: 'nowrap',
            userSelect: 'none',
        };

        return (
            <div style={containerStyle} className={className}>
                <div style={textDividerStyle}>
                    <div style={lineStyle} />
                    <span style={textStyle}>{text}</span>
                    <div style={lineStyle} />
                </div>
            </div>
        );
    }

    // Default to simple if no valid type or missing text for text divider
    const defaultDividerStyle: React.CSSProperties={
        borderTop: `${borderWidth}px ${borderStyle} ${borderColor}`,
        width: width,
        opacity: opacity,
        flex: 1,
    };

    return (
        <div style={containerStyle} className={className}>
            <div style={defaultDividerStyle} />
        </div>
    );
};

export default Divider;
