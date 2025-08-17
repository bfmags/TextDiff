
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $getRoot, $createParagraphNode, $createTextNode, EditorState } from 'lexical';
import { Version } from '../types';
import SaveIcon from './icons/SaveIcon';
import LoadIcon from './icons/LoadIcon';
import CopyIcon from './icons/CopyIcon';
import MenuIcon from './icons/MenuIcon';
import GeminiIcon from './icons/GeminiIcon';
import TrashIcon from './icons/TrashIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';


interface EditorPaneProps {
  content: string;
  onChange: (content: string) => void;
  versionName: string;
  editorKey: number;
  versions: Version[];
  activeVersionId: string | null;
  onLoadEditor: (versionId: string) => void;
  onSave: () => void;
  onFileUpload: (file: File) => void;
  onCopyToClipboard: () => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  onGeminiReview: (reviewType: 'line' | 'dev' | 'copy') => void;
  isReviewing: boolean;
  onClearEditor: () => void;
  paneTitle: string;
}

const editorTheme = {
  paragraph: 'mb-1',
  ltr: 'text-left',
  rtl: 'text-right',
};

function editorStateInitializer(content: string) {
  return () => {
    const root = $getRoot();
    if (root.isEmpty()) {
      const paragraphs = content.split('\n');
      paragraphs.forEach((pText) => {
        const paragraphNode = $createParagraphNode();
        paragraphNode.append($createTextNode(pText));
        root.append(paragraphNode);
      });
    }
  };
}

function OnChange({ onChange }: { onChange: (text: string) => void }) {
  const handleOnChange = (editorState: EditorState) => {
    editorState.read(() => {
      const text = $getRoot().getTextContent();
      onChange(text);
    });
  };
  return <OnChangePlugin onChange={handleOnChange} />;
}

