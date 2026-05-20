"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Send, Sparkles, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

const QUICK_PROMPTS = [
  { label: "Beri analogi sehari-hari", prompt: "Tolong berikan analogi dari kehidupan sehari-hari agar konsep ini lebih mudah saya pahami." },
  { label: "Jelaskan untuk pemula", prompt: "Mohon jelaskan ulang dengan bahasa yang lebih sederhana, seolah-olah sedang menjelaskan kepada siswa SMP." },
  { label: "Mengapa opsi lain salah?", prompt: "Mohon bahas satu per satu mengapa opsi-opsi yang salah itu kurang tepat." },
  { label: "Berikan contoh kasus nyata", prompt: "Mohon berikan satu sampai dua contoh kasus nyata di Indonesia yang mencerminkan jawaban yang benar." },
] as const

interface TutorChatProps {
  attemptId: string
  questionId: string
  initialMessages: ChatMessage[]
  initialUserMsgCount: number
  maxUserMsgs: number
}

export function TutorChat({
  attemptId,
  questionId,
  initialMessages,
  initialUserMsgCount,
  maxUserMsgs,
}: TutorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [userMsgCount, setUserMsgCount] = useState(initialUserMsgCount)
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [showQuickPrompts, setShowQuickPrompts] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll on new content
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, isStreaming])

  const remaining = Math.max(0, maxUserMsgs - userMsgCount)
  const canSend = !isStreaming && remaining > 0

  const send = useCallback(
    async (rawPrompt: string) => {
      const prompt = rawPrompt.trim()
      if (!prompt || !canSend) return

      setError(null)
      setInput("")

      // Optimistic: append user message + empty assistant placeholder
      const userMsgId = `local_u_${Date.now()}`
      const assistantMsgId = `local_a_${Date.now()}`
      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: "user", content: prompt },
        { id: assistantMsgId, role: "assistant", content: "" },
      ])
      setUserMsgCount((c) => c + 1)
      setIsStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const resp = await fetch(`/api/explain/${questionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptId, prompt }),
          signal: controller.signal,
        })

        if (!resp.ok) {
          const errBody = await resp.json().catch(() => null)
          const msg = errBody?.error?.message ?? `HTTP ${resp.status}`
          setError(msg)
          // Remove the empty assistant placeholder + restore count if rejected
          setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId))
          if (resp.status === 429) {
            // limit reached — count is already accurate at server, sync
            setUserMsgCount(maxUserMsgs)
          } else {
            // server didn't accept; rollback the user msg too if it was 4xx pre-stream
            if (resp.status >= 400 && resp.status < 500) {
              setMessages((prev) => prev.filter((m) => m.id !== userMsgId))
              setUserMsgCount((c) => Math.max(0, c - 1))
            }
          }
          setIsStreaming(false)
          return
        }

        const reader = resp.body?.getReader()
        if (!reader) {
          setError("Stream tidak tersedia.")
          setIsStreaming(false)
          return
        }

        const decoder = new TextDecoder()
        let buffer = ""
        let acc = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const events = buffer.split(/\r?\n\r?\n/)
          buffer = events.pop() ?? ""
          for (const ev of events) {
            const dataLine = ev.split(/\r?\n/).find((l) => l.startsWith("data:"))
            if (!dataLine) continue
            const dataStr = dataLine.slice(5).trim()
            if (!dataStr || dataStr === "[DONE]") continue
            try {
              const json = JSON.parse(dataStr) as { delta?: string }
              if (json.delta) {
                acc += json.delta
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: acc } : m,
                  ),
                )
              }
            } catch {
              // ignore
            }
          }
        }

        if (!acc.trim()) {
          // Empty response — probably model issue, show fallback
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: "(Tutor lagi diem, coba pertanyaan lain.)" }
                : m,
            ),
          )
        }
      } catch (e: unknown) {
        if ((e as Error)?.name === "AbortError") {
          // User cancelled — keep partial response
        } else {
          console.error(e)
          setError("Gagal menghubungi Tutor. Coba lagi sebentar.")
        }
      } finally {
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [attemptId, questionId, canSend, maxUserMsgs],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void send(input)
  }

  const handleQuickPrompt = (prompt: string) => {
    void send(prompt)
  }

  return (
    <div className="flex flex-col h-full min-h-[60vh] rounded-2xl border border-border/60 bg-card/30 backdrop-blur overflow-hidden">
      {/* Header */}
      <div className="border-b border-border/40 px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-primary/15 border border-primary/30 inline-flex items-center justify-center">
            <Sparkles className="size-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Cita Tutor</h2>
            <p className="text-xs text-muted-foreground">
              Diskusi soal ini dengan AI
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {remaining}/{maxUserMsgs} pertanyaan tersisa
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-8 max-w-prose mx-auto">
            <Sparkles className="size-6 text-primary mx-auto mb-3" />
            <p className="font-medium text-foreground/90 mb-1">Tanya apa aja soal soal ini.</p>
            <p>Tutor udah tau soal, kunci, dan jawaban lo. Mulai dari prompt cepat di bawah, atau ketik pertanyaan sendiri.</p>
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} content={m.content} />
        ))}

        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pl-11">
            <PulseDots />
            <span>Tutor lagi mikir...</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-md px-3 py-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Quick prompts (visible if room left & not closed) */}
      {remaining > 0 && showQuickPrompts && (
        <div className="border-t border-border/40 px-5 py-3 relative">
          <div className="flex items-start justify-between gap-3 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
              Saran pertanyaan
            </span>
            <button
              type="button"
              onClick={() => setShowQuickPrompts(false)}
              aria-label="Tutup saran pertanyaan"
              className="text-muted-foreground/60 hover:text-foreground transition-colors -mr-1 -mt-1 p-1 rounded hover:bg-accent/40"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.label}
                type="button"
                onClick={() => handleQuickPrompt(qp.prompt)}
                disabled={!canSend}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border transition-colors",
                  "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-accent/50",
                  "disabled:opacity-50 disabled:pointer-events-none",
                )}
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-border/40 px-5 py-4 flex items-end gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              void send(input)
            }
          }}
          placeholder={
            remaining > 0
              ? "Tanya apa aja... (Enter buat kirim, Shift+Enter buat baris baru)"
              : "Batas pertanyaan tercapai. Lanjut ke soal lain ya."
          }
          maxLength={500}
          rows={1}
          disabled={!canSend}
          className={cn(
            "flex-1 bg-transparent border border-border/60 rounded-lg px-3 py-2 text-sm",
            "resize-none max-h-32 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20",
            "disabled:opacity-50 placeholder:text-muted-foreground/70",
          )}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!canSend || !input.trim()}
          className="shrink-0"
        >
          <Send className="size-4" />
          <span className="hidden sm:inline ml-1">Kirim</span>
        </Button>
      </form>
    </div>
  )
}

function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user"
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "size-8 rounded-full inline-flex items-center justify-center shrink-0 text-xs font-semibold",
          isUser
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary/15 border border-primary/30 text-primary",
        )}
      >
        {isUser ? "Lo" : <Sparkles className="size-4" />}
      </div>
      <div
        className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap",
          isUser
            ? "bg-primary/10 border border-primary/20 text-foreground"
            : "bg-muted/30 border border-border/40 text-foreground/90",
        )}
      >
        {content || "..."}
      </div>
    </div>
  )
}

function PulseDots() {
  return (
    <span className="inline-flex gap-1">
      <span className="size-1.5 bg-current rounded-full animate-pulse [animation-delay:-0.3s]" />
      <span className="size-1.5 bg-current rounded-full animate-pulse [animation-delay:-0.15s]" />
      <span className="size-1.5 bg-current rounded-full animate-pulse" />
    </span>
  )
}
