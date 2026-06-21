import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  checkEligibility,
  createReview,
  getCourseDifficulty,
  getCoursePopularity,
  getCourseReviews,
  type CourseReview,
  type EligibilityResult,
} from '../api/courseDetails'
import { getCourse } from '../api/courses'
import type { Course } from '../types/course'

const inputClass = 'mt-2 w-full rounded-card border border-primary/10 bg-background px-4 py-3.5 text-base text-primary outline-none transition placeholder:text-secondary/70 focus:border-accent/40 focus:ring-4 focus:ring-accent/10'

export function CourseDetailPage() {
  const { id = '' } = useParams()
  const courseId = decodeURIComponent(id).toUpperCase()
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [courseError, setCourseError] = useState(false)
  const [difficulty, setDifficulty] = useState<string | null>(null)
  const [popularity, setPopularity] = useState<string | null>(null)
  const [statsError, setStatsError] = useState(false)
  const [reviews, setReviews] = useState<CourseReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    setCourseError(false)
    setStatsError(false)
    setReviewsLoading(true)
    setReviewsError(false)

    getCourse(courseId, controller.signal)
      .then((result) => {
        setCourse(result)
        setCourseError(!result)
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setCourseError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    Promise.all([
      getCourseDifficulty(courseId, controller.signal),
      getCoursePopularity(courseId, controller.signal),
    ])
      .then(([difficultyResult, popularityResult]) => {
        setDifficulty(difficultyResult)
        setPopularity(popularityResult)
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setStatsError(true)
      })

    getCourseReviews(courseId, controller.signal)
      .then(setReviews)
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setReviewsError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setReviewsLoading(false)
      })

    return () => controller.abort()
  }, [courseId])

  if (isLoading) return <PageStatus message="Loading course…" loading />

  if (courseError || !course) {
    return (
      <PageStatus
        message="We couldn't find that course."
        detail="Check the course code or return to search."
        action={<Link className="font-semibold text-accent" to="/">Back to search</Link>}
      />
    )
  }

  return (
    <main className="min-h-screen px-5 pb-24 pt-7 sm:px-8 sm:pt-9">
      <nav className="mx-auto flex max-w-6xl items-center justify-between" aria-label="Primary navigation">
        <Link className="rounded-md text-xl font-semibold tracking-[-0.03em] text-primary outline-none focus-visible:ring-4 focus-visible:ring-accent/20" to="/">
          Cadence<span className="text-accent">.</span>
        </Link>
        <Link className="rounded-full px-3 py-2 text-sm font-medium text-secondary outline-none transition hover:text-primary focus-visible:ring-4 focus-visible:ring-accent/20" to="/">
          ← All courses
        </Link>
      </nav>

      <header className="reveal mx-auto max-w-5xl pb-20 pt-20 sm:pb-28 sm:pt-28">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xl font-semibold tracking-[0.08em] text-accent sm:text-2xl">{course.id}</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-primary sm:text-7xl">{course.name}</h1>
          </div>
          <span className="shrink-0 rounded-full bg-primary/[0.05] px-4 py-2 font-mono text-sm text-primary">{course.credits} credits</span>
        </div>
        <p className="mt-9 max-w-3xl text-lg leading-8 text-secondary sm:text-xl sm:leading-9">
          {course.description || 'A course description is not available yet.'}
        </p>
        <Link className="mt-10 inline-flex items-center rounded-full bg-accent px-7 py-4 text-sm font-semibold text-white outline-none transition hover:-translate-y-0.5 hover:bg-accent/90 focus-visible:ring-4 focus-visible:ring-accent/30" to="/schedule">
          Add to schedule <span className="ml-2" aria-hidden="true">→</span>
        </Link>
      </header>

      <div className="mx-auto max-w-5xl space-y-28 sm:space-y-36">
        <EligibilitySection courseId={course.id} />
        <StatsSection difficulty={difficulty} popularity={popularity} hasError={statsError} />
        <ReviewsSection courseId={course.id} reviews={reviews} setReviews={setReviews} isLoading={reviewsLoading} hasError={reviewsError} />
      </div>
    </main>
  )
}

