/**
 * Canvas Component - Displays the page tree using NodeRenderer
 */

import React, { useContext, useState } from 'react';
import ElementorBuilderContext from '../../context/ElementorBuilderContext';
import NodeRenderer from './NodeRenderer';
import { Node } from '../controls/types/index';

interface CanvasProps {
  device?: 'desktop'|'tablet'|'mobile';
  onSelectNode?: (nodeId: string) => void;
}

export const Canvas: React.FC<CanvasProps>=({ device='desktop', onSelectNode }) => {
  const context=useContext(ElementorBuilderContext);
  const [selectedNodeId, setSelectedNodeId]=useState<string|null>(null);

  if (!context) {
    return <div className="p-4 text-black text-sm">Builder context not available</div>;
  }

  const { rootNode, selectNode }=context;

  if (!rootNode||!rootNode.children) {
    return <div className="p-4 text-gray-900 text-sm">No page tree loaded</div>;
  }

  const handleNodeSelect=(nodeId: string) => {
    setSelectedNodeId(nodeId);
    selectNode?.(nodeId);
    onSelectNode?.(nodeId);
  };

  // Determine device breakpoints for responsive preview
  const getDeviceWidth=() => {
    switch (device) {
      case 'mobile':
        return '384px'; // Mobile width
      case 'tablet':
        return '672px'; // Tablet width
      case 'desktop':
      default:
        return '100%';
    }
  };

  return (
    <div className="canvas-container bg-linear-to-b from-gray-50 to-black-100 overflow-auto h-full">
      {/* Device Preview Container */}
      <div className="canvas-preview min-h-full">
        {/* Device Container with responsive width */}
        <div
          className="canvas-device-wrapper mx-auto transition-all"
          style={{
            width: getDeviceWidth(),
            boxShadow: device!=='desktop'? '0 10px 40px rgba(0,0,0,0.1)':'none'
          }}
        >
          <div className="bg-white min-h-screen">
            {/* Render Page Tree */}
            {rootNode.children?.map((node: any) => (
              <NodeRenderer
                key={node.id}
                node={node as Node}
                device={device}
                isSelected={selectedNodeId===node.id}
                onSelect={handleNodeSelect}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Canvas Styles */}
      <style>{`
        .canvas-container {
          background-color: #f3f4f6;
          display: flex;
          flex-direction: column;
        }

        .canvas-preview {
          flex: 1;
          overflow: auto;
       
        }

        .canvas-device-wrapper {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          min-height: auto;
          margin-left: auto;
          margin-right: auto;
          overflow: visible;
        }

        /* Mobile view */
        @media (max-width: 768px) {
          .canvas-device-wrapper {
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
        }

        /* Responsive grid for sections */
        @media (max-width: 768px) {
          .builder-section {
            width: 100%;
          }
        }

        /* Node selection outline */
        .node-selected {
          outline: 2px solid #3b82f6 !important;
          box-shadow: inset 0 0 0 1px #3b82f6, 0 0 0 3px rgba(59, 130, 246, 0.1);
          position: relative;
        }

        .node-selected::after {
          content: attr(data-selected);
          position: absolute;
          top: -24px;
          left: 0;
          background: #3b82f6;
          color: white;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 3px;
          white-space: nowrap;
          font-weight: bold;
        }

        /* Section styles */
        .section-node {
          width: 100%;
          position: relative;
          display: grid;
        }

        /* Boxed mode (Elementor content width boxed) */
        .builder-section.is-boxed {
          max-width: var(--boxed-max, 1140px);
          margin-left: auto;
          margin-right: auto;
          padding-left: var(--pad-x, 15px);
          padding-right: var(--pad-x, 15px);
        }

        /* Full width mode (Elementor full width content) */
        .builder-section.is-full {
          max-width: none;
          margin-left: 0;
          margin-right: 0;
          padding-left: 0;
          padding-right: 0;
        }

        .section-children {
          width: 100%;
        }

        /* Container styles */
        .container-node {
          width: 100%;
          position: relative;
          display: grid;
        }

        /* Column styles */
        .column-node {
          position: relative;
          display: flex;
          flex-direction: column;
        }

        /* Widget styles */
        .widget-node {
          position: relative;
          transition: background-color 0.15s ease;
          
        }

        /* Hidden elements indicator */
        .hidden {
          opacity: 0.4;
          pointer-events: none;
        }

        .hidden::before {
          content: 'Hidden on this device';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 11px;
          white-space: nowrap;
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

export default Canvas;
