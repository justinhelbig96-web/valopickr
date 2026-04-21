"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { getRankColor, getRankGlow, getRankIndex, RANKS } from "@/lib/ranks"
import RankIcon from "@/components/RankIcon"
import type { Profile, ValorantStats } from "@/types/database"
import { Heart, X, MessageSquare, Globe, Swords, Trophy, SlidersHorizontal } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import MatchModal from "@/components/MatchModal"
import RankFilterPanel, { type FilterValue } from "@/components/RankFilterPanel"

type ProfileWithStats = Profile & { stats?: ValorantStats | null }

function getCompatScore(me: Profile, other: ProfileWithStats): number {
  let score = 0
  if (me.region && me.region === other.region) score += 30
  if (me.rank_tier && other.rank_tier) {
    const diff = Math.abs(getRankIndex(me.rank_tier) - getRankIndex(other.rank_tier))
    score += Math.max(0, 30 - diff * 7)
  }
  if (me.playstyle && me.playstyle === other.playstyle) score += 20
  const myL = me.languages ?? []
  const otherL = other.languages ?? []
  if (myL.length > 0 && otherL.length > 0) {
    const overlap = myL.filter(l => otherL.includes(l)).length
    score += Math.round((overlap / Math.max(myL.length, otherL.length)) * 20)
  }
  return Math.min(100, score)
}

function isOnline(profile: ProfileWithStats): boolean {
  if (!profile.last_seen) return false
  return Date.now() - new Date(profile.last_seen).getTime() < 30 * 60 * 1000
}

