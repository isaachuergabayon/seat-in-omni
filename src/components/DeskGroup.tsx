import { Person, ResolvedSeat, SeatStatus } from '../types'
import SeatCard from './SeatCard'

interface Props {
  deskId: string
  seats: ResolvedSeat[]
  label: string
  people?: Person[]
  onUpdate?: (seatId: string, status: SeatStatus, personId: string | null) => void
}

export default function DeskGroup({ seats, label, people, onUpdate }: Props) {
  const topSeats = seats
    .filter((s) => s.position.startsWith('top'))
    .sort((a, b) => a.position.localeCompare(b.position))

  const bottomSeats = seats
    .filter((s) => s.position.startsWith('bottom'))
    .sort((a, b) => a.position.localeCompare(b.position))

  const cols = Math.max(topSeats.length, bottomSeats.length)

  return (
    <div className="flex flex-col items-center gap-2 w-full md:w-auto">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
      {/* Top row */}
      <div
        className="grid gap-2 w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {topSeats.map((seat) => (
          <SeatCard key={seat.id} seat={seat} people={people} onUpdate={onUpdate} />
        ))}
      </div>
      {/* Desk body */}
      <div className="w-full h-5 bg-gray-800 rounded-md" />
      {/* Bottom row */}
      <div
        className="grid gap-2 w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {bottomSeats.map((seat) => (
          <SeatCard key={seat.id} seat={seat} people={people} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  )
}