function EligibilitySection({ courseId }: { courseId: string }) {
  const [completedCourses, setCompletedCourses] = useState('')
  const [cycle, setCycle] = useState('1')
  const [result, setResult] = useState<EligibilityResult | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [hasError, setHasError] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const completed = completedCourses.split(',').map((code) => code.trim().toUpperCase()).filter(Boolean)
    setIsChecking(true)
    setHasError(false)
    setResult(null)
    try {
      setResult(await checkEligibility(courseId, completed, Number(cycle)))
    } catch {
      setHasError(true)
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <section aria-labelledby="eligibility-heading">
      <SectionHeading eyebrow="Plan with confidence" title="Check your eligibility." description="Enter the courses you have completed and your current study cycle." id="eligibility-heading" />
      <div className="mt-10 rounded-panel border border-primary/[0.06] bg-white p-6 shadow-[0_16px_50px_rgba(29,29,31,0.05)] sm:p-9">
        <form className="grid gap-5 sm:grid-cols-[1fr_10rem_auto] sm:items-end" onSubmit={handleSubmit}>
          <label className="text-sm font-medium text-primary">
            Completed courses
            <input className={inputClass} value={completedCourses} onChange={(event) => setCompletedCourses(event.target.value)} placeholder="IFT1015, MAT1400" />
          </label>
          <label className="text-sm font-medium text-primary">
            Study cycle
            <select className={inputClass} value={cycle} onChange={(event) => setCycle(event.target.value)}>
              {[1, 2, 3, 4].map((value) => <option key={value} value={value}>Cycle {value}</option>)}
            </select>
          </label>
          <button className="rounded-card bg-primary px-6 py-4 text-sm font-semibold text-white outline-none transition hover:bg-primary/85 focus-visible:ring-4 focus-visible:ring-primary/20 disabled:opacity-50" disabled={isChecking} type="submit">
            {isChecking ? 'Checking…' : 'Check eligibility'}
          </button>
        </form>
        {result && (
          <div className={`mt-6 rounded-card border px-5 py-4 text-sm leading-6 ${result.eligible ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-950'}`} role="status">
            <p className="font-semibold">{result.eligible ? 'You are eligible.' : 'Not eligible yet.'}</p>
            <p className="mt-1 opacity-80">{result.message}</p>
          </div>
        )}
        {hasError && <InlineError message="Eligibility could not be checked right now. Please try again." />}
      </div>
    </section>
  )
}

function StatsSection({ difficulty, popularity, hasError }: { difficulty: string | null; popularity: string | null; hasError: boolean }) {
  return (
    <section aria-labelledby="stats-heading">
      <SectionHeading eyebrow="At a glance" title="Know what to expect." description="Historical performance and enrollment, stated simply." id="stats-heading" />
      {hasError ? <InlineError message="Course stats are temporarily unavailable." /> : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <StatCard label="Difficulty" value={difficultyLabel(difficulty)} detail={difficulty} />
          <StatCard label="Popularity" value={popularityLabel(popularity)} detail={popularity} />
        </div>
      )}
    </section>
  )
}

