import React from 'react';
import { Manuscript } from '../types';

interface ManuscriptSidebarProps {
  manuscript: Manuscript;
  activeChunkId: string | null;
  onSelectChunk: (chunkId: string) => void;
  onViewReport: () => void;
}

const ManuscriptSidebar: React.FC<ManuscriptSidebarProps> = ({
  manuscript,
  activeChunkId,
  onSelectChunk,
  onViewReport,
}) => {
  return (
    <aside className="w-64 bg-brand-surface border-r border-brand-border p-4 flex flex-col">
      <h2 className="text-lg font-bold text-white truncate" title={manuscript.name}>
        {manuscript.name}
      </h2>
      <p className="text-sm text-brand-text-dim mb-4">{manuscript.chunks.length} parts</p>
      
      <button
        onClick={onViewReport}
        className="w-full text-center px-4 py-2 mb-4 bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover transition-colors text-sm"
      >
        View Stylistic Report
      </button>

      <nav className="flex-1 overflow-y-auto">
        <ul>
          {manuscript.chunks.map((chunk) => (
            <li key={chunk.id}>
              <button
                onClick={() => onSelectChunk(chunk.id)}
                className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                  activeChunkId === chunk.id
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-brand-text-dim hover:bg-slate-800 hover:text-brand-text'
                }`}
              >
                {chunk.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default ManuscriptSidebar;
