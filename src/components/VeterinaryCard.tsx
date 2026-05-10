import { Link } from 'react-router-dom'
import type { Doctor } from '../DoctorCard'

type VeterinaryCardProps = {
  doctor: Doctor
}

export default function VeterinaryCard({ doctor }: VeterinaryCardProps) {
  return (
    <Link to={`/veterinary/${doctor.id}`} className="no-underline">
      <article className="group h-full rounded-[1.75rem] border border-emerald-300/15 bg-white/5 p-5 shadow-[0_0_80px_rgba(16,185,129,0.08)] backdrop-blur-2xl transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300/30 hover:shadow-[0_0_120px_rgba(16,185,129,0.16)] cursor-pointer">
        <div className="text-3xl mb-3">🐾</div>

        <div>
          <p className="text-xs uppercase tracking-[0.38em] text-emerald-200/70">Veterinary Clinic</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white group-hover:text-emerald-100 transition">
            {doctor.name}
          </h3>
          <p className="mt-1 text-sm text-emerald-100/90 font-medium">{doctor.specialty}</p>
        </div>

        <div className="mt-4 rounded-lg border border-emerald-400/20 bg-slate-950/40 p-3 text-xs text-slate-300 leading-relaxed">
          <p>{doctor.bio}</p>
        </div>

        {doctor.veterinaryTeam && doctor.veterinaryTeam.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/60">Medical Team</p>
            {doctor.veterinaryTeam.map((vet, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2">
                <span className="text-sm font-medium text-slate-100">{vet.name_ar}</span>
                <span className="text-xs text-emerald-200/80">{vet.specialty_ar}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 space-y-1.5 text-xs text-slate-400">
          {doctor.phone_number && (
            <p className="flex items-center gap-2">
              <span>📞</span>
              <span dir="ltr">{doctor.phone_number}</span>
            </p>
          )}
          {doctor.working_days && (
            <p className="flex items-center gap-2">
              <span>📅</span>
              <span>{doctor.working_days}</span>
            </p>
          )}
          {doctor.working_hours && (
            <p className="flex items-center gap-2">
              <span>🕐</span>
              <span>{doctor.working_hours}</span>
            </p>
          )}
          {doctor.price && (
            <p className="flex items-center gap-2">
              <span>💰</span>
              <span>{doctor.price}</span>
            </p>
          )}
        </div>

        <div className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-emerald-300/25 bg-gradient-to-r from-emerald-400/20 via-green-500/20 to-teal-400/20 px-4 py-2 text-sm font-semibold text-emerald-50 transition duration-200 group-hover:bg-emerald-400/25">
          View Clinic Details →
        </div>
      </article>
    </Link>
  )
}
