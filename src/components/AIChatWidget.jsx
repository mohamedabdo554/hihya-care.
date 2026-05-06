import { useMemo, useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Stethoscope } from 'lucide-react'
import { askHihyaAI, serializeDoctorsForAI } from './geminiService'

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
          ? `مرحباً! أنا مساعد Hihya-Care. اكتب أعراضك وأرشّحلك دكتور مناسب من ${doctorsForAi.length} دكتور على المنصة — مع تحليل أولي وتحذير طوارئ لو لزم. 🏥`
          : 'مرحباً! أنا مساعدك الطبي الذكي في Hihya-Care. اسأل عن أي أعراض وسأوجّهك بنبرة مصرية محترمة (أضف قائمة أطباء للترشيح التلقائي).',
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
      const botResponse = await askHihyaAI(currentInput, doctorsForAi, historyForModel)

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
    <div className="flex h-[500px] flex-col overflow-hidden rounded-2xl border border-cyan-400/25 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-[0_24px_60px_rgba(8,145,178,0.15)] backdrop-blur-xl">
      <div className="border-b border-cyan-400/20 bg-gradient-to-r from-cyan-500/15 via-violet-500/10 to-emerald-500/10 p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 leading-none">
            <Stethoscope className="block size-5 text-cyan-300" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <Sparkles className="size-4 text-cyan-300" aria-hidden />
              مساعد Hihya-Care الذكي
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-cyan-100/75">
              بروتوكول: تحليل → تحذير طوارئ → نصيحة → ترشيح دكتور واحد من المنصة → أهمية الاستشارة التليفونية.
              {doctorCount > 0 ? (
                <span className="mt-1 block font-medium text-emerald-200/90">متصل بـ {doctorCount} طبيب في القائمة.</span>
              ) : null}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.type === 'user'
                  ? 'rounded-br-md bg-gradient-to-r from-cyan-500 to-emerald-600 text-white shadow-lg'
                  : 'rounded-bl-md border border-cyan-400/20 bg-white/10 text-slate-100 shadow-inner'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading ? (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-cyan-400/20 bg-white/10 px-4 py-3 text-sm text-slate-200">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:120ms]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:240ms]" />
              </div>
            </div>
          </div>
        ) : null}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-cyan-400/20 bg-slate-950/80 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="اكتب أعراضك أو سؤالك هنا…"
            className="flex-1 rounded-xl border border-cyan-400/25 bg-white/10 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={isLoading || !inputText.trim()}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="إرسال"
          >
            <Send className="block size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}
