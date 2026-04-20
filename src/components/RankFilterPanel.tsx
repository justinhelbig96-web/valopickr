"use client"

import { motion } from "framer-motion"
import { RANKS } from "@/lib/ranks"
import { X } from "lucide-react"
import { TierIcon } from "@/components/RankIcon"

interface Props {
  value: { min: string; max: string }
  onChange: (v: { min: string; max: string }) => void
  onClose: () => void
}

export default function RankFilterPanel({ value, onChange, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-4 mt-2 mb-0 rounded-2xl p-5"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">Rank-Filter</h3>
        <button onClick={onClose}><X size={18} style={{ color: "#888" }} /></button>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs mb-2" style={{ color: "#888" }}>Mindest-Rank</p>
          <div className="flex flex-wrap gap-2">
            {RANKS.map((rank) => (
              <button
                key={rank.tier}
                onClick={() => onChange({ ...value, min: rank.tier })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={
                  value.min === rank.tier
                    ? { background: rank.color, color: "#000" }
                    : { border: `1px solid ${rank.color}40`, color: rank.color }
                }
              >
                <TierIcon tier={rank.tier} size={18} />
                {rank.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs mb-2" style={{ color: "#888" }}>Maximal-Rank</p>
          <div className="flex flex-wrap gap-2">
            {RANKS.map((rank) => (
              <button
                key={rank.tier}
                onClick={() => onChange({ ...value, max: rank.tier })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={
                  value.max === rank.tier
                    ? { background: rank.color, color: "#000" }
                    : { border: `1px solid ${rank.color}40`, color: rank.color }
                }
              >
                <TierIcon tier={rank.tier} size={18} />
                {rank.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onChange({ min: "iron", max: "radiant" })}
          className="text-xs text-left"
          style={{ color: "#555" }}
        >
          Filter zurücksetzen
        </button>
      </div>
    </motion.div>
  )
}
