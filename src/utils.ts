import { AppData, Assignment, ResolvedSeat, SeatStatus } from './types'

export function getWeekday(dateStr: string): number {
  const date = parseDate(dateStr)
  // getDay(): 0=domingo, 1=lunes ... 6=sábado
  // Convertimos a 1=lunes ... 7=domingo
  const day = date.getDay()
  return day === 0 ? 7 : day
}

export function resolveSeatsForDate(data: AppData, date: string): ResolvedSeat[] {
  const weekday = getWeekday(date)

  // Plantilla del día de semana correspondiente (si existe)
  const weekdayTemplate = data.templates.find((t) => t.weekday === weekday)

  return data.seats.map((seat) => {
    // 1. Estado base: plantilla del día de semana
    let status: SeatStatus
    let personId: string | null

    if (weekdayTemplate) {
      const ta = weekdayTemplate.assignments.find((a) => a.seatId === seat.id)
      if (ta) {
        status = ta.status
        personId = ta.personId
      } else {
        // Sitio no incluido en plantilla → comportamiento por defecto
        status = seat.type === 'fixed' ? 'occupied' : 'free'
        personId = seat.type === 'fixed' && seat.label ? getPeopleIdByName(data, seat.label) : null
      }
    } else {
      // Sin plantilla de día → comportamiento por defecto
      status = seat.type === 'fixed' ? 'occupied' : 'free'
      personId = seat.type === 'fixed' && seat.label ? getPeopleIdByName(data, seat.label) : null
    }

    // 2. Excepciones concretas para esa fecha (sobreescriben la plantilla)
    const exception: Assignment | undefined = data.assignments.find(
      (a) => a.seatId === seat.id && a.date === date
    )
    if (exception) {
      status = exception.status
      personId = exception.personId
    }

    const personName = personId ? getPersonName(data, personId) : null

    return { ...seat, status, personName }
  })
}

// Resuelve un mapa para una plantilla weekday concreta (usado en el editor de semana tipo)
export function resolveSeatsForTemplate(data: AppData, templateId: string): ResolvedSeat[] {
  const template = data.templates.find((t) => t.id === templateId)

  return data.seats.map((seat) => {
    let status: SeatStatus
    let personId: string | null

    if (template) {
      const ta = template.assignments.find((a) => a.seatId === seat.id)
      if (ta) {
        status = ta.status
        personId = ta.personId
      } else {
        status = seat.type === 'fixed' ? 'occupied' : 'free'
        personId = seat.type === 'fixed' && seat.label ? getPeopleIdByName(data, seat.label) : null
      }
    } else {
      status = seat.type === 'fixed' ? 'occupied' : 'free'
      personId = seat.type === 'fixed' && seat.label ? getPeopleIdByName(data, seat.label) : null
    }

    const personName = personId ? getPersonName(data, personId) : null
    return { ...seat, status, personName }
  })
}

function getPeopleIdByName(data: AppData, name: string): string | null {
  const person = data.people.find((p) => p.name === name)
  return person ? person.id : null
}

function getPersonName(data: AppData, personId: string): string | null {
  const person = data.people.find((p) => p.id === personId)
  return person ? person.name : null
}

export function getSpecialDayName(data: AppData, date: string): string | null {
  const special = data.specialDays.find((d) => d.date === date)
  return special ? special.name : null
}

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseDate(dateStr)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function exportDataAsJson(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'data.json'
  a.click()
  URL.revokeObjectURL(url)
}
