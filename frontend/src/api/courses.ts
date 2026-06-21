import type { Course } from '../types/course'
import { ApiError, apiRequest } from './client'

type CourseSearchParam = 'id' | 'name'

interface CourseSearchRequest {
  param: CourseSearchParam
  valeur: string
  includeSchedule: 'false'
  semester: null
}

const COURSE_CODE_PATTERN = /^[a-z]{3}[\s-]*\d{4}[a-z]?$/i

export async function searchCourses(query: string, signal?: AbortSignal): Promise<Course[]> {
  const trimmedQuery = query.trim()
  const isCourseCode = COURSE_CODE_PATTERN.test(trimmedQuery)
  const body: CourseSearchRequest = {
    param: isCourseCode ? 'id' : 'name',
    valeur: isCourseCode ? trimmedQuery.replace(/[\s-]/g, '').toUpperCase() : trimmedQuery,
    includeSchedule: 'false',
    semester: null,
  }

  try {
    return await apiRequest<Course[]>('/cours/rechercher', {
      method: 'POST',
      body: JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return []
    throw error
  }
}

export async function getCourse(id: string, signal?: AbortSignal): Promise<Course | null> {
  const courses = await searchCourses(id, signal)
  return courses.find((course) => course.id.toUpperCase() === id.toUpperCase()) ?? null
}
