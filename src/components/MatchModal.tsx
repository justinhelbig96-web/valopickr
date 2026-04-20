"use client"

import { motion } from "framer-motion"
import { Heart } from "lucide-react"
import Link from "next/link"
import type { Profile } from "@/types/database"
import { getRankColor } from "@/lib/ranks"

interface Props {
  profile: Profile & { stats?: unknown }
  onClose: () => void
}

export default function MatchModal({ profile, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-sm p-8 rounded-3xl text-center"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "var(--accent)" }}
        >
          <Heart size={40} fill="white" style={{ color: "#fff" }} />
        </motion.div>

        <h2 className="text-3xl font-black mb-2" style={{ color: "var(--accent)" }}>
          IT&apos;S A MATCH!
        </h2>
        <p className="mb-1" style={{ color: "#888" }}>
          Du und <strong style={{ color: "var(--foreground)" }}>{profile.display_name}</strong> habt euch gegenseitig geliked!
        </p>

        {profile.rank && (
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 mb-6"
            style={{
              color: getRankColor(profile.rank_tier ?? "iron"),
              background: `${getRankColor(profile.rank_tier ?? "iron")}20`,
              border: `1px solid ${getRankColor(profile.rank_tier ?? "iron")}40`,
            }}
          >
            {profile.rank}
          </span>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/matches"
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-sm"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Jetzt schreiben
          </Link>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-medium text-sm"
            style={{ border: "1px solid var(--border)", color: "#888" }}
          >
            Weiter swipen
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
