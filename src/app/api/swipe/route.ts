import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendPushToUser } from "@/lib/webpush"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient: createServiceClient } = require("@supabase/supabase-js")

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 })
  }

  const body = await request.json()
  const toUserId: string = body.toUserId
  const direction: 'left' | 'right' = body.direction

  if (!toUserId || !direction || !["left", "right"].includes(direction)) {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 })
  }

  if (toUserId === user.id) {
    return NextResponse.json({ error: "Nicht erlaubt" }, { status: 400 })
  }

  // Swipe speichern
  const { error: swipeError } = await supabase
    .from("swipes")
    .upsert(
      { from_user_id: user.id, to_user_id: toUserId as string, direction: direction as 'left' | 'right' },
      { onConflict: "from_user_id,to_user_id" }
    )

  if (swipeError) {
    return NextResponse.json({ error: "Fehler beim Swipen" }, { status: 500 })
  }

  let matched = false

  // Bei Rechts-Swipe: Hat die andere Person auch rechts geklickt?
  if (direction === "right") {
    const { data: otherSwipe } = await supabase
      .from("swipes")
      .select("id")
      .eq("from_user_id", toUserId)
      .eq("to_user_id", user.id)
      .eq("direction", "right")
      .maybeSingle()

    if (otherSwipe) {
      // Match anlegen (kleinere UUID zuerst für Eindeutigkeit)
      const [u1, u2] = [user.id, toUserId].sort()

      // Prüfen ob Match bereits existiert
      const { data: existingMatch } = await supabase
        .from("matches")
        .select("id")
        .eq("user1_id", u1)
        .eq("user2_id", u2)
        .maybeSingle()

      if (!existingMatch) {
        const { error: matchError } = await supabase
          .from("matches")
          .insert({ user1_id: u1, user2_id: u2 })

        if (matchError) {
          console.error("Match insert error:", matchError)
          return NextResponse.json({ error: "Match konnte nicht erstellt werden", detail: matchError.message }, { status: 500 })
        }

        // Send push notification to the OTHER person (first swiper) via service role
        try {
          const sb = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
          )
          const { data: myProfile } = await sb.from("profiles").select("display_name").eq("id", user.id).single()
          const myName: string = myProfile?.display_name ?? "Jemand"
          await sendPushToUser(sb, toUserId, {
            title: "🎉 It's a Match!",
            body: `${myName} hat dich auch geliked! Schreib ihnen jetzt.`,
            icon: "/logo.png",
            url: "/matches",
            tag: "match",
          })
        } catch {
          // push failure does not block the response
        }
      }

      matched = true
    }
  }

  return NextResponse.json({ matched })
}
