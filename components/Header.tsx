import React from 'react';
import InfoIcon from './icons/InfoIcon';

interface HeaderProps {
  onInfoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onInfoClick }) => {
  return (
    <header className="bg-brand-surface border-b border-brand-border shadow-md p-1 flex justify-between items-center">
      <h1 className="text-m font-bold text-white pl-4 p-1">DiffPulse 🖋️</h1>
      <div className="pr-4">
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