/**
 * Node Tree Schema for Elementor-like Page Builder
 * Immutable tree structure with helper functions for operations
 */

/**
 * Node structure:
 * {
 *   id: string (unique identifier)
 *   kind: 'root' | 'section' | 'column' | 'widget' (node types)
 *   widgetType: string (for widgets, e.g., 'heading', 'text', 'button')
 *   props: object (component-specific properties)
 *   style: object (CSS styles: padding, margin, bg, typography, etc.)
 *   advanced: object (advanced settings)
 *   children: Node[] (child nodes)
 * }
 */

/**
 * Create a new node
 */
export const createNode = (id, kind, props = {}, style = {}, children = [], widgetType = null) => ({
  id,
  kind,
  widgetType,
  props,
  style,
  advanced: {},
  children
});

/**
 * Find a node by ID recursively
 */
export const findNode = (node, targetId) => {
  if (node.id === targetId) return node;
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      const result = findNode(child, targetId);
      if (result) return result;
    }
  }
  return null;
};

/**
 * Find node and its parent path
 */
export const findNodeWithPath = (node, targetId, path = []) => {
  const currentPath = [...path, node];
  if (node.id === targetId) {
    return { node, path: currentPath };
  }
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      const result = findNodeWithPath(child, targetId, currentPath);
      if (result) return result;
    }
  }
  return null;
};

/**
 * Insert a node at specified path (immutable)
 */
export const insertNode = (root, parentId, newNode, index = -1) => {
  const result = findNodeWithPath(root, parentId);
  if (!result) return root; // Parent not found

  const { path } = result;
  return updateNodeInTree(root, path, (parent) => {
    const children = [...(parent.children || [])];
    if (index === -1 || index >= children.length) {
      children.push(newNode);
    } else {
      children.splice(index, 0, newNode);
    }
    return { ...parent, children };
  });
};

/**
 * Remove a node by ID (immutable)
 */
export const removeNode = (root, nodeId) => {
  const result = findNodeWithPath(root, nodeId);
  if (!result) return root;

  const { path } = result;
  if (path.length === 1) {
    // Cannot remove root
    return root;
  }

  // Get parent path
  const parentPath = path.slice(0, -1);
  return updateNodeInTree(root, parentPath, (parent) => ({
    ...parent,
    children: (parent.children || []).filter((child) => child.id !== nodeId)
  }));
};

/**
 * Update a node's properties (immutable)
 */
export const updateNode = (root, nodeId, updates) => {
  const result = findNodeWithPath(root, nodeId);
  if (!result) return root;

  const { path } = result;
  return updateNodeInTree(root, path, (node) => {
    // Extract special properties that shouldn't be spread at root level
    const { props, style, responsive, advanced, ...restUpdates } = updates;
    
    return {
      ...node,
      ...restUpdates,
      props: props !== undefined ? props : node.props,
      style: style !== undefined ? style : node.style,
      responsive: responsive !== undefined ? responsive : node.responsive,
      advanced: advanced !== undefined ? advanced : node.advanced
    };
  });
};

/**
 * Move a node from one parent to another (immutable)
 */
export const moveNode = (root, nodeId, targetParentId, index = -1) => {
  const result = findNodeWithPath(root, nodeId);
  if (!result) return root;

  const nodeToMove = result.node;
  // Remove from current location
  let updated = removeNode(root, nodeId);
  // Insert at new location
  updated = insertNode(updated, targetParentId, nodeToMove, index);
  return updated;
};

/**
 * Duplicate a node (creates new IDs for node and all children)
 */
export const duplicateNode = (root, nodeId) => {
  const result = findNodeWithPath(root, nodeId);
  if (!result) return root;

  const { node, path } = result;
  const duplicated = deepCloneWithNewIds(node);

  if (path.length === 1) {
    // Duplicating root - return as new sibling is not applicable
    return root;
  }

  const parentPath = path.slice(0, -1);
  const parentIndex = path[path.length - 1].children?.indexOf(node) || -1;

  return updateNodeInTree(root, parentPath, (parent) => {
    const children = [...(parent.children || [])];
    children.splice(parentIndex + 1, 0, duplicated);
    return { ...parent, children };
  });
};

/**
 * Reorder children of a node
 */
export const reorderChildren = (root, parentId, fromIndex, toIndex) => {
  const result = findNodeWithPath(root, parentId);
  if (!result) return root;

  return updateNodeInTree(root, [...result.path], (parent) => {
    const children = [...(parent.children || [])];
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= children.length || toIndex >= children.length) {
      return parent;
    }
    const [movedChild] = children.splice(fromIndex, 1);
    children.splice(toIndex, 0, movedChild);
    return { ...parent, children };
  });
};

/**
 * Get all nodes of a specific kind (e.g., all 'widget' nodes)
 */
export const getAllNodesOfType = (node, kind, results = []) => {
  if (node.kind === kind) {
    results.push(node);
  }
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      getAllNodesOfType(child, kind, results);
    }
  }
  return results;
};

/**
 * Helper: Update a node at a specific path (used internally)
 */
const updateNodeInTree = (root, path, updateFn) => {
  if (path.length === 0) return root;

  if (path.length === 1) {
    // Updating root
    return updateFn(root);
  }

  // Recursively update
  const [first, ...rest] = path;
  return {
    ...first,
    children: first.children.map((child) => {
      if (child.id === rest[0].id) {
        return updateNodeInTree(child, rest, updateFn);
      }
      return child;
    })
  };
};

/**
 * Helper: Deep clone a node tree and assign new IDs
 */
const deepCloneWithNewIds = (node, idMap = new Map()) => {
  const oldId = node.id;
  const newId = `${node.kind}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  idMap.set(oldId, newId);

  return {
    ...node,
    id: newId,
    children: node.children
      ? node.children.map((child) => deepCloneWithNewIds(child, idMap))
      : []
  };
};

/**
 * Flatten tree into array for quick lookup
 */
export const flattenTree = (node, results = []) => {
  results.push(node);
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      flattenTree(child, results);
    }
  }
  return results;
};

/**
 * Get breadcrumb path to a node (array of nodes from root to target)
 */
export const getBreadcrumb = (root, nodeId) => {
  const result = findNodeWithPath(root, nodeId);
  return result ? result.path : [];
};

/**
 * Validate tree structure
 */
export const validateTree = (node, visited = new Set()) => {
  if (visited.has(node.id)) {
    return { valid: false, error: `Circular reference detected: ${node.id}` };
  }
  visited.add(node.id);

  if (!node.id || !node.kind) {
    return { valid: false, error: 'Node missing id or kind' };
  }

  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      const result = validateTree(child, visited);
      if (!result.valid) return result;
    }
  }

  return { valid: true };
};
