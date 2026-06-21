export type ScheduleBlock = [days: string, time: string]

export type ScheduleCatalog = Record<
  string,
  Record<string, Record<string, ScheduleBlock[]>>
>

export type SectionChoice = Record<string, Record<string, string>>

export interface ScheduleConflict {
  jour: string
  intervalle: string
  cours: string[]
}

export interface ScheduleResult {
  horaire: Record<string, ScheduleBlock[]>
  conflits: ScheduleConflict[]
}

export interface ScheduleOption extends ScheduleResult {
  choices: SectionChoice
}
