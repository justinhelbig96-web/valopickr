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

export default function ChatWindow({ match, partner, myId, onBack }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    // Erste Nachrichten laden
    supabase
      .from("messages")
      .select("*")
      .eq("match_id", match.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages(data ?? [])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
      })

    // Realtime-Subscription
    const channel = supabase
      .channel(`chat:${match.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${match.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
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

    await supabase.from("messages").insert({
      match_id: match.id,
      sender_id: myId,
      content,
    })
    setSending(false)
  }

  function copyDiscord() {
    if (!partner.discord_tag) return
    navigator.clipboard.writeText(partner.discord_tag)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <button onClick={onBack}><ArrowLeft size={20} style={{ color: "#888" }} /></button>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-black"
          style={{
            background: `${getRankColor(partner.rank_tier ?? "iron")}30`,
            color: getRankColor(partner.rank_tier ?? "iron"),
          }}
        >
          {partner.display_name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm">{partner.display_name}</p>
          <p className="text-xs" style={{ color: "#888" }}>{partner.rank ?? "Unranked"}</p>
        </div>

        {/* Discord Tag */}
        {partner.discord_tag && (
          <button
            onClick={copyDiscord}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: "#5865F220", color: "#5865F2", border: "1px solid #5865F240" }}
            title="Discord Tag kopieren"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Kopiert!" : partner.discord_tag}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">👋</p>
            <p className="text-sm" style={{ color: "#888" }}>
              Ihr seid gematcht! Schreibt euch und tauscht euren Discord aus.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === myId
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm"
                style={
                  isMe
                    ? { background: "var(--accent)", color: "#fff", borderBottomRightRadius: "4px" }
                    : { background: "var(--card)", border: "1px solid var(--border)", borderBottomLeftRadius: "4px" }
                }
              >
                <p>{msg.content}</p>
                <p
                  className="text-xs mt-1"
                  style={{ color: isMe ? "rgba(255,255,255,0.6)" : "#555" }}
                >
                  {new Date(msg.created_at).toLocaleTimeString("de", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 px-4 py-4 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nachricht schreiben..."
          className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          }}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-40"
          style={{ background: "var(--accent)" }}
        >
          <Send size={18} style={{ color: "#fff" }} />
        </button>
      </form>
    </div>
  )
}
