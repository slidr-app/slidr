export type Doc = {
  id: string;
};

export type Note = {
  pageIndices: [number, ...number[]];
  markdown: string;
};

export type PresentationCreate = {
  created: Date;
  title: string;
  pages: string[];
  notes: Note[];
  uid: string;
  username: string;
  twitterHandle: string;
};

export type PresentationUpdate =
  | {
      original: string;
    }
  | {
      username: string;
      twitterHandle: string;
    }
  | {
      title: string;
      notes: Note[];
    }
  | {
      pages: string[];
      rendered: Date;
      title: string;
      notes: Note[];
    };

export type PresentationData = PresentationCreate & {
  original: string;
  rendered: Date;

  // Thumb: string;
  // TODO: use this in function metadata
  thumbIndex?: number;
};
export type PresentationDoc = Doc & PresentationData;
