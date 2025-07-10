// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite/client" />
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite-plugin-pwa/react" />

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_KEY: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  // More env variables...
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface Window {
  createLemonSqueezy: () => void;
  LemonSqueezy: {
    /**
     * Initialises Lemon.js on your page.
     * @param options - An object with a single property, eventHandler, which is a function that will be called when Lemon.js emits an event.
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Setup: (options: {eventHandler: (event: {event: string}) => void}) => void;
    /**
     * Refreshes `lemonsqueezy-button` listeners on the page.
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Refresh: () => void;

    Url: {
      /**
       * Opens a given Lemon Squeezy URL, typically these are Checkout or Payment Details Update overlays.
       * @param url - The URL to open.
       */
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Open: (url: string) => void;

      /**
       * Closes the current opened Lemon Squeezy overlay checkout window.
       */
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Close: () => void;
    };
    Affiliate: {
      /**
       * Retrieve the affiliate tracking ID
       */
      // eslint-disable-next-line @typescript-eslint/naming-convention
      GetID: () => string;

      /**
       * Append the affiliate tracking parameter to the given URL
       * @param url - The URL to append the affiliate tracking parameter to.
       */
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Build: (url: string) => string;
    };
  };
}
