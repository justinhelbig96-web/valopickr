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
