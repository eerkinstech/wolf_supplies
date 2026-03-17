import React from 'react';
import { Node } from '../controls/types/index';

interface SpacerWidgetProps {
  node: Node;
  _device?: 'desktop'|'tablet'|'mobile';
  isEditing?: boolean;
  onEdit?: () => void;
  __cssStyle?: Record<string, any>;
}

export const SpacerWidget: React.FC<SpacerWidgetProps>=({ node, _device='desktop', isEditing, onEdit, __cssStyle={} }) => {
  const height=node.props?.height||20;

  return (
    <div
      onClick={onEdit}
      style={{
        height: `${height}px`,
        backgroundColor: isEditing? 'rgba(59, 130, 246, 0.1)':'transparent',
        border: isEditing? '2px dashed #3b82f6':'none',
        cursor: isEditing? 'pointer':'default'
      }}
    />
  );
};

export default SpacerWidget;
