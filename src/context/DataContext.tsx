import React, { createContext, useContext, useEffect, useState } from 'react'
import { AppData } from '../types'

interface PersistedData {
  assignments: AppData['assignments']
  specialDays: AppData['specialDays']
  // Todas las plantillas: protegidas modificadas + custom
  allTemplates: AppData['templates']
  // Solo las personas añadidas por el admin (no las del seed)
  extraPeople: AppData['people']
}

interface DataContextType {
  data: AppData | null
  setData: (data: AppData) => void
  loading: boolean
}

const DataContext = createContext<DataContextType>({
  data: null,
  setData: () => {},
  loading: true,
})

function loadPersisted(): PersistedData | null {
  try {
    const saved = localStorage.getItem('seatInOmni_persisted')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function savePersisted(data: AppData, basePeopleIds: Set<string>) {
  try {
    const persisted: PersistedData = {
      assignments: data.assignments,
      specialDays: data.specialDays,
      // Guardamos TODAS las plantillas (incluyendo las protegidas modificadas)
      allTemplates: data.templates,
      // Solo guardamos las personas que NO son del seed original
      extraPeople: data.people.filter((p) => !basePeopleIds.has(p.id)),
    }
    localStorage.setItem('seatInOmni_persisted', JSON.stringify(persisted))
  } catch {
    // ignore
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<AppData | null>(null)
  const [basePeopleIds, setBasePeopleIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Leer localStorage síncronamente ANTES del fetch
    const persisted = loadPersisted()

    fetch('./data.json?v=' + Date.now())
      .then((r) => r.json())
      .then((base: AppData) => {
        const baseIds = new Set(base.people.map((p) => p.id))
        setBasePeopleIds(baseIds)

        // People: seed siempre + extras del localStorage
        const extraPeople = persisted?.extraPeople?.filter((p) => !baseIds.has(p.id)) ?? []
        const mergedPeople = [...base.people, ...extraPeople]

        // Templates: si hay guardadas en localStorage, usarlas (tienen precedencia)
        // pero asegurar que los IDs protegidos existan (fallback al data.json si falta alguno)
        let mergedTemplates: AppData['templates']
        if (persisted?.allTemplates && persisted.allTemplates.length > 0) {
          const persistedIds = new Set(persisted.allTemplates.map((t) => t.id))
          // Añadir plantillas del seed que no estén en el localStorage (nuevas incorporadas)
          const missingFromBase = base.templates.filter((t) => !persistedIds.has(t.id))
          mergedTemplates = [...persisted.allTemplates, ...missingFromBase]
        } else {
          mergedTemplates = base.templates
        }

        const merged: AppData = {
          seats: base.seats,
          people: mergedPeople,
          templates: mergedTemplates,
          assignments: persisted?.assignments ?? base.assignments,
          specialDays: persisted?.specialDays ?? base.specialDays,
        }
        setDataState(merged)
        setLoading(false)
      })
  }, [])

  const setData = (newData: AppData) => {
    setDataState(newData)
    savePersisted(newData, basePeopleIds)
  }

  return (
    <DataContext.Provider value={{ data, setData, loading }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
