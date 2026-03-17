/**
 * Node Factory - Create new nodes with default structure
 */

import { Node } from '../controls/types/index';
import { generateId } from './treeOps';

/**
 * Create a section node
 * Section now directly contains columns (no container layer)
 */
export const createSectionNode=(overrides?: Partial<Node>): Node => {
    return {
        id: generateId(),
        kind: 'section',
        children: [],
        props: {
            numColumns: 2,
            contentWidth: 'full'
        },
        style: {
            backgroundColor: '#ffffff',
            padding: '40px',
            gap: '20px'
        },
        advanced: {
            display: 'grid',
            customClass: ''
        },
        ...overrides
    };
};

/**
 * Create a column node
 */
export const createColumnNode=(overrides?: Partial<Node>): Node => {
    return {
        id: generateId(),
        kind: 'column',
        children: [],
        props: {
            verticalAlign: 'flex-start',
            horizontalAlign: 'flex-start'
        },
        style: {
            backgroundColor: 'transparent'
        },
        advanced: {
            display: 'flex',
            flexDirection: 'column',
            width: 50
        },
        ...overrides
    };
};

/**
 * Create a widget node
 */
export const createWidgetNode=(
    widgetType: string,
    defaultProps?: Record<string, any>,
    overrides?: Partial<Node>
): Node => {
    return {
        id: generateId(),
        kind: 'widget',
        widgetType,
        children: [],
        props: defaultProps||{},
        style: {},
        advanced: {},
        ...overrides
    };
};

/**
 * Create a root node (for page)
 */
export const createRootNode=(): Node => {
    return {
        id: 'root',
        kind: 'section',
        children: [
            createSectionNode({
                id: generateId(),
                children: [
                    createColumnNode({ id: generateId() }),
                    createColumnNode({ id: generateId() })
                ]
            })
        ],
        props: {},
        style: {},
        advanced: {}
    };
};
