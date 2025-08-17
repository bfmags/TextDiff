import { Version } from './types';

export const INITIAL_TEXT = `I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration. I will face my fear. I will permit it to pass over me and through me.

And when it has gone past, I will turn the inner eye to see its path. Where the fear has gone there will be nothing. Only I will remain.`;

export const INITIAL_VERSION: Version = {
  id: 'version-0',
  name: 'Initial Draft',
  content: INITIAL_TEXT,
  createdAt: new Date().toISOString(),
};
