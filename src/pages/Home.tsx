import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import DateNavigator from '../components/DateNavigator'
import OfficeMap from '../components/OfficeMap'
import OfficeIcon from '../components/OfficeIcon'
import WeekView from '../components/WeekView'
import { formatDate, formatDisplayDate, resolveSeatsForDate } from '../utils'
import { Assignment, SeatStatus } from '../types'
import { usePresence } from '../hooks/usePresence'
import { useChangeLog } from '../hooks/useChangeLog'

type ViewMode = 'day' | 'week'

export default function Home() {
  const { data, loading, setData } = useData()
  const [date, setDate] = useState(formatDate(new Date()))
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const onlineCount = usePresence()
  const { logChange } = useChangeLog()

  if (loading || !data) {
    return <div className="flex items-center justify-center h-screen text-gray-400">Cargando...</div>
  }

  const resolvedSeats = resolveSeatsForDate(data, date)
  const comSeats = resolvedSeats.filter((s) => s.building === 'com')
  const techSeats = resolvedSeats.filter((s) => s.building === 'tech')
  const comFree = comSeats.filter((s) => s.status === 'free').length
  const comOccupied = comSeats.filter((s) => s.status === 'occupied').length
  const techFree = techSeats.filter((s) => s.status === 'free').length
  const techOccupied = techSeats.filter((s) => s.status === 'occupied').length

  const handleUpdate = (seatId: string, status: SeatStatus, personId: string | null, targetDate?: string) => {
    const d = targetDate ?? date
    const existing = data.assignments.findIndex((a) => a.seatId === seatId && a.date === d)
    const newAssignment: Assignment = { seatId, date: d, personId, status }
    const assignments = [...data.assignments]
    if (existing >= 0) {
      assignments[existing] = newAssignment
    } else {
      assignments.push(newAssignment)
    }
    setData({ ...data, assignments })
    const personName = personId ? (data.people.find((p) => p.id === personId)?.name ?? personId) : '—'
    logChange(`${seatId} → ${status} (${personName}) · ${d}`, 'map')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <OfficeIcon size={28} />
            <div>
              <h1 className="text-lg font-bold text-gray-800">Mapa de Sitios</h1>
              <p className="text-xs text-gray-400 capitalize">{formatDisplayDate(date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
              {onlineCount} {onlineCount === 1 ? 'persona' : 'personas'}
            </span>
            <Link
              to="/admin"
              className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs hover:bg-gray-700 transition"
            >
              Admin
            </Link>
          </div>
        </div>

        {/* Contadores */}
        <div className="flex items-center gap-4 text-sm mt-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">.COM:</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
            <span className="text-gray-600">{comFree} libres</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
            <span className="text-gray-600">{comOccupied} ocupados</span>
          </span>
          <span className="text-xs text-gray-400">|</span>
          <span className="text-xs text-gray-500 font-medium">TECH:</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
            <span className="text-gray-600">{techFree} libres</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
            <span className="text-gray-600">{techOccupied} ocupados</span>
          </span>
        </div>

        {/* Toggle día / semana */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mt-3">
          {(['day', 'week'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1 rounded-lg text-xs font-medium transition ${
                viewMode === mode ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {mode === 'day' ? 'Día' : 'Semana'}
            </button>
          ))}
        </div>
      </header>

      <main>
        {viewMode === 'day' ? (
          <>
            <DateNavigator date={date} onChange={setDate} />
            <OfficeMap seats={resolvedSeats} people={data.people} onUpdate={handleUpdate} />
          </>
        ) : (
          <WeekView data={data} currentDate={date} onUpdate={handleUpdate} />
        )}

        {/* Leyenda */}
        <div className="flex justify-center gap-6 mt-6 pb-8 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-green-100 border-2 border-green-300 inline-block" />
            Libre
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-red-100 border-2 border-red-300 inline-block" />
            Ocupado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-300 inline-block" />
            Ausente
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Rotativo
          </span>
        </div>
      </main>
    </div>
  )
}
