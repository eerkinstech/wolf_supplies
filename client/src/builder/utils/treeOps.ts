/**
 * Tree Operations - Immutable operations for building tree
 * All operations return a new tree (no mutations)
 */

import { Node } from '../controls/types/index';

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Find a node by ID in the tree
 */
export const findNode = (root: Node, nodeId: string): Node | null => {
  if (root.id === nodeId) return root;
  if (!root.children) return null;

  for (const child of root.children) {
    const found = findNode(child, nodeId);
    if (found) return found;
  }

  return null;
};

/**
 * Get path to a node (array of nodes from root to target)
 */
export const getNodePath = (root: Node, nodeId: string): Node[] => {
  const path: Node[] = [];

  const traverse = (node: Node): boolean => {
    path.push(node);
    if (node.id === nodeId) return true;

    if (node.children) {
      for (const child of node.children) {
        if (traverse(child)) return true;
      }
    }

    path.pop();
    return false;
  };

  traverse(root);
  return path;
};

/**
 * Count nodes in tree
 */
export const countNodes = (root: Node): number => {
  let count = 1;
  if (root.children) {
    count += root.children.reduce((sum, child) => sum + countNodes(child), 0);
  }
  return count;
};

// ============================================================================
// IMMUTABLE OPERATIONS
// ============================================================================

/**
 * Insert a new node at target location
 * @param root - Root of tree
 * @param parentId - ID of parent node
 * @param newNode - Node to insert
 * @param position - Index within parent's children (default: end)
 */
export const insertNode = (
  root: Node,
  parentId: string,
  newNode: Node,
  position?: number
): Node => {
  return updateNodeDeep(root, parentId, (parent) => {
    const children = parent.children || [];
    const idx = position !== undefined ? Math.min(position, children.length) : children.length;
    return {
      ...parent,
      children: [...children.slice(0, idx), newNode, ...children.slice(idx)],
    };
  });
};

/**
 * Remove a node by ID
 */
export const removeNode = (root: Node, nodeId: string): Node => {
  if (root.id === nodeId) {
    throw new Error('Cannot remove root node');
  }

  return updateNodeDeep(root, nodeId, (_removeNode) => {
    // Find parent and remove this node
    // But we're at the node level, so return null to signal parent to remove it
    return null;
  });
};

/**
 * Update a specific node deeply (recursive)
 * Used internally by insert, remove, update operations
 */
const updateNodeDeep = (
  root: Node,
  targetId: string,
  fn: (node: Node) => Node | null
): Node => {
  if (root.id === targetId) {
    const result = fn(root);
    if (result === null) throw new Error('Cannot remove root node');
    return result;
  }

  if (!root.children || root.children.length === 0) {
    return root;
  }

  const newChildren = root.children
    .map((child) => {
      if (child.id === targetId) {
        const result = fn(child);
        return result; // result will be null if deleted
      }
      return updateNodeDeep(child, targetId, fn);
    })
    .filter((child) => child !== null) as Node[];

  return {
    ...root,
    children: newChildren,
  };
};

/**
 * Update a node's property (supports deep paths like 'props.title' or 'style.padding.top')
 */
export const updateNode = (
  root: Node,
  nodeId: string,
  path: string,
  value: any
): Node => {
  return updateNodeDeep(root, nodeId, (node) => {
    const newNode = { ...node };

    const keys = path.split('.');
    let current: any = newNode;

    // Navigate to parent of target property
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (current[key] === undefined) {
        current[key] = {};
      }
      current[key] = { ...current[key] };
      current = current[key];
    }

    // Set the value
    current[keys[keys.length - 1]] = value;

    return newNode;
  });
};

/**
 * Update multiple properties of a node at once
 * @param root - Root of tree
 * @param nodeId - Node ID to update
 * @param updates - Object with path => value pairs
 */
export const updateNodeMultiple = (
  root: Node,
  nodeId: string,
  updates: Record<string, any>
): Node => {
  let result = root;
  for (const [path, value] of Object.entries(updates)) {
    result = updateNode(result, nodeId, path, value);
  }
  return result;
};

