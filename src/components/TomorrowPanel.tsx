import { AppData } from '../types'
import { formatDate, formatDisplayDate, resolveSeatsForDate, skipWeekend } from '../utils'

interface Props {
  data: AppData
  onClose: () => void
  onNavigate: (date: string) => void
}

function getTomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return skipWeekend(formatDate(d))
}

export default function TomorrowPanel({ data, onClose, onNavigate }: Props) {
  const tomorrowDate = getTomorrow()
  const resolved = resolveSeatsForDate(data, tomorrowDate)

  const comOccupied = resolved.filter((s) => s.building === 'com' && s.status === 'occupied')
  const comFree = resolved.filter((s) => s.building === 'com' && s.status === 'free').length
  const techOccupied = resolved.filter((s) => s.building === 'tech' && s.status === 'occupied')
  const techFree = resolved.filter((s) => s.building === 'tech' && s.status === 'free').length

  const handleGoTo = () => {
    onNavigate(tomorrowDate)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 mx-0 sm:mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-800">¿Quién viene mañana?</h2>
            <p className="text-xs text-gray-400 capitalize">{formatDisplayDate(tomorrowDate)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none transition"
          >
            ✕
          </button>
        </div>

        {/* .COM */}
        <section className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">.COM</span>
            <span className="text-[10px] text-gray-400">{comFree} libres</span>
          </div>
          {comOccupied.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Sin asignaciones</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {comOccupied.map((s) => (
                <span
                  key={s.id}
                  className="bg-red-50 border border-red-200 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium"
                >
                  {s.personName ?? s.label ?? '—'}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* TECH */}
        <section className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">TECH</span>
            <span className="text-[10px] text-gray-400">{techFree} libres</span>
          </div>
          {techOccupied.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Sin asignaciones</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {techOccupied.map((s) => (
                <span
                  key={s.id}
                  className="bg-red-50 border border-red-200 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium"
                >
                  {s.personName ?? s.label ?? '—'}
                </span>
              ))}
            </div>
          )}
        </section>

        <button
          onClick={handleGoTo}
          className="w-full bg-gray-800 text-white text-xs py-2 rounded-xl hover:bg-gray-700 transition font-medium"
        >
          Ver mapa de mañana
        </button>
      </div>
    </div>
  )
}
