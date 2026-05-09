import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type TriageEntry = {
  id: string
  symptoms: string
  duration: string
  severity: string
  specialty: string
  triage_severity: 'urgent' | 'routine' | 'consultation'
  emergency_alert: boolean
  summary: string
  created_at: string
}

type TriageContextType = {
  entries: TriageEntry[]
  addEntry: (entry: TriageEntry) => void
  clearEntries: () => void
}

const TriageContext = createContext<TriageContextType | null>(null)

export function TriageProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<TriageEntry[]>([])

  const addEntry = useCallback((entry: TriageEntry) => {
    setEntries((prev) => [entry, ...prev])
  }, [])

  const clearEntries = useCallback(() => {
    setEntries([])
  }, [])

  return (
    <TriageContext.Provider value={{ entries, addEntry, clearEntries }}>
      {children}
    </TriageContext.Provider>
  )
}

export function useTriage() {
  const ctx = useContext(TriageContext)
  if (!ctx) throw new Error('useTriage must be used within TriageProvider')
  return ctx
}
