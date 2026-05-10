import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, AlertTriangle, Brain, CheckCircle2, Mic, MicOff, Send, Sparkles, Stethoscope, User } from 'lucide-react'
import { supabase } from '../../supabaseClient'

type SpeechRecognitionAPI = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionResultList = {
  length: number
  [index: number]: { [index: number]: { transcript: string; confidence: number }; isFinal: boolean }
}
type SpeechRecognitionConstructor = { new(): SpeechRecognitionAPI }

type TriageStage = 'idle' | 'asking_location' | 'asking_severity' | 'asking_duration' | 'analyzing' | 'result'

type Message = {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: number
}

type TriageResult = {
  summary: string
  severity: 'urgent' | 'routine' | 'consultation'
  specialty: string
  specialtyAr: string
  specialtyIcon: string
  emergency_alert: boolean
  recommendation_reason: string
  location: string
  duration: string
  severityNum: number
  doctorName: string
  doctorCode: string
  doctorId: string | null
  selfCareTips: string[]
}

const LOCATION_KEYWORDS: { keyword: string; location: string }[] = [
  { keyword: 'بطن', location: 'البطن' },
  { keyword: 'جنب', location: 'الجنب' },
  { keyword: 'صدر', location: 'الصدر' },
  { keyword: 'قلب', location: 'الصدر' },
  { keyword: 'راس', location: 'الرأس' },
  { keyword: 'رأس', location: 'الرأس' },
  { keyword: 'اسنان', location: 'الأسنان' },
  { keyword: 'سنة', location: 'الأسنان' },
  { keyword: 'ضرس', location: 'الأسنان' },
  { keyword: 'ظهر', location: 'الظهر' },
  { keyword: 'كتف', location: 'الكتف' },
  { keyword: 'رقبة', location: 'الرقبة' },
  { keyword: 'ركبة', location: 'الركبة' },
  { keyword: 'قدم', location: 'القدم' },
  { keyword: 'يد', location: 'اليد' },
  { keyword: 'حلق', location: 'الحلق' },
  { keyword: 'عين', location: 'العين' },
  { keyword: 'بول', location: 'البول' },
  { keyword: 'جلد', location: 'الجلد' },
  { keyword: 'جسم', location: 'الجلد' },
  { keyword: 'جسدي', location: 'الجلد' },
  { keyword: 'رجل', location: 'القدم' },
  { keyword: 'رجلي', location: 'القدم' },
  { keyword: 'أيدي', location: 'اليد' },
  { keyword: 'ايدي', location: 'اليد' },
]

const QUESTIONS: Record<string, string> = {
  idle: 'مرحباً أنا دكتور شريف. صف لي شكواك.',
  asking_location: 'فين المكان بالظبط؟',
  asking_severity: 'الشدة من 1 لـ 10 كام؟',
  asking_duration: 'من امتى الكلام دا؟',
}

const RED_FLAG_PATTERN = new RegExp(
  'ألم.*صدر|ضيق.*نفس|نزيف|إغماء|تشوش|فقدان.*وعي|صداع.*انفجار|ضعف.*مفاجئ|تعرق.*شديد|صعوبة.*تكلم|شلل|كحة.*دم|قيء.*دم',
  'i',
)

