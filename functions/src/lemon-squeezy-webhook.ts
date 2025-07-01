import {createHmac} from 'node:crypto';
import {onRequest} from 'firebase-functions/v2/https';
import {z} from 'zod';
import * as logger from 'firebase-functions/logger';
import {defineSecret} from 'firebase-functions/params';
import type {UserData} from './types.js';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const lemonSqueezyWebhookSecret = defineSecret('LEMON_SQUEEZY_WEBHOOK_SECRET');

// Define the Zod schema for the webhook data
const webhookEventSchema = z.object({
  meta: z.object({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    event_name: z.string(),
  }),
  data: z.object({
    attributes: z.object({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      user_email: z.string().email(),
    }),
  }),
});

export const lemonSqueezyWebhook = onRequest(
  {secrets: [lemonSqueezyWebhookSecret]},
  async (request, response) => {
    try {
      // Log the incoming event payload for debugging
      logger.info('Received webhook event:', request.body);

      const signature = request.header('X-Signature');

      const hmac = createHmac('sha256', lemonSqueezyWebhookSecret.value());
      // @ts-expect-error rawBody is a Buffer, this came from the lemon squeezy docs
      const digest = hmac.update(request.rawBody).digest('hex');

      if (!signature || digest !== signature) {
        logger.error('Invalid signature');
        response.status(403).send('Invalid signature');
        return;
      }

      // Validate the request body using the Zod schema
      const event = webhookEventSchema.parse(request.body);
      const type = event.meta.event_name;
      const email = event.data.attributes.user_email;

      if (!email || !type) {
        logger.error('Invalid event payload:', event);
        response.status(400).send('Missing data');
        return;
      }

      const firestore = getFirestore();
      const auth = getAuth();

      // Handle purchase or subscription creation events
      if (type === 'order_created' || type === 'subscription_created') {
        try {
          const user = await auth.getUserByEmail(email);
          const userDocumentReference = firestore
            .collection('users')
            .doc(user.uid);
          const userDocument = await userDocumentReference.get();
          const userData = userDocument.exists
            ? (userDocument.data() as Partial<UserData>)
            : {};

          const newIsPro = true; // Active in Lemon Squeezy implies isPro
          const shouldUpdate =
            userData?.pro?.lemon !== true || userData?.isPro !== newIsPro;

          if (shouldUpdate) {
            await userDocumentReference.set(
              {pro: {...userData?.pro, lemon: true}, isPro: newIsPro},
              {merge: true},
            );
            // TODO: await auth.setCustomUserClaims(user.uid, {pro: true});
            logger.info(`✅ Updated Pro status for: ${email}`);
          }

          response.status(200).send('ok');
          return;
        } catch {
          logger.error(`❌ Firebase user not found for email: ${email}`);
          response.status(404).send('User not found');
          return;
        }
      }

      // Handle subscription cancellation or expiration events
      if (
        type === 'subscription_cancelled' ||
        type === 'subscription_expired'
      ) {
        try {
          const user = await auth.getUserByEmail(email);
          const userDocumentReference = firestore
            .collection('users')
            .doc(user.uid);
          const userDocument = await userDocumentReference.get();
          const userData = userDocument.exists
            ? (userDocument.data() as Partial<UserData>)
            : {};

          // Updated logic to handle `pro.manual` as a string
          const newIsPro = Boolean(userData?.pro?.manual); // Recalculate isPro
          const shouldUpdate =
            userData?.pro?.lemon !== false || userData?.isPro !== newIsPro;

          if (shouldUpdate) {
            await userDocumentReference.set(
              {pro: {...userData?.pro, lemon: false}, isPro: newIsPro},
              {merge: true},
            );
            // TODO: await auth.setCustomUserClaims(user.uid, {pro: false});
            logger.info(`🔻 Downgraded Pro status for: ${email}`);
          }

          response.status(200).send('ok');
          return;
        } catch {
          logger.error(`❌ Firebase user not found for event: ${email}`);
          response.status(404).send('User not found');
          return;
        }
      }

      response.status(200).send('Unhandled event');
    } catch (error) {
      logger.error('Webhook processing failed:', error);
      response.status(500).send('Server error');
    }
  },
);
