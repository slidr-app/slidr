import {useEffect, useState} from 'react';
import parseNotes from './parse-notes';
import {notes} from './presentation-urls';

export default function useNotes(presentationSlug: string) {
  const [slideNotes, setSlideNotes] = useState(new Map<number, string>());

  useEffect(() => {
    async function fetchNotes() {
      if (notes.has(presentationSlug)) {
        const notesResponse = await fetch(notes.get(presentationSlug)!);
        const notesMarkdownString = await notesResponse.text();
        const parsedSlideNotes = parseNotes(notesMarkdownString);
        setSlideNotes(parsedSlideNotes);
      }
    }

    void fetchNotes();
  }, [presentationSlug]);

  return slideNotes;
}
