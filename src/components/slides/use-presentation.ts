import {useEffect, useState} from 'react';
import {doc, onSnapshot} from 'firebase/firestore';
import {useParams} from 'react-router-dom';
import {
  type PresentationData,
  type PresentationAndId,
} from '../../../functions/src/presentation';
import {firestore} from '../../firebase';

export default function usePresentation(): PresentationAndId {
  const {presentationId} = useParams();
  const [presentation, setPresentation] = useState<PresentationAndId>({
    id: presentationId,
  });
  const [pageError, setPageError] = useState<Error>();
  if (pageError) {
    throw pageError;
  }

  useEffect(() => {
    if (!presentationId) {
      return;
    }

    return onSnapshot(
      doc(firestore, 'presentations', presentationId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setPageError(
            new Error(`Presentation '${presentationId}' does not exist`),
          );
          return;
        }

        setPresentation({
          id: snapshot.id,
          data: snapshot.data() as PresentationData,
        });
      },
    );
  }, [presentationId]);

  return presentation;
}
