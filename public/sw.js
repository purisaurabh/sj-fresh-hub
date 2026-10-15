self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = { title: "SJ Fresh Hub", body: "You have a new update.", url: "/notifications" };
  try {
    payload = { ...payload, ...event.data.json() };
  } catch {
    const text = event.data?.text();
    if (text) {
      payload.body = text;
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: { url: payload.url || "/notifications" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/notifications";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          return client.focus().then((focused) => {
            if (focused && "navigate" in focused) {
              return focused.navigate(url);
            }
            return focused;
          });
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
      return undefined;
    }),
  );
});
