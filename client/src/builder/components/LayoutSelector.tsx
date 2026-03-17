import React from 'react';

interface LayoutSelectorProps {
    onSelect: (layout: 'flexbox'|'grid') => void;
    onClose: () => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps>=({ onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Which layout would you like to use?</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Flexbox Option */}
                    <button
                        onClick={() => onSelect('flexbox')}
                        className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
                    >
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-black-400 rounded flex items-center justify-center group-hover:from-blue-300 group-hover:to-blue-400 transition">
                            {/* Flexbox visual - side by side */}
                            <div className="flex gap-2">
                                <div className="w-8 h-12 bg-white bg-opacity-70 rounded"></div>
                                <div className="flex flex-col gap-2">
                                    <div className="w-8 h-5 bg-white bg-opacity-70 rounded"></div>
                                    <div className="w-8 h-5 bg-white bg-opacity-70 rounded"></div>
                                </div>
                            </div>
                        </div>
                        <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition">Flexbox</span>
                        <p className="text-xs text-gray-600 text-center">Row-based flexible layout</p>
                    </button>

                    {/* Grid Option */}
                    <button
                        onClick={() => onSelect('grid')}
                        className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
                    >
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-black-400 rounded flex items-center justify-center group-hover:from-blue-300 group-hover:to-blue-400 transition">
                            {/* Grid visual - 2x2 */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="w-6 h-6 bg-white bg-opacity-70 rounded"></div>
                                <div className="w-6 h-6 bg-white bg-opacity-70 rounded"></div>
                                <div className="w-6 h-6 bg-white bg-opacity-70 rounded"></div>
                                <div className="w-6 h-6 bg-white bg-opacity-70 rounded"></div>
                            </div>
                        </div>
                        <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition">Grid</span>
                        <p className="text-xs text-gray-600 text-center">Column-based grid layout</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LayoutSelector;
