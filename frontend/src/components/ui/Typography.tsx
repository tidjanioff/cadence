import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">{children}</p>
}

export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  const { i18n } = useTranslation()
  const titleClasses = i18n.language.startsWith('fr')
    ? 'mt-6 max-w-4xl text-5xl font-semibold leading-[0.99] tracking-[-0.055em] text-primary sm:text-6xl lg:text-[4.75rem]'
    : 'mt-6 max-w-4xl text-5xl font-semibold leading-[0.97] tracking-[-0.055em] text-primary sm:text-7xl lg:text-[5.25rem]'

  return (
    <>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className={titleClasses}>{title}</h1>
      <p className="mt-7 max-w-2xl text-base leading-7 text-secondary sm:text-xl sm:leading-8">{description}</p>
    </>
  )
}

export function SectionHeading({ eyebrow, title, description, id }: { eyebrow: string; title: string; description: string; id: string }) {
  return (
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-primary sm:text-5xl" id={id}>{title}</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-secondary sm:text-lg sm:leading-8">{description}</p>
    </div>
  )
}
