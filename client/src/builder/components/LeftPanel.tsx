/**
 * LeftPanel - Widget library + Inspector (Content, Style, Advanced) + Navigator
 * All-in-one left panel with tabbed interface
 */

import React, { useContext, useState } from 'react';
import ElementorBuilderContext from '../../context/ElementorBuilderContext';
import { getWidgetsByCategory, getRegisteredWidget } from '../utils/widgetRegistry';
import { createWidgetNode, createColumnNode, createSectionNode } from '../utils/nodeFactory';
import { getLayoutSchema } from '../controls/layoutSchemas';
import { getCustomSchema } from '../controls/customSchemas';
import { ControlRenderer } from './ControlRenderer';
import { LayoutSelector } from './LayoutSelector';
import { StructureSelector } from './StructureSelector';
import { Navigator } from './Navigator';

// Icon mapping for widget types - returns Font Awesome class name
const getWidgetIconComponent=(iconName: string): string => {
    const iconMap: Record<string, string>={
        'Heart': 'fas fa-heart',
        'List': 'fas fa-list',
        'Star': 'fas fa-heading',
        'Box': 'fas fa-box',
        'Text': 'fas fa-file-alt',
        'Button': 'fas fa-mouse-pointer',
        'Image': 'fas fa-image',
        'Video': 'fas fa-video',
        'Divider': 'fas fa-minus',
        'Spacer': 'fas fa-arrows-alt',
        'Heading': 'fas fa-heading',
    };
    return iconMap[iconName]||'fas fa-box';
};

interface LeftPanelProps {
    selectedNodeId: string|null;
    onSelectNode: (nodeId: string|null) => void;
}

