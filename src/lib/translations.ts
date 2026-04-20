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
      badge: "Tinder for Valorant Players",
      line1: "Find Your",
      line2: "Perfect Duo",
      sub: "No more toxic randoms. Swipe through players of your rank, match, and play together.",
      cta: "Start for free",
      ctaSub: "Already have an account? Sign In →",
    },
    howTitle: "How it works",
    howSub: "Find your Duo in 3 Steps",
    steps: [
      {
        title: "Link your Account",
        desc: "Connect your Riot Account. Your stats, rank and K/D are loaded automatically.",
      },
      {
        title: "Set Filters",
        desc: "Choose your desired rank from Iron to Radiant. You decide who you want to play with.",
      },
      {
        title: "Swipe & Match",
        desc: "Right for interest, left to skip. If both swipe: Match! Then jump into chat.",
      },
    ],
    ctaBanner: {
      title: "Ready for your new Duo?",
      sub: "Register for free and find your favourite teammate today.",
      cta: "Get started",
    },
    footer: "ValoMate — Not an official Riot Games product",
  },
  de: {
    nav: {
      login: "Anmelden",
      register: "Kostenlos starten",
    },
    hero: {
      badge: "Tinder für Valorant Spieler",
      line1: "Finde deinen",
      line2: "Perfect Duo",
      sub: "Schluss mit toxischen Randoms. Swipt durch Spieler deines Ranks, matched und spielt zusammen.",
      cta: "Jetzt kostenlos starten",
      ctaSub: "Schon Account? Anmelden →",
    },
    howTitle: "So funktioniert es",
    howSub: "In 3 Schritten zum Duo",
    steps: [
      {
        title: "Account verknüpfen",
        desc: "Verbinde deinen Riot-Account. Deine Stats, Rank und K/D werden automatisch geladen.",
      },
      {
        title: "Filter einstellen",
        desc: "Wähle deinen Wunsch-Rank von Iron bis Radiant. Du bestimmst, mit wem du spielen willst.",
      },
      {
        title: "Swipen & Matchen",
        desc: "Rechts für Interesse, links zum Skippen. Wenn beide swipen: Match! Dann ab in den Chat.",
      },
    ],
    ctaBanner: {
      title: "Bereit für dein neues Duo?",
      sub: "Registriere dich kostenlos und finde noch heute deinen Lieblings-Teammate.",
      cta: "Jetzt starten",
    },
    footer: "ValoMate — Kein offizielles Riot Games Produkt",
  },
  ru: {
    nav: {
      login: "Войти",
      register: "Начать бесплатно",
    },
    hero: {
      badge: "Тиндер для игроков Valorant",
      line1: "Найди своего",
      line2: "Perfect Duo",
      sub: "Хватит токсичных рандомов. Листай игроков своего ранга, матчься и играй вместе.",
      cta: "Начать бесплатно",
      ctaSub: "Уже есть аккаунт? Войти →",
    },
    howTitle: "Как это работает",
    howSub: "Найди дуо за 3 шага",
    steps: [
      {
        title: "Привяжи аккаунт",
        desc: "Подключи аккаунт Riot. Твоя статистика, ранг и K/D загружаются автоматически.",
      },
      {
        title: "Настрой фильтры",
        desc: "Выбери желаемый ранг от Железного до Радианта. Ты сам решаешь, с кем играть.",
      },
      {
        title: "Свайпай и матчься",
        desc: "Вправо — интерес, влево — пропустить. Оба свайпнули — Матч! Затем в чат.",
      },
    ],
    ctaBanner: {
      title: "Готов к новому дуо?",
      sub: "Зарегистрируйся бесплатно и найди своего напарника уже сегодня.",
      cta: "Начать",
    },
    footer: "ValoMate — Не является официальным продуктом Riot Games",
  },
}
