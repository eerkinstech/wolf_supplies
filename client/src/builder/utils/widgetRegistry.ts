/**
 * Widget Registry - Re-exports from modular structure
 * For backward compatibility - imports from ./widgetRegistry folder
 */

// Import index.ts to trigger auto-registration of all widgets
import './widgetRegistry/index';

export { registerWidget, getRegisteredWidget, getAllRegisteredWidgets, getWidgetsByCategory, getWidgetRenderer, getWidgetSchemaFromRegistry, getWidgetDefaults } from './widgetRegistry/registry';
export type { RegisteredWidget } from './widgetRegistry/types';
export { default as widgetRegistry } from './widgetRegistry/registry';