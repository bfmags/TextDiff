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
import UploadIcon from './icons/UploadIcon';
import CopyIcon from './icons/CopyIcon';
import MenuIcon from './icons/MenuIcon';
import GeminiIcon from './icons/GeminiIcon';


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
  onGeminiReview: () => void;
  isReviewing: boolean;
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
    activeVersionId,
    onLoadEditor,
    onSave,
    onFileUpload,
    onCopyToClipboard,
    scrollRef,
    onGeminiReview,
    isReviewing
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const wordCount = useMemo(() => {
    const words = content.trim().match(/\S+/g);
    return words ? words.length : 0;
  }, [content]);

  const lineCount = useMemo(() => content.split('\n').length, [content]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, menuButtonRef]);

  const handleScroll = () => {
    if (lineNumbersRef.current && scrollRef.current) {
      lineNumbersRef.current.scrollTop = scrollRef.current.scrollTop;
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
      event.target.value = '';
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
          <h2 className="text-lg font-semibold text-white">Editor</h2>
          <p className="text-sm text-brand-text-dim">{versionName}</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="relative group flex items-center px-3 py-2 rounded-md hover:bg-slate-700 transition-colors">
            <LoadIcon />
            <select
              value={activeVersionId || ''}
              onChange={(e) => onLoadEditor(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Load version into editor"
            >
              <option value="" disabled>Load Version</option>
              {versions.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <span className="ml-2 text-sm hidden sm:inline">Load</span>
          </div>
          
          <button
            onClick={onGeminiReview}
            className="group flex items-center px-3 py-2 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isReviewing}
            aria-label="Gemini Review"
          >
            <GeminiIcon />
            <span className="ml-2 text-sm hidden sm:inline">{isReviewing ? 'Reviewing...' : 'Review'}</span>
          </button>

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
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".txt"
                  className="hidden"
                  aria-hidden="true"
                />
                <button
                  onClick={() => { handleUploadClick(); setIsMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-brand-text hover:bg-slate-600 transition-colors"
                  role="menuitem"
                >
                  <UploadIcon />
                  <span>Upload .txt</span>
                </button>
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