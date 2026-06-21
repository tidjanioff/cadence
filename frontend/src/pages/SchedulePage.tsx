import { useState } from 'react'
import { Link } from 'react-router-dom'
import { generateScheduleOptions } from '../api/schedule'
import { CalendarGrid } from '../components/schedule/CalendarGrid'
import { CourseSelector } from '../components/schedule/CourseSelector'
import { courseColor } from '../components/schedule/colors'
import type { Course } from '../types/course'
import type { ScheduleOption } from '../types/schedule'

export function SchedulePage() {
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([])
  const [semester, setSemester] = useState('A25')
  const [options, setOptions] = useState<ScheduleOption[]>([])
  const [optionIndex, setOptionIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [hasError, setHasError] = useState(false)

  function resetSchedule() {
    setOptions([])
    setOptionIndex(0)
    setHasGenerated(false)
    setHasError(false)
  }

  function addCourse(course: Course) {
    if (selectedCourses.length >= 6 || selectedCourses.some((selected) => selected.id === course.id)) return
    setSelectedCourses((current) => [...current, course])
    resetSchedule()
  }

  function removeCourse(courseId: string) {
    setSelectedCourses((current) => current.filter((course) => course.id !== courseId))
    resetSchedule()
  }

  async function generate() {
    if (selectedCourses.length === 0 || !semester.trim()) return
    setIsGenerating(true)
    setHasError(false)
    setHasGenerated(false)
    setOptions([])
    setOptionIndex(0)
    try {
      const generated = await generateScheduleOptions(selectedCourses.map((course) => course.id), semester.trim().toUpperCase())
      setOptions(generated)
      setHasGenerated(true)
    } catch {
      setHasError(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const currentOption = options[optionIndex]

  return (
    <main className="min-h-screen px-5 pb-24 pt-7 sm:px-8 sm:pt-9">
      <nav className="mx-auto flex max-w-7xl items-center justify-between" aria-label="Primary navigation">
        <Link className="rounded-md text-xl font-semibold tracking-[-0.03em] text-primary outline-none focus-visible:ring-4 focus-visible:ring-accent/20" to="/">Cadence<span className="text-accent">.</span></Link>
        <Link className="rounded-full px-3 py-2 text-sm font-medium text-secondary outline-none transition hover:text-primary focus-visible:ring-4 focus-visible:ring-accent/20" to="/">← Course search</Link>
      </nav>

      <header className="reveal mx-auto max-w-5xl pb-14 pt-20 text-center sm:pb-18 sm:pt-28">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">Schedule builder</p>
        <h1 className="mt-5 text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-primary sm:text-7xl">See your week before it happens.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-secondary">Add up to six courses, choose a semester, and explore available section combinations.</p>
      </header>

      <section className="mx-auto max-w-5xl rounded-panel border border-primary/[0.06] bg-white p-6 shadow-[0_16px_50px_rgba(29,29,31,0.05)] sm:p-9" aria-labelledby="build-heading">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-primary" id="build-heading">Build your course list</h2>
        <p className="mt-2 text-sm text-secondary">Search by course code or name. The backend supports a maximum of six courses.</p>
        <div className="mt-7"><CourseSelector onAdd={addCourse} onRemove={removeCourse} selectedCourses={selectedCourses} /></div>
        <div className="mt-8 flex flex-col gap-4 border-t border-primary/[0.07] pt-7 sm:flex-row sm:items-end sm:justify-between">
          <label className="text-sm font-medium text-primary">Target semester
            <input className="mt-2 block w-36 rounded-card border border-primary/10 bg-background px-4 py-3 font-mono text-sm uppercase text-primary outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/10" maxLength={3} onChange={(event) => { setSemester(event.target.value.toUpperCase()); resetSchedule() }} placeholder="A25" value={semester} />
          </label>
          <button className="rounded-full bg-accent px-7 py-4 text-sm font-semibold text-white outline-none transition hover:-translate-y-0.5 hover:bg-accent/90 focus-visible:ring-4 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50" disabled={selectedCourses.length === 0 || !semester.trim() || isGenerating} onClick={generate} type="button">
            {isGenerating ? 'Generating schedule…' : 'Generate schedule'}
          </button>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl" aria-busy={isGenerating} aria-live="polite">
        {selectedCourses.length === 0 && !isGenerating && <EmptyState title="Your week starts here." detail="Add a course above to begin building your schedule." />}
        {selectedCourses.length > 0 && !hasGenerated && !isGenerating && !hasError && <EmptyState title="Ready when you are." detail="Generate a schedule to see available section combinations." />}
        {isGenerating && <div className="flex items-center justify-center gap-3 py-20 text-sm text-secondary"><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/10 border-t-accent" />Finding every valid option…</div>}
        {hasError && <EmptyState title="Schedules are temporarily unavailable." detail="Check the semester and try again in a moment." />}
        {hasGenerated && options.length === 0 && <EmptyState title="No schedule options found." detail="One or more courses may not have sections in this semester. Try another semester or course selection." />}
        {currentOption && (
          <div className="results-enter">
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent">Your weekly calendar</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-primary">Option {optionIndex + 1} of {options.length}</h2><p className="mt-2 text-sm text-secondary">{currentOption.conflits.length === 0 ? 'No conflicts in this option.' : `${currentOption.conflits.length} time conflict${currentOption.conflits.length === 1 ? '' : 's'} detected.`}</p></div>
              <div className="flex gap-2">
                <button aria-label="Previous schedule option" className="rounded-full border border-primary/10 bg-white px-5 py-3 text-sm font-semibold text-primary outline-none hover:bg-primary/[0.03] focus-visible:ring-4 focus-visible:ring-accent/20 disabled:opacity-35" disabled={optionIndex === 0} onClick={() => setOptionIndex((current) => current - 1)} type="button">← Previous</button>
                <button aria-label="Next schedule option" className="rounded-full border border-primary/10 bg-white px-5 py-3 text-sm font-semibold text-primary outline-none hover:bg-primary/[0.03] focus-visible:ring-4 focus-visible:ring-accent/20 disabled:opacity-35" disabled={optionIndex === options.length - 1} onClick={() => setOptionIndex((current) => current + 1)} type="button">Next →</button>
              </div>
            </div>
            <div className="rounded-panel border border-primary/[0.07] bg-white p-4 shadow-[0_16px_55px_rgba(29,29,31,0.05)] sm:p-7"><CalendarGrid courses={selectedCourses} option={currentOption} /></div>
            <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 rounded-card bg-primary/[0.03] px-5 py-4" aria-label="Course color legend">
              {selectedCourses.map((course, index) => { const color = courseColor(index); return <div className="flex min-w-0 items-center gap-2.5" key={course.id}><span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color.color }} /><span className="font-mono text-xs font-semibold text-primary">{course.id}</span><span className="max-w-52 truncate text-xs text-secondary">{course.name}</span></div> })}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="py-20 text-center"><h2 className="text-2xl font-semibold tracking-[-0.03em] text-primary">{title}</h2><p className="mt-3 text-sm text-secondary">{detail}</p></div>
}
