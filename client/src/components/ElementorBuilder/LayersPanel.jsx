'use client';

import React, { useState } from 'react';

import { useElementorBuilder } from '../../context/ElementorBuilderContext';
import { findNode } from '../../utils/nodeSchema';

/**
 * LayersPanel - Tree view of all nodes with selection sync
 */
const LayersPanel = () => {
  const {
    rootNode,
    selectedNodeId,
    selectNode,
    deleteNode,
    duplicateNodeAction,
    updateNodeProps
  } = useElementorBuilder();

  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));

  const toggleNodeExpanded = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleToggleVisibility = (e, nodeId) => {
    e.stopPropagation();
    const node = findNode(rootNode, nodeId);
    if (node) {
      const isVisible = node.props?.visible !== false;
      updateNodeProps(nodeId, {
        ...node.props,
        visible: !isVisible
      });
    }
  };

  const handleDelete = (e, nodeId) => {
    e.stopPropagation();
    if (window.confirm('Delete this element and all children?')) {
      deleteNode(nodeId);
    }
  };

  const handleDuplicate = (e, nodeId) => {
    e.stopPropagation();
    duplicateNodeAction(nodeId);
  };

  const renderLayerNode = (node, level = 0) => {
    const isSelected = node.id === selectedNodeId;
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isVisible = node.props?.visible !== false;

    // Skip rendering root node itself, just show children
    if (node.kind === 'root') {
      return (
        <div key={node.id}>
          {node.children && node.children.map((child) => renderLayerNode(child, level))}
        </div>
      );
    }

    return (
      <div key={node.id}>
        {/* Node Item */}
        <div
          onClick={() => selectNode(node.id)}
          className={`pl-${level * 4} pr-2 py-2 flex items-center gap-2 cursor-pointer transition rounded mx-1 ${
            isSelected
              ? 'bg-gray-200 border-l-4 border-gray-800'
              : 'hover:bg-gray-100 border-l-4 border-transparent'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {/* Expand Toggle */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpanded(node.id);
              }}
              className="w-5 h-5 flex items-center justify-center text-gray-900 hover:text-gray-700"
            >
              {isExpanded ? <i className="fas fa-chevron-down" style={{ fontSize: '14px' }}></i> : <i className="fas fa-chevron-right" style={{ fontSize: '14px' }}></i>}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* Node Label */}
          <span className="flex-1 text-sm font-medium text-gray-700">
            {formatNodeLabel(node)}
          </span>

          {/* Visibility Toggle */}
          <button
            onClick={(e) => handleToggleVisibility(e, node.id)}
            className="p-1 text-gray-400 hover:text-gray-600 transition"
            title={isVisible ? 'Hide' : 'Show'}
          >
            {isVisible ? <i className="fas fa-eye" style={{ fontSize: '14px' }}></i> : <i className="fas fa-eye-slash" style={{ fontSize: '14px' }}></i>}
          </button>

          {/* Duplicate */}
          <button
            onClick={(e) => handleDuplicate(e, node.id)}
            className="p-1 text-gray-400 hover:text-gray-700 transition"
            title="Duplicate"
          >
            <i className="fas fa-copy" style={{ fontSize: '14px' }}></i>
          </button>

          {/* Delete */}
          {node.id !== 'root' && (
            <button
              onClick={(e) => handleDelete(e, node.id)}
              className="p-1 text-gray-400 hover:text-black transition"
              title="Delete"
            >
              <i className="fas fa-trash" style={{ fontSize: '14px' }}></i>
            </button>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child) => renderLayerNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-2">
      <h3 className="text-sm font-bold text-gray-700 mb-3">Layers</h3>
      <div className="space-y-1">
        {renderLayerNode(rootNode)}
        {(!rootNode.children || rootNode.children.length === 0) && (
          <div className="text-center py-8 text-gray-400 text-sm">
            <p>No elements yet</p>
            <p className="text-xs">Switch to Widgets tab to add</p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Format node label for display
 */
function formatNodeLabel(node) {
  switch (node.kind) {
    case 'section':
    case 'column':
      return `${node.kind.charAt(0).toUpperCase() + node.kind.slice(1)} #${node.id.substring(0, 8)}`;
    case 'widget':
      return `${node.widgetType?.charAt(0).toUpperCase() + node.widgetType?.slice(1) || 'Widget'} #${node.id.substring(0, 8)}`;
    default:
      return `${node.kind} #${node.id.substring(0, 8)}`;
  }
}

export default LayersPanel;
