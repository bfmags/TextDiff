import React from 'react';
import InfoIcon from './icons/InfoIcon';
import ToggleSwitch from './ToggleSwitch';
import BookOpenIcon from './icons/BookOpenIcon';

interface HeaderProps {
  onInfoClick: () => void;
  isSyncScroll: boolean;
  onToggleSyncScroll: () => void;
  onAnalyzeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onInfoClick, isSyncScroll, onToggleSyncScroll, onAnalyzeClick }) => {
  return (
    <header className="bg-brand-surface border-b border-brand-border shadow-md p-1 flex justify-between items-center">
      <h1 className="text-m font-bold text-white pl-4 p-1">DiffPulse 🖋️</h1>
      <div className="flex items-center gap-4 pr-4">
        <button
          onClick={onAnalyzeClick}
          className="p-2 rounded-full hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-brand-primary"
          aria-label="Analyze Manuscript"
        >
          <BookOpenIcon />
        </button>
        <div className="h-6 border-l border-brand-border"></div>
        <ToggleSwitch 
            label="Sync Scroll"
            isChecked={isSyncScroll}
            onChange={onToggleSyncScroll}
        />
        <button
          onClick={onInfoClick}
          className="p-2 rounded-full hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-brand-primary"
          aria-label="About DiffPulse"
        >
          <InfoIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;
