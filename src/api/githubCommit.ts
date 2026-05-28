const REPO = 'isaachuergabayon/seat-in-omni'
const FILE_PATH = 'public/data.json'
const BRANCH = 'main'

export const GH_TOKEN_KEY = 'seatInOmni_ghToken'

export function getStoredToken(): string {
  return localStorage.getItem(GH_TOKEN_KEY) ?? ''
}

export function saveToken(token: string) {
  localStorage.setItem(GH_TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(GH_TOKEN_KEY)
}

export async function publishToGitHub(jsonContent: string, token: string): Promise<void> {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  }

  // 1. Obtener el SHA actual del archivo
  const getRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
    { headers }
  )
  if (!getRes.ok) {
    const err = await getRes.json().catch(() => ({}))
    throw new Error(err?.message ?? `Error al obtener el archivo (${getRes.status})`)
  }
  const fileData = await getRes.json()
  const sha: string = fileData.sha

  // 2. Subir el nuevo contenido
  const content = btoa(unescape(encodeURIComponent(jsonContent)))
  const now = new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
  const putRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `chore: update office data [${now}]`,
        content,
        sha,
        branch: BRANCH,
      }),
    }
  )
  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}))
    throw new Error(err?.message ?? `Error al publicar (${putRes.status})`)
  }
}
