/**
 * Migration: Convert old page config schema to new node-tree schema
 */

import { createNode } from './nodeSchema';

/**
 * Convert old flat sections array to new nested node tree
 *
 * Old schema:
 * { pageName, sections: [{ id, type, order, visible, content, style }] }
 *
 * New schema:
 * {
 *   id: 'root',
 *   type: 'root',
 *   children: [
 *     { id, type: 'section', props: { content }, style, children: [] }
 *   ]
 * }
 */
export const convertOldPageToNewSchema = (oldPageConfig) => {
  if (!oldPageConfig) {
    // Return empty root node
    return createNode('root', 'root', {}, {}, []);
  }

  // Check if already in new schema
  if (oldPageConfig.kind === 'root') {
    return oldPageConfig;
  }

  const sections = oldPageConfig.sections || [];

  // Convert each old section to a new section node
  const children = sections
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((section) => {
      return createNode(
        section.id,
        section.kind || section.type || 'section',
        {
          // Store old content in props
          ...section.content,
          visible: section.visible !== false
        },
        section.style || {},
        section.children || [] // Include nested children if present
      );
    });

  // Create root node containing all sections
  return createNode('root', 'root', {}, {}, children);
};

/**
 * Convert new node-tree schema back to old format for backwards compatibility
 */
export const convertNewSchemaToOld = (rootNode) => {
  if (!rootNode) return { sections: [] };

  // Extract sections from root's children
  const sections = (rootNode.children || []).map((node, index) => ({
    id: node.id,
    kind: node.kind,
    order: index + 1,
    visible: node.props?.visible !== false,
    content: { ...node.props },
    style: node.style || {}
  }));

  return {
    sections,
    pageName: 'converted'
  };
};

/**
 * Check if a page config is in old or new format
 */
export const isNewSchema = (pageConfig) => {
  return pageConfig && (pageConfig.kind === 'root' || pageConfig.type === 'root');
};