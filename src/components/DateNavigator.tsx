import { formatDisplayDate, parseDate, formatDate } from '../utils'
import { useData } from '../context/DataContext'
import { getSpecialDayName } from '../utils'

interface Props {
  date: string
  onChange: (date: string) => void
}

export default function DateNavigator({ date, onChange }: Props) {
  const { data } = useData()

  const prev = () => {
    const d = parseDate(date)
    d.setDate(d.getDate() - 1)
    onChange(formatDate(d))
  }

  const next = () => {
    const d = parseDate(date)
    d.setDate(d.getDate() + 1)
    onChange(formatDate(d))
  }

  const specialName = data ? getSpecialDayName(data, date) : null

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="flex items-center gap-4">
        <button
          onClick={prev}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg transition"
        >
          ←
        </button>
        <div className="text-center">
          <input
            type="date"
            value={date}
            onChange={(e) => onChange(e.target.value)}
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
