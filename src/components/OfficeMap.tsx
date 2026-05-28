import { Person, ResolvedSeat, SeatStatus } from '../types'
import DeskGroup from './DeskGroup'

interface Props {
  seats: ResolvedSeat[]
  people?: Person[]
  onUpdate?: (seatId: string, status: SeatStatus, personId: string | null) => void
}

const COM_DESKS = [
  { id: 'left' as const, label: 'Mesa izquierda' },
  { id: 'center' as const, label: 'Mesa central' },
  { id: 'right' as const, label: 'Mesa derecha' },
]

export default function OfficeMap({ seats, people, onUpdate }: Props) {
  const comSeats = seats.filter((s) => s.building === 'com')
  const techSeats = seats.filter((s) => s.building === 'tech')

  return (
    <div className="px-4 py-6 space-y-10">
      {/* ── EDIFICIO .COM ── */}
      <section>
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4 text-center px-1">
          Edificio .COM
        </h2>
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch md:items-start md:justify-center">
          {COM_DESKS.map(({ id, label }) => (
            <div key={id} className="w-full md:flex-1">
              <DeskGroup
                deskId={id}
                seats={comSeats.filter((s) => s.desk === id)}
                label={label}
                people={people}
                onUpdate={onUpdate}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── EDIFICIO TECNOLOGÍA ── */}
      {techSeats.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4 text-center px-1">
            Edificio Tecnología
          </h2>
          <div className="flex justify-center">
            <div className="w-full md:max-w-sm">
              <DeskGroup
                deskId="tech-desk"
                seats={techSeats}
                label="Mesa de 6"
                people={people}
                onUpdate={onUpdate}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
