"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ChevronRight, Star, Zap, Shield, Users } from "lucide-react"
import { useRankIcons } from "@/components/RankIcon"
import { getTierIcon, getRankIcon } from "@/lib/rankIcons"
import { useLanguage } from "@/contexts/LanguageContext"
import { LOCALES } from "@/lib/translations"

const RANKS = [
  { label: "Iron", color: "#8B7355" },
  { label: "Bronze", color: "#CD7F32" },
  { label: "Silver", color: "#C0C0C0" },
  { label: "Gold", color: "#FFD700" },
  { label: "Platinum", color: "#00CED1" },
  { label: "Diamond", color: "#B9F2FF" },
  { label: "Ascendant", color: "#00FF7F" },
  { label: "Immortal", color: "#FF4655" },
  { label: "Radiant", color: "#FFFB8F" },
]

const DIAGONAL_BARS = [
  { top: "4%",  thickness: 1, opacity: 0.28, blur: 2,  delay: "0s",   duration: 4   },
  { top: "13%", thickness: 3, opacity: 0.55, blur: 8,  delay: "0.4s", duration: 5.5 },
  { top: "24%", thickness: 1, opacity: 0.18, blur: 1,  delay: "1.2s", duration: 3.5 },
  { top: "35%", thickness: 2, opacity: 0.42, blur: 6,  delay: "0.8s", duration: 6   },
  { top: "48%", thickness: 1, opacity: 0.2,  blur: 2,  delay: "1.6s", duration: 4.5 },
  { top: "60%", thickness: 3, opacity: 0.48, blur: 7,  delay: "0.2s", duration: 5   },
  { top: "72%", thickness: 1, opacity: 0.15, blur: 1,  delay: "1s",   duration: 4   },
  { top: "83%", thickness: 2, opacity: 0.38, blur: 5,  delay: "0.6s", duration: 5.5 },
  { top: "94%", thickness: 1, opacity: 0.22, blur: 2,  delay: "1.4s", duration: 3.5 },
]

const FAKE_CARDS = [
  { name: "PhantomEUW", rank: "Immortal 2", tier: "immortal", kd: "1.84", hs: "28%", color: "#FF4655" },
  { name: "AscendGod", rank: "Ascendant 3", tier: "ascendant", kd: "1.42", hs: "22%", color: "#00FF7F" },
  { name: "DiamondDuo", rank: "Diamond 1", tier: "diamond", kd: "1.21", hs: "19%", color: "#B9F2FF" },
]

