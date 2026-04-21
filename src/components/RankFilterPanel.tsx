"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { RANKS, REGIONS } from "@/lib/ranks"
import { X, SlidersHorizontal } from "lucide-react"
import { TierIcon } from "@/components/RankIcon"

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

export interface FilterValue {
  min: string
  max: string
  regions: string[]
  playstyles: string[]
  languages: string[]
}

interface Props {
  value: FilterValue
  onChange: (v: FilterValue) => void
  onClose: () => void
}

function countActive(f: FilterValue) {
  let n = 0
  if (f.min !== "iron" || f.max !== "radiant") n++
  if (f.regions.length) n++
  if (f.playstyles.length) n++
  if (f.languages.length) n++
  return n
}

export default function RankFilterPanel({ value, onChange, onClose }: Props) {
  const [pending, setPending] = useState<FilterValue>({ ...value })

  function toggle<K extends "regions" | "playstyles" | "languages">(key: K, val: string) {
    setPending((p) => {
      const arr = p[key] as string[]
      return { ...p, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] }
    })
  }

  function reset() {
    setPending({ min: "iron", max: "radiant", regions: [], playstyles: [], languages: [] })
  }

  const active = countActive(pending)

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Side panel */}
      <motion.div
        initial={{ opacity: 0, x: "100%" }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
        style={{ width: 340, background: "#0d0d16", borderLeft: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} style={{ color: "var(--accent)" }} />
            <span className="font-black text-lg">Filter</span>
            {active > 0 && (
              <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: "var(--accent)", color: "#fff" }}>
                {active}
              </span>
            )}
          </div>
          <button onClick={onClose}><X size={20} style={{ color: "#888" }} /></button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-7">

          {/* Rank Range */}
          <section>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#555" }}>Mindest-Rank</p>
            <div className="flex flex-wrap gap-2">
              {RANKS.map((rank) => (
                <button
                  key={rank.tier}
                  onClick={() => setPending((p) => ({ ...p, min: rank.tier }))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={
                    pending.min === rank.tier
                      ? { background: rank.color, color: "#000" }
                      : { border: `1px solid ${rank.color}40`, color: rank.color }
                  }
                >
                  <TierIcon tier={rank.tier} size={16} />
                  {rank.label}
                </button>
              ))}
            </div>

            <p className="text-xs font-bold uppercase tracking-wider mb-3 mt-5" style={{ color: "#555" }}>Maximal-Rank</p>
            <div className="flex flex-wrap gap-2">
              {RANKS.map((rank) => (
                <button
                  key={rank.tier}
                  onClick={() => setPending((p) => ({ ...p, max: rank.tier }))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={
                    pending.max === rank.tier
                      ? { background: rank.color, color: "#000" }
                      : { border: `1px solid ${rank.color}40`, color: rank.color }
                  }
                >
                  <TierIcon tier={rank.tier} size={16} />
                  {rank.label}
                </button>
              ))}
            </div>
          </section>

          {/* Region */}
          <section>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#555" }}>Region</p>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => {
                const active = pending.regions.includes(r.value)
                return (
                  <button
                    key={r.value}
                    onClick={() => toggle("regions", r.value)}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    style={active
                      ? { background: "var(--accent)", color: "#fff", border: "1px solid var(--accent)" }
                      : { border: "1px solid var(--border)", color: "#aaa" }
                    }
                  >
                    {r.label}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Playstyle */}
          <section>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#555" }}>Playstyle</p>
            <div className="flex flex-wrap gap-2">
              {PLAYSTYLES.map((p) => {
                const isActive = pending.playstyles.includes(p.value)
                return (
                  <button
                    key={p.value}
                    onClick={() => toggle("playstyles", p.value)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    style={isActive
                      ? { background: "rgba(255,70,85,0.2)", color: "var(--accent)", border: "1px solid rgba(255,70,85,0.5)" }
                      : { border: "1px solid var(--border)", color: "#aaa" }
                    }
                  >
                    <span>{p.emoji}</span>{p.label}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Languages */}
          <section>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#555" }}>Sprache</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const isActive = pending.languages.includes(lang)
                return (
                  <button
                    key={lang}
                    onClick={() => toggle("languages", lang)}
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    style={isActive
                      ? { background: "rgba(88,101,242,0.25)", color: "#8891f1", border: "1px solid rgba(88,101,242,0.5)" }
                      : { border: "1px solid var(--border)", color: "#aaa" }
                    }
                  >
                    {lang}
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        {/* Footer: Reset + Apply */}
        <div className="px-5 py-4 border-t flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={reset}
            className="text-xs font-bold px-4 py-2.5 rounded-xl flex-shrink-0"
            style={{ border: "1px solid var(--border)", color: "#666" }}
          >
            Zurücksetzen
          </button>
          <button
            onClick={() => { onChange(pending); onClose() }}
            className="flex-1 py-2.5 rounded-xl font-black text-sm text-white"
            style={{ background: "linear-gradient(135deg, #ff4655, #e03545)" }}
          >
            Filter anwenden
          </button>
        </div>
      </motion.div>
    </>
  )
}
