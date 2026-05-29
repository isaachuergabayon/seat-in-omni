import { useEffect, useState } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { db } from '../firebase'
import { ChangeLogEntry } from '../types'
import { generateId } from '../utils'

const LOG_REF = 'seatInOmni_log'
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function useChangeLog() {
  const [entries, setEntries] = useState<ChangeLogEntry[]>([])

  useEffect(() => {
    const unsub = onValue(ref(db, LOG_REF), (snapshot) => {
      const val = snapshot.val()
      if (!val) { setEntries([]); return }
      const list: ChangeLogEntry[] = Array.isArray(val) ? val : Object.values(val)
      const sorted = list
        .filter((e) => e && e.ts)
        .sort((a, b) => b.ts - a.ts)
      setEntries(sorted)
    })
    return () => unsub()
  }, [])

  const logChange = (action: string, category: ChangeLogEntry['category']) => {
    const now = Date.now()
    const cutoff = now - WEEK_MS
    const newEntry: ChangeLogEntry = { id: generateId(), ts: now, action, category }

    // Leer entradas actuales, añadir la nueva y purgar las antiguas
    onValue(ref(db, LOG_REF), (snapshot) => {
      const val = snapshot.val()
      const existing: ChangeLogEntry[] = val
        ? (Array.isArray(val) ? val : Object.values(val)).filter((e: ChangeLogEntry) => e && e.ts >= cutoff)
        : []
      const updated = [...existing, newEntry]
      set(ref(db, LOG_REF), updated)
    }, { onlyOnce: true })
  }

  const clearLog = () => set(ref(db, LOG_REF), [])

  return { entries, logChange, clearLog }
}
