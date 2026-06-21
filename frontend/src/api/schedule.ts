import type {
  ScheduleCatalog,
  ScheduleOption,
  ScheduleResult,
  SectionChoice,
} from '../types/schedule'
import { apiRequest } from './client'

const MAX_OPTIONS = 40
const REQUEST_BATCH_SIZE = 5

interface ScheduleRequest {
  idCours: string[]
  session: string
  sections: boolean
  choix: SectionChoice
}

function requestSchedule<T>(body: ScheduleRequest): Promise<T> {
  return apiRequest<T>('/horaire', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function choicesForCourse(courseId: string, catalog: ScheduleCatalog): SectionChoice[] {
  const sections = catalog[courseId]
  const theorySections = sections?.TH ?? {}
  const practicalSections = sections?.TP ?? {}
  const hasPracticals = Object.keys(practicalSections).length > 0
  const choices: SectionChoice[] = []

  for (const theory of Object.keys(theorySections)) {
    if (hasPracticals) {
      const matchingPracticals = Object.keys(practicalSections).filter((practical) => practical.startsWith(theory))
      for (const practical of matchingPracticals) {
        choices.push({ [courseId]: { TH: theory, TP: practical } })
      }
    } else {
      choices.push({ [courseId]: { TH: theory } })
    }
  }

  return choices
}

function enumerateChoices(courseIds: string[], catalog: ScheduleCatalog): SectionChoice[] {
  let combinations: SectionChoice[] = [{}]

  for (const courseId of courseIds) {
    const courseChoices = choicesForCourse(courseId, catalog)
    if (courseChoices.length === 0) return []

    const next: SectionChoice[] = []
    for (const combination of combinations) {
      for (const courseChoice of courseChoices) {
        next.push({ ...combination, ...courseChoice })
        if (next.length >= MAX_OPTIONS) break
      }
      if (next.length >= MAX_OPTIONS) break
    }
    combinations = next
  }

  return combinations
}

function isScheduleResult(value: unknown): value is ScheduleResult {
  if (!value || typeof value !== 'object') return false
  return 'horaire' in value && 'conflits' in value
}

export async function generateScheduleOptions(courseIds: string[], semester: string): Promise<ScheduleOption[]> {
  const baseRequest = { idCours: courseIds, session: semester, choix: {} }
  const catalog = await requestSchedule<ScheduleCatalog>({ ...baseRequest, sections: false })
  const choices = enumerateChoices(courseIds, catalog)
  const options: ScheduleOption[] = []

  for (let index = 0; index < choices.length; index += REQUEST_BATCH_SIZE) {
    const batch = choices.slice(index, index + REQUEST_BATCH_SIZE)
    const results = await Promise.all(
      batch.map((choice) =>
        requestSchedule<ScheduleResult | Record<string, never>>({
          idCours: courseIds,
          session: semester,
          sections: true,
          choix: choice,
        }),
      ),
    )

    results.forEach((result, resultIndex) => {
      if (isScheduleResult(result)) options.push({ ...result, choices: batch[resultIndex] })
    })
  }

  return options
}
