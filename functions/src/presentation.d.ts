export type Doc = {
  id: string;
};

export type Note = {
  pageIndices: [number, ...number[]];
  markdown: string;
};

// TODO: use this when uploading
export type PresentationData = {
  title: string;
  thumb: string;
  pages: string[];
  notes: Note[];
  uid: string;
  username: string;
  // TODO: use this in function metadata
  twitterHandle: string;
  thumbIndex?: number;
};
export type PresentationDoc = Doc & PresentationData;