const LOCATION_SPECIALTY_MAP: Record<string, { specialty: string; specialtyAr: string; icon: string }> = {
  رأس: { specialty: 'Neurology', specialtyAr: 'مخ وأعصاب', icon: '🧠' },
  'الرأس': { specialty: 'Neurology', specialtyAr: 'مخ وأعصاب', icon: '🧠' },
  صدر: { specialty: 'Cardiology', specialtyAr: 'قلب وأوعية دموية', icon: '❤️' },
  قلب: { specialty: 'Cardiology', specialtyAr: 'قلب وأوعية دموية', icon: '❤️' },
  بطن: { specialty: 'Internal Medicine', specialtyAr: 'باطنة', icon: '🩺' },
  'البطن': { specialty: 'Internal Medicine', specialtyAr: 'باطنة', icon: '🩺' },
  اسنان: { specialty: 'Dentistry', specialtyAr: 'أسنان', icon: '🦷' },
  'الأسنان': { specialty: 'Dentistry', specialtyAr: 'أسنان', icon: '🦷' },
  ظهر: { specialty: 'Orthopedics', specialtyAr: 'عظام', icon: '🦴' },
  'الظهر': { specialty: 'Orthopedics', specialtyAr: 'عظام', icon: '🦴' },
  كتف: { specialty: 'Orthopedics', specialtyAr: 'عظام', icon: '🦴' },
  رقبة: { specialty: 'Orthopedics', specialtyAr: 'عظام', icon: '🦴' },
  قدم: { specialty: 'Orthopedics', specialtyAr: 'عظام', icon: '🦴' },
  يد: { specialty: 'Orthopedics', specialtyAr: 'عظام', icon: '🦴' },
  ركبة: { specialty: 'Orthopedics', specialtyAr: 'عظام', icon: '🦴' },
  بول: { specialty: 'Nephrology', specialtyAr: 'كلى ومسالك بولية', icon: '🫘' },
  جلد: { specialty: 'Dermatology', specialtyAr: 'جلدية', icon: '🧴' },
}

function extractLocation(text: string): string | null {
  const t = text.toLowerCase()
  for (const { keyword, location } of LOCATION_KEYWORDS) {
    if (t.includes(keyword)) return location
  }
  return null
}

