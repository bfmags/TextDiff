import React, { useMemo, useRef } from 'react';
import { Version } from '../types';
import DiffIcon from './icons/DiffIcon';
import ToggleSwitch from './ToggleSwitch';

// Declare the global Diff object from the CDN script for TypeScript
declare const Diff: {
  diffWordsWithSpace(oldStr: string, newStr: string): {
    value: string;
    added?: boolean;
    removed?: boolean;
  }[];
};

interface DiffPaneProps {
  currentText: string;
  comparisonText: string;
  comparisonVersionId: string | null;
  versions: Version[];
  onLoadComparison: (versionId: string) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  isSyncScroll: boolean;
  onToggleSyncScroll: () => void;
}

const DiffPane: React.FC<DiffPaneProps> = ({ 
  currentText, 
  comparisonText, 
  comparisonVersionId, 
  versions, 
  onLoadComparison, 
  scrollRef, 
  isSyncScroll, 
  onToggleSyncScroll 
}) => {
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const comparisonVersionName = useMemo(() => {
     if (!comparisonVersionId) return 'No version selected';
     const version = versions.find(v => v.id === comparisonVersionId);
     return version ? version.name : 'Unknown Version';
  }, [comparisonVersionId, versions]);

  const diffResult = useMemo(() => {
    if (!comparisonText) return null;
    return Diff.diffWordsWithSpace(comparisonText, currentText);
  }, [currentText, comparisonText]);

  const lineCount = useMemo(() => currentText.split('\n').length, [currentText]);

  const wordCount = useMemo(() => {
    const words = comparisonText.trim().match(/\S+/g);
    return words ? words.length : 0;
  }, [comparisonText]);

  const handleScroll = () => {
    if (lineNumbersRef.current && scrollRef.current) {
      lineNumbersRef.current.scrollTop = scrollRef.current.scrollTop;
    }
  };

  const renderDiff = () => {
    if (!comparisonVersionId) {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <p className="text-brand-text-dim">Select a version to compare with.</p>
        </div>
      );
    }
    
    if (!diffResult) {
       return <div className="p-4 text-brand-text whitespace-pre-wrap text-base leading-relaxed tracking-wide">{comparisonText}</div>;
    }

    return (
      <div className="p-4 text-brand-text whitespace-pre-wrap text-base leading-relaxed tracking-wide">
        {diffResult.map((part, index) => {
          const style = {
            backgroundColor: part.added ? 'rgba(16, 185, 129, 0.2)' : part.removed ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
            color: part.added ? '#6EE7B7' : part.removed ? '#FCA5A5' : 'inherit',
            textDecoration: part.removed ? 'line-through' : 'none',
            borderRadius: '2px',
          };
          return (
            <span key={index} style={style}>
              {part.value}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-brand-surface rounded-lg shadow-lg overflow-hidden border border-brand-border">
      <div className="p-3 bg-slate-800 border-b border-brand-border flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold text-white">Comparison</h2>
          <p className="text-sm text-brand-text-dim">{comparisonVersionName}</p>
        </div>
        <div className="flex items-center gap-4">
          <ToggleSwitch 
            label="Sync Scroll"
            isChecked={isSyncScroll}
            onChange={onToggleSyncScroll}
          />
          <div className="relative group flex items-center px-3 py-2 rounded-md hover:bg-slate-700 transition-colors">
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
            <span className="ml-2 text-sm hidden sm:inline">Compare</span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div
          ref={lineNumbersRef}
          className="h-full overflow-y-hidden bg-slate-800/50 pt-4 pr-4 text-right text-brand-text-dim select-none font-mono text-base leading-relaxed"
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="pl-4">{i + 1}</div>
          ))}
        </div>
        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
          {renderDiff()}
        </div>
      </div>
      <div className="p-2 text-right text-sm text-brand-text-dim border-t border-brand-border bg-slate-800">
        <span>Word Count: {wordCount}</span>
      </div>
    </div>
  );
};

export default DiffPane;