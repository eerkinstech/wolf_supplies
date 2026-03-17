'use client';

import React, { useState } from 'react';
import { useElementorBuilder } from '../../context/ElementorBuilderContext';
import NodeRenderer from './NodeRenderer';
import BreadcrumbNav from './BreadcrumbNav';

/**
 * CenterCanvas - Main canvas area with node selection and drag-drop target
 */
const CenterCanvas = () => {
  const { rootNode, selectedNodeId, selectNode, insertNewNode } = useElementorBuilder();
  const [dragOverParentId, setDragOverParentId] = useState(null);

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverParentId('root');
  };

  const handleCanvasDragLeave = (e) => {
    if (e.target === e.currentTarget) {
      setDragOverParentId(null);
    }
  };

  const handleCanvasDrop = (e, parentId = 'root') => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverParentId(null);

    const widgetData = e.dataTransfer.getData('widget');
    if (widgetData) {
      try {
        const { type, props } = JSON.parse(widgetData);
        insertNewNode(parentId, type, props, {});
      } catch (error) {
}
    }
  };

  const handleSectionDragOver = (e, sectionId) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    const widgetData = e.dataTransfer.getData('widget');
    if (widgetData) {
      setDragOverParentId(sectionId);
    }
  };

  const handleSectionDrop = (e, sectionId) => {
    e.preventDefault();
    e.stopPropagation();
    handleCanvasDrop(e, sectionId);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100 rounded-lg shadow-sm overflow-hidden">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNav />

      {/* Canvas */}
      <div
        className={`flex-1 overflow-y-auto p-8 transition ${dragOverParentId === 'root' ? 'bg-gray-100 ring-2 ring-gray-600' : ''
          }`}
        onDragOver={handleCanvasDragOver}
        onDragLeave={handleCanvasDragLeave}
        onDrop={(e) => handleCanvasDrop(e, 'root')}
      >
        <div className="max-w-7xl mx-auto">
          {/* Render node tree */}
          <div
            onDragOver={(e) => handleSectionDragOver(e, 'root')}
            onDrop={(e) => handleSectionDrop(e, 'root')}
          >
            <NodeRenderer
              node={rootNode}
              isEditing={true}
              selectedNodeId={selectedNodeId}
              onSelectNode={selectNode}
            />
          </div>

          {/* Empty state */}
          {(!rootNode.children || rootNode.children.length === 0) && (
            <div className="mt-12 text-center text-gray-400">
              <p className="text-lg font-semibold mb-2">No sections yet</p>
              <p className="text-sm">Drag widgets from the left panel or click "Add Section"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CenterCanvas;
