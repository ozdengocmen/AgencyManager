import type { AppLanguage } from "../state";

export interface I18nCopy {
  locale: string;
  layout: {
    appTitle: string;
    appSubtitle: string;
    dashboard: string;
    agencies: string;
    dailyPlan: string;
    mapClusters: string;
    meetingPrep: string;
    tasks: string;
    settings: string;
    unknownUser: string;
    anonymousRole: string;
    signOut: string;
  };
  login: {
    title: string;
    description: string;
    email: string;
    password: string;
    role: string;
    salesperson: string;
    manager: string;
    portfolioFilter: string;
    portfolioOwner: string;
    portfolioRegion: string;
    portfolioAll: string;
    language: string;
    english: string;
    turkish: string;
    signIn: string;
    signingIn: string;
    defaultsPrefix: string;
    signInSuccess: string;
  };
  dashboard: {
    title: string;
    welcome: (name: string) => string;
    userFallback: string;
    todaysPlan: string;
    visitsPlanned: string;
    estimatedTravelTime: string;
    firstVisit: string;
    viewDayPlan: string;
    nextVisit: string;
    priorityTier: (tier: string) => string;
    renewalRisk: string;
    highClaims: string;
    nextRecommendedVisit: string;
    generateMeetingPrep: string;
    portfolioKpis: string;
    totalPremiums: string;
    totalRevenue: string;
    avgClaimsRatio: string;
    avgRenewalRate: string;
    avgHealthScore: string;
    benchmark: string;
    aboveTarget: string;
    priorityFeed: string;
    viewAllAgencies: string;
    concentrationRisk: string;
    growthBadge: (branch: string, growth: number) => string;
    healthScore: string;
    renewalRate: string;
    claimsRatio: string;
    open: string;
    addToPlan: string;
    agencyAlreadyInPlan: string;
    addedAgencyToPlan: (agencyId: string) => string;
  };
  dailyPlan: {
    removeSelected: string;
    removeVisit: string;
    removed: (agencyName: string) => string;
    removeFailed: string;
    agencyAlreadyInPlan: string;
    addedAgencyToPlan: (agencyId: string) => string;
    routeOptimizationFailed: string;
    routeOptimized: (km: number, minutes: number) => string;
    meetingPrepGenerated: (agencyId: string) => string;
    meetingPrepGenerationFailed: string;
    outcomeSaved: (agencyId: string) => string;
    outcomeSaveFailed: string;
    generating: string;
    generatePrep: string;
    risk: string;
    candidatePool: string;
    searchAgencies: string;
    allAgencies: string;
    dueThisWeek: string;
    renewalRisk: string;
    highGrowth: string;
    addToPlan: string;
    todaysPlan: string;
    visitsPlanned: (count: number) => string;
    autosave: string;
    optimizing: string;
    optimizeRoute: string;
    noVisitsPlanned: string;
    visitDetails: string;
    meetingObjective: string;
    objectiveRenewal: string;
    objectiveClaims: string;
    objectiveCrossSell: string;
    objectiveRelationship: string;
    timeWindow: string;
    meetingPrep: string;
    notes: string;
    notesPlaceholder: string;
    generateMeetingPrep: string;
    checklist: string;
    checklistReviewKpis: string;
    checklistPrepareTalkingPoints: string;
    checklistReviewLastNotes: string;
    afterVisit: string;
    outcome: string;
    selectOutcome: string;
    outcomeNotSet: string;
    outcomeSuccess: string;
    outcomeNeutral: string;
    outcomeRisk: string;
    selectVisitHint: string;
    goalRenewal: string;
    goalClaims: string;
    goalCrossSell: string;
    goalRelationship: string;
  };
  meetingPrep: {
    selectAgencies: string;
    selectedCount: (count: number) => string;
    risk: string;
    generationSettings: string;
    template: string;
    templateStandard: string;
    templateRenewal: string;
    templateClaims: string;
    templateGrowth: string;
    templateConcentration: string;
    templateRelationship: string;
    tone: string;
    toneFriendly: string;
    toneConsultative: string;
    toneAssertive: string;
    length: string;
    lengthShort: string;
    lengthMedium: string;
    lengthLong: string;
    options: string;
    includeBenchmarks: string;
    generate: string;
    generating: string;
    regenerateWithConstraints: string;
    generatedOutput: string;
    saving: string;
    saveToNotes: string;
    creating: string;
    createTasks: string;
    export: string;
    exportPlanned: string;
    emptyState: string;
    selectAgencyBeforeGenerate: string;
    generatedNarratives: (count: number) => string;
    narrativeGenerationFailed: string;
    generateBeforeSave: string;
    savedNotes: (count: number) => string;
    saveNotesFailed: string;
    selectAgencyFirst: string;
    createdTasks: (count: number) => string;
    taskCreationFailed: string;
    sectionTitle: (agencyName: string) => string;
  };
  settings: {
    title: string;
    subtitle: string;
    workPreferences: string;
    language: string;
    defaultStartLocation: string;
    office: string;
    home: string;
    manualEntry: string;
    startLocationHint: string;
    workingHours: string;
    startTime: string;
    endTime: string;
    routePreferences: string;
    maxVisitsPerDay: string;
    maxVisitsHint: string;
    maxTravelHours: string;
    maxTravelHint: string;
    avgVisitMinutes: string;
    aiAssistantSettings: string;
    includeBenchmarks: string;
    includeBenchmarksHint: string;
    autoGenerateNotes: string;
    autoGenerateNotesHint: string;
    priorityNotifications: string;
    priorityNotificationsHint: string;
    defaultTone: string;
    toneFriendly: string;
    toneConsultative: string;
    toneAssertive: string;
    notifications: string;
    visitReminders: string;
    visitRemindersHint: string;
    taskDueAlerts: string;
    taskDueAlertsHint: string;
    performanceAlerts: string;
    performanceAlertsHint: string;
    account: string;
    fullName: string;
    email: string;
    role: string;
    cancel: string;
    saveChanges: string;
    settingsSaved: string;
    changesReverted: string;
  };
  assistant: {
    title: string;
    welcome: string;
    working: string;
    askPlaceholder: string;
    footer: string;
    requestFailed: string;
    requestFailedDetail: string;
    noDirectMatch: string;
    topAgencyMatches: string;
    followUpHint: string;
    meetingSectionTitle: (agencyName: string, agencyId: string) => string;
  };
}