import PushSetup from "@/components/PushSetup"
import { getAgentPortrait } from "@/lib/agentImages"
import { useLanguage } from "@/contexts/LanguageContext"
import { LOCALES } from "@/lib/translations"

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [matchedProfile, setMatchedProfile] = useState<ProfileWithStats | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [rankFilter, setRankFilter] = useState<FilterValue>({ min: "iron", max: "radiant", regions: [], playstyles: [], languages: [] })
  const [myProfile, setMyProfile] = useState<Profile | null>(null)
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null)
  const [newMatchCount, setNewMatchCount] = useState(0)
  const [onlineCount, setOnlineCount] = useState(0)
  const { locale, setLocale, t } = useLanguage()
  const swipingRef = useRef(false)
  const myIdRef = useRef<string | null>(null)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-22, 22])
  const likeOpacity = useTransform(x, [30, 120], [0, 1])
  const nopeOpacity = useTransform(x, [-120, -30], [1, 0])
  const cardScale = useTransform(x, [-220, 0, 220], [0.97, 1, 0.97])

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: me } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    setMyProfile(me)
    myIdRef.current = user.id
    void supabase.from("profiles").update({ last_seen: new Date().toISOString() }).eq("id", user.id)

    const { data: swipes } = await supabase.from("swipes").select("to_user_id").eq("from_user_id", user.id)
    const swipedIds = swipes?.map((s) => s.to_user_id) ?? []

    let query = supabase
      .from("profiles")
      .select("*, valorant_stats(*)")
      .neq("id", user.id)
      .not("display_name", "is", null)
      .order("created_at", { ascending: false })
      .order("created_at", { ascending: false })

    if (swipedIds.length > 0) {
      query = query.not("id", "in", `(${swipedIds.join(",")})`)
    }

    const minIdx = RANKS.findIndex((r) => r.tier === rankFilter.min)
    const maxIdx = RANKS.findIndex((r) => r.tier === rankFilter.max)
    const allowedTiers = RANKS.slice(Math.max(0, minIdx), Math.min(RANKS.length, maxIdx + 1)).map((r) => r.tier)
    if (allowedTiers.length < RANKS.length) query = query.in("rank_tier", allowedTiers)
    if (rankFilter.regions.length > 0) query = query.in("region", rankFilter.regions)
    if (rankFilter.playstyles.length > 0) query = query.in("playstyle", rankFilter.playstyles)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (rankFilter.languages.length > 0) query = (query as any).overlaps("languages", rankFilter.languages)

    const { data } = await query.limit(50)
    const mapped: ProfileWithStats[] = (data ?? []).map((p: Record<string, unknown>) => ({
      ...(p as Profile),
      stats: Array.isArray(p.valorant_stats) ? (p.valorant_stats[0] as ValorantStats ?? null) : null,
    }))
    setProfiles(mapped)
    setCurrentIndex(0)
    setSwipeDir(null)
    swipingRef.current = false
    setLoading(false)

    // Auto-fetch stats for profiles that have riot_name but no stats yet
    const missing = mapped.filter((p) => p.riot_name && p.riot_tag && !p.stats)
    if (missing.length > 0) {
      autoFetchStats(missing, supabase)
    }
  }, [rankFilter])

  async function autoFetchStats(profiles: ProfileWithStats[], supabase: ReturnType<typeof createClient>) {
    for (const p of profiles) {
      if (!p.riot_name || !p.riot_tag) continue
      try {
        const region = p.region?.toLowerCase() ?? "eu"
        const res = await fetch(
          `/api/valorant/player?name=${encodeURIComponent(p.riot_name)}&tag=${encodeURIComponent(p.riot_tag)}&region=${region}`
        )
        if (!res.ok) continue
        const data = await res.json()
        if (!data.stats) continue

        const statsRow = {
          user_id: p.id,
          wins: data.stats.wins ?? 0,
          losses: data.stats.losses ?? 0,
          kd_ratio: data.stats.kd ?? 0,
          headshot_rate: data.stats.headshotRate ?? 0,
          avg_score: data.stats.avgScore ?? 0,
          matches_played: data.stats.matchesPlayed ?? 0,
          playtime_hours: 0,
          updated_at: new Date().toISOString(),
        }

        await supabase
          .from("valorant_stats")
          .upsert(statsRow, { onConflict: "user_id" })

        // Update local state so UI updates immediately
        setProfiles((prev) =>
          prev.map((pr) =>
            pr.id === p.id
              ? { ...pr, stats: { ...statsRow, id: pr.id } as ValorantStats }
              : pr
          )
        )
      } catch {
        // silently skip if fetch fails for one profile
      }
    }
  }

  useEffect(() => { fetchProfiles() }, [fetchProfiles])

  // Online counter — refresh every 60 s
  useEffect(() => {
    async function fetchOnline() {
      const supabase = createClient()
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gt("last_seen", fiveMinAgo)
      setOnlineCount(count ?? 0)
    }
    fetchOnline()
    const t = setInterval(fetchOnline, 60_000)
    return () => clearInterval(t)
  }, [])

  // Badge: count new matches since last visit to /matches
  useEffect(() => {
    async function loadBadge() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const lastVisit = localStorage.getItem("lastMatchesVisit")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from("matches")
        .select("id", { count: "exact", head: true })
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      if (lastVisit) query = query.gt("created_at", lastVisit)
      const { count } = await query
      setNewMatchCount(count ?? 0)
    }
    loadBadge()
  }, [])

  // Realtime: show match animation for the FIRST swiper when other person completes the match
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("matches-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "matches" },
        async (payload) => {
          const myId = myIdRef.current
          if (!myId) return
          const row = payload.new as { user1_id: string; user2_id: string }
          const partnerId = row.user1_id === myId ? row.user2_id : row.user1_id
          if (row.user1_id !== myId && row.user2_id !== myId) return

          // Only show if we're not already seeing the animation (we're the second swiper)
          setMatchedProfile((prev) => {
            if (prev) return prev // already showing
            return null // will be set below
          })

          const { data: partner } = await supabase
            .from("profiles")
            .select("*, valorant_stats(*)")
            .eq("id", partnerId)
            .single()

          if (partner) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const raw = partner as any
            const stats = Array.isArray(raw.valorant_stats)
              ? (raw.valorant_stats[0] ?? null)
              : null
            setMatchedProfile((prev) => prev ?? { ...raw, stats })
            setNewMatchCount((n) => n + 1)
          }
        }
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [])

  async function triggerSwipe(direction: "left" | "right") {
    if (swipingRef.current || currentIndex >= profiles.length) return
    swipingRef.current = true
    setSwipeDir(direction)
  }

  async function onAnimationComplete() {
    if (!swipeDir) return
    const target = profiles[currentIndex]

    const res = await fetch("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: target.id, direction: swipeDir }),
    })
    const data = await res.json()
    if (data.matched) setMatchedProfile(target)

    x.set(0)
    setSwipeDir(null)
    swipingRef.current = false
    setCurrentIndex((i) => i + 1)
  }

  function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    const threshold = Math.abs(info.velocity.x) > 400 ? 60 : 110
    if (info.offset.x > threshold) triggerSwipe("right")
    else if (info.offset.x < -threshold) triggerSwipe("left")
    else x.set(0)
  }

  const currentProfile = profiles[currentIndex]
  const rankColor = getRankColor(currentProfile?.rank_tier ?? "iron")
  const glow = getRankGlow(currentProfile?.rank_tier ?? "iron")
  const compatScore = myProfile && currentProfile ? getCompatScore(myProfile, currentProfile) : null

  return (
    <div className="flex flex-col min-h-screen dot-grid-red" style={{ background: "var(--background)" }}>
      <PushSetup />
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 glass sticky top-0 z-50"
        style={{ borderBottom: "1px solid var(--border)" }}>
        {/* Left: Logo + online dot */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/" className="font-bebas text-2xl tracking-widest shimmer-text glow-text-red">VALOPICKR</Link>
          {onlineCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#22c55e" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#22c55e" }} />
              </span>
              <span className="text-[11px] font-semibold" style={{ color: "#22c55e" }}>{onlineCount}</span>
            </div>
          )}
        </div>

        {/* Center: Nav links */}
        <nav className="flex items-center gap-1">
          <Link href="/matches"
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all hover:bg-white/5"
            style={{ color: "var(--foreground)" }}>
            <MessageSquare size={16} />
            <span>Matches</span>
            {newMatchCount > 0 && (
              <span className="flex items-center justify-center rounded-full font-black text-white"
                style={{ background: "#FF4655", fontSize: 10, minWidth: 18, height: 18, lineHeight: 1, paddingInline: 4 }}>
                {newMatchCount > 9 ? "9+" : newMatchCount}
              </span>
            )}
          </Link>
          <Link href="/leaderboard"
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all hover:bg-white/5"
            style={{ color: "#FFD700" }}>
            <Trophy size={16} />
            <span>Leaderboard</span>
          </Link>
        </nav>

        {/* Right: Language + Discord + Avatar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Switcher */}
          <div className="flex items-center gap-0.5 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLocale(l.code)}
                className="px-2 py-1 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: locale === l.code ? "rgba(255,70,85,0.2)" : "transparent",
                  color: locale === l.code ? "var(--accent)" : "var(--muted)",
                  border: locale === l.code ? "1px solid rgba(255,70,85,0.3)" : "1px solid transparent",
                }}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
          <a href="https://discord.gg/aK2xNfAfEa" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: "rgba(88,101,242,0.15)", border: "1px solid rgba(88,101,242,0.35)", color: "#8891f1" }}>
            <Image src="/discord-icon.svg" alt="Discord" width={15} height={15} style={{ filter: "brightness(0) saturate(100%) invert(55%) sepia(80%) saturate(400%) hue-rotate(200deg) brightness(90%)" }} />
            <span className="hidden sm:inline">Discord</span>
          </a>
          <Link href="/profile"
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black overflow-hidden ring-2 ring-transparent hover:ring-[var(--accent)] transition-all"
            style={{ background: myProfile?.avatar_url ? "transparent" : "var(--accent)", color: "#fff" }}>
            {myProfile?.avatar_url
              ? <img src={myProfile.avatar_url} alt="" className="w-full h-full object-cover" />
              : (myProfile?.display_name?.[0]?.toUpperCase() ?? "?")}
          </Link>
        </div>
      </header>

      {/* Filter strip */}
      {(() => {
        const activeCount = [rankFilter.min !== "iron" || rankFilter.max !== "radiant", rankFilter.regions.length > 0, rankFilter.playstyles.length > 0, rankFilter.languages.length > 0].filter(Boolean).length
        return (
          <>
            <div className="header-accent-line" />
            <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "var(--border)", background: "rgba(10,10,18,0.7)" }}>
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all"
                style={activeCount > 0
                  ? { background: "rgba(255,70,85,0.12)", border: "1px solid rgba(255,70,85,0.4)", color: "var(--accent)" }
                  : { background: "var(--card)", border: "1px solid var(--border)", color: "#aaa" }
                }
              >
                <SlidersHorizontal size={15} />
                {t.discover.filter}
                {activeCount > 0 && (
                  <span className="text-xs font-black px-1.5 py-0.5 rounded-full" style={{ background: "var(--accent)", color: "#fff", fontSize: 10 }}>
                    {activeCount}
                  </span>
                )}
              </button>
            </div>
          </>
        )
      })()}

      <AnimatePresence>
        {showFilters && (
          <RankFilterPanel value={rankFilter}
            onChange={(f) => { setRankFilter(f) }}
            onClose={() => setShowFilters(false)} />
        )}
      </AnimatePresence>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full animate-spin"
                style={{ border: "2px solid transparent", borderTopColor: "var(--accent)", borderRightColor: "rgba(255,70,85,0.3)" }} />
              <div className="absolute inset-2 rounded-full animate-spin"
                style={{ border: "2px solid transparent", borderTopColor: "rgba(255,70,85,0.5)", animationDirection: "reverse", animationDuration: "0.6s" }} />
              <div className="absolute inset-0 flex items-center justify-center text-lg">⚔️</div>
            </div>
            <p className="font-bebas text-xl tracking-widest" style={{ color: "#444" }}>{t.discover.loading}</p>
          </motion.div>
        ) : !currentProfile ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex flex-col items-center text-center max-w-sm w-full"
          >
            {/* Ambient glow blobs */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(255,70,85,0.12) 0%, transparent 70%)", filter: "blur(40px)" }} />
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(123,97,255,0.08) 0%, transparent 70%)", filter: "blur(30px)" }} />

            {/* Icon */}
            <div className="relative mb-6 w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{ background: "rgba(255,70,85,0.08)", border: "1px solid rgba(255,70,85,0.2)", boxShadow: "0 0 40px rgba(255,70,85,0.1)" }}>
              <span className="text-5xl select-none">🃏</span>
            </div>

            {/* Rank pills row */}
            <div className="flex gap-1.5 mb-6 flex-wrap justify-center">
              {["🗡️", "🛡️", "⚔️", "🏆", "💎", "🔥"].map((e, i) => (
                <motion.span key={i}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="text-xl">{e}</motion.span>
              ))}
            </div>

            <h2 className="font-bebas text-4xl tracking-wider mb-2" style={{ color: "var(--foreground)" }}>
              {t.discover.emptyTitle}
            </h2>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: "#555" }}>
              {t.discover.emptySub.split("\n").map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={fetchProfiles}
                className="btn-primary w-full py-3.5 text-sm font-black rounded-2xl flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                </svg>
                {t.discover.reload}
              </button>
              <button
                onClick={() => setShowFilters(true)}
                className="w-full py-3.5 text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-white/5"
                style={{ border: "1px solid var(--border)", color: "#888" }}
              >
                <SlidersHorizontal size={15} />
                {t.discover.adjustFilters}
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="relative flex flex-col items-center">
            {/* Background stack cards */}
            {profiles[currentIndex + 2] && (
              <div className="absolute rounded-3xl"
                style={{ width: 420, height: 700, background: "var(--card)", border: "1px solid var(--border)", transform: "scale(0.90) translateY(18px)", opacity: 0.3, zIndex: 1 }} />
            )}
            {profiles[currentIndex + 1] && (
              <div className="absolute rounded-3xl"
                style={{ width: 420, height: 700, background: "var(--card)", border: "1px solid var(--border)", transform: "scale(0.95) translateY(9px)", opacity: 0.6, zIndex: 2 }} />
            )}

            {/* Active Card */}
            <AnimatePresence>
              <motion.div
                key={currentProfile.id}
                drag={swipeDir ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                animate={swipeDir
                  ? { x: swipeDir === "right" ? 700 : -700, rotate: swipeDir === "right" ? 28 : -28, opacity: 0, transition: { duration: 0.38, ease: "easeIn" } }
                  : { x: 0, rotate: 0, opacity: 1 }
                }
                onAnimationComplete={onAnimationComplete}
                onDragEnd={handleDragEnd}
                className="relative rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
                style={{ x, rotate, scale: cardScale, width: 420, height: 700, zIndex: 10, background: "var(--card)", border: glow.border, boxShadow: glow.boxShadow } as Record<string, unknown>}
                whileTap={{ cursor: "grabbing" }}
              >
                {/* LIKE stamp */}
                <motion.div className="absolute top-8 left-6 z-20 px-4 py-2 rounded-2xl font-black text-xl pointer-events-none"
                  style={{ opacity: likeOpacity, background: "rgba(0,220,100,0.15)", border: "3px solid #00DC64", color: "#00DC64", rotate: "-18deg", transformOrigin: "left center" }}>
                  {t.discover.likeStamp}
                </motion.div>
                {/* NOPE stamp */}
                <motion.div className="absolute top-8 right-6 z-20 px-4 py-2 rounded-2xl font-black text-xl pointer-events-none"
                  style={{ opacity: nopeOpacity, background: "rgba(255,70,85,0.15)", border: "3px solid #ff4655", color: "#ff4655", rotate: "18deg", transformOrigin: "right center" }}>
                  {t.discover.nopeStamp}
                </motion.div>

                {/* Avatar area */}
                <div className="relative overflow-hidden" style={{ height: 430 }}>
                  {currentProfile.avatar_url ? (
                    <img src={currentProfile.avatar_url} alt={currentProfile.display_name}
                      className="w-full h-full object-cover" />
                  ) : (() => {
                    const agentMain = currentProfile.agent_mains?.[0]
                    const agentPortrait = agentMain ? getAgentPortrait(agentMain) : null
                    return (
                      <div className="w-full h-full relative flex flex-col items-center justify-center gap-3"
                        style={{ background: `linear-gradient(160deg, ${rankColor}30 0%, ${rankColor}10 40%, #0a0a14 100%)` }}>
                        {/* Decorative glow blob */}
                        <div className="absolute inset-0 pointer-events-none"
                          style={{ background: `radial-gradient(ellipse at 50% 40%, ${rankColor}25, transparent 65%)` }} />
                        {/* Grid pattern */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none"
                          style={{ backgroundImage: `linear-gradient(${rankColor} 1px, transparent 1px), linear-gradient(90deg, ${rankColor} 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
                        {agentPortrait ? (
                          /* Agent portrait — transparent PNG on gradient BG */
                          <img
                            src={agentPortrait}
                            alt={agentMain ?? ""}
                            className="absolute bottom-0 left-0 right-0 w-full h-full"
                            style={{ objectFit: "contain", objectPosition: "bottom center", filter: `drop-shadow(0 0 40px ${rankColor}70)` }}
                          />
                        ) : (
                          /* Fallback: initial letter */
                          <>
                            <span className="relative text-[96px] font-black leading-none"
                              style={{ color: rankColor, textShadow: `0 0 60px ${rankColor}80, 0 0 120px ${rankColor}30` }}>
                              {currentProfile.display_name?.[0]?.toUpperCase() ?? "?"}
                            </span>
                            {currentProfile.rank && (
                              <div className="relative flex flex-col items-center gap-1">
                                <RankIcon rank={currentProfile.rank} tier={currentProfile.rank_tier ?? "iron"} size={56} />
                                <span className="text-xs font-bold px-3 py-1 rounded-full"
                                  style={{ background: `${rankColor}25`, color: rankColor, border: `1px solid ${rankColor}40` }}>
                                  {currentProfile.rank}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })()}

                  {/* Bottom gradient */}
                  <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
                    style={{ background: "linear-gradient(to top, var(--card) 0%, transparent 100%)" }} />

                  {/* Online indicator */}
                  {isOnline(currentProfile) && (
                    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#22c55e" }} />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: "#22c55e" }} />
                      </span>
                      <span className="text-xs font-semibold" style={{ color: "#22c55e", textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>{t.discover.online}</span>
                    </div>
                  )}

                  {/* Rank badge top-left (only when avatar present) */}
                  {currentProfile.avatar_url && currentProfile.rank && (
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl backdrop-blur-md"
                      style={{ background: "rgba(0,0,0,0.55)", border: `1px solid ${rankColor}50` }}>
                      <RankIcon rank={currentProfile.rank} tier={currentProfile.rank_tier ?? "iron"} size={16} />
                      <span className="text-xs font-bold" style={{ color: rankColor }}>{currentProfile.rank}</span>
                    </div>
                  )}

                  {/* Agent badges top-right */}
                  {currentProfile.agent_mains && currentProfile.agent_mains.length > 0 && (
                    <div className="absolute top-4 right-4 flex flex-col gap-1.5">
                      {currentProfile.agent_mains.slice(0, 3).map((agent) => (
                        <span key={agent} className="px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-sm flex items-center gap-1"
                          style={{ background: "rgba(0,0,0,0.65)", color: "#ccc", border: "1px solid rgba(255,255,255,0.12)" }}>
                          <Swords size={10} style={{ color: rankColor }} />{agent}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info section */}
                <div className="px-5 pt-2 pb-4 flex flex-col gap-2.5">
                  {/* Name + ID row */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black leading-tight truncate">{currentProfile.display_name}</h2>
                      {currentProfile.region && (
                        <span className="text-xs px-2 py-0.5 rounded-md font-bold uppercase shrink-0"
                          style={{ background: "rgba(255,255,255,0.06)", color: "#666", border: "1px solid var(--border)" }}>
                          {currentProfile.region}
                        </span>
                      )}
                    </div>
                    {currentProfile.riot_name && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: "#555" }}>
                        {currentProfile.riot_name}#{currentProfile.riot_tag}
                      </p>
                    )}
                    {currentProfile.discord_tag && (
                      <p className="text-xs mt-0.5 flex items-center gap-1 truncate" style={{ color: "#7289da" }}>
                        <Image src="/discord-icon.svg" alt="Discord" width={11} height={11} style={{ opacity: 0.85 }} />
                        {currentProfile.discord_tag}
                      </p>
                    )}
                    {/* Social links */}
                    {(currentProfile.instagram_url || currentProfile.reddit_url || currentProfile.github_url) && (
                      <div className="flex gap-1.5 flex-wrap mt-1">
                        {currentProfile.instagram_url && (
                          <a href={currentProfile.instagram_url.startsWith("http") ? currentProfile.instagram_url : `https://${currentProfile.instagram_url}`}
                            target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold"
                            style={{ background: "rgba(225,48,108,0.12)", color: "#E1306C", border: "1px solid rgba(225,48,108,0.25)" }}>
                            📷 IG
                          </a>
                        )}
                        {currentProfile.reddit_url && (
                          <a href={currentProfile.reddit_url.startsWith("http") ? currentProfile.reddit_url : `https://${currentProfile.reddit_url}`}
                            target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold"
                            style={{ background: "rgba(255,69,0,0.12)", color: "#FF4500", border: "1px solid rgba(255,69,0,0.25)" }}>
                            🔴 Reddit
                          </a>
                        )}
                        {currentProfile.github_url && (
                          <a href={currentProfile.github_url.startsWith("http") ? currentProfile.github_url : `https://${currentProfile.github_url}`}
                            target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold"
                            style={{ background: "rgba(255,255,255,0.06)", color: "#bbb", border: "1px solid rgba(255,255,255,0.12)" }}>
                            🐙 GitHub
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                    {/* Compatibility score */}
                    {compatScore !== null && (
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1a1a2e" }}>
                          <div className="h-full rounded-full" style={{
                            width: `${compatScore}%`,
                            background: compatScore >= 70 ? '#22c55e' : compatScore >= 45 ? '#eab308' : '#f97316',
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                        <span className="text-xs font-bold shrink-0" style={{
                          color: compatScore >= 70 ? '#22c55e' : compatScore >= 45 ? '#eab308' : '#f97316',
                        }}>
                          {compatScore}% Match
                        </span>
                      </div>
                    )}
                  {/* Tags row: playstyle + languages */}
                  {((currentProfile as ProfileWithStats & { playstyle?: string; languages?: string[] }).playstyle || (currentProfile as ProfileWithStats & { playstyle?: string; languages?: string[] }).languages?.length) && (
                    <div className="flex flex-wrap gap-1.5">
                      {(currentProfile as ProfileWithStats & { playstyle?: string }).playstyle && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                          style={{ background: "rgba(255,70,85,0.15)", color: "var(--accent)", border: "1px solid rgba(255,70,85,0.3)" }}>
                          {(currentProfile as ProfileWithStats & { playstyle?: string }).playstyle}
                        </span>
                      )}
                      {(currentProfile as ProfileWithStats & { languages?: string[] }).languages?.slice(0, 3).map((lang: string) => (
                        <span key={lang} className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                          style={{ background: "rgba(88,101,242,0.15)", color: "#8891f1", border: "1px solid rgba(88,101,242,0.3)" }}>
                          <Globe size={10} />{lang}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bio */}
                  {currentProfile.bio && (
                    <p className="text-sm leading-snug line-clamp-2" style={{ color: "#777" }}>
                      {currentProfile.bio}
                    </p>
                  )}

                  {/* Stats — always visible */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "K/D", value: currentProfile.stats?.kd_ratio != null ? currentProfile.stats.kd_ratio.toFixed(2) : null, good: Number(currentProfile.stats?.kd_ratio) >= 1 },
                      { label: "HS%", value: currentProfile.stats?.headshot_rate != null ? `${currentProfile.stats.headshot_rate.toFixed(1)}%` : null, good: Number(currentProfile.stats?.headshot_rate) >= 20 },
                      { label: "Wins", value: currentProfile.stats?.wins != null ? String(currentProfile.stats.wins) : null, good: false },
                    ].map((s) => (
                      <div key={s.label} className="text-center py-2.5 rounded-xl"
                        style={{ background: "#0a0a12", border: `1px solid ${s.good ? rankColor + "30" : "var(--border)"}` }}>
                        <p className="text-[10px] mb-0.5" style={{ color: "#555" }}>{s.label}</p>
                        {s.value !== null ? (
                          <p className="text-sm font-black" style={{ color: s.good ? rankColor : "var(--foreground)" }}>{s.value}</p>
                        ) : currentProfile.riot_name ? (
                          <div className="h-3.5 w-8 mx-auto rounded animate-pulse mt-0.5" style={{ background: "#1e1e2e" }} />
                        ) : (
                          <p className="text-sm font-black" style={{ color: "#444" }}>--</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Loading hint when stats are being fetched */}
                  {!currentProfile.stats && currentProfile.riot_name && (
                    <p className="text-[10px] text-center" style={{ color: "#444" }}>Stats werden geladen…</p>
                  )}
                  {/* Agent mains under stats if present */}
                  {!currentProfile.stats && currentProfile.agent_mains && currentProfile.agent_mains.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {currentProfile.agent_mains.map((a) => (
                        <span key={a} className="px-3 py-1.5 rounded-xl text-xs font-bold"
                          style={{ background: `${rankColor}15`, color: rankColor, border: `1px solid ${rankColor}30` }}>
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex items-center gap-8 mt-8 relative z-20">
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.88 }}
                onClick={() => triggerSwipe("left")}
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
                style={{ background: "#0d0d14", border: "2px solid #ff4655" }}>
                <X size={32} style={{ color: "#ff4655" }} />
              </motion.button>

              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.88 }}
                onClick={() => triggerSwipe("right")}
                className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl pulse-glow"
                style={{ background: "linear-gradient(135deg, #ff4655, #e03545)" }}>
                <Heart size={38} fill="white" style={{ color: "#fff" }} />
              </motion.button>

              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.88 }}
                onClick={fetchProfiles}
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
                style={{ background: "#0d0d14", border: "2px solid var(--border)", color: "#555" }}
                title="Neue Profile laden">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </motion.button>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5 mt-5">
              {profiles.slice(currentIndex, currentIndex + 5).map((_, i) => (
                <div key={i} className="rounded-full transition-all"
                  style={{ width: i === 0 ? 20 : 6, height: 6, background: i === 0 ? "var(--accent)" : "var(--border)" }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {matchedProfile && (
          <MatchModal profile={matchedProfile} myProfile={myProfile} onClose={() => setMatchedProfile(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
