self.addEventListener("push", function (event) {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: "ValoPickr", body: event.data ? event.data.text() : "" }
  }

  const title = data.title || "ValoPickr"
  const options = {
    body: data.body || "Du hast ein neues Match!",
    icon: data.icon || "/logo.png",
    badge: "/logo.png",
    tag: data.tag || "match",
    data: { url: data.url || "/matches" },
    vibrate: [200, 100, 200],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", function (event) {
  event.notification.close()
  const url = event.notification.data?.url || "/matches"
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
