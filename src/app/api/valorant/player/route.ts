import { NextRequest, NextResponse } from "next/server"

const HENRIK_BASE = "https://api.henrikdev.xyz"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get("name")
  const tag = searchParams.get("tag")
  const region = searchParams.get("region") ?? "eu"

  if (!name || !tag) {
    return NextResponse.json({ error: "name und tag erforderlich" }, { status: 400 })
  }

  const headers: Record<string, string> = {}
  if (process.env.HENRIK_API_KEY) {
    headers["Authorization"] = process.env.HENRIK_API_KEY
  }

  try {
    // Account + Rank abrufen
    const [accountRes, mmrRes] = await Promise.all([
      fetch(
        `${HENRIK_BASE}/valorant/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
        { headers, next: { revalidate: 300 } }
      ),
      fetch(
        `${HENRIK_BASE}/valorant/v1/mmr/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
        { headers, next: { revalidate: 300 } }
      ),
    ])

    if (!accountRes.ok) {
      return NextResponse.json({ error: "Spieler nicht gefunden" }, { status: 404 })
    }

    const accountData = await accountRes.json()
    const mmrData = mmrRes.ok ? await mmrRes.json() : null

    const currentRankRaw: string = mmrData?.data?.currenttierpatched ?? "Unranked"
    const rankTier = currentRankRaw.split(" ")[0].toLowerCase()

    // Lifetime Stats
    const statsRes = await fetch(
      `${HENRIK_BASE}/valorant/v1/lifetime/matches/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=20`,
      { headers, next: { revalidate: 300 } }
    )
    let stats = null
    if (statsRes.ok) {
      const statsData = await statsRes.json()
      const matches = statsData?.data ?? []
      if (matches.length > 0) {
        let totalKills = 0, totalDeaths = 0, totalHS = 0, totalShots = 0, totalScore = 0
        let wins = 0, losses = 0

        for (const match of matches) {
          const player = match?.stats
          if (!player) continue
          totalKills += player.kills ?? 0
          totalDeaths += player.deaths ?? 0
          // Henrik API: shots are nested in stats.shots.head/body/leg
          const head = player.shots?.head ?? player.headshots ?? 0
          const body = player.shots?.body ?? player.bodyshots ?? 0
          const leg  = player.shots?.leg  ?? player.legshots  ?? 0
          totalHS += head
          totalShots += head + body + leg
          totalScore += player.score ?? 0
          // Wins: compare round counts per team
          const playerTeam = player.team?.toLowerCase() ?? "red"
          const otherTeam = playerTeam === "red" ? "blue" : "red"
          const myRounds = match.teams?.[playerTeam] ?? 0
          const theirRounds = match.teams?.[otherTeam] ?? 0
          if (myRounds > theirRounds) wins++
          else losses++
        }

        stats = {
          wins,
          losses,
          kd: totalDeaths > 0 ? Math.round((totalKills / totalDeaths) * 100) / 100 : totalKills,
          headshotRate: totalShots > 0 ? Math.round((totalHS / totalShots) * 10000) / 100 : 0,
          avgScore: matches.length > 0 ? Math.round(totalScore / matches.length) : 0,
          matchesPlayed: matches.length,
        }
      }
    }

    return NextResponse.json({
      name: accountData.data?.name ?? name,
      tag: accountData.data?.tag ?? tag,
      rank: currentRankRaw,
      rankTier,
      peakRank: mmrData?.data?.highestRank?.patched_tier ?? null,
      puuid: accountData.data?.puuid ?? null,
      stats,
    })
  } catch {
    return NextResponse.json({ error: "API-Fehler" }, { status: 500 })
  }
}
