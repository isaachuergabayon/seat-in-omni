export type SeatType = 'fixed' | 'hot'
export type SeatStatus = 'occupied' | 'absent' | 'free'
export type DeskId = 'left' | 'center' | 'right' | 'tech-desk'
export type BuildingId = 'com' | 'tech'

export interface Person {
  id: string
  name: string
}

export interface Seat {
  id: string
  desk: DeskId
  building: BuildingId
  position: string   // 'top-1', 'bottom-2', etc.
  label: string | null  // nombre fijo por defecto
  type: SeatType
}

export interface SpecialDay {
  id: string
  name: string
  date: string  // ISO: '2024-11-29'
}

export interface Assignment {
  seatId: string
  date: string
  personId: string | null
  status: SeatStatus
}

export interface TemplateAssignment {
  seatId: string
  personId: string | null
  status: SeatStatus
}

export interface Template {
  id: string
  name: string
  weekday?: number  // 1=lunes … 5=viernes. Si está definido, es plantilla de día de semana
  assignments: TemplateAssignment[]
}

export interface AppData {
  people: Person[]
  seats: Seat[]
  specialDays: SpecialDay[]
  assignments: Assignment[]
  templates: Template[]
}

// Seat con estado resuelto para un día concreto
export interface ResolvedSeat extends Seat {
  status: SeatStatus
  personName: string | null
}
