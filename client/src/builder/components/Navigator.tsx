/**
 * Navigator - Tree structure view of the page hierarchy
 * Shows all sections, columns, and widgets in a collapsible tree
 */

import React, { useState, useContext } from 'react';
import { Node } from '../controls/types/index';
import ElementorBuilderContext from '../../context/ElementorBuilderContext';


interface NavigatorProps {
    onSelectNode?: (nodeId: string) => void;
    selectedNodeId?: string|null;
}

export const Navigator: React.FC<NavigatorProps>=({
    onSelectNode,
    selectedNodeId
}) => {
    const context=useContext(ElementorBuilderContext);
    const [expandedNodes, setExpandedNodes]=useState<Set<string>>(new Set());

    if (!context||!context.rootNode) {
        return <div className="p-4 text-gray-900 text-sm">No page structure</div>;
    }

    const { rootNode, updateNodeAdvanced, findNode }=context;

    const toggleNode=(nodeId: string) => {
        const newExpanded=new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const getNodeIcon=(node: Node) => {
        switch (node.kind) {
            case 'section':
                return <i className="fas fa-layer-group text-black"></i>;
            case 'column':
                return <i className="fas fa-columns text-blue-600"></i>;
            case 'widget':
                return <i className="fas fa-boxes text-gray-400"></i>;
            default:
                return <i className="fas fa-boxes"></i>;
        }
    };

    const getNodeLabel=(node: Node) => {
        if (node.kind==='widget') {
            return node.widgetType||'Widget';
        }
        if (node.kind==='section') {
            return `Section (${node.children?.length||0} columns)`;
        }
        if (node.kind==='column') {
            return `Column (${node.children?.length||0} items)`;
        }
        return node.kind;
    };

    const handleVisibilityToggle=(e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        const node=findNode(nodeId);
        if (node) {
            const isHidden=node.advanced?.hidden||false;
            updateNodeAdvanced?.(nodeId, { hidden: !isHidden });
        }
    };

    const renderNode=(node: Node, depth: number=0): React.ReactNode => {
        const hasChildren=node.children&&node.children.length>0;
        const isExpanded=expandedNodes.has(node.id);
        const isSelected=selectedNodeId===node.id;
        const isHidden=node.advanced?.hidden||false;

        return (
            <div key={node.id}>
                {/* Node Item */}
                <div
                    onClick={() => onSelectNode?.(node.id)}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition rounded-md ${isSelected
                        ? 'bg-blue-100 border-l-4 border-blue-600'
                        :'hover:bg-gray-100'
                        }`}
                    style={{ paddingLeft: `${depth*16+12}px` }}
                >
                    {/* Expand/Collapse Arrow */}
                    {hasChildren? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleNode(node.id);
                            }}
                            className="flex items-center justify-center w-4 h-4 text-gray-600 hover:text-gray-900"
                        >
                            {isExpanded? (
                                <i className="fas fa-chevron-down" style={{ fontSize: '12px' }}></i>
                            ):(
                                <i className="fas fa-chevron-right" style={{ fontSize: '12px' }}></i>
                            )}
                        </button>
                    ):(
                        <div className="w-4" />
                    )}

                    {/* Node Icon */}
                    <span className="flex items-center justify-center w-4 h-4">
                        {getNodeIcon(node)}
                    </span>

                    {/* Node Label */}
                    <span
                        className={`flex-1 text-sm font-medium ${isSelected? 'text-blue-900':'text-gray-700'
                            } ${isHidden? 'opacity-50 line-through':''}`}
                    >
                        {getNodeLabel(node)}
                    </span>

                    {/* Visibility Toggle */}
                    <button
                        onClick={(e) => handleVisibilityToggle(e, node.id)}
                        className={`flex items-center justify-center p-1 rounded transition ${isHidden
                            ? 'text-gray-400 hover:text-gray-600'
                            :'text-gray-900 hover:text-gray-700'
                            }`}
                        title={isHidden? 'Show element':'Hide element'}
                    >
                        {isHidden? (
                            <i className="fas fa-eye-slash" style={{ fontSize: '14px' }}></i>
                        ):(
                            <i className="fas fa-eye" style={{ fontSize: '14px' }}></i>
                        )}
                    </button>
                </div>

                {/* Children */}
                {hasChildren&&isExpanded&&(
                    <div>
                        {node.children!.map((child) =>
                            renderNode(child, depth+1)
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="navigator h-full flex flex-col overflow-hidden bg-white">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <i className="fas fa-layer-group text-gray-600" style={{ fontSize: '16px' }}></i>
                <h3 className="text-sm font-semibold text-gray-800">Structure</h3>
            </div>

            {/* Tree Content */}
            <div className="flex-1 overflow-y-auto">
                {rootNode.children&&rootNode.children.length>0? (
                    <div className="p-2">
                        {(rootNode.children as any[]).map((node: any) => renderNode(node as Node))}
                    </div>
                ):(
                    <div className="p-4 text-center text-gray-900 text-sm">
                        <p>No elements yet</p>
                        <p className="text-xs mt-1">Add sections to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navigator;
