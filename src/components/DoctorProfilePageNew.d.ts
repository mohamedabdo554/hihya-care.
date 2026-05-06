import { type Doctor } from '../DoctorCard'

export interface DoctorProfilePageNewProps {
  doctor: Doctor
  onBooking?: (doctorId: string, date: string, time: string) => void
  onGoBack?: () => void
}

declare function DoctorProfilePageNew(props: DoctorProfilePageNewProps): JSX.Element

export default DoctorProfilePageNew
