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
            <span className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
              {onlineCount} en línea
            </span>
            {/* Botón ¿quién viene mañana? */}
            <button
              onClick={() => setShowTomorrow(true)}
              title="¿Quién viene mañana?"
              className="px-2 py-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition text-sm"
            >
              🌅
            </button>
            {/* Buscador lupa */}
            <button
              onClick={() => {
                setSearchOpen((v) => !v)
                setTimeout(() => searchInputRef.current?.focus(), 50)
              }}
              title="Buscar persona"
              className={`px-2 py-1.5 rounded-lg transition text-sm ${
                searchOpen || highlightPersonId
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              🔍
            </button>
            <Link
              to="/admin"
              className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs hover:bg-gray-700 transition"
            >
              Admin
            </Link>
          </div>
        </div>

        {/* Buscador expandible */}
        {searchOpen && (
          <div className="relative mt-2" ref={searchContainerRef}>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
              <span className="text-gray-400 text-sm">🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setHighlightPersonId(null)
                }}
                placeholder="¿Dónde se sienta…?"
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
              {(searchQuery || highlightPersonId) && (
                <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
              )}
            </div>
            {suggestions.length > 0 && (
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
        <div className="flex items-center gap-3 text-xs mt-2 whitespace-nowrap">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
            <span className="text-gray-600">{comFree}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
            <span className="text-gray-600">{comOccupied}</span>
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
            <span className="text-gray-600">{techFree}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
            <span className="text-gray-600">{techOccupied}</span>
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
