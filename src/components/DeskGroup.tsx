import { Person, ResolvedSeat, SeatStatus } from '../types'
import SeatCard from './SeatCard'

interface Props {
  deskId: string
  seats: ResolvedSeat[]
  label: string
  people?: Person[]
  assignedPersonIds?: Set<string>
  currentSeatId?: string
  onUpdate?: (seatId: string, status: SeatStatus, personId: string | null) => void
}

export default function DeskGroup({ deskId, seats, label, people, assignedPersonIds, onUpdate }: Props) {
  const topSeats = seats
    .filter((s) => s.position.startsWith('top'))
    .sort((a, b) => a.position.localeCompare(b.position))

  const bottomSeats = seats
    .filter((s) => s.position.startsWith('bottom'))
    .sort((a, b) => a.position.localeCompare(b.position))

  const cols = Math.max(topSeats.length, bottomSeats.length)

  // Mesas left y right: layout horizontal (columna izq | barra vertical | columna der)
  // Columna izquierda: posiciones que terminan en -1 (top-1, bottom-1 → fila 1 y 2 izq)
  // Columna derecha:   posiciones que terminan en -2 (top-2, bottom-2 → fila 1 y 2 der)
  const isVertical = deskId === 'left' || deskId === 'right'

  if (isVertical) {
    const leftCol = seats
      .filter((s) => s.position.endsWith('-1'))
      .sort((a, b) => a.position.localeCompare(b.position))
    const rightCol = seats
      .filter((s) => s.position.endsWith('-2'))
      .sort((a, b) => a.position.localeCompare(b.position))
    return (
      <div className="flex flex-col items-center gap-2 w-full md:w-auto">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
        <div className="flex flex-row items-stretch gap-2 w-full">
          {/* Columna izquierda */}
          <div className="flex flex-col gap-2 flex-1">
            {leftCol.map((seat) => (
              <SeatCard
                key={seat.id}
                seat={seat}
                people={people}
                assignedPersonIds={assignedPersonIds}
                onUpdate={onUpdate}
              />
            ))}
          </div>
          {/* Barra vertical central */}
          <div className="w-5 bg-gray-800 rounded-md self-stretch" />
          {/* Columna derecha */}
          <div className="flex flex-col gap-2 flex-1">
            {rightCol.map((seat) => (
              <SeatCard
                key={seat.id}
                seat={seat}
                people={people}
                assignedPersonIds={assignedPersonIds}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Mesas center y tech-desk: layout original (fila arriba, barra horizontal, fila abajo)
  return (
    <div className="flex flex-col items-center gap-2 w-full md:w-auto">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
      {/* Top row */}
      <div
        className="grid gap-2 w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {topSeats.map((seat) => (
          <SeatCard
            key={seat.id}
            seat={seat}
            people={people}
            assignedPersonIds={assignedPersonIds}
            onUpdate={onUpdate}
          />
        ))}
      </div>
      {/* Barra horizontal */}
      <div className="w-full h-5 bg-gray-800 rounded-md" />
      {/* Bottom row */}
      <div
        className="grid gap-2 w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {bottomSeats.map((seat) => (
          <SeatCard
            key={seat.id}
            seat={seat}
            people={people}
            assignedPersonIds={assignedPersonIds}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  )
}
