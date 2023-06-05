export type Doc = {
  id: string;
};
export type PresentationData = {
  title: string;
  thumb: string;
  pages: string[];
};
export type PresentationDoc = Doc & PresentationData;
