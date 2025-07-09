import {env} from 'node:process';
import {onCall, HttpsError} from 'firebase-functions/v2/https';
import {defineSecret} from 'firebase-functions/params';
import {getFirestore} from 'firebase-admin/firestore';
import {z} from 'zod';
import {userConverter} from './user-schema.js';
import {subscriptionSchema} from './subscription-schema.js';

const lemonSqueezyApiKey = defineSecret('LEMON_SQUEEZY_API_KEY');

const lemonSqueezyApiEndpoint =
  env.LEMON_SQUEEZY_API_ENDPOINT ??
  'https://api.lemonsqueezy.com/v1/subscriptions';

const lemonSqueezyResponseSchema = z.object({
  data: subscriptionSchema,
});

export const getLemonSqueezyUrl = onCall(
  {secrets: [lemonSqueezyApiKey]},
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const apiKey = lemonSqueezyApiKey.value();
    if (!apiKey) {
      throw new HttpsError('internal', 'API key not configured');
    }

    const userSnap = await getFirestore()
      .collection('users')
      .doc(uid)
      .withConverter(userConverter)
      .get();

    if (!userSnap.exists) {
      throw new HttpsError('not-found', 'User not found');
    }

    const subscriptionId = userSnap.data()!.lemonSqueezySubscriptionId;
    if (!subscriptionId) {
      throw new HttpsError('failed-precondition', 'No subscription found');
    }

    const response = await fetch(
      `${lemonSqueezyApiEndpoint}/${subscriptionId}`,
      {
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/vnd.api+json',
          accept: 'application/vnd.api+json',
        },
      },
    );
    if (!response.ok) {
      throw new HttpsError(
        'internal',
        `Portal creation failed: ${response.statusText}`,
      );
    }

    const jsonResponse = await response.json();
    const parsedResponse = lemonSqueezyResponseSchema.parse(jsonResponse);

    return {url: parsedResponse.data.attributes.urls.customer_portal};
  },
);
