import React, { useState, useRef } from 'react';

interface ManuscriptUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

const ManuscriptUploadModal: React.FC<ManuscriptUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) {
    return null;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };
  
  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setFile(event.dataTransfer.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div 
        className="bg-brand-surface rounded-lg shadow-xl p-6 w-full max-w-md border border-brand-border"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-white">Analyze Manuscript</h2>
        <p className="text-brand-text-dim mb-6">Upload a .txt file to generate a stylistic report and begin editing by chunks.</p>
        
        <label
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          htmlFor="manuscript-upload"
          className="flex justify-center w-full h-32 px-4 transition bg-slate-800 border-2 border-brand-border border-dashed rounded-md appearance-none cursor-pointer hover:border-brand-primary focus:outline-none">
            <span className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-brand-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="font-medium text-brand-text-dim">
                    {file ? file.name : 'Drop a .txt file, or click to select'}
                </span>
            </span>
            <input 
              id="manuscript-upload"
              ref={fileInputRef}
              type="file" 
              name="file_upload" 
              className="hidden" 
              accept=".txt"
              onChange={handleFileChange}
            />
        </label>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUploadClick}
            disabled={!file}
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analyze & Load
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManuscriptUploadModal;
