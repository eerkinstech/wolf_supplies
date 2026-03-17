'use client';

import React, { useState } from 'react';

import { useElementorBuilder } from '../../context/ElementorBuilderContext';
import BLOCK_REGISTRY from '../BlockBuilder/BlockRegistry';
import Inspector from '../../builder/components/Inspector';

const LeftPanel = () => {
  const { rootNode, selectedNodeId, selectNode, insertNewNode } = useElementorBuilder();
  const [editingNodeId, setEditingNodeId] = useState(null);

  if (editingNodeId) {
    return <Inspector selectedNodeId={editingNodeId} onBack={() => setEditingNodeId(null)} />;
  }

  return (
    <div className="w-72 bg-white border-r border-gray-200 rounded-lg shadow-sm flex flex-col h-full">
      <div className="bg-linear-to-r from-blue-50 to-blue-100 border-b border-gray-300 p-4 flex items-center justify-between">
        <h2 className="font-bold text-gray-800">Page Sections</h2>
        <button
          onClick={() => insertNewNode('root', 'section', {}, {})}
          className="p-2 bg-gray-800 text-white rounded hover:bg-black transition"
          title="Add new section"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {rootNode && rootNode.children && rootNode.children.length > 0 ? (
          rootNode.children.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              isSelected={selectedNodeId === section.id}
              onSelect={() => {
                selectNode(section.id);
                setEditingNodeId(section.id);
              }}
            />
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>No sections yet</p>
            <p className="text-xs mt-2">Click the + button to add one</p>
          </div>
        )}
      </div>
    </div>
  );
};

function SectionCard({ section, index, isSelected, onSelect }) {
  // For sections, use kind to lookup in BLOCK_REGISTRY
  // Fallback to widgetType if it's a widget
  const registryKey = section.widgetType || section.kind;
  const blockDef = BLOCK_REGISTRY[registryKey];
  const icon = blockDef?.icon || '📦';
  const name = blockDef?.name || (section.widgetType || section.kind);

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg border-2 transition ${isSelected ? 'border-gray-600 bg-gray-100 shadow-md' : 'border-gray-200 hover:border-gray-300'
        }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-800 truncate">{name}</p>
          <p className="text-xs text-gray-900">Section {index + 1}</p>
        </div>
        {isSelected && <div className="w-2 h-2 bg-gray-1000 rounded-full"></div>}
      </div>
    </button>
  );
}

export default LeftPanel;
