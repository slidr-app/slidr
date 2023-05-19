const presentationsUrls = import.meta.glob('./presentations/*.pdf', {
  as: 'url',
  eager: true,
});

export const presentations = Object.fromEntries(
  Object.entries(presentationsUrls).map(([name, url]) => [
    name.split('/').at(-1)!.replace('.pdf', ''),
    url,
  ]),
);

const noteUrls = import.meta.glob('./presentations/*.md', {
  as: 'url',
  eager: true,
});

export const notes = new Map(
  Object.entries(noteUrls).map(([name, url]) => [
    name.split('/').at(-1)!.replace('.md', ''),
    url,
  ]),
);

const thumbImports = import.meta.glob<
  Array<Record<string, [string, string, string]>>
>('./presentations/thumbs/*.thumb.png', {
  query: {
    format: 'avif;webp;png',
    // Width: '600;800;1000',
    width: '800',
    aspect: '9:16',
    picture: true,
    // Source: true,
    // Srcset: true,
  },
  import: 'default',
  eager: true,
});

const thumbEntries = Object.entries(thumbImports);

const thumbUrlEntries = Object.keys(presentations).map((presentation) => {
  const thumbEntry = thumbEntries.find(([thumbPath]) =>
    thumbPath.endsWith(`${presentation}.thumb.png`),
  );

  if (!thumbEntry) {
    return [presentation, undefined];
  }

  return [
    presentation,
    {
      avif: thumbEntry[1][0],
      webp: thumbEntry[1][1],
      png: thumbEntry[1][2],
    },
  ];
});

export const thumbs = new Map<
  string,
  {avif: string; webp: string; png: string}
>(
  // @ts-expect-error ts doesn't like this, but it works
  thumbUrlEntries.filter(([, thumbUrls]) => thumbUrls),
);
