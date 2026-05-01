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
  index: number
}

const avatarStyles = [
  'from-cyan-400/30 via-sky-500/20 to-emerald-400/25',
  'from-indigo-400/30 via-cyan-500/20 to-sky-400/25',
  'from-emerald-400/30 via-cyan-400/20 to-teal-400/25',
  'from-sky-400/30 via-indigo-500/20 to-cyan-400/25',
]

function DoctorCard({ doctor, index }: DoctorCardProps) {
  const avatarGradient = avatarStyles[index % avatarStyles.length]

  return (
    <article className="group rounded-[1.75rem] border border-cyan-300/15 bg-white/5 p-5 shadow-[0_0_80px_rgba(34,211,238,0.08)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_0_120px_rgba(34,211,238,0.16)]">
      <div className={`flex h-18 w-18 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br ${avatarGradient} shadow-inner`}>
        {doctor.image_url ? (
          <img src={doctor.image_url} alt={doctor.name} className="h-full w-full object-cover" />
        ) : (
          <svg viewBox="0 0 24 24" className="h-9 w-9 text-white/90" fill="none" aria-hidden="true">
            <path
              d="M12 12.4C14.2091 12.4 16 10.6091 16 8.4C16 6.19086 14.2091 4.4 12 4.4C9.79086 4.4 8 6.19086 8 8.4C8 10.6091 9.79086 12.4 12 12.4Z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M4.8 19.2C5.9 15.9 8.6 14.2 12 14.2C15.4 14.2 18.1 15.9 19.2 19.2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      <div className="mt-5">
        <p className="text-xs uppercase tracking-[0.38em] text-cyan-200/70">Doctor</p>
        <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
          {doctor.name}
        </h3>
        <p className="mt-1 text-sm text-cyan-100/80">{doctor.specialty}</p>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/55 p-4 text-sm text-slate-300">
        <p>{doctor.bio || 'Cinematic specialist profile available on the details page.'}</p>
      </div>

      <Link
        to={`/doctor/${doctor.id}`}
        className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-cyan-300/25 bg-gradient-to-r from-cyan-400/20 via-sky-500/20 to-emerald-400/20 px-4 py-3 text-sm font-semibold text-cyan-100 transition duration-300 hover:-translate-y-0.5 hover:bg-cyan-400/25"
      >
        View Profile
      </Link>
    </article>
  )
}

export default DoctorCard
