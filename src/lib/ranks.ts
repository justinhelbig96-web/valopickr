export const RANKS = [
  { label: 'Iron', tier: 'iron', color: '#8B7355', bg: '#2A2017' },
  { label: 'Bronze', tier: 'bronze', color: '#CD7F32', bg: '#2A1A0A' },
  { label: 'Silver', tier: 'silver', color: '#C0C0C0', bg: '#1A1A1A' },
  { label: 'Gold', tier: 'gold', color: '#FFD700', bg: '#2A2000' },
  { label: 'Platinum', tier: 'platinum', color: '#00CED1', bg: '#001A1A' },
  { label: 'Diamond', tier: 'diamond', color: '#B9F2FF', bg: '#00101A' },
  { label: 'Ascendant', tier: 'ascendant', color: '#00FF7F', bg: '#001A0D' },
  { label: 'Immortal', tier: 'immortal', color: '#FF4655', bg: '#1A0009' },
  { label: 'Radiant', tier: 'radiant', color: '#FFFB8F', bg: '#1A1900' },
]

export const RANK_ORDER = RANKS.map((r) => r.tier)

export function getRankColor(tier: string): string {
  return RANKS.find((r) => r.tier === tier.toLowerCase())?.color ?? '#888'
}

export function getRankIndex(tier: string): number {
  return RANK_ORDER.indexOf(tier.toLowerCase())
}

export const REGIONS = [
  { value: 'eu', label: 'Europe' },
  { value: 'na', label: 'North America' },
  { value: 'ap', label: 'Asia Pacific' },
  { value: 'kr', label: 'Korea' },
]

/** Returns card border and box-shadow style based on rank tier intensity */
export function getRankGlow(tier: string): { border: string; boxShadow: string } {
  const idx = getRankIndex(tier)
  const color = getRankColor(tier)
  if (idx >= 8) return {
    border: `2px solid ${color}`,
    boxShadow: `0 0 40px ${color}60, 0 0 80px ${color}25, 0 24px 60px rgba(0,0,0,0.6)`,
  }
  if (idx >= 7) return {
    border: `2px solid ${color}CC`,
    boxShadow: `0 0 30px ${color}50, 0 0 60px ${color}20, 0 22px 55px rgba(0,0,0,0.55)`,
  }
  if (idx >= 6) return {
    border: `2px solid ${color}99`,
    boxShadow: `0 0 24px ${color}40, 0 20px 50px rgba(0,0,0,0.5)`,
  }
  if (idx >= 4) return {
    border: `2px solid ${color}66`,
    boxShadow: `0 0 18px ${color}28, 0 20px 50px rgba(0,0,0,0.45)`,
  }
  if (idx >= 2) return {
    border: `1px solid ${color}45`,
    boxShadow: `0 0 12px ${color}18, 0 20px 44px rgba(0,0,0,0.4)`,
  }
  return {
    border: `1px solid ${color}30`,
    boxShadow: `0 20px 40px rgba(0,0,0,0.35)`,
  }
}
