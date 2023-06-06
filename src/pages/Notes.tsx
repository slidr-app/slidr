import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {doc, updateDoc} from 'firebase/firestore/lite';
import clsx from 'clsx';
import usePresentation from '../use-presentation';
import {type Note} from '../presentation';
import NoteEditor from '../components/NoteEditor';
import {firestore} from '../firebase';

export default function Notes() {
  const {presentationId} = useParams();
  const presentation = usePresentation(presentationId);

  useEffect(() => {
    document.title = `Present - ${
      presentation?.title ?? 'Unnamed Presentation'
    }`;
  }, [presentation]);

  const [notes, setNotes] = useState<Note[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);

  async function saveNotes() {
    setSaving(true);
    void updateDoc(doc(firestore, 'presentations', presentationId!), {notes});
    setSaving(false);
    setSaved(true);
  }

  useEffect(() => {
    // Use notes from the DB
    if (presentation?.notes) {
      setNotes(presentation.notes);
      return;
    }

    // Initialize new notes if there are none
    if (presentation) {
      setNotes(
        Array.from({length: presentation?.pages?.length ?? 0}).fill(
          {
            type: 'text',
            text: '',
          },
          0,
        ) as Note[],
      );
    }
  }, [presentation]);

  const noteProperties: Array<{pageIndices: number[]; markdown: string}> = [];
  for (const [noteIndex, note] of notes.entries()) {
    if (note.type === 'text') {
      noteProperties.push({
        pageIndices: [noteIndex],
        markdown: note.text ?? '',
      });
      continue;
    }

    if (note.type === 'copy') {
      noteProperties[noteProperties.length - 1].pageIndices.push(noteIndex);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="fixed top-0 backdrop-blur-lg w-full h-14 z-1">
        <div className="flex flex-row justify-end w-full max-w-screen-md mx-auto">
          <button
            className="btn flex flex-row items-center"
            type="button"
            onClick={() => {
              void saveNotes();
            }}
          >
            <div>{saved ? 'Saved' : 'Save'}</div>
            <div
              className={clsx(
                'ml-2',
                saved && 'i-tabler-check',
                saving && 'i-tabler-arrow-big-up-lines animate-bounce',
              )}
            />
          </button>
        </div>
      </div>
      <div className="mt-14 w-full max-w-screen-md mx-auto flex flex-col text-base">
        {noteProperties.map((note) => (
          <NoteEditor
            key={note.pageIndices.toString()}
            pageIndices={note.pageIndices}
            markdown={note.markdown}
            handleFoldUp={() => {
              setSaved(false);
              setNotes((currentNotes) => {
                const nextNotes = Array.from(currentNotes);
                nextNotes[note.pageIndices[0]] = {type: 'copy'};
                return nextNotes;
              });
            }}
            handleFoldDown={() => {
              setSaved(false);
              setNotes((currentNotes) => {
                const nextNotes = Array.from(currentNotes);
                nextNotes[note.pageIndices[note.pageIndices.length - 1]] = {
                  type: 'text',
                  text: '',
                };
                return nextNotes;
              });
            }}
            pages={presentation!.pages}
            onMarkdownChange={(markdown) => {
              setSaved(false);
              setNotes((currentNotes) => {
                const nextNotes = Array.from(currentNotes);
                nextNotes[note.pageIndices[0]] = {
                  type: 'text',
                  text: markdown,
                };
                return nextNotes;
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}
