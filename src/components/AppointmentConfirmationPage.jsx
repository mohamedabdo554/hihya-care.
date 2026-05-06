import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import { CalendarPlus, Clock, Download, Loader2, Stethoscope, Ticket } from 'lucide-react'

function pad2(n) {
  return String(n).padStart(2, '0')
}

function googleCalendarUrl({ title, details, location, isoStart, durationMinutes = 30 }) {
  const start = new Date(isoStart)
  if (Number.isNaN(start.getTime())) {
    return ''
  }
  const end = new Date(start.getTime() + durationMinutes * 60000)
  const fmt = d =>
    `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details,
    location,
    dates: `${fmt(start)}/${fmt(end)}`,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** Absolute https URL safe for QR, browsers, and PDF link annotations */
function normalizeMapsUrl(raw) {
  const s = String(raw ?? '').trim()
  if (!s) {
    return 'https://www.google.com/maps'
  }
  const lower = s.toLowerCase()
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return 'https://www.google.com/maps'
  }
  if (/^https?:\/\//i.test(s)) {
    return s
  }
  return `https://${s.replace(/^\/+/, '')}`
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.11, delayChildren: 0.06 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

export default function AppointmentConfirmationPage({ ui }) {
  const navigate = useNavigate()
  const { state } = useLocation()
  const isAr = ui.language === 'ar'
  const ticketPdfRef = useRef(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)

  const data = state || {}
  const {
    patientName = '',
    patientPhone = '',
    appointmentIso = '',
    doctorName = '',
    specialty = '',
    clinicAddress = '',
    clinicPhone = '',
    mapsUrl = 'https://maps.google.com',
    bookingRef = `HC-${Date.now().toString(36).toUpperCase()}`,
  } = data

  const mapsUrlNormalized = useMemo(() => normalizeMapsUrl(mapsUrl), [mapsUrl])

  useEffect(() => {
    if (!appointmentIso) {
      navigate('/', { replace: true })
    }
  }, [appointmentIso, navigate])

  useEffect(() => {
    let cancelled = false
    const url = mapsUrlNormalized
    QRCode.toDataURL(url, {
      width: 200,
      margin: 1,
      color: { dark: '#1e40af', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
      .then(dataUrl => {
        if (!cancelled) {
          setQrDataUrl(dataUrl)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrDataUrl('')
        }
      })
    return () => {
      cancelled = true
    }
  }, [mapsUrlNormalized])

  const appointmentDate = useMemo(() => new Date(appointmentIso), [appointmentIso])

  const whenLabel = useMemo(() => {
    if (Number.isNaN(appointmentDate.getTime())) {
      return '—'
    }
    return appointmentDate.toLocaleString(isAr ? 'ar-EG' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [appointmentDate, isAr])

  const [tickNow, setTickNow] = useState(() => Date.now())
  useEffect(() => {
    if (Number.isNaN(appointmentDate.getTime())) {
      return undefined
    }
    const pulse = () => setTickNow(Date.now())
    pulse()
    const id = window.setInterval(pulse, 1000)
    const onFocus = () => pulse()
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        pulse()
      }
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [appointmentDate])

  /** يحدَّث كل ثانية؛ بعد الموعد تُعرض الجملة المطلوبة مع مدّة منقضية حيّة */
  const countdownUi = useMemo(() => {
    if (Number.isNaN(appointmentDate.getTime())) {
      return { title: isAr ? 'الوقت المتبقي' : 'Time remaining', value: '—' }
    }
    const msUntil = appointmentDate.getTime() - tickNow
    const totalSec = Math.floor(Math.abs(msUntil) / 1000)
    const d = Math.floor(totalSec / 86400)
    const h = Math.floor((totalSec % 86400) / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const sec = totalSec % 60
    const parts = isAr ? `${d} ي ${h} س ${m} د ${sec} ث` : `${d}d ${h}h ${m}m ${sec}s`

    if (msUntil > 0) {
      return {
        title: isAr ? 'الوقت المتبقي حتى الموعد' : 'Time until appointment',
        value: parts,
      }
    }
    return {
      title: isAr ? 'حان وقت الموعد أو انتهى العد' : 'Appointment time reached',
      value: isAr ? `مرّ على الموعد منذ: ${parts}` : `Elapsed since: ${parts}`,
    }
  }, [appointmentDate, tickNow, isAr])

  const gcalHref = googleCalendarUrl({
    title: `${isAr ? 'موعد' : 'Appointment'} — ${doctorName} (${specialty})`,
    details: `${isAr ? 'مريض' : 'Patient'}: ${patientName}\n${isAr ? 'مرجع' : 'Ref'}: ${bookingRef}`,
    location: clinicAddress || mapsUrlNormalized,
    isoStart: appointmentIso,
  })

  const downloadPdf = async () => {
    const el = ticketPdfRef.current
    if (!el) {
      return
    }
    const safeUrl = mapsUrlNormalized
    setPdfLoading(true)
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: '#f8fafc',
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const margin = 14

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)
      const urlLines = pdf.splitTextToSize(safeUrl, pageW - margin * 2)
      const lineHeightMm = 4.25
      const footerReserve = 10 + urlLines.length * lineHeightMm

      const imageAreaH = pageH - margin * 2 - footerReserve
      let imgW = pageW - margin * 2
      let imgH = (canvas.height * imgW) / canvas.width
      if (imgH > imageAreaH) {
        const scale = imageAreaH / imgH
        imgW *= scale
        imgH = imageAreaH
      }
      const x = (pageW - imgW) / 2
      const yImg = margin + (imageAreaH - imgH) / 2
      pdf.addImage(imgData, 'PNG', x, yImg, imgW, imgH)

      const footerTop = margin + imageAreaH + 5
      pdf.setFontSize(8)
      pdf.setTextColor(71, 85, 105)
      pdf.text('Maps link (tap to open in browser):', margin, footerTop)

      pdf.setFontSize(9)
      pdf.setTextColor(29, 78, 175)
      let ty = footerTop + 5
      urlLines.forEach(line => {
        pdf.text(line, margin, ty)
        ty += lineHeightMm
      })

      const linkTop = footerTop + 5 - lineHeightMm * 0.7
      const linkH = urlLines.length * lineHeightMm + 2
      pdf.link(margin, linkTop, pageW - margin * 2, linkH, { url: safeUrl })

      pdf.save(`hihya-ticket-${bookingRef}.pdf`)
    } finally {
      setPdfLoading(false)
    }
  }

  if (!appointmentIso || Number.isNaN(appointmentDate.getTime())) {
    return null
  }

  const L = isAr
    ? {
        success: 'تم تأكيد الموعد',
        sub: 'تم حجزك بنجاح — احتفظ بالتذكرة أو أضف الموعد للتقويم.',
        ticket: 'تذكرة الموعد',
        countdownCaption: 'يتجدّد كل ثانية',
        download: 'تحميل التذكرة PDF',
        calendar: 'إضافة لتقويم Google',
        home: 'الرئيسية',
      }
    : {
        success: 'Appointment confirmed',
        sub: 'Your booking is secured — save your ticket or add to calendar.',
        ticket: 'Appointment ticket',
        countdownCaption: 'Updates every second',
        download: 'Download PDF ticket',
        calendar: 'Add to Google Calendar',
        home: 'Home',
      }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/40 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <header className="border-b border-blue-100/60 bg-white/70 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100">
            ← {L.home}
          </Link>
          <span className="rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-800 dark:border-blue-400/30 dark:bg-blue-950/50 dark:text-blue-100">
            Hihya Care
          </span>
        </div>
      </header>

      <motion.main
        className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.section variants={fadeUp} className="text-center">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-full bg-emerald-400/25 blur-xl"
              animate={{ opacity: [0.45, 0.85, 0.45], scale: [1, 1.15, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="relative flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/50 bg-white shadow-[0_0_28px_rgba(16,185,129,0.35)] dark:border-emerald-400/40 dark:bg-emerald-950/40"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
              <motion.svg viewBox="0 0 24 24" className="h-8 w-8 text-emerald-600 dark:text-emerald-300" fill="none" aria-hidden>
                <motion.path
                  d="M20 7L10.5 16.5L4 10"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                />
              </motion.svg>
            </motion.div>
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{L.success}</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-400">{L.sub}</p>
        </motion.section>

        <motion.section variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={downloadPdf}
            disabled={pdfLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-800 shadow-sm transition hover:bg-blue-50 disabled:cursor-wait disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-blue-100 dark:hover:bg-white/10"
          >
            {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
            {L.download}
          </button>
          {gcalHref ? (
            <a
              href={gcalHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(37,99,235,0.35)] transition hover:bg-blue-700"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden />
              {L.calendar}
            </a>
          ) : null}
        </motion.section>

        <motion.section variants={fadeUp} className="mx-auto mt-10 max-w-3xl">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-[1px] shadow-[0_24px_70px_rgba(37,99,235,0.12)] dark:border-white/10 dark:bg-slate-900">
            <div className="rounded-[1.4rem] bg-gradient-to-br from-white via-blue-50/30 to-white px-6 py-8 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
              <div className="flex items-start justify-between gap-4 border-b border-dashed border-slate-200 pb-6 dark:border-white/10">
                <div>
                  <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-600/90 dark:text-blue-300/90">
                    <Ticket className="h-3.5 w-3.5" aria-hidden />
                    {L.ticket}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{doctorName}</p>
                  <p className="mt-1 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Stethoscope className="h-4 w-4 shrink-0" aria-hidden />
                    {specialty}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-inner dark:border-white/10 dark:bg-slate-950">
                  <div
                    className="grid h-[88px] w-[88px] place-content-center rounded-lg bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[length:12px_12px] dark:bg-[linear-gradient(45deg,#334155_25%,transparent_25%),linear-gradient(-45deg,#334155_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#334155_75%),linear-gradient(-45deg,transparent_75%,#334155_75%)] dark:bg-[length:12px_12px]"
                    aria-label="QR placeholder"
                  >
                    <span className="rounded bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-900/90 dark:text-slate-400">QR</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-blue-100/80 bg-blue-50/40 px-4 py-3 dark:border-blue-400/15 dark:bg-blue-950/30">
                  <p className="text-[11px] uppercase tracking-wider text-blue-700/80 dark:text-blue-300/80">{isAr ? 'التاريخ والوقت' : 'Date & time'}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden />
                    {whenLabel}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-slate-950/50">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{isAr ? 'المريض' : 'Patient'}</p>
                  <p className="mt-1 text-sm font-semibold">{patientName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{patientPhone}</p>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            variants={fadeUp}
            className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-4 text-center dark:border-blue-400/20 dark:bg-blue-950/25"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-700 dark:text-blue-300">{countdownUi.title}</p>
            <p className="mt-2 font-mono text-lg font-semibold tabular-nums text-slate-900 dark:text-white">{countdownUi.value}</p>
            <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">{L.countdownCaption}</p>
          </motion.div>
        </motion.section>

        {/* Off-screen printable ticket for PDF (Arabic-friendly fonts + maps link + QR) */}
        <div
          ref={ticketPdfRef}
          className="pointer-events-none fixed left-[-10000px] top-0 z-[-10]"
          aria-hidden
          dir={isAr ? 'rtl' : 'ltr'}
          style={{
            width: 540,
            padding: 28,
            background: 'linear-gradient(165deg, #eff6ff 0%, #ffffff 45%, #f8fafc 100%)',
            fontFamily: 'system-ui, "Segoe UI", Tahoma, Arial, sans-serif',
            color: '#0f172a',
            borderRadius: 24,
            boxSizing: 'border-box',
            border: '1px solid #bfdbfe',
            boxShadow: '0 24px 60px rgba(37,99,235,0.12)',
          }}
        >
          <div
            style={{
              borderRadius: 16,
              padding: '18px 22px',
              background: 'linear-gradient(120deg, #1d4ed8 0%, #2563eb 40%, #0ea5e9 100%)',
              color: '#fff',
              marginBottom: 20,
            }}
          >
            <p style={{ margin: 0, fontSize: 11, letterSpacing: '0.35em', opacity: 0.92, fontWeight: 700 }}>HIHYA CARE</p>
            <p style={{ margin: '10px 0 0', fontSize: 22, fontWeight: 700 }}>{isAr ? 'تذكرة موعد طبي' : 'Medical appointment ticket'}</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, opacity: 0.95 }}>{isAr ? 'تم تأكيد الحجز — احتفظ بنسخة' : 'Booking confirmed — keep a copy'}</p>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 18, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: '0.08em' }}>
                {isAr ? 'الطبيب' : 'Doctor'}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 19, fontWeight: 700 }}>{doctorName}</p>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: '#1d4ed8', fontWeight: 600 }}>{specialty}</p>
            </div>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 14,
                background: '#fff',
                border: '1px dashed #cbd5e1',
                textAlign: 'center',
                minWidth: 108,
              }}
            >
              <p style={{ margin: 0, fontSize: 10, color: '#64748b', fontWeight: 600 }}>{isAr ? 'المرجع' : 'Reference'}</p>
              <p style={{ margin: '6px 0 0', fontSize: 11, fontFamily: 'ui-monospace, monospace', fontWeight: 700, wordBreak: 'break-all' }}>{bookingRef}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
            <div style={{ background: '#eff6ff', borderRadius: 14, padding: 14, border: '1px solid #bfdbfe' }}>
              <p style={{ margin: 0, fontSize: 11, color: '#1e40af', fontWeight: 600 }}>{isAr ? 'التاريخ والوقت' : 'Date & time'}</p>
              <p style={{ margin: '8px 0 0', fontSize: 14, fontWeight: 700 }}>{whenLabel}</p>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 14, padding: 14, border: '1px solid #e2e8f0' }}>
              <p style={{ margin: 0, fontSize: 11, color: '#64748b', fontWeight: 600 }}>{isAr ? 'المريض' : 'Patient'}</p>
              <p style={{ margin: '8px 0 0', fontSize: 14, fontWeight: 700 }}>{patientName}</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{patientPhone}</p>
            </div>
          </div>

          <div style={{ borderRadius: 14, padding: 16, background: '#ffffff', border: '1px solid #e2e8f0', marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: '0.06em' }}>
              {isAr ? 'موقع العيادة' : 'Clinic location'}
            </p>
            <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.55, fontWeight: 600 }}>
              {clinicAddress || (isAr ? '—' : '—')}
            </p>
            <p style={{ margin: '14px 0 4px', fontSize: 11, color: '#64748b', fontWeight: 600 }}>
              {isAr ? 'رابط الخرائط (انسخه أو امسح QR)' : 'Maps link (copy or scan QR)'}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                lineHeight: 1.45,
                wordBreak: 'break-all',
                fontFamily: 'ui-monospace, monospace',
                color: '#1d4ed8',
              }}
            >
              {mapsUrlNormalized}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            {qrDataUrl ? (
              <div style={{ textAlign: 'center' }}>
                <img src={qrDataUrl} alt="" width={112} height={112} style={{ display: 'block', borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <p style={{ margin: '8px 0 0', fontSize: 10, color: '#64748b' }}>{isAr ? 'مسح للفتح في الخرائط' : 'Scan to open maps'}</p>
              </div>
            ) : null}
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ margin: 0, fontSize: 11, color: '#64748b', fontWeight: 600 }}>{isAr ? 'هاتف العيادة' : 'Clinic phone'}</p>
              <p style={{ margin: '8px 0 0', fontSize: 16, fontWeight: 700 }}>{clinicPhone || '—'}</p>
              <p style={{ margin: '14px 0 0', fontSize: 11, color: '#94a3b8', lineHeight: 1.45 }}>
                {isAr ? 'هذه التذكرة صادرة من منصة Hihya Care.' : 'Issued by Hihya Care.'}
              </p>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  )
}
