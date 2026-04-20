"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, Loader2, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

function DiscordIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.034.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [discordLoading, setDiscordLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDiscordLogin() {
    setDiscordLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) { setError("Passwort muss mindestens 8 Zeichen lang sein."); return }
    setLoading(true)
    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: displayName } },
    })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id)
    router.push("/onboarding")
  }

  return (
    <main className="flex items-center justify-center min-h-screen px-4 grid-bg">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,70,85,0.06) 0%, transparent 70%)", transform: "translate(20%, -20%)" }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="relative w-full max-w-md p-8 rounded-2xl z-10"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}>

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-black text-2xl tracking-tight mb-3">
            <span style={{ color: "var(--accent)" }}>VALO</span>MATE
          </Link>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Erstelle deinen kostenlosen Account</p>
        </div>

        {/* Discord Button */}
        <button type="button" onClick={handleDiscordLogin} disabled={discordLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-sm mb-6 transition-all"
          style={{ background: "#5865F2", color: "#fff", opacity: discordLoading ? 0.7 : 1 }}>
          {discordLoading ? <Loader2 size={18} className="animate-spin" /> : <DiscordIcon size={18} />}
          {discordLoading ? "Weiterleitung..." : "Mit Discord registrieren"}
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="text-xs" style={{ color: "#444" }}>oder per E-Mail</span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Anzeigename</label>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
              placeholder="z.B. ProPlayer123" required
              className="px-4 py-3 rounded-xl text-sm"
              style={{ background: "#0a0a12", border: "1px solid var(--border)", color: "var(--foreground)" }} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>E-Mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="deine@email.de" required
              className="px-4 py-3 rounded-xl text-sm"
              style={{ background: "#0a0a12", border: "1px solid var(--border)", color: "var(--foreground)" }} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Passwort</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Mindestens 8 Zeichen" required
                className="w-full px-4 py-3 rounded-xl text-sm pr-11"
                style={{ background: "#0a0a12", border: "1px solid var(--border)", color: "var(--foreground)" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#555" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm px-4 py-3 rounded-xl" style={{ background: "rgba(255,70,85,0.1)", color: "var(--accent)", border: "1px solid rgba(255,70,85,0.2)" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="btn-primary flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm mt-2 disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
            {loading ? "Wird erstellt..." : "Account erstellen"}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--muted)" }}>
          Schon einen Account?{" "}
          <Link href="/auth/login" style={{ color: "var(--accent)" }} className="font-semibold">Anmelden</Link>
        </p>
      </motion.div>
    </main>
  )
}
