export type UseChannel = (
  channelId: string,
  eventId?: string,
  onIncoming?: ((payload: any) => void) | undefined,
) => (payload: any) => void;
