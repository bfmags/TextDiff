import React from 'react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, report }) => {
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
        className="bg-brand-surface rounded-lg shadow-xl p-6 w-full max-w-3xl border border-brand-border flex flex-col h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-white">Stylistic Analysis Report</h2>
        <div className="flex-1 overflow-y-auto bg-slate-800 p-4 rounded-md">
            <pre className="text-brand-text whitespace-pre-wrap text-sm leading-relaxed tracking-wide font-mono">
                {report}
            </pre>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover transition-colors"
            aria-label="Close report"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
