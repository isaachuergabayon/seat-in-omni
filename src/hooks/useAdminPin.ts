import { ADMIN_PIN_HASH } from '../config/adminHash'

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function validatePin(pin: string): Promise<boolean> {
  const hash = await sha256(pin)
  return hash === ADMIN_PIN_HASH
}
