import { useEffect, useState } from 'react'
import { ref, onValue, set, remove } from 'firebase/database'
import { db } from '../firebase'

export function useDayNote(date: string) {
  const [note, setNote] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const noteRef = ref(db, `seatInOmni_notes/${date}`)
    const unsub = onValue(noteRef, (snapshot) => {
      setNote(snapshot.val() ?? '')
      setLoading(false)
    })
    return () => unsub()
  }, [date])

  const saveNote = (text: string) => {
    const noteRef = ref(db, `seatInOmni_notes/${date}`)
    if (text.trim() === '') {
      remove(noteRef)
    } else {
      set(noteRef, text.trim())
    }
  }

  return { note, loading, saveNote }
}
