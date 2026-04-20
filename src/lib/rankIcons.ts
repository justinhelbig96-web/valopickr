// Fetches rank tier icons from valorant-api.com and caches them.
// Maps tierName.toLowerCase() → smallIcon URL
// e.g. "iron 1" → "https://media.valorant-api.com/..."
// e.g. "radiant" → "..."

let iconsPromise: Promise<Record<string, string>> | null = null

interface ValorantTier {
  tierName: string
  smallIcon: string | null
  largeIcon: string | null
}

interface ValorantEpisode {
  tiers: ValorantTier[]
}

export function fetchRankIcons(): Promise<Record<string, string>> {
  if (!iconsPromise) {
    iconsPromise = fetch("https://valorant-api.com/v1/competitivetiers")
      .then((r) => r.json())
      .then((data) => {
        const episodes = data.data as ValorantEpisode[]
        const latest = episodes[episodes.length - 1]
        const map: Record<string, string> = {}
        for (const tier of latest.tiers) {
          if (tier.smallIcon && tier.tierName) {
            map[tier.tierName.toLowerCase()] = tier.smallIcon
          }
        }
        return map
      })
      .catch(() => ({}))
  }
  return iconsPromise
}

/** Returns the representative icon URL for a tier (e.g. "iron" → Iron 1 icon) */
export function getTierIcon(icons: Record<string, string>, tier: string): string | undefined {
  // Try "tier 1" first (Iron 1, Bronze 1 …), then bare tier name (Radiant has no number)
  return icons[`${tier} 1`] ?? icons[tier] ?? undefined
}

/** Returns the icon URL for an exact rank name (e.g. "Iron 2", "Radiant") */
export function getRankIcon(icons: Record<string, string>, rank: string): string | undefined {
  return icons[rank.toLowerCase()] ?? getTierIcon(icons, rank.split(" ")[0].toLowerCase())
}