const EN_COPY: I18nCopy = {
  locale: "en-US",
  layout: {
    appTitle: "Agency Portfolio",
    appSubtitle: "Assistant",
    dashboard: "Dashboard",
    agencies: "Agencies",
    dailyPlan: "Daily Plan",
    mapClusters: "Map & Clusters",
    meetingPrep: "Meeting Prep",
    tasks: "Tasks & Follow-ups",
    settings: "Settings",
    unknownUser: "Unknown User",
    anonymousRole: "anonymous",
    signOut: "Sign Out",
  },
  login: {
    title: "Agency Portfolio Assistant",
    description: "Sign in to manage your insurance agency portfolio",
    email: "Email",
    password: "Password",
    role: "Role",
    salesperson: "Salesperson",
    manager: "Manager",
    portfolioFilter: "Portfolio Filter",
    portfolioOwner: "John Smith (Sales Owner)",
    portfolioRegion: "New York Region",
    portfolioAll: "All Portfolios",
    language: "Language",
    english: "English",
    turkish: "Turkce",
    signIn: "Sign In",
    signingIn: "Signing In...",
    defaultsPrefix: "Default",
    signInSuccess: "Signed in successfully.",
  },
  dashboard: {
    title: "Dashboard",
    welcome: (name) => `Welcome back, ${name}. Here's your portfolio overview.`,
    userFallback: "User",
    todaysPlan: "Today's Plan",
    visitsPlanned: "Visits Planned",
    estimatedTravelTime: "Est. Travel Time",
    firstVisit: "First Visit",
    viewDayPlan: "View Day Plan",
    nextVisit: "Next Visit",
    priorityTier: (tier) => `Priority ${tier}`,
    renewalRisk: "Renewal Risk",
    highClaims: "High Claims",
    nextRecommendedVisit: "Next Recommended Visit",
    generateMeetingPrep: "Generate Meeting Prep",
    portfolioKpis: "Portfolio KPIs",
    totalPremiums: "Total Premiums",
    totalRevenue: "Total Revenue",
    avgClaimsRatio: "Avg Claims Ratio",
    avgRenewalRate: "Avg Renewal Rate",
    avgHealthScore: "Avg Health Score",
    benchmark: "Benchmark",
    aboveTarget: "Above target",
    priorityFeed: "Priority Feed (AI-Ranked)",
    viewAllAgencies: "View All Agencies",
    concentrationRisk: "Concentration Risk",
    growthBadge: (branch, growth) => `Growth: ${branch} (+${growth}%)`,
    healthScore: "Health Score",
    renewalRate: "Renewal Rate",
    claimsRatio: "Claims Ratio",
    open: "Open",
    addToPlan: "Add to Plan",
    agencyAlreadyInPlan: "Agency is already in today's plan.",
    addedAgencyToPlan: (agencyId) => `Added ${agencyId} to today's plan.`,
  },
  dailyPlan: {
    removeSelected: "Remove Selected",
    removeVisit: "Remove from Plan",
    removed: (agencyName) => `${agencyName} was removed from today's plan.`,
    removeFailed: "Could not remove visit from plan.",
    agencyAlreadyInPlan: "Agency is already in today's plan.",
    addedAgencyToPlan: (agencyId) => `Added ${agencyId} to today's plan.`,
    routeOptimizationFailed: "Route optimization failed.",
    routeOptimized: (km, minutes) => `Route optimized (${km.toFixed(1)} km / ${minutes} min).`,
    meetingPrepGenerated: (agencyId) => `Meeting prep generated for ${agencyId}.`,
    meetingPrepGenerationFailed: "Meeting prep generation failed.",
    outcomeSaved: (agencyId) => `Outcome saved for ${agencyId}.`,
    outcomeSaveFailed: "Failed to save meeting outcome.",
    generating: "Generating...",
    generatePrep: "Generate Prep",
    risk: "Risk",
    candidatePool: "Candidate Pool",
    searchAgencies: "Search agencies...",
    allAgencies: "All Agencies",
    dueThisWeek: "Due This Week",
    renewalRisk: "Renewal Risk",
    highGrowth: "High Growth",
    addToPlan: "Add to Plan",
    todaysPlan: "Today's Plan",
    visitsPlanned: (count) => `${count} visits planned`,
    autosave: "Autosave",
    optimizing: "Optimizing...",
    optimizeRoute: "Optimize Route",
    noVisitsPlanned: "No visits planned yet. Add agencies from the candidate pool.",
    visitDetails: "Visit Details",
    meetingObjective: "Meeting Objective",
    objectiveRenewal: "Renewal Discussion",
    objectiveClaims: "Claims Review",
    objectiveCrossSell: "Cross-sell Opportunity",
    objectiveRelationship: "Relationship Building",
    timeWindow: "Time Window",
    meetingPrep: "Meeting Prep",
    notes: "Notes",
    notesPlaceholder: "Add notes for this visit...",
    generateMeetingPrep: "Generate Meeting Prep",
    checklist: "Checklist",
    checklistReviewKpis: "Review agency KPIs",
    checklistPrepareTalkingPoints: "Prepare talking points",
    checklistReviewLastNotes: "Review last meeting notes",
    afterVisit: "After Visit",
    outcome: "Outcome",
    selectOutcome: "Select outcome...",
    outcomeNotSet: "Not set",
    outcomeSuccess: "Success",
    outcomeNeutral: "Neutral",
    outcomeRisk: "Risk",
    selectVisitHint: "Select a visit to view details",
    goalRenewal: "Renewal",
    goalClaims: "Claims",
    goalCrossSell: "Cross-sell",
    goalRelationship: "Relationship",
  },
  meetingPrep: {
    selectAgencies: "Select Agencies",
    selectedCount: (count) => `${count} selected`,
    risk: "Risk",
    generationSettings: "Generation Settings",
    template: "Template",
    templateStandard: "Standard Review",
    templateRenewal: "Renewal Improvement Plan",
    templateClaims: "Claims Ratio Discussion",
    templateGrowth: "Growth Play",
    templateConcentration: "Concentration Risk Mitigation",
    templateRelationship: "Relationship Maintenance",
    tone: "Tone",
    toneFriendly: "Friendly",
    toneConsultative: "Consultative",
    toneAssertive: "Assertive",
    length: "Length",
    lengthShort: "Short (5 min)",
    lengthMedium: "Medium (15 min)",
    lengthLong: "Long (30 min)",
    options: "Options",
    includeBenchmarks: "Include Benchmarks",
    generate: "Generate",
    generating: "Generating...",
    regenerateWithConstraints: "Regenerate with Constraints",
    generatedOutput: "Generated Output",
    saving: "Saving...",
    saveToNotes: "Save to Notes",
    creating: "Creating...",
    createTasks: "Create Tasks",
    export: "Export",
    exportPlanned: "Export is planned for next phase.",
    emptyState: "Select agencies and click Generate to create meeting prep",
    selectAgencyBeforeGenerate: "Please select at least one agency to generate meeting prep.",
    generatedNarratives: (count) => `Generated ${count} meeting prep narrative(s).`,
    narrativeGenerationFailed: "Narrative generation failed.",
    generateBeforeSave: "Generate content before saving notes.",
    savedNotes: (count) => `Saved notes for ${count} agency(ies).`,
    saveNotesFailed: "Failed to save notes.",
    selectAgencyFirst: "Select at least one agency first.",
    createdTasks: (count) => `Created ${count} task(s).`,
    taskCreationFailed: "Task creation failed.",
    sectionTitle: (agencyName) => `MEETING PREPARATION: ${agencyName}`,
  },
  settings: {
    title: "Settings",
    subtitle: "Manage your preferences and configuration",
    workPreferences: "Work Preferences",
    language: "Language",
    defaultStartLocation: "Default Start Location",
    office: "Office",
    home: "Home",
    manualEntry: "Manual Entry",
    startLocationHint: "Starting point for route optimization",
    workingHours: "Working Hours",
    startTime: "Start Time",
    endTime: "End Time",
    routePreferences: "Route Preferences",
    maxVisitsPerDay: "Maximum Visits per Day",
    maxVisitsHint: "Recommended maximum number of agency visits in a single day",
    maxTravelHours: "Maximum Travel Time (hours)",
    maxTravelHint: "Maximum total travel time per day",
    avgVisitMinutes: "Average Visit Duration (minutes)",
    aiAssistantSettings: "AI Assistant Settings",
    includeBenchmarks: "Always Include Benchmarks",
    includeBenchmarksHint: "Include portfolio benchmarks in AI-generated narratives",
    autoGenerateNotes: "Auto-generate Meeting Notes",
    autoGenerateNotesHint: "Automatically create notes template when adding agency to plan",
    priorityNotifications: "Priority Notifications",
    priorityNotificationsHint: "Receive alerts for high-priority agencies and renewal risks",
    defaultTone: "Default Narrative Tone",
    toneFriendly: "Friendly",
    toneConsultative: "Consultative",
    toneAssertive: "Assertive",
    notifications: "Notifications",
    visitReminders: "Visit Reminders",
    visitRemindersHint: "Receive reminders for upcoming visits",
    taskDueAlerts: "Task Due Date Alerts",
    taskDueAlertsHint: "Get notified about approaching task deadlines",
    performanceAlerts: "Performance Alerts",
    performanceAlertsHint: "Notifications for significant KPI changes",
    account: "Account",
    fullName: "Full Name",
    email: "Email",
    role: "Role",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    settingsSaved: "Settings saved.",
    changesReverted: "Changes reverted.",
  },
  assistant: {
    title: "AI Assistant",
    welcome:
      "Hello! I'm your AI Portfolio Assistant. Ask me for meeting prep, daily route optimization, or portfolio risk summaries.",
    working: "Working on it...",
    askPlaceholder: "Ask me anything...",
    footer: "AI responses are generated based on your portfolio data",
    requestFailed: "Assistant request failed.",
    requestFailedDetail: "I could not complete that request.",
    noDirectMatch:
      "No direct agency match found. Try asking for a specific agency code (e.g., AG001), meeting prep, or route optimization.",
    topAgencyMatches: "Top agency matches:",
    followUpHint: "Ask for meeting prep or route planning to continue.",
    meetingSectionTitle: (agencyName, agencyId) => `Meeting Prep: ${agencyName} (${agencyId})`,
  },
};

