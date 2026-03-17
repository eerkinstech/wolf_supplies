import React from 'react';
import { Node } from '../controls/types/index';

interface HeadingWidgetProps {
  node: Node;
  device?: 'desktop'|'tablet'|'mobile';
  isEditing?: boolean;
  onEdit?: () => void;
  cssStyle?: Record<string, any>;
}

export const HeadingWidget: React.FC<HeadingWidgetProps>=({ node, isEditing, onEdit, cssStyle={} }) => {
  const content=node.props?.content||'Heading';
  const level=(node.props?.level||'h2') as any;
  const [isHovering, setIsHovering]=React.useState(false);

  // Get normal color - from cssStyle (final merged style) - this is the priority, fallback to node.style, default to black
  const normalColor=cssStyle?.color||node.style?.color||'#000000';

  // Get hover color - from cssStyle or node.style
  const hoverColorValue=cssStyle?.hoverColor||node.style?.hoverColor||normalColor;

  // Build styles from node.style
  const containerStyle: React.CSSProperties={
    cursor: isEditing? 'pointer':'default',
    width: node.style?.width||'100%',
    fontSize: node.style?.fontSize? (typeof node.style.fontSize==='number'? `${node.style.fontSize}px`:node.style.fontSize):undefined,
    textAlign: (node.style?.textAlign as any)||'left',
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
    // Apply color to container so it's definitely applied
    color: normalColor
  };

  const headingStyle={
    margin: 0,
    cursor: isEditing? 'pointer':'default',
    fontSize: node.style?.fontSize,
    color: isHovering? hoverColorValue:normalColor,
    fontWeight: node.style?.fontWeight||'inherit',
    textAlign: node.style?.textAlign||'left',
    lineHeight: node.style?.lineHeight||'inherit',
    letterSpacing: node.style?.letterSpacing||'inherit',
    transition: 'color 0.3s ease'
  };

  const commonProps={
    onClick: onEdit,
    style: headingStyle,
    onMouseEnter: () => setIsHovering(true),
    onMouseLeave: () => setIsHovering(false)
  };

  const headingElement=(() => {
    switch (level) {
      case 'h1':
        return <h1 {...commonProps}>{content}</h1>;
      case 'h3':
        return <h3 {...commonProps}>{content}</h3>;
      case 'h4':
        return <h4 {...commonProps}>{content}</h4>;
      case 'h5':
        return <h5 {...commonProps}>{content}</h5>;
      case 'h6':
        return <h6 {...commonProps}>{content}</h6>;
      case 'h2':
      default:
        return <h2 {...commonProps}>{content}</h2>;
    }
  })();

  return (
    <div style={containerStyle} onClick={onEdit}>
      {headingElement}
    </div>
  );
};

export default HeadingWidget;