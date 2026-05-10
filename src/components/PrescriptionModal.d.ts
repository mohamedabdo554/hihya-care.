export interface PrescriptionModalProps {
  doctor: { id: string; name: string; specialty: string; phone_number: string; clinic_status: string }
  appointment: { id: string; patient_name: string; patient_phone?: string; appointment_date?: string; appointment_time?: string; status?: string; doctor_id?: string; [key: string]: any }
  onClose: () => void
}

declare function PrescriptionModal(props: PrescriptionModalProps): JSX.Element
export default PrescriptionModal
