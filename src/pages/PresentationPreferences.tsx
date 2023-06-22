import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {deleteDoc, doc, updateDoc} from 'firebase/firestore/lite';
import {ref, deleteObject, listAll} from 'firebase/storage';
import clsx from 'clsx';
import usePresentation from '../components/slides/use-presentation';
import {type Note} from '../../functions/src/presentation';
import {firestore, storage} from '../firebase';
import DefaultLayout from '../layouts/DefaultLayout';
import PresentationPreferencesEditor, {
  type NotesSaveState,
} from '../components/PresentationPreferencesEditor';

export default function PresentationPreferences() {
  const {presentationId} = useParams();
  const presentation = usePresentation();

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

  const [deleteState, setDeleteState] = useState<
    'saved' | 'confirm' | 'deleting' | 'deleted'
  >('saved');

  async function onDeleteClicked() {
    if (deleteState === 'saved') {
      setDeleteState('confirm');
      return;
    }

    if (deleteState === 'confirm') {
      const presentationPath = `presentations/${presentation!.id}`;

      setDeleteState('deleting');

      // Delete all storage objects stored under the presentation id
      const results = await listAll(ref(storage, presentationPath));
      await Promise.all(results.items.map(async (item) => deleteObject(item)));

      // Delete the doc from the database
      await deleteDoc(doc(firestore, presentationPath));

      setDeleteState('deleted');
    }
  }

  return (
    <DefaultLayout title="Presentation Settings">
      <div className="px-4 flex flex-col items-center pb-6">
        {deleteState !== 'deleted' && (
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
        )}
        {presentation && (
          <>
            <div className="text 2xl mt-8 mb-4">Danger Zone</div>
            <button
              type="button"
              className={clsx(
                'btn border-red-700 shadow-red-900 flex flex-row items-center gap-2',
              )}
              onClick={() => {
                void onDeleteClicked();
              }}
            >
              <div>
                {deleteState === 'saved'
                  ? 'Delete presentation'
                  : deleteState === 'confirm'
                  ? 'Click to confirm deletion'
                  : deleteState === 'deleting'
                  ? 'Deleting...'
                  : 'Deleted'}
              </div>
              <div
                className={clsx(
                  ['saved', 'confirm'].includes(deleteState) &&
                    'i-tabler-trash',
                  deleteState === 'deleting' && 'i-tabler-trash animate-spin',
                  deleteState === 'deleted' && 'i-tabler-check',
                )}
              />
            </button>
          </>
        )}
      </div>
    </DefaultLayout>
  );
}
