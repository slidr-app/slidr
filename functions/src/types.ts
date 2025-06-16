export type UserData = {
  email?: string;
  pro?: {
    lemon?: boolean;
    manual?: string; // A false value is an empty string or missing
  };
  isPro?: boolean;
};
