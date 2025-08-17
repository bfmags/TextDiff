import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Version } from './types';
import { INITIAL_VERSION, GEMINI_REVIEW_PROMPT } from './constants';
import useLocalStorage from './hooks/useLocalStorage';
import Header from './components/Header';
import EditorPane from './components/EditorPane';
import DiffPane from './components/DiffPane';
import SaveVersionModal from './components/SaveVersionModal';
import InfoModal from './components/InfoModal';

export default function App(): React.ReactNode {
  const [versions, setVersions] = useLocalStorage<Version[]>('novel-versions', [INITIAL_VERSION]);
  const [currentText, setCurrentText] = useState<string>('');
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [comparisonVersionId, setComparisonVersionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [isSyncScroll, setIsSyncScroll] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  const editorScrollRef = useRef<HTMLDivElement>(null);
  const diffScrollRef = useRef<HTMLDivElement>(null);
  const syncInProgress = useRef(false);

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

  useEffect(() => {
    const editorEl = editorScrollRef.current;
    const diffEl = diffScrollRef.current;

    if (!editorEl || !diffEl) {
      return;
    }

    const handleEditorScroll = () => {
      if (syncInProgress.current) return;
      syncInProgress.current = true;
      
      const scrollableHeight = editorEl.scrollHeight - editorEl.clientHeight;
      if (scrollableHeight > 0) {
        const ratio = editorEl.scrollTop / scrollableHeight;
        diffEl.scrollTop = ratio * (diffEl.scrollHeight - diffEl.clientHeight);
      }

      requestAnimationFrame(() => {
        syncInProgress.current = false;
      });
    };
    
    const handleDiffScroll = () => {
      if (syncInProgress.current) return;
      syncInProgress.current = true;

      const scrollableHeight = diffEl.scrollHeight - diffEl.clientHeight;
      if (scrollableHeight > 0) {
        const ratio = diffEl.scrollTop / scrollableHeight;
        editorEl.scrollTop = ratio * (editorEl.scrollHeight - editorEl.clientHeight);
      }
      
      requestAnimationFrame(() => {
        syncInProgress.current = false;
      });
    };

    if (isSyncScroll) {
      // When sync is turned on, match diff pane to editor pane
      const scrollableHeight = editorEl.scrollHeight - editorEl.clientHeight;
      if (scrollableHeight > 0) {
        const ratio = editorEl.scrollTop / scrollableHeight;
        diffEl.scrollTop = ratio * (diffEl.scrollHeight - diffEl.clientHeight);
      }

      editorEl.addEventListener('scroll', handleEditorScroll);
      diffEl.addEventListener('scroll', handleDiffScroll);
    }

    return () => {
      editorEl.removeEventListener('scroll', handleEditorScroll);
      diffEl.removeEventListener('scroll', handleDiffScroll);
    };
  }, [isSyncScroll]);


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
    navigator.clipboard.writeText(currentText).then(() => {
      // Maybe show a success message later
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text to clipboard.');
    });
  };

  const handleToggleSyncScroll = () => {
    setIsSyncScroll(prev => !prev);
  };

  const handleGeminiReview = async () => {
    setIsReviewing(true);
    try {
      if (!process.env.API_KEY) {
        alert('API_KEY environment variable not set.');
        return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const fullPrompt = `${GEMINI_REVIEW_PROMPT}\n\nPlease apply these editing rules to the following text:\n\n---\n${currentText}\n---`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      });

      const reviewedText = response.text;
      if (!reviewedText) {
        throw new Error('Received an empty response from the AI.');
      }
      
      const reviewNumbers = versions
        .map(v => {
          const match = v.name.match(/^R(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => num > 0);

      const maxReviewNumber = reviewNumbers.length > 0 ? Math.max(...reviewNumbers) : 0;
      const nextReviewNumber = maxReviewNumber + 1;
      
      const newVersionName = `R${nextReviewNumber} - Review ${new Date().toLocaleString()}`;
      const newVersion: Version = {
        id: `version-${Date.now()}`,
        name: newVersionName,
        content: reviewedText,
        createdAt: new Date().toISOString(),
      };
      
      const updatedVersions = [...versions, newVersion];
      setVersions(updatedVersions);

      setCurrentText(reviewedText);
      setActiveVersionId(newVersion.id);
      setEditorKey(prevKey => prevKey + 1);

    } catch (error) {
      console.error('Gemini review failed:', error);
      alert('An error occurred during the AI review. Please check the console for details.');
    } finally {
      setIsReviewing(false);
    }
  };


  return (
    <div className="flex flex-col h-screen bg-brand-bg text-brand-text font-sans">
      <Header onInfoClick={() => setIsInfoModalOpen(true)} />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-hidden">
        <EditorPane
          editorKey={editorKey}
          content={currentText}
          onChange={handleTextChange}
          versionName={activeVersionName}
          versions={versions}
          activeVersionId={activeVersionId}
          onLoadEditor={handleLoadEditor}
          onSave={() => setIsModalOpen(true)}
          onFileUpload={handleFileUpload}
          onCopyToClipboard={handleCopyToClipboard}
          scrollRef={editorScrollRef}
          onGeminiReview={handleGeminiReview}
          isReviewing={isReviewing}
        />
        <DiffPane
          currentText={currentText}
          comparisonText={comparisonText}
          comparisonVersionId={comparisonVersionId}
          versions={versions}
          onLoadComparison={handleLoadComparison}
          scrollRef={diffScrollRef}
          isSyncScroll={isSyncScroll}
          onToggleSyncScroll={handleToggleSyncScroll}
        />
      </main>
      <SaveVersionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}