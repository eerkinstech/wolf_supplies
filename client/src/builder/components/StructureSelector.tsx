import React from 'react';

interface ColumnStructure {
  id: string;
  name: string;
  columns: number[];
  visual: string;
}

const FLEXBOX_STRUCTURES: ColumnStructure[] = [
  { id: 'flex-1', name: '1 Column', columns: [100], visual: '█' },
  { id: 'flex-2', name: '2 Columns (50-50)', columns: [50, 50], visual: '██' },
  { id: 'flex-2-uneven', name: '2 Columns (33-66)', columns: [33.33, 66.67], visual: '█░████' },
  { id: 'flex-3', name: '3 Columns', columns: [33.33, 33.33, 33.33], visual: '███' },
  { id: 'flex-4', name: '4 Columns', columns: [25, 25, 25, 25], visual: '████' },
  { id: 'flex-5', name: '5 Columns', columns: [20, 20, 20, 20, 20], visual: '█████' },
];

const GRID_STRUCTURES: ColumnStructure[] = [
  { id: 'grid-1', name: '1 Column', columns: [100], visual: '█' },
  { id: 'grid-2', name: '2 Columns', columns: [50, 50], visual: '██' },
  { id: 'grid-2-uneven', name: '2 Columns (33-66)', columns: [33.33, 66.67], visual: '█░████' },
  { id: 'grid-3', name: '3 Columns', columns: [33.33, 33.33, 33.33], visual: '███' },
  { id: 'grid-4', name: '4 Columns', columns: [25, 25, 25, 25], visual: '████' },
  { id: 'grid-2x2', name: '2x2 Grid', columns: [50, 50, 50, 50], visual: '██\n██' },
];

interface StructureSelectorProps {
  layout: 'flexbox' | 'grid';
  onSelect: (structure: ColumnStructure) => void;
  onBack: () => void;
  onClose: () => void;
}

export const StructureSelector: React.FC<StructureSelectorProps> = ({ layout, onSelect, onBack, onClose }) => {
  const structures = layout === 'flexbox' ? FLEXBOX_STRUCTURES : GRID_STRUCTURES;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-5xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack} 
              className="text-gray-600 hover:text-gray-900 text-2xl p-1"
              title="Go back"
            >
              ←
            </button>
            <h2 className="text-xl font-bold text-gray-900">Select your structure</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {structures.map((structure) => (
            <button
              key={structure.id}
              onClick={() => onSelect(structure)}
              className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
              title={structure.name}
            >
              {/* Visual representation */}
              <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center mb-2 group-hover:bg-blue-100 transition">
                {layout === 'flexbox' ? (
                  <div className="flex gap-1 w-full justify-center px-2">
                    {structure.columns.map((width, idx) => (
                      <div
                        key={idx}
                        style={{ width: `${width}%` }}
                        className="h-12 bg-gray-300 rounded group-hover:bg-blue-400 transition"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.max(2, structure.columns.length)}, 1fr)` }}>
                    {structure.columns.map((_, idx) => (
                      <div key={idx} className="w-6 h-6 bg-gray-300 rounded group-hover:bg-blue-400 transition" />
                    ))}
                  </div>
                )}
              </div>
              <span className="text-xs font-semibold text-gray-900 text-center group-hover:text-blue-600 transition">
                {structure.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StructureSelector;
