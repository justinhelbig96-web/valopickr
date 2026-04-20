"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, CheckCircle, AlertCircle, Shield, Zap, Users, ChevronRight, ChevronLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { REGIONS } from "@/lib/ranks"
import RankIcon from "@/components/RankIcon"

type TutorialStep = "welcome" | "link" | "linking" | "success"

const TUTORIAL_STEPS = [
  { icon: Shield, label: "Account verknüpfen", color: "#ff4655" },
  { icon: Zap, label: "Filter einstellen", color: "#FFD700" },
  { icon: Users, label: "Swipen & Matchen", color: "#00FF7F" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<TutorialStep>("welcome")
  const [riotName, setRiotName] = useState("")
  const [riotTag, setRiotTag] = useState("")
  const [region, setRegion] = useState("eu")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchedRank, setFetchedRank] = useState<string | null>(null)
  const [rankColor, setRankColor] = useState("#ff4655")

  async function handleLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setStep("linking")

    try {
      const res = await fetch(
        `/api/valorant/player?name=${encodeURIComponent(riotName)}&tag=${encodeURIComponent(riotTag)}&region=${region}`
      )
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Spieler nicht gefunden. Prüfe Name und Tag.")
        setStep("link")
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError("Nicht eingeloggt."); setStep("link"); setLoading(false); return }

      await supabase.from("profiles").update({
        riot_name: riotName, riot_tag: riotTag, region,
        rank: data.rank, rank_tier: data.rankTier, peak_rank: data.peakRank,
        last_synced_at: new Date().toISOString(),
      }).eq("id", user.id)

      if (data.stats) {
        await supabase.from("valorant_stats").upsert({
          user_id: user.id, ...data.stats, updated_at: new Date().toISOString(),
        })
      }

      const RANK_COLORS: Record<string, string> = {
        iron: "#8B7355", bronze: "#CD7F32", silver: "#C0C0C0", gold: "#FFD700",
        platinum: "#00CED1", diamond: "#B9F2FF", ascendant: "#00FF7F",
        immortal: "#FF4655", radiant: "#FFFB8F",
      }
      setRankColor(RANK_COLORS[data.rankTier?.toLowerCase()] ?? "#ff4655")
      setFetchedRank(data.rank)
      setStep("success")
    } catch {
      setError("Verbindungsfehler. Bitte erneut versuchen.")
      setStep("link")
    }
    setLoading(false)
  }

  const variants = {
    hidden: { opacity: 0, x: 40 },
    show: { opacity: 1, x: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, x: -40, transition: { duration: 0.25 } },
  }

  return (
    <main className="flex items-center justify-center min-h-screen px-4 grid-bg">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{ background: "radial-gradient(circle, rgba(255,70,85,0.04) 0%, transparent 60%)" }} />
      </div>

      <div className="w-full max-w-lg z-10">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {TUTORIAL_STEPS.map((s, i) => {
            const active = (step === "welcome" && i === 0) || (step === "link" && i === 0) || (step === "linking" && i === 0) || (step === "success" && i === 0)
            const done = step === "success" && i === 0
            return (
              <div key={s.label} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={done ? { background: s.color, color: "#000" } : active ? { background: `${s.color}20`, border: `1px solid ${s.color}`, color: s.color } : { background: "var(--card)", border: "1px solid var(--border)", color: "#444" }}>
                    {done ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <span className="text-xs hidden sm:block" style={{ color: active || done ? "var(--foreground)" : "#444" }}>{s.label}</span>
                </div>
                {i < TUTORIAL_STEPS.length - 1 && (
                  <div className="w-8 h-px" style={{ background: done ? s.color : "var(--border)" }} />
                )}
              </div>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* Welcome Step */}
          {step === "welcome" && (
            <motion.div key="welcome" variants={variants} initial="hidden" animate="show" exit="exit"
              className="p-8 rounded-2xl text-center"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(255,70,85,0.1)", border: "1px solid rgba(255,70,85,0.2)" }}>
                <span className="text-4xl">🎮</span>
              </div>
              <h1 className="text-3xl font-black mb-3">Willkommen bei ValoPickr!</h1>
              <p className="mb-8 leading-relaxed" style={{ color: "var(--muted)" }}>
                Verknüpfe deinen Valorant-Account damit andere Spieler deine Stats sehen können — und du die ihrer potenziellen Duos.
              </p>

              <div className="flex flex-col gap-3 mb-6">
                {TUTORIAL_STEPS.map((s, i) => (
                  <div key={s.label} className="flex items-center gap-4 p-3 rounded-xl text-left"
                    style={{ background: "#0a0a12", border: "1px solid var(--border)" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                      <s.icon size={18} style={{ color: s.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{i + 1}. {s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => setStep("link")} className="btn-primary w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold">
                Los geht&apos;s <ChevronRight size={18} />
              </button>
              <button onClick={() => router.push("/discover")} className="mt-3 text-sm w-full py-2" style={{ color: "#444" }}>
                Überspringen
              </button>
            </motion.div>
          )}

          {/* Link Step */}
          {step === "link" && (
            <motion.div key="link" variants={variants} initial="hidden" animate="show" exit="exit"
              className="p-8 rounded-2xl"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <button onClick={() => setStep("welcome")} className="flex items-center gap-1 text-sm mb-6" style={{ color: "#555" }}>
                <ChevronLeft size={16} /> Zurück
              </button>

              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "rgba(255,70,85,0.1)", border: "1px solid rgba(255,70,85,0.2)" }}>
                <Shield size={26} style={{ color: "var(--accent)" }} />
              </div>
              <h2 className="text-2xl font-black mb-2">Riot Account verknüpfen</h2>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--muted)" }}>
                Gib deinen Riot-Namen und Tag ein. Wir laden deine Rank- und Match-Daten automatisch.
              </p>

              <form onSubmit={handleLink} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Region</label>
                  <select value={region} onChange={e => setRegion(e.target.value)}
                    className="px-4 py-3 rounded-xl text-sm"
                    style={{ background: "#0a0a12", border: "1px solid var(--border)", color: "var(--foreground)" }}>
                    {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Riot Name</label>
                    <input type="text" value={riotName} onChange={e => setRiotName(e.target.value)}
                      placeholder="DeinName" required
                      className="px-4 py-3 rounded-xl text-sm"
                      style={{ background: "#0a0a12", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                  </div>
                  <div className="flex flex-col gap-1.5 w-32">
                    <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Tag</label>
                    <div className="flex items-center gap-1 px-3 py-3 rounded-xl" style={{ background: "#0a0a12", border: "1px solid var(--border)" }}>
                      <span style={{ color: "#555" }}>#</span>
                      <input type="text" value={riotTag} onChange={e => setRiotTag(e.target.value)}
                        placeholder="EUW" required maxLength={5}
                        className="flex-1 bg-transparent text-sm outline-none"
                        style={{ color: "var(--foreground)" }} />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                    style={{ background: "rgba(255,70,85,0.1)", color: "var(--accent)", border: "1px solid rgba(255,70,85,0.2)" }}>
                    <AlertCircle size={16} className="flex-shrink-0" /> {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="btn-primary flex items-center justify-center gap-2 py-4 rounded-xl font-bold disabled:opacity-50">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                  Account verknüpfen
                </button>
              </form>

              <button onClick={() => router.push("/discover")} className="mt-3 text-sm w-full py-2 text-center" style={{ color: "#444" }}>
                Überspringen
              </button>
            </motion.div>
          )}

          {/* Linking animation */}
          {step === "linking" && (
            <motion.div key="linking" variants={variants} initial="hidden" animate="show" exit="exit"
              className="p-8 rounded-2xl text-center"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 pulse-glow"
                style={{ background: "rgba(255,70,85,0.1)", border: "2px solid rgba(255,70,85,0.4)" }}>
                <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
              </div>
              <h2 className="text-xl font-black mb-2">Verbinde Account...</h2>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Wir laden {riotName}#{riotTag} Stats von der Henrik API
              </p>
            </motion.div>
          )}

          {/* Success */}
          {step === "success" && (
            <motion.div key="success" variants={variants} initial="hidden" animate="show" exit="exit"
              className="p-8 rounded-2xl text-center"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: `${rankColor}20`, border: `2px solid ${rankColor}60` }}>
                <CheckCircle size={36} style={{ color: rankColor }} />
              </motion.div>

              <h2 className="text-3xl font-black mb-2">Account verknüpft!</h2>
              {fetchedRank && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl font-black text-xl mt-3 mb-2"
                  style={{ background: `${rankColor}15`, color: rankColor, border: `1px solid ${rankColor}40` }}>
                  <RankIcon rank={fetchedRank} size={48} />
                  {fetchedRank}
                </motion.div>
              )}
              <p className="mb-8 mt-4 leading-relaxed" style={{ color: "var(--muted)" }}>
                Perfekt! Deine Stats sind geladen. Jetzt kannst du anfangen zu swipen und deinen Duo zu finden.
              </p>

              <button onClick={() => router.push("/discover")}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg">
                Jetzt swipen <ChevronRight size={20} />
              </button>
              <button onClick={() => router.push("/profile")} className="mt-3 text-sm w-full py-2" style={{ color: "#555" }}>
                Erst Profil vervollständigen
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
