import { ResolvedSeat, Person } from '../types'

interface Props {
  myPersonId: string | null
  resolvedSeats: ResolvedSeat[]
  people: Person[]
  date: string
}

export default function SeatAlert({ myPersonId, resolvedSeats, people, date }: Props) {
  if (!myPersonId) return null

  const mySeat = resolvedSeats.find(
    (s) => s.type === 'fixed' && s.personId === myPersonId
  ) ?? resolvedSeats.find(
    (s) => s.type === 'fixed' && s.label === people.find((p) => p.id === myPersonId)?.name
  )

  if (!mySeat) return null

  // Sitio OK — persona correcta o libre
  if (mySeat.personId === myPersonId && mySeat.status === 'occupied') return null
  if (mySeat.status === 'free') return null

  const today = new Date().toISOString().slice(0, 10)
  // Solo avisar para hoy o fechas futuras
  if (date < today) return null

  if (mySeat.status === 'absent') {
    return (
      <div className="mx-4 mt-3 px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-sm text-gray-600 flex items-center gap-2">
        <span className="text-lg">😶</span>
        <span>Tu sitio habitual está marcado como <strong>ausente</strong> hoy.</span>
      </div>
    )
  }

  if (mySeat.status === 'occupied' && mySeat.personId !== myPersonId) {
    const occupantName = mySeat.personName ?? 'alguien'
    return (
      <div className="mx-4 mt-3 px-4 py-3 bg-orange-50 border border-orange-300 rounded-xl text-sm text-orange-700 flex items-center gap-2">
        <span className="text-lg">⚠️</span>
        <span>Tu sitio habitual está ocupado hoy por <strong>{occupantName}</strong>.</span>
      </div>
    )
  }

  return null
}
