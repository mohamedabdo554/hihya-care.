import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Clock3,
  DollarSign,
  FileText,
  HeartPulse,
  Loader2,
  Menu,
  MessageCircle,
  PhoneCall,
  ScanLine,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
  TrendingUp,
  TriangleAlert,
  Users,
  UserRound,
  X,
  XCircle,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { supabase } from '../../supabaseClient'
import { ErrorBoundary } from '../ErrorBoundary'
import { useTriage } from '../../context/TriageContext'
import PrescriptionModal from '../PrescriptionModal'

type Appointment = {
  id: string
  patient_name: string
  patient_phone: string
  appointment_date: string
  appointment_time: string
  status: 'booked' | 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'pharmacy'
}

type DoctorProfile = {
  id: string
  name: string
  specialty: string
  phone_number: string
  clinic_status: 'open' | 'break' | 'closed'
}

type EhrNote = {
  id: string
  date: string
  doctorNotes: string
  diagnosis: string
  prescription: string
}

const DEMO_DOCTOR: DoctorProfile = {
  id: 'demo-dr',
  name: 'أحمد علي',
  specialty: 'قلب وأوعية دموية',
  phone_number: '201234567890',
  clinic_status: 'open',
}

const DEMO_APPOINTMENTS: Appointment[] = [
  { id: 'a1', patient_name: 'مريم حسن', patient_phone: '201001234567', appointment_date: new Date().toISOString().slice(0, 10), appointment_time: '09:00', status: 'completed' },
  { id: 'a2', patient_name: 'خالد عمر', patient_phone: '201009876543', appointment_date: new Date().toISOString().slice(0, 10), appointment_time: '09:30', status: 'in_progress' },
  { id: 'a3', patient_name: 'سارة محمود', patient_phone: '201005551234', appointment_date: new Date().toISOString().slice(0, 10), appointment_time: '10:00', status: 'waiting' },
  { id: 'a4', patient_name: 'أحمد عبد الله', patient_phone: '201003332211', appointment_date: new Date().toISOString().slice(0, 10), appointment_time: '10:30', status: 'waiting' },
  { id: 'a5', patient_name: 'نورة يوسف', patient_phone: '201007778899', appointment_date: new Date().toISOString().slice(0, 10), appointment_time: '11:00', status: 'booked' },
  { id: 'a6', patient_name: 'محمود علي', patient_phone: '201004445566', appointment_date: new Date().toISOString().slice(0, 10), appointment_time: '11:30', status: 'booked' },
  { id: 'a7', patient_name: 'فاطمة أحمد', patient_phone: '201001112233', appointment_date: new Date().toISOString().slice(0, 10), appointment_time: '12:00', status: 'booked' },
  { id: 'a8', patient_name: 'يوسف إبراهيم', patient_phone: '201007776655', appointment_date: new Date().toISOString().slice(0, 10), appointment_time: '13:00', status: 'cancelled' },
]

const DEMO_EHR: Record<string, EhrNote[]> = {
  'a1': [{ id: 'e1', date: '2026-04-15', doctorNotes: 'شكوى من صداع نصفي منذ أسبوع. تم صرف مسكن.', diagnosis: 'صداع نصفي', prescription: 'بنادول extra 500mg' }],
  'a2': [{ id: 'e2', date: '2026-04-10', doctorNotes: 'متابعة ضغط الدم. القراءة 130/85. جرعة الدواء مناسبة.', diagnosis: 'ارتفاع ضغط الدم', prescription: 'كابتوبريل 25mg' }],
  'a3': [{ id: 'e3', date: '2026-03-20', doctorNotes: 'آلام في المفاصل. تحاليل مطلوبة.', diagnosis: 'التهاب مفاصل', prescription: 'بروفين 400mg' }],
}

const MONTHLY_REVENUE = [
  { month: 'نوفمبر', revenue: 28500, target: 30000, patients: 42 },
  { month: 'ديسمبر', revenue: 32200, target: 30000, patients: 48 },
  { month: 'يناير', revenue: 25800, target: 32000, patients: 38 },
  { month: 'فبراير', revenue: 34100, target: 32000, patients: 51 },
  { month: 'مارس', revenue: 41800, target: 35000, patients: 63 },
  { month: 'إبريل', revenue: 39200, target: 38000, patients: 58 },
]

const DIAGNOSIS_DATA = [
  { name: 'ضغط الدم', value: 28, color: '#22d3ee' },
  { name: 'السكري', value: 22, color: '#10b981' },
  { name: 'التهاب مفاصل', value: 15, color: '#f59e0b' },
  { name: 'الصداع النصفي', value: 18, color: '#8b5cf6' },
  { name: 'حساسية صدرية', value: 12, color: '#ef4444' },
  { name: 'أخرى', value: 5, color: '#64748b' },
]

const PATIENT_INFLOW = [
  { hour: '8ص', patients: 2 }, { hour: '9ص', patients: 5 }, { hour: '10ص', patients: 8 },
  { hour: '11ص', patients: 7 }, { hour: '12م', patients: 6 }, { hour: '1م', patients: 3 },
  { hour: '2م', patients: 4 }, { hour: '3م', patients: 6 }, { hour: '4م', patients: 9 },
  { hour: '5م', patients: 7 }, { hour: '6م', patients: 4 }, { hour: '7م', patients: 2 },
]

