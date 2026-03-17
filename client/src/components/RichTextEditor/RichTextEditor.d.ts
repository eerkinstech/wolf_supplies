import React from 'react';

export interface RichTextEditorProps {
    value?: string;
    onChange?: (html: string) => void;
}

declare const RichTextEditor: React.FC<RichTextEditorProps>;

export default RichTextEditor;
