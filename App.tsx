import React, { useState, useEffect, useMemo } from 'react';
import { Version } from './types';
import { INITIAL_VERSION } from './constants';
import useLocalStorage from './hooks/useLocalStorage';
import Header from './components/Header';
import EditorPane from './components/EditorPane';
import DiffPane from './components/DiffPane';
import SaveVersionModal from './components/SaveVersionModal';

export default function App(): React.ReactNode {
  const [versions, setVersions] = useLocalStorage<Version[]>('novel-versions', [INITIAL_VERSION]);
  const [currentText, setCurrentText] = useState<string>('');
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [comparisonVersionId, setComparisonVersionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    // This effect runs once on mount to initialize the editor state from `versions`.
    let versionToLoad: Version;

    if (versions.length > 0) {
      // Load the latest version
      versionToLoad = versions[versions.length - 1];
    } else {
      // This case happens if localStorage contains an invalid or empty array.
      // We reset to the initial version.
      versionToLoad = INITIAL_VERSION;
      setVersions([INITIAL_VERSION]);
    }

    setActiveVersionId(versionToLoad.id);
    setCurrentText(versionToLoad.content);
    setEditorKey(prevKey => prevKey + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const comparisonText = useMemo(() => {
    if (!comparisonVersionId) return '';
    const version = versions.find(v => v.id === comparisonVersionId);
    return version ? version.content : '';
  }, [comparisonVersionId, versions]);
  
  const activeVersionName = useMemo(() => {
     if (!activeVersionId) return 'Unsaved Changes';
     const version = versions.find(v => v.id === activeVersionId);
     return version ? version.name : 'Unsaved Changes';
  }, [activeVersionId, versions]);

  const handleTextChange = (newText: string) => {
    setCurrentText(newText);
    const activeVersion = versions.find(v => v.id === activeVersionId);
    if(activeVersion && activeVersion.content !== newText) {
        setActiveVersionId(null);
    }
  };

  const handleSave = (versionName: string) => {
    const newVersion: Version = {
      id: `version-${Date.now()}`,
      name: versionName,
      content: currentText,
      createdAt: new Date().toISOString(),
    };
    const updatedVersions = [...versions, newVersion];
    setVersions(updatedVersions);
    setActiveVersionId(newVersion.id);
    setIsModalOpen(false);
  };

  const handleLoadEditor = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setCurrentText(version.content);
      setActiveVersionId(version.id);
      setEditorKey(prevKey => prevKey + 1);
    }
  };
  
  const handleLoadComparison = (versionId: string) => {
    setComparisonVersionId(versionId);
  };

  const handleFileUpload = (file: File) => {
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCurrentText(text);
        setActiveVersionId(null); // Mark as unsaved changes
        setEditorKey(prevKey => prevKey + 1); // Force editor to re-initialize with new content
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid .txt file.');
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(currentText).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text to clipboard.');
    });
  };

  return (
    <div className="flex flex-col h-screen bg-brand-bg text-brand-text font-sans">
      <Header
        versions={versions}
        activeVersionId={activeVersionId}
        comparisonVersionId={comparisonVersionId}
        onLoadEditor={handleLoadEditor}
        onLoadComparison={handleLoadComparison}
        onSave={() => setIsModalOpen(true)}
        onFileUpload={handleFileUpload}
        onCopyToClipboard={handleCopyToClipboard}
      />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-hidden">
        <EditorPane
          editorKey={editorKey}
          content={currentText}
          onChange={handleTextChange}
          versionName={activeVersionName}
        />
        <DiffPane
          currentText={currentText}
          comparisonText={comparisonText}
          comparisonVersionId={comparisonVersionId}
          versions={versions}
        />
      </main>
      <SaveVersionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}