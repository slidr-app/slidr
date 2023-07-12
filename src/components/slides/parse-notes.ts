import {type Note} from '../../../functions/src/presentation';

export function importNotes(markdown: string): Note[] {
  // We ensure a capture group around the entire expression so that it is still included in the String.split results
  const noteSections = markdown.split(/\n*(<!-- \+\d+(?:\+\d+)? -->)\n+/);
  const notes: Note[] = [];
  let currentPageIndex = 0;

  for (
    let sectionIndex = 0;
    sectionIndex < noteSections.length;
    sectionIndex++
  ) {
    const magicCommentRegEx =
      /<!-- \+(?<offset>\d+)(?:\+(?<rangeOffset>\d+))? -->/;
    const noteSection = noteSections[sectionIndex];
    const match = magicCommentRegEx.exec(noteSection);

    if (match === null) {
      // Not matching at the start is the result of using String.split()
      // This indicates there was white space before the first magic comment in the markdown
      if (sectionIndex !== 0) {
        notes.push({pageIndices: [currentPageIndex], markdown: noteSection});
        currentPageIndex++;
      }

      continue;
    }

    const firstIndex =
      currentPageIndex + Number.parseInt(match.groups!.offset, 10);

    // Backfill any missing notes with empty notes, 1 note per index
    for (
      let emptyIndex = currentPageIndex + 1;
      emptyIndex < firstIndex;
      emptyIndex++
    ) {
      notes.push({pageIndices: [emptyIndex], markdown: ''});
      currentPageIndex++;
    }

    const pageLength = match.groups?.rangeOffset
      ? Number.parseInt(match.groups.rangeOffset, 10)
      : 1;

    // Generate the sequential indices between the firstIndex and the pageLength
    const pageIndices = Array.from({length: pageLength}).map(
      (_, index) => firstIndex + index,
    ) as [number, ...number[]];

    let markdown = '';
    // Grab the next section, but make sure it isn't a magic comment
    if (!magicCommentRegEx.test(noteSections[sectionIndex + 1])) {
      markdown = noteSections[sectionIndex + 1];
      // Skip the next section
      sectionIndex++;
    }

    notes.push({pageIndices, markdown: markdown.trim()});

    // Update the pageIndices index for the next note
    currentPageIndex += pageLength - 1;
  }

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

      const startIndex = currentOffset + note.pageIndices[0];
      const noteLength = note.pageIndices.length;
      currentOffset += noteLength - 1;

      return `<!-- +${startIndex}+${noteLength} -->\n${note.markdown}\n`;
    })
    .filter((note) => note !== undefined)
    .join('\n');
}
