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

  // Mesas left y right: layout horizontal (sitios | barra vertical | sitios)
  const isVertical = deskId === 'left' || deskId === 'right'

  if (isVertical) {
    return (
      <div className="flex flex-col items-center gap-2 w-full md:w-auto">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
        <div className="flex flex-row items-stretch gap-2 w-full">
          {/* Columna top (izquierda de la barra) */}
          <div className="flex flex-col gap-2 flex-1">
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
          {/* Barra vertical central */}
          <div className="w-5 bg-gray-800 rounded-md self-stretch" />
          {/* Columna bottom (derecha de la barra) */}
          <div className="flex flex-col gap-2 flex-1">
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
