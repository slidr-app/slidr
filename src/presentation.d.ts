export type Doc = {
  id: string;
};
export type PresentationData = {
  title: string;
  thumb: string;
  pages: string[];
  notes: Note[];
  uid: string;
  username: string;
  thumbIndex?: number;
};
export type PresentationDoc = Doc & PresentationData;

export type Note = {
  pageIndices: number[];
  markdown: string;
};