const severityConfig = {
  urgent: { label: 'عاجل', className: 'border-rose-400/30 bg-rose-500/10 text-rose-200', icon: AlertTriangle },
  routine: { label: 'روتيني', className: 'border-amber-400/30 bg-amber-500/10 text-amber-200', icon: Activity },
  consultation: { label: 'استشارة', className: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200', icon: CheckCircle2 },
}

const loadingMessages = [
  'براجع الأعراض...',
  'بربطها بالتخصصات...',
  'بحلل الحالة...',
  'بجهّز التوصية الطبية...',
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
} as const

const thinkingDotVariants = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function safe(val: unknown, fb = ''): string {
  if (val == null) return fb
  if (typeof val === 'string') return val
  if (typeof val === 'number' || typeof val === 'boolean') return String(val)
  return fb
}

function getSelfCareTips(symptoms: string, location: string, specialty: string): string[] {
  const tips: string[] = []
  const t = symptoms.toLowerCase()
  const loc = location.toLowerCase()

  if (specialty === 'Internal Medicine' || loc.includes('بطن')) {
    tips.push('تجنب الأكل الدسم والمقلي')
    tips.push('اشرب سوائل دافئة ومياه كتير')
    if (t.includes('إسهال') || t.includes('اسهال')) tips.push('أكل خفيف زي رز وموز وجيلي')
    if (t.includes('مغص') || t.includes('وجع')) tips.push('كمية مياه دافية على البطن')
  } else if (specialty === 'Orthopedics' || loc.includes('ظهر') || loc.includes('كتف') || loc.includes('رقبة')) {
    tips.push('خفف الحركة على المنطقة المصابة')
    tips.push('كمادات باردة أول 24 ساعة')
    tips.push('نام في وضعية مريحة وميعدش على الأرض')
  } else if (specialty === 'Cardiology') {
    tips.push('لو الألم مستمر أو شديد اتجه للطوارئ فوراً')
    tips.push('خد قسط من الراحة ومتعملش مجهود')
  } else if (specialty === 'Dentistry' || loc.includes('سن') || loc.includes('ضرس')) {
    tips.push('مضادات التهاب متاحة بدون روشتة')
    tips.push('مأكلش حاجة سخنة ولا باردة جداً')
    tips.push('غرغرة بمية وملح')
  } else if (specialty === 'Dermatology') {
    tips.push('ما تحكش المنطقة عشان متزيدش الالتهاب')
    tips.push('بلّ الجلد بمية باردة عشان تهدي')
    tips.push('مرهم مرطب بسيط أو كورتيزون موضعي خفيف')
    tips.push('تجنب الصابون القوي او العطور على المنطقة')
    if (t.includes('حساسية')) tips.push('دوا حساسية (مضاد هستامين) ممكن يفيد')
    if (t.includes('حمراء') || t.includes('احمرار') || t.includes('نقاط')) tips.push('لو النقاط متزايدة أو في سخونية راجع طبيب جلدية')
  } else if (specialty === 'Neurology') {
    tips.push('ارتاح في مكان هادي')
    tips.push('لو الصداع مستمر خد مسكن بسيط')
  }

  if (!tips.length) {
    tips.push('خذ قسط من الراحة')
    tips.push('اشرب سوائل كافية')
  }

  return tips
}

const SYMPTOM_SPECIALTY_MAP: { keywords: string[]; specialty: string; specialtyAr: string; icon: string }[] = [
  { keywords: ['حمراء', 'حكة', 'طفح', 'بقع', 'نقاط', 'جلد', 'جلدي', 'حساسية', 'احمرار', 'هرش', 'شرية', 'التهاب'], specialty: 'Dermatology', specialtyAr: 'جلدية', icon: '🧴' },
  { keywords: ['سخونية', 'حرارة', 'برد', 'كحة', 'عطس', 'زور'], specialty: 'Internal Medicine', specialtyAr: 'باطنة', icon: '🩺' },
  { keywords: ['إسهال', 'اسهال', 'ترجيع', 'غثيان', 'مغص'], specialty: 'Internal Medicine', specialtyAr: 'باطنة', icon: '🩺' },
  { keywords: ['صدر', 'قلب', 'نهجان', 'نبض'], specialty: 'Cardiology', specialtyAr: 'قلب وأوعية دموية', icon: '❤️' },
]

function inferSpecialty(location: string, symptoms: string): { specialty: string; specialtyAr: string; icon: string } {
  const t = symptoms.toLowerCase()

  for (const group of SYMPTOM_SPECIALTY_MAP) {
    if (group.keywords.some(k => t.includes(k))) return { specialty: group.specialty, specialtyAr: group.specialtyAr, icon: group.icon }
  }

  const loc = location.trim()
  for (const [key, val] of Object.entries(LOCATION_SPECIALTY_MAP)) {
    if (loc.includes(key) || t.includes(key)) return val
  }
  if (RED_FLAG_PATTERN.test(t)) {
    return { specialty: 'Emergency', specialtyAr: 'طوارئ عامة', icon: '🚨' }
  }
  return { specialty: 'Internal Medicine', specialtyAr: 'باطنة', icon: '🩺' }
}

function fallbackTriage(
  symptoms: string,
  location: string,
  severityStr: string,
  duration: string,
): TriageResult {
  const s = parseInt(severityStr, 10) || 5
  const hasEmergency = RED_FLAG_PATTERN.test(symptoms) || s >= 9

  const spec = inferSpecialty(location, symptoms)

  let alert = hasEmergency
  let sev: TriageResult['severity'] = 'consultation'
  if (hasEmergency || s >= 9) sev = 'urgent'
  else if (s >= 7) sev = 'urgent'
  else if (s >= 4) sev = 'routine'

  const reason = hasEmergency
    ? 'يحتاج تدخل طبي فوري'
    : s >= 7
      ? 'شدة الأعراض عالية'
      : `الأعراض تناسب ${spec.specialtyAr}`

  return {
    summary: `${symptoms} في ${location}${duration ? ` من ${duration}` : ''} شدتها ${s}/10`,
    severity: sev,
    specialty: spec.specialty,
    specialtyAr: spec.specialtyAr,
    specialtyIcon: spec.icon,
    emergency_alert: alert,
    recommendation_reason: reason,
    location,
    duration,
    severityNum: s,
    doctorName: '',
    doctorCode: '',
    doctorId: null,
    selfCareTips: getSelfCareTips(symptoms, location, spec.specialty),
  }
}

function buildRecommendationText(r: TriageResult): string {
  const sevLabel = r.emergency_alert ? 'طوارئ' : r.severity === 'urgent' ? 'عاجل' : r.severity === 'routine' ? 'روتيني' : 'استشارة'
  let text = `التخصص المناسب: ${r.specialtyAr} (${sevLabel})`
  if (r.doctorName) {
    text += `\nأرشحلك: ${r.doctorName}${r.doctorCode ? ` — كود ${r.doctorCode}` : ''}`
  }
  if (r.selfCareTips.length) {
    text += `\n\nنصائح:\n${r.selfCareTips.map(t => `- ${t}`).join('\n')}`
  }
  if (r.emergency_alert) text += '\n⚠️ توجه للطوارئ فوراً'
  return text
}

export default function AITriageChat({ section }: { section?: string }) {
  const navigate = useNavigate()
  const isVet = section === 'veterinary'
  const [stage, setStage] = useState<TriageStage>('idle')
  const [symptoms, setSymptoms] = useState('')
  const [location, setLocation] = useState('')
  const [severity, setSeverity] = useState('')
  const [duration, setDuration] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [result, setResult] = useState<TriageResult | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [inputText, setInputText] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognitionAPI | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, stage])

  useEffect(() => {
    if (!isLoading) return
    const interval = setInterval(() => setLoadingStep((prev) => (prev + 1) % loadingMessages.length), 1200)
    return () => clearInterval(interval)
  }, [isLoading])

  const addMessage = useCallback((role: 'user' | 'assistant', text: string) => {
    setMessages((prev) => [...prev, { id: generateId(), role, text, timestamp: Date.now() }])
  }, [])

  const pushToSupabase = useCallback(async (r: TriageResult) => {
    try {
      const { error } = await supabase.from('triage_results').insert({
        symptoms, location, severity,
        duration,
        specialty: r.specialty,
        triage_severity: r.severity,
        emergency_alert: r.emergency_alert,
        summary: r.summary,
        recommendation_reason: r.recommendation_reason,
        created_at: new Date().toISOString(),
      })
      if (error && !/relation|schema/i.test(error.message)) console.warn('Supabase triage save skipped:', error.message)
    } catch { /* silent */ }
  }, [symptoms, location, severity, duration])

  const handleUserInput = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    addMessage('user', trimmed)
    setInputText('')

    if (stage === 'idle') {
      setSymptoms(trimmed)
      const loc = extractLocation(trimmed)
      if (loc) {
        setLocation(loc)
        addMessage('assistant', QUESTIONS.asking_severity)
        setStage('asking_severity')
      } else {
        addMessage('assistant', QUESTIONS.asking_location)
        setStage('asking_location')
      }
    } else if (stage === 'asking_location') {
      setLocation(trimmed)
      addMessage('assistant', QUESTIONS.asking_severity)
      setStage('asking_severity')
    } else if (stage === 'asking_severity') {
      setSeverity(trimmed)
      addMessage('assistant', QUESTIONS.asking_duration)
      setStage('asking_duration')
    } else if (stage === 'asking_duration') {
      setDuration(trimmed)

      setStage('analyzing')
      setIsLoading(true)

      let triageResult = fallbackTriage(symptoms, location, severity, trimmed)

      try {
        const { data: docs } = await supabase.from('doctors').select('id, name, secret_code, specialty, specialtyAr, price')
        if (docs?.length) {
          const match = docs.find((d: Record<string, unknown>) => {
            const specEn = String(d.specialty || '').toLowerCase()
            const specAr = String(d.specialtyAr || '').toLowerCase()
            return specEn.includes(triageResult.specialty.toLowerCase()) || specAr.includes(triageResult.specialtyAr) || specEn.includes('general')
          })
          if (match) {
            triageResult.doctorName = String(match.name || '')
            triageResult.doctorCode = String(match.secret_code || '')
            triageResult.doctorId = String(match.id || '')
          }
        }
      } catch { /* silent */ }

      await pushToSupabase(triageResult)

      setIsLoading(false)
      setResult(triageResult)
      setStage('result')

      addMessage('assistant', buildRecommendationText(triageResult))
    } else if (stage === 'analyzing') {
      addMessage('assistant', 'فضلاً انتظر.')
    }
  }, [stage, symptoms, location, severity, addMessage, pushToSupabase])

  const handleVoiceInput = useCallback(() => {
    const SR: SpeechRecognitionConstructor | undefined = (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition || (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition
    if (SR) {
      if (isListening && recognitionRef.current) { recognitionRef.current.stop(); setIsListening(false); return }
      const recognition = new SR()
      recognition.lang = 'ar-EG'
      recognition.continuous = false
      recognition.interimResults = false
      recognition.onresult = (event) => { setInputText(event.results[0][0].transcript); setIsListening(false) }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      recognitionRef.current = recognition
      recognition.start()
      setIsListening(true)
    } else {
      alert('التعرف على الصوت غير متاح في هذا المتصفح.')
    }
  }, [isListening])

  const restartTriage = () => {
    setStage('idle')
    setSymptoms('')
    setLocation('')
    setSeverity('')
    setDuration('')
    setMessages([])
    setResult(null)
    setInputText('')
    setIsLoading(false)
  }

  const sevConfig = result ? severityConfig[result.severity] : null

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.45em] text-violet-300/70">AI Triage</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl">المساعد الطبي الذكي</h1>
        <p className="mt-2 text-sm text-slate-400">د. شريف — تحليل ذكي وتوجيه للتخصص المناسب</p>
      </motion.div>

      {/* Main Chat Card */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
        {/* Chat Header */}
        <div className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-emerald-500/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-cyan-400">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4 text-violet-300" />
                دكتور شريف — الفرز الطبي الذكي
              </p>
              <p className="text-xs text-slate-400">بروتوكول 4 أسئلة · تحليل فوري · توجيه دقيق</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="h-[420px] space-y-3 overflow-y-auto p-6">
          <AnimatePresence mode="popLayout">
            {/* Greeting */}
            {stage === 'idle' && messages.length === 0 && (
              <motion.div key="greeting" variants={itemVariants} className={`rounded-2xl border px-5 py-4 text-sm leading-relaxed ${isVet ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100' : 'border-violet-400/20 bg-violet-500/10 text-violet-100'}`}>
                <p>{isVet ? 'أهلاً بك في قسم الحيوانات الأليفة، صف حالة أليفك (قط/كلب) وسأرشح لك العيادة المناسبة.' : 'صف لي شكواك وهسألك 3 أسئلة سريعة عشان أحدد التخصص المناسب.'}</p>
              </motion.div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.35, ease: 'easeOut' }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'rounded-br-md bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg' : 'rounded-bl-md border border-white/10 bg-white/[0.06] text-slate-200'}`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {/* Loading */}
            {isLoading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-violet-400/20 bg-violet-500/10 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div key={i} variants={thinkingDotVariants} animate="animate" className="h-2 w-2 rounded-full bg-violet-400" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                    <span className="text-xs text-violet-300">{loadingMessages[loadingStep]}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Severity Buttons */}
            {!isLoading && stage === 'asking_severity' && (
              <motion.div key="ask-severity" variants={itemVariants} className="space-y-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-5 py-4">
                <p className="text-sm text-amber-100">{QUESTIONS.asking_severity}</p>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button key={num} type="button" onClick={() => handleUserInput(num.toString())}
                      className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition ${severity === num.toString() ? 'border-amber-400/40 bg-amber-500/20 text-amber-100' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Duration Quick Buttons */}
            {!isLoading && stage === 'asking_duration' && (
              <motion.div key="ask-duration" variants={itemVariants} className="space-y-3 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-4">
                <p className="text-sm text-cyan-100">{QUESTIONS.asking_duration}</p>
                <div className="flex flex-wrap gap-2">
                  {['من يوم', 'من 2-3 أيام', 'من أسبوع', 'من أسبوعين', 'من شهر', 'أكثر من شهر'].map((opt) => (
                    <button key={opt} type="button" onClick={() => handleUserInput(opt)}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Result: Cinematic Summary Card */}
            {result && sevConfig && (
              <motion.div key="result" variants={itemVariants}>
                <div className="overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-violet-500/10 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                  {/* Specialty Hero */}
                  <div className="mb-4 flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 text-3xl">
                      {result.specialtyIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-white">{result.specialtyAr}</p>
                      <p className="text-xs text-slate-400">{result.specialty}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <sevConfig.icon className="h-4 w-4" />
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${sevConfig.className}`}>{sevConfig.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Alert */}
                  {result.emergency_alert && (
                    <div className="mb-3 flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200">
                      <AlertTriangle className="h-5 w-5 shrink-0" />
                      يجب التوجه إلى أقرب مستشفى فوراً
                    </div>
                  )}

                  {/* Clinical Summary */}
                  <div className="mb-4 space-y-2 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/70">ملخص الحالة</p>
                    <p className="text-sm leading-relaxed text-slate-200">{safe(result.summary)}</p>
                  </div>

                  {/* Data Grid */}
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    <DataChip icon={Stethoscope} label="الموقع" value={safe(result.location)} />
                    <DataChip icon={Activity} label="الشدة" value={`${result.severityNum}/10`} />
                    {result.duration ? <DataChip icon={Activity} label="المدة" value={safe(result.duration)} /> : null}
                    {result.doctorName ? <DataChip icon={User} label="الطبيب" value={result.doctorName} /> : null}
                  </div>

                  {/* Self-Care Tips */}
                  {result.selfCareTips.length > 0 && !result.emergency_alert && (
                    <div className="mb-4 rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-4">
                      <p className="text-xs font-semibold text-cyan-200 mb-2">نصائح للتعامل مع الحالة</p>
                      <ul className="space-y-1">
                        {result.selfCareTips.map((tip, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-cyan-400 mt-0.5">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Doctor Card */}
                  {result.doctorId && (
                    <div className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400">الطبيب المقترح</p>
                          <p className="text-sm font-semibold text-white mt-0.5">{result.doctorName}</p>
                          {result.doctorCode ? (
                            <p className="text-[11px] font-mono text-emerald-400/80 mt-0.5">كود: {result.doctorCode}</p>
                          ) : null}
                        </div>
                        <button type="button" onClick={() => navigate(`/book/${result.doctorId}`)}
                          className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110"
                        >
                          احجز موعد
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Recommendation Reason */}
                  {result.recommendation_reason && (
                    <div className="mb-4 rounded-xl border border-violet-400/20 bg-violet-500/5 p-3">
                      <p className="text-xs font-semibold text-violet-200">سبب الترشيح</p>
                      <p className="mt-1 text-xs text-slate-400">{safe(result.recommendation_reason)}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={restartTriage}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
                    >
                      تحليل حالة جديدة
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {stage !== 'result' && (
          <div className="border-t border-white/10 bg-black/20 p-4">
            {stage === 'idle' ? (
              <div className="flex gap-2">
                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUserInput(inputText)}
                  placeholder="اكتب الأعراض اللي بتعاني منها..."
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/40"
                  disabled={isLoading}
                />
                <button type="button" onClick={() => handleVoiceInput()}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${isListening ? 'border-rose-400/40 bg-rose-500/20 text-rose-300' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                  title={isListening ? 'إيقاف التسجيل' : 'تسجيل صوتي'}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <button type="button" onClick={() => handleUserInput(inputText)} disabled={isLoading || !inputText.trim()}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white transition hover:brightness-110 disabled:opacity-40"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            ) : stage === 'asking_location' ? (
              <div className="flex gap-2">
                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUserInput(inputText)}
                  placeholder="حدد مكان الأعراض..."
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/40"
                  disabled={isLoading}
                />
                <button type="button" onClick={() => handleVoiceInput()}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${isListening ? 'border-rose-400/40 bg-rose-500/20 text-rose-300' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <button type="button" onClick={() => handleUserInput(inputText)} disabled={isLoading || !inputText.trim()}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white transition hover:brightness-110 disabled:opacity-40"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Result Footer */}
        {stage === 'result' && (
          <div className="border-t border-white/10 bg-black/20 p-4 text-center">
            <button type="button" onClick={restartTriage}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/15 px-5 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/25"
            >
              <Activity className="h-4 w-4" />
              تحليل حالة جديدة
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function DataChip({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
      <Icon className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
        <p className="text-xs font-medium text-slate-200 truncate">{safe(value, '---')}</p>
      </div>
    </div>
  )
}
