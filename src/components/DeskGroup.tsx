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
  highlightPersonId?: string | null
}

export default function DeskGroup({ deskId, seats, label, people, assignedPersonIds, onUpdate, highlightPersonId }: Props) {
  const topSeats = seats
    .filter((s) => s.position.startsWith('top'))
    .sort((a, b) => a.position.localeCompare(b.position))

  const bottomSeats = seats
    .filter((s) => s.position.startsWith('bottom'))
    .sort((a, b) => a.position.localeCompare(b.position))

  const cols = Math.max(topSeats.length, bottomSeats.length)

  const isVertical = deskId === 'left' || deskId === 'right'

  if (isVertical) {
    const sortVertical = (a: ResolvedSeat, b: ResolvedSeat) => {
      const rowA = a.position.startsWith('top') ? 0 : 1
      const rowB = b.position.startsWith('top') ? 0 : 1
      return rowA - rowB
    }
    const leftCol = seats.filter((s) => s.position.endsWith('-1')).sort(sortVertical)
    const rightCol = seats.filter((s) => s.position.endsWith('-2')).sort(sortVertical)
    return (
      <div className="flex flex-col items-center gap-2 w-full md:w-auto">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
        <div className="flex flex-row items-stretch gap-2 w-full">
          <div className="flex flex-col gap-2 flex-1">
            {leftCol.map((seat) => (
              <SeatCard
                key={seat.id}
                seat={seat}
                people={people}
                assignedPersonIds={assignedPersonIds}
                onUpdate={onUpdate}
                highlighted={highlightPersonId != null && seat.personId === highlightPersonId}
              />
            ))}
          </div>
          <div className="w-5 bg-gray-800 rounded-md self-stretch" />
          <div className="flex flex-col gap-2 flex-1">
            {rightCol.map((seat) => (
              <SeatCard
                key={seat.id}
                seat={seat}
                people={people}
                assignedPersonIds={assignedPersonIds}
                onUpdate={onUpdate}
                highlighted={highlightPersonId != null && seat.personId === highlightPersonId}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full md:w-auto">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
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
            highlighted={highlightPersonId != null && seat.personId === highlightPersonId}
          />
        ))}
      </div>
      <div className="w-full h-5 bg-gray-800 rounded-md" />
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
            highlighted={highlightPersonId != null && seat.personId === highlightPersonId}
          />
        ))}
      </div>
    </div>
  )
}
