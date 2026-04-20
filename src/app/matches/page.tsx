"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import type { Match, Profile, Message } from "@/types/database"
import { getRankColor } from "@/lib/ranks"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, MessageCircle } from "lucide-react"
import ChatWindow from "@/components/ChatWindow"

type MatchWithPartner = Match & { partner: Profile; lastMessage?: Message | null }

function Avatar({ profile, size = 56 }: { profile: Profile; size?: number }) {
  const rankColor = getRankColor(profile.rank_tier ?? "iron")
  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile.display_name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size, border: `2px solid ${rankColor}60` }}
      />
    )
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-black flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: `${rankColor}25`,
        color: rankColor,
        border: `2px solid ${rankColor}50`,
        fontSize: size * 0.38,
      }}
    >
      {profile.display_name?.[0]?.toUpperCase() ?? "?"}
    </div>
  )
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchWithPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMatch, setActiveMatch] = useState<MatchWithPartner | null>(null)
  const [myId, setMyId] = useState<string>("")

  useEffect(() => {
    // Clear unread badge when user visits this page
    localStorage.setItem("lastMatchesVisit", new Date().toISOString())
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setMyId(user.id)

      const { data: matchRows } = await supabase
        .from("matches")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("created_at", { ascending: false })

      if (!matchRows?.length) { setLoading(false); return }

      const partnerIds = matchRows.map((m) =>
        m.user1_id === user.id ? m.user2_id : m.user1_id
      )

      const { data: partners } = await supabase
        .from("profiles")
        .select("*")
        .in("id", partnerIds)

      const partnerMap = Object.fromEntries((partners ?? []).map((p) => [p.id, p]))

      // Last message pro match
      const enriched = await Promise.all(
        matchRows.map(async (m) => {
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("*")
            .eq("match_id", m.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()
          return {
            ...m,
            partner: partnerMap[m.user1_id === user.id ? m.user2_id : m.user1_id],
            lastMessage: lastMsg ?? null,
          }
        })
      )
      setMatches(enriched)
      setLoading(false)
    }
    load()
  }, [])

  if (activeMatch) {
    return (
      <ChatWindow
        match={activeMatch}
        partner={activeMatch.partner}
        myId={myId}
        onBack={() => setActiveMatch(null)}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="flex items-center gap-3 px-5 py-4 border-b sticky top-0 z-40 glass"
        style={{ borderColor: "var(--border)" }}>
        <Link href="/discover" className="p-2 rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <ArrowLeft size={18} style={{ color: "#888" }} />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-black leading-tight">Matches</h1>
          <p className="text-xs" style={{ color: "#555" }}>{matches.length} {matches.length === 1 ? "Match" : "Matches"}</p>
        </div>
        <a href="https://discord.gg/aK2xNfAfEa" target="_blank" rel="noopener noreferrer"
          className="p-2.5 rounded-xl flex items-center justify-center"
          style={{ background: "#5865F2", border: "1px solid #4752c4" }}>
          <Image src="/discord-icon.svg" alt="Discord" width={18} height={18} style={{ filter: "brightness(0) invert(1)" }} />
        </a>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)" }} />
        </div>
      ) : matches.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 text-4xl"
            style={{ background: "rgba(255,70,85,0.1)", border: "1px solid rgba(255,70,85,0.2)" }}>
            💘
          </div>
          <p className="text-xl font-black mb-2">Noch keine Matches</p>
          <p className="text-sm mb-8" style={{ color: "#666" }}>Swipt weiter und findet euren Duo-Partner!</p>
          <Link href="/discover" className="btn-primary px-8 py-3 rounded-xl font-bold text-sm">
            Zum Swipen
          </Link>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* New matches horizontal scroll */}
          <div className="px-5 pt-5 pb-3">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Neue Matches</p>
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {matches.map((m) => (
                <button key={m.id} onClick={() => setActiveMatch(m)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="relative">
                    <Avatar profile={m.partner} size={62} />
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2"
                      style={{ background: "var(--accent)", borderColor: "var(--background)" }} />
                  </div>
                  <span className="text-xs font-semibold truncate max-w-[62px]" style={{ color: "#aaa" }}>
                    {m.partner?.display_name?.split(/\s|#/)[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 my-1 border-t" style={{ borderColor: "var(--border)" }} />

          {/* Chat list */}
          <div className="px-4 py-2">
            <p className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: "#555" }}>Nachrichten</p>
            <div className="flex flex-col gap-1">
              {matches.map((match, i) => {
                const rankColor = getRankColor(match.partner?.rank_tier ?? "iron")
                const lastMsg = match.lastMessage
                return (
                  <motion.button
                    key={match.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setActiveMatch(match)}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left w-full transition-colors"
                    style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar profile={match.partner} size={52} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-bold text-sm truncate">{match.partner?.display_name}</p>
                        <span className="text-[10px] flex-shrink-0 ml-2" style={{ color: "#444" }}>
                          {lastMsg
                            ? new Date(lastMsg.created_at).toLocaleTimeString("de", { hour: "2-digit", minute: "2-digit" })
                            : new Date(match.created_at).toLocaleDateString("de", { day: "2-digit", month: "2-digit" })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold"
                          style={{ background: `${rankColor}20`, color: rankColor }}>
                          {match.partner?.rank ?? "Unranked"}
                        </span>
                        <p className="text-xs truncate" style={{ color: "#555" }}>
                          {lastMsg ? lastMsg.content : "Schreib als Erstes!"}
                        </p>
                      </div>
                    </div>
                    <MessageCircle size={16} style={{ color: "#333", flexShrink: 0 }} />
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
