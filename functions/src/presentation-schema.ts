import {z} from 'zod';

export const noteSchema = z.object({
  pageIndices: z.array(z.number()).min(1),
  markdown: z.string(),
});

export type Note = z.infer<typeof noteSchema>;

// We don't use the real type since it depends if it's the admin api or the client api
const timeStamp = z
  .custom<Date>((value) => typeof value?.toDate === 'function')
  .transform((value) => (value as unknown as {toDate: () => Date}).toDate());

const presentationSchemaV0 = z.object({
  version: z.undefined(), // Version of the schema, undefined for v
  created: timeStamp,
  title: z.string(),
  pages: z.array(z.string()),
  notes: z.array(noteSchema),
  uid: z.string(),
  username: z.string(),
  twitterHandle: z.string(),
  original: z.string().url().optional(),
  rendered: timeStamp.optional(),
  thumbIndex: z.number().optional(),
});

// Define the Zod schema for Presentation
// The version field is added when parsing from Firestore
export const presentationSchemaV1 = z.object({
  created: timeStamp,
  title: z.string(),
  pages: z.array(z.string()),
  notes: z.array(noteSchema),
  uid: z.string(),
  username: z.string(),
  twitterHandle: z.string(),
  original: z.string().url().optional(),
  rendered: timeStamp,
  thumbIndex: z.number().optional(),
  status: z.enum([
    'uploading',
    // Rendered and ready for viewing
    'rendered',
    // Ready to be rendered (render requested)
    'created',
    // Render in progress
    'rendering',
  ]),
  isError: z.boolean().optional(), // Optional field to indicate if there was an error during rendering
  errorReason: z.string().optional(), // Optional field to store error message if rendering fails
});

const fromFirestorePresentationSchema = z.union([
  presentationSchemaV1.extend({version: z.literal(1)}),
  presentationSchemaV0,
]);

// Infer the TypeScript type from the schema
export type Presentation = z.infer<typeof presentationSchemaV1>;

export function toFirestore(
  presentation: Presentation,
): Record<string, unknown> {
  return {
    ...presentation,
    version: 1, // Always store documents as version 1
  };
}

export function fromFirestore<
  Snapshot extends {
    data: (options?: any) => Record<string, any>;
    id: string;
  },
>(snapshot: Snapshot): Presentation {
  const data = snapshot.data();

  // Validate that the data parses to one of the expected schemas
  const parsedData = fromFirestorePresentationSchema.parse(data);

  if (parsedData?.version === undefined) {
    // If the version is undefined, it means it's an old version (v0)
    // We need to convert it to the new version (v1)
    return {
      ...parsedData,
      status: parsedData.rendered === undefined ? 'created' : 'rendered', // Determine if it was rendered or not
      rendered: parsedData.rendered ?? parsedData.created,
    };
  }

  // Otherwise, version 1
  return parsedData;
}

// Firestore converter
export const presentationConverter = {
  toFirestore,
  fromFirestore,
};

export type PresentationAndId = {
  id: string;
  data: Presentation;
};
