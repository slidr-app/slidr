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
};

export type PresentationUpdate =
  | {
      original: string;
    }
  | {
      username: string;
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

export type PresentationData = PresentationCreate &
  PresentationUpdate & {
    // Thumb: string;
    // TODO: use this in function metadata
    twitterHandle?: string;
    thumbIndex?: number;
  };
export type PresentationDoc = Doc & PresentationData;
