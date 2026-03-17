/**
 * Widget Registry Core
 * Manages registration and retrieval of widgets
 */

import { WidgetControls } from '../../controls/types/index';
import { RegisteredWidget } from './types';

const widgetRegistry: Map<string, RegisteredWidget>=new Map();

/**
 * Register a new widget
 */
export const registerWidget=(widget: RegisteredWidget) => {
    widgetRegistry.set(widget.widgetType, widget);
};

/**
 * Get registered widget
 */
export const getRegisteredWidget=(widgetType: string): RegisteredWidget|undefined => {
    return widgetRegistry.get(widgetType);
};

/**
 * Get all registered widgets
 */
export const getAllRegisteredWidgets=(): RegisteredWidget[] => {
    return Array.from(widgetRegistry.values());
};

/**
 * Get widgets by category
 */
export const getWidgetsByCategory=(): Record<string, RegisteredWidget[]> => {
    const byCategory: Record<string, RegisteredWidget[]>={};

    for (const widget of widgetRegistry.values()) {
        const category=widget.category||'Other';
        if (!byCategory[category]) {
            byCategory[category]=[];
        }
        byCategory[category].push(widget);
    }

    return byCategory;
};

/**
 * Get widget renderer
 */
export const getWidgetRenderer=(widgetType: string) => {
    return widgetRegistry.get(widgetType)?.renderer;
};

/**
 * Get widget schema
 */
export const getWidgetSchemaFromRegistry=(widgetType: string): WidgetControls|undefined => {
    return widgetRegistry.get(widgetType)?.schema;
};

/**
 * Get widget default props
 */
export const getWidgetDefaults=(widgetType: string): Record<string, any> => {
    return widgetRegistry.get(widgetType)?.defaultProps||{};
};

export default widgetRegistry;
