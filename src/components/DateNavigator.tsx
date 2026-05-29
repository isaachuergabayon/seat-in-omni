import { useState, useRef, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { es } from 'react-day-picker/locale'
import 'react-day-picker/style.css'
import { formatDisplayDate, parseDate, formatDate, skipWeekend } from '../utils'
import { useData } from '../context/DataContext'
import { getSpecialDayName } from '../utils'

interface Props {
  date: string
  onChange: (date: string) => void
}

export default function DateNavigator({ date, onChange }: Props) {
  const { data } = useData()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const today = skipWeekend(formatDate(new Date()))
  const isToday = date === today
  const selected = parseDate(date)
  const todayDate = parseDate(today)

  const prev = () => {
    const d = parseDate(date)
    d.setDate(d.getDate() - 1)
    // retroceder saltando fin de semana
    const day = d.getDay()
    if (day === 0) d.setDate(d.getDate() - 2)
    if (day === 6) d.setDate(d.getDate() - 1)
    const result = formatDate(d)
    if (result >= today) onChange(result)
  }

  const next = () => {
    const d = parseDate(date)
    d.setDate(d.getDate() + 1)
    const day = d.getDay()
    if (day === 6) d.setDate(d.getDate() + 2)
    if (day === 0) d.setDate(d.getDate() + 1)
    onChange(formatDate(d))
  }

  const handleSelect = (d: Date | undefined) => {
    if (!d) return
    onChange(formatDate(d))
    setOpen(false)
  }

  // Cerrar al click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const specialName = data ? getSpecialDayName(data, date) : null

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="flex items-center gap-4">
        <button
          onClick={prev}
          disabled={isToday}
          className={`px-4 py-2 rounded-lg font-bold text-lg transition
            ${isToday
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
        >
          ←
        </button>

        <div className="text-center relative" ref={ref}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition min-w-[130px]"
          >
            {selected.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </button>
          <p className="text-gray-500 text-sm mt-1 capitalize">{formatDisplayDate(date)}</p>

          {open && (
            <div className="absolute z-50 mt-1 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-2xl shadow-xl p-2">
              <DayPicker
                mode="single"
                selected={selected}
                onSelect={handleSelect}
                locale={es}
                disabled={[
                  { dayOfWeek: [0, 6] },
                  { before: todayDate },
                ]}
                startMonth={todayDate}
              />
            </div>
          )}
        </div>

        <button
          onClick={next}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg transition"
        >
          →
        </button>
      </div>
      {specialName && (
        <span className="bg-amber-400 text-amber-900 font-semibold px-4 py-1 rounded-full text-sm shadow">
          ⚡ {specialName}
        </span>
      )}
    </div>
  )
}
