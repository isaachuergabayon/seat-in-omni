import { useEffect, useState } from 'react'
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database'
import { db } from '../firebase'

function generateSessionId(): string {
  return Math.random().toString(36).slice(2, 10)
}

const SESSION_ID = generateSessionId()

export function usePresence(): number {
  const [count, setCount] = useState(1)

  useEffect(() => {
    const sessionRef = ref(db, `seatInOmni_presence/${SESSION_ID}`)
    const allRef = ref(db, 'seatInOmni_presence')

    // Registrar esta sesión
    set(sessionRef, { connectedAt: serverTimestamp() })

    // Eliminar al desconectar
    onDisconnect(sessionRef).remove()

    // Escuchar el total de sesiones activas
    const unsub = onValue(allRef, (snapshot) => {
      const val = snapshot.val()
      setCount(val ? Object.keys(val).length : 1)
    })

    return () => {
      unsub()
      set(sessionRef, null)
    }
  }, [])

  return count
}
