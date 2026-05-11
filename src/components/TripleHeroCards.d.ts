import { ReactNode } from 'react'

export type BookingType = 'tele-consultation' | 'clinic-visit' | 'urgent-care'

export default function TripleHeroCards(props?: {
  onSelect?: (type: BookingType) => void
  activeBookingType?: BookingType | null
}): ReactNode
