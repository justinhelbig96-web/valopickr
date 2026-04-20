"use client"

import { useState, useEffect } from "react"
import { fetchRankIcons, getRankIcon, getTierIcon } from "@/lib/rankIcons"
import { getRankColor } from "@/lib/ranks"

/** Hook – fetches and caches rank icons on the client */
export function useRankIcons(): Record<string, string> {
  const [icons, setIcons] = useState<Record<string, string>>({})
  useEffect(() => {
    fetchRankIcons().then(setIcons)
  }, [])
  return icons
}

interface RankIconProps {
  /** Full rank name, e.g. "Iron 2", "Gold 3", "Radiant" */
  rank: string
  /** Tier name (lowercase), e.g. "iron". Used for colour fallback. */
  tier?: string
  /** Pixel size of the icon (width = height). Default 32 */
  size?: number
  className?: string
}

/**
 * Shows the Valorant rank icon image. Falls back to a small coloured circle
 * while the API fetch is in-flight.
 */
export default function RankIcon({ rank, tier, size = 32, className = "" }: RankIconProps) {
  const icons = useRankIcons()
  const iconUrl = getRankIcon(icons, rank)
  const color = getRankColor(tier ?? rank.split(" ")[0].toLowerCase())

  if (!iconUrl) {
    return (
      <span
        className={className}
        style={{
          display: "inline-block",
          width: size,
          height: size,
          borderRadius: "50%",
          background: `${color}25`,
          border: `1px solid ${color}50`,
          flexShrink: 0,
        }}
      />
    )
  }

  return (
    <img
      src={iconUrl}
      alt={rank}
      width={size}
      height={size}
      draggable={false}
      className={className}
      style={{
        objectFit: "contain",
        filter: `drop-shadow(0 0 5px ${color}50)`,
        flexShrink: 0,
      }}
    />
  )
}

/** Tier-level icon (for filter panels where only tier names are known) */
export function TierIcon({ tier, size = 28, className = "" }: { tier: string; size?: number; className?: string }) {
  const icons = useRankIcons()
  const iconUrl = getTierIcon(icons, tier)
  const color = getRankColor(tier)

  if (!iconUrl) {
    return (
      <span
        className={className}
        style={{
          display: "inline-block",
          width: size,
          height: size,
          borderRadius: "50%",
          background: `${color}25`,
          border: `1px solid ${color}50`,
          flexShrink: 0,
        }}
      />
    )
  }

  return (
    <img
      src={iconUrl}
      alt={tier}
      width={size}
      height={size}
      draggable={false}
      className={className}
      style={{
        objectFit: "contain",
        filter: `drop-shadow(0 0 4px ${color}40)`,
        flexShrink: 0,
      }}
    />
  )
}
