import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { formatDate, generateId, resolveSeatsForDate, resolveSeatsForTemplate, skipWeekend, formatTimestamp } from '../utils'
import { AppData, Assignment, SeatStatus, TemplateAssignment } from '../types'
import OfficeMap from '../components/OfficeMap'
import OfficeIcon from '../components/OfficeIcon'
import { useChangeLog } from '../hooks/useChangeLog'

type Tab = 'week' | 'exceptions' | 'people' | 'specialDays' | 'templates' | 'log'

const WEEKDAY_IDS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const WEEKDAY_LABELS: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
}
const PROTECTED_IDS = new Set(['default', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'])

export default function Admin() {
  const { data, setData, loading } = useData()
  const [tab, setTab] = useState<Tab>('week')
  const [activeWeekday, setActiveWeekday] = useState<string>('monday')
  const [date, setDate] = useState(() => skipWeekend(formatDate(new Date())))
  const [saved, setSaved] = useState(false)
  const { entries, logChange, clearLog } = useChangeLog()

  if (loading || !data) {
    return <div className="flex items-center justify-center h-screen text-gray-400">Cargando...</div>
  }

  const save = (newData: AppData) => {
    setData(newData)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDateChange = (val: string) => {
    if (!val) return
    setDate(skipWeekend(val))
  }

  // ─── PEOPLE ───────────────────────────────────────────────────────────────
  const addPerson = (name: string) => {
    if (!name.trim()) return
    const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + generateId()
    const trimmed = name.trim().toUpperCase()
    save({ ...data, people: [...data.people, { id, name: trimmed }] })
    logChange(`Persona añadida: ${trimmed}`, 'admin')
  }

  const removePerson = (id: string) => {
    const person = data.people.find((p) => p.id === id)
    save({ ...data, people: data.people.filter((p) => p.id !== id) })
    if (person) logChange(`Persona eliminada: ${person.name}`, 'admin')
  }

  // ─── SPECIAL DAYS ─────────────────────────────────────────────────────────
  const addSpecialDay = (name: string, specialDate: string) => {
    if (!name.trim() || !specialDate) return
    const id = generateId()
    save({ ...data, specialDays: [...data.specialDays, { id, name: name.trim(), date: specialDate }] })
    logChange(`Día especial añadido: ${name.trim()} · ${specialDate}`, 'admin')
  }

  const removeSpecialDay = (id: string) => {
    const day = data.specialDays.find((d) => d.id === id)
    save({ ...data, specialDays: data.specialDays.filter((d) => d.id !== id) })
    if (day) logChange(`Día especial eliminado: ${day.name} · ${day.date}`, 'admin')
  }

  // ─── WEEKDAY TEMPLATE EDIT ────────────────────────────────────────────────
  const updateWeekdayTemplate = (templateId: string, seatId: string, status: SeatStatus, personId: string | null) => {
    const templates = data.templates.map((t) => {
      if (t.id !== templateId) return t
      const existing = t.assignments.findIndex((a) => a.seatId === seatId)
      const newAssignment: TemplateAssignment = { seatId, personId, status }
      const assignments = [...t.assignments]
      if (existing >= 0) {
        assignments[existing] = newAssignment
      } else {
        assignments.push(newAssignment)
      }
      return { ...t, assignments }
    })
    save({ ...data, templates })
    const label = WEEKDAY_LABELS[templateId] ?? templateId
    logChange(`Plantilla ${label} · ${seatId} → ${status}`, 'admin')
  }

  // ─── APPLY TEMPLATE TO DATE ───────────────────────────────────────────────
  const applyTemplateToDate = (templateId: string, targetDate: string) => {
    const template = data.templates.find((t) => t.id === templateId)
    if (!template) return
    const filtered = data.assignments.filter((a) => a.date !== targetDate)
    const newAssignments: Assignment[] = template.assignments.map((ta) => ({
      seatId: ta.seatId,
      date: targetDate,
      personId: ta.personId,
      status: ta.status,
    }))
    save({ ...data, assignments: [...filtered, ...newAssignments] })
    logChange(`Plantilla "${template.name}" aplicada a ${targetDate}`, 'admin')
  }

  // ─── EXCEPTIONS ───────────────────────────────────────────────────────────
  const updateException = (seatId: string, status: SeatStatus, personId: string | null) => {
    const existing = data.assignments.findIndex((a) => a.seatId === seatId && a.date === date)
    const newAssignment: Assignment = { seatId, date, personId, status }
    const assignments = [...data.assignments]
    if (existing >= 0) {
      assignments[existing] = newAssignment
    } else {
      assignments.push(newAssignment)
    }
    save({ ...data, assignments })
    const personName = personId ? (data.people.find((p) => p.id === personId)?.name ?? personId) : '—'
    logChange(`Excepción: ${seatId} → ${status} (${personName}) · ${date}`, 'admin')
  }

  const clearExceptions = () => {
    save({ ...data, assignments: data.assignments.filter((a) => a.date !== date) })
    logChange(`Excepciones limpiadas: ${date}`, 'admin')
  }

  // ─── CUSTOM TEMPLATES ─────────────────────────────────────────────────────
  const saveAsTemplate = (name: string) => {
    if (!name.trim()) return
    const resolvedSeats = resolveSeatsForDate(data, date)
    const assignments: TemplateAssignment[] = resolvedSeats.map((s) => ({
      seatId: s.id,
      personId: s.personName ? (data.people.find((p) => p.name === s.personName)?.id ?? null) : null,
      status: s.status,
    }))
    const id = generateId()
    save({ ...data, templates: [...data.templates, { id, name: name.trim(), assignments }] })
    logChange(`Plantilla creada: "${name.trim()}"`, 'admin')
  }

  const removeTemplate = (id: string) => {
    if (PROTECTED_IDS.has(id)) return
    const t = data.templates.find((t) => t.id === id)
    save({ ...data, templates: data.templates.filter((t) => t.id !== id) })
    if (t) logChange(`Plantilla eliminada: "${t.name}"`, 'admin')
  }

  const resolvedExceptionSeats = resolveSeatsForDate(data, date)
  const weekdayResolvedSeats = resolveSeatsForTemplate(data, activeWeekday)
  const exceptionsForDate = data.assignments.filter((a) => a.date === date)
  const customTemplates = data.templates.filter((t) => !PROTECTED_IDS.has(t.id))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <OfficeIcon size={28} />
            <div>
              <h1 className="text-lg font-bold">Panel de Administración</h1>
              <p className="text-xs text-gray-400">Mapa de Sitios - Omni</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className="text-green-400 text-xs">✓ Guardado</span>}
            <Link
              to="/"
              className="px-2.5 py-1.5 bg-gray-600 hover:bg-gray-500 rounded-lg text-xs transition"
            >
              ← Mapa
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white px-2">
        <nav className="flex overflow-x-auto scrollbar-none">
          {([
            ['week', 'Semana tipo'],
            ['exceptions', 'Excepciones'],
            ['people', 'Personas'],
            ['specialDays', 'Días Especiales'],
            ['templates', 'Plantillas'],
            ['log', 'Historial'],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`whitespace-nowrap px-3 py-3 text-sm font-medium border-b-2 transition flex-shrink-0 ${
                tab === key
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 md:p-6">

        {/* ── SEMANA TIPO ── */}
        {tab === 'week' && (
          <div>
            <div className="max-w-5xl mx-auto mb-4">
              <p className="text-sm text-gray-500 mb-4">
                Define cómo es cada día de la semana por defecto. Estos datos se aplican automáticamente a todas las semanas salvo que haya una excepción puntual.
              </p>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                {WEEKDAY_IDS.map((id) => (
                  <button
                    key={id}
                    onClick={() => setActiveWeekday(id)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                      activeWeekday === id
                        ? 'bg-white shadow text-gray-800'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {WEEKDAY_LABELS[id]}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">
                  {WEEKDAY_LABELS[activeWeekday]} —{' '}
                  <span className="font-normal text-gray-400">haz click en un sitio para editarlo</span>
                </p>
              </div>
              <OfficeMap
                seats={weekdayResolvedSeats}
                people={data.people}
                onUpdate={(seatId, status, personId) =>
                  updateWeekdayTemplate(activeWeekday, seatId, status, personId)
                }
              />
            </div>
          </div>
        )}

        {/* ── EXCEPCIONES ── */}
        {tab === 'exceptions' && (
          <div>
            <div className="max-w-5xl mx-auto mb-4">
              <p className="text-sm text-gray-500 mb-4">
                Las excepciones sobreescriben la semana tipo para una fecha concreta. Úsalas solo cuando algo cambie ese día específico.
              </p>

              <div className="flex flex-wrap gap-4 items-end mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                {exceptionsForDate.length > 0 && (
                  <button
                    onClick={clearExceptions}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs rounded-lg border border-red-200 transition"
                  >
                    Limpiar excepciones de este día ({exceptionsForDate.length})
                  </button>
                )}
              </div>

              {customTemplates.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-gray-400">Aplicar plantilla:</span>
                  {customTemplates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => applyTemplateToDate(t.id, date)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs rounded-lg border border-amber-200 transition"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}

              {exceptionsForDate.length === 0 && (
                <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  Sin excepciones — se aplica la semana tipo normalmente.
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 mb-6">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">
                  Vista del día{exceptionsForDate.length > 0 ? ` (${exceptionsForDate.length} excepción${exceptionsForDate.length > 1 ? 'es' : ''})` : ''} —{' '}
                  <span className="font-normal text-gray-400">haz click en un sitio para añadir excepción</span>
                </p>
              </div>
              <OfficeMap
                seats={resolvedExceptionSeats}
                people={data.people}
                onUpdate={updateException}
              />
            </div>

            <div className="max-w-5xl mx-auto">
              <SaveAsTemplateForm onSave={saveAsTemplate} />
            </div>
          </div>
        )}

        {/* ── PERSONAS ── */}
        {tab === 'people' && (
          <div className="max-w-5xl mx-auto">
            <AddForm placeholder="Nombre de la persona" buttonLabel="Añadir" onAdd={addPerson} />
            <ul className="mt-4 divide-y divide-gray-100 bg-white rounded-xl border border-gray-200">
              {data.people.length === 0 && (
                <li className="px-4 py-6 text-center text-gray-400 text-sm">No hay personas en la lista maestra</li>
              )}
              {data.people.slice().sort((a, b) => a.name.localeCompare(b.name)).map((p) => (
                <li key={p.id} className="flex items-center justify-between px-4 py-3">
                  <span className="font-medium text-gray-800">{p.name}</span>
                  <button onClick={() => removePerson(p.id)} className="text-red-400 hover:text-red-600 text-sm transition">
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── DÍAS ESPECIALES ── */}
        {tab === 'specialDays' && (
          <div className="max-w-5xl mx-auto">
            <SpecialDayForm onAdd={addSpecialDay} />
            <ul className="mt-4 divide-y divide-gray-100 bg-white rounded-xl border border-gray-200">
              {data.specialDays.length === 0 && (
                <li className="px-4 py-6 text-center text-gray-400 text-sm">No hay días especiales definidos</li>
              )}
              {data.specialDays
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((d) => (
                  <li key={d.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <span className="font-medium text-gray-800">{d.name}</span>
                      <span className="ml-3 text-sm text-gray-400">{d.date}</span>
                    </div>
                    <button onClick={() => removeSpecialDay(d.id)} className="text-red-400 hover:text-red-600 text-sm transition">
                      Eliminar
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* ── PLANTILLAS PERSONALIZADAS ── */}
        {tab === 'templates' && (
          <div className="max-w-5xl mx-auto">
            <p className="text-sm text-gray-500 mb-4">
              Plantillas rápidas que puedes aplicar sobre un día de excepción concreto.
            </p>
            {customTemplates.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
                No hay plantillas personalizadas. Créalas desde la pestaña Excepciones.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 bg-white rounded-xl border border-gray-200">
                {customTemplates.map((t) => (
                  <li key={t.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <span className="font-medium text-gray-800">{t.name}</span>
                      <span className="ml-2 text-xs text-gray-400">{t.assignments.length} sitios</span>
                    </div>
                    <button onClick={() => removeTemplate(t.id)} className="text-red-400 hover:text-red-600 text-sm transition">
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ── HISTORIAL ── */}
        {tab === 'log' && (
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">Últimos 7 días de actividad.</p>
              {entries.length > 0 && (
                <button
                  onClick={clearLog}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs rounded-lg border border-red-200 transition"
                >
                  Limpiar historial
                </button>
              )}
            </div>
            {entries.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
                No hay actividad registrada todavía.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 w-40">Fecha / Hora</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Acción</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 w-20">Origen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e) => (
                      <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-xs text-gray-400 whitespace-nowrap">{formatTimestamp(e.ts)}</td>
                        <td className="px-4 py-2.5 text-gray-700">{e.action}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            e.category === 'admin'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-blue-50 text-blue-600'
                          }`}>
                            {e.category === 'admin' ? 'Admin' : 'Mapa'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AddForm({ placeholder, buttonLabel, onAdd }: { placeholder: string; buttonLabel: string; onAdd: (v: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <form onSubmit={(e) => { e.preventDefault(); onAdd(value); setValue('') }} className="flex gap-2">
      <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder}
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 transition">
        {buttonLabel}
      </button>
    </form>
  )
}

function SpecialDayForm({ onAdd }: { onAdd: (name: string, date: string) => void }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  return (
    <form onSubmit={(e) => { e.preventDefault(); onAdd(name, date); setName(''); setDate('') }} className="flex gap-2 flex-wrap">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre (ej. Black Friday)"
        className="flex-1 min-w-[180px] border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 transition">
        Añadir
      </button>
    </form>
  )
}

function SaveAsTemplateForm({ onSave }: { onSave: (name: string) => void }) {
  const [name, setName] = useState('')
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(name); setName('') }} className="flex gap-2">
      <input value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Guardar estado actual del día como plantilla rápida..."
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition">
        Guardar plantilla
      </button>
    </form>
  )
}
