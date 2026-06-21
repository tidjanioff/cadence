import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { searchCourses } from '../api/courses'
import type { Course } from '../types/course'

export function LandingPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Course[] | null>(null)
  const [searchedFor, setSearchedFor] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const activeRequest = useRef<AbortController | null>(null)

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const searchTerm = query.trim()
    if (!searchTerm) return

    activeRequest.current?.abort()
    const controller = new AbortController()
    activeRequest.current = controller
    setSearchedFor(searchTerm)
    setIsLoading(true)
    setHasError(false)
    setResults(null)

    try {
      setResults(await searchCourses(searchTerm, controller.signal))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setHasError(true)
      setResults([])
    } finally {
      if (activeRequest.current === controller) setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-5 pb-20 pt-7 sm:px-8 sm:pt-9">
      <nav className="mx-auto flex max-w-6xl items-center justify-between" aria-label="Primary navigation">
        <Link className="rounded-md text-xl font-semibold tracking-[-0.03em] text-primary outline-none focus-visible:ring-4 focus-visible:ring-accent/20" to="/">
          Cadence<span className="text-accent">.</span>
        </Link>
        <span className="text-xs font-medium text-secondary sm:text-sm">by PickCourse</span>
      </nav>

      <section className="mx-auto flex max-w-5xl flex-col items-center pb-12 pt-24 text-center sm:pb-16 sm:pt-32 lg:pt-40">
        <p className="reveal font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">Find your next course</p>
        <h1 className="reveal reveal-delay mt-6 max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.06em] text-primary sm:text-7xl lg:text-[5.75rem]">
          Build a schedule with zero conflicts.
        </h1>
        <p className="reveal reveal-delay-2 mt-7 max-w-2xl text-base leading-7 text-secondary sm:text-xl sm:leading-8">
          Search the course catalog, find what fits, and make every semester fall into place.
        </p>

        <form className="reveal reveal-delay-2 mt-10 w-full max-w-3xl sm:mt-12" onSubmit={handleSearch} role="search">
          <label className="sr-only" htmlFor="course-search">Search by course code, name, or description</label>
          <div className="flex items-center gap-2 rounded-panel border border-primary/[0.08] bg-white p-2.5 shadow-card transition focus-within:border-accent/40 focus-within:ring-4 focus-within:ring-accent/10 sm:gap-3 sm:p-3">
            <svg className="ml-2 h-5 w-5 shrink-0 text-secondary sm:ml-3" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m16.25 16.25 4 4" />
            </svg>
            <input
              id="course-search"
              className="min-w-0 flex-1 bg-transparent px-1 py-3 text-base text-primary outline-none placeholder:text-secondary/80 sm:text-lg"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try IFT1025 or algorithms"
              autoComplete="off"
            />
            <button
              className="shrink-0 rounded-card bg-accent px-5 py-3.5 text-sm font-semibold text-white outline-none transition hover:bg-accent/90 focus-visible:ring-4 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50 sm:px-7"
              type="submit"
              disabled={!query.trim() || isLoading}
            >
              <span className="hidden sm:inline">Search courses</span>
              <span className="sm:hidden">Search</span>
            </button>
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-4xl" aria-live="polite" aria-busy={isLoading}>
        {isLoading && <LoadingState />}
        {!isLoading && hasError && (
          <div className="py-14 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-primary">Search is temporarily unavailable.</h2>
            <p className="mt-2 text-sm text-secondary">Please try again in a moment.</p>
          </div>
        )}
        {!isLoading && !hasError && results?.length === 0 && (
          <div className="py-14 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-primary">No courses found.</h2>
            <p className="mt-2 text-sm text-secondary">Try a different code or a broader course name.</p>
          </div>
        )}
        {!isLoading && results && results.length > 0 && (
          <div className="results-enter">
            <div className="mb-5 flex items-end justify-between gap-4 px-1">
              <div>
                <p className="text-sm text-secondary">Results for “{searchedFor}”</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-primary">{results.length} {results.length === 1 ? 'course' : 'courses'}</h2>
              </div>
            </div>
            <ul className="space-y-3">
              {results.map((course) => (
                <li key={course.id}>
                  <Link
                    className="group flex items-center gap-4 rounded-panel border border-primary/[0.06] bg-white px-5 py-5 shadow-[0_8px_30px_rgba(29,29,31,0.04)] outline-none transition hover:-translate-y-0.5 hover:border-primary/10 hover:shadow-[0_14px_40px_rgba(29,29,31,0.08)] focus-visible:ring-4 focus-visible:ring-accent/25 sm:px-7 sm:py-6"
                    to={`/courses/${encodeURIComponent(course.id)}`}
                  >
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-8">
                      <p className="shrink-0 font-mono text-sm font-semibold tracking-wide text-accent sm:w-24">{course.id}</p>
                      <p className="mt-1 truncate text-base font-medium text-primary sm:mt-0">{course.name}</p>
                    </div>
                    <p className="shrink-0 text-sm text-secondary">{course.credits} cr.</p>
                    <svg className="h-5 w-5 shrink-0 text-secondary transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-3 py-14 text-sm text-secondary">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/10 border-t-accent" aria-hidden="true" />
      Searching courses…
    </div>
  )
}
