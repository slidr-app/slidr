import process from 'node:process';
import {onSchedule} from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';
import {defineSecret} from 'firebase-functions/params';
import {z} from 'zod';
import {onRequest} from 'firebase-functions/v2/https';
import {getFirestore} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
import {type UserData} from './types.js';

const lemonSqueezyApiKey = defineSecret('LEMON_SQUEEZY_API_KEY');

// Define Zod schema for Lemon Squeezy API response
const lemonSqueezyResponseSchema = z.object({
  data: z.array(
    z.object({
      attributes: z.object({
        status: z.string(),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        user_email: z.string().email(),
      }),
    }),
  ),
});

const lemonSqueezyApiEndpoint =
  process.env.LEMON_SQUEEZY_API_ENDPOINT ??
  'https://api.lemonsqueezy.com/v1/subscriptions';

// Function to fetch Pro users from Lemon Squeezy API
async function fetchProUsersFromLemonSqueezy(): Promise<string[]> {
  const apiKey = lemonSqueezyApiKey.value();
  if (!apiKey) {
    throw new Error('LEMON_SQUEEZY_API_KEY not set');
  }

  const response = await fetch(lemonSqueezyApiEndpoint, {
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Accept: 'application/vnd.api+json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
  }

  const jsonResponse = await response.json();
  const parsedResponse = lemonSqueezyResponseSchema.parse(jsonResponse);

  // Extract active subscribers' emails
  const activeEmails = parsedResponse.data
    .filter((sub) => sub.attributes.status === 'active')
    .map((sub) => sub.attributes.user_email);

  return activeEmails;
}

async function syncLemonSqueezyProUsers() {
  try {
    logger.info('Starting Pro users synchronization');

    // Step 1: Build a Set of Active Emails
    const activeEmails = new Set(await fetchProUsersFromLemonSqueezy());

    const firestore = getFirestore();

    // Step 2: Query Only Users with pro.lemon == true
    const existingProUsersSnapshot = await firestore
      .collection('users')
      .where('pro.lemon', '==', true)
      .get();

    // Step 3: Downgrade Users if No Longer Active
    const downgradePromises = existingProUsersSnapshot.docs.map(
      async (userDocument) => {
        const userData = userDocument.data() as Partial<UserData>;
        const userEmail = userData.email ?? '';

        if (!activeEmails.has(userEmail)) {
          // Updated logic to handle `pro.manual` as a string
          const newIsPro = Boolean(userData?.pro?.manual); // Recalculate isPro
          const shouldUpdate =
            userData?.pro?.lemon !== false || userData?.isPro !== newIsPro;

          if (shouldUpdate) {
            await userDocument.ref.set(
              {pro: {...userData?.pro, lemon: false}, isPro: newIsPro},
              {merge: true},
            );
            logger.info(
              `🔻 Removed Pro status for: ${userDocument.id} (${userEmail})`,
            );
          }
        }
      },
    );

    await Promise.all(downgradePromises);

    // Step 4: Upgrade Users if Active but Not Marked as Pro
    const upgradePromises = [...activeEmails].map(async (email) => {
      try {
        const user = await getAuth().getUserByEmail(email);
        const userDocumentReference = firestore
          .collection('users')
          .doc(user.uid);
        const userDocument = await userDocumentReference.get();
        const userData = userDocument.data() as Partial<UserData>;

        const newIsPro = true; // Active in Lemon Squeezy implies isPro
        const shouldUpdate =
          userData?.pro?.lemon !== true || userData?.isPro !== newIsPro;

        if (shouldUpdate) {
          await userDocumentReference.set(
            {pro: {...userData?.pro, lemon: true}, isPro: newIsPro},
            {merge: true},
          );
          logger.info(`✅ Added Pro status for: ${userDocument.id} (${email})`);
        }
      } catch (error) {
        logger.error(
          `❌ Failed to synchronize Pro status for: ${email}`,
          error,
        );
      }
    });

    await Promise.all(upgradePromises);

    logger.info('Pro users synchronization completed');
  } catch (error) {
    logger.error('Pro users synchronization failed:', error);
  }
}

export const syncProUsers = process.env.FUNCTIONS_EMULATOR
  ? // In the emulator, use onRequest to allow manual triggering
    onRequest({secrets: [lemonSqueezyApiKey]}, async (request, response) => {
      await syncLemonSqueezyProUsers();
      response.status(200).send('Webhook received');
    })
  : // In production, use onSchedule for periodic execution
    onSchedule(
      {secrets: [lemonSqueezyApiKey], schedule: 'every 24 hours'},
      async () => syncLemonSqueezyProUsers(),
    );