const MISSING_PATIENTS = [
  { id: 'mp1', name: 'شيماء محمد', phone: '201005551122', missedDate: '2026-04-15', lastStatus: 'no_show' },
  { id: 'mp2', name: 'عبد الرحمن سعيد', phone: '201003334455', missedDate: '2026-04-14', lastStatus: 'cancelled' },
  { id: 'mp3', name: 'هند جمال', phone: '201007778866', missedDate: '2026-04-12', lastStatus: 'no_show' },
]

const EXPENSE_DATA = {
  rent: 8500,
  electricity: 1800,
  water: 400,
  supplies: 3200,
  staff: 12000,
  maintenance: 1500,
  other: 2000,
}

const MONTHLY_EXPENSES_TOTAL = Object.values(EXPENSE_DATA).reduce((a, b) => a + b, 0)

const CLINIC_STATUS_OPTIONS = [
  { value: 'open', label: 'تعمل', icon: Activity },
  { value: 'break', label: 'استراحة', icon: Clock3 },
  { value: 'closed', label: 'مغلقة', icon: XCircle },
] as const

const statusConfig: Record<string, { label: string; className: string; order: number }> = {
  booked: { label: 'محجوز', className: 'border-cyan-300/30 bg-cyan-500/10 text-cyan-200', order: 0 },
  waiting: { label: 'في الانتظار', className: 'border-amber-300/30 bg-amber-500/10 text-amber-200', order: 1 },
  in_progress: { label: 'مع الطبيب', className: 'border-blue-300/30 bg-blue-500/10 text-blue-200', order: 2 },
  pharmacy: { label: 'صيدلية', className: 'border-violet-300/30 bg-violet-500/10 text-violet-200', order: 3 },
  completed: { label: 'تم', className: 'border-emerald-300/30 bg-emerald-500/10 text-emerald-200', order: 4 },
  cancelled: { label: 'ملغي', className: 'border-rose-300/30 bg-rose-500/10 text-rose-200', order: -1 },
  no_show: { label: 'غائب', className: 'border-slate-400/30 bg-slate-500/10 text-slate-200', order: -1 },
}

const STATUS_CYCLE: Appointment['status'][] = ['booked', 'waiting', 'in_progress', 'pharmacy', 'completed']

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
} as const

function startOfTodayISO(): string {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString()
}

function endOfTodayISO(): string {
  const d = new Date(); d.setHours(23, 59, 59, 999); return d.toISOString()
}

function normalizePhoneForWa(phone: string): string {
  return phone.replace(/[^\d]/g, '')
}

