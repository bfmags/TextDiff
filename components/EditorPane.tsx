import React, { useMemo } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { $getRoot, $createParagraphNode, $createTextNode, EditorState } from 'lexical';

interface EditorPaneProps {
  content: string;
  onChange: (content: string) => void;
  versionName: string;
  editorKey: number;
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

const EditorPane: React.FC<EditorPaneProps> = ({ content, onChange, versionName, editorKey }) => {
  const wordCount = useMemo(() => {
    const words = content.trim().match(/\S+/g);
    return words ? words.length : 0;
  }, [content]);

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
      <div className="p-3 bg-slate-800 border-b border-brand-border">
        <h2 className="text-lg font-semibold text-white">Editor</h2>
        <p className="text-sm text-brand-text-dim">{versionName}</p>
      </div>
      <div className="flex-1 flex overflow-hidden relative">
        <LexicalComposer initialConfig={initialConfig} key={editorKey}>
          <div className="w-full h-full relative overflow-y-auto">
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
      <div className="p-2 text-right text-sm text-brand-text-dim border-t border-brand-border bg-slate-800">
        <span>Word Count: {wordCount}</span>
      </div>
    </div>
  );
};

export default EditorPane;
