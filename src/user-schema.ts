import {z} from 'zod';
import {type FirestoreDataConverter} from 'firebase/firestore';

// Define the Zod schema for UserDocument
export const userDocumentSchema = z.object({
  username: z.string().optional(),
  twitterHandle: z.string().optional(),
  isPro: z.boolean().optional(),
});

// Infer the type from the Zod schema
export type UserDocument = z.infer<typeof userDocumentSchema>;

// Firestore converter for UserDocument
export const userDocumentConverter: FirestoreDataConverter<UserDocument> = {
  toFirestore(userDocument: UserDocument) {
    return userDocumentSchema.parse(userDocument);
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return userDocumentSchema.parse(data);
  },
};
