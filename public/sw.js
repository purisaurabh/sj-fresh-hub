self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function orderClickUrl(raw) {
  try {
    const parsed = new URL(raw || "/notifications", self.location.origin);
    return new URL(parsed.pathname + parsed.search + parsed.hash, self.location.origin).href;
  } catch {
    return new URL("/notifications", self.location.origin).href;
  }
}

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
      data: { url: orderClickUrl(payload.url) },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = orderClickUrl(event.notification.data?.url);

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