const EditorPane: React.FC<EditorPaneProps> = ({ 
    content, 
    onChange, 
    versionName, 
    editorKey,
    versions,
    onLoadEditor,
    onSave,
    onCopyToClipboard,
    scrollRef,
    onGeminiReview,
    isReviewing,
    onClearEditor,
    paneTitle
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoadSubMenuOpen, setIsLoadSubMenuOpen] = useState(false);
  const [isReviewMenuOpen, setIsReviewMenuOpen] = useState(false);
  
  const wordCount = useMemo(() => {
    const words = content.trim().match(/\S+/g);
    return words ? words.length : 0;
  }, [content]);

  const lineCount = useMemo(() => content.split('\n').length, [content]);

  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const reviewMenuRef = useRef<HTMLDivElement>(null);
  const reviewButtonRef = useRef<HTMLButtonElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

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
      if (
        reviewMenuRef.current &&
        !reviewMenuRef.current.contains(event.target as Node) &&
        reviewButtonRef.current &&
        !reviewButtonRef.current.contains(event.target as Node)
      ) {
        setIsReviewMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, menuButtonRef, reviewMenuRef, reviewButtonRef]);

  useEffect(() => {
    if (!isMenuOpen) {
      setIsLoadSubMenuOpen(false);
    }
  }, [isMenuOpen]);

  const handleScroll = () => {
    if (lineNumbersRef.current && scrollRef.current) {
      lineNumbersRef.current.scrollTop = scrollRef.current.scrollTop;
    }
  };

  const initialConfig = {
    namespace: 'NovelDiffEditor',
    theme: editorTheme,
    onError: (error: Error) => {
      console.error(error);
    },
    editorState: editorStateInitializer(content),
  };

  return (
    <div className="flex flex-col bg-brand-surface rounded-lg shadow-lg overflow-hidden border border-brand-border">
      <div className="p-3 bg-slate-800 border-b border-brand-border flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold text-white">{paneTitle}</h2>
          <p className="text-sm text-brand-text-dim">{versionName}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
                ref={reviewButtonRef}
                onClick={() => setIsReviewMenuOpen(p => !p)}
                className="group flex items-center px-3 py-2 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isReviewing}
                aria-label="Gemini Review"
                aria-haspopup="true"
                aria-expanded={isReviewMenuOpen}
            >
                <GeminiIcon />
                <span className="ml-2 text-sm hidden sm:inline">{isReviewing ? 'Reviewing...' : 'Review'}</span>
            </button>
            {isReviewMenuOpen && (
              <div
                ref={reviewMenuRef}
                className="absolute right-0 top-full mt-2 w-48 bg-slate-700 rounded-md shadow-lg border border-brand-border z-10 py-1"
                role="menu"
                aria-orientation="vertical"
              >
                <button
                    onClick={() => { onGeminiReview('dev'); setIsReviewMenuOpen(false); }}
                    className="w-full text-left flex flex-col gap-1 px-4 py-2 text-sm text-brand-text hover:bg-slate-600"
                    role="menuitem"
                >
                    <span className="font-semibold">Developmental Edit</span>
                    <span className="text-xs text-brand-text-dim">Pacing, voice, and story.</span>
                </button>
                <button
                    onClick={() => { onGeminiReview('line'); setIsReviewMenuOpen(false); }}
                    className="w-full text-left flex flex-col gap-1 px-4 py-2 text-sm text-brand-text hover:bg-slate-600"
                    role="menuitem"
                >
                    <span className="font-semibold">Line Edit</span>
                    <span className="text-xs text-brand-text-dim">Clarity, flow, and impact.</span>
                </button>
                <button
                    onClick={() => { onGeminiReview('copy'); setIsReviewMenuOpen(false); }}
                    className="w-full text-left flex flex-col gap-1 px-4 py-2 text-sm text-brand-text hover:bg-slate-600"
                    role="menuitem"
                >
                    <span className="font-semibold">Copy Edit</span>
                    <span className="text-xs text-brand-text-dim">Typos, grammar, and polish.</span>
                </button>
              </div>
            )}
          </div>


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
                            <span>Load Version</span>
                        </div>
                        <ChevronRightIcon />
                    </button>
                    {isLoadSubMenuOpen && versions.length > 0 && (
                        <div className="absolute right-full top-0 mt-[-0.25rem] w-64 max-h-72 overflow-y-auto bg-slate-600 rounded-md shadow-lg border border-brand-border z-20 py-1">
                        {versions.slice().reverse().map(v => (
                            <button
                                key={v.id}
                                onClick={() => { onLoadEditor(v.id); setIsMenuOpen(false); }}
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
                <button
                  onClick={() => { onCopyToClipboard(); setIsMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-brand-text hover:bg-slate-600 transition-colors"
                  role="menuitem"
                >
                  <CopyIcon />
                  <span>Copy All</span>
                </button>
                 <button
                  onClick={() => { onSave(); setIsMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-brand-text hover:bg-slate-600 transition-colors"
                  role="menuitem"
                >
                  <SaveIcon />
                  <span>Save Version</span>
                </button>
                <div className="my-1 border-t border-slate-600"></div>
                <button
                  onClick={() => { onClearEditor(); setIsMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-slate-600 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  role="menuitem"
                  disabled={!content.trim()}
                >
                  <TrashIcon />
                  <span>Clear Text</span>
                </button>
              </div>
            )}
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
        <div className="flex-1 relative">
            <LexicalComposer initialConfig={initialConfig} key={editorKey}>
                <div ref={scrollRef} onScroll={handleScroll} className="w-full h-full relative overflow-y-auto">
                    <PlainTextPlugin
                    contentEditable={
                        <ContentEditable
                        className="w-full min-h-full bg-transparent resize-none focus:outline-none text-brand-text p-4 text-base leading-relaxed tracking-wide font-mono"
                        aria-label="Novel editor"
                        />
                    }
                    placeholder={
                        <div className="absolute top-4 left-4 text-brand-text-dim pointer-events-none font-mono">
                        Start writing your novel here...
                        </div>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                    />
                    <OnChange onChange={onChange} />
                    <HistoryPlugin />
                </div>
            </LexicalComposer>
        </div>
      </div>
      <div className="p-2 text-right text-sm text-brand-text-dim border-t border-brand-border bg-slate-800">
        <span>Word Count: {wordCount}</span>
      </div>
    </div>
  );
};

export default EditorPane;
