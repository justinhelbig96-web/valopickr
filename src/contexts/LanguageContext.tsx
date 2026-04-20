"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { type Locale, translations } from "@/lib/translations"

interface LanguageContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  t: typeof translations.en
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: translations.en,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")

  useEffect(() => {
    const stored = localStorage.getItem("valopickr_locale") as Locale | null
    if (stored && stored in translations) setLocaleState(stored)
  }, [])

  function setLocale(l: Locale) {
    setLocaleState(l)
    localStorage.setItem("valopickr_locale", l)
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
