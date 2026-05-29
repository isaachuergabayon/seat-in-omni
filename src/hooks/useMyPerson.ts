import { useState } from 'react'

const KEY = 'seatInOmni_myPerson'

export function useMyPerson() {
  const [myPersonId, setMyPersonIdState] = useState<string | null>(
    () => localStorage.getItem(KEY)
  )

  const setMyPersonId = (id: string | null) => {
    if (id) {
      localStorage.setItem(KEY, id)
    } else {
      localStorage.removeItem(KEY)
    }
    setMyPersonIdState(id)
  }

  return { myPersonId, setMyPersonId }
}
