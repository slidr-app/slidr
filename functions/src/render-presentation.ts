import {onDocumentUpdated} from 'firebase-functions/v2/firestore';
import {logger} from 'firebase-functions/v2';
import {getFirestore} from 'firebase-admin/firestore';
import {nanoid} from 'nanoid';
import {pdfDataToPngData} from './pdf-to-png.js';
import {presentationConverter} from './presentation-schema.js';
import {getBucket} from './storage-bucket.js';

export const renderPresentation = onDocumentUpdated(
  '/presentations/{presentationId}',
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    if (!beforeData || !afterData) {
      throw new Error('Missing document data');
    }

    const presentationRef = event.data?.after.ref.withConverter(
      presentationConverter,
    );
    if (!presentationRef) {
      throw new Error('Presentation reference not found');
    }

    // Trigger only if the previous status is not "created" and the current status is "created"
    if (!(beforeData.status !== 'created' && afterData.status === 'created')) {
      logger.info("No transition to 'created' status; skipping rendering.");
      return;
    }

    logger.info('After data', {data: afterData});

    // Use the new document data for processing
    const {uid, original: filePath} = afterData as {
      uid?: string;
      original?: string;
    };

    if (!uid) {
      throw new Error('Missing userId');
    }

    if (!filePath) {
      throw new Error('Missing original file path');
    }

    // Check pro status
    const userQueryResult = await getFirestore()
      .collection('users')
      .doc(uid)
      .get();

    if (!userQueryResult.data()?.isPro) {
      throw new Error('User is not a Pro user');
    }

    // Set the presentation status to rendering atomically
    const transactionRef = getFirestore()
      .doc(event.document)
      .withConverter(presentationConverter);
    await getFirestore().runTransaction(async (transaction) => {
      const docSnapshot = await transaction.get(transactionRef);
      if (!docSnapshot.exists) {
        throw new Error('Presentation document not found in transaction');
      }

      const currentData = docSnapshot.data();
      if (currentData?.status !== 'created') {
        throw new Error(
          `Expected status 'created' but got '${currentData?.status}'`,
        );
      }

      transaction.set(
        transactionRef,
        {
          status: 'rendering',
          rendered: new Date(),
        },
        {merge: true},
      );
    });

    const bucket = getBucket();
    // Const file = bucket.file(filePath);

    try {
      // TODO: do we need this? Should it happen on the client or here?
      // await file.setMetadata({ cacheControl: 'max-age=604800, immutable' });

      const downloadResponse = await fetch(filePath);
      if (!downloadResponse.ok) {
        throw new Error(
          `Failed to download PDF: ${downloadResponse.statusText}`,
        );
      }

      const data = await downloadResponse.arrayBuffer();
      // Const download = await file.download();
      // const data = Uint8Array.from(download[0]);
      logger.info('pdf downloaded', {
        filePath,
        size: data.byteLength,
      });

      const pageImages = await pdfDataToPngData(new Uint8Array(data));
      logger.info('pdf indexed', {pages: pageImages.length});

      const results = await Promise.allSettled(
        pageImages.map(async (imageData, index) => {
          const imagePath = `${filePath}_page_${index.toString().padStart(3, '0')}_${nanoid()}.webp`;
          const imageStorageFile = bucket.file(imagePath);
          await imageStorageFile.save(imageData, {
            metadata: {cacheControl: 'public, max-age=604800, immutable'},
          });
          const pageUrl = imageStorageFile.publicUrl();
          return pageUrl;
        }),
      );

      // Check for any failures uploading the images
      const rejected = results
        .map((result, index) => ({
          pageIndex: index,
          result,
        }))
        .filter(
          (resultWithIndex) => resultWithIndex.result.status === 'rejected',
        );

      if (rejected.length > 0) {
        logger.error('Some page images failed to save', {rejected});
        throw new Error('Failed to save some page images');
      }

      const pageUrls = results.map((result) =>
        result.status === 'fulfilled' ? result.value : '',
      );

      await presentationRef.set(
        {
          status: 'rendered',
          pages: pageUrls,
          notes: pageUrls.map((_, index) => ({
            pageIndices: [index],
            markdown: '',
          })),
          rendered: new Date(),
        },
        {merge: true},
      );
    } catch (error) {
      logger.error('indexing error', error);
      await presentationRef.set(
        {
          isError: true,
          errorReason: (error as Error).message,
        },
        {merge: true},
      );
    }
  },
);
