import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import DateNavigator from '../components/DateNavigator'
import OfficeMap from '../components/OfficeMap'
import OfficeIcon from '../components/OfficeIcon'
import WeekView from '../components/WeekView'
import DayNote from '../components/DayNote'
import TomorrowPanel from '../components/TomorrowPanel'
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

  // Buscador de persona
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightPersonId, setHighlightPersonId] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ¿Quién viene mañana?
  const [showTomorrow, setShowTomorrow] = useState(false)

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

  // Sugerencias de búsqueda
  const suggestions = searchQuery.trim().length > 0
    ? data.people.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : []

  const handleSelectPerson = (personId: string) => {
    setHighlightPersonId(personId)
    setSearchQuery(data.people.find((p) => p.id === personId)?.name ?? '')
    setSearchOpen(false)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setHighlightPersonId(null)
    setSearchOpen(false)
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
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
              {onlineCount} {onlineCount === 1 ? 'persona' : 'personas'}
            </span>
            {/* Botón ¿quién viene mañana? */}
            <button
              onClick={() => setShowTomorrow(true)}
              title="¿Quién viene mañana?"
              className="px-2 py-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition text-sm"
            >
              🌅
            </button>
            <Link
              to="/admin"
              className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs hover:bg-gray-700 transition"
            >
              Admin
            </Link>
          </div>
        </div>

        {/* Buscador — siempre visible en vista día */}
        {viewMode === 'day' && (
          <div className="relative mt-3" ref={searchContainerRef}>
            <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 transition-colors ${
              highlightPersonId
                ? 'bg-yellow-50 border-yellow-400'
                : 'bg-gray-50 border-gray-200 focus-within:border-gray-400 focus-within:bg-white'
            }`}>
              <svg className={`w-4 h-4 flex-shrink-0 ${highlightPersonId ? 'text-yellow-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setHighlightPersonId(null)
                  setSearchOpen(true)
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Buscar persona en el mapa…"
                className={`flex-1 bg-transparent text-sm placeholder-gray-400 outline-none ${
                  highlightPersonId ? 'text-yellow-800 font-medium' : 'text-gray-700'
                }`}
              />
              {(searchQuery || highlightPersonId) && (
                <button
                  onClick={clearSearch}
                  className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 text-xs transition flex-shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
            {searchOpen && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPerson(p.id)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-800 transition flex items-center gap-2"
                  >
                    <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

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
            <DateNavigator date={date} onChange={(d) => { setDate(d); setHighlightPersonId(null) }} />
            <DayNote date={date} />
            <OfficeMap
              seats={resolvedSeats}
              people={data.people}
              onUpdate={handleUpdate}
              highlightPersonId={highlightPersonId}
            />
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

      {/* Panel ¿quién viene mañana? */}
      {showTomorrow && (
        <TomorrowPanel
          data={data}
          onClose={() => setShowTomorrow(false)}
          onNavigate={setDate}
        />
      )}
    </div>
  )
}
