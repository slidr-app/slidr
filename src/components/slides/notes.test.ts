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

  expectedMarkdown = `<!-- +0+1 -->
abc

<!-- +2+2 -->
def
`;
});

describe('note', () => {
  it('exports notes', async () => {
    const input = expectedNotes;

    const output = exportNotes(input);

    expect(output).toEqual(expectedMarkdown);
  });

  it('imports notes', async () => {
    const input = expectedMarkdown;

    const output = importNotes(input);

    expect(output).toEqual(expectedNotes);
  });

  it('imports what was exported', () => {
    expect(importNotes(exportNotes(expectedNotes))).toEqual(expectedNotes);
  });

  it('exports what was imported', () => {
    expect(exportNotes(importNotes(expectedMarkdown))).toEqual(
      expectedMarkdown,
    );
  });
});
