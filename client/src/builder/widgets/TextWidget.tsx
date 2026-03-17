import React from 'react';
import { Node } from '../controls/types/index';

interface TextWidgetProps {
  node: Node;
  device?: 'desktop'|'tablet'|'mobile';
  isEditing?: boolean;
  onEdit?: () => void;
  cssStyle?: Record<string, any>;
}

export const TextWidget: React.FC<TextWidgetProps>=({ node, isEditing, onEdit, cssStyle={} }) => {
  const content=node.props?.content||'Lorem ipsum dolor sit amet';
  const [isHovering, setIsHovering]=React.useState(false);

  // Get normal color - from cssStyle (final merged style) - this is the priority, fallback to node.style, default to black
  const normalColor=cssStyle?.color||node.style?.color||'#000000';

  // Get hover color - from cssStyle or node.style
  const hoverColorValue=cssStyle?.hoverColor||node.style?.hoverColor||normalColor;

  // Check if content contains HTML (from RichTextEditor)
  const isHtmlContent=typeof content==='string'&&/<[^>]*>/.test(content);

  // Build styles from node.style
  const containerStyle: React.CSSProperties={
    cursor: isEditing? 'pointer':'default',
    width: node.style?.width||'100%',
    // Margin
    marginTop: node.style?.margin?.top? `${node.style.margin.top}px`:undefined,
    marginRight: node.style?.margin?.right? `${node.style.margin.right}px`:undefined,
    marginBottom: node.style?.margin?.bottom? `${node.style.margin.bottom}px`:undefined,
    marginLeft: node.style?.margin?.left? `${node.style.margin.left}px`:undefined,
    // Padding
    paddingTop: node.style?.padding?.top? `${node.style.padding.top}px`:undefined,
    paddingRight: node.style?.padding?.right? `${node.style.padding.right}px`:undefined,
    paddingBottom: node.style?.padding?.bottom? `${node.style.padding.bottom}px`:undefined,
    paddingLeft: node.style?.padding?.left? `${node.style.padding.left}px`:undefined,
    // Typography
    fontSize: node.style?.fontSize? `${node.style.fontSize}px`:'16px',
    color: isHovering? hoverColorValue:normalColor,
    fontWeight: node.style?.fontWeight||'inherit',
    textAlign: (node.style?.textAlign||'left') as 'left'|'center'|'right'|'justify',
    lineHeight: node.style?.lineHeight||'1.6',
    letterSpacing: node.style?.letterSpacing? `${node.style.letterSpacing}px`:'inherit',
    transition: 'color 0.3s ease'
  };

  const innerStyle: React.CSSProperties={
    margin: 0,
    lineHeight: node.style?.lineHeight||'1.6',
    color: isHovering? hoverColorValue:normalColor,
  };

  return (
    <div
      onClick={onEdit}
      style={containerStyle}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isHtmlContent? (
        <div style={innerStyle} dangerouslySetInnerHTML={{ __html: content }} />
      ):(
        <p style={innerStyle}>{content}</p>
      )}
    </div>
  );
};

export default TextWidget;
