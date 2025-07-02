import {useDebouncedCallback} from 'use-debounce';
import {useRef} from 'react';
import {type Note} from '../../functions/src/presentation';
import NoteEditor from './NoteEditor';
import SaveIndicator from './SaveIndicator';
import Button from './toolbar/Button';
import {exportNotes, importNotes} from './slides/parse-notes';

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
  readonly saveState: NotesSaveState;
  readonly onSave: () => void;
  readonly notes: Note[];
  readonly title: string;
  readonly setTitle: (nextTitle: string) => void;
  readonly setNotes: (updateNotes: (currentNotes: Note[]) => Note[]) => void;
  readonly onDirty: () => void;
  readonly pages: string[];
}) {
  const debouncedSaveNotes = useDebouncedCallback(() => {
    onSave();
  }, 3000);

  const fileReference = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full max-w-screen-md mx-auto flex flex-col text-base gap-4">
      <div className="grid grid-cols-[6fr_1fr_1fr] lt-sm:(grid-cols-2) gap-4">
        <label className="flex flex-row gap-2 items-center lt-sm:col-span-2">
          Title:
          <input
            placeholder="Give your presentation a name..."
            className="input w-full max-w-screen-sm self-center h-full"
            value={title}
            onChange={(event) => {
              onDirty();
              setTitle(event.target.value);
              debouncedSaveNotes();
            }}
          />
        </label>
        <Button
          isBorderEnabled
          icon="i-tabler-package-import"
          label="import"
          title="Import notes"
          onClick={() => {
            fileReference.current?.click?.();
          }}
        />
        <input
          ref={fileReference}
          type="file"
          className="hidden"
          accept="text/markdown,.md"
          onChange={async (event) => {
            try {
              if ((event.target.files?.length ?? 0) < 1) {
                return;
              }

              const markdown = await event.target.files![0].text();
              const importedNotes = importNotes(markdown, pages.length);
              console.log('imported notes', importedNotes);
              onDirty();
              setNotes(() => importedNotes);
              debouncedSaveNotes();
            } finally {
              // Clear the input so that even if the same file is chosen, it will be re-parsed
              event.target.value = '';
            }
          }}
        />
        <Button
          isBorderEnabled
          icon="i-tabler-package-export"
          label="export"
          title="Export notes"
          onClick={() => {
            const markdown = exportNotes(notes);
            const blob = new Blob([markdown], {type: 'text/markdown'});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `${title || 'notes'}.md`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          }}
        />
      </div>
      <div id="speaker-notes">Speaker notes:</div>
      <ul className="flex flex-col w-full" aria-labelledby="speaker-notes">
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
                  pageIndices: currentNotes[noteIndex].pageIndices.slice(
                    0,
                    -1,
                  ) as [number, ...number[]],
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
                const nextNotes = [...currentNotes];
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
      </ul>
      <SaveIndicator saveState={saveState} />
    </div>
  );
}