function ReviewsSection({ courseId, reviews, setReviews, isLoading, hasError }: { courseId: string; reviews: CourseReview[]; setReviews: React.Dispatch<React.SetStateAction<CourseReview[]>>; isLoading: boolean; hasError: boolean }) {
  const [professor, setProfessor] = useState('')
  const [difficulty, setDifficulty] = useState('3')
  const [workload, setWorkload] = useState('3')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitError(false)
    setSubmitted(false)
    try {
      await createReview({ sigleCours: courseId, professeur: professor.trim(), noteDifficulte: Number(difficulty), noteCharge: Number(workload), commentaire: comment.trim() })
      setReviews((current) => [{ sigleCours: courseId, nomProfesseur: professor.trim() || null, noteDifficulte: Number(difficulty), noteChargeTravail: Number(workload), commentaire: comment.trim(), valide: true }, ...current])
      setProfessor('')
      setDifficulty('3')
      setWorkload('3')
      setComment('')
      setSubmitted(true)
    } catch {
      setSubmitError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section aria-labelledby="reviews-heading">
      <SectionHeading eyebrow="Student perspective" title="Reviews from the classroom." description="Experiences shared by students who have taken this course." id="reviews-heading" />
      <div className="mt-10 space-y-4">
        {isLoading && <InlineLoading message="Loading reviews…" />}
        {hasError && <InlineError message="Reviews are temporarily unavailable." />}
        {!isLoading && !hasError && reviews.length === 0 && <p className="rounded-panel bg-primary/[0.035] px-6 py-8 text-center text-sm text-secondary">No reviews yet. Be the first to share your experience.</p>}
        {reviews.map((review, index) => (
          <article className="rounded-panel border border-primary/[0.06] bg-white p-6 sm:p-8" key={`${review.nomProfesseur}-${index}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-primary">{review.nomProfesseur || 'Professor not specified'}</h3>
              <div className="flex gap-4 font-mono text-xs text-secondary">
                <span>Difficulty {review.noteDifficulte}/5</span>
                <span>Workload {review.noteChargeTravail}/5</span>
              </div>
            </div>
            <p className="mt-5 leading-7 text-secondary">{review.commentaire}</p>
          </article>
        ))}
      </div>

      <div className="mt-14 border-t border-primary/[0.08] pt-14">
        <h3 className="text-3xl font-semibold tracking-[-0.04em] text-primary">Leave a review.</h3>
        <p className="mt-3 text-secondary">Share a concise, useful note for the next student.</p>
        <form className="mt-8 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="text-sm font-medium text-primary sm:col-span-2">Professor name <span className="font-normal text-secondary">(optional)</span>
            <input className={inputClass} value={professor} onChange={(event) => setProfessor(event.target.value)} placeholder="Professor name" />
          </label>
          <RatingSelect label="Difficulty" value={difficulty} onChange={setDifficulty} />
          <RatingSelect label="Workload" value={workload} onChange={setWorkload} />
          <label className="text-sm font-medium text-primary sm:col-span-2">Comment
            <textarea className={`${inputClass} min-h-32 resize-y`} required value={comment} onChange={(event) => setComment(event.target.value)} placeholder="What should other students know?" />
          </label>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <button className="rounded-full bg-accent px-7 py-4 text-sm font-semibold text-white outline-none transition hover:bg-accent/90 focus-visible:ring-4 focus-visible:ring-accent/30 disabled:opacity-50" disabled={isSubmitting || !comment.trim()} type="submit">{isSubmitting ? 'Submitting…' : 'Submit review'}</button>
            {submitted && <p className="text-sm font-medium text-emerald-700" role="status">Thank you. Your review was submitted.</p>}
            {submitError && <p className="text-sm text-conflict" role="alert">Your review could not be submitted. Please try again.</p>}
          </div>
        </form>
      </div>
    </section>
  )
}

function SectionHeading({ eyebrow, title, description, id }: { eyebrow: string; title: string; description: string; id: string }) {
  return <div><p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-primary sm:text-5xl" id={id}>{title}</h2><p className="mt-4 max-w-2xl text-lg leading-8 text-secondary">{description}</p></div>
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string | null }) {
  return <article className="rounded-panel bg-primary/[0.035] p-7 sm:p-9"><p className="font-mono text-xs uppercase tracking-[0.16em] text-secondary">{label}</p><p className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-primary">{value}</p><p className="mt-4 text-sm leading-6 text-secondary">{detail || 'Loading…'}</p></article>
}

function RatingSelect({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-sm font-medium text-primary">{label}<select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}>{[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></label>
}

function InlineLoading({ message }: { message: string }) {
  return <div className="flex items-center justify-center gap-3 py-10 text-sm text-secondary"><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/10 border-t-accent" />{message}</div>
}

function InlineError({ message }: { message: string }) {
  return <p className="mt-6 rounded-card bg-primary/[0.035] px-5 py-4 text-sm text-secondary" role="status">{message}</p>
}

function PageStatus({ message, detail, action, loading = false }: { message: string; detail?: string; action?: React.ReactNode; loading?: boolean }) {
  return <main className="grid min-h-screen place-items-center px-6 text-center"><div>{loading && <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-primary/10 border-t-accent" />}<h1 className={`${loading ? 'mt-5' : ''} text-2xl font-semibold text-primary`}>{message}</h1>{detail && <p className="mt-2 text-secondary">{detail}</p>}{action && <div className="mt-6">{action}</div>}</div></main>
}

function difficultyLabel(message: string | null) {
  if (!message) return 'Loading…'
  if (message.includes('difficulté moyenne')) return 'Moderate'
  if (message.includes('facile')) return 'Approachable'
  if (message.includes('difficile')) return 'Challenging'
  return 'Not available'
}

function popularityLabel(message: string | null) {
  if (!message) return 'Loading…'
  if (message.includes('très populaire')) return 'Very popular'
  if (message.includes('modérément populaire')) return 'Popular'
  if (message.includes('peu populaire')) return 'Smaller cohort'
  return 'Not available'
}
