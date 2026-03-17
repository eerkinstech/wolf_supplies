/**
 * Widget Registry - Auto-registration & Main Export
 */

// Auto-register all widgets first
import './widgets/headingWidget';
import './widgets/textWidget';
import './widgets/buttonWidget';
import './widgets/spacerWidget';
import './widgets/iconlistWidget';
import './widgets/iconWidget';
import './widgets/imageWidget';
import './widgets/dividerWidget';
import './widgets/videoWidget';

// Export types and functions
export type { RegisteredWidget } from './types';
export { registerWidget, getRegisteredWidget, getAllRegisteredWidgets, getWidgetsByCategory, getWidgetRenderer, getWidgetSchemaFromRegistry, getWidgetDefaults } from './registry';
export { default as widgetRegistry } from './registry';
