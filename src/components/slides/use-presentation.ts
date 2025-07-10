import {useEffect, useState} from 'react';
import {doc, onSnapshot} from 'firebase/firestore';
import {useParams} from 'react-router-dom';
import {firestore} from '../../firebase';
import {
  type PresentationAndId,
  presentationConverter,
} from '../../../functions/src/presentation-schema';

export default function usePresentation(): PresentationAndId | undefined {
  const {presentationId} = useParams();
  const [presentation, setPresentation] = useState<PresentationAndId>();
  const [pageError, setPageError] = useState<Error>();
  if (pageError) {
    throw pageError;
  }

  useEffect(() => {
    if (!presentationId) {
      return;
    }

    return onSnapshot(
      doc(firestore, 'presentations', presentationId).withConverter(
        presentationConverter,
      ),
      (snapshot) => {
        if (!snapshot.exists()) {
          setPageError(
            new Error(`Presentation '${presentationId}' does not exist`),
          );
          return;
        }

        setPresentation({
          id: snapshot.id,
          data: snapshot.data(),
        });
      },
    );
  }, [presentationId]);

  return presentation;
}