function openWhatsApp(phone: string, message: string) {
  const n = normalizePhoneForWa(phone)
  if (n) window.open(`https://wa.me/${n}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
}

const DELAY_TEMPLATES = [
  { delay: 10, label: '١٠ دقائق', msg: (p: string, d: string) => `السلام عليكم ${p} 🌿 موعدك مع د. ${d} اتأخر ١٠ دقائق. نشكر تفهمك.` },
  { delay: 15, label: '١٥ دقيقة', msg: (p: string, d: string) => `أهلاً ${p} 🌿 د. ${d} اعتذر عن التأخير ١٥ دقيقة. هنتشرف بيك قريباً.` },
  { delay: 30, label: '٣٠ دقيقة', msg: (p: string, d: string) => `عذراً ${p} 🌿 الموعد مع د. ${d} اتأخر نصف ساعة. شكراً لسعة صدرك.` },
  { delay: 45, label: '٤٥ دقيقة', msg: (p: string, d: string) => `${p} المحترم/ة 🌿 نأسف للتأخير. د. ${d} سينهي الحالة الحالية بعد ٤٥ دقيقة تقريباً.` },
]

function safePrimitive(val: unknown): string {
  if (val === null || val === undefined) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'number' || typeof val === 'boolean') return String(val)
  return ''
}

function safeString(val: unknown, fallback = ''): string {
  const s = safePrimitive(val)
  return s || fallback
}

type TriageEntry = {
  id: string
  symptoms: string
  duration: string
  severity: string
  specialty: string
  triage_severity: 'urgent' | 'routine' | 'consultation'
  emergency_alert: boolean
  summary: string
  created_at: string
}

export function DoctorDashboard() {
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [triageEntries, setTriageEntries] = useState<TriageEntry[]>([])
  const { entries: contextTriageEntries } = useTriage()
  const [bootLoading, setBootLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ehrPatient, setEhrPatient] = useState<Appointment | null>(null)
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [prescriptionModal, setPrescriptionModal] = useState<{ open: boolean; appointment: Appointment | null }>({ open: false, appointment: null })
  const [delayModal, setDelayModal] = useState<{ open: boolean; appointment: Appointment | null }>({ open: false, appointment: null })
  const [, setDelayMinutes] = useState(15)

  const loadData = useCallback(async () => {
    setBootLoading(true); setError('')
    const { data: authData } = await supabase.auth.getUser()
    const currentUser = authData?.user
    if (!currentUser) { setIsDemo(true); setDoctor(DEMO_DOCTOR); setAppointments(DEMO_APPOINTMENTS); setBootLoading(false); return }

    const { data: doctorRow } = await supabase.from('doctors').select('id, name, specialty, phone_number, clinic_status').eq('user_id', currentUser.id).maybeSingle()
    if (!doctorRow?.id) { setIsDemo(true); setDoctor(DEMO_DOCTOR); setAppointments(DEMO_APPOINTMENTS); setBootLoading(false); return }

    setDoctor({ id: String(doctorRow.id), name: String(doctorRow.name ?? 'الدكتور'), specialty: String(doctorRow.specialty ?? ''), phone_number: String(doctorRow.phone_number ?? ''), clinic_status: (doctorRow.clinic_status as DoctorProfile['clinic_status']) || 'open' })

    const { data: apptsRows } = await supabase.from('appointments').select('id, patient_name, patient_phone, appointment_date, appointment_time, status').eq('doctor_id', doctorRow.id).gte('appointment_date', startOfTodayISO()).lte('appointment_date', endOfTodayISO()).order('appointment_date', { ascending: true })
    setAppointments((apptsRows ?? []) as Appointment[])

    const { data: triageRows } = await supabase.from('triage_results').select('*').order('created_at', { ascending: false }).limit(20)
    if (triageRows && Array.isArray(triageRows)) setTriageEntries(triageRows as TriageEntry[])

    setBootLoading(false)
  }, [])

  useEffect(() => { void loadData() }, [loadData])

  useEffect(() => {
    if (!doctor?.id || isDemo) return
    const channel = supabase.channel(`doctor-dashboard-${doctor.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `doctor_id=eq.${doctor.id}` }, (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        const row = (payload.new || payload.old) as Record<string, unknown>
        if (!row?.appointment_date) return
        const d = new Date(row.appointment_date as string); const s = new Date(startOfTodayISO()); const e = new Date(endOfTodayISO())
        if (d < s || d > e) return
        if (payload.eventType === 'INSERT') setAppointments((prev) => [...prev, payload.new as Appointment].sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()))
        else if (payload.eventType === 'UPDATE') setAppointments((prev) => prev.map((item) => (item.id === (payload.new as Appointment).id ? (payload.new as Appointment) : item)))
        else if (payload.eventType === 'DELETE') setAppointments((prev) => prev.filter((item) => item.id !== (payload.old as Appointment).id))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'triage_results' }, (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        const row = payload.new as Record<string, unknown>
        if (row && row.id) { setTriageEntries((prev) => [row as TriageEntry, ...prev].slice(0, 20)); setToast('تقييم ذكي جديد من المساعد الطبي') }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [doctor?.id, isDemo])

  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(''), 2800); return () => window.clearTimeout(t) }, [toast])

  const sortedByStatus = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const orderA = statusConfig[a.status]?.order ?? 99
      const orderB = statusConfig[b.status]?.order ?? 99
      if (orderA !== orderB) return orderA - orderB
      return (a.appointment_time || '').localeCompare(b.appointment_time || '')
    })
  }, [appointments])

  const stats = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10)
    const today = appointments.filter((a) => a.appointment_date?.slice(0, 10) === todayKey).length
    const waiting = appointments.filter((a) => a.status === 'waiting').length
    const withDoctor = appointments.filter((a) => a.status === 'in_progress').length
    const completed = appointments.filter((a) => a.status === 'completed').length
    const pharmacy = appointments.filter((a) => a.status === 'pharmacy').length
    const cancelled = appointments.filter((a) => a.status === 'cancelled').length
    const noShow = appointments.filter((a) => a.status === 'no_show').length
    const totalPatients = appointments.length
    const satisfactionRate = totalPatients > 0 ? Math.round((completed / totalPatients) * 100) : 98
    const monthlyRevenue = 41800; const todayRevenue = completed * 350; const pendingPayments = (waiting + withDoctor) * 350
    return { today, waiting, withDoctor, completed, pharmacy, cancelled, noShow, booked: appointments.filter(a => a.status === 'booked').length, total: totalPatients, satisfactionRate, monthlyRevenue, todayRevenue, pendingPayments }
  }, [appointments])

  const mergedTriageEntries = useMemo(() => {
    const ctxIds = new Set(contextTriageEntries.map((e) => e.id))
    const merged = [...contextTriageEntries, ...triageEntries.filter((e) => !ctxIds.has(e.id))]
    return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [contextTriageEntries, triageEntries])

  const cycleStatus = useCallback((appointment: Appointment) => {
    const currentIdx = STATUS_CYCLE.indexOf(appointment.status)
    const nextStatus = currentIdx >= 0 && currentIdx < STATUS_CYCLE.length - 1 ? STATUS_CYCLE[currentIdx + 1] : 'completed'
    void updateAppointmentStatus(appointment.id, nextStatus)
  }, [])

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    setActionLoading(true); setError('')
    try { if (!isDemo) { const { error: ue } = await supabase.from('appointments').update({ status }).eq('id', id); if (ue) throw ue } setAppointments((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item))); setToast(`تم تحديث الحالة`) } catch (err) { setError(err instanceof Error ? err.message : 'فشل التحديث') } finally { setActionLoading(false) }
  }

  const sendDelayAlert = useCallback((appointment: Appointment, delayMin: number) => {
    if (!doctor) return
    const msg = `السلام عليكم 🌿 نأسف للتأخير. د. ${doctor.name} يعتذر عن التأخير ${delayMin} دقيقة. نشكر تفهمك.`
    openWhatsApp(appointment.patient_phone, msg)

    const waitingPatients = sortedByStatus.filter(a => a.status === 'waiting' || a.status === 'booked').slice(0, 3)
    waitingPatients.forEach((p) => {
      if (p.id !== appointment.id) {
        setTimeout(() => {
          openWhatsApp(p.patient_phone, msg)
        }, 500)
      }
    })
    setToast(`تم إرسال إشعار تأخير ${delayMin} دقيقة إلى ${waitingPatients.length} مرضى`)
  }, [doctor, sortedByStatus])

  const sendPostVisit = useCallback((appointment: Appointment) => {
    if (!doctor) return
    const instructions = `أهلاً ${appointment.patient_name} 🌿\nنشكرك على زيارتك لعيادة د. ${doctor.name} اليوم.\n\nتعليمات ما بعد الكشف:\n- الالتزام بالجرعات المحددة\n- مراجعة الطبيب في الميعاد القادم\n- للاستفسار: تواصل مع العيادة\n\nمع تمنياتنا بالشفاء العاجل ❤️`
    openWhatsApp(appointment.patient_phone, instructions)
    setToast(`تم إرسال تعليمات ما بعد الكشف إلى ${appointment.patient_name}`)
  }, [doctor])

  const handleEmergencyMode = useCallback(() => {
    const newState = !emergencyMode
    setEmergencyMode(newState)
    if (newState) {
      const msg = `عذراً 🌿 هناك حالة طارئة في العيادة. سيتم تأجيل المواعيد وإعادة جدولتها. شكراً لتفهمكم.`
      sortedByStatus.filter(a => a.status === 'booked' || a.status === 'waiting').forEach((p) => {
        setTimeout(() => openWhatsApp(p.patient_phone, msg), 200)
      })
      setToast('⚠️ تم تفعيل وضع الطوارئ — تم إشعار جميع المرضى')
    } else {
      setToast('تم إلغاء وضع الطوارئ — استئناف العمل كالمعتاد')
    }
  }, [emergencyMode, sortedByStatus])

  const handleClinicStatusChange = async (nextStatus: DoctorProfile['clinic_status']) => {
    if (!doctor?.id) return; setActionLoading(true); setError('')
    try { if (!isDemo) await supabase.from('doctors').update({ clinic_status: nextStatus }).eq('id', doctor.id); setDoctor((prev) => (prev ? { ...prev, clinic_status: nextStatus } : prev)); setToast('تم تحديث حالة العيادة') } catch { setError('فشل التحديث') } finally { setActionLoading(false) }
  }

  if (bootLoading) return <LoadingScreen />
  if (!doctor) return <NoDoctorScreen />

  return (
    <ErrorBoundary>
      <div className={`flex min-h-screen bg-[#020617] text-slate-100 transition-all duration-500 ${emergencyMode ? 'ring-4 ring-inset ring-rose-500/30' : ''}`} dir="rtl">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="absolute right-10 top-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed right-4 top-4 z-50 rounded-xl border border-white/10 bg-white/10 p-2 backdrop-blur-2xl lg:hidden">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 right-0 z-40 w-64 border-l border-white/10 bg-[#0a0f2a]/90 backdrop-blur-2xl transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex h-full flex-col p-5">
            <div className="mb-8 flex items-center gap-3 border-b border-white/10 pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-sm font-bold text-slate-900">H</div>
              <div><p className="text-sm font-semibold text-white">Hihya Care</p><p className="text-xs text-slate-400">مركز التحكم</p></div>
            </div>

            <nav className="flex-1 space-y-1">
              {[
                { id: 'pulse', label: 'النبض المباشر', icon: HeartPulse },
                { id: 'analytics', label: 'التحليلات', icon: BarChart3 },
              ].map((item) => (
                <button key={item.id} type="button" onClick={() => { setSidebarOpen(false) }} className="flex w-full items-center gap-3 rounded-xl bg-cyan-500/10 text-cyan-200 border border-cyan-400/20 px-4 py-3 text-sm font-medium">
                  <item.icon className="h-4 w-4" />{item.label}
                </button>
              ))}
            </nav>

            {/* Emergency Mode */}
            <button type="button" onClick={handleEmergencyMode} className={`mb-3 flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition ${emergencyMode ? 'border-rose-400/40 bg-rose-500/20 text-rose-200' : 'border-rose-400/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'}`}>
              <TriangleAlert className={`h-5 w-5 ${emergencyMode ? 'animate-pulse' : ''}`} />
              {emergencyMode ? 'إلغاء الطوارئ' : '⚠️ وضع الطوارئ'}
            </button>

            {/* Clinic Status */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">حالة العيادة</p>
              <div className="flex flex-col gap-1.5">
                {CLINIC_STATUS_OPTIONS.map((option) => (
                  <button key={option.value} type="button" onClick={() => handleClinicStatusChange(option.value)} disabled={actionLoading} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${doctor.clinic_status === option.value ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-400/25' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
                    <option.icon className={`h-4 w-4 ${option.value === 'open' ? 'text-emerald-400' : option.value === 'break' ? 'text-amber-400' : 'text-rose-400'}`} />{option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 text-xs font-bold text-slate-900">{safeString(doctor.name?.charAt(0) || '?', '?')}</div>
              <div className="flex-1 min-w-0"><p className="truncate text-sm font-semibold text-white">{safeString(doctor.name, 'الطبيب')}</p><p className="truncate text-xs text-slate-400">{safeString(doctor.specialty, 'طبيب')}</p></div>
            </div>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main */}
        <motion.main variants={containerVariants} initial="hidden" animate="show" className="relative flex-1 space-y-6 overflow-x-hidden p-4 pb-24 sm:p-6 lg:p-8">
          <AnimatePresence>{toast ? <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-medium text-emerald-200 backdrop-blur-xl">{toast}</motion.div> : null}</AnimatePresence>
          {error ? <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-5 py-3 text-sm text-rose-200 backdrop-blur-xl">{error}</motion.div> : null}
          {isDemo ? <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-3 text-sm text-amber-200 backdrop-blur-xl">⚡ وضع العرض التجريبي</motion.div> : null}
          {emergencyMode ? <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-rose-400/40 bg-rose-500/15 px-5 py-3 text-sm font-semibold text-rose-200 backdrop-blur-xl animate-pulse">🚨 وضع الطوارئ مفعل — تم إشعار جميع المرضى</motion.div> : null}

          <motion.header variants={itemVariants}>
            <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/70">Hihya Care</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl">مركز التحكم</h1>
            <p className="mt-1 text-sm text-slate-400">{safeString(doctor.name, 'الطبيب')} · {safeString(doctor.specialty, 'طبيب')}</p>
          </motion.header>

          {/* Stats */}
          <motion.section variants={itemVariants} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={DollarSign} label="الإيرادات الشهرية" value={`${stats.monthlyRevenue.toLocaleString()} ج.م`} sub="آخر 30 يوماً" accent="border-emerald-400/30" />
            <StatCard icon={Smile} label="رضا المرضى" value={`${stats.satisfactionRate}%`} sub={`${stats.completed} مكتمل`} accent="border-cyan-400/30" />
            <StatCard icon={CalendarDays} label="مواعيد اليوم" value={String(stats.today)} sub={`${stats.waiting} انتظار · ${stats.withDoctor} مع الطبيب`} accent="border-violet-400/30" />
            <StatCard icon={TrendingUp} label="وارد اليوم" value={`${stats.todayRevenue.toLocaleString()} ج.م`} sub={`${stats.pendingPayments.toLocaleString()} ج.م معلقة`} accent="border-amber-400/30" />
          </motion.section>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-cyan-400" /><span className="text-slate-400">الحضور:</span><span className="font-semibold text-white">{stats.completed}</span></div>
            <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-amber-400" /><span className="text-slate-400">انتظار:</span><span className="font-semibold text-amber-300">{stats.waiting}</span></div>
            <div className="flex items-center gap-2 text-sm"><ScanLine className="h-4 w-4 text-blue-400" /><span className="text-slate-400">مع الطبيب:</span><span className="font-semibold text-blue-300">{stats.withDoctor}</span></div>
            <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-400" /><span className="text-slate-400">الإنجاز:</span><span className="font-semibold text-emerald-300">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span></div>
            <div className="flex items-center gap-2 text-sm"><XCircle className="h-4 w-4 text-rose-400" /><span className="text-slate-400">غائب:</span><span className="font-semibold text-rose-300">{stats.noShow}</span></div>
          </motion.div>

          {/* Main Grid */}
          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            {/* Live Pulse */}
            <motion.section variants={itemVariants}>
              <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-white"><HeartPulse className="h-5 w-5 text-rose-400" />النبض المباشر</h2>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200"><Activity className="h-3.5 w-3.5" />Real-time</span>
                </div>

                {sortedByStatus.length === 0 && mergedTriageEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16"><CalendarCheck className="mb-4 h-16 w-16 text-slate-600" /><p className="text-lg font-semibold text-slate-300">لا توجد بيانات اليوم</p></div>
                ) : (
                  <div className="space-y-3">
                    {/* Triage entries — AI summaries */}
                    {mergedTriageEntries.map((entry) => {
                      const sevLabel = entry.triage_severity === 'urgent' ? 'عاجل' : entry.triage_severity === 'routine' ? 'روتيني' : 'استشارة'
                      const sevCls = entry.triage_severity === 'urgent' ? 'text-rose-300 border-rose-400/30 bg-rose-500/10' : entry.triage_severity === 'routine' ? 'text-amber-300 border-amber-400/30 bg-amber-500/10' : 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10'
                      return (
                        <motion.div key={entry.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="group rounded-2xl border border-violet-400/20 bg-violet-500/[0.04] p-4 transition hover:border-violet-400/30 hover:bg-violet-500/[0.07]">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400/20 to-cyan-400/20"><Stethoscope className="h-5 w-5 text-violet-300" /></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-white">{safeString(entry.symptoms, 'تقييم ذكي')}</p>
                                <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-medium text-violet-300 border border-violet-400/20">
                                  <Sparkles className="h-3 w-3" />AI
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-slate-400">{safeString(entry.specialty, '')} <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${sevCls}`}>{sevLabel}</span></p>
                              {entry.emergency_alert && <p className="mt-1 text-xs font-semibold text-rose-400">⚠️ تحذير طوارئ</p>}
                              <p className="mt-1 text-xs text-slate-500 line-clamp-2">{safeString(entry.summary, '')}</p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}

                    {sortedByStatus.map((appointment) => {
                      const aiSummary = mergedTriageEntries.find(e =>
                        e.symptoms?.toLowerCase().includes(appointment.patient_name?.toLowerCase() || '') ||
                        false
                      )
                      return (
                      <motion.div key={appointment.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.07]">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/20"><UserRound className="h-5 w-5 text-cyan-300" /></div>
                            <div>
                              <p className="font-semibold text-white">{safeString(appointment.patient_name, 'مريض')}</p>
                              <p className="mt-0.5 text-xs text-slate-400">{safeString(appointment.patient_phone, '--')}</p>
                              <p className="mt-1 text-xs text-slate-500">{appointment.appointment_time ? safeString(String(appointment.appointment_time).slice(0, 5)) : '--'}</p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusConfig[appointment.status]?.className || statusConfig.booked.className}`}>{safeString(statusConfig[appointment.status]?.label, 'محجوز')}</span>
                                {aiSummary && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium text-violet-300 border border-violet-400/20">
                                    <Sparkles className="h-3 w-3" />
                                    {safeString(aiSummary.symptoms, 'تقييم').slice(0, 20)}...
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {/* Smart One-Tap Status Cycle */}
                            <button type="button" onClick={() => cycleStatus(appointment)} disabled={actionLoading || appointment.status === 'completed' || appointment.status === 'cancelled' || appointment.status === 'no_show'} className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/20 disabled:opacity-40">
                              {appointment.status === 'booked' ? '→ انتظار' : appointment.status === 'waiting' ? '→ كشف' : appointment.status === 'in_progress' ? '→ صيدلية' : 'تم ✓'}
                            </button>

                            {/* WhatsApp Actions */}
                            <div className="flex gap-1">
                              <button type="button" onClick={() => openWhatsApp(appointment.patient_phone, `السلام عليكم ${safeString(appointment.patient_name)} 🌿 موعدك مع د. ${safeString(doctor?.name, 'الطبيب')} اليوم الساعة ${appointment.appointment_time ? safeString(String(appointment.appointment_time).slice(0, 5)) : '--'}. تفضل بزيارة العيادة.`)} className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-2 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/20" title="تأكيد"><MessageCircle className="h-3.5 w-3.5" /></button>
                              <button type="button" onClick={() => setDelayModal({ open: true, appointment })} className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-2 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/20" title="إشعار تأخير"><Clock className="h-3.5 w-3.5" /></button>
                              <button type="button" onClick={() => sendPostVisit(appointment)} disabled={appointment.status !== 'completed'} className="rounded-lg border border-blue-400/20 bg-blue-500/10 px-2 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-500/20 disabled:opacity-40" title="تعليمات ما بعد الكشف"><PhoneCall className="h-3.5 w-3.5" /></button>
                            </div>

                            {/* Quick Attendance */}
                            <div className="flex gap-1">
                              <button type="button" onClick={() => void updateAppointmentStatus(appointment.id, 'completed')} disabled={actionLoading || appointment.status === 'completed'} className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-2 py-1.5 text-[10px] font-semibold text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-40">تم</button>
                              <button type="button" onClick={() => void updateAppointmentStatus(appointment.id, 'no_show')} disabled={actionLoading || appointment.status === 'no_show'} className="rounded-lg border border-slate-400/20 bg-slate-500/10 px-2 py-1.5 text-[10px] font-semibold text-slate-200 hover:bg-slate-500/20 disabled:opacity-40">غائب</button>
                            </div>

                            {/* Prescription Button */}
                            <button type="button" onClick={() => setPrescriptionModal({ open: true, appointment })} className="rounded-lg border border-blue-400/20 bg-blue-500/10 px-2 py-1.5 text-[10px] font-semibold text-blue-200 hover:bg-blue-500/20">
                              <FileText className="h-3 w-3 inline" /> روشتة
                            </button>

                            {/* Mini-EHR Button */}
                            <button type="button" onClick={() => setEhrPatient(ehrPatient?.id === appointment.id ? null : appointment)} className={`rounded-lg border px-2 py-1.5 text-[10px] font-semibold transition ${ehrPatient?.id === appointment.id ? 'border-violet-400/30 bg-violet-500/20 text-violet-200' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                              {ehrPatient?.id === appointment.id ? 'إخفاء' : 'ملف'}
                            </button>

                            {/* Post-Visit quick action */}
                            {appointment.status === 'completed' && (
                              <button type="button" onClick={() => sendPostVisit(appointment)} className="rounded-lg border border-blue-400/20 bg-blue-500/10 px-2 py-1.5 text-[10px] font-semibold text-blue-200 hover:bg-blue-500/20">
                                واتساب بعد الكشف
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Mini-EHR Panel */}
                        <AnimatePresence>
                          {ehrPatient?.id === appointment.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="mt-3 rounded-xl border border-violet-400/20 bg-violet-500/5 p-4">
                                <p className="mb-2 text-xs font-semibold text-violet-200">📋 السجل الطبي — {safeString(appointment.patient_name)}</p>
                                {(DEMO_EHR[appointment.id] || []).length > 0 ? (
                                  <div className="space-y-2">
                                    {DEMO_EHR[appointment.id].map((note) => (
                                      <div key={note.id} className="rounded-lg border border-white/5 bg-white/[0.03] p-3 text-xs">
                                        <p className="text-slate-500">{note.date}</p>
                                        <p className="mt-1 text-slate-300"><span className="text-slate-400">التشخيص:</span> {note.diagnosis}</p>
                                        <p className="text-slate-300"><span className="text-slate-400">العلاج:</span> {note.prescription}</p>
                                        <p className="text-slate-300"><span className="text-slate-400">ملاحظات:</span> {note.doctorNotes}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-500">لا توجد زيارات سابقة مسجلة لهذا المريض.</p>
                                )}
                                <div className="mt-2 flex gap-2">
                                  <input type="text" placeholder="تشخيص..." className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none placeholder:text-slate-500" />
                                  <button type="button" className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2 py-1 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20">حفظ</button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                  </div>
                )}
              </div>
            </motion.section>

            {/* Right Column: Analytics */}
            <motion.section variants={itemVariants} className="space-y-5">
              {/* Revenue vs Target */}
              <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div><p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">تحليلات</p><h3 className="mt-1 text-lg font-semibold text-white">الإيرادات vs الهدف</h3></div>
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MONTHLY_REVENUE} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                      <XAxis dataKey="month" stroke="rgba(148,163,184,0.4)" tick={{ fontSize: 10 }} />
                      <YAxis stroke="rgba(148,163,184,0.4)" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: '12px', fontSize: '12px' }} labelStyle={{ color: '#22d3ee' }} />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} name="الإيرادات" />
                      <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#f59e0b', r: 3 }} name="الهدف" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Patient Inflow */}
              <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div><p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">تحليلات</p><h3 className="mt-1 text-lg font-semibold text-white">تدفق المرضى</h3></div>
                  <BarChart3 className="h-5 w-5 text-amber-400" />
                </div>
                <div className="h-36" style={{ background: 'linear-gradient(180deg, rgba(34,211,238,0.08) 0%, transparent 100%)' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PATIENT_INFLOW} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                      <XAxis dataKey="hour" stroke="rgba(148,163,184,0.4)" tick={{ fontSize: 9 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: '12px', fontSize: '12px' }} />
                      <Bar dataKey="patients" fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={20}>
                        {PATIENT_INFLOW.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.patients >= 8 ? '#ef4444' : entry.patients >= 5 ? '#f59e0b' : '#22d3ee'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Diagnosis Pie */}
              <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div><p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">تحليلات</p><h3 className="mt-1 text-lg font-semibold text-white">التشخيصات</h3></div>
                  <BarChart3 className="h-5 w-5 text-violet-400" />
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={DIAGNOSIS_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={3} dataKey="value">
                        {DIAGNOSIS_DATA.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={entry.color} />))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: '12px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {DIAGNOSIS_DATA.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs text-slate-400"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name} ({item.value}%)</div>
                  ))}
                </div>
              </div>

              {/* Missing Patients */}
              <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div><p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">متابعة</p><h3 className="mt-1 text-lg font-semibold text-white">مرضى لم يحضروا</h3></div>
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                </div>
                <div className="space-y-2">
                  {MISSING_PATIENTS.map((mp) => (
                    <div key={mp.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                      <div><p className="text-sm font-medium text-white">{safeString(mp.name)}</p><p className="text-xs text-slate-500">{safeString(mp.phone)}</p></div>
                      <button type="button" onClick={() => openWhatsApp(mp.phone, `أهلاً ${safeString(mp.name)} 🌿 د. ${safeString(doctor?.name, 'الطبيب')} من Hihya Care بيسأل عليك. فاتك موعدك يوم ${safeString(mp.missedDate)}. ممكن تتواصل معانا لحجز موعد جديد.`)} className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20"><MessageCircle className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expense & Profit */}
              <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div><p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">المالية</p><h3 className="mt-1 text-lg font-semibold text-white">الإيرادات والمصروفات</h3></div>
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>

                {/* Profit Summary */}
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-300/70">الإيرادات</p>
                    <p className="mt-1 text-lg font-bold text-emerald-200">{stats.monthlyRevenue.toLocaleString()} ج.م</p>
                  </div>
                  <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-rose-300/70">المصروفات</p>
                    <p className="mt-1 text-lg font-bold text-rose-200">{MONTHLY_EXPENSES_TOTAL.toLocaleString()} ج.م</p>
                  </div>
                </div>

                <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/70">صافي الربح</p>
                  <p className="mt-1 text-2xl font-bold text-white">{(stats.monthlyRevenue - MONTHLY_EXPENSES_TOTAL).toLocaleString()} ج.م</p>
                  <p className="mt-1 text-xs text-cyan-300/70">{((stats.monthlyRevenue - MONTHLY_EXPENSES_TOTAL) / stats.monthlyRevenue * 100).toFixed(1)}% هامش ربح</p>
                </div>

                {/* Expense Breakdown */}
                <div className="mt-4 space-y-1.5">
                  <p className="mb-2 text-xs font-semibold text-slate-400">تفاصيل المصروفات الشهرية</p>
                  {Object.entries(EXPENSE_DATA).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                      <span className="text-xs text-slate-400">
                        {key === 'rent' ? 'إيجار' : key === 'electricity' ? 'كهرباء' : key === 'water' ? 'مياه' : key === 'supplies' ? 'خامات طبية' : key === 'staff' ? 'رواتب' : key === 'maintenance' ? 'صيانة' : 'أخرى'}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${(val / MONTHLY_EXPENSES_TOTAL) * 100}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-300 w-16 text-left">{val.toLocaleString()} ج.م</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          </div>

          {/* Footer */}
          <motion.footer variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs text-slate-500 backdrop-blur-xl">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-cyan-400" />نظام إدارة العيادات — Hihya Care</span>
            <button type="button" onClick={() => navigate('/ai-triage')} className="inline-flex items-center gap-1.5 font-semibold text-cyan-300 hover:text-cyan-200 transition"><Stethoscope className="h-4 w-4" />المساعد الطبي الذكي</button>
          </motion.footer>
        </motion.main>

        {/* Delay Modal */}
        <AnimatePresence>
          {delayModal.open && delayModal.appointment ? (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f1525] p-6 shadow-2xl backdrop-blur-2xl">
                <h3 className="text-lg font-semibold text-white">إشعار تأخير</h3>
                <p className="mt-2 text-sm text-slate-400">إرسال إشعار تأخير إلى <span className="font-semibold text-white">{delayModal.appointment.patient_name}</span> و {Math.min(3, appointments.filter(a => a.status === 'booked' || a.status === 'waiting').length - 1)} مرضى آخرين</p>
                <div className="mt-4 space-y-2">
                  {DELAY_TEMPLATES.map((t) => (
                    <button key={t.delay} type="button" onClick={() => { setDelayMinutes(t.delay); sendDelayAlert(delayModal.appointment!, t.delay); setDelayModal({ open: false, appointment: null }) }} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-right text-sm text-slate-300 transition hover:bg-white/10">{t.label} — {t.msg('فلان', doctor?.name || 'الطبيب').slice(0, 50)}...</button>
                  ))}
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" onClick={() => setDelayModal({ open: false, appointment: null })} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10">إلغاء</button>
                </div>
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>

        {/* Prescription Modal */}
        {prescriptionModal.open && prescriptionModal.appointment && doctor && (
          <PrescriptionModal
            doctor={doctor}
            appointment={prescriptionModal.appointment}
            onClose={() => setPrescriptionModal({ open: false, appointment: null })}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}

/* ─── Sub-components ─── */
function LoadingScreen() {
  return <div className="flex min-h-screen items-center justify-center bg-[#020617]"><div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl"><Loader2 className="h-5 w-5 animate-spin text-cyan-400" /><p className="text-sm text-slate-300">جارٍ التحميل...</p></div></div>
}

function NoDoctorScreen() {
  return <div className="flex min-h-screen items-center justify-center bg-[#020617] p-6"><div className="max-w-md rounded-3xl border border-amber-300/20 bg-amber-500/10 p-8 text-center backdrop-blur-2xl"><h2 className="text-xl font-semibold text-amber-100">لوحة الطبيب غير متاحة</h2><p className="mt-2 text-sm text-amber-200/70">لم يتم ربط حسابك بطبيب.</p></div></div>
}

function StatCard({ icon: Icon, label, value, sub, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub: string; accent: string }) {
  return (
    <motion.div whileHover={{ y: -4 }} className={`relative overflow-hidden rounded-[1.5rem] border ${accent} bg-white/5 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-2xl`}>
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/[0.06] to-transparent" />
      <div className="relative flex items-start justify-between">
        <div><p className="text-xs uppercase tracking-[0.35em] text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold tracking-[-0.03em] text-white">{value}</p><p className="mt-1 text-xs text-slate-500">{sub}</p></div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5"><Icon className="h-5 w-5 text-cyan-300" /></div>
      </div>
    </motion.div>
  )
}

export default DoctorDashboard
