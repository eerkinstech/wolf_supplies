import React from 'react';

export interface BuilderNode {
    id: string;
    kind: string;
    widgetType?: string;
    props: Record<string, any>;
    style: Record<string, any>;
    advanced: Record<string, any>;
    responsive?: Record<string, any>;
    children?: BuilderNode[];
}

export interface ElementorBuilderContextType {
    rootNode: BuilderNode;
    findNode: (nodeId: string) => BuilderNode | null;
    findNodeWithPath: (nodeId: string) => (BuilderNode | null)[];
    insertNewNode: (parentId: string, newNode: BuilderNode, index?: number) => void;
    updateNodeProps: (nodeId: string, props: Record<string, any>) => void;
    updateNodeStyle: (nodeId: string, style: Record<string, any>) => void;
    updateNodeAdvanced: (nodeId: string, advanced: Record<string, any>) => void;
    deleteNode: (nodeId: string) => void;
    duplicateNodeAction: (nodeId: string) => void;
    moveNode: (nodeId: string, targetParentId: string, targetIndex: number) => void;
    updateNodeResponsiveStyle: (nodeId: string, device: string, style: Record<string, any>) => void;
    updateNodeResponsiveAdvanced: (nodeId: string, device: string, advanced: Record<string, any>) => void;
    getSelectedNode: () => BuilderNode | null;
    clearResponsiveStyle: (nodeId: string, device: string, prop: string) => void;
    clearResponsiveAdvanced: (nodeId: string, device: string, prop: string) => void;
    savePage: () => void;
    selectNode: (nodeId: string | null) => void;
    saveStatus: string;
    currentDevice: 'desktop' | 'tablet' | 'mobile';
    setCurrentDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

declare const ElementorBuilderContext: React.Context<ElementorBuilderContextType | null>;

export interface ElementorBuilderProviderProps {
    children: React.ReactNode;
}

export declare const ElementorBuilderProvider: React.FC<ElementorBuilderProviderProps>;

export declare const useElementorBuilder: () => ElementorBuilderContextType | null;

export default ElementorBuilderContext;
