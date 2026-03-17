import React, { useState, useEffect } from 'react';
import { Node } from '../controls/types/index';

interface ImageWidgetProps {
    node: Node;
    device?: 'desktop'|'tablet'|'mobile';
    isEditing?: boolean;
    onEdit?: () => void;
    cssStyle?: Record<string, any>;
}

export const ImageWidget: React.FC<ImageWidgetProps>=({ node, device='desktop', isEditing, onEdit, cssStyle={} }) => {
    const src=node.props?.src||'https://via.placeholder.com/400x300?text=Image';
    const alt=node.props?.alt||'Image';
    const caption=node.props?.caption||'';
    const link=node.props?.link||'';
    const [imgSrc, setImgSrc]=useState(src);
    const [isLoading, setIsLoading]=useState(false);
    const [imageError, setImageError]=useState(false);

    // Update imgSrc when src prop changes
    useEffect(() => {
        setImgSrc(src);
        setImageError(false);
    }, [src]);

    // Helper function to get responsive value
    const getResponsiveValue=(propName: string, defaultVal: any) => {
        const baseValue=(node.style as any)?.[propName];
        const responsiveValue=(node.responsive as any)?.[device]?.style?.[propName];
        return responsiveValue!==undefined? responsiveValue:(baseValue!==undefined? baseValue:defaultVal);
    };

    const width=getResponsiveValue('width', '100%');
    const height=getResponsiveValue('height', 'auto');
    const borderRadius=cssStyle?.borderRadius||node.style?.borderRadius||'0px';
    const borderWidth=cssStyle?.borderWidth||node.style?.borderWidth||'0px';
    const borderColor=cssStyle?.borderColor||node.style?.borderColor||'#000000';
    const boxShadow=cssStyle?.boxShadow||node.style?.boxShadow||'none';
    const opacity=cssStyle?.opacity||node.style?.opacity||1;
    const padding=cssStyle?.padding||node.style?.padding||'0px';
    const alignment=getResponsiveValue('alignment', 'center');

    // Container styles
    const containerStyle: React.CSSProperties={
        display: 'flex',
        flexDirection: 'column',
        textAlign: alignment as any,
        width: '100%',
        cursor: isEditing? 'pointer':'default',
    };

    // Image styles - apply all styling directly to img tag
    const imageStyle: React.CSSProperties={
        width: typeof width==='string'? width:`${width}px`,
        height: typeof height==='string'? height:`${height}px`,
        maxWidth: '100%',
        objectFit: cssStyle?.objectFit||'cover',
        objectPosition: cssStyle?.objectPosition||'center',
        borderRadius: borderRadius,
        border: borderWidth!=='0px'? `${borderWidth} solid ${borderColor}`:'none',
        boxShadow: boxShadow,
        padding: padding,
        opacity: opacity,
        display: 'inline-block',
        verticalAlign: 'middle',
        transition: 'all 0.3s ease',
    };

    // Caption styles
    const captionStyle: React.CSSProperties={
        marginTop: node.style?.captionGap||'8px',
        fontSize: node.style?.captionFontSize||'14px',
        color: node.style?.captionColor||'#666666',
        fontStyle: 'italic',
        margin: 0,
    };

    // Loading overlay
    const loadingStyle: React.CSSProperties={
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: isLoading? 'flex':'none',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: borderRadius,
    };

    const handleImageLoad=() => {
        setIsLoading(false);
    };

    const handleImageClick=() => {
        onEdit?.();
    };

    const imageElement=(
        <img
            src={imgSrc}
            alt={alt}
            style={imageStyle}
            onLoad={handleImageLoad}
            onError={(_e) => {
setImageError(true);
                setIsLoading(false);
            }}
        />
    );

    return (
        <div style={containerStyle} onClick={onEdit}>
            <div style={{ position: 'relative' }}>
                {imageError? (
                    <div style={{ ...imageStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fee2e2', border: '2px solid #dc2626' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
                        <div style={{ fontSize: '12px', color: '#991b1b', textAlign: 'center', padding: '8px' }}>
                            <div>Image failed to load</div>
                            <div style={{ fontSize: '10px', marginTop: '4px', wordBreak: 'break-all' }}>{imgSrc}</div>
                        </div>
                    </div>
                ):(
                    link? (
                        <a href={link} target={node.props?.openNewTab? '_blank':'_self'} rel="noopener noreferrer" onClick={handleImageClick}>
                            {imageElement}
                        </a>
                    ):(
                        imageElement
                    )
                )}
                <div style={loadingStyle}>
                    <div style={{ color: 'white', fontSize: '12px' }}>Loading...</div>
                </div>
            </div>
            {caption&&(
                <p style={captionStyle}>{caption}</p>
            )}
        </div>
    );
};

export default ImageWidget;
