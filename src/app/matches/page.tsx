"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Match, Profile, Message } from "@/types/database"
import { getRankColor } from "@/lib/ranks"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ChatWindow from "@/components/ChatWindow"

type MatchWithPartner = Match & { partner: Profile }

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchWithPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMatch, setActiveMatch] = useState<MatchWithPartner | null>(null)
  const [myId, setMyId] = useState<string>("")

  useEffect(() => {
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

      setMatches(
        matchRows.map((m) => ({
          ...m,
          partner: partnerMap[m.user1_id === user.id ? m.user2_id : m.user1_id],
        }))
      )
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
    <div className="min-h-screen max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/discover"><ArrowLeft size={20} style={{ color: "#888" }} /></Link>
        <h1 className="text-xl font-black">Deine Matches</h1>
      </div>

      {loading ? (
        <div className="flex justify-center pt-20">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)" }} />
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center pt-20">
          <p className="text-2xl mb-2">💘</p>
          <p className="font-bold mb-2">Noch keine Matches</p>
          <p className="text-sm mb-6" style={{ color: "#888" }}>Swipt weiter um Matches zu finden!</p>
          <Link
            href="/discover"
            className="px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Zum Swipen
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((match) => (
            <button
              key={match.id}
              onClick={() => setActiveMatch(match)}
              className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all hover:opacity-80"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black flex-shrink-0"
                style={{
                  background: `${getRankColor(match.partner?.rank_tier ?? "iron")}30`,
                  color: getRankColor(match.partner?.rank_tier ?? "iron"),
                }}
              >
                {match.partner?.display_name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{match.partner?.display_name}</p>
                <p className="text-xs truncate" style={{ color: "#888" }}>
                  {match.partner?.rank ?? "Unranked"}
                  {match.partner?.discord_tag && ` · ${match.partner.discord_tag}`}
                </p>
              </div>
              <span className="text-xs" style={{ color: "#555" }}>
                {new Date(match.created_at).toLocaleDateString("de")}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
