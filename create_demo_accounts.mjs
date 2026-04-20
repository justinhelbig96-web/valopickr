import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://ujmfatoqjijqggafrbpm.supabase.co"
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbWZhdG9xamlqcWdnYWZyYnBtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY5NTMyMSwiZXhwIjoyMDkyMjcxMzIxfQ.N44cZq8Yx3GXeLpipZtaGnzguhRIENDdh65q1TxxDaI"

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_USERS = [
  {
    email: "radiant_king@demo.com",
    password: "Demo1234!",
    display_name: "RadiantKing",
    riot_name: "RadiantKing",
    riot_tag: "KING",
    region: "eu",
    rank: "Radiant",
    rank_tier: "radiant",
    peak_rank: "Radiant",
    bio: "Top 500 EU. Suche tryhard Duo für Ranked Grind.",
    discord_tag: "RadiantKing#0001",
    looking_for: "Radiant+ only pls",
    stats: { kills: 12840, deaths: 6200, assists: 3100, headshots: 4820, win_rate: 64, matches_played: 520, avg_score: 312 },
  },
  {
    email: "immortal_carry@demo.com",
    password: "Demo1234!",
    display_name: "ImmortalCarry",
    riot_name: "ImmortalCarry",
    riot_tag: "EUW",
    region: "eu",
    rank: "Immortal 3",
    rank_tier: "immortal",
    peak_rank: "Radiant",
    bio: "Jett/Reyna Duelist. Bin gut, nicht arrogant. Lerngespräche gern!",
    discord_tag: "ImmortalCarry#1337",
    looking_for: "Immortal+ Duo, kein Toxic",
    stats: { kills: 9820, deaths: 5500, assists: 2800, headshots: 3900, win_rate: 59, matches_played: 420, avg_score: 285 },
  },
  {
    email: "ascend_god@demo.com",
    password: "Demo1234!",
    display_name: "AscendGod",
    riot_name: "AscendGod",
    riot_tag: "999",
    region: "eu",
    rank: "Ascendant 3",
    rank_tier: "ascendant",
    peak_rank: "Immortal 1",
    bio: "Neon/Jett Main. Suche entspanntes Duo ohne Flaming.",
    discord_tag: "ascendgod#2233",
    looking_for: "Ascendant-Immortal, locker drauf",
    stats: { kills: 7600, deaths: 4800, assists: 2500, headshots: 2900, win_rate: 55, matches_played: 380, avg_score: 255 },
  },
  {
    email: "diamond_duo@demo.com",
    password: "Demo1234!",
    display_name: "DiamondDuo",
    riot_name: "DiamondDuo",
    riot_tag: "EU",
    region: "eu",
    rank: "Diamond 2",
    rank_tier: "diamond",
    peak_rank: "Ascendant 1",
    bio: "Support & Sentinel Main. Chamber/Killjoy. Halte gerne Flanken!",
    discord_tag: "dduo#5566",
    looking_for: "Diamond+, teamplay-oriented",
    stats: { kills: 5900, deaths: 4200, assists: 3400, headshots: 1800, win_rate: 52, matches_played: 310, avg_score: 228 },
  },
  {
    email: "plat_tryhard@demo.com",
    password: "Demo1234!",
    display_name: "PlatTryhard",
    riot_name: "PlatTryhard",
    riot_tag: "EUW2",
    region: "eu",
    rank: "Platinum 3",
    rank_tier: "platinum",
    peak_rank: "Diamond 1",
    bio: "Täglich grindend. Omen/Brimstone Main. Mic always on.",
    discord_tag: "plathard#7788",
    looking_for: "Plat-Diamond, daily player",
    stats: { kills: 4800, deaths: 3900, assists: 2700, headshots: 1500, win_rate: 51, matches_played: 280, avg_score: 208 },
  },
  {
    email: "goldboy_eu@demo.com",
    password: "Demo1234!",
    display_name: "GoldBoyEU",
    riot_name: "GoldBoyEU",
    riot_tag: "GOLD",
    region: "eu",
    rank: "Gold 3",
    rank_tier: "gold",
    peak_rank: "Platinum 2",
    bio: "Chill spielen aber auch gewinnen. Sage nichts im Voice wenn du nicht willst.",
    discord_tag: "goldboy#9900",
    looking_for: "Gold-Plat, chill wins",
    stats: { kills: 3600, deaths: 3200, assists: 2200, headshots: 1100, win_rate: 50, matches_played: 240, avg_score: 185 },
  },
  {
    email: "silver_rising@demo.com",
    password: "Demo1234!",
    display_name: "SilverRising",
    riot_name: "SilverRising",
    riot_tag: "RISE",
    region: "eu",
    rank: "Silver 2",
    rank_tier: "silver",
    peak_rank: "Gold 1",
    bio: "Lerne noch viel. Suche geduldigen Duo der erklärt!",
    discord_tag: "silverrise#1122",
    looking_for: "Geduldig, Silver-Gold",
    stats: { kills: 2400, deaths: 2800, assists: 1600, headshots: 700, win_rate: 44, matches_played: 160, avg_score: 158 },
  },
  {
    email: "bronze_beast@demo.com",
    password: "Demo1234!",
    display_name: "BronzeBeast",
    riot_name: "BronzeBeast",
    riot_tag: "BNZB",
    region: "eu",
    rank: "Bronze 3",
    rank_tier: "bronze",
    peak_rank: "Silver 2",
    bio: "Macht Spaß, auch wenn wir verlieren. Kein Stress bitte.",
    discord_tag: "bronzebeast#3344",
    looking_for: "Fehler gemeinsam",
    stats: { kills: 1800, deaths: 2400, assists: 1100, headshots: 480, win_rate: 40, matches_played: 120, avg_score: 140 },
  },
  {
    email: "iron_grinder@demo.com",
    password: "Demo1234!",
    display_name: "IronGrinder",
    riot_name: "IronGrinder",
    riot_tag: "IRON",
    region: "eu",
    rank: "Iron 2",
    rank_tier: "iron",
    peak_rank: "Bronze 1",
    bio: "Erster Act. Lerne jeden Tag dazu. Sage nicht GG EZ :)",
    discord_tag: "irongrinder#5566",
    looking_for: "Anfänger-freundlich",
    stats: { kills: 1100, deaths: 1800, assists: 700, headshots: 280, win_rate: 36, matches_played: 80, avg_score: 118 },
  },
  {
    email: "na_radiant@demo.com",
    password: "Demo1234!",
    display_name: "NARadiant",
    riot_name: "NARadiant",
    riot_tag: "NARA",
    region: "na",
    rank: "Radiant",
    rank_tier: "radiant",
    peak_rank: "Radiant",
    bio: "Top 200 NA. Playing on EU for fun. High sens Jett.",
    discord_tag: "naradiant#0077",
    looking_for: "Immortal+ on any server",
    stats: { kills: 11000, deaths: 5800, assists: 2900, headshots: 4400, win_rate: 62, matches_played: 490, avg_score: 304 },
  },
  {
    email: "ap_immortal@demo.com",
    password: "Demo1234!",
    display_name: "APImmortal",
    riot_name: "APImmortal",
    riot_tag: "APIM",
    region: "ap",
    rank: "Immortal 1",
    rank_tier: "immortal",
    peak_rank: "Immortal 3",
    bio: "AP server grinder. Sage/Astra main. Utility player.",
    discord_tag: "apimmortal#6677",
    looking_for: "AP or EU duo",
    stats: { kills: 7200, deaths: 5100, assists: 4200, headshots: 2100, win_rate: 56, matches_played: 360, avg_score: 262 },
  },
  {
    email: "flexcarry_eu@demo.com",
    password: "Demo1234!",
    display_name: "FlexCarry",
    riot_name: "FlexCarry",
    riot_tag: "FLEX",
    region: "eu",
    rank: "Diamond 1",
    rank_tier: "diamond",
    peak_rank: "Diamond 3",
    bio: "Spiele alle Rollen außer Duelist. Flext für das Team.",
    discord_tag: "flexcarry#8899",
    looking_for: "Diamond, brauche Fragger",
    stats: { kills: 5200, deaths: 4100, assists: 4800, headshots: 1400, win_rate: 53, matches_played: 295, avg_score: 232 },
  },
  {
    email: "clutch_queen@demo.com",
    password: "Demo1234!",
    display_name: "ClutchQueen",
    riot_name: "ClutchQueen",
    riot_tag: "CLUT",
    region: "eu",
    rank: "Ascendant 1",
    rank_tier: "ascendant",
    peak_rank: "Ascendant 2",
    bio: "1v5 or nothing. Reyna enjoyer beim grinden.",
    discord_tag: "clutchqueen#1010",
    looking_for: "Ascendant, aggressive playstyle",
    stats: { kills: 6800, deaths: 5200, assists: 1900, headshots: 2640, win_rate: 51, matches_played: 320, avg_score: 244 },
  },
  {
    email: "entryfragger@demo.com",
    password: "Demo1234!",
    display_name: "EntryFragger",
    riot_name: "EntryFragger",
    riot_tag: "ENTR",
    region: "eu",
    rank: "Platinum 1",
    rank_tier: "platinum",
    peak_rank: "Platinum 3",
    bio: "Renne als erster rein, sterbe oft, gewinne trotzdem. Phoenix main.",
    discord_tag: "entry#2020",
    looking_for: "Plat, jemand der followt",
    stats: { kills: 5100, deaths: 4700, assists: 1800, headshots: 1700, win_rate: 49, matches_played: 265, avg_score: 204 },
  },
  {
    email: "igl_brain@demo.com",
    password: "Demo1234!",
    display_name: "IGLBrain",
    riot_name: "IGLBrain",
    riot_tag: "IGL",
    region: "eu",
    rank: "Gold 1",
    rank_tier: "gold",
    peak_rank: "Gold 3",
    bio: "Rufe Rotations & Setups. Omen main. Benutze immer Mikro.",
    discord_tag: "iglbrain#3030",
    looking_for: "Gold, callout-friendly Duo",
    stats: { kills: 3200, deaths: 3000, assists: 3100, headshots: 900, win_rate: 52, matches_played: 210, avg_score: 188 },
  },
]

