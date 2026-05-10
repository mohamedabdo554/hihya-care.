import { type Doctor } from '../DoctorCard'

export interface VeterinaryProfilePageProps {
  doctor: Doctor
  onGoBack?: () => void
}

declare function VeterinaryProfilePage(props: VeterinaryProfilePageProps): JSX.Element

export default VeterinaryProfilePage
