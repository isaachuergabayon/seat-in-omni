import React, { createContext, useContext, useEffect, useState } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { db } from '../firebase'
import { AppData } from '../types'

interface FirebaseData {
  assignments: AppData['assignments']
  specialDays: AppData['specialDays']
  allTemplates: AppData['templates']
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

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [baseData, setBaseData] = useState<AppData | null>(null)
  const [firebaseData, setFirebaseData] = useState<FirebaseData | null>(null)
  const [loading, setLoading] = useState(true)

  // 1. Cargar seed desde data.json
  useEffect(() => {
    fetch('./data.json?v=' + Date.now())
      .then((r) => r.json())
      .then((base: AppData) => setBaseData(base))
  }, [])

  // 2. Suscribirse a Firebase en tiempo real
  useEffect(() => {
    const fbRef = ref(db, 'seatInOmni')
    const unsub = onValue(fbRef, (snapshot) => {
      const val = snapshot.val()
      setFirebaseData(val ?? {})
      setLoading(false)
    })
    return () => unsub()
  }, [])

  // 3. Merge: seed + Firebase
  const data: AppData | null = baseData
    ? (() => {
        const baseIds = new Set(baseData.people.map((p) => p.id))
        const extraPeople = (firebaseData?.extraPeople ?? []).filter((p) => !baseIds.has(p.id))

        let mergedTemplates: AppData['templates']
        const fbTemplates = firebaseData?.allTemplates
        if (fbTemplates && fbTemplates.length > 0) {
          const fbIds = new Set(fbTemplates.map((t) => t.id))
          const missing = baseData.templates.filter((t) => !fbIds.has(t.id))
          mergedTemplates = [...fbTemplates, ...missing]
        } else {
          mergedTemplates = baseData.templates
        }

        return {
          seats: baseData.seats,
          people: [...baseData.people, ...extraPeople],
          templates: mergedTemplates,
          assignments: firebaseData?.assignments ?? baseData.assignments,
          specialDays: firebaseData?.specialDays ?? baseData.specialDays,
        }
      })()
    : null

  const setData = (newData: AppData) => {
    if (!baseData) return
    const baseIds = new Set(baseData.people.map((p) => p.id))
    const payload: FirebaseData = {
      assignments: newData.assignments ?? [],
      specialDays: newData.specialDays ?? [],
      allTemplates: newData.templates ?? [],
      extraPeople: newData.people.filter((p) => !baseIds.has(p.id)),
    }
    set(ref(db, 'seatInOmni'), payload)
  }

  return (
    <DataContext.Provider value={{ data, loading: loading || !baseData, setData }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
