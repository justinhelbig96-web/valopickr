import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Service Role client — bypasses RLS
function makeServiceClient() {
  const { createClient } = require("@supabase/supabase-js")
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function getCallerProfile() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
  return data?.is_admin ? user : null
}

export async function GET() {
  const caller = await getCallerProfile()
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const sb = makeServiceClient()

  const [{ data: profiles }, { data: swipeStats }, { data: matchStats }] = await Promise.all([
    sb.from("profiles").select("id, display_name, rank, rank_tier, region, discord_tag, riot_name, riot_tag, created_at, is_admin").order("created_at", { ascending: false }),
    sb.from("swipes").select("from_user_id, direction"),
    sb.from("matches").select("user1_id, user2_id"),
  ])

  const swipeMap: Record<string, { likes: number; passes: number }> = {}
  for (const s of swipeStats ?? []) {
    if (!swipeMap[s.from_user_id]) swipeMap[s.from_user_id] = { likes: 0, passes: 0 }
    if (s.direction === "right") swipeMap[s.from_user_id].likes++
    else swipeMap[s.from_user_id].passes++
  }

  const matchCount: Record<string, number> = {}
  for (const m of matchStats ?? []) {
    matchCount[m.user1_id] = (matchCount[m.user1_id] ?? 0) + 1
    matchCount[m.user2_id] = (matchCount[m.user2_id] ?? 0) + 1
  }

  const users = (profiles ?? []).map((p: any) => ({
    ...p,
    swipes: swipeMap[p.id] ?? { likes: 0, passes: 0 },
    matches: matchCount[p.id] ?? 0,
  }))

  const totalSwipes = (swipeStats ?? []).length
  const totalMatches = (matchStats ?? []).length

  return NextResponse.json({ users, totalSwipes, totalMatches })
}

export async function DELETE(req: Request) {
  const caller = await getCallerProfile()
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const sb = makeServiceClient()
  await Promise.all([
    sb.from("swipes").delete().or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`),
    sb.from("matches").delete().or(`user1_id.eq.${userId},user2_id.eq.${userId}`),
  ])

  return NextResponse.json({ ok: true })
}
