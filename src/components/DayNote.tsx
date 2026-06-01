import { useEffect, useRef, useState } from 'react'
import { useDayNote } from '../hooks/useDayNote'

interface Props {
  date: string
}

export default function DayNote({ date }: Props) {
  const { note, saveNote } = useDayNote(date)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const startEdit = () => {
    setDraft(note)
    setEditing(true)
  }

  useEffect(() => {
    if (editing) {
      textareaRef.current?.focus()
      textareaRef.current?.select()
    }
  }, [editing])

  const commit = () => {
    saveNote(draft)
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      commit()
    }
    if (e.key === 'Escape') {
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <div className="mx-4 mt-3 mb-1">
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-xl px-3 py-2">
          <span className="text-amber-500 mt-0.5 text-sm flex-shrink-0">📌</span>
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={commit}
              rows={2}
              placeholder="Escribe un aviso para hoy…"
              className="w-full bg-transparent text-xs text-amber-800 placeholder-amber-300 resize-none outline-none"
            />
            <p className="text-[10px] text-amber-400 mt-0.5">Enter para guardar · Esc para cancelar</p>
          </div>
        </div>
      </div>
    )
  }

  if (note) {
    return (
      <div className="mx-4 mt-3 mb-1">
        <div
          className="group flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 cursor-pointer hover:bg-amber-100 transition"
          onClick={startEdit}
        >
          <span className="text-amber-500 mt-0.5 text-sm flex-shrink-0">📌</span>
          <p className="flex-1 text-xs text-amber-800 font-medium leading-snug">{note}</p>
          <span className="text-amber-400 text-[10px] opacity-0 group-hover:opacity-100 transition flex-shrink-0 mt-0.5">
            editar
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-4 mt-3 mb-1">
      <button
        onClick={startEdit}
        className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-amber-500 transition"
      >
        <span>📌</span>
        <span>Añadir nota del día</span>
      </button>
    </div>
  )
}
