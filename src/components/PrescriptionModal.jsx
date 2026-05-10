import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PDFDocument } from 'pdf-lib'
import html2canvas from 'html2canvas'
import QRCode from 'qrcode'
import { FileText, Loader2, MessageCircle, Plus, Save, Trash2, X } from 'lucide-react'
import { supabase } from '../supabaseClient'

const FALLBACK_DOCTOR_LOGO = '/favicon.svg'

let rxCounter = 0

function generateUuid() {
  if (typeof crypto?.randomUUID === 'function') return crypto.randomUUID()
  return 'rx-' + Date.now() + '-' + (++rxCounter)
}

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function normalizePhoneForWa(phone) {
  if (!phone) return null
  const digits = String(phone).replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('01')) return '2' + digits
  if (digits.length === 11 && digits.startsWith('01')) return '2' + digits.slice(1)
  if (digits.length === 12 && digits.startsWith('201')) return digits
  if (digits.length === 13 && digits.startsWith('201')) return digits
  return digits || null
}

function openWhatsApp(phone, message) {
  const n = normalizePhoneForWa(phone)
  if (n) window.open(`https://wa.me/${n}?text=${encodeURIComponent(message)}`, '_blank')
}

const HIHYA_CARE_LOGO_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40">
  <defs>
    <linearGradient id="hc-g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <text x="0" y="28" font-family="Cairo,Noto Naskh Arabic,sans-serif" font-weight="700" font-size="22" fill="url(#hc-g)" letter-spacing="2">HIHYA</text>
  <text x="80" y="28" font-family="Cairo,Noto Naskh Arabic,sans-serif" font-weight="300" font-size="22" fill="#ffffff" letter-spacing="2">CARE</text>
</svg>`)}`

export default function PrescriptionModal({ doctor, appointment, onClose }) {
  const [diagnosis, setDiagnosis] = useState('')
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '', notes: '' }])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedId, setSavedId] = useState(null)
  const [qrDataUrl, setQrDataUrl] = useState(null)

  const doctorSignature = doctor?.name || 'الطبيب'
  const logoUrl = doctor?.image_url || FALLBACK_DOCTOR_LOGO
  const clinicAddress = doctor?.clinicLocation || doctor?.clinicLocation_ar || ''
  const doctorPhone = doctor?.phone_number || ''
  const patientName = appointment?.patient_name || ''
  const patientPhone = appointment?.patient_phone || appointment?.phone || ''

  const todayNumeric = useMemo(() => {
    const d = new Date()
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }, [])

  const qrUuid = useMemo(() => generateUuid(), [])

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://hihya-care.vercel.app'
    QRCode.toDataURL(`${origin}/prescription/${qrUuid}`, {
      width: 180, margin: 1, color: { dark: '#1e3a5f', light: '#ffffff' },
    }).then(setQrDataUrl).catch(() => {})
  }, [qrUuid])

  const addMedicine = () => {
    setMedicines(prev => [...prev, { name: '', dosage: '', duration: '', notes: '' }])
  }

  const removeMedicine = (index) => {
    if (medicines.length <= 1) return
    setMedicines(prev => prev.filter((_, i) => i !== index))
  }

  const updateMedicine = (index, field, value) => {
    setMedicines(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  const hasMedicines = medicines.some(m => m.name || m.dosage || m.duration)

  const generatePdfBlob = async () => {
    const medRows = medicines.filter(m => m.name).map((m, i) =>
      `<tr>
        <td style="padding:4px 8px;font-size:11px;color:#64748b;border-bottom:1px solid #e2e8f0">${i + 1}</td>
        <td style="padding:4px 8px;font-size:12px;font-weight:700;border-bottom:1px solid #e2e8f0">${m.name}</td>
        <td style="padding:4px 8px;font-size:11px;border-bottom:1px solid #e2e8f0">${m.dosage || ''}</td>
        <td style="padding:4px 8px;font-size:11px;border-bottom:1px solid #e2e8f0">${m.duration || ''}</td>
        <td style="padding:4px 8px;font-size:10px;color:#64748b;border-bottom:1px solid #e2e8f0">${m.notes || ''}</td>
      </tr>`
    ).join('')

    const fullHtml = `<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="utf-8">
<style>
@page{size:A4;margin:8mm}
*{margin:0;padding:0;box-sizing:border-box;font-family:'Traditional Arabic','Geeza Pro','Noto Naskh Arabic','Arial',serif}
</style></head>
<body>
<div style="max-width:190mm;margin:0 auto">

<!-- Header -->
<div style="background:linear-gradient(135deg,#0a1628,#0f1f3d 40%,#1a2d52);padding:18px 24px 14px;color:#fff;border-bottom:3px solid #f59e0b">
  <div style="display:flex;align-items:center;gap:12px">
    <img src="${logoUrl}" width="40" height="40" style="border-radius:8px;object-fit:contain;background:rgba(255,255,255,0.1)" />
    <div style="flex:1">
      <h1 style="font-size:20px;font-weight:700">روشتة علاج — وصفة طبية</h1>
      <p style="font-size:11px;color:rgba(255,255,255,0.7);margin-top:2px">روشتة إلكترونية معتمدة — للتحقق امسح QR code</p>
    </div>
    <div style="text-align:center;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:4px 12px">
      <p style="font-size:8px;font-weight:700;color:#fbbf24">رقم الروشتة</p>
      <p style="font-size:13px;font-weight:700;font-family:monospace">#${qrUuid.slice(0, 4)}</p>
    </div>
  </div>
</div>

<!-- Body -->
<div style="padding:16px 24px 12px">

  <!-- Doctor -->
  <div style="border:1px solid #dbeafe;border-radius:10px;background:#f0f7ff;padding:12px 16px;margin-bottom:12px">
    <div style="display:flex;gap:12px">
      <div style="flex:1">
        <p style="font-size:9px;font-weight:700;color:#3b82f6;letter-spacing:0.15em">الطبيب المعالج</p>
        <p style="font-size:16px;font-weight:700;margin:4px 0 2px">${doctorSignature}</p>
        <p style="font-size:11px;color:#94a3b8">${doctor?.specialty || ''}</p>
        ${clinicAddress ? `<p style="font-size:10px;color:#64748b;margin-top:3px">${clinicAddress}</p>` : ''}
        ${doctorPhone ? `<p style="font-size:10px;color:#64748b">${doctorPhone}</p>` : ''}
      </div>
      <img src="${logoUrl}" width="64" height="64" style="border-radius:8px;border:2px solid #dbeafe;object-fit:contain;background:#fff" />
    </div>
  </div>

  <!-- Patient + Date -->
  <div style="display:flex;gap:10px;margin-bottom:12px">
    <div style="flex:1;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;padding:8px 12px">
      <p style="font-size:9px;font-weight:700;color:#64748b">المريض</p>
      <p style="font-size:14px;font-weight:700;margin-top:3px">${capitalize(patientName) || '—'}</p>
      ${patientPhone ? `<p style="font-size:10px;color:#64748b;margin-top:1px">${patientPhone}</p>` : ''}
    </div>
    <div style="flex:1;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;padding:8px 12px;text-align:left">
      <p style="font-size:9px;font-weight:700;color:#64748b">التاريخ</p>
      <p style="font-size:14px;font-weight:700;margin-top:3px" dir="ltr">${todayNumeric}</p>
    </div>
  </div>

  <!-- Diagnosis -->
  ${diagnosis ? `
  <div style="margin-bottom:12px">
    <p style="font-size:11px;font-weight:700;color:#475569;margin-bottom:3px">التشخيص</p>
    <div style="border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;background:#fffbeb;border-right:4px solid #f59e0b">
      <p style="font-size:12px;line-height:1.55">${diagnosis}</p>
    </div>
  </div>` : ''}

  <!-- Medicines -->
  ${hasMedicines ? `
  <div style="margin-bottom:12px">
    <p style="font-size:11px;font-weight:700;color:#475569;margin-bottom:4px">الأدوية</p>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden">
      <thead><tr style="background:#f8fafc">
        ${['#','الدواء','الجرعة','المدة','ملاحظات'].map(h => `<th style="padding:5px 8px;text-align:right;font-size:9px;font-weight:700;color:#475569;border-bottom:1px solid #e2e8f0">${h}</th>`).join('')}
      </tr></thead>
      <tbody>${medRows}</tbody>
    </table>
  </div>` : ''}

  <!-- Notes -->
  ${notes ? `
  <div style="margin-bottom:12px">
    <p style="font-size:11px;font-weight:700;color:#475569;margin-bottom:3px">ملاحظات إضافية</p>
    <div style="border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;background:#f8fafc">
      <p style="font-size:11px;line-height:1.5">${notes}</p>
    </div>
  </div>` : ''}

  <!-- Signature + QR -->
  <div style="border-top:1px solid #e2e8f0;margin-top:8px;padding-top:10px;display:flex;align-items:flex-end">
    <div style="flex:1">
      <p style="font-size:9px;font-weight:700;color:#64748b">توقيع الطبيب</p>
      <p style="font-size:18px;font-weight:700;color:#0f1f3d;margin-top:2px">${doctorSignature}</p>
      <p style="font-size:7px;color:#94a3b8;margin-top:3px">روشتة إلكترونية — Hihya Care</p>
    </div>
    ${qrDataUrl ? `<div style="text-align:center"><img src="${qrDataUrl}" width="72" height="72" style="border-radius:4px" /><p style="font-size:6px;color:#94a3b8;margin-top:1px">امسح QR للتحقق</p></div>` : ''}
  </div>

</div>
</div>
</body></html>`

    const div = document.createElement('div')
    div.innerHTML = fullHtml
    div.style.position = 'fixed'
    div.style.left = '-9999px'
    div.style.top = '0'
    div.style.width = '210mm'
    div.style.background = '#ffffff'
    div.dir = 'rtl'
    document.body.appendChild(div)

    try {
      await document.fonts.ready
      await new Promise(r => setTimeout(r, 600))

      const canvas = await html2canvas(div, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      const pngDataUrl = canvas.toDataURL('image/png')
      const resp = await fetch(pngDataUrl)
      const pngBuffer = await resp.arrayBuffer()

      const pdfDoc = await PDFDocument.create()
      const pngImage = await pdfDoc.embedPng(pngBuffer)

      const ptW = 595.28
      const ptH = 841.89
      const scaled = pngImage.scaleToFit(ptW, ptH)

      const page = pdfDoc.addPage([ptW, ptH])
      page.drawImage(pngImage, {
        x: (ptW - scaled.width) / 2,
        y: (ptH - scaled.height) / 2,
        width: scaled.width,
        height: scaled.height,
      })

      const pdfBytes = await pdfDoc.save()
      return new Blob([pdfBytes], { type: 'application/pdf' })
    } finally {
      document.body.removeChild(div)
    }
  }

  const saveToSupabase = async () => {
    const { error } = await supabase.from('prescriptions').insert({
      qr_uuid: qrUuid,
      doctor_id: doctor?.id || null,
      patient_name: patientName,
      patient_phone: patientPhone,
      diagnosis,
      medicines: medicines.filter(m => m.name),
      notes,
      signature_text: doctorSignature,
    })
    if (error) throw error
    return qrUuid
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const id = await saveToSupabase()
      setSavedId(id)
    } catch (e) {
      console.error('Save failed', e)
    }
    setLoading(false)
  }

  const handleDownloadPdf = async () => {
    setLoading(true)
    try {
      const blob = await generatePdfBlob()
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `prescription-${qrUuid.slice(0, 4)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('PDF generation failed', e)
    }
    setLoading(false)
  }

  const handleSendWhatsApp = async () => {
    setLoading(true)
    try {
      const id = await saveToSupabase()
      setSavedId(id)

      const blob = await generatePdfBlob()
      if (!blob) return

      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://hihya-care.vercel.app'
      const rxLink = `${origin}/prescription/${qrUuid}`
      const medsSummary = medicines.filter(m => m.name).slice(0, 4).map(m =>
        `• ${m.name}${m.dosage ? ` — ${m.dosage}` : ''}${m.duration ? ` (${m.duration})` : ''}`
      ).join('\n')

      const msg = `📋 روشتة إلكترونية من د. ${doctorSignature}\n🏥 Hihya Care\n\n👤 المريض: ${capitalize(patientName)}\n🔬 التشخيص: ${diagnosis}\n💊 الأدوية:\n${medsSummary || '—'}\n\n📎 الرابط: ${rxLink}\n\nتم حفظ الروشتة إلكترونياً — للتحقق، امسح QR code المرفق.`

      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([blob], `prescription-${qrUuid.slice(0, 4)}.pdf`, { type: 'application/pdf' })
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'روشتة علاج', text: msg })
            setLoading(false)
            return
          }
        } catch { /* fallback */ }
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `prescription-${qrUuid.slice(0, 4)}.pdf`
      a.click()
      URL.revokeObjectURL(url)

      setTimeout(() => {
        openWhatsApp(patientPhone, msg)
      }, 500)
    } catch (e) {
      console.error('Send failed', e)
    }
    setLoading(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl my-8 rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
          dir="rtl"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute -top-3 -left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-l from-[#0a1628] via-[#0f1f3d] to-[#1a2d52] px-6 py-8 sm:px-10">
            <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-amber-400/5 to-transparent" />
            <div className="relative flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur border border-white/20">
                <img src={logoUrl} alt="" className="h-10 w-10 rounded-lg object-contain" onError={(e) => { e.target.style.display = 'none' }} />
              </div>
              <div className="flex-1 min-w-0">
                <img src={HIHYA_CARE_LOGO_SVG} alt="HIHYA CARE" className="h-7" />
                <h2 className="mt-2 text-2xl font-bold text-white" style={{ fontFamily: "'Cairo', 'Noto Naskh Arabic', serif" }}>
                  روشتة علاج — وصفة طبية
                </h2>
                <p className="mt-1 text-sm text-blue-200/70">روشتة إلكترونية معتمدة — للتحقق امسح QR code</p>
              </div>
              <div className="shrink-0 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-center">
                <p className="text-[10px] font-semibold text-amber-400/70">رقم الروشتة</p>
                <p className="mt-0.5 text-xs font-mono font-bold text-white" dir="ltr">#{qrUuid.slice(0, 4)}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 sm:p-10">

            {/* Doctor Info Card */}
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 dark:border-blue-400/20 dark:from-blue-500/10 dark:to-transparent">
              <div className="flex flex-wrap gap-6">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-blue-500/70">الطبيب المعالج</p>
                  <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Cairo', 'Noto Naskh Arabic', serif" }}>
                    {doctorSignature}
                  </p>
                  <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">{doctor?.specialty || ''}</p>
                  {clinicAddress && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span className="text-blue-400">📍</span> {clinicAddress}
                    </p>
                  )}
                  {doctorPhone && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span className="text-blue-400">📞</span> {doctorPhone}
                    </p>
                  )}
                </div>
                <div className="shrink-0 self-start">
                  <div className="h-20 w-20 overflow-hidden rounded-xl border-2 border-blue-100 bg-white dark:border-blue-400/20 dark:bg-blue-500/10">
                    <img
                      src={logoUrl}
                      alt=""
                      className="h-full w-full object-contain p-1"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-[10px] font-semibold tracking-[0.15em] text-slate-500/70">المريض</p>
                <p className="mt-1.5 text-base font-bold text-slate-900 dark:text-white capitalize">{capitalize(patientName) || '—'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-[10px] font-semibold tracking-[0.15em] text-slate-500/70">التاريخ</p>
                <p className="mt-1.5 text-base font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Cairo', serif" }} dir="ltr">{todayNumeric}</p>
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">🔬 التشخيص</label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={3}
                placeholder="اكتب التشخيص الطبي..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/60 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            {/* Medicines Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">💊 الأدوية</label>
                <button
                  type="button"
                  onClick={addMedicine}
                  className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                >
                  <Plus className="h-3 w-3" /> إضافة دواء
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/5">
                      <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400">#</th>
                      <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400">اسم الدواء</th>
                      <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400">الجرعة</th>
                      <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400">المدة</th>
                      <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400">ملاحظات</th>
                      <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {medicines.map((med, i) => (
                      <tr key={i} className="group hover:bg-blue-50/50 dark:hover:bg-blue-500/5">
                        <td className="px-3 py-2 text-xs text-slate-400">{i + 1}</td>
                        <td className="px-3 py-2">
                          <input
                            value={med.name}
                            onChange={(e) => updateMedicine(i, 'name', e.target.value)}
                            placeholder="اسم الدواء..."
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={med.dosage}
                            onChange={(e) => updateMedicine(i, 'dosage', e.target.value)}
                            placeholder="مثال: 500mg 3 مرات"
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={med.duration}
                            onChange={(e) => updateMedicine(i, 'duration', e.target.value)}
                            placeholder="مثال: 7 أيام"
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={med.notes}
                            onChange={(e) => updateMedicine(i, 'notes', e.target.value)}
                            placeholder="بعد الأكل / قبل النوم"
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeMedicine(i)}
                            className="rounded-lg p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition disabled:opacity-20 dark:hover:bg-rose-500/10"
                            disabled={medicines.length <= 1}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">📝 ملاحظات إضافية</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="تعليمات إضافية للمريض..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/60 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6 dark:border-white/10">
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition disabled:opacity-50 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-200"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                تحميل PDF
              </button>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                إرسال واتساب
              </button>
              {savedId && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400">✅ تم الحفظ</span>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
