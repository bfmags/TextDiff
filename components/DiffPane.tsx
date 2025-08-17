
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Version } from '../types';
import TrashIcon from './icons/TrashIcon';
import MenuIcon from './icons/MenuIcon';
import LoadIcon from './icons/LoadIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

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
  onComparisonTextChange: (newText: string) => void;
  versionName: string;
  versions: Version[];
  onLoadComparison: (versionId: string) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  paneTitle: string;
  isManuscriptMode: boolean;
}

const DiffPane: React.FC<DiffPaneProps> = ({ 
  currentText, 
  comparisonText, 
  onComparisonTextChange,
  versionName,
  versions, 
  onLoadComparison, 
  scrollRef, 
  paneTitle,
  isManuscriptMode,
}) => {
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoadSubMenuOpen, setIsLoadSubMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, menuButtonRef]);

  useEffect(() => {
    if (!isMenuOpen) {
      setIsLoadSubMenuOpen(false);
    }
  }, [isMenuOpen]);

  const diffResult = useMemo(() => {
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

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text/plain');
    onComparisonTextChange(pastedText);
  };

  const renderDiff = () => {
    if (!comparisonText && !isManuscriptMode) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-brand-text-dim pointer-events-none">Paste text here, or load a version to compare.</p>
        </div>
      );
    }
    
    if (!diffResult) {
       return <div className="text-brand-text whitespace-pre-wrap text-base leading-relaxed tracking-wide font-mono">{comparisonText}</div>;
    }

    return (
      <div className="text-brand-text whitespace-pre-wrap text-base leading-relaxed tracking-wide font-mono">
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
          <h2 className="text-lg font-semibold text-white">{paneTitle}</h2>
          <p className="text-sm text-brand-text-dim">{versionName}</p>
        </div>
        {!isManuscriptMode && (
        <div className="flex items-center gap-2">
           <div className="relative">
            <button
              ref={menuButtonRef}
              onClick={() => setIsMenuOpen(prev => !prev)}
              className="p-2 rounded-full hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-brand-primary"
              aria-label="More actions"
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
            >
              <MenuIcon />
            </button>
            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full mt-2 w-48 bg-slate-700 rounded-md shadow-lg border border-brand-border z-10 py-1"
                role="menu"
                aria-orientation="vertical"
              >
                <div className="relative" onMouseLeave={() => setIsLoadSubMenuOpen(false)}>
                    <button
                        onClick={() => setIsLoadSubMenuOpen(p => !p)}
                        onMouseEnter={() => setIsLoadSubMenuOpen(true)}
                        className="w-full text-left flex items-center justify-between gap-3 px-4 py-2 text-sm text-brand-text hover:bg-slate-600 transition-colors"
                        role="menuitem"
                        aria-haspopup="true"
                        aria-expanded={isLoadSubMenuOpen}
                    >
                        <div className="flex items-center gap-3">
                            <LoadIcon />
                            <span>Load to Compare</span>
                        </div>
                        <ChevronRightIcon />
                    </button>
                    {isLoadSubMenuOpen && versions.length > 0 && (
                        <div className="absolute right-full top-0 mt-[-0.25rem] w-64 max-h-72 overflow-y-auto bg-slate-600 rounded-md shadow-lg border border-brand-border z-20 py-1">
                        {versions.slice().reverse().map(v => (
                            <button
                                key={v.id}
                                onClick={() => { onLoadComparison(v.id); setIsMenuOpen(false); }}
                                className="w-full text-left truncate px-4 py-2 text-sm text-brand-text hover:bg-slate-500 transition-colors"
                                role="menuitem"
                                title={v.name}
                            >
                            {v.name}
                            </button>
                        ))}
                        </div>
                    )}
                </div>
                <div className="my-1 border-t border-slate-600"></div>
                <button
                  onClick={() => { onComparisonTextChange(''); setIsMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-slate-600 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  role="menuitem"
                  disabled={!comparisonText.trim()}
                >
                  <TrashIcon />
                  <span>Clear Text</span>
                </button>
              </div>
            )}
          </div>
        </div>
        )}
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
        <div 
            ref={scrollRef} 
            onScroll={handleScroll} 
            className="flex-1 overflow-y-auto focus:outline-none p-4"
            onPaste={!isManuscriptMode ? handlePaste : undefined}
            contentEditable={!isManuscriptMode}
            suppressContentEditableWarning={true}
            style={{ caretColor: 'white' }}
            aria-label="Comparison text, paste to replace"
        >
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
