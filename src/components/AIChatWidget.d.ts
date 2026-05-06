import { ReactNode } from 'react'

export type AIChatDoctor = {
  id?: string
  name?: string
  specialty?: string
  price?: string | number
  tele_consultation?: boolean
  next_available_slot?: string | null
}

export default function AIChatWidget(props?: { doctors?: AIChatDoctor[] }): ReactNode
