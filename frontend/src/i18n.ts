import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import fr from './locales/fr.json'

export const LANGUAGE_STORAGE_KEY = 'cadence.language'
export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const

function normalizeLanguage(value: string | null | undefined) {
  if (value?.toLowerCase().startsWith('fr')) return 'fr'
  if (value?.toLowerCase().startsWith('en')) return 'en'
  return null
}

export function getInitialLanguage() {
  if (typeof window !== 'undefined') {
    const stored = normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY))
    if (stored) return stored

    for (const language of navigator.languages ?? [navigator.language]) {
      const detected = normalizeLanguage(language)
      if (detected) return detected
    }
  }

  return 'en'
}

function syncDocumentLanguage(language: string) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = language
}

function syncStoredLanguage(language: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    supportedLngs: [...SUPPORTED_LANGUAGES],
    nonExplicitSupportedLngs: true,
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
  })

syncDocumentLanguage(i18n.language)
syncStoredLanguage(i18n.language)

i18n.on('languageChanged', (language) => {
  syncDocumentLanguage(language)
  syncStoredLanguage(language)
})

export default i18n
