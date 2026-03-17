/**
 * Widget Registry Types
 */

import React from 'react';
import { WidgetControls } from '../../controls/types/index';

export interface RegisteredWidget {
    widgetType: string;
    name: string;
    icon: string;
    renderer: React.ComponentType<any>;
    schema: WidgetControls;
    defaultProps?: Record<string, any>;
    category?: string;
}
