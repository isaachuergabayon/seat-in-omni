import { useState } from 'react'
import { AppData, Person, ResolvedSeat, SeatStatus } from '../types'
import { getWeekDates, parseDate, resolveSeatsForDate } from '../utils'

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
const DAY_LABELS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const STATUS_COLORS: Record<SeatStatus, string> = {
  free: 'bg-green-100 text-green-700 border-green-200',
  occupied: 'bg-red-100 text-red-700 border-red-200',
  absent: 'bg-gray-100 text-gray-500 border-gray-200',
}

const STATUS_DOT: Record<SeatStatus, string> = {
  free: 'bg-green-400',
  occupied: 'bg-red-400',
  absent: 'bg-gray-300',
}

interface EditPopover {
  seatId: string
  date: string
  status: SeatStatus
  personId: string | null
}

interface Props {
  data: AppData
  currentDate: string
  onUpdate: (seatId: string, status: SeatStatus, personId: string | null, date: string) => void
}

export default function WeekView({ data, currentDate, onUpdate }: Props) {
  const weekDates = getWeekDates(currentDate)
  const [editing, setEditing] = useState<EditPopover | null>(null)

  const resolvedByDate: Record<string, ResolvedSeat[]> = {}
  weekDates.forEach((d) => {
    resolvedByDate[d] = resolveSeatsForDate(data, d)
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <>
      {/* ── MOBILE: lista compacta por día ── */}
      <div className="md:hidden px-4 py-4 space-y-4">
        {weekDates.map((d, i) => {
          const seats = resolvedByDate[d]
          const occupied = seats.filter((s) => s.status === 'occupied' || s.status === 'absent')
          const dayDate = parseDate(d)
          const isPast = dayDate < today
          const isToday = d === weekDates.find((_, idx) => {
            const dd = parseDate(weekDates[idx])
            dd.setHours(0, 0, 0, 0)
            return dd.getTime() === today.getTime()
          })

          return (
            <div key={d} className={`rounded-xl border ${isPast ? 'opacity-50' : ''} ${isToday ? 'border-gray-800' : 'border-gray-200'} bg-white overflow-hidden`}>
              <div className={`px-4 py-2 flex items-center justify-between ${isToday ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-700'}`}>
                <span className="text-sm font-semibold">{DAY_LABELS_FULL[i]}</span>
                <span className={`text-xs ${isToday ? 'text-gray-300' : 'text-gray-400'}`}>{d.slice(5).replace('-', '/')}</span>
              </div>
              {occupied.length === 0 ? (
                <p className="px-4 py-3 text-xs text-gray-400">Todo libre</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {occupied.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                      onClick={() => !isPast && setEditing({ seatId: s.id, date: d, status: s.status, personId: s.personId })}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[s.status]}`} />
                        <span className="text-sm text-gray-700">{s.personName ?? s.label ?? s.id}</span>
                      </div>
                      <span className="text-xs text-gray-400">{s.id}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      {/* ── DESKTOP: tabla completa ── */}
      <div className="hidden md:block overflow-x-auto px-4 py-4">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium w-32">Sitio</th>
              {weekDates.map((d, i) => {
                const dayDate = parseDate(d)
                dayDate.setHours(0, 0, 0, 0)
                const isToday = dayDate.getTime() === today.getTime()
                return (
                  <th key={d} className={`px-2 py-2 text-xs font-medium text-center min-w-[100px] ${isToday ? 'text-gray-800' : 'text-gray-500'}`}>
                    <div>{DAY_LABELS[i]}</div>
                    <div className={`text-xs font-normal ${isToday ? 'font-bold' : ''}`}>{d.slice(5).replace('-', '/')}</div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {/* Edificio .COM */}
            <tr>
              <td colSpan={6} className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-t border-b border-gray-100">.COM</td>
            </tr>
            {data.seats.filter((s) => s.building === 'com').map((seat) => (
              <tr key={seat.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 text-xs text-gray-600 font-medium whitespace-nowrap">{seat.label ?? seat.id}</td>
                {weekDates.map((d) => {
                  const resolved = resolvedByDate[d].find((s) => s.id === seat.id)!
                  const dayDate = parseDate(d)
                  dayDate.setHours(0, 0, 0, 0)
                  const isPast = dayDate < today
                  return (
                    <td key={d} className="px-2 py-1.5 text-center">
                      <button
                        disabled={isPast}
                        onClick={() => setEditing({ seatId: seat.id, date: d, status: resolved.status, personId: resolved.personId })}
                        className={`w-full px-2 py-1 rounded-lg text-xs border transition ${STATUS_COLORS[resolved.status]} ${isPast ? 'opacity-40 cursor-default' : 'hover:opacity-80 cursor-pointer'}`}
                      >
                        {resolved.status === 'free' ? '—' : (resolved.personName ?? resolved.label ?? '?')}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
            {/* Edificio TECH */}
            <tr>
              <td colSpan={6} className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-t border-b border-gray-100">TECH</td>
            </tr>
            {data.seats.filter((s) => s.building === 'tech').map((seat) => (
              <tr key={seat.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 text-xs text-gray-600 font-medium whitespace-nowrap">{seat.label ?? seat.id}</td>
                {weekDates.map((d) => {
                  const resolved = resolvedByDate[d].find((s) => s.id === seat.id)!
                  const dayDate = parseDate(d)
                  dayDate.setHours(0, 0, 0, 0)
                  const isPast = dayDate < today
                  return (
                    <td key={d} className="px-2 py-1.5 text-center">
                      <button
                        disabled={isPast}
                        onClick={() => setEditing({ seatId: seat.id, date: d, status: resolved.status, personId: resolved.personId })}
                        className={`w-full px-2 py-1 rounded-lg text-xs border transition ${STATUS_COLORS[resolved.status]} ${isPast ? 'opacity-40 cursor-default' : 'hover:opacity-80 cursor-pointer'}`}
                      >
                        {resolved.status === 'free' ? '—' : (resolved.personName ?? resolved.label ?? '?')}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Popover de edición ── */}
      {editing && (
        <EditModal
          editing={editing}
          people={data.people}
          onSave={(status, personId) => {
            onUpdate(editing.seatId, status, personId, editing.date)
            setEditing(null)
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}

function EditModal({
  editing,
  people,
  onSave,
  onClose,
}: {
  editing: EditPopover
  people: Person[]
  onSave: (status: SeatStatus, personId: string | null) => void
  onClose: () => void
}) {
  const [status, setStatus] = useState<SeatStatus>(editing.status)
  const [personId, setPersonId] = useState<string | null>(editing.personId)
  const sorted = people.slice().sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold text-gray-800 mb-4 text-sm">Editar sitio — {editing.date}</h3>

        <div className="space-y-3 mb-5">
          {(['free', 'occupied', 'absent'] as SeatStatus[]).map((s) => (
            <label key={s} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${status === s ? 'border-gray-800 bg-gray-50' : 'border-gray-200'}`}>
              <input type="radio" name="status" value={s} checked={status === s} onChange={() => { setStatus(s); if (s !== 'occupied') setPersonId(null) }} className="accent-gray-800" />
              <span className="text-sm capitalize text-gray-700">
                {s === 'free' ? 'Libre' : s === 'occupied' ? 'Ocupado' : 'Ausente'}
              </span>
            </label>
          ))}
        </div>

        {status === 'occupied' && (
          <select
            value={personId ?? ''}
            onChange={(e) => setPersonId(e.target.value || null)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-5 text-gray-700"
          >
            <option value="">— Sin asignar —</option>
            {sorted.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
          <button onClick={() => onSave(status, personId)} className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-xl text-sm hover:bg-gray-700 transition">Guardar</button>
        </div>
      </div>
    </div>
  )
}
