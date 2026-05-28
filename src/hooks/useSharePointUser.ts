import { useEffect, useState } from 'react'
import { ADMIN_USERS } from '../config/admins'

interface SharePointUserResult {
  isAdmin: boolean
  loading: boolean
}

// Detecta si estamos en SharePoint o en local
function isSharePointEnv(): boolean {
  return window.location.hostname.includes('sharepoint.com')
}

// Extrae el login del AccountName de SharePoint
// Formato típico: "i:0#.f|membership|isaachb@inditex.com"
// o simplemente "isaachb@inditex.com"
function extractLogin(accountName: string): string {
  const parts = accountName.split('|')
  const email = parts[parts.length - 1].toLowerCase()
  // Devuelve la parte antes del @ si hay dominio, si no el valor completo
  return email.includes('@') ? email.split('@')[0] : email
}

export function useSharePointUser(): SharePointUserResult {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // En local siempre es admin (modo desarrollo)
    if (!isSharePointEnv()) {
      setIsAdmin(true)
      setLoading(false)
      return
    }

    // En SharePoint: consultar el perfil del usuario actual
    fetch('/_api/SP.UserProfiles.PeopleManager/GetMyProperties', {
      headers: { Accept: 'application/json;odata=verbose' },
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((json) => {
        const accountName: string =
          json?.d?.AccountName ?? json?.AccountName ?? ''
        const login = extractLogin(accountName)
        setIsAdmin(ADMIN_USERS.includes(login))
      })
      .catch(() => {
        // Si falla la llamada (permisos, red...) → no es admin por seguridad
        setIsAdmin(false)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return { isAdmin, loading }
}
