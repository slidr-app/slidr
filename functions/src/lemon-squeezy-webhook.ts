import {onRequest} from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import {z} from 'zod';
import * as logger from 'firebase-functions/logger';

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

export const lemonSqueezyWebhook = onRequest(async (request, response) => {
  try {
    // Log the incoming event payload for debugging
    logger.info('Received webhook event:', request.body);

    // Validate the request body using the Zod schema
    const event = webhookEventSchema.parse(request.body);
    const type = event.meta.event_name;
    const email = event.data.attributes.user_email;

    if (!email || !type) {
      logger.error('Invalid event payload:', event);
      response.status(400).send('Missing data');
      return;
    }

    // Handle purchase event
    if (type === 'order_created' || type === 'subscription_created') {
      try {
        const user = await admin.auth().getUserByEmail(email);

        // Mark as pro in Firestore
        await admin
          .firestore()
          .collection('users')
          .doc(user.uid)
          .set({isPro: true}, {merge: true});

        // Optionally: set auth custom claims
        await admin.auth().setCustomUserClaims(user.uid, {pro: true});

        logger.info(`✅ Updated Pro status for: ${email}`);
        response.status(200).send('ok');
        return;
      } catch {
        logger.error(`❌ Firebase user not found for email: ${email}`);
        response.status(404).send('User not found');
        return;
      }
    }

    // Handle cancellation
    if (type === 'subscription_cancelled' || type === 'subscription_expired') {
      try {
        const user = await admin.auth().getUserByEmail(email);

        await admin
          .firestore()
          .collection('users')
          .doc(user.uid)
          .set({isPro: false}, {merge: true});

        await admin.auth().setCustomUserClaims(user.uid, {pro: false});

        logger.info(`🔻 Downgraded Pro status for: ${email}`);
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
});
