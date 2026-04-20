import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

  // Swipe speichern (upsert verhindert Duplikate)
  const { error: swipeError } = await supabase
    .from("swipes")
    .upsert({ from_user_id: user.id, to_user_id: toUserId as string, direction: direction as 'left' | 'right' })

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
      await supabase
        .from("matches")
        .upsert({ user1_id: u1, user2_id: u2 })

      matched = true
    }
  }

  return NextResponse.json({ matched })
}
