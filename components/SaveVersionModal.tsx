
import React, { useState, useEffect } from 'react';

interface SaveVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (versionName: string) => void;
}

const SaveVersionModal: React.FC<SaveVersionModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset name when modal opens
      setName(`Version ${new Date().toLocaleString()}`);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSaveClick = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div 
        className="bg-brand-surface rounded-lg shadow-xl p-6 w-full max-w-md border border-brand-border"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h2 className="text-2xl font-bold mb-4 text-white">Save New Version</h2>
        <p className="text-brand-text-dim mb-4">Enter a name for the current version of your text.</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-800 text-brand-text border border-brand-border rounded-md p-2 mb-6 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          placeholder="e.g., Chapter 1 - Second Draft"
          autoFocus
        />
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveVersionModal;
