import { useCallback, useId, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, FileText, MessageCircle, Upload } from 'lucide-react'

const SYMPTOM_MAX = 500

export default function MedicalFileUploader({
  language = 'ar',
  whatsappPhone = '',
  patientName = '',
  doctorName = '',
  variant = 'full',
  onFilesChange,
  onIntakeChange,
}) {
  const inputId = useId()
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [files, setFiles] = useState([])
  const [dragOver, setDragOver] = useState(false)

  const fireIntake = useCallback((a, g, s, f) => {
    if (onIntakeChange) onIntakeChange({ age: a, gender: g, symptoms: s, files: f })
  }, [onIntakeChange])

  const isAr = language === 'ar'

  const labels = useMemo(
    () =>
      isAr
        ? {
            age: 'العمر',
            gender: 'النوع',
            male: 'ذكر',
            female: 'أنثى',
            symptoms: 'وصف الأعراض',
            placeholder: 'صف الأعراض أو الأسئلة الطبية باختصار…',
            dropTitle: 'اسحب الأشعة أو تقارير PDF هنا',
            dropHint: 'أو انقر للاختيار — صور PNG/JPG أو PDF',
            disclaimer:
              'بياناتك مشفّرة تصل للطبيب المعالج فقط؛ لا نشاركها مع أطراف أخرى ضمن سياسة الخصوصية.',
            wa: 'إرسال عبر واتساب',
            chars: 'حرف',
          }
        : {
            age: 'Age',
            gender: 'Gender',
            male: 'Male',
            female: 'Female',
            symptoms: 'Symptoms summary',
            placeholder: 'Briefly describe symptoms or questions…',
            dropTitle: 'Drop X-rays or lab PDFs here',
            dropHint: 'Or click to browse — PNG/JPG or PDF',
            disclaimer: 'Your data is encrypted and visible only to your doctor.',
            wa: 'Send via WhatsApp',
            chars: 'chars',
          },
    [isAr],
  )

  const addFiles = useCallback(list => {
    const next = Array.from(list || []).filter(f => {
      const ok =
        f.type.startsWith('image/') ||
        f.type === 'application/pdf' ||
        /\.(pdf|png|jpe?g)$/i.test(f.name)
      return ok && f.size < 12 * 1024 * 1024
    })
    setFiles(prev => {
      const updated = [...prev, ...next].slice(0, 6)
      if (onFilesChange) onFilesChange(updated)
      fireIntake(age, gender, symptoms, updated)
      return updated
    })
  }, [onFilesChange, fireIntake, age, gender, symptoms])

  const onDrop = useCallback(
    e => {
      e.preventDefault()
      setDragOver(false)
      addFiles(e.dataTransfer?.files)
    },
    [addFiles],
  )

  const waHref = useMemo(() => {
    const digits = String(whatsappPhone || '').replace(/\D/g, '')
    if (!digits) {
      return ''
    }
    const fileNote =
      files.length > 0 ? `\n${isAr ? 'مرفقات:' : 'Attachments:'} ${files.map(f => f.name).join(', ')}` : ''
    const body =
      `${isAr ? 'مرحباً، أرسل الملف الطبي التالي قبل الموعد.' : 'Hello — sharing medical intake before my visit.'}\n` +
      `${isAr ? 'المريض:' : 'Patient:'} ${patientName || '—'}\n` +
      `${isAr ? 'الطبيب:' : 'Doctor:'} ${doctorName || '—'}\n` +
      `${labels.age}: ${age || '—'}\n` +
      `${labels.gender}: ${gender || '—'}\n` +
      `${labels.symptoms}: ${symptoms.trim() || '—'}${fileNote}`
    return `https://wa.me/${digits}?text=${encodeURIComponent(body)}`
  }, [whatsappPhone, patientName, doctorName, age, gender, symptoms, files, isAr, labels])

  const compact = variant === 'compact'
  const uploaded = files.length > 0

  return (
    <div
      className={`rounded-2xl border border-white/70 bg-white/40 shadow-[0_8px_32px_rgba(37,99,235,0.08)] backdrop-blur-xl dark:border-white/15 dark:bg-white/5 ${compact ? 'p-4' : 'p-5 sm:p-6'}`}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-blue-600/80 dark:text-blue-300/80">
        {isAr ? 'ملف طبي' : 'Medical intake'}
      </p>
      <div className={`grid gap-4 ${compact ? 'mt-3 sm:grid-cols-2' : 'mt-4 sm:grid-cols-2'}`}>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">{labels.age}</span>
            <input
              type="number"
              min={0}
              max={120}
              value={age}
              onChange={e => { const v = e.target.value; setAge(v); fireIntake(v, gender, symptoms, files) }}
              className="w-full rounded-xl border border-blue-100/80 bg-white/80 px-4 py-2.5 text-base text-slate-900 shadow-inner outline-none ring-blue-400/0 transition focus:border-blue-300 focus:ring-2 focus:ring-blue-200/60 dark:border-white/10 dark:bg-slate-950/50 dark:text-white"
              placeholder={isAr ? 'مثال: 35' : 'e.g. 35'}
            />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">{labels.gender}</span>
          <select
            value={gender}
            onChange={e => { const v = e.target.value; setGender(v); fireIntake(age, v, symptoms, files) }}
            className="w-full rounded-xl border border-blue-100/80 bg-white/80 px-4 py-2.5 text-base text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200/60 dark:border-white/10 dark:bg-slate-950/50 dark:text-white"
          >
            <option value="">{isAr ? '— اختر —' : '— Select —'}</option>
            <option value={labels.male}>{labels.male}</option>
            <option value={labels.female}>{labels.female}</option>
          </select>
        </label>
      </div>

      <label className={`mt-4 block ${compact ? '' : ''}`}>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{labels.symptoms}</span>
          <span className="text-[11px] text-slate-400">
            {symptoms.length}/{SYMPTOM_MAX} {labels.chars}
          </span>
        </div>
        <textarea
          value={symptoms}
          maxLength={SYMPTOM_MAX}
          onChange={e => { const v = e.target.value; setSymptoms(v); fireIntake(age, gender, v, files) }}
          placeholder={labels.placeholder}
          rows={compact ? 3 : 4}
          className="w-full resize-none rounded-xl border border-blue-100/80 bg-white/80 px-4 py-3 text-base text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200/60 dark:border-white/10 dark:bg-slate-950/50 dark:text-white"
        />
      </label>

      <div className="mt-4">
        <input
          id={inputId}
          type="file"
          accept="image/*,.pdf,application/pdf"
          multiple
          className="sr-only"
          onChange={e => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <label htmlFor={inputId}>
          <motion.div
            role="button"
            tabIndex={0}
            onDragOver={e => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            animate={{
              borderColor: dragOver ? 'rgba(59,130,246,0.65)' : 'rgba(255,255,255,0.65)',
              boxShadow: dragOver
                ? '0 0 0 1px rgba(59,130,246,0.25), 0 12px 40px rgba(37,99,235,0.12)'
                : '0 8px 28px rgba(15,23,42,0.06)',
            }}
            className="relative cursor-pointer rounded-2xl border border-dashed border-blue-200/90 bg-gradient-to-br from-white/50 to-blue-50/40 px-4 py-8 text-center transition-colors dark:border-blue-400/25 dark:from-white/5 dark:to-blue-950/20"
          >
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={
                  uploaded
                    ? { scale: 1 }
                    : { scale: [1, 1.08, 1] }
                }
                transition={
                  uploaded
                    ? { duration: 0.2 }
                    : { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
                }
                className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border ${uploaded ? 'border-emerald-300/50 bg-emerald-50 text-emerald-600' : 'border-blue-200/80 bg-white text-blue-600 shadow-sm dark:border-white/10 dark:bg-slate-900/80 dark:text-blue-300'}`}
              >
                <AnimatePresence mode="wait">
                  {uploaded ? (
                    <motion.span
                      key="ok"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <CheckCircle2 className="h-8 w-8" aria-hidden />
                    </motion.span>
                  ) : (
                    <motion.span key="up" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Upload className="h-7 w-7" aria-hidden />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{labels.dropTitle}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{labels.dropHint}</p>
              </div>
              {files.length > 0 ? (
                <ul className="mt-2 max-h-24 w-full overflow-y-auto text-left text-xs text-slate-600 dark:text-slate-300">
                  {files.map(f => (
                    <li key={`${f.name}-${f.size}`} className="flex items-center gap-2 truncate border-t border-white/40 py-1 dark:border-white/10">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-blue-500" aria-hidden />
                      <span className="truncate">{f.name}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </motion.div>
        </label>
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-xl border border-blue-100/60 bg-blue-50/50 px-3 py-2 text-[11px] leading-relaxed text-blue-900/85 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/90">
        <span className="mt-0.5 text-blue-500" aria-hidden>
          🔒
        </span>
        <span>{labels.disclaimer}</span>
      </p>

      {waHref ? (
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(16,185,129,0.35)] transition hover:brightness-105"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          {labels.wa}
        </a>
      ) : (
        <p className="mt-4 text-center text-xs text-slate-400">{isAr ? 'رقم واتساب العيادة غير متوفر.' : 'Clinic WhatsApp not configured.'}</p>
      )}
    </div>
  )
}
