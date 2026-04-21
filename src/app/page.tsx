"use client"

import Link from "next/link"
import Image from "next/image"
import { useRef, useEffect, useState } from "react"
import { motion, useInView, animate, AnimatePresence } from "framer-motion"
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

function CountUp({ target, suffix = "", duration = 1.5 }: { target: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate(v) {
        if (ref.current) ref.current.textContent = Math.round(v) + suffix
      },
    })
    return () => controls.stop()
  }, [isInView, target, suffix, duration])

  return <span ref={ref}>0{suffix}</span>
}

export default function HomePage() {
  const rankIcons = useRankIcons()
  const { locale, setLocale, t } = useLanguage()
  const [userCount, setUserCount] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const STEP_ICONS = [Shield, Zap, Users]
  const STEP_COLORS = ["#ff4655", "#FFD700", "#00FF7F"]
  const STEP_NUMS = ["01", "02", "03"]

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => { if (d.count > 0) setUserCount(d.count) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex((i) => (i + 1) % t.hero.heroWords.length)
    }, 2200)
    return () => clearInterval(id)
  }, [t.hero.heroWords.length])
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
          <Image src="/logo.png" alt="ValoPickr Logo" width={40} height={40} className="rounded-lg" />
          <span className="font-bebas text-2xl tracking-widest logo-brand">
            <span style={{ color: "var(--accent)" }}>VALO</span>
            <span style={{ color: "var(--foreground)" }}>PICKR</span>
          </span>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
          className="flex items-center gap-3">
          {/* Discord Link */}
          <a href="https://discord.gg/aK2xNfAfEa" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: "rgba(88,101,242,0.15)", border: "1px solid rgba(88,101,242,0.35)", color: "#8891f1" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Discord
          </a>

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
      <section className="relative flex flex-col items-center justify-center px-4 pt-40 pb-16 text-center" style={{ zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8"
            style={{ background: "rgba(255,70,85,0.1)", border: "1px solid rgba(255,70,85,0.3)", color: "var(--accent)" }}>
            <Star size={12} fill="currentColor" /> {t.hero.badge}
          </motion.div>

          <h1 className="font-bebas text-[clamp(3.5rem,12vw,8rem)] tracking-wide leading-none mb-6 uppercase">
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="block text-white">
              {t.hero.line1}
            </motion.span>
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="block text-white">
              {t.hero.line2prefix || "WITH"}
            </motion.span>
            <div className="flex justify-center" style={{ minHeight: "1.15em" }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={t.hero.heroWords[wordIndex]}
                  initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.08, filter: "blur(6px)" }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="shimmer-text glow-text-red whitespace-nowrap"
                >
                  {t.hero.heroWords[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-lg md:text-xl max-w-md mx-auto mb-10 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.7)", textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
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
        <div className="relative mt-20 w-full max-w-3xl mx-auto h-64 hidden md:flex items-start justify-center">
          {FAKE_CARDS.map((card, i) => (
            <motion.div
              key={card.name}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0, rotate: (i - 1) * 6, x: (i - 1) * 220 }}
              transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
              className="absolute w-52 p-4 rounded-2xl float"
              style={{
                background: "var(--card)",
                border: `1px solid ${card.color}35`,
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

      {/* Stats Counter — full-width strip right after hero */}
      <section className="relative w-full" style={{ zIndex: 1 }}>
        <div className="header-accent-line" />
        <div className="relative overflow-hidden" style={{ background: "#0a0a12", borderBottom: "1px solid var(--border)" }}>
          <div className="dot-grid-red absolute inset-0 pointer-events-none opacity-60" />
          <div className="relative max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-0">
            {[
              { value: userCount, suffix: "", label: "Registered Players", icon: "👥" },
              { value: 9, suffix: "", label: "Rank Tiers", icon: "🏆" },
              { value: 100, suffix: "%", label: "Free to Use", icon: "⚡" },
              { value: 4, suffix: " Regions", label: "EU · NA · AP · KR", icon: "🌍" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.45 }}
                className="flex flex-col items-center text-center py-2 px-4"
                style={{ borderRight: i < 3 ? "1px solid var(--border)" : "none" }}
              >
                <span className="text-2xl mb-1">{stat.icon}</span>
                <p className="stat-number text-4xl md:text-5xl mb-1">
                  {stat.value > 0
                    ? <CountUp target={stat.value} suffix={stat.suffix} />
                    : <span style={{ color: "#333" }}>…</span>
                  }
                </p>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#555" }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="header-accent-line" />
      </section>

      {/* How it works */}
      <section className="relative px-4 py-28 max-w-5xl mx-auto w-full" style={{ zIndex: 1 }}>
        <div className="text-center mb-16">
          <span className="font-rajdhani text-sm font-bold tracking-widest uppercase mb-4 block" style={{ color: "var(--accent)" }}>
            {t.howTitle}
          </span>
          <h2 className="font-bebas text-5xl md:text-7xl tracking-wider">{t.howSub}</h2>
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
                <h3 className="font-rajdhani text-xl font-bold mb-2">{step.title}</h3>
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
          <h2 className="font-bebas text-4xl md:text-6xl tracking-wider mb-4">{t.ctaBanner.title}</h2>
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
