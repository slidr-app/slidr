export default function parseNotes(markdown: string) {
  const noteSections = markdown.split(/\n*(<!-- \+\d+(?:\.\.\+\d+)? -->)\n+/);
  const slideNotes = new Map<number, string>();
  let lastSlideIndex = -1;

  for (
    let sectionIndex = 0;
    sectionIndex < noteSections.length;
    sectionIndex++
  ) {
    const noteSection = noteSections[sectionIndex];
    const match =
      /<!-- \+(?<offset>\d+)(?:\.\.\+(?<rangeOffset>\d+))? -->/.exec(
        noteSection,
      );

    if (match === null) {
      slideNotes.set(lastSlideIndex + 1, noteSection);
      lastSlideIndex++;
      continue;
    }

    const firstIndex =
      lastSlideIndex + Number.parseInt(match.groups!.offset, 10);
    const range = match.groups?.rangeOffset
      ? Number.parseInt(match.groups.rangeOffset, 10)
      : 1;
    const slideNote = noteSections[sectionIndex + 1];
    // Keep the index sync'ed since we are reading ahead
    sectionIndex++;

    for (
      let slideIndex = firstIndex;
      slideIndex < firstIndex + range;
      slideIndex++
    ) {
      slideNotes.set(slideIndex, slideNote);
    }

    lastSlideIndex = firstIndex + range - 1;
  }

  return slideNotes;
}
