import React from 'react';
import { useElementorBuilder } from '../../context/ElementorBuilderContext';


/**
 * BreadcrumbNav - Shows path to selected node
 */
const BreadcrumbNav = () => {
    const { getBreadcrumbPath, selectNode, selectedNodeId } = useElementorBuilder();

    const breadcrumb = getBreadcrumbPath();

    if (breadcrumb.length === 0) {
        return (
            <div className="bg-white border-b border-gray-200 px-4 py-3">
                <p className="text-sm text-gray-900">Select an element to see its path</p>
            </div>
        );
    }

    return (
        <div className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-auto">
            <div className="flex items-center gap-2 text-sm">
                {breadcrumb.map((node, index) => (
                    <React.Fragment key={node.id}>
                        {index > 0 && <i className="fas fa-chevron-right text-gray-400" style={{ fontSize: '12px' }}></i>}
                        <button
                            onClick={() => selectNode(node.id)}
                            className={`px-3 py-1 rounded transition ${node.id === selectedNodeId
                                ? 'bg-gray-200 text-blue-700 font-semibold'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {formatNodeLabel(node)}
                        </button>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

function formatNodeLabel(node) {
    if (node.kind === 'root') return 'Page';
    if (node.kind === 'section') return 'Section';
    if (node.kind === 'column') return 'Column';
    if (node.kind === 'widget') return node.widgetType?.charAt(0).toUpperCase() + node.widgetType?.slice(1) || 'Widget';
    return node.kind?.charAt(0).toUpperCase() + node.kind?.slice(1) || 'Unknown';
}

export default BreadcrumbNav;
