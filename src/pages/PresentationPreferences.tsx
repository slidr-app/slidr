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
import SaveIndicator from '../components/SaveIndicator';

export default function PresentationPreferences() {
  const {presentationId} = useParams();
  const presentation = usePresentation(presentationId);

  useEffect(() => {
    document.title = `Slidr - ${
      presentation?.title ?? 'Unnamed Presentation'
    } - Preferences`;
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
    if (presentation) {
      setNotes(presentation.notes);
      setTitle(presentation.title);
    }
  }, [presentation]);

  return (
    <DefaultLayout title="Presentation Settings">
      <div className="px-4">
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
      </div>
    </DefaultLayout>
  );
}
