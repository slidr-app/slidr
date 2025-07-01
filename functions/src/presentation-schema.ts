import { z } from 'zod';

// Define the Zod schema for Presentation
export const PresentationSchema = z.object({
  created: z.date(),
  title: z.string(),
  pages: z.array(z.string()),
  notes: z.array(
    z.object({
      // pageIndices: z.tuple([z.number(), z.number().optional()]), // Tuple for page indices
      pageIndices: z.array(z.number()).min(1), // Tuple for page indices
      markdown: z.string(),
    })
  ),
  uid: z.string(),
  username: z.string(),
  twitterHandle: z.string(),
  original: z.string().url(),
  rendered: z.date(),
  thumbIndex: z.number().optional(),
  status: z.enum([
    'uploading',
    // Rendered and ready for viewing
    'rendered',
    // Ready to be rendered (render requested)
    'created',
    // Render in progress
    'rendering'
  ]),
  isError: z.boolean().optional(), // Optional field to indicate if there was an error during rendering
  errorReason: z.string().optional(), // Optional field to store error message if rendering fails
});

// Infer the TypeScript type from the schema
export type Presentation = z.infer<typeof PresentationSchema>;

export function toFirestore(presentation: Presentation): Record<string, unknown> {
  const data = Object.fromEntries(Object.entries(presentation).map(([key, value]) => {
    if (value instanceof Date) {
      return [key, value.toISOString()]; // Convert Date to string for Firestore
    }
    return [key, value];
  })) as Omit<Presentation, 'created' | 'rendered'> & {created: string; rendered: string};

  return data;
}

export function fromFirestore<
  Snapshot extends {
    data: (options?: any) => Record<string, any>;
    id: string;
  },
>(snapshot: Snapshot): Presentation {
  const data = snapshot.data() as Record<string, unknown>;
    return PresentationSchema.parse({
      ...data,
      created: new Date(data.created as string), // Convert string back to Date
      rendered: new Date(data.rendered as string), // Convert string back to Date
      status: data.status as Presentation['status'], // Parse status field
    });
}


// Firestore converter
export const presentationConverter = {
  toFirestore,
  // toFirestore: (presentation: Presentation): Record<string, unknown> => {
  //   console.log('Converting presentation to Firestore format:', presentation);
  //   return {
  //     ...presentation,
  //     created: presentation.created.toISOString(), // Convert Date to string for Firestore
  //     rendered: presentation.rendered.toISOString(), // Convert Date to string for Firestore
  //     status: presentation.status, // Include status in Firestore data
  //   };
  // },
  fromFirestore,
  // fromFirestore: (snapshot: FirebaseFirestore.DocumentSnapshot): Presentation => {
  //   const data = snapshot.data() as Record<string, unknown>;
  //   return PresentationSchema.parse({
  //     ...data,
  //     created: new Date(data.created as string), // Convert string back to Date
  //     rendered: new Date(data.rendered as string), // Convert string back to Date
  //     status: data.status as Presentation['status'], // Parse status field
  //   });
  // },
};