
export interface Version {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

export interface Chunk {
  id: string;
  name: string;
  content: string;
}

export interface Manuscript {
  name: string;
  chunks: Chunk[];
  stylisticReport: string;
}
