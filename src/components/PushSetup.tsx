"use client"

import { useEffect } from "react"

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export default function PushSetup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) return

    async function register() {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js")
        await navigator.serviceWorker.ready

        const existing = await reg.pushManager.getSubscription()
        if (existing) {
          // Already subscribed — re-send to server (in case DB lost it)
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscription: existing.toJSON() }),
          })
          return
        }

        const permission = await Notification.requestPermission()
        if (permission !== "granted") return

        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey!).buffer as ArrayBuffer,
        })

        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: subscription.toJSON() }),
        })
      } catch (err) {
        console.error("[PushSetup] error:", err)
      }
    }

    register()
  }, [])

  return null
}
