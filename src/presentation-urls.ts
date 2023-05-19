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

const thumbUrls = import.meta.glob('./presentations/thumbs/*.pdf', {
  as: 'url',
  eager: true,
});

export const thumbs = new Map(
  Object.entries(thumbUrls).map(([name, url]) => [
    name.split('/').at(-1)!.replace('.thumb.pdf', ''),
    url,
  ]),
);