/**
 * Move a node from one parent to another
 */
export const moveNode = (
  root: Node,
  nodeId: string,
  newParentId: string,
  position?: number
): Node => {
  const nodeToMove = findNode(root, nodeId);
  if (!nodeToMove) {
    throw new Error(`Node ${nodeId} not found`);
  }

  // Remove from old location
  let result = removeNode(root, nodeId);

  // Insert at new location
  result = insertNode(result, newParentId, nodeToMove, position);

  return result;
};

/**
 * Duplicate a node (creates deep copy with new IDs)
 */
export const duplicateNode = (root: Node, nodeId: string): Node => {
  const nodeToClone = findNode(root, nodeId);
  if (!nodeToClone) {
    throw new Error(`Node ${nodeId} not found`);
  }

  const clonedNode = createNodeClone(nodeToClone);

  // Insert after original
  const path = getNodePath(root, nodeId);
  if (path.length < 2) {
    throw new Error('Cannot duplicate root node');
  }

  const parentId = path[path.length - 2].id;
  const parentNode = findNode(root, parentId);
  const position = (parentNode?.children || []).findIndex((c) => c.id === nodeId) + 1;

  return insertNode(root, parentId, clonedNode, position);
};

/**
 * Deep clone a node with new IDs
 */
const createNodeClone = (node: Node, idMap = new Map<string, string>()): Node => {
  const newId = generateId();
  idMap.set(node.id, newId);

  return {
    ...node,
    id: newId,
    children: node.children?.map((child) => createNodeClone(child, idMap)),
  };
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Apply multiple operations in sequence (for undo/redo)
 */
export const batchOperations = (
  root: Node,
  operations: Array<(tree: Node) => Node>
): Node => {
  return operations.reduce((tree, op) => op(tree), root);
};

// ============================================================================
// LAYOUT HELPERS
// ============================================================================

/**
 * Get all children of a node
 */
export const getChildren = (root: Node, nodeId: string): Node[] => {
  const node = findNode(root, nodeId);
  return node?.children || [];
};

/**
 * Get siblings of a node
 */
export const getSiblings = (root: Node, nodeId: string): Node[] => {
  const path = getNodePath(root, nodeId);
  if (path.length < 2) return [];
  const parent = path[path.length - 2];
  return (parent.children || []).filter((child) => child.id !== nodeId);
};

/**
 * Get depth of a node in tree
 */
export const getNodeDepth = (root: Node, nodeId: string): number => {
  return getNodePath(root, nodeId).length - 1;
};

/**
 * Check if nodeA is ancestor of nodeB
 */
export const isAncestor = (root: Node, ancestorId: string, nodeId: string): boolean => {
  const path = getNodePath(root, nodeId);
  return path.some((node) => node.id === ancestorId);
};

/**
 * Get all descendant IDs
 */
export const getDescendantIds = (node: Node): string[] => {
  const ids: string[] = [];
  const traverse = (n: Node) => {
    ids.push(n.id);
    n.children?.forEach(traverse);
  };
  traverse(node);
  return ids;
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate tree structure
 */
export const validateTree = (root: Node): string[] => {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  const traverse = (node: Node, depth: number) => {
    // Check for duplicate IDs
    if (seenIds.has(node.id)) {
      errors.push(`Duplicate node ID: ${node.id}`);
    }
    seenIds.add(node.id);

    // Check for valid kinds
    if (!['section', 'column', 'widget'].includes(node.kind)) {
      errors.push(`Invalid kind: ${node.kind}`);
    }

    // Check if widget has widgetType
    if (node.kind === 'widget' && !node.widgetType) {
      errors.push(`Widget node ${node.id} missing widgetType`);
    }

    // Check depth limits (optional)
    if (depth > 10) {
      errors.push(`Node ${node.id} depth exceeds 10`);
    }

    node.children?.forEach((child) => traverse(child, depth + 1));
  };

  traverse(root, 0);
  return errors;
};
