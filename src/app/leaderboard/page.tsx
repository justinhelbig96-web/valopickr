"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getRankColor } from "@/lib/ranks"
import RankIcon from "@/components/RankIcon"
import Link from "next/link"
import { Trophy, Loader2, ArrowLeft } from "lucide-react"

type LeaderboardEntry = {
  id: string
  display_name: string
  rank: string | null
  rank_tier: string | null
  region: string | null
  avatar_url: string | null
  agent_mains: string[] | null
  position: number
  stats: {
    wins: number
    losses: number
    kd_ratio: number
    headshot_rate: number
    matches_played: number
  } | null
}

const MEDAL = ["#FFD700", "#C0C0C0", "#CD7F32"]

function Avatar({ entry, size = 56 }: { entry: LeaderboardEntry; size?: number }) {
  const rankColor = getRankColor(entry.rank_tier ?? "iron")
  if (entry.avatar_url) {
    return (
      <img src={entry.avatar_url} alt="" className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size, border: `2px solid ${rankColor}60` }} />
    )
  }
  return (
    <div className="rounded-full flex items-center justify-center font-black shrink-0"
      style={{ width: size, height: size, background: `${rankColor}20`, color: rankColor, border: `2px solid ${rankColor}50`, fontSize: size * 0.38 }}>
      {entry.display_name?.[0]?.toUpperCase() ?? "?"}
    </div>
  )
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => { setEntries(data.leaderboard ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <Loader2 className="animate-spin" style={{ color: "var(--accent)" }} size={32} />
      </div>
    )
  }

  const top3 = entries.slice(0, 3)
  // Show podium order: #2, #1, #3
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean)
  const podiumPositions = [2, 1, 3]
  const podiumHeights = [80, 0, 110]

  return (
    <div className="min-h-screen grid-bg" style={{ background: "var(--background)" }}>
      {/* Nav */}
      <nav className="glass sticky top-0 z-50 px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-black tracking-tighter text-xl shimmer-text">VALOPICKR</Link>
          <Link href="/discover" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "#888" }}>
            <ArrowLeft size={14} /> Discover
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)" }}>
            <Trophy size={32} style={{ color: "#FFD700" }} />
          </div>
          <h1 className="text-5xl font-black tracking-tight" style={{ fontFamily: "var(--font-bebas), Impact, sans-serif" }}>
            LEADERBOARD
          </h1>
          <p className="text-sm mt-2" style={{ color: "#666" }}>Die Top-Spieler der ValoPickr Community</p>
        </motion.div>

        {/* Top 3 Podium */}
        {podium.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex items-end justify-center gap-3 mb-10">
            {podium.map((entry, i) => {
              const pos = podiumPositions[i]
              const medal = MEDAL[pos - 1]
              const rankColor = getRankColor(entry.rank_tier ?? "iron")
              return (
                <div key={entry.id} className="flex flex-col items-center rounded-2xl p-4 relative"
                  style={{
                    background: `${medal}08`,
                    border: `1px solid ${medal}45`,
                    boxShadow: pos === 1 ? `0 0 40px ${medal}20` : "none",
                    width: pos === 1 ? 160 : 130,
                    marginBottom: podiumHeights[i],
                  }}>
                  {pos === 1 && (
                    <div className="absolute -top-5 text-3xl">👑</div>
                  )}
                  <span className="text-2xl font-black mb-3" style={{ color: medal }}>#{pos}</span>
                  <Avatar entry={entry} size={pos === 1 ? 64 : 52} />
                  <p className="text-sm font-bold text-center truncate w-full mt-2">{entry.display_name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {entry.rank && <RankIcon rank={entry.rank} tier={entry.rank_tier ?? "iron"} size={14} />}
                    <span className="text-xs font-semibold truncate" style={{ color: rankColor }}>{entry.rank ?? "—"}</span>
                  </div>
                  {entry.stats?.kd_ratio != null && (
                    <span className="text-xs mt-1.5 font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${rankColor}18`, color: rankColor }}>
                      {Number(entry.stats.kd_ratio).toFixed(2)} K/D
                    </span>
                  )}
                </div>
              )
            })}
          </motion.div>
        )}

        {/* Full ranking list */}
        <div className="flex flex-col gap-2">
          {entries.map((entry, i) => {
            const rankColor = getRankColor(entry.rank_tier ?? "iron")
            const medal = entry.position <= 3 ? MEDAL[entry.position - 1] : null
            return (
              <motion.div key={entry.id}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 + i * 0.02 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: medal ? `${medal}06` : "var(--card)",
                  border: `1px solid ${medal ? medal + "40" : "var(--border)"}`,
                }}>
                <span className="text-sm font-black w-7 text-right shrink-0"
                  style={{ color: medal ?? "#555" }}>
                  {medal ? ["🥇", "🥈", "🥉"][entry.position - 1] : `#${entry.position}`}
                </span>
                <Avatar entry={entry} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{entry.display_name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {entry.rank && <RankIcon rank={entry.rank} tier={entry.rank_tier ?? "iron"} size={13} />}
                    <span className="text-xs" style={{ color: rankColor }}>{entry.rank ?? "Unranked"}</span>
                    {entry.region && (
                      <span className="text-xs uppercase font-bold" style={{ color: "#444" }}>{entry.region}</span>
                    )}
                    {entry.agent_mains?.[0] && (
                      <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: `${rankColor}15`, color: rankColor }}>
                        {entry.agent_mains[0]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {entry.stats?.kd_ratio != null && (
                    <div className="text-right">
                      <p className="text-[10px]" style={{ color: "#555" }}>K/D</p>
                      <p className="text-sm font-black" style={{ color: Number(entry.stats.kd_ratio) >= 1 ? rankColor : "#888" }}>
                        {Number(entry.stats.kd_ratio).toFixed(2)}
                      </p>
                    </div>
                  )}
                  {entry.stats?.headshot_rate != null && (
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px]" style={{ color: "#555" }}>HS%</p>
                      <p className="text-sm font-black" style={{ color: "#888" }}>
                        {Number(entry.stats.headshot_rate).toFixed(1)}%
                      </p>
                    </div>
                  )}
                  {entry.stats?.wins != null && (
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px]" style={{ color: "#555" }}>Wins</p>
                      <p className="text-sm font-black" style={{ color: "#888" }}>{entry.stats.wins}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-16">
            <Trophy size={48} className="mx-auto mb-4 opacity-20" />
            <p style={{ color: "#555" }}>Noch keine Rangspieler in der Community</p>
          </div>
        )}
      </div>
    </div>
  )
}
