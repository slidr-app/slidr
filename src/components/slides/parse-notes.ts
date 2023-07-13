import {type Note} from '../../../functions/src/presentation';

export function importNotes(markdown: string, pageCount: number): Note[] {
  // We ensure a capture group around the entire expression so that it is still included in the String.split results
  const noteSections = markdown.split(/\n*(<!-- \+\d+(?:\+\d+)? -->)\n+/);
  const notes: Note[] = [];
  let currentPageIndex = 0;

  for (
    let sectionIndex = 0;
    sectionIndex < noteSections.length && currentPageIndex < pageCount;
    sectionIndex++
  ) {
    const magicCommentRegEx =
      /<!-- \+(?<offset>\d+)(?:\+(?<rangeOffset>\d+))? -->/;
    const noteSection = noteSections[sectionIndex];
    const match = magicCommentRegEx.exec(noteSection);

    if (match === null) {
      // Not matching at the start is the result of using String.split()
      // This indicates there was white space before the first magic comment in the markdown
      if (noteSection.length > 0) {
        // If there is text, this means the notes were missing the first magic comment
        notes.push({pageIndices: [currentPageIndex], markdown: noteSection});
        currentPageIndex++;
      }

      continue;
    }

    const firstIndex =
      currentPageIndex + Number.parseInt(match.groups!.offset, 10) - 1;

    // Backfill any missing notes with empty notes, 1 note per index
    for (
      ;
      currentPageIndex < firstIndex && currentPageIndex < pageCount;
      currentPageIndex++
    ) {
      notes.push({pageIndices: [currentPageIndex], markdown: ''});
    }

    if (currentPageIndex >= pageCount) {
      break;
    }

    const pageLength = match.groups?.rangeOffset
      ? Number.parseInt(match.groups.rangeOffset, 10)
      : 1;

    const lastIndex = firstIndex + pageLength - 1;

    // Generate the sequential indices between the firstIndex and the pageLength
    const pageIndices: number[] = [];
    for (
      ;
      currentPageIndex <= lastIndex && currentPageIndex < pageCount;
      currentPageIndex++
    ) {
      pageIndices.push(currentPageIndex);
    }

    let markdown = '';
    // Grab the next section, but make sure it isn't a magic comment
    if (!magicCommentRegEx.test(noteSections[sectionIndex + 1])) {
      markdown = noteSections[sectionIndex + 1];
      // Advance the section index for the next interation
      sectionIndex++;
    }

    notes.push({
      pageIndices: pageIndices as [number, ...number[]],
      markdown: markdown.trim(),
    });
  }

  // Fill in any empty pages to reach the page count
  // currentPageIndex++;
  for (; currentPageIndex < pageCount; currentPageIndex++) {
    notes.push({pageIndices: [currentPageIndex], markdown: ''});
  }

  // Slice off any extra pages that were parsed
  return notes;
}

export function exportNotes(notes: Note[]): string {
  let currentOffset = 0;
  return notes
    .map((note) => {
      // Remove empty notes
      if (note.markdown.trim().length === 0) {
        return undefined;
      }

      const startIndex = note.pageIndices[0] - currentOffset + 1;
      const noteLength = note.pageIndices.length;
      currentOffset += noteLength;

      return `<!-- +${startIndex}+${noteLength} -->\n${note.markdown}\n`;
    })
    .filter((note) => note !== undefined)
    .join('\n');
}
