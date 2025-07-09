import {z} from 'zod';

export const subscriptionSchema = z.object({
  id: z.string(),
  attributes: z.object({
    status: z.string(),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    user_email: z.string().email(),
    urls: z.object({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      customer_portal: z.string().url(),
    }),
  }),
});

export type Subscription = z.infer<typeof subscriptionSchema>;
