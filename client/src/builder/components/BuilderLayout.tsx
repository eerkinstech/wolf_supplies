/**
 * BuilderLayout - Main layout component for Elementor-like builder
 * Compact 2-panel layout: Left panel (tabbed) + Canvas (main editor)
 */
import React, { useState, useContext } from 'react';
import Canvas from './Canvas';
import LeftPanel from './LeftPanel';
import ElementorBuilderContext from '../../context/ElementorBuilderContext';

interface BuilderLayoutProps {
    title?: string;
}

export const BuilderLayout: React.FC<BuilderLayoutProps> = ({}) => {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const context = useContext(ElementorBuilderContext) || {};
    const { savePage, saveStatus, currentDevice, setCurrentDevice } = context as any;

    const handleSave = async () => {
        if (savePage) {
            await savePage(true);
        }
    };

    return (
        <div className="builder-layout h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="builder-header bg-linear-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
                <div className="flex items-center justify-between">
                    {/* Left: Title */}
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold">Elementor Builder</h1>
                        <span className="text-blue-100 text-sm">home</span>
                    </div>

                    {/* Center: Device Switcher */}
                    <div className="flex items-center gap-2">
                        {(['desktop', 'tablet', 'mobile'] as const).map((dev) => (
                            <button
                                key={dev}
                                onClick={() => setCurrentDevice?.(dev)}
                                className={`px-3 py-2 rounded text-sm font-medium transition ${
                                    currentDevice === dev
                                        ? 'bg-white text-blue-600'
                                        : 'bg-blue-500 text-white hover:bg-blue-400'
                                }`}
                            >
                                {dev === 'desktop' ? '🖥️' : dev === 'tablet' ? '📱 Tablet' : '📱 Mobile'}
                            </button>
                        ))}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-blue-100">6 sections</span>
                        <button 
                            onClick={handleSave}
                            disabled={saveStatus === 'saving'}
                            className={`px-4 py-2 rounded font-semibold transition ${
                                saveStatus === 'saving'
                                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                    : 'bg-white text-blue-600 hover:bg-gray-100'
                            }`}
                        >
                            {saveStatus === 'saving' ? '⏳ Saving...' : saveStatus === 'saved' ? '✓ Saved' : '💾 Save'}
                        </button>
                        <button className="bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-900 transition">
                            ✕ Exit
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content - Two column layout */}
            <div className="builder-content flex flex-1 overflow-hidden">
                {/* Left Panel - Fixed width, tabbed */}
                <div className="builder-left w-80 bg-white border-r border-gray-200 overflow-hidden flex flex-col shadow-sm">
                    <LeftPanel 
                        selectedNodeId={selectedNodeId}
                        onSelectNode={setSelectedNodeId}
                    />
                </div>

                {/* Canvas - Main editor (flex fill) */}
                <div className="builder-canvas flex-1 overflow-hidden">
                    <Canvas device={currentDevice || 'desktop'} onSelectNode={setSelectedNodeId} />
                </div>
            </div>

            {/* Global Styles */}
            <style>{`
                .builder-layout {
                    background: #f5f5f5;
                }

                .builder-header {
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    z-index: 50;
                }

                .builder-content {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }

                .builder-left {
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                }

                .builder-canvas {
                    flex: 1;
                    overflow: auto;
                }

                /* Responsive - hide left panel on small screens */
                @media (max-width: 768px) {
                    .builder-left {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default BuilderLayout;
