import {useDebouncedCallback} from 'use-debounce';
import {type Note} from '../presentation';
import NoteEditor from './NoteEditor';
import SaveIndicator from './SaveIndicator';

export type NotesSaveState = 'dirty' | 'saved' | 'saving';

export default function PresentationPreferencesEditor({
  saveState,
  onSave,
  notes,
  setNotes,
  title,
  setTitle,
  onDirty,
  pages,
}: {
  saveState: NotesSaveState;
  onSave: () => void;
  notes: Note[];
  title: string;
  setTitle: (nextTitle: string) => void;
  setNotes: (updateNotes: (currentNotes: Note[]) => Note[]) => void;
  onDirty: () => void;
  pages: string[];
}) {
  const debouncedSaveNotes = useDebouncedCallback(() => {
    onSave();
  }, 5000);

  return (
    <div className="w-full max-w-screen-md mx-auto flex flex-col text-base px-2">
      <input
        placeholder="Give your presentation a name..."
        className="input w-full max-w-screen-sm self-center"
        value={title}
        onChange={(event) => {
          onDirty();
          setTitle(event.target.value);
          debouncedSaveNotes();
        }}
      />
      {notes.map((note, noteIndex) => (
        <NoteEditor
          key={note.pageIndices.toString()}
          pageIndices={note.pageIndices}
          markdown={note.markdown}
          handleFoldUp={() => {
            onDirty();
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
            onDirty();
            setNotes((currentNotes) => {
              const lastIndexInNote =
                currentNotes[noteIndex].pageIndices.at(-1)!;

              // Remove the last index from the current note
              const currentNote: Note = {
                ...currentNotes[noteIndex],
                pageIndices: currentNotes[noteIndex].pageIndices.slice(0, -1),
              };

              const nextNote: Note = {
                pageIndices: [lastIndexInNote],
                markdown: '',
              };

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
          pages={pages}
          onMarkdownChange={(markdown) => {
            onDirty();
            setNotes((currentNotes) => {
              const nextNotes = Array.from(currentNotes);
              nextNotes[noteIndex] = {...currentNotes[noteIndex], markdown};
              return nextNotes;
            });
            debouncedSaveNotes();
          }}
          onMarkdownDirty={() => {
            onDirty();
          }}
        />
      ))}
      <SaveIndicator saveState={saveState} />
    </div>
  );
}
