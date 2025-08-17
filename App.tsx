
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Version, Manuscript, Chunk } from './types';
import { INITIAL_VERSION, GEMINI_REVIEW_PROMPT, MANUSCRIPT_ANALYSIS_PROMPT } from './constants';
import useLocalStorage from './hooks/useLocalStorage';
import { splitTextIntoChunks } from './utils';

import Header from './components/Header';
import EditorPane from './components/EditorPane';
import DiffPane from './components/DiffPane';
import SaveVersionModal from './components/SaveVersionModal';
import InfoModal from './components/InfoModal';
import ManuscriptUploadModal from './components/ManuscriptUploadModal';
import ManuscriptSidebar from './components/ManuscriptSidebar';
import ReportModal from './components/ReportModal';


const BookLoader = () => (
  <div className="book-loader-container">
    <div className="loader book">
      <figure className="page"></figure>
      <figure className="page"></figure>
      <figure className="page"></figure>
    </div>
  </div>
);

export default function App(): React.ReactNode {
  // Manuscript Mode State
  const [manuscript, setManuscript] = useLocalStorage<Manuscript | null>('manuscript', null);
  const [activeChunkId, setActiveChunkId] = useLocalStorage<string | null>('activeChunkId', null);

  // Default Mode State
  const [versions, setVersions] = useLocalStorage<Version[]>('novel-versions', [INITIAL_VERSION]);
  
  // Editor Pane State (Left)
  const [editorText, setEditorText] = useState<string>('');
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewProgress, setReviewProgress] = useState<{ current: number; total: number } | null>(null);

  // Comparison Pane State (Right)
  const [rightText, setRightText] = useState<string>('');
  const [rightVersionId, setRightVersionId] = useState<string | null>(null);
  
  // Shared State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSyncScroll, setIsSyncScroll] = useState(true);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);

  const editorScrollRef = useRef<HTMLDivElement>(null);
  const comparisonScrollRef = useRef<HTMLDivElement>(null);
  const syncInProgress = useRef(false);

  useEffect(() => {
    if (manuscript) {
      const chunk = manuscript.chunks.find(c => c.id === activeChunkId) || manuscript.chunks[0];
      if (chunk) {
        setEditorText(chunk.content);
        setRightText(chunk.content);
        setActiveChunkId(chunk.id);
        setActiveVersionId(null);
      }
    } else {
        if (versions.length > 0) {
        const latestVersion = versions[versions.length - 1];
        setEditorText(latestVersion.content);
        setActiveVersionId(latestVersion.id);

        if (versions.length > 1) {
            const secondLatestVersion = versions[versions.length - 2];
            setRightText(secondLatestVersion.content);
            setRightVersionId(secondLatestVersion.id);
        } else {
            setRightText(latestVersion.content);
            setRightVersionId(latestVersion.id);
        }
        } else {
        setVersions([INITIAL_VERSION]);
        setEditorText(INITIAL_VERSION.content);
        setActiveVersionId(INITIAL_VERSION.id);
        setRightText(INITIAL_VERSION.content);
        setRightVersionId(INITIAL_VERSION.id);
        }
    }
    setEditorKey(prev => prev + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manuscript]);

  useEffect(() => {
    const leftEl = editorScrollRef.current;
    const rightEl = comparisonScrollRef.current;

    if (!leftEl || !rightEl) return;

    const syncScroll = (source: HTMLDivElement, target: HTMLDivElement) => {
        if (syncInProgress.current) return;
        syncInProgress.current = true;
        
        const scrollableHeight = source.scrollHeight - source.clientHeight;
        if (scrollableHeight > 0) {
            const ratio = source.scrollTop / scrollableHeight;
            target.scrollTop = ratio * (target.scrollHeight - target.clientHeight);
        }

        requestAnimationFrame(() => {
            syncInProgress.current = false;
        });
    };

    const handleLeftScroll = () => syncScroll(leftEl, rightEl);
    const handleRightScroll = () => syncScroll(rightEl, leftEl);

    if (isSyncScroll) {
      syncScroll(leftEl, rightEl);
      leftEl.addEventListener('scroll', handleLeftScroll);
      rightEl.addEventListener('scroll', handleRightScroll);
    }

    return () => {
      if (leftEl) leftEl.removeEventListener('scroll', handleLeftScroll);
      if (rightEl) rightEl.removeEventListener('scroll', handleRightScroll);
    };
  }, [isSyncScroll, editorKey, rightText]);


  const editorVersionName = useMemo(() => {
     if (manuscript && activeChunkId) {
        return manuscript.chunks.find(c => c.id === activeChunkId)?.name || 'Manuscript Part';
     }
     if (!activeVersionId) return 'Unsaved Changes';
     const version = versions.find(v => v.id === activeVersionId);
     return version ? version.name : 'Unsaved Changes';
  }, [activeVersionId, versions, manuscript, activeChunkId]);
  
  const rightVersionName = useMemo(() => {
     if (!rightVersionId) return 'Pasted Text';
     const version = versions.find(v => v.id === rightVersionId);
     return version ? version.name : 'Pasted Text';
  }, [rightVersionId, versions]);

  const handleEditorTextChange = (newText: string) => {
    setEditorText(newText);
    if (manuscript) {
        // In manuscript mode, any change is "unsaved" but doesn't detach from the chunk
        // The concept of activeVersionId isn't really used for loading in manuscript mode
    } else {
        const currentVersion = versions.find(v => v.id === activeVersionId);
        if(currentVersion && currentVersion.content !== newText) {
            setActiveVersionId(null);
        }
    }
  };
  
  const handleClearEditor = () => {
    setEditorText('');
    setActiveVersionId(null);
    setEditorKey(prevKey => prevKey + 1);
  };

  const handleOpenSaveModal = () => setIsSaveModalOpen(true);

  const handleSave = (versionName: string) => {
    const newVersion: Version = {
      id: `version-${Date.now()}`,
      name: versionName,
      content: editorText,
      createdAt: new Date().toISOString(),
    };
    
    const updatedVersions = [...versions, newVersion];
    setVersions(updatedVersions);
    if (!manuscript) {
        setActiveVersionId(newVersion.id);
    }
    setIsSaveModalOpen(false);
  };

  const handleLoadEditor = (versionId: string) => {
    if (manuscript) return; // This dropdown is for non-manuscript mode
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setEditorText(version.content);
      setActiveVersionId(version.id);
      setEditorKey(prevKey => prevKey + 1);
    }
  };
  
  const handleLoadRightPane = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setRightText(version.content);
      setRightVersionId(version.id);
    }
  };
  
  const handleRightTextChange = (newText: string) => {
    setRightText(newText);
    const currentVersion = versions.find(v => v.id === rightVersionId);
    if(currentVersion && currentVersion.content !== newText) {
        setRightVersionId(null);
    }
  };

  const handleFileUpload = (file: File) => {
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setManuscript(null); // Exit manuscript mode
        setEditorText(text);
        setActiveVersionId(null);
        setEditorKey(prevKey => prevKey + 1);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid .txt file.');
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(editorText).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text to clipboard.');
    });
  };

  const handleToggleSyncScroll = () => setIsSyncScroll(prev => !prev);

  const handleAnalyzeManuscript = async (file: File) => {
    setIsUploadModalOpen(false);
    setProcessingMessage('Reading manuscript file...');
    try {
        if (!process.env.API_KEY) {
            alert('API_KEY environment variable not set.');
            return;
        }

        const manuscriptText = await file.text();
        
        setProcessingMessage('Generating stylistic report with Gemini...');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const analysisPrompt = MANUSCRIPT_ANALYSIS_PROMPT.replace('{MANUSCRIPT_NAME}', file.name);
        const reportResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: analysisPrompt + `\n\nMANUSCRIPT TEXT:\n---\n${manuscriptText}\n---`,
        });
        const stylisticReport = reportResponse.text;

        setProcessingMessage('Splitting manuscript into chunks...');
        const chunkData = splitTextIntoChunks(manuscriptText, 10000);
        const chunks: Chunk[] = chunkData.map((chunk, index) => ({
            ...chunk,
            id: `chunk-${Date.now()}-${index}`
        }));

        const newManuscript: Manuscript = {
            name: file.name,
            chunks,
            stylisticReport,
        };
        
        setManuscript(newManuscript); // This will trigger the useEffect to load the first chunk

    } catch (error) {
        console.error('Manuscript analysis failed:', error);
        alert('An error occurred during manuscript analysis. Please check the console for details.');
    } finally {
        setProcessingMessage(null);
    }
  };

  const handleLoadChunk = (chunkId: string) => {
    const chunk = manuscript?.chunks.find(c => c.id === chunkId);
    if (chunk) {
        setEditorText(chunk.content);
        setActiveChunkId(chunkId);
        setEditorKey(p => p + 1);
        // Optionally sync right pane
        setRightText(chunk.content);
        setRightVersionId(null);
    }
  };

  const handleGeminiReview = async () => {
    let baseVersionName = editorVersionName;
    const textToReview = editorText;

    if (!manuscript && !activeVersionId && editorText.trim()) {
      const saveName = `Pre-review save - ${new Date().toLocaleString()}`;
      const preReviewVersion: Version = {
        id: `version-${Date.now()}-prereview`,
        name: saveName,
        content: editorText,
        createdAt: new Date().toISOString(),
      };
      setVersions(prev => [...prev, preReviewVersion]);
      setActiveVersionId(preReviewVersion.id);
      baseVersionName = saveName;
    }

    setIsReviewing(true);
    setReviewProgress({ current: 0, total: 0 });
    try {
      if (!process.env.API_KEY) {
        alert('API_KEY environment variable not set.');
        setIsReviewing(false);
        return;
      }
      
      const getWordCount = (str: string) => str.trim().split(/\s+/).filter(Boolean).length;
      
      const paragraphs = textToReview.split(/\n\n+/).filter(p => p.trim());
      if (paragraphs.length === 0) {
          alert('There is no text to review.');
          setIsReviewing(false);
          return;
      }
      
      const chunks: string[][] = [];
      let currentChunk: string[] = [];
      let currentWordCount = 0;

      paragraphs.forEach((para) => {
          const paraWordCount = getWordCount(para);
          if (currentChunk.length > 0 && currentWordCount + paraWordCount > 800) {
              chunks.push(currentChunk);
              currentChunk = [para];
              currentWordCount = paraWordCount;
          } else {
              currentChunk.push(para);
              currentWordCount += paraWordCount;
          }
      });
      if (currentChunk.length > 0) {
          chunks.push(currentChunk);
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      setReviewProgress({ current: 1, total: chunks.length });
      
      const reviewedChunks: string[] = [];
      let paraIndexCounter = 0;

      for (let i = 0; i < chunks.length; i++) {
        setReviewProgress({ current: i + 1, total: chunks.length });

        const chunkParas = chunks[i];
        const firstParaIndexInChunk = paraIndexCounter;
        
        const prevParas = paragraphs.slice(Math.max(0, firstParaIndexInChunk - 5), firstParaIndexInChunk);
        let prevContext = prevParas.join('\n\n');
        while (getWordCount(prevContext) > 400) {
          prevContext = prevContext.split('\n\n').slice(1).join('\n\n');
        }

        const lastParaIndexInChunk = firstParaIndexInChunk + chunkParas.length - 1;
        const nextParas = paragraphs.slice(lastParaIndexInChunk + 1, lastParaIndexInChunk + 1 + 5);
        let nextContext = nextParas.join('\n\n');
        while (getWordCount(nextContext) > 400) {
          nextContext = nextContext.split('\n\n').slice(0, -1).join('\n\n');
        }
        
        const textToLineEdit = chunkParas.join('\n\n');
        paraIndexCounter += chunkParas.length;
        
        const contextPrompt = `Here is the context for the text you are editing. Do not edit or include this context in your response. Only use it to inform your edits of the main text.\n\n**Previous 5 paragraphs:**\n${prevContext || 'N/A'}\n\n**Next 5 paragraphs:**\n${nextContext || 'N/A'}\n\n`;
        
        const reportPrompt = manuscript ? `For additional context, here is a stylistic analysis report for the entire manuscript. Use this to guide your edits for consistency.\n\n**Stylistic Report:**\n---\n${manuscript.stylisticReport}\n---\n\n` : '';

        const fullPrompt = `${reportPrompt}${GEMINI_REVIEW_PROMPT}\n\n${contextPrompt}Now, please apply the editing rules to the following text only:\n\n---\n${textToLineEdit}\n---`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: fullPrompt,
        });
        
        const editedChunk = response.text;
        if (!editedChunk || !editedChunk.trim()) {
          reviewedChunks.push(textToLineEdit);
        } else {
          reviewedChunks.push(editedChunk);
        }
      }
      
      const reviewedText = reviewedChunks.join('\n\n');

      const reviewNumbers = versions
        .map(v => { const match = v.name.match(/^R(\d+)/); return match ? parseInt(match[1], 10) : 0;})
        .filter(num => num > 0);

      const maxReviewNumber = reviewNumbers.length > 0 ? Math.max(...reviewNumbers) : 0;
      const nextReviewNumber = maxReviewNumber + 1;
      
      const newVersionName = `R${nextReviewNumber} - ${baseVersionName} - ${new Date().toLocaleString()}`;
      
      const newVersion: Version = {
        id: `version-${Date.now()}`,
        name: newVersionName,
        content: reviewedText,
        createdAt: new Date().toISOString(),
      };
      
      setVersions(prev => [...prev, newVersion]);
      
      setEditorText(reviewedText);
      if (!manuscript) {
        setActiveVersionId(newVersion.id);
      }
      setEditorKey(prev => prev + 1);

    } catch (error) {
      console.error('Gemini review failed:', error);
      alert('An error occurred during the AI review. Please check the console for details.');
    } finally {
      setIsReviewing(false);
      setReviewProgress(null);
    }
  };


  return (
    <div className="flex flex-col h-screen bg-brand-bg text-brand-text font-sans">
      <Header 
        onInfoClick={() => setIsInfoModalOpen(true)} 
        isSyncScroll={isSyncScroll}
        onToggleSyncScroll={handleToggleSyncScroll}
        onAnalyzeClick={() => setIsUploadModalOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        {manuscript && activeChunkId && (
            <ManuscriptSidebar 
                manuscript={manuscript}
                activeChunkId={activeChunkId}
                onSelectChunk={handleLoadChunk}
                onViewReport={() => setIsReportModalOpen(true)}
            />
        )}
        <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-hidden relative">
            {(isReviewing || processingMessage) && (
                 <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40" aria-live="polite" aria-busy="true">
                    <div className="text-center">
                        {isReviewing && <BookLoader />}
                        <h1 className="book-loader-text">{processingMessage || 'Reviewing'}</h1>
                        {isReviewing && reviewProgress && (
                           <p className="text-white text-lg font-semibold">
                                Chunk {reviewProgress.current} of {reviewProgress.total}
                           </p>
                        )}
                        <p className="text-brand-text-dim mt-2">
                            Please wait, this may take a few moments.
                        </p>
                        {isReviewing && manuscript && (
                            <button
                                onClick={() => setIsReportModalOpen(true)}
                                className="mt-6 px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-brand-primary"
                            >
                                View Stylistic Report
                            </button>
                        )}
                    </div>
                </div>
            )}
            <EditorPane
            editorKey={editorKey}
            content={editorText}
            onChange={handleEditorTextChange}
            versionName={editorVersionName}
            versions={versions}
            activeVersionId={activeVersionId}
            onLoadEditor={handleLoadEditor}
            onSave={handleOpenSaveModal}
            onFileUpload={handleFileUpload}
            onCopyToClipboard={handleCopyToClipboard}
            scrollRef={editorScrollRef}
            onGeminiReview={handleGeminiReview}
            onClearEditor={handleClearEditor}
            isReviewing={isReviewing}
            paneTitle={manuscript ? "Manuscript" : "Edit"}
            />
            <DiffPane
            currentText={editorText}
            comparisonText={rightText}
            onComparisonTextChange={handleRightTextChange}
            comparisonVersionId={rightVersionId}
            comparisonVersionName={rightVersionName}
            versions={versions}
            onLoadComparison={handleLoadRightPane}
            scrollRef={comparisonScrollRef}
            />
        </main>
      </div>
      <SaveVersionModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSave}
      />
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
      <ManuscriptUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleAnalyzeManuscript}
      />
      {manuscript && <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={manuscript.stylisticReport}
      />}
    </div>
  );
}