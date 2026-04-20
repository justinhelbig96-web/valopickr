"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import type { Profile } from "@/types/database"
import { getRankColor } from "@/lib/ranks"
import { useEffect, useState } from "react"

interface Props {
  profile: Profile & { stats?: unknown }
  myProfile?: Profile | null
  onClose: () => void
}

function Avatar({ profile, size }: { profile: Profile; size: number }) {
  const rankColor = getRankColor(profile.rank_tier ?? "iron")
  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile.display_name}
        className="object-cover rounded-full"
        style={{
          width: size,
          height: size,
          border: `3px solid ${rankColor}`,
          boxShadow: `0 0 28px ${rankColor}60`,
        }}
      />
    )
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-black"
      style={{
        width: size,
        height: size,
        background: `${rankColor}20`,
        color: rankColor,
        border: `3px solid ${rankColor}`,
        boxShadow: `0 0 28px ${rankColor}60`,
        fontSize: size * 0.38,
      }}
    >
      {profile.display_name?.[0]?.toUpperCase() ?? "?"}
    </div>
  )
}

export default function MatchModal({ profile, myProfile, onClose }: Props) {
  const [phase, setPhase] = useState<"avatars" | "text" | "buttons">("avatars")

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 600)
    const t2 = setTimeout(() => setPhase("buttons"), 1300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const matchColor = "#ff4655"
  const heights = [560, 700, 800]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={onClose}
    >
      {/* Expanding rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border pointer-events-none"
          style={{ borderColor: `${matchColor}35` }}
          initial={{ width: 80, height: 80, opacity: 0.9 }}
          animate={{ width: heights[i], height: heights[i], opacity: 0 }}
          transition={{ duration: 1.4 + i * 0.25, delay: i * 0.18, ease: "easeOut" }}
        />
      ))}

      {/* Floating hearts */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`h${i}`}
          className="absolute pointer-events-none select-none"
          style={{ left: `${8 + i * 11}%`, bottom: "5%", fontSize: 22 + (i % 3) * 6 }}
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: -700, opacity: 0, rotate: i % 2 === 0 ? -15 : 15 }}
          transition={{ duration: 2.2 + i * 0.15, delay: 0.15 + i * 0.1, ease: "easeOut" }}
        >
          ❤️
        </motion.div>
      ))}

      <div className="flex flex-col items-center px-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>

        {/* Avatars */}
        <div className="relative flex items-center justify-center mb-8">
          {/* My avatar */}
          <motion.div
            initial={{ x: -180, opacity: 0, rotate: -10 }}
            animate={{ x: 0, opacity: 1, rotate: -7 }}
            transition={{ type: "spring", stiffness: 210, damping: 22, delay: 0.05 }}
            style={{ zIndex: 1, marginRight: -28 }}
          >
            {myProfile ? (
              <Avatar profile={myProfile} size={116} />
            ) : (
              <div className="rounded-full" style={{ width: 116, height: 116, background: "#1a1a2e", border: "3px solid #333" }} />
            )}
          </motion.div>

          {/* Pulsing heart */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.35 }}
            className="relative z-10 flex items-center justify-center rounded-full"
            style={{
              width: 52, height: 52,
              background: matchColor,
              boxShadow: `0 0 30px ${matchColor}80, 0 0 60px ${matchColor}40`,
              border: "3px solid #fff",
              flexShrink: 0,
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.35, 1] }}
              transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
              style={{ fontSize: 22, lineHeight: 1 }}
            >
              ❤️
            </motion.span>
          </motion.div>

          {/* Their avatar */}
          <motion.div
            initial={{ x: 180, opacity: 0, rotate: 10 }}
            animate={{ x: 0, opacity: 1, rotate: 7 }}
            transition={{ type: "spring", stiffness: 210, damping: 22, delay: 0.05 }}
            style={{ zIndex: 1, marginLeft: -28 }}
          >
            <Avatar profile={profile} size={116} />
          </motion.div>
        </div>

        {/* Text */}
        <AnimatePresence>
          {phase !== "avatars" && (
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 250, damping: 22 }}
              className="text-center mb-2 w-full"
            >
              <h2
                className="text-5xl font-black tracking-wide"
                style={{
                  fontFamily: "var(--font-bebas), Impact, sans-serif",
                  background: `linear-gradient(135deg, #ff4655 0%, #ff8a70 50%, #ff4655 100%)`,
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmer 2.5s linear infinite",
                }}
              >
                IT&apos;S A MATCH!
              </h2>
              <p className="text-sm mt-3" style={{ color: "#888" }}>
                Du und{" "}
                <strong style={{ color: "var(--foreground)" }}>{profile.display_name}</strong>{" "}
                habt euch gegenseitig geliked!
              </p>
              {profile.rank && (
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold mt-3"
                  style={{
                    color: getRankColor(profile.rank_tier ?? "iron"),
                    background: `${getRankColor(profile.rank_tier ?? "iron")}18`,
                    border: `1px solid ${getRankColor(profile.rank_tier ?? "iron")}40`,
                  }}
                >
                  {profile.rank}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <AnimatePresence>
          {phase === "buttons" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              className="flex flex-col gap-3 mt-6 w-full"
            >
              <Link
                href="/matches"
                onClick={onClose}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-center"
                style={{
                  background: matchColor,
                  color: "#fff",
                  boxShadow: `0 4px 20px ${matchColor}50`,
                }}
              >
                💬 Jetzt schreiben
              </Link>
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-xl font-medium text-sm"
                style={{ border: "1px solid var(--border)", color: "#888" }}
              >
                Weiter swipen
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

