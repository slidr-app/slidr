import {z} from 'zod';

// Zod schema for User Document, shared by functions and frontend
export const userDocumentSchema = z.object({
  pro: z
    .object({
      lemon: z.boolean().optional(),
      manual: z.string().optional(),
    })
    .optional(),
  isPro: z.boolean().optional(),
  username: z.string().optional(),
  twitterHandle: z.string().optional(),
  lemonSqueezySubscriptionId: z.string().optional(),
});

// Types inferred from schema
export type UserDocument = z.infer<typeof userDocumentSchema>;

// Firestore data converter for UserDocument, generic for front and back
export const userConverter = {
  toFirestore(userDocument: UserDocument): Record<string, unknown> {
    return userDocumentSchema.parse(userDocument);
  },
  fromFirestore<
    Snapshot extends {
      data: (options?: any) => Record<string, any>;
      id: string;
    },
  >(snapshot: Snapshot): UserDocument {
    const data = snapshot.data();
    return userDocumentSchema.parse(data);
  },
};
