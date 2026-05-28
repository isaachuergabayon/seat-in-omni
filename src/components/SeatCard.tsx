import { useEffect, useRef, useState } from 'react'
import { Person, ResolvedSeat, SeatStatus } from '../types'

interface Props {
  seat: ResolvedSeat
  onUpdate?: (seatId: string, status: SeatStatus, personId: string | null) => void
  people?: Person[]
  assignedPersonIds?: Set<string>
}

const statusStyles: Record<string, string> = {
  occupied: 'bg-red-100 border-red-300 text-red-800',
  free: 'bg-green-100 border-green-300 text-green-800',
  absent: 'bg-gray-100 border-gray-300 text-gray-400',
}

const statusLabel: Record<string, string> = {
  occupied: 'Ocupado',
  free: 'Libre',
  absent: 'Ausente',
}

export default function SeatCard({ seat, onUpdate, people = [], assignedPersonIds = new Set() }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const style = statusStyles[seat.status]
  const label = seat.personName ?? seat.label ?? 'Libre'
  const isEditable = !!onUpdate

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen((v) => !v)}
        className={`relative border-2 rounded-lg px-2 py-2 text-center text-xs font-semibold shadow-sm w-full transition
          ${style}
          ${isEditable ? 'cursor-pointer hover:brightness-95 active:scale-95' : 'cursor-default'}
        `}
      >
        {seat.type === 'hot' && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
        )}
        <div className="text-sm font-bold leading-tight break-words">{label}</div>
        <div className="text-[10px] mt-0.5 opacity-70">{statusLabel[seat.status]}</div>
      </div>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-xl shadow-xl p-3 min-w-[160px]">
          <div className="text-xs font-bold text-gray-700 mb-2 text-center">{seat.label ?? 'Sitio caliente'}</div>

          {isEditable ? (
            <EditPopover
              key={seat.id + seat.status + (seat.personName ?? '')}
              seat={seat}
              people={people}
              assignedPersonIds={assignedPersonIds}
              onUpdate={(status, personId) => {
                onUpdate!(seat.id, status, personId)
                setOpen(false)
              }}
              onClose={() => setOpen(false)}
            />
          ) : (
            <ReadPopover seat={seat} />
          )}
        </div>
      )}
    </div>
  )
}

// ── Solo lectura ──────────────────────────────────────────────────────────────
function ReadPopover({ seat }: { seat: ResolvedSeat }) {
  return (
    <div className="text-center text-xs text-gray-500 space-y-1">
      <div>
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold
            ${seat.status === 'occupied' ? 'bg-red-100 text-red-700' : seat.status === 'free' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
        >
          {seat.status === 'occupied' ? 'Ocupado' : seat.status === 'free' ? 'Libre' : 'Ausente'}
        </span>
      </div>
      {seat.personName && <div className="font-semibold text-gray-700">{seat.personName}</div>}
      {seat.type === 'hot' && <div className="text-emerald-500">● sitio caliente</div>}
    </div>
  )
}

// ── Editable ──────────────────────────────────────────────────────────────────
function EditPopover({
  seat,
  people,
  assignedPersonIds,
  onUpdate,
  onClose,
}: {
  seat: ResolvedSeat
  people: Person[]
  assignedPersonIds: Set<string>
  onUpdate: (status: SeatStatus, personId: string | null) => void
  onClose: () => void
}) {
  // personId viene directamente del ResolvedSeat — no hay que buscarlo por nombre
  const currentPersonId = seat.personId ?? null

  const [status, setStatus] = useState<SeatStatus>(seat.status)
  const [personId, setPersonId] = useState<string | null>(currentPersonId)

  // Bug 2: al cambiar a libre o ausente, limpiar la persona seleccionada
  const handleStatusChange = (newStatus: SeatStatus) => {
    setStatus(newStatus)
    if (newStatus !== 'occupied') {
      setPersonId(null)
    }
  }

  const handleSave = () => {
    // Bug 3: si status es occupied pero no hay persona → guardar como occupied sin persona
    // Bug 2: si no es occupied → personId siempre null
    const finalPersonId = status === 'occupied' ? personId : null
    onUpdate(status, finalPersonId)
  }

  // Bug 4: filtrar personas ya asignadas en otros sitios
  // Se permite mantener la persona del sitio actual (currentPersonId)
  const availablePeople = people
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((p) => !assignedPersonIds.has(p.id) || p.id === currentPersonId)

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-[10px] text-gray-400 mb-0.5">Estado</label>
        <div className="flex gap-1">
          {(['occupied', 'free', 'absent'] as SeatStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`flex-1 text-[10px] py-1 rounded border transition font-medium
                ${status === s
                  ? s === 'occupied' ? 'bg-red-200 border-red-400 text-red-800'
                    : s === 'free' ? 'bg-green-200 border-green-400 text-green-800'
                    : 'bg-gray-200 border-gray-400 text-gray-600'
                  : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                }`}
            >
              {s === 'occupied' ? 'Ocup.' : s === 'free' ? 'Libre' : 'Aus.'}
            </button>
          ))}
        </div>
      </div>

      {status === 'occupied' && (
        <div>
          <label className="block text-[10px] text-gray-400 mb-0.5">Persona</label>
          <select
            value={personId ?? ''}
            onChange={(e) => setPersonId(e.target.value || null)}
            className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
          >
            <option value="">-- Sin asignar --</option>
            {availablePeople.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-1 pt-1">
        <button
          onClick={handleSave}
          className="flex-1 bg-gray-800 text-white text-[10px] py-1 rounded hover:bg-gray-700 transition"
        >
          Guardar
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-gray-100 text-gray-600 text-[10px] py-1 rounded hover:bg-gray-200 transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
