import {useEffect, useState} from 'react';
import {getDoc, doc} from 'firebase/firestore';
import {useParams} from 'react-router-dom';
import {
  type PresentationData,
  type PresentationDoc,
} from '../../../functions/src/presentation';
import {firestore} from '../../firebase';

export default function usePresentation(): PresentationDoc | undefined {
  const {presentationId} = useParams();
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

  // TODO: refactor to return the presentation data and id as fields of an object
  // That should allow removing the need for all pages to call useparams()
  return presentation;
}
