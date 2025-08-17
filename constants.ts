import { Version } from './types';

export const INITIAL_TEXT = `I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration. I will face my fear. I will permit it to pass over me and through me.

And when it has gone past, I will turn the inner eye to see its path. Where the fear has gone there will be nothing. Only I will remain.`;

export const INITIAL_VERSION: Version = {
  id: 'version-0',
  name: 'Initial Draft',
  content: INITIAL_TEXT,
  createdAt: new Date().toISOString(),
};

export const MANUSCRIPT_ANALYSIS_PROMPT = `Development Editor

The Development Editor (also commonly referred to as the Content Editor) is all about the creative aspects and is the first stop in editing the manuscript. It is one of the most important edits as it focuses on overall storyline/story arch, timeline and consistencies, plot holes, pacing, characters relatability and their POV, setting, and whether or not the manuscript itself meets general industry standards (e.g. word count, genre requirements).

The Development Editor works closely with the writer to make important changes to the structure of the manuscript before moving on to the other phases of editing.

---
Manuscript Stylistic Analysis
"Please perform a comprehensive stylistic analysis of my manuscript, '{MANUSCRIPT_NAME}'. I want you to act as a developmental editor and identify patterns, repetitions, and potential areas for stylistic improvement. Please break down your analysis into the following categories:

Brief critical developmental edit: i.e. Pacing and Exposition and character voice.

High-Frequency Words: Identify the top 10-15 most frequently used non-common adjectives, adverbs, and specific verbs. This will help us spot potential crutch words. (Please exclude common stop words like 'the', 'a', 'is', 'was', etc.)

Repeated Phrases & Clauses: List any specific phrases or clauses (3 words or more) that appear multiple times throughout the manuscript. For example, "a ghost in the machine," "his voice was a low murmur," etc.

Sentence Structure Patterns: Analyze common sentence starters and structures. Are many sentences beginning with the same word (e.g., "He," "She," "The") or with a similar clause structure?

Thematic Word Clusters (Echoes): Identify key thematic words that are used repeatedly (e.g., 'ghost,' 'silence,' 'rain,' 'quiet,' 'story,' 'memory'). Please provide a few examples of how they are used to help us evaluate if their repetition is effective or excessive.

Sensory Language Analysis: Briefly assess the balance of sensory details. Does the manuscript lean heavily on sight and sound, or are touch, smell, and taste also well-represented?

Please present this as a clear, organized report that we can use as a reference guide for the rest of the line-editing process."`;


export const GEMINI_REVIEW_PROMPT = `Line Editor

The second phase of editing is line editing. The Line Editor focuses on syntax to make sure that the narrative flows smoothly and that the writing itself is clear and concise – that the sentence says what the writer needs it to say.

Copy Editor

The third phase of editing doesn’t happen until the very end, after all the major changes have been made to the manuscript. The Copy Editor reviews the manuscript for typos, grammar, word usage, and punctuation, usually following the Chicago Manual of Style for fiction.

This is the final editing stage, which is the polish of the manuscript and should not need to include any major structural changes to the manuscript. Frequently, the line and the copy edits are provided at the same time by the same editor.

---

You are an expert editor combining the roles of Line Editor and Copy Editor. Your task is to perform a detailed line-by-line, paragraph-by-paragraph edit on the provided text to make strong prose even stronger.

**Focus Areas:**
* **Conciseness & Impact:** Tighten sentences and make every word count.
* **Rhythm & Flow:** Vary sentence structure and length to create a compelling narrative pace.
* **Vocabulary & Imagery:** Use a diverse and evocative vocabulary to sharpen imagery.
* **Grammar & Punctuation:** Correct typos, grammar, word usage, and punctuation errors.

**Key Rules:**
* **Avoid Echoes:** Actively check approximately five paragraphs before and after the current section for repeated words, phrases, and sentence structures.
* **Track Overuse:** Keep a mental list of frequently used words and expressions to ensure they are not overused.
* **Punctuation Style:** Avoid using em-dashes (—) for stylistic pauses, opting for other punctuation like commas, colons, or sentence breaks.

**Process:** Apply edits directly to the text. Return ONLY the fully edited text, without any additional comments, preambles, or explanations.`;