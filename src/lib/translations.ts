export type Locale = "en" | "de" | "ru"

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "de", label: "DE", flag: "🇩🇪" },
  { code: "ru", label: "RU", flag: "🇷🇺" },
]

export type Translation = {
  nav: { login: string; register: string }
  hero: { badge: string; line1: string; line2: string; sub: string; cta: string; ctaSub: string }
  howTitle: string
  howSub: string
  steps: { title: string; desc: string }[]
  ctaBanner: { title: string; sub: string; cta: string }
  footer: string
}

export const translations: Record<Locale, Translation> = {
  en: {
    nav: {
      login: "Sign In",
      register: "Start Free",
    },
    hero: {
      badge: "The #1 Duo Finder for Valorant",
      line1: "Stop Playing",
      line2: "With Randoms.",
      sub: "Match with players who share your rank, playstyle, and mindset. No more excuses — just wins.",
      cta: "Find My Duo — Free",
      ctaSub: "Already have an account? Sign In →",
    },
    howTitle: "How it works",
    howSub: "Find your Duo in 3 Steps",
    steps: [
      {
        title: "Link Your Account",
        desc: "Connect your Riot Account in seconds. Rank, K/D, and headshot rate load automatically.",
      },
      {
        title: "Set Your Filters",
        desc: "Filter by rank from Iron to Radiant. Play with exactly the level you want.",
      },
      {
        title: "Swipe & Match",
        desc: "Right for interest, left to skip. Both swipe right? Instant match — straight into chat.",
      },
    ],
    ctaBanner: {
      title: "Your Duo is Waiting.",
      sub: "Stop climbing alone. Your perfect teammate is already here.",
      cta: "Find My Duo →",
    },
    footer: "ValoPickr — Not an official Riot Games product",
  },
  de: {
    nav: {
      login: "Anmelden",
      register: "Kostenlos starten",
    },
    hero: {
      badge: "Der #1 Duo-Finder für Valorant",
      line1: "Schluss mit",
      line2: "Toxic Randoms.",
      sub: "Finde Mitspieler, die zu deinem Rank und Spielstil passen. Keine Ausreden mehr — nur Wins.",
      cta: "Mein Duo finden — Gratis",
      ctaSub: "Schon Account? Anmelden →",
    },
    howTitle: "So funktioniert es",
    howSub: "In 3 Schritten zum Duo",
    steps: [
      {
        title: "Account verknüpfen",
        desc: "Verbinde deinen Riot-Account in Sekunden. Rank, K/D und Headshot-Rate laden automatisch.",
      },
      {
        title: "Filter einstellen",
        desc: "Filtere von Iron bis Radiant. Spiele genau mit dem Level, das du willst.",
      },
      {
        title: "Swipen & Matchen",
        desc: "Rechts für Interesse, links zum Skippen. Beide swipen? Sofortiger Match — direkt in den Chat.",
      },
    ],
    ctaBanner: {
      title: "Dein Duo wartet.",
      sub: "Hör auf, alleine zu climben. Dein perfekter Teammate ist schon hier.",
      cta: "Mein Duo finden →",
    },
    footer: "ValoPickr — Kein offizielles Riot Games Produkt",
  },
  ru: {
    nav: {
      login: "Войти",
      register: "Начать бесплатно",
    },
    hero: {
      badge: "Лучший поиск дуо для Valorant",
      line1: "Хватит играть",
      line2: "С Рандомами.",
      sub: "Найди игроков с твоим рангом и стилем. Никакой токсичности — только победы.",
      cta: "Найти дуо — Бесплатно",
      ctaSub: "Уже есть аккаунт? Войти →",
    },
    howTitle: "Как это работает",
    howSub: "Найди дуо за 3 шага",
    steps: [
      {
        title: "Привяжи аккаунт",
        desc: "Подключи аккаунт Riot за секунды. Ранг, K/D и процент хедшотов грузятся автоматически.",
      },
      {
        title: "Настрой фильтры",
        desc: "Фильтруй от Железного до Радианта. Играй именно с тем уровнем, который хочешь.",
      },
      {
        title: "Свайпай и матчься",
        desc: "Вправо — интерес, влево — пропустить. Оба свайпнули? Мгновенный матч — сразу в чат.",
      },
    ],
    ctaBanner: {
      title: "Твоё дуо ждёт.",
      sub: "Хватит клаймбить в одиночку. Твой идеальный тиммейт уже здесь.",
      cta: "Найти дуо →",
    },
    footer: "ValoPickr — Не является официальным продуктом Riot Games",
  },
}
