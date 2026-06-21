import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function AppHeader({ action }: { action?: ReactNode }) {
  const { t, i18n } = useTranslation()
  const isFrench = i18n.language.startsWith('fr')

  async function setLanguage(language: 'en' | 'fr') {
    if (language === i18n.language) return
    await i18n.changeLanguage(language)
  }

  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4" aria-label="Primary navigation">
      <Link className="rounded-md text-xl font-semibold tracking-[-0.03em] text-primary outline-none focus-visible:ring-4 focus-visible:ring-accent/20" to="/">
        Cadence<span className="text-accent">.</span>
      </Link>
      <div className="flex items-center gap-3 sm:gap-5">
        <span className="text-xs font-medium text-secondary sm:text-sm">{t('header.byline')}</span>
        <div className="flex items-center rounded-full border border-primary/[0.08] bg-surface p-0.5 shadow-sm" aria-label={t('header.languageLabel')}>
          <button
            aria-pressed={!isFrench}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold outline-none transition focus-visible:ring-4 focus-visible:ring-accent/20 ${!isFrench ? 'bg-primary text-white' : 'text-secondary hover:text-primary'}`}
            onClick={() => setLanguage('en')}
            type="button"
          >
            {t('header.english')}
          </button>
          <button
            aria-pressed={isFrench}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold outline-none transition focus-visible:ring-4 focus-visible:ring-accent/20 ${isFrench ? 'bg-primary text-white' : 'text-secondary hover:text-primary'}`}
            onClick={() => setLanguage('fr')}
            type="button"
          >
            {t('header.french')}
          </button>
        </div>
        {action}
      </div>
    </nav>
  )
}