async function createDemoAccounts() {
  console.log(`\n🎮 ValoMate Demo Account Creator\n${"=".repeat(40)}`)
  
  let created = 0
  let failed = 0

  for (const user of DEMO_USERS) {
    try {
      // Create auth user (email_confirm: true bypasses email confirmation)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { display_name: user.display_name },
      })

      if (authError) {
        if (authError.message.includes("already been registered")) {
          console.log(`⏭  ${user.display_name} already exists, skipping...`)
        } else {
          console.error(`✗  ${user.display_name}: ${authError.message}`)
          failed++
        }
        continue
      }

      const userId = authData.user.id

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: user.display_name,
          riot_name: user.riot_name,
          riot_tag: user.riot_tag,
          region: user.region,
          rank: user.rank,
          rank_tier: user.rank_tier,
          peak_rank: user.peak_rank,
          bio: user.bio,
          discord_tag: user.discord_tag,
          looking_for: user.looking_for,
          is_active: true,
          last_synced_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (profileError) {
        console.error(`  Profile error for ${user.display_name}: ${profileError.message}`)
      }

      // Insert valorant stats
      const { error: statsError } = await supabase.from("valorant_stats").upsert({
        user_id: userId,
        ...user.stats,
        updated_at: new Date().toISOString(),
      })

      if (statsError) {
        console.error(`  Stats error for ${user.display_name}: ${statsError.message}`)
      }

      console.log(`✓  ${user.display_name.padEnd(20)} ${user.rank.padEnd(15)} ${user.email}`)
      created++

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 120))
    } catch (err) {
      console.error(`✗  ${user.display_name}: unexpected error`, err)
      failed++
    }
  }

  console.log(`\n${"=".repeat(40)}`)
  console.log(`✅ Created: ${created}  ❌ Failed: ${failed}`)
  console.log(`\nAll passwords: Demo1234!`)
  console.log(`Login at: http://localhost:3000/auth/login\n`)
}

createDemoAccounts()
