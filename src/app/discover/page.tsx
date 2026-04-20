"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { getRankColor, RANKS } from "@/lib/ranks"
import RankIcon from "@/components/RankIcon"
import type { Profile, ValorantStats } from "@/types/database"
import { Heart, X, MessageSquare, Settings, Globe, Swords } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import MatchModal from "@/components/MatchModal"
import RankFilterPanel from "@/components/RankFilterPanel"

type ProfileWithStats = Profile & { stats?: ValorantStats | null }

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [matchedProfile, setMatchedProfile] = useState<ProfileWithStats | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [rankFilter, setRankFilter] = useState<{ min: string; max: string }>({ min: "iron", max: "radiant" })
  const [myProfile, setMyProfile] = useState<Profile | null>(null)
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null)
  const swipingRef = useRef(false)

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

    const { data: swipes } = await supabase.from("swipes").select("to_user_id").eq("from_user_id", user.id)
    const swipedIds = swipes?.map((s) => s.to_user_id) ?? []

    let query = supabase
      .from("profiles")
      .select("*, valorant_stats(*)")
      .neq("id", user.id)
      .not("riot_name", "is", null)

    if (swipedIds.length > 0) {
      query = query.not("id", "in", `(${swipedIds.join(",")})`)
    }

    const minIdx = RANKS.findIndex((r) => r.tier === rankFilter.min)
    const maxIdx = RANKS.findIndex((r) => r.tier === rankFilter.max)
    const allowedTiers = RANKS.slice(Math.max(0, minIdx), Math.min(RANKS.length, maxIdx + 1)).map((r) => r.tier)
    if (allowedTiers.length < RANKS.length) query = query.in("rank_tier", allowedTiers)

    const { data } = await query.limit(20)
    setProfiles(
      (data ?? []).map((p: Record<string, unknown>) => ({
        ...(p as Profile),
        stats: Array.isArray(p.valorant_stats) ? (p.valorant_stats[0] as ValorantStats ?? null) : null,
      }))
    )
    setCurrentIndex(0)
    setSwipeDir(null)
    swipingRef.current = false
    setLoading(false)
  }, [rankFilter])

  useEffect(() => { fetchProfiles() }, [fetchProfiles])

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

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3.5 border-b glass sticky top-0 z-50"
        style={{ borderColor: "var(--border)" }}>
        <Link href="/" className="font-black tracking-tighter text-xl shimmer-text">VALOPICKR</Link>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className="p-2.5 rounded-xl transition-colors"
            style={{ background: showFilters ? "rgba(255,70,85,0.15)" : "var(--card)", border: `1px solid ${showFilters ? "rgba(255,70,85,0.5)" : "var(--border)"}`, color: showFilters ? "var(--accent)" : "var(--foreground)" }}>
            <Settings size={18} />
          </button>
          <Link href="/matches" className="p-2.5 rounded-xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <MessageSquare size={18} />
          </Link>
          <Link href="/profile"
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black overflow-hidden"
            style={{ background: myProfile?.avatar_url ? "transparent" : "var(--accent)", color: "#fff" }}>
            {myProfile?.avatar_url
              ? <img src={myProfile.avatar_url} alt="" className="w-full h-full object-cover" />
              : (myProfile?.display_name?.[0]?.toUpperCase() ?? "?")}
          </Link>
        </div>
      </header>

      <AnimatePresence>
        {showFilters && (
          <RankFilterPanel value={rankFilter}
            onChange={(f) => { setRankFilter(f); setShowFilters(false) }}
            onClose={() => setShowFilters(false)} />
        )}
      </AnimatePresence>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)" }} />
            <p className="text-sm" style={{ color: "#555" }}>Lade Profile...</p>
          </div>
        ) : !currentProfile ? (
          <div className="text-center">
            <p className="text-2xl font-black mb-2">Keine Profile mehr</p>
            <p className="text-sm mb-6" style={{ color: "#888" }}>Passe deine Filter an oder komm später wieder.</p>
            <button onClick={fetchProfiles} className="btn-primary px-6 py-3 text-sm">Erneut laden</button>
          </div>
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
                style={{ x, rotate, scale: cardScale, width: 420, height: 700, zIndex: 10, background: "var(--card)", border: `1px solid ${rankColor}40`, boxShadow: `0 20px 60px ${rankColor}15` } as Record<string, unknown>}
                whileTap={{ cursor: "grabbing" }}
              >
                {/* LIKE stamp */}
                <motion.div className="absolute top-8 left-6 z-20 px-4 py-2 rounded-2xl font-black text-xl pointer-events-none"
                  style={{ opacity: likeOpacity, background: "rgba(0,220,100,0.15)", border: "3px solid #00DC64", color: "#00DC64", rotate: "-18deg", transformOrigin: "left center" }}>
                  MATCH ❤️
                </motion.div>
                {/* NOPE stamp */}
                <motion.div className="absolute top-8 right-6 z-20 px-4 py-2 rounded-2xl font-black text-xl pointer-events-none"
                  style={{ opacity: nopeOpacity, background: "rgba(255,70,85,0.15)", border: "3px solid #ff4655", color: "#ff4655", rotate: "18deg", transformOrigin: "right center" }}>
                  NOPE 👎
                </motion.div>

                {/* Avatar area */}
                <div className="relative overflow-hidden" style={{ height: 430 }}>
                  {currentProfile.avatar_url ? (
                    <img src={currentProfile.avatar_url} alt={currentProfile.display_name}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full relative flex flex-col items-center justify-center gap-3"
                      style={{ background: `linear-gradient(160deg, ${rankColor}30 0%, ${rankColor}10 40%, #0a0a14 100%)` }}>
                      {/* Decorative glow blob */}
                      <div className="absolute inset-0 pointer-events-none"
                        style={{ background: `radial-gradient(ellipse at 50% 40%, ${rankColor}25, transparent 65%)` }} />
                      {/* Grid pattern */}
                      <div className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{ backgroundImage: `linear-gradient(${rankColor} 1px, transparent 1px), linear-gradient(90deg, ${rankColor} 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
                      {/* Initial */}
                      <span className="relative text-[96px] font-black leading-none"
                        style={{ color: rankColor, textShadow: `0 0 60px ${rankColor}80, 0 0 120px ${rankColor}30` }}>
                        {currentProfile.display_name?.[0]?.toUpperCase() ?? "?"}
                      </span>
                      {/* Rank icon */}
                      {currentProfile.rank && (
                        <div className="relative flex flex-col items-center gap-1">
                          <RankIcon rank={currentProfile.rank} tier={currentProfile.rank_tier ?? "iron"} size={56} />
                          <span className="text-xs font-bold px-3 py-1 rounded-full"
                            style={{ background: `${rankColor}25`, color: rankColor, border: `1px solid ${rankColor}40` }}>
                            {currentProfile.rank}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bottom gradient */}
                  <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
                    style={{ background: "linear-gradient(to top, var(--card) 0%, transparent 100%)" }} />

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
                  </div>

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
                      { label: "K/D", value: currentProfile.stats?.kd_ratio != null ? currentProfile.stats.kd_ratio.toFixed(2) : "--", good: Number(currentProfile.stats?.kd_ratio) >= 1 },
                      { label: "HS%", value: currentProfile.stats?.headshot_rate != null ? `${currentProfile.stats.headshot_rate.toFixed(1)}%` : "--", good: Number(currentProfile.stats?.headshot_rate) >= 20 },
                      { label: "Wins", value: currentProfile.stats?.wins != null ? currentProfile.stats.wins : "--", good: false },
                    ].map((s) => (
                      <div key={s.label} className="text-center py-2.5 rounded-xl"
                        style={{ background: "#0a0a12", border: `1px solid ${s.good ? rankColor + "30" : "var(--border)"}` }}>
                        <p className="text-[10px] mb-0.5" style={{ color: "#555" }}>{s.label}</p>
                        <p className="text-sm font-black" style={{ color: s.good ? rankColor : s.value === "--" ? "#444" : "var(--foreground)" }}>{s.value}</p>
                      </div>
                    ))}
                  </div>
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
          <MatchModal profile={matchedProfile} onClose={() => setMatchedProfile(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
