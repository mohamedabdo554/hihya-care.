import { type Doctor } from '../DoctorCard'

export interface VeterinaryCardProps {
  doctor: Doctor
}

declare function VeterinaryCard(props: VeterinaryCardProps): JSX.Element

export default VeterinaryCard