export const LeftPanel: React.FC<LeftPanelProps>=({
    selectedNodeId,
    onSelectNode,
}) => {
    const context=useContext(ElementorBuilderContext);
    const [activeTab, setActiveTab]=useState<'library'|'navigator'|'inspector'>('library');
    const [inspectorTab, setInspectorTab]=useState<'content'|'style'|'advanced'>('content');
    const [expandedCategories, setExpandedCategories]=useState<Set<string>>(
        new Set(['Basic', 'Content', 'eCommerce'])
    );

    // Layout selection modals state
    const [showLayoutSelector, setShowLayoutSelector]=useState(false);
    const [selectedLayout, setSelectedLayout]=useState<'flexbox'|'grid'|null>(null);

    if (!context) {
        return <div className="p-4 text-black text-sm">Context not available</div>;
    }

    const { rootNode, findNode, insertNewNode, updateNodeProps, updateNodeStyle, updateNodeAdvanced, deleteNode, duplicateNodeAction, updateNodeResponsiveStyle, updateNodeResponsiveAdvanced, currentDevice }=context;

    // Get selected node
    const selectedNode=selectedNodeId? findNode(selectedNodeId):null;
    const widgetsByCategory=getWidgetsByCategory();

    /**
     * Get default props for different widget types
     */
    const getDefaultPropsForWidget=(widgetType: string): Record<string, any> => {
        const defaults: Record<string, Record<string, any>>=({
            heading: { content: 'Heading', level: 'h2' },
            text: { content: 'Enter your text here' },
            button: { content: 'Click Me', link: '#' },
            image: { src: '', alt: 'Image' },
            video: { src: '', autoplay: false },
            divider: { type: 'solid' },
            spacer: { height: '20px' },
            iconList: { items: [] }
        });
        return defaults[widgetType]||{};
    };

    const toggleCategory=(category: string) => {
        const newExpanded=new Set(expandedCategories);
        if (newExpanded.has(category)) {
            newExpanded.delete(category);
        } else {
            newExpanded.add(category);
        }
        setExpandedCategories(newExpanded);
    };

    const handleAddSection=() => {
        setShowLayoutSelector(true);
    };

    const handleLayoutSelect=(layout: 'flexbox'|'grid') => {
        setSelectedLayout(layout);
    };

    const handleStructureSelect=(structure: any) => {
        if (!insertNewNode||!rootNode?.id) return;

        // Create columns based on structure
        const columns=structure.columns.map((width: number, idx: number) =>
            createColumnNode({
                id: `col_${Date.now()}_${idx}`,
                props: { width: `${width}%` }
            })
        );

        // Section now directly contains columns (no Container wrapper)
        const sectionNode=createSectionNode({
            id: `section_${Date.now()}`,
            props: { contentWidth: 'full', numColumns: structure.columns.length },
            style: { gap: '20px' },
            advanced: { display: selectedLayout },
            children: columns
        });

        insertNewNode(rootNode.id, sectionNode);
        setShowLayoutSelector(false);
        setSelectedLayout(null);
    };

    const handleAddWidget=(widgetType: string) => {
        if (!insertNewNode||!rootNode?.id) return;

        // Try to find the first column to add the widget to
        const findFirstColumn=(node: any): any => {
            if (!node) return null;
            if (node.kind==='column') return node;
            if (node.children&&node.children.length>0) {
                for (const child of node.children) {
                    const found=findFirstColumn(child);
                    if (found) return found;
                }
            }
            return null;
        };

        const firstColumn=findFirstColumn(rootNode);

        if (firstColumn) {
            // Add widget to the first available column with default props
            const defaultProps=getDefaultPropsForWidget(widgetType);
            const widgetNode=createWidgetNode(widgetType, defaultProps);
            insertNewNode(firstColumn.id, widgetNode);
        } else {
            // Fallback: create a new section with column and widget
            const widgetNode=createWidgetNode(widgetType, {});
            const columnNode=createColumnNode({
                id: `col_${Date.now()}`,
                children: [widgetNode]
            });
            // Section now directly contains columns (no Container wrapper)
            const sectionNode=createSectionNode({
                id: `section_${Date.now()}`,
                props: { numColumns: 1 },
                children: [columnNode]
            });

            insertNewNode(rootNode.id, sectionNode);
        }
    };

    const handleDeleteNode=() => {
        if (deleteNode&&selectedNodeId) {
            deleteNode(selectedNodeId);
            onSelectNode(null);
        }
    };

    const handleDuplicateNode=() => {
        if (duplicateNodeAction&&selectedNodeId) {
            duplicateNodeAction(selectedNodeId);
        }
    };

    // Get schema for inspector
    const getSchema=() => {
        if (!selectedNode) return null;
        if (selectedNode.kind==='section'||selectedNode.kind==='column') {
            return getLayoutSchema(selectedNode.kind);
        }
        if (selectedNode.kind==='widget'&&selectedNode.widgetType) {
            // First check widget registry (for standard widgets like heading, text, button)
            const registeredWidget=getRegisteredWidget(selectedNode.widgetType);
            if (registeredWidget&&registeredWidget.schema) {
                return registeredWidget.schema;
            }
            // Then check custom schemas (for e-commerce widgets)
            return getCustomSchema(selectedNode.widgetType);
        }
        return null;
    };

    const schema=getSchema();

    const handlePropChange=(propName: string, value: any) => {
        if (updateNodeProps&&selectedNodeId&&selectedNode) {
            // Merge new prop with existing props
            const updatedProps={ ...selectedNode.props, [propName]: value };
            updateNodeProps(selectedNodeId, { props: updatedProps });
        }
    };

    const handleStyleChange=(styleProp: string, value: any) => {
        if (!selectedNodeId) return;
        if (currentDevice==='desktop') {
            updateNodeStyle?.(selectedNodeId, { [styleProp]: value });
        } else {
            updateNodeResponsiveStyle?.(selectedNodeId, currentDevice, { [styleProp]: value });
        }
    };

    const handleAdvancedChange=(advProp: string, value: any) => {
        if (!selectedNodeId) return;

        if (currentDevice==='desktop') {
            updateNodeAdvanced?.(selectedNodeId, { [advProp]: value });
        } else {
            updateNodeResponsiveAdvanced?.(selectedNodeId, currentDevice, { [advProp]: value });
        }
    };

    return (
        <div className="left-panel h-full flex flex-col overflow-hidden bg-white">
            {/* Main Tab Buttons */}
            <div className="flex border-b border-gray-200 bg-gray-50 shrink-0">
                <button
                    onClick={() => setActiveTab('library')}
                    className={`flex-1 px-3 py-3 text-sm font-medium transition border-b-2 flex flex-col  items-center justify-center gap-2 ${activeTab==='library'
                        ? 'text-blue-600 border-blue-600'
                        :'text-gray-600 border-transparent hover:text-gray-900'
                        }`}
                >
                    <i className="fas fa-box"></i>
                    <span>Library</span>
                </button>
                <button
                    onClick={() => setActiveTab('navigator')}
                    className={`flex-1 px-3 py-3 text-sm font-medium transition border-b-2 flex flex-col items-center justify-center gap-2 ${activeTab==='navigator'
                        ? 'text-blue-600 border-blue-600'
                        :'text-gray-600 border-transparent hover:text-gray-900'
                        }`}
                >
                    <i className="fas fa-clipboard"></i>
                    <span>Structure</span>
                </button>
                <button
                    onClick={() => setActiveTab('inspector')}
                    className={`flex-1 px-3 py-3 text-sm font-medium transition border-b-2 flex flex-col items-center justify-center gap-2 ${activeTab==='inspector'
                        ? 'text-blue-600 border-blue-600'
                        :'text-gray-600 border-transparent hover:text-gray-900'
                        }`}
                >
                    <i className="fas fa-cog"></i>
                    <span>Inspector</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {activeTab==='library'? (
                    // Widget Library Tab
                    <div className="p-3">
                        {/* Add Section Button */}
                        <button

                            onClick={handleAddSection}
                            className="w-full mb-4 px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 shadow-md"
                        >
                            <i className="fas fa-plus"></i>
                            <span>Add Section</span>
                        </button>

                        {Object.entries(widgetsByCategory).map(([category, widgets]) => (
                            <div key={category} className="mb-3">
                                {/* Category Header */}
                                <button
                                    onClick={() => toggleCategory(category)}
                                    className="w-full flex items-center gap-2 px-2 py-2 mb-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-semibold text-gray-700 transition"
                                >
                                    {expandedCategories.has(category)? <i className="fas fa-chevron-down text-xs"></i>:<i className="fas fa-chevron-right text-xs"></i>}
                                    <span>{category}</span>
                                </button>

                                {/* Widgets in Category */}
                                {expandedCategories.has(category)&&(
                                    <div className="grid grid-cols-2 gap-2 ml-2">
                                        {widgets.map((widget) => (
                                            <button
                                                key={widget.widgetType}
                                                onClick={() => handleAddWidget(widget.widgetType)}
                                                draggable
                                                onDragStart={(e) => {
                                                    e.dataTransfer!.effectAllowed='copy';
                                                    e.dataTransfer!.setData('widgetType', widget.widgetType);
                                                }}
                                                className="flex flex-col items-center justify-center gap-1 px-2 py-3 bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded text-sm transition cursor-move"
                                            >
                                                <i className={`text-xl text-blue-600 ${getWidgetIconComponent(widget.icon)}`}></i>
                                                <span className="font-medium text-gray-700 text-center">{widget.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ):(
                    activeTab==='navigator'? (
                        // Navigator Tab
                        <Navigator
                            selectedNodeId={selectedNodeId}
                            onSelectNode={onSelectNode}
                        />
                    ):(
                        <div className="p-3 space-y-3">
                            {selectedNode? (
                                <>
                                    {/* Node Header */}
                                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <div>
                                                <p className="text-xs text-gray-600">Element Type</p>
                                                <p className="font-semibold text-gray-900 capitalize text-sm">
                                                    {selectedNode.widgetType||selectedNode.kind}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={handleDuplicateNode}
                                                    className="text-gray-400 hover:text-gray-700 hover:bg-gray-50 p-1.5 rounded transition"
                                                    title="Duplicate element"
                                                >
                                                    <i className="fas fa-copy"></i>
                                                </button>
                                                <button
                                                    onClick={handleDeleteNode}
                                                    className="text-black hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded transition"
                                                    title="Delete element"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Parent Navigation - Show for columns/widgets */}
                                    {selectedNode.kind!=='section'&&(
                                        <div className="bg-amber-50 border border-amber-200 rounded p-2">
                                            <p className="text-xs text-gray-600 mb-2">Hierarchy</p>
                                            <button
                                                onClick={() => {
                                                    if (selectedNodeId) {
                                                        const parentNode=findNode(selectedNodeId);
                                                        if (parentNode) {
                                                            let parentId=null;
                                                            const findParent=(node: any) => {
                                                                if (node.children?.find((c: any) => c.id===selectedNodeId)) {
                                                                    parentId=node.id;
                                                                    return true;
                                                                }
                                                                return node.children?.some((c: any) => findParent(c));
                                                            };
                                                            if (rootNode) findParent(rootNode);
                                                            if (parentId) onSelectNode(parentId);
                                                        }
                                                    }
                                                }}
                                                className="w-full text-left px-2 py-2 bg-white border border-amber-300 rounded text-xs font-medium text-amber-700 hover:bg-amber-100 transition"
                                            >
                                                ↑ Select Parent {selectedNode.kind==='column'? 'Section':'Column'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Inspector Sub-tabs */}
                                    <div className="flex justify-between border-b border-gray-200 bg-gray-50 -mx-3 px-3 pt-1">
                                        {(['content', 'style', 'advanced'] as const).map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setInspectorTab(tab)}
                                                className={`px-2 py-2 text-xs font-medium border-b-2 transition ${inspectorTab===tab
                                                    ? 'text-blue-600 border-blue-600'
                                                    :'text-gray-600 border-transparent hover:text-gray-900'
                                                    }`}
                                            >
                                                {tab==='content'? 'Content':tab==='style'? 'Style':'Advanced'}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tab Content */}
                                    <div className="space-y-2">
                                        {schema? (
                                            <>
                                                {inspectorTab==='content'&&schema.content&&schema.content.length>0? (
                                                    <div className="space-y-2">
                                                        {schema.content.map((control) => (
                                                            <div key={control.name||control.label}>
                                                                {/* <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                {control.label}
                                                            </label> */}
                                                                <ControlRenderer
                                                                    control={control}
                                                                    value={selectedNode.props?.[control.name]??control.default}
                                                                    onChange={(val) => handlePropChange(control.name, val)}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                ):inspectorTab==='content'? (
                                                    <p className="text-xs text-gray-900 py-3">No content controls</p>
                                                ):null}

                                                {inspectorTab==='style'&&schema.style&&schema.style.length>0? (
                                                    <div className="space-y-2">
                                                        {schema.style.map((control) => {
                                                            // Get base desktop value
                                                            const desktopValue=selectedNode.style?.[control.name]??control.default;

                                                            // Get device-specific override if responsive control
                                                            let displayValue=desktopValue;
                                                            if (control.responsive&&currentDevice!=='desktop') {
                                                                const deviceValue=selectedNode.responsive?.[currentDevice as 'desktop'|'tablet'|'mobile']?.style?.[control.name];
                                                                if (deviceValue!==undefined) {
                                                                    displayValue=deviceValue;
                                                                }
                                                            }

                                                            return (
                                                                <div key={control.name||control.label}>
                                                                    <ControlRenderer
                                                                        control={control}
                                                                        value={displayValue}
                                                                        onChange={(val) => handleStyleChange(control.name, val)}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ):inspectorTab==='style'? (
                                                    <p className="text-xs text-gray-900 py-3">No style controls</p>
                                                ):null}

                                                {inspectorTab==='advanced'&&schema.advanced&&schema.advanced.length>0? (
                                                    <div className="space-y-2">
                                                        {schema.advanced.map((control) => {
                                                            // Get base desktop value
                                                            const desktopValue=selectedNode.advanced?.[control.name]??control.default;

                                                            // Get device-specific override if responsive control
                                                            let displayValue=desktopValue;
                                                            if (control.responsive&&currentDevice!=='desktop') {
                                                                const deviceValue=selectedNode.responsive?.[currentDevice as 'desktop'|'tablet'|'mobile']?.advanced?.[control.name];
                                                                if (deviceValue!==undefined) {
                                                                    displayValue=deviceValue;
                                                                }
                                                            }

                                                            return (
                                                                <div key={control.name||control.label}>
                                                                    <ControlRenderer
                                                                        control={control}
                                                                        value={displayValue}
                                                                        onChange={(val) => handleAdvancedChange(control.name, val)}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ):inspectorTab==='advanced'? (
                                                    <p className="text-xs text-gray-900 py-3">No advanced controls</p>
                                                ):null}
                                            </>
                                        ):(
                                            <p className="text-xs text-gray-900 py-3">No schema available for this element</p>
                                        )}
                                    </div>
                                </>
                            ):(
                                <div className="text-center py-8">
                                    <p className="text-gray-900 text-sm flex items-center justify-center gap-2">
                                        <i className="fas fa-chevron-right"></i>
                                        <span>Select an element on canvas to edit</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>

            {/* Layout Selector Modal */}
            {showLayoutSelector&&!selectedLayout&&(
                <LayoutSelector
                    onSelect={handleLayoutSelect}
                    onClose={() => {
                        setShowLayoutSelector(false);
                        setSelectedLayout(null);
                    }}
                />
            )}

            {/* Structure Selector Modal */}
            {showLayoutSelector&&selectedLayout&&(
                <StructureSelector
                    layout={selectedLayout}
                    onSelect={handleStructureSelect}
                    onBack={() => setSelectedLayout(null)}
                    onClose={() => {
                        setShowLayoutSelector(false);
                        setSelectedLayout(null);
                    }}
                />
            )}
        </div>

    );
};

export default LeftPanel;
