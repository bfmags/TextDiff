import { Chunk } from './types';

export const getWordCount = (str: string): number => str.trim().split(/\s+/).filter(Boolean).length;

/**
 * Splits a large string (like a paragraph) into smaller chunks based on sentence endings,
 * trying to keep each chunk below a maximum word count.
 * @param text The text to split.
 * @param maxWords The maximum number of words per chunk.
 * @returns An array of text chunks.
 */
const splitLongTextBySentences = (text: string, maxWords: number): string[] => {
    // This regex splits a string into sentences. It's a best-effort approach and may not
    // correctly handle all edge cases like abbreviations (e.g., "Mr. Smith").
    // It captures the sentence content, the ending punctuation, and any following whitespace.
    const sentences = text.match(/[^.!?]+[.!?]+(\s+|$)/g) || [];

    // If no sentences are found or it's just one, return the original text as a single chunk.
    if (sentences.length === 0) {
        return [text];
    }

    const chunks: string[] = [];
    let currentChunk = '';
    let currentWordCount = 0;

    sentences.forEach(sentence => {
        const sentenceWordCount = getWordCount(sentence);
        // If the current chunk is not empty and adding the next sentence would exceed the word limit,
        // finalize the current chunk and start a new one.
        if (currentChunk && currentWordCount + sentenceWordCount > maxWords) {
            chunks.push(currentChunk);
            currentChunk = sentence;
            currentWordCount = sentenceWordCount;
        } else {
            // Otherwise, add the sentence to the current chunk.
            currentChunk += sentence;
            currentWordCount += sentenceWordCount;
        }
    });

    // Add the last remaining chunk.
    if (currentChunk) {
        chunks.push(currentChunk);
    }

    // After splitting, it's possible the regex didn't capture the entire original text
    // (e.g., if the text didn't end with punctuation). This ensures any remainder is included.
    const combinedLength = chunks.reduce((acc, c) => acc + c.length, 0);
    if (text.length > combinedLength) {
        const remainder = text.substring(combinedLength);
        if (chunks.length > 0) {
            chunks[chunks.length - 1] += remainder;
        } else {
            // This case should be rare, but as a fallback, push the remainder as its own chunk.
            chunks.push(remainder);
        }
    }

    return chunks;
};


export const splitTextIntoChunks = (text: string, wordsPerChunk: number): Omit<Chunk, 'id'>[] => {
    // Split the manuscript into paragraphs.
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    const finalChunks: string[] = [];
    let currentChunkParas: string[] = [];
    let currentWordCount = 0;

    paragraphs.forEach(para => {
        const paraWordCount = getWordCount(para);

        // Case 1: A single paragraph is larger than the desired chunk size.
        // This paragraph needs to be split internally.
        if (paraWordCount > wordsPerChunk) {
            // First, finalize and store any paragraphs already in the current chunk buffer.
            if (currentChunkParas.length > 0) {
                finalChunks.push(currentChunkParas.join('\n\n'));
            }
            // Reset the buffer for the next paragraphs.
            currentChunkParas = [];
            currentWordCount = 0;

            // Split the oversized paragraph into smaller chunks at sentence boundaries.
            const subChunks = splitLongTextBySentences(para, wordsPerChunk);
            finalChunks.push(...subChunks);
            
            // Continue to the next paragraph in the manuscript.
            return;
        }

        // Case 2: Adding the current paragraph would make the chunk too large.
        if (currentChunkParas.length > 0 && currentWordCount + paraWordCount > wordsPerChunk) {
            // Finalize the current chunk.
            finalChunks.push(currentChunkParas.join('\n\n'));
            // Start a new chunk with the current paragraph.
            currentChunkParas = [para];
            currentWordCount = paraWordCount;
        } 
        // Case 3: The paragraph fits perfectly into the current chunk.
        else {
            currentChunkParas.push(para);
            currentWordCount += paraWordCount;
        }
    });

    // After the loop, add the last remaining chunk if it's not empty.
    if (currentChunkParas.length > 0) {
        finalChunks.push(currentChunkParas.join('\n\n'));
    }

    // Format the chunks into the required object structure.
    return finalChunks.map((content, index) => ({
        name: `Part ${index + 1} of ${finalChunks.length}`,
        content: content.trim(),
    }));
};
