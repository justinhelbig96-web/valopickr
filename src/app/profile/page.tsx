"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Profile, ValorantStats } from "@/types/database"
import { getRankColor, REGIONS } from "@/lib/ranks"
import RankIcon from "@/components/RankIcon"
import {
  Loader2, RefreshCw, LogOut, Save, Shield, MessageSquare,
  Activity, User, ChevronRight, Check, Camera
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"

const PLAYSTYLES = [
  { value: "casual", label: "Casual", emoji: "😎" },
  { value: "competitive", label: "Competitive", emoji: "🏆" },
  { value: "chill", label: "Chill", emoji: "☁️" },
  { value: "sweat", label: "Sweat", emoji: "😤" },
  { value: "igl", label: "IGL", emoji: "🎯" },
  { value: "entry", label: "Entry Fragger", emoji: "⚡" },
]

const LANGUAGES = [
  "Deutsch", "English", "Français", "Español", "Türkçe",
  "Русский", "Polski", "Português", "Italiano", "العربية",
]

const AGENTS = [
  // Duelists
  "Jett", "Reyna", "Phoenix", "Raze", "Yoru", "Neon", "Iso",
  // Initiators
  "Sova", "Breach", "Skye", "KAY/O", "Fade", "Gekko",
  // Controllers
  "Brimstone", "Viper", "Omen", "Astra", "Harbor", "Clove",
  // Sentinels
  "Killjoy", "Cypher", "Sage", "Chamber", "Deadlock", "Vyse",
]

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<ValorantStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<"edit" | "valorant">("edit")
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useLanguage()

  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [discordTag, setDiscordTag] = useState("")
  const [instagramUrl, setInstagramUrl] = useState("")
  const [redditUrl, setRedditUrl] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [playstyle, setPlaystyle] = useState<string>("")
  const [languages, setLanguages] = useState<string[]>([])
  const [agentMains, setAgentMains] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      const { data: s } = await supabase
        .from("valorant_stats")
        .select("*")
        .eq("user_id", user.id)
        .single()

      setProfile(p)
      setStats(s)
      setDisplayName(p?.display_name ?? "")
      setBio(p?.bio ?? "")
      setDiscordTag(p?.discord_tag ?? "")
      setInstagramUrl(p?.instagram_url ?? "")
      setRedditUrl(p?.reddit_url ?? "")
      setGithubUrl(p?.github_url ?? "")
      setPlaystyle(p?.playstyle ?? "")
      setLanguages(p?.languages ?? [])
      setAgentMains(p?.agent_mains ?? [])
      setLoading(false)

      // Auto-Sync: wenn riot_name vorhanden und letzte Sync > 1h her (oder nie)
      if (p?.riot_name && p?.riot_tag) {
        const lastSync = p.last_synced_at ? new Date(p.last_synced_at).getTime() : 0
        const oneHourAgo = Date.now() - 60 * 60 * 1000
        if (lastSync < oneHourAgo) {
          syncStats(p)
        }
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploadingAvatar(true)
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const path = `${profile.id}/avatar.${ext}`
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
    if (!upErr) {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path)
      const url = `${publicUrl}?t=${Date.now()}`
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", profile.id)
      setProfile((p) => p ? { ...p, avatar_url: url } : p)
    }
    setUploadingAvatar(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from("profiles").update({
      display_name: displayName,
      bio,
      discord_tag: discordTag,
      instagram_url: instagramUrl.trim() || null,
      reddit_url: redditUrl.trim() || null,
      github_url: githubUrl.trim() || null,
      playstyle: playstyle || null,
      languages: languages.length > 0 ? languages : null,
      agent_mains: agentMains.length > 0 ? agentMains : null,
      updated_at: new Date().toISOString(),
    }).eq("id", profile.id)
    setSaved(true)
    setProfile((p) => p ? { ...p, display_name: displayName, bio, discord_tag: discordTag, instagram_url: instagramUrl.trim() || null, reddit_url: redditUrl.trim() || null, github_url: githubUrl.trim() || null, playstyle, languages, agent_mains: agentMains } : p)
    setTimeout(() => setSaved(false), 2500)
    setSaving(false)
  }

  async function syncStats(p: typeof profile) {
    if (!p?.riot_name || !p?.riot_tag) return
    setSyncing(true)
    const supabase = createClient()
    const res = await fetch(
      `/api/valorant/player?name=${encodeURIComponent(p.riot_name)}&tag=${encodeURIComponent(p.riot_tag)}&region=${p.region ?? "eu"}`
    )
    const data = await res.json()
    if (res.ok) {
      await supabase.from("profiles").update({
        rank: data.rank,
        rank_tier: data.rankTier,
        peak_rank: data.peakRank,
        last_synced_at: new Date().toISOString(),
      }).eq("id", p.id)

      if (data.stats) {
        const mapped = {
          user_id: p.id,
          wins: data.stats.wins,
          losses: data.stats.losses,
          kd_ratio: data.stats.kd,
          headshot_rate: data.stats.headshotRate,
          avg_score: data.stats.avgScore,
          matches_played: data.stats.matchesPlayed,
          updated_at: new Date().toISOString(),
        }
        await supabase.from("valorant_stats").upsert(mapped)
        setStats((prev) => prev ? { ...prev, ...mapped } : (mapped as unknown as ValorantStats))
      }
      setProfile((prev) => prev ? { ...prev, rank: data.rank, rank_tier: data.rankTier } : prev)
    }
    setSyncing(false)
  }

  async function handleSyncStats() {
    await syncStats(profile)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin" style={{ color: "var(--accent)" }} size={28} />
    </div>
  )

  const rankColor = getRankColor(profile?.rank_tier ?? "iron")

  return (
    <div className="min-h-screen grid-bg">
      {/* Glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${rankColor}, transparent)`, filter: "blur(60px)" }} />
      </div>

      {/* Nav */}
      <nav className="glass sticky top-0 z-50 px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/discover" className="font-black tracking-tighter text-xl shimmer-text">VALOPICKR</Link>
          <div className="flex items-center gap-2">
            {profile?.is_admin && (
              <Link href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: "rgba(255,70,85,0.15)", color: "var(--accent)", border: "1px solid rgba(255,70,85,0.3)" }}>
                <Shield size={12} /> Admin
              </Link>
            )}
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
              style={{ border: "1px solid var(--border)", color: "#666" }}>
              <LogOut size={13} /> {t.profile.logout}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 pb-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mt-8 mb-6 p-6 rounded-3xl relative overflow-hidden"
          style={{ background: "var(--card)", border: `1px solid ${rankColor}25` }}>
          {/* Rank glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at top, ${rankColor}08, transparent 70%)` }} />

          <div className="relative flex items-end gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <button onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 rounded-2xl overflow-hidden group"
                style={{ background: `${rankColor}20`, boxShadow: `0 0 30px ${rankColor}30` }}
                title={t.profile.changePhoto}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-4xl font-black"
                    style={{ color: rankColor }}>
                    {displayName[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(0,0,0,0.6)" }}>
                  {uploadingAvatar
                    ? <Loader2 size={20} className="animate-spin text-white" />
                    : <Camera size={20} color="white" />}
                </div>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              {profile?.is_admin && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "var(--accent)" }}>
                  <Shield size={12} color="#fff" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black truncate">{displayName || t.profile.noName}</h1>
              {profile?.riot_name && (
                <p className="text-sm mt-0.5 truncate" style={{ color: "#666" }}>
                  {profile.riot_name}#{profile.riot_tag}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {profile?.rank && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: `${rankColor}18`, color: rankColor, border: `1px solid ${rankColor}35` }}>
                    <RankIcon rank={profile.rank} tier={profile.rank_tier ?? "iron"} size={16} />
                    {profile.rank}
                  </span>
                )}
                {profile?.region && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold uppercase"
                    style={{ background: "rgba(255,255,255,0.04)", color: "#888", border: "1px solid var(--border)" }}>
                    {profile.region}
                  </span>
                )}
                {profile?.discord_tag && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                    style={{ background: "rgba(88,101,242,0.15)", color: "#8891f1", border: "1px solid rgba(88,101,242,0.3)" }}>
                    <MessageSquare size={11} /> {profile.discord_tag}
                  </span>
                )}
                {profile?.instagram_url && (
                  <a href={profile.instagram_url.startsWith("http") ? profile.instagram_url : `https://${profile.instagram_url}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: "rgba(225,48,108,0.12)", color: "#E1306C", border: "1px solid rgba(225,48,108,0.3)" }}>
                    IG
                  </a>
                )}
                {profile?.reddit_url && (
                  <a href={profile.reddit_url.startsWith("http") ? profile.reddit_url : `https://${profile.reddit_url}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: "rgba(255,69,0,0.12)", color: "#FF4500", border: "1px solid rgba(255,69,0,0.3)" }}>
                    r/ Reddit
                  </a>
                )}
                {profile?.github_url && (
                  <a href={profile.github_url.startsWith("http") ? profile.github_url : `https://${profile.github_url}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: "rgba(255,255,255,0.07)", color: "#ddd", border: "1px solid rgba(255,255,255,0.15)" }}>
                    GH GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Nav */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/discover"
            className="flex items-center justify-between px-5 py-3.5 rounded-2xl card-hover"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <span className="text-sm font-semibold">Discover</span>
            <ChevronRight size={16} style={{ color: "#555" }} />
          </Link>
          <Link href="/matches"
            className="flex items-center justify-between px-5 py-3.5 rounded-2xl card-hover"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <span className="text-sm font-semibold">Matches</span>
            <ChevronRight size={16} style={{ color: "#555" }} />
          </Link>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div className="flex gap-1 p-1 rounded-2xl mb-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            {[
              { key: "edit" as const, icon: User, label: t.profile.tabEdit },
              { key: "valorant" as const, icon: Activity, label: t.profile.tabValorant },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={activeTab === tab.key
                  ? { background: "var(--accent)", color: "#fff", boxShadow: "0 4px 15px rgba(255,70,85,0.3)" }
                  : { color: "#666" }}>
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "edit" && (
            <motion.div key="edit" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#555" }}>{t.profile.labelDisplayName}</label>
                  <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    className="px-4 py-3 rounded-xl text-sm" placeholder={t.profile.placeholderDisplayName}
                    style={{ background: "#0d0d14", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#555" }}>{t.profile.labelBio}</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                    placeholder={t.profile.placeholderBio}
                    className="px-4 py-3 rounded-xl text-sm resize-none"
                    style={{ background: "#0d0d14", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#555" }}>{t.profile.labelDiscord}</label>
                  <input value={discordTag} onChange={(e) => setDiscordTag(e.target.value)}
                    placeholder="username#1234 oder @username"
                    className="px-4 py-3 rounded-xl text-sm"
                    style={{ background: "#0d0d14", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                </div>

                {/* Social Links */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#555" }}>
                    {t.profile.labelSocialLinks} <span style={{ color: "#444", fontWeight: 400, textTransform: "none" as const }}>{t.profile.labelSocialLinksOptional}</span>
                  </label>
                  <div className="flex flex-col gap-2">
                    {([
                      { key: "ig", prefix: "IG", color: "#E1306C", placeholder: "instagram.com/username", value: instagramUrl, set: setInstagramUrl },
                      { key: "rd", prefix: "r/", color: "#FF4500", placeholder: "reddit.com/u/username", value: redditUrl, set: setRedditUrl },
                      { key: "gh", prefix: "GH", color: "#bbb", placeholder: "github.com/username", value: githubUrl, set: setGithubUrl },
                    ] as const).map(({ key, prefix, color, placeholder, value, set }) => (
                      <div key={key} className="relative flex items-center">
                        <span className="absolute left-3 text-[11px] font-black pointer-events-none select-none" style={{ color }}>{prefix}</span>
                        <input
                          value={value}
                          onChange={(e) => set(e.target.value)}
                          placeholder={placeholder}
                          className="w-full pl-9 pr-4 py-3 rounded-xl text-sm"
                          style={{ background: "#0d0d14", border: "1px solid var(--border)", color: "var(--foreground)" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Playstyle */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#555" }}>{t.profile.labelPlaystyle}</label>
                  <div className="flex flex-wrap gap-2">
                    {PLAYSTYLES.map((p) => (
                      <button key={p.value} type="button"
                        onClick={() => setPlaystyle(playstyle === p.value ? "" : p.value)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                        style={playstyle === p.value
                          ? { background: "var(--accent)", color: "#fff", border: "1px solid var(--accent)" }
                          : { background: "#0d0d14", color: "#888", border: "1px solid var(--border)" }}>
                        {p.emoji} {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#555" }}>{t.profile.labelLanguages}</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => {
                      const active = languages.includes(lang)
                      return (
                        <button key={lang} type="button"
                          onClick={() => setLanguages(active
                            ? languages.filter((l) => l !== lang)
                            : [...languages, lang]
                          )}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                          style={active
                            ? { background: "rgba(88,101,242,0.25)", color: "#8891f1", border: "1px solid rgba(88,101,242,0.5)" }
                            : { background: "#0d0d14", color: "#888", border: "1px solid var(--border)" }}>
                          {lang}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Agent Mains */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#555" }}>
                    {t.profile.labelAgentMains} <span style={{ color: "#444", fontWeight: 400 }}>{t.profile.agentMaxHint}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AGENTS.map((agent) => {
                      const active = agentMains.includes(agent)
                      return (
                        <button key={agent} type="button"
                          onClick={() => {
                            if (active) setAgentMains(agentMains.filter((a) => a !== agent))
                            else if (agentMains.length < 3) setAgentMains([...agentMains, agent])
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                          style={active
                            ? { background: "rgba(255,70,85,0.2)", color: "var(--accent)", border: "1px solid rgba(255,70,85,0.4)" }
                            : { background: "#0d0d14", color: agentMains.length >= 3 ? "#444" : "#888", border: "1px solid var(--border)", opacity: agentMains.length >= 3 && !active ? 0.5 : 1 }}>
                          {agent}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all btn-primary"
                  style={saved ? { background: "#00C060", boxShadow: "0 4px 15px rgba(0,192,96,0.4)" } : {}}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
                  {saved ? t.profile.saved : saving ? t.profile.saving : t.profile.saveChanges}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "valorant" && (
            <motion.div key="valorant" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold">{t.profile.valorantAccount}</h3>
                {profile?.riot_name && (
                  <button onClick={handleSyncStats} disabled={syncing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: "#0d0d14", border: "1px solid var(--border)", color: "#888" }}>
                    <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
                    {syncing ? t.profile.syncing : t.profile.syncStats}
                  </button>
                )}
              </div>

              {profile?.riot_name ? (
                <div>
                  <div className="flex items-center gap-3 mb-5 p-3 rounded-xl" style={{ background: "#0d0d14" }}>
                    {profile.rank && <RankIcon rank={profile.rank} tier={profile.rank_tier ?? "iron"} size={36} />}
                    <div>
                      <p className="font-bold">{profile.riot_name}<span style={{ color: "#555" }}>#{profile.riot_tag}</span></p>
                      <p className="text-xs mt-0.5" style={{ color: "#555" }}>
                        {REGIONS.find((r) => r.value === profile.region)?.label ?? profile.region}
                        {profile.last_synced_at && ` · ${new Date(profile.last_synced_at).toLocaleDateString("de")}`}
                      </p>
                    </div>
                  </div>

                  {stats ? (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "K/D Ratio", value: stats.kd_ratio?.toFixed(2), highlight: Number(stats.kd_ratio) >= 1 },
                        { label: "Headshot%", value: `${stats.headshot_rate?.toFixed(1)}%`, highlight: Number(stats.headshot_rate) >= 20 },
                        { label: "Ø Score", value: stats.avg_score, highlight: false },
                        { label: "Wins", value: stats.wins, highlight: false },
                        { label: "Losses", value: stats.losses, highlight: false },
                        { label: "Matches", value: stats.matches_played, highlight: false },
                      ].map((s) => (
                        <div key={s.label} className="text-center p-3.5 rounded-xl"
                          style={{ background: "#0d0d14", border: "1px solid var(--border)" }}>
                          <p className="text-xs mb-1.5" style={{ color: "#555" }}>{s.label}</p>
                          <p className="font-black text-lg" style={{ color: s.highlight ? rankColor : "var(--foreground)" }}>{s.value ?? "—"}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-center py-6" style={{ color: "#555" }}>
                      {t.profile.noStats}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity size={40} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm mb-5" style={{ color: "#888" }}>{t.profile.noAccount}</p>
                  <Link href="/onboarding" className="btn-primary px-6 py-3 text-sm inline-block">
                    {t.profile.linkAccount}
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
