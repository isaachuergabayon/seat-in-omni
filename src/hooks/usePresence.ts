import { useEffect, useState } from 'react'
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '../firebase'

function generateSessionId(): string {
  return Math.random().toString(36).slice(2, 10)
}

const SESSION_ID = generateSessionId()

export function usePresence(): number {
  const [count, setCount] = useState(1)

  useEffect(() => {
    const sessionRef = ref(db, `seatInOmni_presence/${SESSION_ID}`)
    const allRef = ref(db, 'seatInOmni_presence')

    // Esperar a que la autenticación anónima esté lista antes de escribir presencia.
    // Las reglas de Firebase exigen auth != null en seatInOmni_presence.
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return
      set(sessionRef, { connectedAt: serverTimestamp() })
      onDisconnect(sessionRef).remove()
    })

    // Escuchar el total de sesiones activas
    const unsubCount = onValue(allRef, (snapshot) => {
      const val = snapshot.val()
      setCount(val ? Object.keys(val).length : 1)
    })

    return () => {
      unsubAuth()
      unsubCount()
      set(sessionRef, null)
    }
  }, [])

  return count
}
