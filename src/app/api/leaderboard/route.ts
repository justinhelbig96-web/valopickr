import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function rankScore(rank: string | null, tier: string | null): number {
  const tierOrder = ["iron", "bronze", "silver", "gold", "platinum", "diamond", "ascendant", "immortal", "radiant"]
  const tierIdx = tierOrder.indexOf((tier ?? "").toLowerCase())
  if (tierIdx < 0) return -1
  const numMatch = rank?.match(/(\d+)$/)
  const num = numMatch ? parseInt(numMatch[1]) : 0
  return tierIdx * 4 + num
}

export async function GET() {
  const supabase = await createClient()

  const [{ data: profiles }, { data: stats }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, rank, rank_tier, region, avatar_url, agent_mains")
      .not("rank_tier", "is", null)
      .not("display_name", "is", null)
      .limit(200),
    supabase
      .from("valorant_stats")
      .select("user_id, wins, losses, kd_ratio, headshot_rate, matches_played"),
  ])

  const statsMap = Object.fromEntries((stats ?? []).map((s) => [s.user_id, s]))

  const sorted = (profiles ?? [])
    .map((p) => ({ ...p, stats: statsMap[p.id] ?? null }))
    .sort((a, b) => rankScore(b.rank, b.rank_tier) - rankScore(a.rank, a.rank_tier))
    .slice(0, 50)
    .map((p, i) => ({ ...p, position: i + 1 }))

  return NextResponse.json({ leaderboard: sorted })
}
