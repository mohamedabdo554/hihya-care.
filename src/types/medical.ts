export type TriageSeverity = 'urgent' | 'routine' | 'consultation'

export type TriageResult = {
  summary: string
  severity: TriageSeverity
  specialty: string
  recommendedDoctorId: string | null
  recommendedDoctorName: string
  recommendationReason: string
  emergencyAlert: boolean
  symptoms: string[]
  duration: string
  severityLevel: 'mild' | 'moderate' | 'severe'
  createdAt: string
}

export type Appointment = {
  id: string
  patient_name: string
  patient_phone: string
  appointment_date: string
  appointment_time: string
  status: 'booked' | 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  doctor_id: string
  source?: string
  notes?: string
  priority?: string
  payment_method?: string
  total_price?: number
}

export type DoctorProfile = {
  id: string
  name: string
  specialty: string
  phone_number: string
  clinic_status: 'open' | 'break' | 'closed'
  email?: string
  price?: number
}

export type DashboardStats = {
  todayAppointments: number
  waitingCount: number
  completedCount: number
  cancelledCount: number
  noShowCount: number
  totalRevenue: number
  pendingPayments: number
  satisfactionRate: number
  monthlyRevenue: number
  patientVolume: number
}

export type MonthlyDataPoint = {
  month: string
  revenue: number
  patients: number
}

export type DiagnosisDataPoint = {
  name: string
  value: number
  color: string
}
