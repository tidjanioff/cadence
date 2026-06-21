const courses = [
  { code: 'IFT 2255', title: 'Genie logiciel', time: 'MAR 08:30', color: 'bg-accent' },
  { code: 'IFT 3150', title: 'Projet informatique', time: 'JEU 12:30', color: 'bg-primary' },
  { code: 'MAT 1400', title: 'Calcul 1', time: 'VEN 10:30', color: 'bg-conflict' },
]

export function CoursePreview() {
  return (
    <div className="rotate-1 rounded-panel border border-white/80 bg-white/75 p-4 shadow-card backdrop-blur-xl sm:p-6">
      <div className="mb-8 flex items-center justify-between px-2 pt-1">
        <div>
          <p className="text-xs font-medium text-secondary">Automne 2026</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-primary">Ma semaine</h2>
        </div>
        <div className="flex -space-x-2">
          <span className="h-9 w-9 rounded-full border-2 border-white bg-[#E9F3FF]" />
          <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-primary font-mono text-[10px] text-white">+3</span>
        </div>
      </div>
      <div className="space-y-3">
        {courses.map((course, index) => (
          <article
            className="course-card flex items-center gap-4 rounded-card border border-primary/[0.06] bg-background/90 p-4 sm:p-5"
            key={course.code}
            style={{ animationDelay: `${350 + index * 100}ms` }}
          >
            <span className={`h-12 w-1.5 rounded-full ${course.color}`} />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs font-semibold text-primary">{course.code}</p>
              <p className="mt-1 truncate text-sm text-secondary">{course.title}</p>
            </div>
            <time className="font-mono text-[11px] text-secondary">{course.time}</time>
          </article>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-3 rounded-card bg-[#FFF0EF] px-5 py-4 text-conflict">
        <span className="h-2 w-2 rounded-full bg-conflict" />
        <p className="text-xs font-medium">1 conflit a resoudre dans votre selection</p>
      </div>
    </div>
  )
}
