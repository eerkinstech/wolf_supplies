'use client';

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import BLOCK_REGISTRY from '../BlockBuilder/BlockRegistry';

/**
 * NodeRenderer - Recursively renders the node tree
 * Handles both layout nodes (section/container) and widget nodes
 * Supports responsive styles with media queries
 */
const NodeRenderer = ({
  node,
  isEditing = false,
  selectedNodeId = null,
  onSelectNode = null,
  mergedStyle = {}
}) => {
  const navigate = useNavigate();
  if (!node) return null;

  // Check if node is hidden - in edit mode, always render; in view mode, check hidden property
  if (!isEditing && node.advanced?.hidden === true) {
    return null;
  }

  const isSelected = node.id === selectedNodeId;
  const isContainer = ['section', 'column', 'root'].includes(node.kind);

  // Get block component if it's a widget
  const blockDef = BLOCK_REGISTRY[node.widgetType];
  const BlockComponent = blockDef?.component;

  // Generate unique class name for this node (for responsive styles)
  const nodeClassName = `node-${node.id}`;

  // Inject responsive CSS styles if they exist
  useEffect(() => {
    // Handle custom responsive styles
    if (node.responsive) {
      const tabletStyles = node.responsive.tablet?.style || {};
      const tabletAdvanced = node.responsive.tablet?.advanced || {};
      const mobileStyles = node.responsive.mobile?.style || {};
      const mobileAdvanced = node.responsive.mobile?.advanced || {};

      if (Object.keys(tabletStyles).length > 0 || Object.keys(tabletAdvanced).length > 0 ||
        Object.keys(mobileStyles).length > 0 || Object.keys(mobileAdvanced).length > 0) {
        const styleId = `responsive-styles-${node.id}`;

        const existing = document.getElementById(styleId);
        if (existing) existing.remove();

        let cssRules = '';

        // For image/video widgets, exclude styling properties that should only be on img/video tag
        const isImageWidget = node.widgetType === 'image';
        const isVideoWidget = node.widgetType === 'video';
        const excludeImageProps = ['borderWidth', 'borderStyle', 'borderColor', 'borderRadius', 'boxShadow', 'shadow', 'opacity', 'padding'];

        // Tablet styles (768px and below)
        if (Object.keys(tabletStyles).length > 0 || Object.keys(tabletAdvanced).length > 0) {
          const mergedTabletStyles = { ...tabletStyles, ...tabletAdvanced };
          // For image/video widgets, remove styling props
          if (isImageWidget || isVideoWidget) {
            excludeImageProps.forEach(prop => delete mergedTabletStyles[prop]);
          }
          const tabletCSS = styleObjectToCSS(mergedTabletStyles);
          const tabletPropsArray = [];

          // Handle each property and collect them
          for (const [key, value] of Object.entries(tabletCSS)) {
            const cssString = convertPropertyToCSS(key, value);
            // Split multiple properties and add each one
            const props = cssString.split(';').filter(p => p.trim());
            tabletPropsArray.push(...props);
          }

          const tabletProps = tabletPropsArray.map(p => p.includes('!important') ? p.trim() + ';' : p.trim() + ' !important;').join(' ');

          if (tabletProps) {
            cssRules += `@media (max-width: 768px) { .${nodeClassName} { ${tabletProps} } } `;
          }
        }

        // Mobile styles (480px and below)
        if (Object.keys(mobileStyles).length > 0 || Object.keys(mobileAdvanced).length > 0) {
          const mergedMobileStyles = { ...mobileStyles, ...mobileAdvanced };
          // For image/video widgets, remove styling props
          if (isImageWidget || isVideoWidget) {
            excludeImageProps.forEach(prop => delete mergedMobileStyles[prop]);
          }
          const mobileCSS = styleObjectToCSS(mergedMobileStyles);
          const mobilePropsArray = [];

          // Handle each property and collect them
          for (const [key, value] of Object.entries(mobileCSS)) {
            const cssString = convertPropertyToCSS(key, value);
            // Split multiple properties and add each one
            const props = cssString.split(';').filter(p => p.trim());
            mobilePropsArray.push(...props);
          }

          const mobileProps = mobilePropsArray.map(p => p.includes('!important') ? p.trim() + ';' : p.trim() + ' !important;').join(' ');

          if (mobileProps) {
            cssRules += `@media (max-width: 480px) { .${nodeClassName} { ${mobileProps} } } `;
          }
        }

        if (cssRules) {
          const styleEl = document.createElement('style');
          styleEl.id = styleId;
          styleEl.innerHTML = cssRules;
          document.head.appendChild(styleEl);
        }
      }
    }

    // Handle section grid responsiveness
    if (node.kind === 'section' && node.children && node.children.length > 0) {
      const numColumns = node.props?.numColumns || node.children.length || 1;
      const sectionStyleId = `section-responsive-${node.id}`;

      const existing = document.getElementById(sectionStyleId);
      if (existing) existing.remove();

      let sectionCss = '';
      // Tablet: reduce columns
      if (numColumns > 2) {
        sectionCss += `@media (max-width: 768px) { .${nodeClassName} { grid-template-columns: repeat(2, 1fr) !important; } } `;
      }
      // Mobile: single column
      sectionCss += `@media (max-width: 480px) { .${nodeClassName} { grid-template-columns: 1fr !important; } } `;

      // Add section-specific responsive styles if they exist
      if (node.responsive) {
        const tabletGap = node.responsive.tablet?.style?.gap;
        const mobileGap = node.responsive.mobile?.style?.gap;

        if (tabletGap) {
          const gapVal = typeof tabletGap === 'number' ? `${tabletGap}px` : tabletGap;
          sectionCss += `@media (max-width: 768px) { .${nodeClassName} { gap: ${gapVal} !important; } } `;
        }

        if (mobileGap) {
          const gapVal = typeof mobileGap === 'number' ? `${mobileGap}px` : mobileGap;
          sectionCss += `@media (max-width: 480px) { .${nodeClassName} { gap: ${gapVal} !important; } } `;
        }
      }

      if (sectionCss) {
        const styleEl = document.createElement('style');
        styleEl.id = sectionStyleId;
        styleEl.innerHTML = sectionCss;
        document.head.appendChild(styleEl);
      }
    }

    return () => {
      const styleIds = [
        `responsive-styles-${node.id}`,
        `section-responsive-${node.id}`
      ];
      styleIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.parentElement) {
          el.parentElement.removeChild(el);
        }
      });
    };
  }, [node.responsive, node.id, node.kind, node.children, node.props?.numColumns, nodeClassName]);

  // Merge responsive styles (desktop first, then overrides)
  // For containers (section, column), don't inherit parent styles
  // Only use node's own styles and advanced properties
  const finalStyle = isContainer
    ? {
      ...node.style,
      ...node.advanced,
      // For columns, include gap from props if not in style
      ...(node.kind === 'column' && !node.style?.gap && node.props?.gap && { gap: node.props.gap })
    }
    : {
      ...mergedStyle,
      ...node.style,
      ...node.advanced
    };

  // Build className for selection outline in edit mode
  let className = '';
  if (isEditing) {
    className += 'relative ';
    if (isSelected) {
      className += 'ring-2 ring-blue-500 outline-offset-2 ';
    } else {
      className += 'hover:ring-2 hover:ring-gray-500 hover:ring-opacity-50 ';
    }
  }

  // Add responsive class name to all nodes for CSS media queries
  className += nodeClassName;

  // Inline styles from node.style
  const inlineStyles = styleObjectToCSS(finalStyle);

  // Container nodes (section, container, column)
  if (isContainer && node.kind !== 'root') {

    // Use ONLY database styles - don't add hardcoded styles
    const containerStyle = { ...inlineStyles };

    // For columns, apply alignment properties from props
    if (node.kind === 'column') {
      const verticalAlign = node.props?.verticalAlign || 'flex-start';
      const horizontalAlign = node.props?.horizontalAlign || 'stretch';

      // Map vertical align to CSS alignItems
      const alignItemsMap = {
        'flex-start': 'flex-start',
        'center': 'center',
        'flex-end': 'flex-end',
        'stretch': 'stretch',
        'start': 'flex-start',
        'end': 'flex-end'
      };

      // Map horizontal align to CSS justifyContent
      const justifyContentMap = {
        'flex-start': 'flex-start',
        'center': 'center',
        'flex-end': 'flex-end',
        'space-between': 'space-between',
        'space-around': 'space-around',
        'start': 'flex-start',
        'end': 'flex-end'
      };

      containerStyle.alignItems = alignItemsMap[verticalAlign] || verticalAlign;
      if (horizontalAlign && horizontalAlign !== '') {
        containerStyle.justifyContent = justifyContentMap[horizontalAlign] || horizontalAlign;
      }

      // Ensure column display is flex
      containerStyle.display = 'flex';
      containerStyle.flexDirection = 'column';
      // Prevent parent section's background from showing through column
      // If column doesn't have its own background, make it transparent
      if (!inlineStyles.backgroundImage && !inlineStyles.backgroundColor) {
        containerStyle.backgroundColor = 'transparent';
      }
    }

    // For sections with background images, ensure proper positioning and visibility
    if (node.kind === 'section' && inlineStyles.backgroundImage) {
      containerStyle.position = 'relative';
      containerStyle.backgroundSize = containerStyle.backgroundSize || 'cover';
      containerStyle.backgroundPosition = containerStyle.backgroundPosition || 'center';
      containerStyle.backgroundRepeat = containerStyle.backgroundRepeat || 'no-repeat';
      containerStyle.backgroundAttachment = containerStyle.backgroundAttachment || 'scroll';
      containerStyle.minHeight = containerStyle.minHeight || '300px';
      // Ensure grid display works with background
      containerStyle.display = containerStyle.display || 'grid';
    }

    return (
      <div
        key={node.id}
        data-node-id={node.id}
        data-node-type={node.kind}
        className={`${className} ${node.props?.className || ''}`}
        style={containerStyle}
        onClick={(e) => {
          e.stopPropagation();
          if (isEditing && onSelectNode) {
            onSelectNode(node.id);
          }
        }}
        role={isEditing ? 'button' : undefined}
        tabIndex={isEditing ? 0 : undefined}
      >
        {/* Render children directly without extra wrapper to preserve layout styles */}
        {node.children && node.children.length > 0
          ? node.children.map((child) => (
            <NodeRenderer
              key={child.id}
              node={child}
              isEditing={isEditing}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              mergedStyle={{}}
            />
          ))
          : isEditing && (
            <div className="py-8 text-center text-gray-400 italic">
              Drop widgets here
            </div>
          )}
      </div>
    );
  }

  // Root node - just render children without wrapper
  if (node.kind === 'root') {
    return (
      <div key={node.id} data-node-id={node.id} data-node-type="root">
        {node.children && node.children.length > 0
          ? node.children.map((child) => (
            <NodeRenderer
              key={child.id}
              node={child}
              isEditing={isEditing}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              mergedStyle={{}}
            />
          ))
          : isEditing && (
            <div className="py-12 text-center text-gray-400 text-lg italic">
              No sections yet. Add from left panel.
            </div>
          )}
      </div>
    );
  }

  // Widget nodes - render actual component
  if (BlockComponent) {
    // For image widgets, keep border styles
    // For other widgets, exclude border properties (they're for columns/sections)
    const shouldExcludeBorder = node.widgetType !== 'image';
    const cleanStyles = shouldExcludeBorder
      ? (() => {
        const { borderWidth, borderStyle, borderColor, ...rest } = inlineStyles;
        return rest;
      })()
      : inlineStyles;

    return (
      <div
        key={node.id}
        data-node-id={node.id}
        data-node-type={node.kind}
        className={className}
        style={cleanStyles}
        onClick={(e) => {
          e.stopPropagation();
          if (isEditing && onSelectNode) {
            onSelectNode(node.id);
          }
        }}
        role={isEditing ? 'button' : undefined}
        tabIndex={isEditing ? 0 : undefined}
      >
        <BlockComponent
          id={node.id}
          {...node.props}
          isEditing={isEditing}
          isSelected={isSelected}
        />
      </div>
    );
  }

  // Handle basic widget types (heading, text, button, etc.)
  if (node.kind === 'widget' && node.widgetType) {
    return renderBasicWidget(node, className, inlineStyles, isSelected, isEditing, onSelectNode, navigate);
  }

  // Fallback: Unknown widget type
  return (
    <div
      key={node.id}
      data-node-id={node.id}
      data-node-type={node.kind}
      className={`${className} p-4 bg-gray-100 border-2 border-dashed border-gray-400 rounded`}
      onClick={(e) => {
        e.stopPropagation();
        if (isEditing && onSelectNode) {
          onSelectNode(node.id);
        }
      }}
    >
      <p className="text-gray-600 font-semibold">
        Unknown widget: <code>{node.widgetType || node.kind}</code>
      </p>
      {isEditing && (
        <p className="text-sm text-gray-900 mt-2">
          Register this widget in BlockRegistry
        </p>
      )}
    </div>
  );
};

