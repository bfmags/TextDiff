import React, { useRef } from 'react';
import { Version } from '../types';
import SaveIcon from './icons/SaveIcon';
import LoadIcon from './icons/LoadIcon';
import DiffIcon from './icons/DiffIcon';
import UploadIcon from './icons/UploadIcon';
import CopyIcon from './icons/CopyIcon';

interface HeaderProps {
  versions: Version[];
  activeVersionId: string | null;
  comparisonVersionId: string | null;
  onLoadEditor: (versionId: string) => void;
  onLoadComparison: (versionId: string) => void;
  onSave: () => void;
  onFileUpload: (file: File) => void;
  onCopyToClipboard: () => void;
}

const Header: React.FC<HeaderProps> = ({
  versions,
  activeVersionId,
  comparisonVersionId,
  onLoadEditor,
  onLoadComparison,
  onSave,
  onFileUpload,
  onCopyToClipboard,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
      // Reset input to allow uploading the same file again
      event.target.value = '';
    }
  };

  return (
    <header className="bg-brand-surface border-b border-brand-border shadow-md p-3 flex flex-wrap justify-between items-center gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-white">Text Diff Editor</h1>
        <div className="relative group flex items-center">
          <LoadIcon />
          <select
            value={activeVersionId || ''}
            onChange={(e) => onLoadEditor(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Load version into editor"
          >
            <option value="" disabled>Load Version</option>
            {versions.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <span className="ml-2 hidden md:inline">Load</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
         <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".txt"
          className="hidden"
          aria-hidden="true"
         />
         <button
          onClick={handleUploadClick}
          className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-primary"
         >
          <UploadIcon />
          <span className="hidden md:inline">Upload .txt</span>
        </button>
        <button
          onClick={onCopyToClipboard}
          className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-primary"
        >
          <CopyIcon />
          <span className="hidden md:inline">Copy Text</span>
        </button>
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-primary"
        >
          <SaveIcon />
          <span className="hidden md:inline">Save Version</span>
        </button>
        <div className="relative group flex items-center">
          <DiffIcon />
          <select
            value={comparisonVersionId || ''}
            onChange={(e) => onLoadComparison(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Select version for comparison"
          >
            <option value="" disabled>Compare With...</option>
            {versions.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <span className="ml-2 hidden md:inline">Compare</span>
        </div>
      </div>
    </header>
  );
};

export default Header;