import { CoursePreview } from '../components/CoursePreview'

export function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8 sm:px-10 lg:px-16">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between">
        <a className="text-xl font-semibold tracking-tight text-primary" href="/">
          Cadence<span className="text-accent">.</span>
        </a>
        <span className="rounded-full border border-primary/10 bg-white/70 px-4 py-2 text-xs font-medium text-secondary backdrop-blur">
          powered by PickCourse
        </span>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 pb-20 pt-22 lg:grid-cols-[1.05fr_0.95fr] lg:py-30">
        <div className="reveal">
          <p className="mb-6 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Planifiez votre session, en cadence
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[0.96] tracking-[-0.055em] text-primary sm:text-7xl lg:text-[5.8rem]">
            Composez un horaire qui vous ressemble.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-secondary sm:text-xl">
            Explorez les cours, comparez les options et reperez les conflits avant qu'ils ne deviennent un probleme.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <button className="rounded-full bg-accent px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:-translate-y-0.5 hover:bg-accent/90">
              Planifier ma session
            </button>
            <span className="font-mono text-xs text-secondary">A26 / 15 credits</span>
          </div>
        </div>

        <div className="reveal reveal-delay">
          <CoursePreview />
        </div>
      </section>
    </main>
  )
}
