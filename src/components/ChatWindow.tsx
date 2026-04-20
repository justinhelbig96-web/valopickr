"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Match, Profile, Message } from "@/types/database"
import { getRankColor } from "@/lib/ranks"
import { ArrowLeft, Send, Copy, Check } from "lucide-react"

interface Props {
  match: Match
  partner: Profile
  myId: string
  onBack: () => void
}

function Avatar({ profile, size = 40 }: { profile: Profile; size?: number }) {
  const rankColor = getRankColor(profile.rank_tier ?? "iron")
  if (profile.avatar_url) {
    return (
      <img src={profile.avatar_url} alt={profile.display_name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size, border: `2px solid ${rankColor}50` }} />
    )
  }
  return (
    <div className="rounded-full flex items-center justify-center font-black flex-shrink-0"
      style={{ width: size, height: size, background: `${rankColor}25`, color: rankColor, border: `2px solid ${rankColor}40`, fontSize: size * 0.4 }}>
      {profile.display_name?.[0]?.toUpperCase() ?? "?"}
    </div>
  )
}

export default function ChatWindow({ match, partner, myId, onBack }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = useRef(createClient()).current
  const rankColor = getRankColor(partner.rank_tier ?? "iron")

  useEffect(() => {
    supabase
      .from("messages")
      .select("*")
      .eq("match_id", match.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages(data ?? [])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
      })

    const channel = supabase
      .channel(`chat:${match.id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${match.id}` },
        (payload) => {
          const newMsg = payload.new as Message
          // Eigene Nachrichten bereits optimistisch vorhanden, nur fremde hinzufügen
          if (newMsg.sender_id === myId) return
          setMessages((prev) => [...prev, newMsg])
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [match.id])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    const content = text.trim()
    setText("")

    // Optimistisch sofort anzeigen
    const optimisticMsg: Message = {
      id: `optimistic-${Date.now()}`,
      match_id: match.id,
      sender_id: myId,
      content,
      read: false,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)

    await supabase.from("messages").insert({ match_id: match.id, sender_id: myId, content })
    setSending(false)
    inputRef.current?.focus()
  }

  function copyDiscord() {
    if (!partner.discord_tag) return
    navigator.clipboard.writeText(partner.discord_tag)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Group messages by date
  const grouped: { date: string; msgs: Message[] }[] = []
  messages.forEach((msg) => {
    const d = new Date(msg.created_at).toLocaleDateString("de", { day: "2-digit", month: "short" })
    const last = grouped[grouped.length - 1]
    if (last?.date === d) last.msgs.push(msg)
    else grouped.push({ date: d, msgs: [msg] })
  })

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b sticky top-0 z-40 glass"
        style={{ borderColor: "var(--border)" }}>
        <button onClick={onBack} className="p-2 rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <ArrowLeft size={18} style={{ color: "#888" }} />
        </button>
        <Avatar profile={partner} size={40} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight truncate">{partner.display_name}</p>
          <p className="text-[11px] leading-tight" style={{ color: rankColor }}>{partner.rank ?? "Unranked"}</p>
        </div>
        {partner.discord_tag && (
          <button onClick={copyDiscord}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: copied ? "rgba(88,101,242,0.25)" : "rgba(88,101,242,0.12)", color: "#7289da", border: "1px solid rgba(88,101,242,0.3)" }}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Kopiert!" : partner.discord_tag}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1"
        style={{ background: "var(--background)" }}>

        {/* Match info card at top */}
        <div className="flex flex-col items-center py-6 mb-2">
          <Avatar profile={partner} size={72} />
          <p className="font-black text-base mt-3">{partner.display_name}</p>
          <span className="text-xs px-2 py-1 rounded-full mt-1 font-bold"
            style={{ background: `${rankColor}20`, color: rankColor }}>{partner.rank ?? "Unranked"}</span>
          <p className="text-xs mt-3 text-center max-w-[220px] leading-relaxed" style={{ color: "#555" }}>
            Ihr seid seit {new Date(match.created_at).toLocaleDateString("de", { day: "2-digit", month: "long" })} gematcht 🎯
          </p>
        </div>

        {grouped.map(({ date, msgs }) => (
          <div key={date}>
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              <span className="text-[10px] font-semibold px-2" style={{ color: "#444" }}>{date}</span>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>
            {msgs.map((msg, i) => {
              const isMe = msg.sender_id === myId
              const prev = msgs[i - 1]
              const showAvatar = !isMe && (!prev || prev.sender_id !== msg.sender_id)
              return (
                <div key={msg.id} className={`flex items-end gap-2 mb-1 ${isMe ? "justify-end" : "justify-start"}`}>
                  {!isMe && (
                    <div className="w-7 flex-shrink-0">
                      {showAvatar && <Avatar profile={partner} size={28} />}
                    </div>
                  )}
                  <div className="flex flex-col" style={{ maxWidth: "72%" }}>
                    <div className="px-4 py-2.5 text-sm"
                      style={isMe
                        ? { background: "var(--accent)", color: "#fff", borderRadius: "20px 20px 4px 20px" }
                        : { background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: "20px 20px 20px 4px" }
                      }>
                      {msg.content}
                    </div>
                    <span className={`text-[10px] mt-0.5 px-1 ${isMe ? "text-right" : "text-left"}`} style={{ color: "#444" }}>
                      {new Date(msg.created_at).toLocaleTimeString("de", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {messages.length === 0 && (
          <p className="text-center text-sm mt-4" style={{ color: "#555" }}>Schreib als Erstes! 👋</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend}
        className="flex items-center gap-3 px-4 py-3 border-t"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nachricht..."
          autoComplete="off"
          className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none"
          style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
        />
        <button type="submit" disabled={!text.trim() || sending}
          className="w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-30 transition-opacity flex-shrink-0"
          style={{ background: "var(--accent)" }}>
          <Send size={16} style={{ color: "#fff" }} />
        </button>
      </form>
    </div>
  )
}
