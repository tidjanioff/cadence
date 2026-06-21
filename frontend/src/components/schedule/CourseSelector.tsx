import { useState, type FormEvent } from 'react'
import { searchCourses } from '../../api/courses'
import type { Course } from '../../types/course'

interface CourseSelectorProps {
  selectedCourses: Course[]
  onAdd: (course: Course) => void
  onRemove: (courseId: string) => void
}

export function CourseSelector({ selectedCourses, onAdd, onRemove }: CourseSelectorProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Course[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [hasError, setHasError] = useState(false)

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

  return (
    <div>
      <form className="flex gap-2" onSubmit={handleSearch} role="search">
        <label className="sr-only" htmlFor="schedule-course-search">Search courses to add</label>
        <input
          className="min-w-0 flex-1 rounded-card border border-primary/10 bg-background px-4 py-3.5 text-base text-primary outline-none transition placeholder:text-secondary/70 focus:border-accent/40 focus:ring-4 focus:ring-accent/10"
          id="schedule-course-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search IFT1025 or programming"
          type="search"
          value={query}
        />
        <button className="rounded-card bg-primary px-5 py-3.5 text-sm font-semibold text-white outline-none transition hover:bg-primary/85 focus-visible:ring-4 focus-visible:ring-primary/20 disabled:opacity-50" disabled={!query.trim() || isSearching} type="submit">
          {isSearching ? 'Searching…' : 'Find'}
        </button>
      </form>

      {(results.length > 0 || (hasSearched && !isSearching)) && (
        <div className="mt-3 overflow-hidden rounded-card border border-primary/[0.08] bg-white shadow-[0_12px_35px_rgba(29,29,31,0.07)]">
          {results.slice(0, 6).map((course) => {
            const isSelected = selectedCourses.some((selected) => selected.id === course.id)
            return (
              <button className="flex w-full items-center gap-4 border-b border-primary/[0.06] px-4 py-3 text-left outline-none last:border-0 hover:bg-primary/[0.025] focus-visible:bg-accent/[0.06] disabled:opacity-50" disabled={isSelected || selectedCourses.length >= 6} key={course.id} onClick={() => addCourse(course)} type="button">
                <span className="w-20 shrink-0 font-mono text-xs font-semibold text-accent">{course.id}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-primary">{course.name}</span>
                <span className="text-xs text-secondary">{isSelected ? 'Added' : 'Add'}</span>
              </button>
            )
          })}
          {results.length === 0 && !hasError && <p className="px-4 py-5 text-center text-sm text-secondary">No courses found.</p>}
          {hasError && <p className="px-4 py-5 text-center text-sm text-secondary">Search is temporarily unavailable.</p>}
        </div>
      )}

      {selectedCourses.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Selected courses">
          {selectedCourses.map((course) => (
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/[0.08] py-2 pl-3.5 pr-2 font-mono text-xs font-semibold text-accent" key={course.id}>
              {course.id}
              <button aria-label={`Remove ${course.id}`} className="grid h-6 w-6 place-items-center rounded-full text-base leading-none outline-none hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent/30" onClick={() => onRemove(course.id)} type="button">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
