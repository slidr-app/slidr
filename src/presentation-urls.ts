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