/**
 * Render basic widget types (heading, text, button, etc.)
 */
function renderBasicWidget(node, className, inlineStyles, isSelected, isEditing, onSelectNode, navigate) {
  const { widgetType, props = {}, style = {} } = node;

  // For image/video widgets, exclude styling properties that go on the tag
  // For other widgets, exclude border properties (they're for columns/sections)
  const isImageWidget = widgetType === 'image';
  const isVideoWidget = widgetType === 'video';
  const shouldExcludeBorder = widgetType !== 'image' && widgetType !== 'video';

  const cleanStyles = shouldExcludeBorder
    ? (() => {
      const { borderWidth, borderStyle, borderColor, ...rest } = inlineStyles;
      return rest;
    })()
    : (() => {
      // For image/video widgets, exclude all styling that goes directly on tag
      const { borderWidth, borderStyle, borderColor, borderRadius, boxShadow, shadow, opacity, padding, ...rest } = inlineStyles;
      return rest;
    })();

  const baseProps = {
    'data-node-id': node.id,
    'data-node-type': 'widget',
    className: `${className} ${props.className || ''}`,
    style: cleanStyles,
    onClick: (e) => {
      e.stopPropagation();
      if (isEditing && onSelectNode) {
        onSelectNode(node.id);
      }
    },
    role: isEditing ? 'button' : undefined,
    tabIndex: isEditing ? 0 : undefined
  };
switch (widgetType) {
    case 'heading': {
      const level = props.level || 'h1';
      const [isHovering, setIsHovering] = React.useState(false);

      // Font size ONLY from Style Tab - no level-based defaults
      const normalColor = node.style?.color || '#000000';
      const hoverColor = node.style?.hoverColor || normalColor;

      const headingStyle = {
        ...cleanStyles,
        color: isHovering ? hoverColor : normalColor,
        cursor: props.link ? 'pointer' : 'default',
        transition: 'color 0.3s ease',
        lineHeight: node.style?.lineHeight || 'inherit'
      };

      const handleClick = (e) => {
        e.stopPropagation();
        if (isEditing && onSelectNode) {
          onSelectNode(node.id);
        } else if (!isEditing && props.link) {
          e.preventDefault();
          if (props.openNewTab) {
            // Open in new tab
            window.open(props.link, '_blank');
          } else {
            // Same tab - use React Router navigate for no reload
            if (props.link.startsWith('http')) {
              window.location.href = props.link;
            } else {
              // Internal link - use Next.js router
              navigate(props.link);
            }
          }
        }
      };

      // Render heading dynamically based on level
      const headingElements = {
        h1: <h1 key={node.id} {...baseProps} style={headingStyle} onClick={handleClick} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>{props.content || 'Heading'}</h1>,
        h2: <h2 key={node.id} {...baseProps} style={headingStyle} onClick={handleClick} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>{props.content || 'Heading'}</h2>,
        h3: <h3 key={node.id} {...baseProps} style={headingStyle} onClick={handleClick} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>{props.content || 'Heading'}</h3>,
        h4: <h4 key={node.id} {...baseProps} style={headingStyle} onClick={handleClick} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>{props.content || 'Heading'}</h4>,
        h5: <h5 key={node.id} {...baseProps} style={headingStyle} onClick={handleClick} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>{props.content || 'Heading'}</h5>,
        h6: <h6 key={node.id} {...baseProps} style={headingStyle} onClick={handleClick} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>{props.content || 'Heading'}</h6>,
      };
      return headingElements[level] || headingElements.h1;
    }

    case 'text': {
      const content = props.content || 'Text content';
      const [isHovering, setIsHovering] = React.useState(false);
      // Check if content contains HTML (from RichTextEditor)
      const isHtmlContent = typeof content === 'string' && /<[^>]*>/.test(content);

      const normalColor = node.style?.color || '#000000';
      const hoverColor = node.style?.hoverColor || normalColor;

      const textStyle = {
        ...cleanStyles,
        color: isHovering ? hoverColor : normalColor,
        cursor: 'default',
        transition: 'color 0.3s ease',
        lineHeight: node.style?.lineHeight || 'inherit'
      };

      const handleClick = (e) => {
        // Handle clicks on links inside HTML content (from RichTextEditor)
        // Use closest() to find parent <a> tag even if clicking on child elements
        const linkElement = e.target.closest('a');

        if (!isEditing && linkElement) {
          e.preventDefault();
          const href = linkElement.getAttribute('href');
          const target = linkElement.getAttribute('target');

          if (href) {
            if (target === '_blank') {
              window.open(href, '_blank');
            } else {
              if (href.startsWith('http')) {
                window.location.href = href;
              } else {
                // Internal link - use Next.js router
                navigate(href);
              }
            }
          }
        } else {
          e.stopPropagation();
          if (isEditing && onSelectNode) {
            onSelectNode(node.id);
          }
        }
      };

      return isHtmlContent ? (
        <div
          key={node.id}
          {...baseProps}
          style={textStyle}
          onClick={handleClick}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <p key={node.id} {...baseProps} style={textStyle} onClick={handleClick} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
          {content}
        </p>
      );
    }

    case 'button': {
      const buttonText = props.text || 'Button';
      const buttonIcon = props.icon || '';
      const buttonLink = props.link || '#';
      const buttonStyle = props.style || 'primary';

      // Use individual padding values
      const paddingTop = node.style?.paddingTop !== undefined ? node.style.paddingTop : 12;
      const paddingRight = node.style?.paddingRight !== undefined ? node.style.paddingRight : 24;
      const paddingBottom = node.style?.paddingBottom !== undefined ? node.style.paddingBottom : 12;
      const paddingLeft = node.style?.paddingLeft !== undefined ? node.style.paddingLeft : 24;

      const alignment = node.style?.alignment || 'center';
      const borderRadius = node.style?.borderRadius !== undefined ? node.style.borderRadius : 6;
      const [isHoveringBtn, setIsHoveringBtn] = React.useState(false);

      const styleClasses = {
        primary: 'bg-gray-800 text-white hover:bg-black',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        outline: 'border-2 border-gray-800 text-gray-700 hover:bg-gray-100'
      };

      // Background colors for each style
      const bgColors = {
        primary: node.style?.bgColor || '#2563eb',
        secondary: node.style?.bgColor || '#d1d5db',
        outline: 'transparent'
      };

      // Hover background colors
      const hoverBgColors = {
        primary: node.style?.hoverBgColor || '#1d4ed8',
        secondary: node.style?.hoverBgColor || '#e5e7eb',
        outline: 'rgba(59, 130, 246, 0.1)'
      };

      // Text colors
      const textColors = {
        primary: node.style?.textColor || '#ffffff',
        secondary: node.style?.textColor || '#111827',
        outline: node.style?.textColor || '#2563eb'
      };

      // Hover text colors
      const hoverTextColors = {
        primary: node.style?.textHoverColor || '#ffffff',
        secondary: node.style?.textHoverColor || '#111827',
        outline: node.style?.textHoverColor || '#1d4ed8'
      };

      // Helper function to convert alignment to flex justify-content
      const getJustifyContent = (align) => {
        switch (align) {
          case 'left': return 'flex-start';
          case 'right': return 'flex-end';
          case 'center': return 'center';
          case 'justify': return 'space-between';
          default: return 'center';
        }
      };

      // Icon styling
      const iconSize = node.style?.iconSize || 16;
      const iconPadding = node.style?.iconPadding || 6;
      const iconGap = node.style?.iconGap || 8;
      const iconBorderRadius = node.style?.iconBorderRadius || 0;
      const iconPosition = node.style?.iconPosition || 'left';
      const iconColor = isHoveringBtn ? (node.style?.iconHoverColor || '#ffffff') : (node.style?.iconColor || '#ffffff');
      const iconBgColor = isHoveringBtn ? (node.style?.iconHoverBackgroundColor || 'transparent') : (node.style?.iconBackgroundColor || 'transparent');

      // Create container style for alignment using flex
      const containerStyle = {
        display: 'flex',
        justifyContent: getJustifyContent(alignment),
        alignItems: 'center',
        width: '100%'
      };

      const buttonInlineStyle = {
        padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
        fontSize: props.fontSize ? `${props.fontSize}px` : '16px',
        borderRadius: `${borderRadius}px`,
        border: buttonStyle === 'outline' ? '2px solid currentColor' : 'none',
        color: isHoveringBtn ? hoverTextColors[buttonStyle] : textColors[buttonStyle],
        backgroundColor: isHoveringBtn ? hoverBgColors[buttonStyle] : (bgColors[buttonStyle] || '#2563eb'),
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: `${iconGap}px`,
        flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row'
      };

      return (
        <div
          style={containerStyle}
          onClick={(e) => {
            e.stopPropagation();
            if (isEditing && onSelectNode) {
              onSelectNode(node.id);
            }
          }}
          data-node-id={node.id}
          data-node-type={node.kind}
        >
          <button
            style={buttonInlineStyle}
            className="transition"
            data-node-id={node.id}
            data-node-type={node.kind}
            onMouseEnter={() => setIsHoveringBtn(true)}
            onMouseLeave={() => setIsHoveringBtn(false)}
            onClick={(e) => {
              e.stopPropagation();
              if (isEditing && onSelectNode) {
                onSelectNode(node.id);
              } else if (!isEditing && buttonLink && buttonLink !== '#') {
                e.preventDefault();
                if (props.openNewTab) {
                  // Open in new tab
                  window.open(buttonLink, '_blank');
                } else {
                  // Same tab - use React Router navigate for no reload
                  if (buttonLink.startsWith('http')) {
                    window.location.href = buttonLink;
                  } else {
                    // Internal link - use Next.js router
                    navigate(buttonLink);
                  }
                }
              }
            }}
          >
            {buttonIcon && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: `${iconSize + iconPadding * 2}px`,
                height: `${iconSize + iconPadding * 2}px`,
                padding: `${iconPadding}px`,
                borderRadius: `${iconBorderRadius}px`,
                backgroundColor: iconBgColor,
                color: iconColor,
                transition: 'all 0.3s ease',
                fontSize: `${iconSize}px`
              }}>
                <i className={buttonIcon}></i>
              </span>
            )}
            {buttonText}
          </button>
        </div>
      );
    }

    case 'image':
      // Apply all styles directly to img tag
      // For image widgets, get styling from inlineStyles (not cleanStyles which excludes them)
      const imgStyle = {
        width: inlineStyles.width || '100%',
        height: inlineStyles.height || 'auto',
        display: 'inline-block',
        opacity: inlineStyles.opacity || 1,
        borderRadius: inlineStyles.borderRadius || '0px',
        border: inlineStyles.borderWidth ? `${inlineStyles.borderWidth} solid ${inlineStyles.borderColor || '#000000'}` : 'none',
        boxShadow: inlineStyles.boxShadow || 'none',
        padding: inlineStyles.padding || '0px',
        objectFit: inlineStyles.objectFit || 'cover',
        objectPosition: inlineStyles.objectPosition || 'center'
      };

      return (
        <div {...baseProps} style={{ textAlign: 'center' }}>
          <img
            src={props.src || '/placeholder.png'}
            alt={props.alt || 'Image'}
            style={imgStyle}
          />
        </div>
      );

    case 'video': {
      const videoType = props.videoType || 'youtube';
      const videoUrl = props.videoUrl || '';
      const videoUpload = props.videoUpload || '';
      const iframeCode = props.iframeCode || '';
      const videoId = props.videoId || 'dQw4w9WgXcQ';
      const aspectRatio = props.aspectRatio || '16:9';
      const paddingTop = node.style?.paddingTop || 0;
      const paddingRight = node.style?.paddingRight || 0;
      const paddingBottom = node.style?.paddingBottom || 0;
      const paddingLeft = node.style?.paddingLeft || 0;

      // Get aspect ratio padding
      const getAspectRatioPadding = (ratio) => {
        const [w, h] = ratio.split(':').map(Number);
        return (h / w) * 100;
      };
      const paddingPercentage = getAspectRatioPadding(aspectRatio);

      // Get embed URL
      const getEmbedUrl = () => {
        if (videoType === 'youtube') {
          let youtubeId = videoId;
          if (videoUrl) {
            const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
            youtubeId = match ? match[1] : videoUrl;
          }
          return `https://www.youtube.com/embed/${youtubeId}?autoplay=${props.autoplay ? 1 : 0}&controls=${props.showControls !== false ? 1 : 0}`;
        } else if (videoType === 'vimeo') {
          let vimeoId = videoId;
          if (videoUrl) {
            const match = videoUrl.match(/vimeo\.com\/(\d+)/);
            vimeoId = match ? match[1] : videoUrl;
          }
          return `https://player.vimeo.com/video/${vimeoId}?autoplay=${props.autoplay ? 1 : 0}`;
        } else if (videoType === 'upload') {
          return videoUpload;
        }
        return videoUrl;
      };

      // Layout properties only - no visual styling
      const videoWrapperStyle = {
        position: 'relative',
        width: inlineStyles.width || '100%',
        maxWidth: '100%',
        paddingBottom: `calc(${paddingPercentage}% + ${paddingBottom}px)`,
        height: 0,
        overflow: 'hidden',
        paddingTop: `${paddingTop}px`,
        paddingRight: `${paddingRight}px`,
        paddingLeft: `${paddingLeft}px`,
        boxSizing: 'border-box',
        borderRadius: inlineStyles.borderRadius || '0px',
        boxShadow: inlineStyles.boxShadow || 'none',
      };

      // Apply all styling directly to video/iframe tag
      const videoStyle = {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        borderRadius: inlineStyles.borderRadius || '0px',
        border: inlineStyles.borderWidth && inlineStyles.borderWidth !== '0px' ? `${inlineStyles.borderWidth} solid ${inlineStyles.borderColor || '#000000'}` : 'none',
        padding: inlineStyles.padding || '0px',
        opacity: inlineStyles.opacity !== undefined ? inlineStyles.opacity : 1,
        display: 'block',
      };

      if (videoType === 'iframe' && iframeCode) {
        return (
          <div
            {...baseProps}
            style={videoWrapperStyle}
            dangerouslySetInnerHTML={{ __html: iframeCode }}
          />
        );
      }

      if (videoType === 'html5' || videoType === 'url' || videoType === 'upload') {
        return (
          <div {...baseProps} style={videoWrapperStyle}>
            <video
              style={videoStyle}
              controls={props.showControls !== false}
              autoPlay={props.autoplay || false}
              loop={props.loop || false}
            >
              <source src={getEmbedUrl()} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }

      return (
        <div {...baseProps} style={videoWrapperStyle}>
          <iframe
            style={videoStyle}
            src={getEmbedUrl()}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    case 'richtext':
      return (
        <div
          {...baseProps}
          dangerouslySetInnerHTML={{ __html: props.content || '' }}
        />
      );

    case 'divider': {
      // Divider properties are stored in node.style, not props
      const style = node.style || {};
      const dividerType = style.dividerType || 'simple';
      const lineStyle = style.lineStyle || 'solid';
      const thickness = style.thickness || 2;
      const color = style.color || '#cccccc';
      const width = style.width || '100%';
      const alignment = style.alignment || 'center';
      const gap = style.gap || 0;

      // Horizontal and vertical padding/spacing
      const paddingTop = style.paddingTop || 0;
      const paddingBottom = style.paddingBottom || 0;
      const paddingLeft = style.paddingLeft || 0;
      const paddingRight = style.paddingRight || 0;

      // Text divider props
      const text = style.text || '';
      const textColor = style.textColor || '#666666';
      const textSize = style.textSize || 14;
      const textWeight = style.textWeight || 'normal';
      const textGap = style.textGap || 16;

      // Dotted divider props
      const dotSize = style.dotSize || 6;
      const dotSpacing = style.dotSpacing || 8;
const alignmentMap = {
        'left': 'flex-start',
        'center': 'center',
        'right': 'flex-end'
      };

      const justifyContent = alignmentMap[alignment] || 'center';

      const containerStyle = {
        display: 'flex',
        justifyContent: justifyContent,
        alignItems: 'center',
        width: '100%',
        gap: `${gap}px`,
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
        paddingLeft: `${paddingLeft}px`,
        paddingRight: `${paddingRight}px`,
        minHeight: '20px',
        ...cleanStyles
      };

      // ===== SIMPLE DIVIDER =====
      if (dividerType === 'simple') {
const dividerStyle = {
          width: width,
          height: lineStyle === 'solid' ? `${thickness}px` : '0px',
          backgroundColor: lineStyle === 'solid' ? color : 'transparent',
          border: 'none',
          ...(lineStyle !== 'solid' && {
            borderStyle: lineStyle,
            borderWidth: `${thickness}px`,
            borderColor: color,
            height: '0px',
          }),
          flexShrink: 0,
        };
return (
          <div style={containerStyle} {...baseProps}>
            <div style={dividerStyle} />
          </div>
        );
      }

      // ===== DOTTED DIVIDER =====
      if (dividerType === 'dotted') {
const dotDividerStyle = {
          width: width === '100%' ? '100%' : width,
          display: 'flex',
          gap: `${dotSpacing}px`,
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
        };

        const dotStyle = {
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block',
          flexShrink: 0,
        };

        // For 100% width, use more dots to fill the space
        // For fixed width, calculate based on width
        let dotsCount = 15; // Default for 100% width

        if (width !== '100%') {
          const containerWidth = typeof width === 'string' ? parseInt(width) : width;
          dotsCount = Math.max(3, Math.floor(containerWidth / (dotSize + dotSpacing)));
        }

        return (
          <div style={containerStyle} {...baseProps}>
            <div style={dotDividerStyle}>
              {Array.from({ length: dotsCount }).map((_, index) => (
                <div key={index} style={dotStyle} />
              ))}
            </div>
          </div>
        );
      }

      // ===== TEXT DIVIDER =====
      if (dividerType === 'text' && text) {
        const fontWeightMap = {
          normal: 400,
          'semi-bold': 600,
          bold: 700,
        };

        const textDividerStyle = {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: `${textGap}px`,
          width: width,
          flexShrink: 0,
        };

        const lineStyleObj = {
          flex: 1,
          borderTop: `${thickness}px solid ${color}`,
          height: '0',
        };

        const textStyleObj = {
          color: textColor,
          fontSize: `${textSize}px`,
          fontWeight: fontWeightMap[textWeight] || 400,
          whiteSpace: 'nowrap',
          userSelect: 'none',
        };

        return (
          <div style={containerStyle} {...baseProps}>
            <div style={textDividerStyle}>
              <div style={lineStyleObj} />
              <span style={textStyleObj}>{text}</span>
              <div style={lineStyleObj} />
            </div>
          </div>
        );
      }

      // Default to simple
      const defaultDividerStyle = {
        borderTop: `${thickness}px ${lineStyle} ${color}`,
        width: width,
        flex: 1,
      };
      return (
        <div style={containerStyle} {...baseProps}>
          <div style={defaultDividerStyle} />
        </div>
      );
    }

    case 'iconlist': {
      // Get items from props
      const items = props.items || [];

      const style = node.style || {};
      const iconPosition = style.iconPosition || 'left';
      const itemsLayout = style.itemsLayout || 'vertical';

      // Use the exact alignment values from style (already in flexbox format)
      const containerAlignment = style.containerAlignment || 'flex-start';
      const itemAlignment = style.itemAlignment || 'flex-start';
      const itemsVerticalAlign = style.itemsVerticalAlign || 'center';

      // Get spacing values
      const containerGap = style.gap || 16;
      const itemGap = style.itemGap || 12;
      const descriptionGap = style.descriptionGap || 4;

      // Get styling values
      const iconSize = style.iconSize || 24;
      const iconColor = style.iconColor || 'var(--color-accent-primary)';
      const iconPadding = style.iconPadding || 8;
      const iconBgColor = style.iconBackgroundColor || 'transparent';
      const iconBgSize = iconSize + (iconPadding * 2);
      const iconBorderRadius = style.iconBorderRadius || '0px';

      const headingSize = style.headingFontSize || 18;
      const headingColor = style.headingColor || '#000000';
      const headingWeight = style.headingFontWeight || '600';

      const textSize = style.textFontSize || 14;
      const textColor = style.textColor || '#666666';

      // Get item styling values
      const itemBgColor = style.itemBackgroundColor || 'transparent';
      const itemBorderRadius = style.itemBorderRadius || 0;
      const itemBorderWidth = style.itemBorderWidth || 0;
      const itemBorderStyle = style.itemBorderStyle || 'solid';
      const itemBorderColor = style.itemBorderColor || '#000000';
      const itemShadowOffsetX = style.itemShadowOffsetX || 0;
      const itemShadowOffsetY = style.itemShadowOffsetY || 0;
      const itemShadowBlur = style.itemShadowBlur || 0;
      const itemShadowSpread = style.itemShadowSpread || 0;
      const itemShadowColor = style.itemShadowColor || 'rgba(0, 0, 0, 0.1)';
      const itemWidth = style.itemWidth || 'auto';
      const itemPadding = style.itemPadding || 16;
      const itemMargin = style.itemMargin || 0;

      // Container styles
      const containerStyle = {
        display: 'flex',
        flexDirection: itemsLayout === 'horizontal' ? 'row' : 'column',
        gap: `${containerGap}px`,
        width: '100%',
        flexWrap: 'wrap',
        justifyContent: containerAlignment,
        alignItems: itemsLayout === 'horizontal' ? itemsVerticalAlign : 'center',
      };

      // Get hover styling values
      const itemBgHover = style.itemBackgroundHover || itemBgColor;
      const iconColorHover = style.iconColorHover || iconColor;
      const iconBgHover = style.iconBackgroundHover || iconBgColor;
      const headingHover = style.headingColorHover || headingColor;
      const textHover = style.textColorHover || textColor;
      const hoverShadowOffsetX = style.itemHoverShadowOffsetX || 0;
      const hoverShadowOffsetY = style.itemHoverShadowOffsetY || 5;
      const hoverShadowBlur = style.itemHoverShadowBlur || 10;
      const hoverShadowSpread = style.itemHoverShadowSpread || 0;
      const hoverShadowColor = style.itemHoverShadowColor || 'rgba(0, 0, 0, 0.2)';

      // Generate unique class name for this widget instance
      const widgetClass = `iconlist-${node.id || 'widget'}`;

      // Generate hover CSS - apply to individual items, not the whole widget
      const hoverCSS = `
        .${widgetClass}-item:hover {
          background-color: ${itemBgHover} !important;
          box-shadow: ${hoverShadowBlur > 0 ? `${hoverShadowOffsetX}px ${hoverShadowOffsetY}px ${hoverShadowBlur}px ${hoverShadowSpread}px ${hoverShadowColor}` : 'none'} !important;
        }
        .${widgetClass}-item:hover .iconlist-icon {
          color: ${iconColorHover} !important;
          background-color: ${iconBgHover} !important;
        }
        .${widgetClass}-item:hover .iconlist-heading {
          color: ${headingHover} !important;
        }
        .${widgetClass}-item:hover .iconlist-text {
          color: ${textHover} !important;
        }
      `;
      const itemContainerStyle = {
        display: 'flex',
        flexDirection: iconPosition === 'top' ? 'column' : 'row',
        gap: `${itemGap}px`,
        alignItems: itemAlignment,
        justifyContent: 'flex-start',
        width: itemWidth > 0 ? `${itemWidth}px` : (itemsLayout === 'horizontal' ? 'auto' : '100%'),
        flex: itemWidth > 0 ? 'none' : (itemsLayout === 'horizontal' ? '0 1 auto' : '1'),
        backgroundColor: itemBgColor,
        borderRadius: `${itemBorderRadius}px`,
        border: itemBorderWidth > 0 ? `${itemBorderWidth}px ${itemBorderStyle} ${itemBorderColor}` : 'none',
        boxShadow: itemShadowBlur > 0 ? `${itemShadowOffsetX}px ${itemShadowOffsetY}px ${itemShadowBlur}px ${itemShadowSpread}px ${itemShadowColor}` : 'none',
        padding: `${itemPadding}px`,
        margin: `${itemMargin}px`,
      };

      // Icon style
      const iconStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${iconBgSize}px`,
        height: `${iconBgSize}px`,
        padding: `${iconPadding}px`,
        borderRadius: iconBorderRadius,
        backgroundColor: iconBgColor,
        color: iconColor,
        fontSize: `${iconSize}px`,
        flexShrink: 0,
        minHeight: `${iconBgSize}px`,
        minWidth: `${iconBgSize}px`,
      };

      // Content wrapper style
      const contentStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: `${descriptionGap}px`,
        flex: 1,
      };

      // Heading style
      const headingStyle = {
        fontSize: `${headingSize}px`,
        fontWeight: headingWeight,
        color: headingColor,
        margin: 0,
        padding: 0,
        lineHeight: '1.2',
        wordBreak: 'break-word',
      };

      // Text style
      const textStyle = {
        fontSize: `${textSize}px`,
        color: textColor,
        margin: 0,
        padding: 0,
        lineHeight: '1.4',
        wordBreak: 'break-word',
      };

      // Create container props ensuring flexbox properties aren't overridden by baseProps
      const containerProps = {
        ...baseProps,
        className: `${widgetClass} ${baseProps?.className || ''}`,
        style: {
          ...containerStyle,
          ...baseProps?.style,
        }
      };
      // Re-apply critical flexbox properties to ensure they override any conflicting styles
      containerProps.style.display = 'flex';
      containerProps.style.flexDirection = containerStyle.flexDirection;
      containerProps.style.justifyContent = containerAlignment;
      containerProps.style.alignItems = containerStyle.alignItems;
      containerProps.style.gap = containerStyle.gap;
      containerProps.style.width = '100%';
      containerProps.style.flexWrap = 'wrap';

      return (
        <>
          <style>{hoverCSS}</style>
          <div {...containerProps}>
            {items.map((item, index) => (
              <div key={index} className={`${widgetClass}-item`} style={itemContainerStyle}>
                {item.icon && (
                  <div className="iconlist-icon" style={iconStyle}>
                    <i className={item.icon} />
                  </div>
                )}
                <div style={contentStyle}>
                  {item.heading && (
                    <h3 className="iconlist-heading" style={headingStyle}>{item.heading}</h3>
                  )}
                  {item.text && (
                    <p className="iconlist-text" style={textStyle}>{item.text}</p>
                  )}
                  {item.link && (
                    <a
                      href={item.link}
                      target={item.openNewTab ? '_blank' : '_self'}
                      rel={item.openNewTab ? 'noopener noreferrer' : ''}
                      style={{
                        color: 'var(--color-accent-primary)',
                        textDecoration: 'none',
                        fontSize: `${textSize}px`,
                        marginTop: '4px',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        if (item.link.startsWith('/')) {
                          e.preventDefault();
                          navigate(item.link);
                        }
                      }}
                    >
                      {item.link}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }

    case 'icon': {
      // Get icon from props
      const icon = props.icon || 'fas fa-star';

      const style = node.style || {};
      const alignment = style.alignment || 'center';
      const width = style.width || '';
      const marginObj = style.margin || { top: '', right: '', bottom: '', left: '' };
      const marginTop = marginObj?.top || '0';
      const marginRight = marginObj?.right || '0';
      const marginBottom = marginObj?.bottom || '0';
      const marginLeft = marginObj?.left || '0';

      // Get icon styling values
      const iconSize = style.iconSize || 48;
      const iconColor = style.iconColor || 'var(--color-accent-primary)';
      const iconBgColor = style.iconBackgroundColor || 'transparent';
      const iconPadding = style.iconPadding || 0;
      const iconBgSize = iconSize + (iconPadding * 2);
      const iconBorderRadius = style.iconBorderRadius || 0;

      // Border styles
      const iconBorderWidth = style.iconBorderWidth || 0;
      const iconBorderStyle = style.iconBorderStyle || 'solid';
      const iconBorderColor = style.iconBorderColor || '#000000';

      // Shadow styles
      const iconShadowOffsetX = style.iconShadowOffsetX || 0;
      const iconShadowOffsetY = style.iconShadowOffsetY || 0;
      const iconShadowBlur = style.iconShadowBlur || 0;
      const iconShadowSpread = style.iconShadowSpread || 0;
      const iconShadowColor = style.iconShadowColor || 'rgba(0, 0, 0, 0.1)';

      // Hover styles
      const iconColorHover = style.iconColorHover || iconColor;
      const iconBgHover = style.iconBackgroundHover || iconBgColor;
      const hoverShadowOffsetX = style.iconHoverShadowOffsetX || 0;
      const hoverShadowOffsetY = style.iconHoverShadowOffsetY || 5;
      const hoverShadowBlur = style.iconHoverShadowBlur || 10;
      const hoverShadowSpread = style.iconHoverShadowSpread || 0;
      const hoverShadowColor = style.iconHoverShadowColor || 'rgba(0, 0, 0, 0.2)';

      // Generate unique class name for this widget instance
      const widgetClass = `icon-${node.id || 'widget'}`;

      // Generate hover CSS
      const hoverCSS = `
        .${widgetClass}:hover {
          color: ${iconColorHover} !important;
          background-color: ${iconBgHover} !important;
          box-shadow: ${hoverShadowBlur > 0 ? `${hoverShadowOffsetX}px ${hoverShadowOffsetY}px ${hoverShadowBlur}px ${hoverShadowSpread}px ${hoverShadowColor}` : 'none'} !important;
        }
      `;

      // Container style
      const containerStyle = {
        display: 'flex',
        justifyContent: alignment,
        width: width ? width : '100%',
        marginTop: marginTop || '0',
        marginRight: marginRight || '0',
        marginBottom: marginBottom || '0',
        marginLeft: marginLeft || '0',
      };

      // Icon style
      const iconStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${iconBgSize}px`,
        height: `${iconBgSize}px`,
        padding: `${iconPadding}px`,
        borderRadius: `${iconBorderRadius}px`,
        backgroundColor: iconBgColor,
        color: iconColor,
        fontSize: `${iconSize}px`,
        border: iconBorderWidth > 0 ? `${iconBorderWidth}px ${iconBorderStyle} ${iconBorderColor}` : 'none',
        boxShadow: iconShadowBlur > 0 ? `${iconShadowOffsetX}px ${iconShadowOffsetY}px ${iconShadowBlur}px ${iconShadowSpread}px ${iconShadowColor}` : 'none',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        minWidth: `${iconBgSize}px`,
        minHeight: `${iconBgSize}px`,
      };

      return (
        <>
          <style>{hoverCSS}</style>
          <div
            data-node-id={node.id}
            data-node-type="widget"
            className={baseProps.className}
            onClick={baseProps.onClick}
            role={baseProps.role}
            tabIndex={baseProps.tabIndex}
            style={{ ...baseProps.style, ...containerStyle }}
          >
            <div className={widgetClass} style={iconStyle}>
              <i className={icon} />
            </div>
          </div>
        </>
      );
    }

    default:
      return (
        <div {...baseProps} className={`${baseProps.className} p-4 bg-gray-200 border-2 border-gray-400 rounded`}>
          <p className="text-gray-800 font-semibold">
            Widget: <code>{widgetType}</code>
          </p>
          {isEditing && (
            <p className="text-sm text-gray-700 mt-2">
              Custom widget - content: {JSON.stringify(props).substring(0, 100)}...
            </p>
          )}
        </div>
      );
  }
}

