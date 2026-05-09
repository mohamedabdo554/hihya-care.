import { useMemo, useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Stethoscope } from 'lucide-react'
import { askHihyaAI, serializeDoctorsForAI } from './geminiService'

function isDuplicateResponse(prev: string, current: string): boolean {
  if (!prev || !current) return false
  const normalize = (s: string) => s.replace(/\s+/g, '').slice(0, 50)
  const similarity = (a: string, b: string) => {
    let matches = 0
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] === b[i]) matches++
    }
    return matches / Math.max(a.length, b.length)
  }
  return similarity(normalize(prev), normalize(current)) > 0.7
}

/**
 * @param {{ doctors?: Array<{ id?: string, name?: string, specialty?: string, price?: string | number, tele_consultation?: boolean, next_available_slot?: string | null }> }} props
 */
export default function AIChatWidget({ doctors = [] }) {
  const doctorsForAi = useMemo(
    () =>
      (doctors ?? []).map(d => ({
        id: d.id,
        name: d.name,
        specialty: d.specialty,
        price: d.price,
        tele_consultation: Boolean(d.tele_consultation),
        next_available_slot: d.next_available_slot ?? null,
      })),
    [doctors],
  )

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text:
        doctorsForAi.length > 0
          ? `مرحباً بك في Hihya-Care 👋 أنا دكتور شريف، استشاري الفرز الطبي. اكتب أعراضك وسأرشّح لك الدكتور المناسب من بين ${doctorsForAi.length} طبيب متخصص على المنصة — بتحليل دقيق واحترافية عالية.`
          : 'مرحباً بك في Hihya-Care 👋 أنا دكتور شريف، استشاري الفرز الطبي. صِف لي أعراضك وسأوجّهك للتخصص المناسب بنبرة راقية واحترافية.',
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputText.trim()) {
      return
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      timestamp: new Date(),
    }

    const historyForModel = [...messages, userMessage].slice(-10)
    setMessages(prev => [...prev, userMessage])
    const currentInput = inputText
    setInputText('')
    setIsLoading(true)

    try {
      let botResponse = await askHihyaAI(currentInput, doctorsForAi, historyForModel)

      // منع الرد المكرر — لو الرد الجديد مشابه جداً لآخر رد، نطلب رد جديد مختلف
      const lastBotMsg = messages.filter(m => m.type === 'bot').pop()
      if (lastBotMsg && isDuplicateResponse(lastBotMsg.text, botResponse)) {
        botResponse = await askHihyaAI(currentInput + ' (أرجوك رد مختلف تماماً عن السابق، صياغة جديدة كلياً)', doctorsForAi, historyForModel)
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: botResponse,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Chat Error:', error)
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          text:
            error instanceof Error
              ? error.message
              : 'حدث خطأ. تأكد من مفتاح VITE_GEMINI_API_KEY أو VITE_GROQ_API_KEY.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const doctorCount = doctorsForAi.length

  return (
    <div className="flex h-[500px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-[0_24px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      <div className="border-b border-white/10 bg-gradient-to-r from-cyan-500/15 via-violet-500/10 to-emerald-500/10 p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 leading-none">
            <Stethoscope className="block size-5 text-cyan-300" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <Sparkles className="size-4 text-cyan-300" aria-hidden />
              د. شريف — الفرز الطبي الذكي
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-cyan-100/75">
              تحليل ذكي · ترشيح دقيق · استشارة احترافية
              {doctorCount > 0 ? (
                <span className="mt-1 block font-medium text-emerald-200/90">🩺 {doctorCount} طبيب متاح للترشيح</span>
              ) : null}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-cyan-400/20">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.type === 'user'
                  ? 'rounded-br-sm bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'rounded-bl-sm border border-white/10 bg-gradient-to-r from-white/[0.07] to-white/[0.03] text-slate-100 shadow-[0_2px_12px_rgba(34,211,238,0.06)]'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading ? (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-gradient-to-r from-white/[0.07] to-white/[0.03] px-4 py-3 shadow-[0_2px_12px_rgba(34,211,238,0.06)]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:0ms]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:150ms]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:300ms]" />
                </div>
                <span className="text-xs text-slate-400">د. شريف يقرأ حالتك...</span>
              </div>
            </div>
          </div>
        ) : null}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/10 bg-gradient-to-r from-cyan-500/5 via-violet-500/5 to-emerald-500/5 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="اكتب أعراضك أو سؤالك هنا..."
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:bg-white/[0.08] focus:shadow-[0_0_20px_rgba(34,211,238,0.08)]"
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={isLoading || !inputText.trim()}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="إرسال"
          >
            <Send className="block size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}
