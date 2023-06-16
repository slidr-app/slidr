import {useEffect, useState} from 'react';
import {getDoc, doc} from 'firebase/firestore/lite';
import {
  type PresentationData,
  type PresentationDoc,
} from '../functions/src/presentation';
import {firestore} from './firebase';

export default function usePresentation(
  presentationId?: string,
): PresentationDoc | undefined {
  const [presentation, setPresentation] = useState<PresentationDoc>();
  const [pageError, setPageError] = useState<Error>();
  if (pageError) {
    throw pageError;
  }

  useEffect(() => {
    async function loadPresentation() {
      if (!presentationId) {
        return;
      }

      const presentationDoc = await getDoc(
        doc(firestore, 'presentations', presentationId),
      );

      if (!presentationDoc.exists) {
        setPageError(
          new Error(`Presentation '${presentationId}' does not exist`),
        );
        return;
      }

      setPresentation({
        id: presentationDoc.id,
        ...(presentationDoc.data() as PresentationData),
      });
    }

    void loadPresentation();
  }, [presentationId]);

  return presentation;
}
