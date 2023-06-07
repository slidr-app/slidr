export type Doc = {
  id: string;
};
export type PresentationData = {
  title: string;
  thumb: string;
  pages: string[];
  notes?: Note[];
  uid: string;
};
export type PresentationDoc = Doc & PresentationData;

export type Note = {
  text?: string;
  type?: 'text' | 'copy';
};
