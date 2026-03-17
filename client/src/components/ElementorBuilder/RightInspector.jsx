'use client';

import React, { useState } from 'react';

import { useElementorBuilder } from '../../context/ElementorBuilderContext';
import BLOCK_REGISTRY from '../BlockBuilder/BlockRegistry';

/**
 * RightInspector - Edit selected node properties and styles
 */
const RightInspector = () => {
  const { selectedNodeId, getSelectedNode, updateNodeProps, updateNodeStyle, findNode } =
    useElementorBuilder();

  const [expandedSections, setExpandedSections] = useState(
    new Set(['style', 'props'])
  );

  const selectedNode = getSelectedNode();

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const blockDef = selectedNode && BLOCK_REGISTRY[selectedNode.widgetType];
  const isContainer = selectedNode && ['section', 'column', 'root'].includes(selectedNode.kind);

  return (
    <div className="w-80 bg-white border-l border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4">
        <h2 className="font-bold text-gray-800">Inspector</h2>
        {selectedNode ? (
          <p className="text-sm text-gray-600 mt-1">
            {blockDef?.name || selectedNode.widgetType || selectedNode.kind}
          </p>
        ) : (
          <p className="text-sm text-gray-900 mt-1">No element selected</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!selectedNode ? (
          <div className="p-4 text-center text-gray-900">
            <p className="text-sm">Click an element on the canvas to edit it</p>
          </div>
        ) : (
          <>
            {/* Node Info Card */}
            <div className="border-b border-gray-200 p-4">
              <div className="bg-gray-100 rounded p-3 space-y-2">
                <div>
                  <p className="text-xs text-gray-600">ID</p>
                  <p className="text-sm font-mono text-gray-700 truncate">{selectedNode.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Type</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedNode.kind}</p>
                </div>
              </div>
            </div>

            {/* Style Section */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleSection('style')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
              >
                <span className="font-semibold text-gray-800">Style</span>
                {expandedSections.has('style') ? <i className="fas fa-chevron-up" style={{ fontSize: '14px' }}></i> : <i className="fas fa-chevron-down" style={{ fontSize: '14px' }}></i>}
              </button>

              {expandedSections.has('style') && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Common Styles */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-2">Background Color</label>
                    <input
                      type="color"
                      value={selectedNode.style?.backgroundColor || '#ffffff'}
                      onChange={(e) =>
                        updateNodeStyle(selectedNodeId, { backgroundColor: e.target.value })
                      }
                      className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-2">Background Image</label>
                    <div className="border border-gray-300 rounded p-2 bg-gray-50">
                      {selectedNode.style?.backgroundImage && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                            <img
                              src={selectedNode.style.backgroundImage}
                              alt="Background"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 text-xs">
                            <p className="font-semibold text-gray-700 truncate">
                              {selectedNode.style.backgroundImage.includes('/')
                                ? selectedNode.style.backgroundImage.split('/').pop()?.split('?')[0] || 'Background Image'
                                : selectedNode.style.backgroundImage}
                            </p>
                            <p className="text-gray-600">Background</p>
                          </div>
                          <button
                            onClick={() => updateNodeStyle(selectedNodeId, { backgroundImage: '' })}
                            className="p-1 hover:bg-gray-100 rounded text-black"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {!selectedNode.style?.backgroundImage && (
                        <div className="text-center py-4 text-gray-900">
                          <p className="text-2xl mb-1">🖼️</p>
                          <p className="text-xs">No background image</p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-2">
                        <label className="flex-1 px-2 py-1.5 bg-gray-800 hover:bg-black text-white text-xs font-medium rounded cursor-pointer transition text-center">
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const formData = new FormData();
                                formData.append('file', file);
                                const response = await fetch('/api/media/upload', {
                                  method: 'POST',
                                  body: formData,
                                });
                                if (response.ok) {
                                  const data = await response.json();
                                  const uploadedUrl = data.asset?.url || data.url || data.path;
                                  updateNodeStyle(selectedNodeId, { backgroundImage: uploadedUrl });
                                } else {
                                  alert('Upload failed');
                                }
                              } catch (error) {
                                alert('Upload failed');
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        <input
                          type="text"
                          placeholder="https://example.com/image.jpg"
                          value={selectedNode.style?.backgroundImage || ''}
                          onChange={(e) =>
                            updateNodeStyle(selectedNodeId, { backgroundImage: e.target.value })
                          }
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gray-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-2">Background Size</label>
                    <select
                      value={selectedNode.style?.backgroundSize || 'cover'}
                      onChange={(e) =>
                        updateNodeStyle(selectedNodeId, { backgroundSize: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="cover">Cover</option>
                      <option value="contain">Contain</option>
                      <option value="auto">Auto</option>
                      <option value="100% 100%">Stretch</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-2">Background Position</label>
                    <select
                      value={selectedNode.style?.backgroundPosition || 'center'}
                      onChange={(e) =>
                        updateNodeStyle(selectedNodeId, { backgroundPosition: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="top left">Top Left</option>
                      <option value="top right">Top Right</option>
                      <option value="bottom left">Bottom Left</option>
                      <option value="bottom right">Bottom Right</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-2">Background Repeat</label>
                    <select
                      value={selectedNode.style?.backgroundRepeat || 'no-repeat'}
                      onChange={(e) =>
                        updateNodeStyle(selectedNodeId, { backgroundRepeat: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="no-repeat">No Repeat</option>
                      <option value="repeat">Repeat</option>
                      <option value="repeat-x">Repeat X</option>
                      <option value="repeat-y">Repeat Y</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-2">Background Attachment</label>
                    <select
                      value={selectedNode.style?.backgroundAttachment || 'scroll'}
                      onChange={(e) =>
                        updateNodeStyle(selectedNodeId, { backgroundAttachment: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="scroll">Scroll</option>
                      <option value="fixed">Fixed (Parallax)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-2">Padding</label>
                    <input
                      type="text"
                      placeholder="e.g., 16px or 10px 20px"
                      value={selectedNode.style?.padding || ''}
                      onChange={(e) =>
                        updateNodeStyle(selectedNodeId, { padding: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-2">Margin</label>
                    <input
                      type="text"
                      placeholder="e.g., 16px or 10px 20px"
                      value={selectedNode.style?.margin || ''}
                      onChange={(e) =>
                        updateNodeStyle(selectedNodeId, { margin: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-2">Border Radius</label>
                    <input
                      type="text"
                      placeholder="e.g., 8px"
                      value={selectedNode.style?.borderRadius || ''}
                      onChange={(e) =>
                        updateNodeStyle(selectedNodeId, { borderRadius: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-2">Min Height</label>
                    <input
                      type="text"
                      placeholder="e.g., 300px"
                      value={selectedNode.style?.minHeight || ''}
                      onChange={(e) =>
                        updateNodeStyle(selectedNodeId, { minHeight: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Properties Section for Block Registry Widgets */}
            {blockDef?.fields && (
              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection('props')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
                >
                  <span className="font-semibold text-gray-800">Properties</span>
                  {expandedSections.has('props') ? <i className="fas fa-chevron-up" style={{ fontSize: '14px' }}></i> : <i className="fas fa-chevron-down" style={{ fontSize: '14px' }}></i>}
                </button>

                {expandedSections.has('props') && (
                  <div className="px-4 pb-4 space-y-4">
                    {blockDef.fields.map((field) => (
                      <div key={field.name}>
                        <label className="text-xs font-semibold text-gray-600 block mb-2 capitalize">
                          {field.label || field.name}
                        </label>

                        {field.type === 'text' && (
                          <input
                            type="text"
                            value={selectedNode.props?.[field.name] || ''}
                            onChange={(e) =>
                              updateNodeProps(selectedNodeId, { [field.name]: e.target.value })
                            }
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                        )}

                        {field.type === 'textarea' && (
                          <textarea
                            value={selectedNode.props?.[field.name] || ''}
                            onChange={(e) =>
                              updateNodeProps(selectedNodeId, { [field.name]: e.target.value })
                            }
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            rows="3"
                          />
                        )}

                        {field.type === 'number' && (
                          <input
                            type="number"
                            value={selectedNode.props?.[field.name] || ''}
                            onChange={(e) =>
                              updateNodeProps(selectedNodeId, { [field.name]: parseInt(e.target.value) })
                            }
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                        )}

                        {field.type === 'select' && (
                          <select
                            value={selectedNode.props?.[field.name] || ''}
                            onChange={(e) =>
                              updateNodeProps(selectedNodeId, { [field.name]: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Select {field.label || field.name}</option>
                            {field.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {field.type === 'color' && (
                          <input
                            type="color"
                            value={selectedNode.props?.[field.name] || '#000000'}
                            onChange={(e) =>
                              updateNodeProps(selectedNodeId, { [field.name]: e.target.value })
                            }
                            className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                          />
                        )}

                        {field.type === 'checkbox' && (
                          <input
                            type="checkbox"
                            checked={selectedNode.props?.[field.name] || false}
                            onChange={(e) =>
                              updateNodeProps(selectedNodeId, { [field.name]: e.target.checked })
                            }
                            className="w-4 h-4 border border-gray-300 rounded"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Properties Section for Basic Widgets */}
            {selectedNode?.kind === 'widget' && !blockDef && (
              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection('basicProps')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
                >
                  <span className="font-semibold text-gray-800">Widget Properties</span>
                  {expandedSections.has('basicProps') ? <i className="fas fa-chevron-up" style={{ fontSize: '14px' }}></i> : <i className="fas fa-chevron-down" style={{ fontSize: '14px' }}></i>}
                </button>

                {expandedSections.has('basicProps') && (
                  <div className="px-4 pb-4 space-y-4">
                    {/* Heading Level */}
                    {selectedNode.widgetType === 'heading' && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-2">Heading Level</label>
                        <select
                          value={selectedNode.props?.level || 'h1'}
                          onChange={(e) =>
                            updateNodeProps(selectedNodeId, { level: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        >
                          <option value="h1">H1 - Main Heading</option>
                          <option value="h2">H2 - Subheading</option>
                          <option value="h3">H3 - Section</option>
                          <option value="h4">H4 - Subsection</option>
                          <option value="h5">H5 - Minor</option>
                          <option value="h6">H6 - Minimal</option>
                        </select>
                      </div>
                    )}

                    {/* Content */}
                    {(selectedNode.widgetType === 'heading' || selectedNode.widgetType === 'text') && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-2">Content</label>
                        <textarea
                          value={selectedNode.props?.content || ''}
                          onChange={(e) =>
                            updateNodeProps(selectedNodeId, { content: e.target.value })
                          }
                          placeholder="Enter text content"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          rows="2"
                        />
                      </div>
                    )}

                    {/* Button Text */}
                    {selectedNode.widgetType === 'button' && (
                      <>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-2">Button Text</label>
                          <input
                            type="text"
                            value={selectedNode.props?.text || ''}
                            onChange={(e) =>
                              updateNodeProps(selectedNodeId, { text: e.target.value })
                            }
                            placeholder="Enter button text"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-2">Link</label>
                          <input
                            type="text"
                            value={selectedNode.props?.link || ''}
                            onChange={(e) =>
                              updateNodeProps(selectedNodeId, { link: e.target.value })
                            }
                            placeholder="e.g., /products"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </>
                    )}

                    {/* Image Alt Text */}
                    {selectedNode.widgetType === 'image' && (
                      <>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-2">Image URL</label>
                          <input
                            type="text"
                            value={selectedNode.props?.src || ''}
                            onChange={(e) =>
                              updateNodeProps(selectedNodeId, { src: e.target.value })
                            }
                            placeholder="Image URL"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-2">Alt Text</label>
                          <input
                            type="text"
                            value={selectedNode.props?.alt || ''}
                            onChange={(e) =>
                              updateNodeProps(selectedNodeId, { alt: e.target.value })
                            }
                            placeholder="Alt text for image"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </>
                    )}

                    {/* Font Size */}
                    {(selectedNode.widgetType === 'heading' || selectedNode.widgetType === 'text') && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-2">Font Size (px)</label>
                        <input
                          type="number"
                          value={selectedNode.style?.fontSize || '16'}
                          onChange={(e) =>
                            updateNodeStyle(selectedNodeId, { fontSize: parseInt(e.target.value) })
                          }
                          min="8"
                          max="72"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    )}

                    {/* Text Color */}
                    {(selectedNode.widgetType === 'heading' || selectedNode.widgetType === 'text') && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-2">Text Color</label>
                        <input
                          type="color"
                          value={selectedNode.style?.color || '#000000'}
                          onChange={(e) =>
                            updateNodeStyle(selectedNodeId, { color: e.target.value })
                          }
                          className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                    )}

                    {/* Text Alignment */}
                    {(selectedNode.widgetType === 'heading' || selectedNode.widgetType === 'text') && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-2">Text Alignment</label>
                        <select
                          value={selectedNode.style?.textAlign || 'left'}
                          onChange={(e) =>
                            updateNodeStyle(selectedNodeId, { textAlign: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                          <option value="justify">Justify</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RightInspector;