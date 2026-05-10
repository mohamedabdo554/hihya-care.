import { Link } from 'react-router-dom'

export type VeterinaryTeamMember = {
  name: string
  name_ar: string
  specialty: string
  specialty_ar: string
}

export type Doctor = {
  id: string
  name: string
  specialty: string
  image_url?: string | null
  bio?: string | null
  price: string
  experience?: string
  clinicLocation?: string
  category?: 'human' | 'veterinary'
  veterinaryTeam?: VeterinaryTeamMember[]
  phone_number?: string
  clinic_link?: string
  facebook_url?: string
  working_days?: string
  working_hours?: string
  payment_method?: string
  rescue_discount?: string
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
  const isVet = doctor.category === 'veterinary'
  const specialtyKey = doctor.specialty?.toLowerCase().replace(' ', '') || ''
  const emoji = isVet ? '🐾' : (specialtyEmojis[specialtyKey] || specialtyEmojis.default)
  const description = isVet ? doctor.bio : (specialtyDescriptions[specialtyKey] || specialtyDescriptions.default)

  return (
    <Link to={`/doctor/${doctor.id}`} className="no-underline">
      <article className={`group h-full rounded-[1.75rem] border-2 p-5 shadow-lg backdrop-blur-2xl transition-all duration-200 hover:-translate-y-1 cursor-pointer ${
        isVet
          ? 'border-amber-500/30 bg-gradient-to-br from-amber-700/15 via-amber-600/8 to-orange-700/15 hover:border-amber-400/50 hover:shadow-amber-500/20 hover:shadow-xl'
          : 'border-cyan-400/20 bg-white/5 hover:border-cyan-300/40 hover:shadow-cyan-500/20 hover:shadow-xl'
      }`}>
        {/* Small Specialty Icon */}
        <div className="text-4xl mb-3">{emoji}</div>

        <div>
          <p className={`text-[11px] uppercase tracking-[0.38em] font-bold ${isVet ? 'text-amber-300' : 'text-cyan-200'}`}>
            {isVet ? 'عيادة بيطرية' : 'Doctor'}
          </p>
          <h3 className={`mt-2 text-xl font-bold tracking-tight transition ${isVet ? 'text-white group-hover:text-amber-200' : 'text-white group-hover:text-cyan-100'}`}>
            {doctor.name}
          </h3>
          <p className={`mt-1 text-sm font-semibold ${isVet ? 'text-amber-200' : 'text-cyan-100'}`}>{doctor.specialty}</p>
        </div>

        {/* Vet Team */}
        {isVet && doctor.veterinaryTeam?.length ? (
          <div className="mt-4 space-y-1.5">
            {doctor.veterinaryTeam.map((vet, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-900/20 px-3 py-2.5">
                <span className="text-sm font-semibold text-white">{vet.name_ar}</span>
                <span className="text-xs font-medium text-amber-200">{vet.specialty_ar}</span>
              </div>
            ))}
          </div>
        ) : null}

        {/* Specialty Description / Bio */}
        <div className={`mt-4 rounded-lg border p-3 text-sm leading-relaxed font-medium ${
          isVet
            ? 'border-amber-500/20 bg-amber-900/10 text-amber-50'
            : 'border-cyan-400/20 bg-slate-950/40 text-slate-200'
        }`}>
          <p>{description}</p>
        </div>

        {/* Clinic Info for Vets */}
        {isVet ? (
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-amber-100 font-medium">
            {doctor.phone_number ? <span>📞 {doctor.phone_number}</span> : null}
            {doctor.price ? <span>💰 {doctor.price}</span> : null}
            {doctor.working_hours ? <span>🕐 {doctor.working_hours}</span> : null}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-white/10 bg-slate-950/55 p-3 text-sm text-slate-200">
            <p className="line-clamp-2">{doctor.bio || 'Specialist profile available on details page.'}</p>
          </div>
        )}

        <div
          className={`mt-4 inline-flex w-full items-center justify-center rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition duration-200 ${
            isVet
              ? 'border-amber-500/40 bg-amber-600 text-white shadow-lg hover:bg-amber-500 hover:shadow-amber-500/30'
              : 'border-cyan-400/30 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-400 hover:to-emerald-400'
          }`}
        >
          {isVet ? 'عرض العيادة' : 'View Profile'} →
        </div>
      </article>
    </Link>
  )
}

export default DoctorCard
