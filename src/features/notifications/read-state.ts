export function withLocalReads<T extends { id: string; is_read: boolean }>(
  notifications: T[],
  readIds: Record<string, true>,
  allRead: boolean,
): T[] {
  if (!allRead && Object.keys(readIds).length === 0) {
    return notifications;
  }

  return notifications.map((item) =>
    item.is_read || allRead || readIds[item.id] ? { ...item, is_read: true } : item,
  );
}

export function shouldRefreshOnNotificationChange(eventType: string): boolean {
  return eventType === "INSERT" || eventType === "DELETE";
}
