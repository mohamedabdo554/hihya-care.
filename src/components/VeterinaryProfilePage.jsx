import { MapPin, Phone, Clock, Calendar, CreditCard, Heart, Facebook } from 'lucide-react'

const VetInfoCard = ({ icon: Icon, label, value }) =>
  value ? (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="mt-0.5 rounded-lg bg-emerald-500/15 p-2 text-emerald-300">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
        <p className="mt-1 text-sm font-medium text-slate-100">{value}</p>
      </div>
    </div>
  ) : null

export default function VeterinaryProfilePage({ doctor, onGoBack }) {
  const team = doctor.veterinaryTeam ?? []

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.16),_transparent_32%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(2,6,23,1))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
      <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute right-10 top-24 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-20 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={onGoBack}
          className="mb-8 flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.45em] text-emerald-200/70">Veterinary Clinic</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
            {doctor.name}
          </h1>
          <p className="mt-2 text-lg text-emerald-100/80">{doctor.specialty}</p>
        </div>

        {/* Bio / About */}
        <div className="mb-10 rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-6 backdrop-blur-xl">
          <h2 className="mb-3 text-sm uppercase tracking-[0.3em] text-emerald-200/60">About</h2>
          <p className="text-base leading-relaxed text-slate-200">{doctor.bio}</p>
        </div>

        {/* Info Grid */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <VetInfoCard icon={Phone} label="Phone" value={doctor.phone_number} />
          <VetInfoCard icon={MapPin} label="Location" value={doctor.clinicLocation} />
          <VetInfoCard icon={Calendar} label="Working Days" value={doctor.working_days} />
          <VetInfoCard icon={Clock} label="Working Hours" value={doctor.working_hours} />
          <VetInfoCard icon={CreditCard} label="Payment Methods" value={doctor.payment_method} />
          <VetInfoCard icon={Heart} label="Rescue Discount" value={doctor.rescue_discount} />
        </div>

        {/* Team */}
        {team.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-5 text-sm uppercase tracking-[0.3em] text-emerald-200/60">Medical Team</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {team.map((vet, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <div className="text-2xl mb-2">👨‍⚕️</div>
                  <h3 className="text-lg font-semibold text-white">{vet.name_ar}</h3>
                  <p className="text-sm text-emerald-200/80">{vet.specialty_ar}</p>
                  <p className="mt-1 text-xs text-slate-400">{vet.name}</p>
                  <p className="text-xs text-slate-500">{vet.specialty}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Facebook */}
        {doctor.facebook_url && (
          <a
            href={doctor.facebook_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-10 flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 px-5 py-3 text-sm text-blue-200 transition hover:bg-blue-500/20 w-fit"
          >
            <Facebook size={18} />
            Follow on Facebook
          </a>
        )}

        {/* Map link */}
        {doctor.clinic_link && (
          <a
            href={doctor.clinic_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/25 bg-gradient-to-r from-emerald-400/20 via-green-500/20 to-teal-400/20 px-6 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-400/25 w-fit"
          >
            <MapPin size={16} />
            View on Google Maps
          </a>
        )}
      </div>
    </main>
  )
}