/**
 * Convert CSS property to CSS string for media queries
 * Handles widget-specific properties like paddingH, paddingV, buttonWidth
 */
function convertPropertyToCSS(key, value) {
  switch (key) {
    case 'paddingH':
      // paddingH becomes padding-left and padding-right
      const valH = typeof value === 'number' ? `${value}px` : value;
      return `padding-left: ${valH} !important; padding-right: ${valH} !important;`;
    case 'paddingV':
      // paddingV becomes padding-top and padding-bottom
      const valV = typeof value === 'number' ? `${value}px` : value;
      return `padding-top: ${valV} !important; padding-bottom: ${valV} !important;`;
    case 'buttonWidth':
      // buttonWidth maps to width
      const valW = typeof value === 'number' ? `${value}px` : value;
      return `width: ${valW} !important;`;
    case 'direction':
      // direction (flex direction) maps to flex-direction
      return `flex-direction: ${value} !important;`;
    case 'padding':
    case 'margin':
      // For padding/margin shorthand, ensure it has !important
      return `${key}: ${value} !important;`;
    default:
      // Standard properties
      return `${camelToKebab(key)}: ${value} !important;`;
  }
}

/**
 * Convert style object to inline CSS
 * Supports shorthand properties
 */
function styleObjectToCSS(styleObj) {
  const cssObj = {};

  for (const [key, value] of Object.entries(styleObj || {})) {
    if (value === undefined || value === null) continue;

    // For React, keep camelCase property names
    // Handle special cases
    switch (key) {
      case 'padding':
      case 'margin':
        // Handle both string values and dimension objects
        if (typeof value === 'object' && value !== null) {
          const { top, right, bottom, left } = value;
          const parts = [top, right, bottom, left]
            .map(v => {
              if (!v && v !== 0) return '0';
              if (typeof v === 'string') return v.includes('px') ? v : `${v}px`;
              return `${v}px`;
            });
          cssObj[key] = parts.join(' ');
        } else if (value) {
          cssObj[key] = typeof value === 'string' ? value : `${value}px`;
        }
        break;
      case 'border':
        // Handle border object or string
        if (typeof value === 'object' && value !== null) {
          const { width, style: borderStyle = 'solid', color = '#000000', radius } = value;
          // Apply individual border properties instead of shorthand
          if (width !== undefined && width !== null && width !== '') {
            // Convert width to include px if needed
            let borderWidth = width;
            if (typeof width === 'number') {
              borderWidth = `${width}px`;
            } else if (typeof width === 'string') {
              // If it's a string that doesn't have a unit, add px
              if (!/px|em|rem|%|pt/.test(width)) {
                borderWidth = `${width}px`;
              }
            }
            cssObj.borderWidth = borderWidth;
            cssObj.borderStyle = borderStyle;
            cssObj.borderColor = color;
          }
          // Handle border radius if included - check for falsy but not 0
          if (radius !== undefined && radius !== null && radius !== '') {
            let borderRadius = radius;
            if (typeof radius === 'number') {
              borderRadius = `${radius}px`;
            } else if (typeof radius === 'string') {
              // If it's a string that doesn't have a unit, add px
              if (!/px|em|rem|%|pt/.test(radius)) {
                borderRadius = `${radius}px`;
              }
            }
            cssObj.borderRadius = borderRadius;
          }
        } else if (value) {
          cssObj[key] = value;
        }
        break;
      case 'shadow':
      case 'boxShadow':
        // Handle shadow/boxShadow object or string
        if (typeof value === 'object' && value !== null) {
          const { offsetX = 0, offsetY = 0, blur = 0, spread = 0, color = '#000000', inset = false } = value;

          // Convert values to numbers to ensure consistent format
          const offsetXVal = `${Number(offsetX) || 0}px`;
          const offsetYVal = `${Number(offsetY) || 0}px`;
          const blurVal = `${Number(blur) || 0}px`;
          const spreadVal = `${Number(spread) || 0}px`;
          const insetStr = inset ? 'inset ' : '';

          cssObj.boxShadow = `${insetStr}${offsetXVal} ${offsetYVal} ${blurVal} ${spreadVal} ${color}`;
        } else if (value) {
          cssObj.boxShadow = value;
        }
        break;
      case 'backgroundColor':
      case 'color':
      case 'borderColor':
      case 'borderStyle':
        cssObj[key] = value;
        break;
      case 'backgroundImage':
        // Convert URL to CSS url() format and fix API URLs for dev environment
        if (value && typeof value === 'string') {
          let url = value;

          // If it's a relative API URL, convert to absolute URL for proper loading
          if (url.startsWith('/api/')) {
            // In dev environment, API might be on a different port
            // Use the API server origin (usually localhost:5000)
            const apiOrigin = window.location.hostname === 'localhost'
              ? `http://${window.location.hostname}:5000`
              : window.location.origin;
            url = `${apiOrigin}${value}`;
          }

          // Check if already wrapped in url()
          if (!url.startsWith('url(')) {
            cssObj[key] = `url('${url}')`;
          } else {
            cssObj[key] = url;
          }
        }
        break;
      case 'backgroundSize':
      case 'backgroundPosition':
      case 'backgroundRepeat':
      case 'backgroundAttachment':
      case 'objectFit':
      case 'objectPosition':
        // Background and image object properties - pass as-is
        cssObj[key] = value;
        break;
      case 'minHeight':
      case 'maxHeight':
      case 'height':
      case 'width':
      case 'minWidth':
      case 'maxWidth':
      case 'fontSize':
      case 'letterSpacing':
      case 'gap':
      case 'borderRadius':
      case 'borderWidth':
      case 'paddingH':
      case 'paddingV':
      case 'buttonWidth':
        // Handle string values with units and numeric values
        if (typeof value === 'string') {
          // If string already has a unit, use it as-is
          cssObj[key] = value;
        } else if (typeof value === 'number') {
          // Convert numbers to pixels
          cssObj[key] = `${value}px`;
        } else {
          cssObj[key] = value;
        }
        break;
      case 'lineHeight':
        // Line height is unitless - keep it as a number or use string value as-is
        if (typeof value === 'string') {
          cssObj[key] = value;
        } else if (typeof value === 'number') {
          // Keep as unitless number for line height
          cssObj[key] = value;
        } else {
          cssObj[key] = value;
        }
        break;
      case 'display':
      case 'flexDirection':
      case 'direction':
      case 'alignItems':
      case 'justifyContent':
      case 'flexWrap':
      case 'gridTemplateColumns':
      case 'gridTemplateRows':
      case 'textAlign':
      case 'alignment':
        // Flex and grid properties - pass as-is
        cssObj[key] = value;
        break;
      default:
        cssObj[key] = value;
    }
  }

  return cssObj;
}

/**
 * Convert camelCase to kebab-case for CSS properties
 */
function camelToCss(str) {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Alias for camelToCss - used in responsive styles
 */
function camelToKebab(str) {
  return camelToCss(str);
}

export default NodeRenderer;