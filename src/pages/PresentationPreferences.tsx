import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {doc, updateDoc} from 'firebase/firestore/lite';
import usePresentation from '../use-presentation';
import {type Note} from '../presentation';
import {firestore} from '../firebase';
import DefaultLayout from '../layouts/DefaultLayout';
import PresentationPreferencesEditor, {
  type NotesSaveState,
} from '../components/PresentationPreferencesEditor';

export default function PresentationPreferences() {
  const {presentationId} = useParams();
  const presentation = usePresentation(presentationId);

  useEffect(() => {
    document.title = `Present - ${
      presentation?.title ?? 'Unnamed Presentation'
    }`;
  }, [presentation]);

  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [savingState, setSavingState] = useState<NotesSaveState>('saved');

  async function saveNotes() {
    setSavingState('saving');
    await updateDoc(doc(firestore, 'presentations', presentationId!), {
      notes,
      title,
    });
    setSavingState((currentState) =>
      currentState === 'saving' ? 'saved' : currentState,
    );
  }

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

  return (
    <DefaultLayout title="Presentation Settings">
      <PresentationPreferencesEditor
        saveState={savingState}
        notes={notes}
        title={title}
        setTitle={setTitle}
        setNotes={setNotes}
        pages={presentation?.pages ?? []}
        onSave={() => {
          void saveNotes();
        }}
        onDirty={() => {
          setSavingState('dirty');
        }}
      />
    </DefaultLayout>
  );
}
