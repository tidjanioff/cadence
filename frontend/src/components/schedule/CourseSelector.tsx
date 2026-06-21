import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getCourseDifficulty, getCoursePopularity } from '../../api/courseDetails'
import { searchCourses } from '../../api/courses'
import type { Course, CourseDetailNavigationState } from '../../types/course'

interface CourseSelectorProps {
  selectedCourses: Course[]
  semester: string
  onAdd: (course: Course) => void
  onRemove: (courseId: string) => void
}

interface PreviewStats {
  difficulty: string | null
  popularity: string | null
  isLoading: boolean
  hasError: boolean
}

export function CourseSelector({ selectedCourses, semester, onAdd, onRemove }: CourseSelectorProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Course[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null)
  const [previewStats, setPreviewStats] = useState<Record<string, PreviewStats>>({})

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!query.trim()) return
    setIsSearching(true)
    setHasSearched(true)
    setHasError(false)
    try {
      setResults(await searchCourses(query))
    } catch {
      setHasError(true)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  function addCourse(course: Course) {
    onAdd(course)
    setQuery('')
    setResults([])
    setHasSearched(false)
  }

  async function togglePreview(course: Course) {
    if (expandedCourseId === course.id) {
      setExpandedCourseId(null)
      return
    }

    setExpandedCourseId(course.id)
    if (previewStats[course.id]) return
    setPreviewStats((current) => ({ ...current, [course.id]: { difficulty: null, popularity: null, isLoading: true, hasError: false } }))
    try {
      const [difficulty, popularity] = await Promise.all([
        getCourseDifficulty(course.id),
        getCoursePopularity(course.id),
      ])
      setPreviewStats((current) => ({ ...current, [course.id]: { difficulty, popularity, isLoading: false, hasError: false } }))
    } catch {
      setPreviewStats((current) => ({ ...current, [course.id]: { difficulty: null, popularity: null, isLoading: false, hasError: true } }))
    }
  }

  return (
    <div>
      <form className="flex gap-2" onSubmit={handleSearch} role="search">
        <label className="sr-only" htmlFor="schedule-course-search">{t('schedule.courseSelector.searchLabel')}</label>
        <input
          className="field min-w-0 flex-1"
          id="schedule-course-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('schedule.courseSelector.searchPlaceholder')}
          type="search"
          value={query}
        />
        <button className="button-secondary px-5" disabled={!query.trim() || isSearching} type="submit">
          {isSearching ? t('schedule.courseSelector.searching') : t('schedule.courseSelector.searchButton')}
        </button>
      </form>

      {(results.length > 0 || (hasSearched && !isSearching)) && (
        <div className="mt-3 overflow-hidden rounded-card border border-primary/[0.08] bg-surface shadow-soft">
          {results.slice(0, 6).map((course) => {
            const isSelected = selectedCourses.some((selected) => selected.id === course.id)
            const isExpanded = expandedCourseId === course.id
            const stats = previewStats[course.id]
            return (
              <div className="border-b border-primary/[0.06] last:border-0" key={course.id}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <button aria-controls={`preview-${course.id}`} aria-expanded={isExpanded} className="flex min-w-0 flex-1 items-center gap-4 rounded-md text-left outline-none hover:opacity-75 focus-visible:ring-4 focus-visible:ring-accent/15" onClick={() => togglePreview(course)} type="button">
                    <span className="w-20 shrink-0 font-mono text-xs font-semibold text-accent">{course.id}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-primary">{course.name}</span>
                    <span className="text-xs text-secondary">{isExpanded ? t('schedule.courseSelector.hide') : t('schedule.courseSelector.preview')}</span>
                  </button>
                  <button className="shrink-0 rounded-full bg-accent/[0.08] px-3.5 py-2 text-xs font-semibold text-accent outline-none transition hover:bg-accent/15 focus-visible:ring-4 focus-visible:ring-accent/20 disabled:opacity-45" disabled={isSelected || selectedCourses.length >= 6} onClick={() => addCourse(course)} type="button">
                    {isSelected ? t('schedule.courseSelector.added') : t('schedule.courseSelector.add')}
                  </button>
                </div>
                {isExpanded && (
                  <div className="bg-primary/[0.025] px-4 py-5 sm:pl-28" id={`preview-${course.id}`}>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-secondary">
                      <span>{t('landing.credits', { count: course.credits })}</span>
                      {stats?.isLoading && <span>{t('schedule.courseSelector.loadingStats')}</span>}
                      {!stats?.isLoading && !stats?.hasError && <><span>{t('courseDetail.stats.difficultyLabel')}: {difficultyLabel(stats?.difficulty, t)}</span><span>{t('courseDetail.stats.popularityLabel')}: {popularityLabel(stats?.popularity, t)}</span></>}
                      {stats?.hasError && <span>{t('schedule.courseSelector.statsUnavailable')}</span>}
                    </div>
                    <p className="mt-3 max-h-[4.75rem] overflow-hidden text-sm leading-6 text-secondary">{course.description || t('schedule.courseSelector.descriptionFallback')}</p>
                    <div className="mt-4 flex items-center gap-5">
                      <Link
                        className="rounded-md text-sm font-semibold text-accent outline-none hover:text-accent/80 focus-visible:ring-4 focus-visible:ring-accent/20"
                        state={{ scheduleDraft: { selectedCourses, semester } } satisfies CourseDetailNavigationState}
                        to={`/courses/${encodeURIComponent(course.id)}`}
                      >
                        {t('schedule.courseSelector.viewFullDetails')} →
                      </Link>
                      <button className="text-xs text-secondary outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-accent/20" onClick={() => setExpandedCourseId(null)} type="button">{t('schedule.courseSelector.dismiss')}</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {results.length === 0 && !hasError && <p className="px-4 py-5 text-center text-sm text-secondary">{t('schedule.courseSelector.noResults')}</p>}
          {hasError && <p className="px-4 py-5 text-center text-sm text-secondary">{t('schedule.courseSelector.error')}</p>}
        </div>
      )}

      {selectedCourses.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2" aria-label={t('schedule.courseSelector.selectedLabel')}>
          {selectedCourses.map((course) => (
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/[0.08] py-2 pl-3.5 pr-2 font-mono text-xs font-semibold text-accent" key={course.id}>
              {course.id}
              <button aria-label={t('schedule.courseSelector.removeCourse', { courseId: course.id })} className="grid h-6 w-6 place-items-center rounded-full text-base leading-none outline-none hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent/30" onClick={() => onRemove(course.id)} type="button">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function difficultyLabel(message: string | null | undefined, t: (key: string) => string) {
  if (!message) return t('courseDetail.stats.notAvailable')
  if (message.includes('difficulté moyenne')) return t('courseDetail.stats.moderate')
  if (message.includes('facile')) return t('courseDetail.stats.approachable')
  if (message.includes('difficile')) return t('courseDetail.stats.challenging')
  return t('courseDetail.stats.notAvailable')
}

function popularityLabel(message: string | null | undefined, t: (key: string) => string) {
  if (!message) return t('courseDetail.stats.notAvailable')
  if (message.includes('très populaire')) return t('courseDetail.stats.veryPopular')
  if (message.includes('modérément populaire')) return t('courseDetail.stats.popular')
  if (message.includes('peu populaire')) return t('courseDetail.stats.smallerCohort')
  return t('courseDetail.stats.notAvailable')
}
