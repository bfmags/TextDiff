import { Version } from './types';

export const INITIAL_TEXT = `I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration. I will face my fear. I will permit it to pass over me and through me.

And when it has gone past, I will turn the inner eye to see its path. Where the fear has gone there will be nothing. Only I will remain.`;

export const INITIAL_VERSION: Version = {
  id: 'version-0',
  name: 'Initial Draft',
  content: INITIAL_TEXT,
  createdAt: new Date().toISOString(),
};

export const GEMINI_REVIEW_PROMPT = `You are an expert editor. Your task is to perform a detailed line-by-line, paragraph-by-paragraph edit on the provided text to make strong prose even stronger.

**Focus Areas:**
* **Conciseness & Impact:** Tighten sentences and make every word count.
* **Rhythm & Flow:** Vary sentence structure and length to create a compelling narrative pace.
* **Vocabulary & Imagery:** Use a diverse and evocative vocabulary to sharpen imagery.

**Key Rules:**
* **Avoid Echoes:** Actively check approximately five paragraphs before and after the current section for repeated words, phrases, and sentence structures.
* **Track Overuse:** Keep a mental list of frequently used words and expressions to ensure they are not overused.
* **Punctuation Style:** Avoid using em-dashes (—) for stylistic pauses, opting for other punctuation like commas, colons, or sentence breaks.

**Process:** Apply edits directly to the text. Return ONLY the fully edited text, without any additional comments, preambles, or explanations.`;
