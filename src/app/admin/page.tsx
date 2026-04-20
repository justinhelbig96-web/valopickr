"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getRankColor } from "@/lib/ranks"
import RankIcon from "@/components/RankIcon"
import {
  Loader2, Users, Zap, Heart, Shield, Trash2,
  RefreshCw, ChevronUp, ChevronDown, Search
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

type AdminUser = {
  id: string
  display_name: string
  rank: string | null
  rank_tier: string | null
  region: string | null
  discord_tag: string | null
  riot_name: string | null
  riot_tag: string | null
  created_at: string
  is_admin: boolean
  swipes: { likes: number; passes: number }
  matches: number
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [totalSwipes, setTotalSwipes] = useState(0)
  const [totalMatches, setTotalMatches] = useState(0)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"created_at" | "rank" | "matches">("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [resetting, setResetting] = useState<string | null>(null)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }
      const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
      if (!data?.is_admin) { router.push("/discover"); return }
      await loadUsers()
    }
    check()
  }, [router])

  async function loadUsers() {
    setLoading(true)
    const res = await fetch("/api/admin/users")
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
      setTotalSwipes(data.totalSwipes)
      setTotalMatches(data.totalMatches)
    }
    setLoading(false)
  }

  async function resetSwipes(userId: string) {
    setResetting(userId)
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    await loadUsers()
    setResetting(null)
  }

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortBy(col); setSortDir("desc") }
  }

  const filtered = users
    .filter((u) =>
      search === "" ||
      u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.riot_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.region?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let av: any, bv: any
      if (sortBy === "created_at") { av = a.created_at; bv = b.created_at }
      else if (sortBy === "matches") { av = a.matches; bv = b.matches }
      else { av = a.rank ?? ""; bv = b.rank ?? "" }
      if (sortDir === "asc") return av > bv ? 1 : -1
      return av < bv ? 1 : -1
    })

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin" style={{ color: "var(--accent)" }} size={28} />
    </div>
  )

  return (
    <div className="min-h-screen grid-bg">
      {/* Glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #ff4655, transparent)", filter: "blur(60px)" }} />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #7b61ff, transparent)", filter: "blur(60px)" }} />
      </div>

      {/* Nav */}
      <nav className="glass sticky top-0 z-50 px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/discover" className="font-black tracking-tighter text-xl">
              <span className="shimmer-text">VALOMATE</span>
            </Link>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
              style={{ background: "rgba(255,70,85,0.15)", color: "var(--accent)", border: "1px solid rgba(255,70,85,0.3)" }}>
              <Shield size={11} /> ADMIN
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadUsers} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
              style={{ border: "1px solid var(--border)", color: "#888" }}>
              <RefreshCw size={12} /> Refresh
            </button>
            <Link href="/profile" className="text-xs px-4 py-2 rounded-xl font-medium"
              style={{ border: "1px solid var(--border)", color: "#888" }}>
              Profil
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Users, label: "Users", value: users.length, color: "#7b61ff" },
            { icon: Zap, label: "Swipes", value: totalSwipes, color: "#ffd700" },
            { icon: Heart, label: "Matches", value: totalMatches, color: "#ff4655" },
          ].map((s) => (
            <div key={s.label} className="p-5 rounded-2xl card-hover"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <s.icon size={20} style={{ color: s.color }} className="mb-2" />
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "#555" }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#555" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Suchen nach Name, Riot-ID, Region..."
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
          </div>
          <span className="text-xs px-3 py-2 rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)", color: "#555" }}>
            {filtered.length} / {users.length}
          </span>
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {/* Table header */}
          <div className="grid grid-cols-[1fr_120px_80px_80px_80px_80px_48px] gap-2 px-4 py-3 text-xs font-bold"
            style={{ background: "#0d0d14", color: "#555", borderBottom: "1px solid var(--border)" }}>
            <button className="text-left flex items-center gap-1 hover:text-white transition-colors" onClick={() => toggleSort("created_at")}>
              Benutzer {sortBy === "created_at" ? (sortDir === "desc" ? <ChevronDown size={11} /> : <ChevronUp size={11} />) : null}
            </button>
            <span>Rank</span>
            <button className="flex items-center gap-1 hover:text-white transition-colors" onClick={() => toggleSort("matches")}>
              Matches {sortBy === "matches" ? (sortDir === "desc" ? <ChevronDown size={11} /> : <ChevronUp size={11} />) : null}
            </button>
            <span>Likes</span>
            <span>Passes</span>
            <span>Region</span>
            <span></span>
          </div>

          <AnimatePresence>
            {filtered.map((u, i) => (
              <motion.div key={u.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="grid grid-cols-[1fr_120px_80px_80px_80px_80px_48px] gap-2 items-center px-4 py-3 text-sm"
                style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                  background: u.is_admin ? "rgba(255,70,85,0.04)" : "transparent",
                }}>
                {/* Name */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: `${getRankColor(u.rank_tier ?? "iron")}25`, color: getRankColor(u.rank_tier ?? "iron") }}>
                      {u.display_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate flex items-center gap-1.5">
                        {u.display_name}
                        {u.is_admin && <Shield size={11} style={{ color: "var(--accent)" }} />}
                      </p>
                      <p className="text-xs truncate" style={{ color: "#555" }}>
                        {u.riot_name ? `${u.riot_name}#${u.riot_tag}` : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rank */}
                <div className="flex items-center gap-1.5">
                  {u.rank ? (
                    <>
                      <RankIcon rank={u.rank} tier={u.rank_tier ?? "iron"} size={16} />
                      <span className="text-xs truncate" style={{ color: getRankColor(u.rank_tier ?? "iron") }}>{u.rank}</span>
                    </>
                  ) : <span style={{ color: "#444" }}>—</span>}
                </div>

                {/* Matches */}
                <span className="font-bold" style={{ color: u.matches > 0 ? "#ff4655" : "#444" }}>{u.matches}</span>
                <span style={{ color: "#7b61ff" }}>{u.swipes.likes}</span>
                <span style={{ color: "#555" }}>{u.swipes.passes}</span>
                <span className="text-xs uppercase" style={{ color: "#555" }}>{u.region ?? "—"}</span>

                {/* Reset */}
                <button onClick={() => resetSwipes(u.id)} disabled={resetting === u.id}
                  title="Swipes zurücksetzen"
                  className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                  style={{ color: "#444" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4655")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}>
                  {resetting === u.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-16 text-center" style={{ color: "#444" }}>
              <Users size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Keine Benutzer gefunden</p>
            </div>
          )}
        </motion.div>

        <p className="text-xs text-center mt-6" style={{ color: "#333" }}>
          "Swipes zurücksetzen" löscht alle Swipes eines Users — er erscheint dann wieder für alle anderen.
        </p>
      </div>
    </div>
  )
}
