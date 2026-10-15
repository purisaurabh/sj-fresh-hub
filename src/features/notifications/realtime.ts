export const NOTIFICATION_POLL_MS = 20_000;

export function shouldPollNotifications(channelStatus: string | null, isVisible: boolean): boolean {
  return isVisible && channelStatus !== "SUBSCRIBED";
}