const TR_COPY: I18nCopy = {
  locale: "tr-TR",
  layout: {
    appTitle: "Acente Portfoy",
    appSubtitle: "Asistani",
    dashboard: "Gosterge Paneli",
    agencies: "Acenteler",
    dailyPlan: "Gunluk Plan",
    mapClusters: "Harita ve Kumeler",
    meetingPrep: "Toplanti Hazirligi",
    tasks: "Gorev ve Takipler",
    settings: "Ayarlar",
    unknownUser: "Bilinmeyen Kullanici",
    anonymousRole: "anonim",
    signOut: "Cikis Yap",
  },
  login: {
    title: "Acente Portfoy Asistani",
    description: "Sigorta acente portfoyunuzu yonetmek icin giris yapin",
    email: "E-posta",
    password: "Sifre",
    role: "Rol",
    salesperson: "Satis Temsilcisi",
    manager: "Yonetici",
    portfolioFilter: "Portfoy Filtresi",
    portfolioOwner: "John Smith (Satis Sorumlusu)",
    portfolioRegion: "New York Bolgesi",
    portfolioAll: "Tum Portfoyler",
    language: "Dil",
    english: "English",
    turkish: "Turkce",
    signIn: "Giris Yap",
    signingIn: "Giris Yapiliyor...",
    defaultsPrefix: "Varsayilan",
    signInSuccess: "Giris basariyla tamamlandi.",
  },
  dashboard: {
    title: "Gosterge Paneli",
    welcome: (name) => `Tekrar hos geldiniz, ${name}. Portfoy ozetiniz hazir.`,
    userFallback: "Kullanici",
    todaysPlan: "Bugunun Plani",
    visitsPlanned: "Planlanan Ziyaret",
    estimatedTravelTime: "Tahmini Yolculuk",
    firstVisit: "Ilk Ziyaret",
    viewDayPlan: "Gunluk Plani Ac",
    nextVisit: "Siradaki Ziyaret",
    priorityTier: (tier) => `Oncelik ${tier}`,
    renewalRisk: "Yenileme Riski",
    highClaims: "Yuksek Hasar",
    nextRecommendedVisit: "Sonraki Onerilen Ziyaret",
    generateMeetingPrep: "Toplanti Hazirligi Olustur",
    portfolioKpis: "Portfoy KPI",
    totalPremiums: "Toplam Prim",
    totalRevenue: "Toplam Gelir",
    avgClaimsRatio: "Ort. Hasar Orani",
    avgRenewalRate: "Ort. Yenileme Orani",
    avgHealthScore: "Ort. Saglik Skoru",
    benchmark: "Karsilastirma",
    aboveTarget: "Hedefin ustunde",
    priorityFeed: "Oncelik Akisi (AI Sirali)",
    viewAllAgencies: "Tum Acenteleri Gor",
    concentrationRisk: "Konsantrasyon Riski",
    growthBadge: (branch, growth) => `Buyume: ${branch} (+${growth}%)`,
    healthScore: "Saglik Skoru",
    renewalRate: "Yenileme Orani",
    claimsRatio: "Hasar Orani",
    open: "Ac",
    addToPlan: "Plana Ekle",
    agencyAlreadyInPlan: "Acente bugunku planda zaten var.",
    addedAgencyToPlan: (agencyId) => `${agencyId} bugunku plana eklendi.`,
  },
  dailyPlan: {
    removeSelected: "Secileni Kaldir",
    removeVisit: "Plandan Kaldir",
    removed: (agencyName) => `${agencyName} bugun planindan kaldirildi.`,
    removeFailed: "Ziyaret plandan kaldirilamadi.",
    agencyAlreadyInPlan: "Acente bugunku planda zaten var.",
    addedAgencyToPlan: (agencyId) => `${agencyId} bugunku plana eklendi.`,
    routeOptimizationFailed: "Rota optimizasyonu basarisiz.",
    routeOptimized: (km, minutes) => `Rota optimize edildi (${km.toFixed(1)} km / ${minutes} dk).`,
    meetingPrepGenerated: (agencyId) => `${agencyId} icin toplanti hazirligi olusturuldu.`,
    meetingPrepGenerationFailed: "Toplanti hazirligi olusturma basarisiz.",
    outcomeSaved: (agencyId) => `${agencyId} icin sonuc kaydedildi.`,
    outcomeSaveFailed: "Toplanti sonucu kaydedilemedi.",
    generating: "Olusturuluyor...",
    generatePrep: "Hazirlik Olustur",
    risk: "Risk",
    candidatePool: "Aday Havuzu",
    searchAgencies: "Acente ara...",
    allAgencies: "Tum Acenteler",
    dueThisWeek: "Bu Hafta Ziyaret",
    renewalRisk: "Yenileme Riski",
    highGrowth: "Yuksek Buyume",
    addToPlan: "Plana Ekle",
    todaysPlan: "Bugunun Plani",
    visitsPlanned: (count) => `${count} ziyaret planlandi`,
    autosave: "Otomatik kayit",
    optimizing: "Optimize ediliyor...",
    optimizeRoute: "Rotayi Optimize Et",
    noVisitsPlanned: "Henuz planli ziyaret yok. Aday havuzundan acente ekleyin.",
    visitDetails: "Ziyaret Detaylari",
    meetingObjective: "Toplanti Hedefi",
    objectiveRenewal: "Yenileme Gorusmesi",
    objectiveClaims: "Hasar Incelemesi",
    objectiveCrossSell: "Capraz Satis Firsati",
    objectiveRelationship: "Iliski Gelistirme",
    timeWindow: "Zaman Araligi",
    meetingPrep: "Toplanti Hazirligi",
    notes: "Notlar",
    notesPlaceholder: "Bu ziyaret icin not ekleyin...",
    generateMeetingPrep: "Toplanti Hazirligi Olustur",
    checklist: "Kontrol Listesi",
    checklistReviewKpis: "Acente KPI'larini gozden gecir",
    checklistPrepareTalkingPoints: "Konusma maddelerini hazirla",
    checklistReviewLastNotes: "Son toplanti notlarini incele",
    afterVisit: "Ziyaret Sonrasi",
    outcome: "Sonuc",
    selectOutcome: "Sonuc secin...",
    outcomeNotSet: "Belirtilmedi",
    outcomeSuccess: "Basarili",
    outcomeNeutral: "Notr",
    outcomeRisk: "Risk",
    selectVisitHint: "Detaylari gormek icin bir ziyaret secin",
    goalRenewal: "Yenileme",
    goalClaims: "Hasar",
    goalCrossSell: "Capraz Satis",
    goalRelationship: "Iliski",
  },
  meetingPrep: {
    selectAgencies: "Acente Sec",
    selectedCount: (count) => `${count} secildi`,
    risk: "Risk",
    generationSettings: "Uretim Ayarlari",
    template: "Sablon",
    templateStandard: "Standart Degerlendirme",
    templateRenewal: "Yenileme Iyilestirme Plani",
    templateClaims: "Hasar Orani Gorusmesi",
    templateGrowth: "Buyume Oyunu",
    templateConcentration: "Konsantrasyon Risk Azaltma",
    templateRelationship: "Iliski Surdurme",
    tone: "Ton",
    toneFriendly: "Samimi",
    toneConsultative: "Danisman",
    toneAssertive: "Net",
    length: "Uzunluk",
    lengthShort: "Kisa (5 dk)",
    lengthMedium: "Orta (15 dk)",
    lengthLong: "Uzun (30 dk)",
    options: "Secenekler",
    includeBenchmarks: "Karsilastirmalari Dahil Et",
    generate: "Olustur",
    generating: "Olusturuluyor...",
    regenerateWithConstraints: "Kosullarla Yeniden Olustur",
    generatedOutput: "Uretilen Cikti",
    saving: "Kaydediliyor...",
    saveToNotes: "Notlara Kaydet",
    creating: "Olusturuluyor...",
    createTasks: "Gorev Olustur",
    export: "Disa Aktar",
    exportPlanned: "Disa aktarma sonraki fazda planlandi.",
    emptyState: "Toplanti hazirligi olusturmak icin acente secip Olustur'a basin",
    selectAgencyBeforeGenerate: "Toplanti hazirligi icin en az bir acente secin.",
    generatedNarratives: (count) => `${count} toplanti hazirligi olusturuldu.`,
    narrativeGenerationFailed: "Icerik olusturma basarisiz.",
    generateBeforeSave: "Notlari kaydetmeden once icerik olusturun.",
    savedNotes: (count) => `${count} acente icin not kaydedildi.`,
    saveNotesFailed: "Not kaydetme basarisiz.",
    selectAgencyFirst: "Once en az bir acente secin.",
    createdTasks: (count) => `${count} gorev olusturuldu.`,
    taskCreationFailed: "Gorev olusturma basarisiz.",
    sectionTitle: (agencyName) => `TOPLANTI HAZIRLIGI: ${agencyName}`,
  },
  settings: {
    title: "Ayarlar",
    subtitle: "Tercih ve konfigrasyonlarinizi yonetin",
    workPreferences: "Calisma Tercihleri",
    language: "Dil",
    defaultStartLocation: "Varsayilan Baslangic Konumu",
    office: "Ofis",
    home: "Ev",
    manualEntry: "Manuel Giris",
    startLocationHint: "Rota optimizasyonu icin baslangic noktasi",
    workingHours: "Calisma Saatleri",
    startTime: "Baslangic",
    endTime: "Bitis",
    routePreferences: "Rota Tercihleri",
    maxVisitsPerDay: "Gunluk Maksimum Ziyaret",
    maxVisitsHint: "Tek bir gunde onerilen maksimum acente ziyareti",
    maxTravelHours: "Maksimum Yolculuk Suresi (saat)",
    maxTravelHint: "Gunluk toplam yolculuk suresi limiti",
    avgVisitMinutes: "Ortalama Ziyaret Suresi (dakika)",
    aiAssistantSettings: "AI Asistan Ayarlari",
    includeBenchmarks: "Karsilastirma Verilerini Her Zaman Dahil Et",
    includeBenchmarksHint: "AI tarafindan olusturulan metinlere portfoy karsilastirmalari eklenir",
    autoGenerateNotes: "Toplanti Notlarini Otomatik Olustur",
    autoGenerateNotesHint: "Plana acente eklenince otomatik not sablonu olustur",
    priorityNotifications: "Oncelik Bildirimleri",
    priorityNotificationsHint: "Yuksek oncelik ve yenileme riski alarmlarini al",
    defaultTone: "Varsayilan Anlati Tonu",
    toneFriendly: "Samimi",
    toneConsultative: "Danisman",
    toneAssertive: "Net",
    notifications: "Bildirimler",
    visitReminders: "Ziyaret Hatirlaticilari",
    visitRemindersHint: "Yaklasan ziyaretler icin hatirlatma al",
    taskDueAlerts: "Gorev Termin Uyarilari",
    taskDueAlertsHint: "Yaklasan gorev terminleri icin bildirim al",
    performanceAlerts: "Performans Uyarilari",
    performanceAlertsHint: "Onemli KPI degisimlerinde bildirim al",
    account: "Hesap",
    fullName: "Ad Soyad",
    email: "E-posta",
    role: "Rol",
    cancel: "Iptal",
    saveChanges: "Degisiklikleri Kaydet",
    settingsSaved: "Ayarlar kaydedildi.",
    changesReverted: "Degisiklikler geri alindi.",
  },
  assistant: {
    title: "AI Asistan",
    welcome:
      "Merhaba! Ben AI Portfoy Asistaninizim. Toplanti hazirligi, gunluk rota optimizasyonu veya portfoy risk ozetleri isteyebilirsiniz.",
    working: "Calisiyorum...",
    askPlaceholder: "Bana bir sey sorun...",
    footer: "AI yanitlari portfoy verilerinize gore olusturulur",
    requestFailed: "Asistan istegi basarisiz.",
    requestFailedDetail: "Bu istegi tamamlayamadim.",
    noDirectMatch:
      "Dogrudan acente eslesmesi bulunamadi. Belirli bir kod (ornek: AG001), toplanti hazirligi veya rota optimizasyonu isteyin.",
    topAgencyMatches: "En uygun acente eslesmeleri:",
    followUpHint: "Devam etmek icin toplanti hazirligi veya rota planlama isteyin.",
    meetingSectionTitle: (agencyName, agencyId) => `Toplanti Hazirligi: ${agencyName} (${agencyId})`,
  },
};

export function getI18nCopy(language: AppLanguage): I18nCopy {
  return language === "tr" ? TR_COPY : EN_COPY;
}
