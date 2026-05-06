import { Link } from 'react-router-dom'

export type Doctor = {
  id: string
  name: string
  specialty: string
  image_url?: string | null
  bio?: string | null
  price: string
  experience?: string
  clinicLocation?: string
}

type DoctorCardProps = {
  doctor: Doctor
}

const specialtyEmojis: Record<string, string> = {
  cardiologist: '❤️',
  neurologist: '🧠',
  pediatrician: '👶',
  dermatologist: '🩹',
  orthopedist: '🦴',
  psychiatrist: '💭',
  dentist: '🦷',
  default: '⚕️',
}

const specialtyDescriptions: Record<string, string> = {
  cardiologist: 'متخصص في أمراض القلب والأوعية الدموية',
  neurologist: 'متخصص في الأمراض العصبية والدماغ',
  pediatrician: 'متخصص في صحة الأطفال والرضع',
  dermatologist: 'متخصص في أمراض الجلد والتجميل',
  orthopedist: 'متخصص في العظام والمفاصل',
  psychiatrist: 'متخصص في الصحة النفسية والعقلية',
  dentist: 'متخصص في صحة الأسنان',
  default: 'متخصص طبي ماهر وذو خبرة',
}

function DoctorCard({ doctor }: DoctorCardProps) {
  const specialtyKey = doctor.specialty.toLowerCase().replace(' ', '')
  const emoji = specialtyEmojis[specialtyKey] || specialtyEmojis.default
  const description = specialtyDescriptions[specialtyKey] || specialtyDescriptions.default

  return (
    <Link to={`/doctor/${doctor.id}`} className="no-underline">
      <article className="group h-full rounded-[1.75rem] border border-cyan-300/15 bg-white/5 p-5 shadow-[0_0_80px_rgba(34,211,238,0.08)] backdrop-blur-2xl transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:shadow-[0_0_120px_rgba(34,211,238,0.16)] cursor-pointer">
        {/* Small Specialty Icon */}
        <div className="text-3xl mb-3">{emoji}</div>

        <div>
          <p className="text-xs uppercase tracking-[0.38em] text-cyan-200/70">Doctor</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white group-hover:text-cyan-100 transition">
            {doctor.name}
          </h3>
          <p className="mt-1 text-sm text-cyan-100/90 font-medium">{doctor.specialty}</p>
        </div>

        {/* Specialty Description */}
        <div className="mt-4 rounded-lg border border-cyan-400/20 bg-slate-950/40 p-3 text-xs text-slate-300 leading-relaxed">
          <p>{description}</p>
        </div>

        {/* Bio */}
        <div className="mt-4 rounded-lg border border-white/10 bg-slate-950/55 p-3 text-sm text-slate-200">
          <p className="line-clamp-2">{doctor.bio || 'Specialist profile available on details page.'}</p>
        </div>

        <div
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-cyan-300/25 bg-gradient-to-r from-cyan-400/20 via-sky-500/20 to-emerald-400/20 px-4 py-2 text-sm font-semibold text-cyan-50 transition duration-200 group-hover:bg-cyan-400/25"
        >
          View Profile →
        </div>
      </article>
    </Link>
  )
}

export default DoctorCard
