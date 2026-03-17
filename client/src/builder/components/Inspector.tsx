import React, { useState, useEffect, useRef } from 'react';

import { useElementorBuilder } from '../../context/ElementorBuilderContext';
import { getLayoutSchema } from '../controls/layoutSchemas';
import { getCustomSchema } from '../controls/customSchemas';
import { ControlRenderer } from './ControlRenderer';
import { Node, WidgetControls } from '../controls/types/index';
import './Inspector.css';

type InspectorTab='content'|'style'|'advanced';
type Device='desktop'|'tablet'|'mobile';

interface InspectorProps {
  selectedNodeId: string|null;
  onBack: () => void;
}

/**
 * Inspector - 3-tab Elementor-like inspector (CONTENT / STYLE / ADVANCED)
 * Renders controls for any node: layout (section/container/column) or widget
 */
export const Inspector: React.FC<InspectorProps>=({ selectedNodeId, onBack }) => {
  const builderContext=useElementorBuilder();
  const {
    getSelectedNode=() => null,
    updateNodeProps=() => {},
    updateNodeStyle=() => {},
    updateNodeAdvanced=() => {},
    updateNodeResponsiveStyle=() => {},
    updateNodeResponsiveAdvanced=() => {},
    clearResponsiveStyle=() => {},
    clearResponsiveAdvanced=() => {},
    deleteNode=() => {},
    duplicateNodeAction=() => {},
    currentDevice='desktop',
    setCurrentDevice=() => {}
  }=(builderContext||{}) as any;

  const [activeTab, setActiveTab]=useState<InspectorTab>('content');

  // Use ref to always have the latest currentDevice value
  const currentDeviceRef=useRef(currentDevice);

  useEffect(() => {
    currentDeviceRef.current=currentDevice;
  }, [currentDevice]);

  const selectedNode=getSelectedNode() as Node|null;
  if (!selectedNode) return null;

  // Determine schema based on node type (layout or widget)
  let schema: WidgetControls={ content: [], style: [], advanced: [] };
  let nodeName='';

  if (selectedNode.kind==='section') {
    schema=getLayoutSchema('section');
    nodeName='Section';
  } else if (selectedNode.kind==='column') {
    schema=getLayoutSchema('column');
    nodeName='Column';
  } else if (selectedNode.kind==='widget'&&selectedNode.widgetType) {
    schema=getCustomSchema(selectedNode.widgetType);
    nodeName=selectedNode.widgetType.charAt(0).toUpperCase()+selectedNode.widgetType.slice(1);
  }

  const handleDeleteNode=() => {
    if (window.confirm(`Delete this ${nodeName}?`)) {
      deleteNode(selectedNodeId);
      onBack();
    }
  };

  const handleDuplicateNode=() => {
    duplicateNodeAction(selectedNodeId);
  };

  const handlePropChange=(propName: string, value: any) => {
    updateNodeProps(selectedNodeId, { [propName]: value });
  };

  const handleAdvancedChange=(advancedName: string, value: any) => {
    const device=currentDeviceRef.current;
    if (device==='desktop') {
      updateNodeAdvanced(selectedNodeId, { [advancedName]: value });
    } else {
      updateNodeResponsiveAdvanced(selectedNodeId, device, advancedName, value);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 flex-1">
          <button onClick={onBack} className="p-1 hover:bg-gray-200 rounded" title="Back">
            <i className="fas fa-arrow-left" style={{ fontSize: '16px' }}></i>
          </button>
          <div>
            <p className="text-xs text-gray-900">Element</p>
            <p className="text-sm font-semibold text-gray-800">{nodeName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDuplicateNode}
            className="p-1 text-gray-400 hover:bg-gray-50 rounded"
            title="Duplicate"
          >
            <i className="fas fa-copy" style={{ fontSize: '16px' }}></i>
          </button>
          <button
            onClick={handleDeleteNode}
            className="p-1 text-black hover:bg-gray-100 rounded"
            title="Delete"
          >
            <i className="fas fa-times" style={{ fontSize: '16px' }}></i>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {(['content', 'style', 'advanced'] as InspectorTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-2 text-xs font-semibold transition ${activeTab===tab
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              :'text-gray-600 hover:text-gray-800'
              }`}
          >
            {tab.charAt(0).toUpperCase()+tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Device Selector (visible on Style & Advanced tabs) */}
      {(activeTab==='style'||activeTab==='advanced')&&(
        <div className="flex gap-2 p-2 border-b border-gray-200 bg-gray-50">
          {(['desktop', 'tablet', 'mobile'] as Device[]).map((dev) => (
            <button
              key={dev}
              onClick={() => {
                setCurrentDevice(dev);
              }}
              className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition ${currentDevice===dev
                ? 'bg-blue-600 text-white'
                :'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              title={dev}
            >
              {dev==='desktop'&&<i className="fas fa-desktop" style={{ fontSize: '12px' }}></i>}
              {dev==='tablet'&&<i className="fas fa-tablet" style={{ fontSize: '12px' }}></i>}
              {dev==='mobile'&&<i className="fas fa-mobile" style={{ fontSize: '12px' }}></i>}
              <span className="capitalize">{dev}</span>
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* CONTENT TAB */}
        {activeTab==='content'&&(
          <div className="space-y-3">
            {schema.content.length===0? (
              <p className="text-xs text-gray-900 text-center py-4">No content controls</p>
            ):(
              schema.content.map((control) => {
                const controlValue=selectedNode.props?.[control.name];

                return (
                  <ControlRenderer
                    key={control.name}
                    control={control}
                    value={controlValue}
                    onChange={(value) => handlePropChange(control.name, value)}
                  />
                );
              })
            )}
          </div>
        )}

        {/* STYLE TAB */}
        {activeTab==='style'&&(
          <div className="space-y-3">
            {schema.style.length===0? (
              <p className="text-xs text-gray-900 text-center py-4">No style controls</p>
            ):(
              schema.style.map((control) => {
                // Get base desktop value
                const desktopValue=selectedNode.style?.[control.name];

                // Get device-specific override
                let deviceValue=undefined;
                let displayValue=desktopValue;
                let isOverridden=false;

                if (control.responsive&&currentDevice!=='desktop') {
                  deviceValue=selectedNode.responsive?.[currentDevice as 'desktop'|'tablet'|'mobile']?.style?.[control.name];
                  if (deviceValue!==undefined) {
                    displayValue=deviceValue;
                    isOverridden=true;
                  } else {
                    // Show inherited desktop value
                    displayValue=desktopValue;
                  }
                }

                return (
                  <div key={control.name} className="relative group">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <ControlRenderer
                          control={control}
                          value={displayValue}
                          onChange={(value) => {
                            const device=currentDeviceRef.current;
                            if (device==='desktop') {
                              updateNodeStyle(selectedNodeId, { [control.name]: value });
                            } else {
                              updateNodeResponsiveStyle(selectedNodeId, device, control.name, value);
                            }
                          }}
                        />
                        {!isOverridden&&control.responsive&&currentDevice!=='desktop'&&desktopValue!==undefined&&(
                          <p className="text-xs text-gray-400 mt-1 px-1">↓ Inherits desktop</p>
                        )}
                      </div>
                      {isOverridden&&(
                        <button
                          onClick={() => clearResponsiveStyle?.(selectedNodeId, currentDevice, control.name)}
                          className="mt-2 p-1 text-amber-600 hover:bg-amber-100 rounded opacity-0 group-hover:opacity-100 transition"
                          title="Reset to desktop value"
                        >
                          <i className="fas fa-undo" style={{ fontSize: '14px' }}></i>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ADVANCED TAB */}
        {activeTab==='advanced'&&(
          <div className="space-y-3">
            {schema.advanced.length===0? (
              <p className="text-xs text-gray-900 text-center py-4">No advanced controls</p>
            ):(
              schema.advanced.map((control) => {
                // Get base desktop value
                const desktopValue=selectedNode.advanced?.[control.name];

                // Get device-specific override
                let deviceValue=undefined;
                let displayValue=desktopValue;
                let isOverridden=false;

                if (control.responsive&&currentDevice!=='desktop') {
                  deviceValue=selectedNode.responsive?.[currentDevice as 'desktop'|'tablet'|'mobile']?.advanced?.[control.name];
                  if (deviceValue!==undefined) {
                    displayValue=deviceValue;
                    isOverridden=true;
                  } else {
                    // Show inherited desktop value
                    displayValue=desktopValue;
                  }
                }

                return (
                  <div key={control.name} className="relative group">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <ControlRenderer
                          control={control}
                          value={displayValue}
                          onChange={(value) => handleAdvancedChange(control.name, value)}
                        />
                        {!isOverridden&&control.responsive&&currentDevice!=='desktop'&&desktopValue!==undefined&&(
                          <p className="text-xs text-gray-400 mt-1 px-1">↓ Inherits desktop</p>
                        )}
                      </div>
                      {isOverridden&&(
                        <button
                          onClick={() => clearResponsiveAdvanced?.(selectedNodeId, currentDevice, control.name)}
                          className="mt-2 p-1 text-amber-600 hover:bg-amber-100 rounded opacity-0 group-hover:opacity-100 transition"
                          title="Reset to desktop value"
                        >
                          <i className="fas fa-undo" style={{ fontSize: '14px' }}></i>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inspector;