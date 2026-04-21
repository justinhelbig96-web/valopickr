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
  discover: {
    loading: string
    emptyTitle: string
    emptySub: string
    reload: string
    adjustFilters: string
    filter: string
    online: string
    likeStamp: string
    nopeStamp: string
  }
  matches: {
    title: string
    emptyTitle: string
    emptySub: string
    toDiscover: string
    newMatches: string
    messages: string
    writeFirst: string
    matchSingular: string
    matchPlural: string
  }
  profile: {
    logout: string
    noName: string
    tabEdit: string
    tabValorant: string
    changePhoto: string
    labelDisplayName: string
    placeholderDisplayName: string
    labelBio: string
    placeholderBio: string
    labelDiscord: string
    labelSocialLinks: string
    labelSocialLinksOptional: string
    labelPlaystyle: string
    labelLanguages: string
    labelAgentMains: string
    agentMaxHint: string
    saveChanges: string
    saving: string
    saved: string
    valorantAccount: string
    syncStats: string
    syncing: string
    noStats: string
    noAccount: string
    linkAccount: string
  }
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
    discover: {
      loading: "LOADING PROFILES",
      emptyTitle: "No more profiles",
      emptySub: "You've swiped through all available profiles.\nAdjust your filters or come back later.",
      reload: "Reload",
      adjustFilters: "Adjust Filters",
      filter: "Filter",
      online: "Online",
      likeStamp: "MATCH ❤️",
      nopeStamp: "NOPE 👎",
    },
    matches: {
      title: "Matches",
      emptyTitle: "No matches yet",
      emptySub: "Keep swiping to find your Duo partner!",
      toDiscover: "Start Swiping",
      newMatches: "New Matches",
      messages: "Messages",
      writeFirst: "Say hi first!",
      matchSingular: "Match",
      matchPlural: "Matches",
    },
    profile: {
      logout: "Logout",
      noName: "No Name",
      tabEdit: "Profile",
      tabValorant: "Valorant",
      changePhoto: "Change photo",
      labelDisplayName: "Display Name",
      placeholderDisplayName: "Your name...",
      labelBio: "Bio",
      placeholderBio: "Tell us about yourself — playstyle, goals...",
      labelDiscord: "Discord Tag",
      labelSocialLinks: "Social Links",
      labelSocialLinksOptional: "(optional)",
      labelPlaystyle: "Playstyle",
      labelLanguages: "Languages",
      labelAgentMains: "Agent Mains",
      agentMaxHint: "(max. 3)",
      saveChanges: "Save Changes",
      saving: "Saving...",
      saved: "Saved!",
      valorantAccount: "Account",
      syncStats: "Sync Stats",
      syncing: "Syncing...",
      noStats: "No stats yet. Click \"Sync Stats\".",
      noAccount: "No Valorant account linked yet",
      linkAccount: "Link Account",
    },
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
    discover: {
      loading: "LADE PROFILE",
      emptyTitle: "Keine Profile mehr",
      emptySub: "Alle verfügbaren Profile wurden geswiped.\nPasse deine Filter an oder komm später wieder.",
      reload: "Erneut laden",
      adjustFilters: "Filter anpassen",
      filter: "Filter",
      online: "Online",
      likeStamp: "MATCH ❤️",
      nopeStamp: "NOPE 👎",
    },
    matches: {
      title: "Matches",
      emptyTitle: "Noch keine Matches",
      emptySub: "Swipt weiter und findet euren Duo-Partner!",
      toDiscover: "Zum Swipen",
      newMatches: "Neue Matches",
      messages: "Nachrichten",
      writeFirst: "Schreib als Erstes!",
      matchSingular: "Match",
      matchPlural: "Matches",
    },
    profile: {
      logout: "Logout",
      noName: "Kein Name",
      tabEdit: "Profil",
      tabValorant: "Valorant",
      changePhoto: "Bild ändern",
      labelDisplayName: "Anzeigename",
      placeholderDisplayName: "Dein Name...",
      labelBio: "Bio",
      placeholderBio: "Erzähl etwas über dich — Spielstil, Ziele...",
      labelDiscord: "Discord Tag",
      labelSocialLinks: "Social Links",
      labelSocialLinksOptional: "(optional)",
      labelPlaystyle: "Spielstil",
      labelLanguages: "Sprachen",
      labelAgentMains: "Agent Mains",
      agentMaxHint: "(max. 3)",
      saveChanges: "Änderungen speichern",
      saving: "Speichern...",
      saved: "Gespeichert!",
      valorantAccount: "Account",
      syncStats: "Sync Stats",
      syncing: "Syncing...",
      noStats: "Noch keine Stats. Klick auf \"Sync Stats\".",
      noAccount: "Noch kein Valorant-Account verknüpft",
      linkAccount: "Account verknüpfen",
    },
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
    discover: {
      loading: "ЗАГРУЗКА ПРОФИЛЕЙ",
      emptyTitle: "Профилей больше нет",
      emptySub: "Вы просмотрели все доступные профили.\nИзмените фильтры или возвращайтесь позже.",
      reload: "Обновить",
      adjustFilters: "Настроить фильтры",
      filter: "Фильтры",
      online: "Онлайн",
      likeStamp: "МАТЧ ❤️",
      nopeStamp: "НOPE 👎",
    },
    matches: {
      title: "Матчи",
      emptyTitle: "Матчей пока нет",
      emptySub: "Свайпайте дальше, чтобы найти дуо-партнёра!",
      toDiscover: "Свайпать",
      newMatches: "Новые матчи",
      messages: "Сообщения",
      writeFirst: "Напиши первым!",
      matchSingular: "Матч",
      matchPlural: "Матчей",
    },
    profile: {
      logout: "Выйти",
      noName: "Нет имени",
      tabEdit: "Профиль",
      tabValorant: "Valorant",
      changePhoto: "Изменить фото",
      labelDisplayName: "Имя",
      placeholderDisplayName: "Твоё имя...",
      labelBio: "О себе",
      placeholderBio: "Расскажи о себе — стиль игры, цели...",
      labelDiscord: "Discord Tag",
      labelSocialLinks: "Соцсети",
      labelSocialLinksOptional: "(необязательно)",
      labelPlaystyle: "Стиль игры",
      labelLanguages: "Языки",
      labelAgentMains: "Основные агенты",
      agentMaxHint: "(макс. 3)",
      saveChanges: "Сохранить изменения",
      saving: "Сохранение...",
      saved: "Сохранено!",
      valorantAccount: "Аккаунт",
      syncStats: "Sync Stats",
      syncing: "Синхронизация...",
      noStats: "Статистики пока нет. Нажми «Sync Stats».",
      noAccount: "Аккаунт Valorant не привязан",
      linkAccount: "Привязать аккаунт",
    },
  },
}
