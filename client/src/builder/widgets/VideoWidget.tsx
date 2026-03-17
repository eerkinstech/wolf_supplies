import React, { useState } from 'react';
import { Node } from '../controls/types/index';

interface VideoWidgetProps {
    node: Node;
    device?: 'desktop'|'tablet'|'mobile';
    isEditing?: boolean;
    onEdit?: () => void;
    cssStyle?: Record<string, any>;
}

export const VideoWidget: React.FC<VideoWidgetProps>=({ node, device='desktop', isEditing, onEdit, cssStyle={} }) => {
    const videoType=node.props?.videoType||'youtube'; // youtube, vimeo, html5, url, upload, iframe
    const videoUrl=node.props?.videoUrl||node.props?.videoSrc||'';
    const videoUpload=node.props?.videoUpload||'';
    const iframeCode=node.props?.iframeCode||'';
    const videoId=node.props?.videoId||'dQw4w9WgXcQ';
    const [isLoading, setIsLoading]=useState(false);

    // Helper function to get responsive value
    const getResponsiveValue=(propName: string, defaultVal: any) => {
        const baseValue=(node.style as any)?.[propName];
        const responsiveValue=(node.responsive as any)?.[device]?.style?.[propName];
        return responsiveValue!==undefined? responsiveValue:(baseValue!==undefined? baseValue:defaultVal);
    };

    const width=getResponsiveValue('width', '100%');
    const aspectRatio=node.style?.aspectRatio||node.props?.aspectRatio||'16:9';
    const borderRadius=cssStyle?.borderRadius||node.style?.borderRadius||'0px';
    const borderWidth=cssStyle?.borderWidth||node.style?.borderWidth||'0px';
    const borderColor=cssStyle?.borderColor||node.style?.borderColor||'#000000';
    const boxShadow=cssStyle?.boxShadow||node.style?.boxShadow||'none';
    const opacity=cssStyle?.opacity||node.style?.opacity||1;
    const padding=cssStyle?.padding||node.style?.padding||'0px';
    const paddingTop=getResponsiveValue('paddingTop', 0);
    const paddingRight=getResponsiveValue('paddingRight', 0);
    const paddingBottom=getResponsiveValue('paddingBottom', 0);
    const paddingLeft=getResponsiveValue('paddingLeft', 0);

    // Container
    const containerStyle: React.CSSProperties={
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        cursor: isEditing? 'pointer':'default',
        paddingTop: `${paddingTop}px`,
        paddingRight: `${paddingRight}px`,
        paddingBottom: `${paddingBottom}px`,
        paddingLeft: `${paddingLeft}px`,
    };

    // Calculate padding based on aspect ratio
    const getAspectRatioPadding=(ratio: string) => {
        const [w, h]=ratio.split(':').map(Number);
        return (h/w)*100;
    };

    const paddingPercentage=getAspectRatioPadding(aspectRatio);

    // Video wrapper with aspect ratio - layout only, no visual styles
    const wrapperStyle: React.CSSProperties={
        position: 'relative',
        width: typeof width==='string'? width:`${width}px`,
        maxWidth: '100%',
        paddingBottom: `${paddingPercentage}%`,
        height: 0,
        overflow: 'hidden',
        borderRadius: borderRadius,
        boxShadow: boxShadow,
    };

    // Video element style - apply all styling directly to video/iframe tag
    const videoStyle: React.CSSProperties={
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        borderRadius: borderRadius,
        border: borderWidth!=='0px'? `${borderWidth} solid ${borderColor}`:'none',
        padding: padding,
        opacity: opacity,
        display: 'block',
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: 'white',
        fontSize: '14px',
        zIndex: 10,
    };

    // Get embed URL based on video type
    const getEmbedUrl=() => {
        const url=videoUrl||``;

        if (videoType==='youtube') {
            // Extract video ID from various YouTube URL formats
            let youtubeId=videoId;
            if (url) {
                const match=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
                youtubeId=match? match[1]:url;
            }
            return `https://www.youtube.com/embed/${youtubeId}?autoplay=${node.props?.autoplay? 1:0}&controls=${node.props?.showControls!==false? 1:0}`;
        } else if (videoType==='vimeo') {
            // Extract Vimeo ID
            let vimeoId=videoId;
            if (url) {
                const match=url.match(/vimeo\.com\/(\d+)/);
                vimeoId=match? match[1]:url;
            }
            return `https://player.vimeo.com/video/${vimeoId}?autoplay=${node.props?.autoplay? 1:0}`;
        } else if (videoType==='upload') {
            // Return uploaded video URL
            return videoUpload||'';
        } else if (videoType==='url'||videoType==='html5') {
            // Direct URL to video file
            return url;
        }
        return url;
    };

    const handleVideoLoad=() => {
        setIsLoading(false);
    };

    return (
        <div style={containerStyle} onClick={isEditing? onEdit:undefined}>
            {videoType==='iframe'&&iframeCode? (
                // Render custom iframe code
                <div dangerouslySetInnerHTML={{ __html: iframeCode }} />
            ):(
                <div style={wrapperStyle}>
                    {videoType==='html5'||videoType==='url'||videoType==='upload'? (
                        <>
                            <video
                                style={videoStyle}
                                controls={node.props?.showControls!==false}
                                autoPlay={node.props?.autoplay||false}
                                loop={node.props?.loop||false}
                                onLoadedData={handleVideoLoad}
                            >
                                <source src={getEmbedUrl()} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            <div style={loadingStyle}>
                                <span>Loading video...</span>
                            </div>
                        </>
                    ):(
                        <>
                            <iframe
                                style={videoStyle}
                                src={getEmbedUrl()}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                onLoad={handleVideoLoad}
                            />
                            <div style={loadingStyle}>
                                <span>Loading video...</span>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default VideoWidget;
