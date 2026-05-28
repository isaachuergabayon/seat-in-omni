import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useSharePointUser } from '../hooks/useSharePointUser'
import DateNavigator from '../components/DateNavigator'
import OfficeMap from '../components/OfficeMap'
import { formatDate, resolveSeatsForDate } from '../utils'

export default function Home() {
  const { data, loading } = useData()
  const { isAdmin } = useSharePointUser()
  const [date, setDate] = useState(formatDate(new Date()))

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Mapa de Sitios</h1>
            <p className="text-xs text-gray-400">Omni Office</p>
          </div>
          {isAdmin && (
            <Link
              to="/admin"
              className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs hover:bg-gray-700 transition"
            >
              Admin
            </Link>
          )}
        </div>
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
        <div className="flex items-center gap-5 text-xs text-gray-400 mt-2">
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
        </div>
      </header>

      <main>
        <DateNavigator date={date} onChange={setDate} />
        {/* Sin onUpdate → popover solo lectura */}
        <OfficeMap seats={resolvedSeats} people={data.people} />
      </main>
    </div>
  )
}
