import { type Doctor } from '../DoctorCard'

export interface BookingData {
  patientName: string
  phoneNumber: string
  doctorId: string
  doctorName: string
  date: string
  time: string
  priority: 'normal' | 'urgent' | 'vip'
  paymentMethod: 'cash' | 'online'
  notes: string
  totalPrice: number
  timestamp: string
}

export interface EnhancedBookingFlowProps {
  doctor: Doctor
  onConfirm?: (bookingData: BookingData, whatsappLink: string) => void
  onCancel?: () => void
}

declare function EnhancedBookingFlow(props: EnhancedBookingFlowProps): JSX.Element

export default EnhancedBookingFlow