export default function HomePage() {
  const rankIcons = useRankIcons()
  const { locale, setLocale, t } = useLanguage()
  const STEP_ICONS = [Shield, Zap, Users]
  const STEP_COLORS = ["#ff4655", "#FFD700", "#00FF7F"]
  const STEP_NUMS = ["01", "02", "03"]
  return (
    <main className="flex flex-col min-h-screen grid-bg">
      {/* ===== VIDEO BACKGROUND ===== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {/* Valorant Cinematic Video */}
        <iframe
          className="valo-bg-iframe"
          src="https://www.youtube.com/embed/e_E9W2vsRbQ?autoplay=1&mute=1&loop=1&playlist=e_E9W2vsRbQ&controls=0&disablekb=1&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1&playsinline=1"
          allow="autoplay; encrypted-media"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, rgba(8,8,16,0.78) 0%, rgba(8,8,16,0.55) 40%, rgba(8,8,16,0.92) 100%)",
          zIndex: 2,
        }} />
        {/* Diagonal glow bars */}
        <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 3 }}>
          {DIAGONAL_BARS.map((bar, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: "200%",
                height: `${bar.thickness}px`,
                background: `linear-gradient(90deg, transparent 0%, rgba(255,70,85,${bar.opacity}) 35%, rgba(255,110,120,${bar.opacity * 1.6}) 50%, rgba(255,70,85,${bar.opacity}) 65%, transparent 100%)`,
                transform: "rotate(-45deg)",
                left: "-50%",
                top: bar.top,
                filter: `blur(${bar.blur}px)`,
                animation: `bar-pulse ${bar.duration}s ease-in-out infinite`,
                animationDelay: bar.delay,
              }}
            />
          ))}
        </div>
        {/* Ambient red glow */}
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <div style={{
            position: "absolute", top: "25%", left: "10%",
            width: 600, height: 350,
            background: "radial-gradient(ellipse, rgba(255,70,85,0.1) 0%, transparent 70%)",
            filter: "blur(80px)",
          }} />
          <div style={{
            position: "absolute", bottom: "10%", right: "5%",
            width: 400, height: 300,
            background: "radial-gradient(ellipse, rgba(255,70,85,0.07) 0%, transparent 70%)",
            filter: "blur(60px)",
          }} />
        </div>
      </div>

      {/* Nav */}
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: "var(--border)" }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
          className="flex items-center gap-3">
          <Image src="/logo.png" alt="ValoMate Logo" width={40} height={40} className="rounded-lg" />
          <span className="font-black text-xl tracking-tight">
            <span style={{ color: "var(--accent)" }}>VALO</span>
            <span style={{ color: "var(--foreground)" }}>MATE</span>
          </span>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
          className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLocale(l.code)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: locale === l.code ? "rgba(255,70,85,0.2)" : "transparent",
                  color: locale === l.code ? "var(--accent)" : "var(--muted)",
                  border: locale === l.code ? "1px solid rgba(255,70,85,0.3)" : "1px solid transparent",
                }}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
          <Link href="/auth/login" className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{ color: "var(--muted)", border: "1px solid var(--border)" }}>
            {t.nav.login}
          </Link>
          <Link href="/auth/register" className="btn-primary px-5 py-2 text-sm">
            {t.nav.register}
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-28 pb-16 text-center" style={{ zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8"
            style={{ background: "rgba(255,70,85,0.1)", border: "1px solid rgba(255,70,85,0.3)", color: "var(--accent)" }}>
            <Star size={12} fill="currentColor" /> {t.hero.badge}
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-6">
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="block text-white">
              {t.hero.line1}
            </motion.span>
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="block shimmer-text">
              {t.hero.line2}
            </motion.span>
          </h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-lg md:text-xl max-w-md mx-auto mb-10 leading-relaxed"
            style={{ color: "var(--muted)" }}>
            {t.hero.sub}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="btn-primary flex items-center gap-2 px-8 py-4 text-base rounded-xl">
              {t.hero.cta} <ChevronRight size={18} />
            </Link>
            <Link href="/auth/login" className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              {t.hero.ctaSub}
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating Preview Cards */}
        <div className="relative mt-20 w-full max-w-2xl mx-auto h-60 hidden md:flex items-start justify-center">
          {FAKE_CARDS.map((card, i) => (
            <motion.div
              key={card.name}
              initial={{ opacity: 0, y: 40, rotate: (i - 1) * 10 }}
              animate={{ opacity: 1, y: 0, rotate: (i - 1) * 6 }}
              transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
              className="absolute w-52 p-4 rounded-2xl float"
              style={{
                background: "var(--card)",
                border: `1px solid ${card.color}35`,
                left: `${16 + i * 30}%`,
                boxShadow: `0 8px 40px ${card.color}18`,
                animationDelay: `${i * 0.8}s`,
                zIndex: i === 1 ? 10 : 5,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                {(() => {
                  const iconUrl = getRankIcon(rankIcons, card.rank)
                  return iconUrl ? (
                    <img src={iconUrl} alt={card.rank} width={40} height={40}
                      draggable={false}
                      style={{ objectFit: "contain", filter: `drop-shadow(0 0 8px ${card.color}70)` }} />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
                      style={{ background: `${card.color}20`, color: card.color }}>
                      {card.name[0]}
                    </div>
                  )
                })()}
                <div>
                  <p className="font-bold text-sm truncate">{card.name}</p>
                  <span className="text-xs font-semibold" style={{ color: card.color }}>{card.rank}</span>
                </div>
              </div>
              <div className="flex gap-4 mt-3">
                <div>
                  <p className="text-xs" style={{ color: "#444" }}>K/D</p>
                  <p className="text-sm font-bold">{card.kd}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "#444" }}>HS%</p>
                  <p className="text-sm font-bold">{card.hs}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Rank Pills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="flex flex-wrap justify-center gap-2 mt-20 md:mt-8">
          {RANKS.map((r, i) => {
            const iconUrl = getTierIcon(rankIcons, r.label.toLowerCase())
            return (
              <motion.span key={r.label}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + i * 0.04 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ border: `1px solid ${r.color}30`, color: r.color, background: `${r.color}10` }}>
                {iconUrl && (
                  <img src={iconUrl} alt={r.label} width={16} height={16}
                    style={{ objectFit: "contain", filter: `drop-shadow(0 0 3px ${r.color}60)` }}
                    draggable={false} />
                )}
                {r.label}
              </motion.span>
            )
          })}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="relative px-4 py-28 max-w-5xl mx-auto w-full" style={{ zIndex: 1 }}>
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest uppercase mb-4 block" style={{ color: "var(--accent)" }}>
            {t.howTitle}
          </span>
          <h2 className="text-4xl md:text-5xl font-black">{t.howSub}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.steps.map((step: { title: string; desc: string }, i: number) => {
            const Icon = STEP_ICONS[i]
            const color = STEP_COLORS[i]
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.45 }}
                className="relative p-6 rounded-2xl card-hover"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="absolute top-4 right-4 text-5xl font-black select-none"
                  style={{ color: `${color}10` }}>{STEP_NUMS[i]}</div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="text-lg font-black mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{step.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative px-4 pb-28" style={{ zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto p-10 md:p-16 rounded-3xl text-center"
          style={{
            background: "linear-gradient(135deg, rgba(255,70,85,0.12), rgba(255,70,85,0.03))",
            border: "1px solid rgba(255,70,85,0.25)",
          }}>
          <h2 className="text-3xl md:text-5xl font-black mb-4">{t.ctaBanner.title}</h2>
          <p className="mb-8 text-lg" style={{ color: "var(--muted)" }}>
            {t.ctaBanner.sub}
          </p>
          <Link href="/auth/register" className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-lg rounded-xl">
            {t.ctaBanner.cta} <ChevronRight size={20} />
          </Link>
        </motion.div>
      </section>

      <footer className="relative text-center py-8 text-xs"
        style={{ color: "#2a2a2a", borderTop: "1px solid var(--border)", zIndex: 1 }}>
        {t.footer}
      </footer>
    </main>
  )
}
