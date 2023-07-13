import {type Note} from '../../../functions/src/presentation';
import {importNotes, exportNotes} from './parse-notes';

let expectedNotes: Note[];
let expectedMarkdown: string;

beforeEach(() => {
  expectedNotes = [
    {pageIndices: [0], markdown: 'abc'},
    {pageIndices: [1], markdown: ''},
    {
      pageIndices: [2, 3],
      markdown: 'def',
    },
  ];

  expectedMarkdown = `<!-- +1+1 -->
abc

<!-- +2+2 -->
def
`;
});

describe('parse notes', () => {
  it('exports notes', async () => {
    const input = expectedNotes;

    const output = exportNotes(input);

    expect(output).toEqual(expectedMarkdown);
  });

  it('imports notes', async () => {
    const input = expectedMarkdown;

    const output = importNotes(input, 4);

    expect(output).toEqual(expectedNotes);
  });

  it('import assumes first magic comment if missing', async () => {
    const input = `

<!-- +1+1 -->
abc

<!-- +2+2 -->
def
`;
    const output = importNotes(input, 6);

    expect(output).toEqual([
      ...expectedNotes,
      {pageIndices: [4], markdown: ''},
      {pageIndices: [5], markdown: ''},
    ]);
  });

  it('import doesnt care about leading whitespace', async () => {
    const input = `abc

<!-- +2+2 -->
def
`;
    const output = importNotes(input, 6);

    expect(output).toEqual([
      ...expectedNotes,
      {pageIndices: [4], markdown: ''},
      {pageIndices: [5], markdown: ''},
    ]);
  });

  it('import adds missing ending pages', async () => {
    const input = expectedMarkdown;

    const output = importNotes(input, 6);

    expect(output).toEqual([
      ...expectedNotes,
      {pageIndices: [4], markdown: ''},
      {pageIndices: [5], markdown: ''},
    ]);
  });

  it('import trims extra pages', async () => {
    const input = expectedMarkdown;

    const output = importNotes(
      `${input}
<!-- +2 -->
extra notes
`,
      4,
    );

    expect(output).toEqual(expectedNotes);
  });

  it('import trims extra partial pages (in between next offset)', async () => {
    const input = expectedMarkdown;

    const output = importNotes(
      `${input}
<!-- +2 -->
extra notes
`,
      5,
    );

    expect(output).toEqual([
      ...expectedNotes,
      {pageIndices: [4], markdown: ''},
    ]);
  });

  it('imports what was exported', () => {
    expect(importNotes(exportNotes(expectedNotes), 4)).toEqual(expectedNotes);
  });

  it('exports what was imported', () => {
    expect(exportNotes(importNotes(expectedMarkdown, 4))).toEqual(
      expectedMarkdown,
    );
  });
});
