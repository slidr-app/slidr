import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {doc, updateDoc} from 'firebase/firestore/lite';
import clsx from 'clsx';
import {useDebouncedCallback} from 'use-debounce';
import usePresentation from '../use-presentation';
import {type Note} from '../presentation';
import NoteEditor from '../components/NoteEditor';
import {firestore} from '../firebase';
import DefaultLayout from '../layouts/DefaultLayout';

export default function Notes() {
  const {presentationId} = useParams();
  const presentation = usePresentation(presentationId);

  useEffect(() => {
    document.title = `Present - ${
      presentation?.title ?? 'Unnamed Presentation'
    }`;
  }, [presentation]);

  const [notes, setNotes] = useState<Note[]>([]);
  // Const [saving, setSaving] = useState(false);
  // const [saved, setSaved] = useState(true);
  // const [titlePending, setTitlePending] = useState(false);
  // const [titleDone, setTitleDone] = useState(false);
  const [title, setTitle] = useState('');
  const [savingState, setSavingState] = useState<'dirty' | 'saved' | 'saving'>(
    'saved',
  );

  async function saveNotes() {
    setSavingState('saving');
    // SetSaving(true);
    await updateDoc(doc(firestore, 'presentations', presentationId!), {
      notes,
      title,
    });
    setSavingState((currentState) =>
      currentState === 'saving' ? 'saved' : currentState,
    );
    // SetSaving(false);
    // setSaved(true);
  }

  const debouncedSaveNotes = useDebouncedCallback(() => {
    void saveNotes();
  }, 5000);

  useEffect(() => {
    // Use notes from the DB
    if (presentation?.notes) {
      setNotes(presentation.notes);
    }
    // Initialize new notes if there are none
    else if (presentation) {
      setNotes(
        Array.from({length: presentation?.pages?.length ?? 0}).map(
          (_, noteIndex) => ({pageIndices: [noteIndex], markdown: ''}),
        ),
      );
    }

    if (presentation?.title) {
      setTitle(presentation.title);
    } else if (presentation) {
      setTitle('');
    }
  }, [presentation]);

  // Const noteProperties: Array<{pageIndices: number[]; markdown: string}> = [];
  // for (const [noteIndex, note] of notes.entries()) {
  //   if (note.type === 'text') {
  //     noteProperties.push({
  //       pageIndices: [noteIndex],
  //       markdown: note.text ?? '',
  //     });
  //     continue;
  //   }

  //   if (note.type === 'copy') {
  //     noteProperties[noteProperties.length - 1].pageIndices.push(noteIndex);
  //   }
  // }

  function SaveButton() {
    return (
      <div
        className={clsx(
          'btn fixed bottom-10 right-10 flex flex-row items-center shadow-md text-base transition-opacity ease-linear duration-2000 bg-black',
          savingState === 'saved' && 'opacity-0',
          savingState === 'dirty' && 'opacity-100',
          savingState === 'saving' && 'opacity-100',
        )}
        // Type="button"
        // onClick={() => {
        //   void saveNotes();
        // }}
      >
        <div>{savingState === 'saved' ? 'Saved' : 'Saving'}</div>
        <div
          className={clsx(
            'ml-2',
            savingState === 'saved' && 'i-tabler-check',
            ['saving', 'dirty'].includes(savingState) &&
              'i-tabler-loader-3 animate-spin',
          )}
        />
      </div>
    );
  }

  return (
    <DefaultLayout title="Presentation Settings">
      <div className="flex flex-col">
        {/* <div className="fixed top-0 backdrop-blur-lg w-full h-14 z-1">
        <div className="flex flex-row justify-end w-full max-w-screen-md mx-auto">
        </div>
      </div> */}
        <div className="mt-14 w-full max-w-screen-md mx-auto flex flex-col text-base">
          <div className="flex flex-row gap-2 items-center w-full">
            <input
              placeholder="Give your presentation a name..."
              className="input flex-grow"
              value={title}
              onChange={(event) => {
                setSavingState('dirty');
                setTitle(event.target.value);
                debouncedSaveNotes();
              }}
            />
            {/* <SaveButton /> */}
          </div>
          {notes.map((note, noteIndex) => (
            <NoteEditor
              key={note.pageIndices.toString()}
              pageIndices={note.pageIndices}
              markdown={note.markdown}
              handleFoldUp={() => {
                setSavingState('dirty');
                setNotes((currentNotes) => {
                  // Add the current index to the previous note
                  const previousNote: Note = {
                    ...currentNotes[noteIndex - 1],
                    pageIndices: [
                      ...currentNotes[noteIndex - 1].pageIndices,
                      ...note.pageIndices,
                    ],
                  };

                  const nextNotes = [
                    // Copy up to the previous note
                    ...currentNotes.slice(0, Math.max(noteIndex - 1, 0)),
                    // Add the previous note
                    previousNote,
                    // Skip the current note and copy everything else
                    ...currentNotes.slice(noteIndex + 1),
                  ];

                  return nextNotes;
                });
                debouncedSaveNotes();
              }}
              handleFoldDown={() => {
                setSavingState('dirty');
                setNotes((currentNotes) => {
                  console.log('current notes', currentNotes);
                  const lastIndexInNote =
                    currentNotes[noteIndex].pageIndices.at(-1)!;

                  console.log('last index', lastIndexInNote);

                  // Remove the last index from the current note
                  const currentNote: Note = {
                    ...currentNotes[noteIndex],
                    pageIndices: currentNotes[noteIndex].pageIndices.slice(
                      0,
                      -1,
                    ),
                  };

                  console.log('current note', currentNote);
                  const nextNote: Note = {
                    pageIndices: [lastIndexInNote],
                    markdown: '',
                  };
                  console.log('next note', nextNote);
                  const nextNotes = [
                    // Copy up to the current note
                    ...currentNotes.slice(0, noteIndex),
                    // Add the current note
                    currentNote,
                    // Insert the next note
                    nextNote,
                    // Copy the rest
                    ...currentNotes.slice(noteIndex + 1),
                  ];
                  console.log('next notes', nextNotes);
                  return nextNotes;
                });
                debouncedSaveNotes();
              }}
              pages={presentation!.pages}
              onMarkdownChange={(markdown) => {
                setSavingState('dirty');
                setNotes((currentNotes) => {
                  const nextNotes = Array.from(currentNotes);
                  nextNotes[noteIndex] = {...currentNotes[noteIndex], markdown};
                  return nextNotes;
                });
                debouncedSaveNotes();
              }}
              onMarkdownDirty={() => {
                setSavingState('dirty');
              }}
            />
          ))}
        </div>
        <div
          className={clsx(
            'btn fixed bottom-10 right-10 flex flex-row items-center shadow-md text-base transition-opacity ease-in-out bg-black',
            savingState === 'saved' && 'opacity-0 duration-5000',
            savingState === 'dirty' && 'opacity-100 duration-1000',
            savingState === 'saving' && 'opacity-100 duration-1000',
          )}
        >
          <div>{savingState === 'saved' ? 'Saved' : 'Saving'}</div>
          <div
            className={clsx(
              'ml-2',
              savingState === 'saved' && 'i-tabler-check',
              ['saving', 'dirty'].includes(savingState) &&
                'i-tabler-loader-3 animate-spin',
            )}
          />
        </div>
      </div>
    </DefaultLayout>
  );
}
