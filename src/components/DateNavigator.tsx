import { formatDisplayDate, parseDate, formatDate, skipWeekend, skipWeekendBack } from '../utils'
import { useData } from '../context/DataContext'
import { getSpecialDayName } from '../utils'

interface Props {
  date: string
  onChange: (date: string) => void
}

export default function DateNavigator({ date, onChange }: Props) {
  const { data } = useData()
  const today = skipWeekend(formatDate(new Date()))
  const isToday = date === today

  const prev = () => {
    if (isToday) return
    const d = parseDate(date)
    d.setDate(d.getDate() - 1)
    onChange(skipWeekendBack(formatDate(d)))
  }

  const next = () => {
    const d = parseDate(date)
    d.setDate(d.getDate() + 1)
    onChange(skipWeekend(formatDate(d)))
  }

  const handleInputChange = (val: string) => {
    if (!val) return
    onChange(skipWeekend(val))
  }

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
        <div className="text-center">
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => handleInputChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm text-gray-600 cursor-pointer"
          />
          <p className="text-gray-500 text-sm mt-1 capitalize">{formatDisplayDate(date)}</p>
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
