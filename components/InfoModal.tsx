import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-brand-surface rounded-lg shadow-xl p-8 w-full max-w-md border border-brand-border text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-brand-text text-lg italic my-6 leading-relaxed">
          DiffPulse. Every edit is a rite. Every splice, a reckoning. (c) bfmags
        </p>
        <div className="flex justify-center mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover transition-colors"
            aria-label="Close modal"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;