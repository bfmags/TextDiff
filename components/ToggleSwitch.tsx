import React from 'react';

interface ToggleSwitchProps {
  isChecked: boolean;
  onChange: () => void;
  label: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isChecked, onChange, label }) => {
  const switchId = React.useId();
  return (
    <label htmlFor={switchId} className="flex items-center cursor-pointer group">
      <span className="mr-3 text-sm text-brand-text-dim group-hover:text-brand-text transition-colors">{label}</span>
      <div className="relative">
        <input
          id={switchId}
          type="checkbox"
          className="sr-only"
          checked={isChecked}
          onChange={onChange}
        />
        <div className={`block w-10 h-6 rounded-full transition-colors ${isChecked ? 'bg-brand-primary' : 'bg-slate-600'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isChecked ? 'translate-x-4' : 'translate-x-0'}`}></div>
      </div>
    </label>
  );
};

export default ToggleSwitch;
