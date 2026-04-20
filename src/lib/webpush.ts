// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpush = require("web-push")

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export interface PushPayload {
  title: string
  body: string
  icon?: string
  url?: string
  tag?: string
}

export async function sendPushToUser(
  supabase: ReturnType<typeof import("@supabase/supabase-js").createClient>,
  userId: string,
  payload: PushPayload
) {
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("subscription")
    .eq("user_id", userId)

  if (!subs?.length) return

  const message = JSON.stringify(payload)

  await Promise.allSettled(
    subs.map((row: { subscription: unknown }) =>
      webpush.sendNotification(row.subscription, message).catch(() => null)
    )
  )
}
