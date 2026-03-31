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
    notScheduled: string;
    noVisitsPlanned: string;
    addVisitsInDailyPlan: string;
    noNextVisit: string;
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
    flowTitle: string;
    preMeetingBriefPanel: string;
    postMeetingReviewPanel: string;
    outcomeTrackingPanel: string;
    keyPoints: string;
    recommendationList: string;
    recommendationRationale: string;
    expectedKpi: string;
    expectedImpactWindow: string;
    recommendationConfidence: string;
    recommendationDecision: string;
    decisionProposed: string;
    decisionAccepted: string;
    decisionModified: string;
    decisionRejected: string;
    plannedRecommendation: string;
    meetingReportEvidence: string;
    consistencyFlag: string;
    consistencyMatch: string;
    consistencyMismatch: string;
    aiCritiqueSuggestion: string;
    effectivenessLabel: string;
    effectivenessEffective: string;
    effectivenessIneffective: string;
    effectivenessInconclusive: string;
    baselineKpi: string;
    kpiDeltaTPlus7: string;
    kpiDeltaTPlus30: string;
    validationFlags: string;
    validationReasonDataIssue: string;
    validationReasonContextMismatch: string;
    validationReasonExecutionFailure: string;
    selectMeeting: string;
    flowEmptyState: string;
    noBriefAvailable: string;
    noRecommendations: string;
    decisionReason: string;
    editedRecommendation: string;
    saveDecision: string;
    reportSummary: string;
    commitments: string;
    deviations: string;
    consistencyUnknown: string;
    saveReport: string;
    saveOutcome: string;
    assessedAt: string;
    linkedReport: string;
    noReportLinked: string;
    addValidationFlag: string;
    validationNotes: string;
    addFlag: string;
    noValidationFlags: string;
  };
  agencyProfile: {
    notFoundTitle: string;
    backToAgencies: string;
    tierLabel: (tier: string) => string;
    renewalRisk: string;
    addToPlan: string;
    generatePrep: string;
    tabOverview: string;
    tabDiagnostics: string;
    tabMeetingPrep: string;
    tabNotesTasks: string;
    premiumsWritten: string;
    totalRevenue: string;
    renewalRate: string;
    claimsRatio: string;
    compareWith: string;
    averageLabel: (value: string) => string;
    concentration: string;
    healthScore: string;
    benchmarkComparison: string;
    whyAgencyMattersToday: string;
    renewalRiskAlert: (renewalRate: number, delta: number) => string;
    claimsRatioElevated: (claimsRatioPct: number, deltaPct: number) => string;
    growthOpportunity: (branch: string, growth: number) => string;
    concentrationRiskText: (concentrationPct: number) => string;
    visitPlanning: string;
    lastVisit: string;
    nextRecommendedVisit: string;
    targetFrequency: string;
    preferredTime: string;
    branchYoyGrowth: string;
    branchGrowthPercent: string;
    aiPerformanceAnalysis: string;
    keyDrivers: string;
    risks: string;
    opportunities: string;
    keyDriverRenewal: (renewalRate: number, benchmarkRate: number) => string;
    keyDriverClaims: (claimsRatioPct: number, benchmarkPct: number) => string;
    keyDriverConcentration: (concentrationPct: number) => string;
    keyDriverBestBranch: (branch: string, growth: number) => string;
    riskRenewal: string;
    riskClaims: string;
    riskConcentration: string;
    opportunityLeverage: (branch: string) => string;
    opportunityImprove: (branch: string) => string;
    opportunityPremiums: (premiumsMillion: string) => string;
    meetingNarrativeBuilder: string;
    prepareMeetingNotes: string;
    preparingMeetingNotes: string;
    meetingNotesPrepared: string;
    meetingNotesPreparationFailed: string;
    generateNarrative: string;
    generateTalkTracks: string;
    generateAgenda: string;
    talkTracksAppendix: string;
    agendaAppendix: string;
    narrativePlaceholder: string;
    saveToNotes: string;
    createTasksFromOutput: string;
    exportAsPdf: string;
    exportPlanned: string;
    notesTasksTitle: string;
    notesTasksDescription: string;
    narrativeGenerateBeforeSave: string;
    narrativeSaved: string;
    narrativeSaveFailed: string;
    narrativeGenerateBeforeTasks: string;
    taskCreatedFromNarrative: string;
    taskCreateFailed: string;
    agencyAlreadyInPlan: string;
    addedAgencyToPlan: (agencyId: string) => string;
    frequencyLabel: (value: "weekly" | "monthly" | "quarterly") => string;
    timeWindowLabel: (value: "morning" | "afternoon" | "any") => string;
    branchLabel: (value: "motor" | "home" | "health") => string;
    narrativeText: (payload: {
      agencyName: string;
      healthScore: number;
      avgHealthScore: number;
      renewalRate: number;
      avgRenewalRate: number;
      claimsRatioPct: number;
      avgClaimsRatioPct: number;
      premiumsMillion: string;
      concentrationPct: number;
      renewalRisk: boolean;
      bestBranchLabel: string;
      bestBranchGrowth: number;
      worstBranchLabel: string;
    }) => string;
    taskTitle: string;
    taskDescription: string;
  };
  mapClusters: {
    title: string;
    subtitle: string;
    routeSummary: string;
    agenciesTotal: string;
    plannedVisits: string;
    visitedVisits: string;
    pendingVisits: string;
    routeRevision: string;
    routeUpdatedAt: string;
    routeNotCalculated: string;
    routeLastReason: string;
    reasonManual: string;
    reasonVisitCompleted: string;
    algorithmSettings: string;
    numberOfClusters: string;
    weightByPriority: string;
    createClusters: string;
    recalculateRoute: string;
    recalculating: string;
    clusterResults: string;
    noClusters: string;
    agenciesInCluster: string;
    totalValue: string;
    addClusterToPlan: string;
    clusterTitle: (clusterId: number) => string;
    clusterAgencyCount: (count: number) => string;
    mapLegend: string;
    legendPlanned: string;
    legendUnplanned: string;
    legendVisited: string;
    legendClusterCenter: string;
    selectedAgency: string;
    clickAgencyHint: string;
    agencyDetails: string;
    location: string;
    healthScore: string;
    renewalRisk: string;
    yes: string;
    no: string;
    routeStatus: string;
    routeStatusPlanned: string;
    routeStatusVisited: string;
    routeStatusNotPlanned: string;
    markVisited: string;
    alreadyVisited: string;
    addToPlan: string;
    plannedRoute: string;
    noPlannedVisits: string;
    stop: string;
    markVisitFailed: string;
    visitAlreadyMarked: string;
    visitMarked: (agencyName: string) => string;
    routeRecalcTriggered: string;
    routeRecalcComplete: string;
    routeRecalcBlocked: string;
    agenciesAlreadyInPlan: string;
    agenciesAddedToPlan: (count: number) => string;
  };
  tasksFollowUps: {
    title: string;
    subtitle: (count: number, syncing: boolean) => string;
    aiSuggestions: string;
    aiSuggestionsPlanned: string;
    statusPlaceholder: string;
    statusAll: string;
    statusPending: string;
    statusInProgress: string;
    statusCompleted: string;
    priorityPlaceholder: string;
    priorityAll: string;
    tableTask: string;
    tableAgency: string;
    tableDueDate: string;
    tablePriority: string;
    tableStatus: string;
    tableActions: string;
    overdueBadge: string;
    taskSummaryTitle: string;
    byPriorityTitle: string;
    aiInsightsTitle: string;
    pendingLabel: string;
    inProgressLabel: string;
    completedLabel: string;
    highPriorityLabel: string;
    mediumPriorityLabel: string;
    lowPriorityLabel: string;
    aiAssistantTitle: string;
    aiAssistantDescription: string;
    suggestTopFollowUps: string;
    summarizeOutstandingRisks: string;
    suggestionFlowPlanned: string;
    riskSummaryFlowPlanned: string;
    recommendationFlowPlanned: string;
    getRecommendations: string;
    aiInsightSummary: (highPriorityCount: number) => string;
    dateLocale: string;
    statusLabel: (status: "pending" | "in-progress" | "completed") => string;
    priorityLabel: (priority: "high" | "medium" | "low") => string;
    loadFailed: string;
    createTask: string;
    creatingTask: string;
    createTaskDialogTitle: string;
    editTaskDialogTitle: string;
    createTaskDialogDescription: string;
    editTaskDialogDescription: string;
    fieldAgency: string;
    fieldTitle: string;
    fieldDueDate: string;
    fieldPriority: string;
    priorityHigh: string;
    priorityMedium: string;
    priorityLow: string;
    cancel: string;
    saveTask: string;
    updateTask: string;
    deleteTask: string;
    editTask: string;
    completeTask: string;
    taskCreated: string;
    taskUpdated: string;
    taskDeleted: string;
    taskCompleted: string;
    taskCreateFailed: string;
    titleRequired: string;
    dueDateRequired: string;
    agencyRequired: string;
    userCreatedTag: string;
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
    restartConversation: string;
    welcome: string;
    working: string;
    askPlaceholder: string;
    footer: string;
    openAssistant: string;
    contextLabel: string;
    noContext: string;
    traceLabel: string;
    details: string;
    hideDetails: string;
    requestFailed: string;
    requestFailedDetail: string;
    pendingActionTitle: string;
    pendingActionDescription: string;
    confirmAction: string;
    cancelAction: string;
    actionCancelled: string;
    actionPreviewDailyPlan: string;
    actionPreviewMeetingPrep: (agencyId: string) => string;
    noDirectMatch: string;
    topAgencyMatches: string;
    followUpHint: string;
    openTaskHint: (count: number) => string;
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
    mapClusters: "Visit Planning",
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
    notScheduled: "Not scheduled",
    noVisitsPlanned: "No visits planned yet.",
    addVisitsInDailyPlan: "Add agencies in Daily Plan to build today's route.",
    noNextVisit: "Add a second visit in Daily Plan.",
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
    selectAgencies: "Select Agency",
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
    emptyState: "Select one agency and click Generate to create meeting prep.",
    selectAgencyBeforeGenerate: "Please select an agency to generate meeting prep.",
    generatedNarratives: (count) =>
      count === 1 ? "Generated meeting prep narrative." : `Generated ${count} meeting prep narrative(s).`,
    narrativeGenerationFailed: "Narrative generation failed.",
    generateBeforeSave: "Generate content before saving notes.",
    savedNotes: (count) =>
      count === 1 ? "Saved notes for the selected agency." : `Saved notes for ${count} agencies.`,
    saveNotesFailed: "Failed to save notes.",
    selectAgencyFirst: "Select an agency first.",
    createdTasks: (count) => (count === 1 ? "Created 1 task." : `Created ${count} tasks.`),
    taskCreationFailed: "Task creation failed.",
    sectionTitle: (agencyName) => `MEETING PREPARATION: ${agencyName}`,
    flowTitle: "Meeting Assistance Flow",
    preMeetingBriefPanel: "Pre-Meeting Brief",
    postMeetingReviewPanel: "Post-Meeting Review",
    outcomeTrackingPanel: "Outcome Tracking",
    keyPoints: "Key Points",
    recommendationList: "Recommendations",
    recommendationRationale: "Rationale",
    expectedKpi: "Expected KPI",
    expectedImpactWindow: "Expected Impact Window",
    recommendationConfidence: "Confidence",
    recommendationDecision: "Decision",
    decisionProposed: "Proposed",
    decisionAccepted: "Accepted",
    decisionModified: "Modified",
    decisionRejected: "Rejected",
    plannedRecommendation: "Planned Recommendation",
    meetingReportEvidence: "Meeting Report Evidence",
    consistencyFlag: "Consistency Flag",
    consistencyMatch: "Match",
    consistencyMismatch: "Mismatch",
    aiCritiqueSuggestion: "AI Critique / Suggestion",
    effectivenessLabel: "Effectiveness",
    effectivenessEffective: "Effective",
    effectivenessIneffective: "Ineffective",
    effectivenessInconclusive: "Inconclusive",
    baselineKpi: "Baseline KPI",
    kpiDeltaTPlus7: "KPI Delta (T+7)",
    kpiDeltaTPlus30: "KPI Delta (T+30)",
    validationFlags: "Validation Flags",
    validationReasonDataIssue: "Data Issue",
    validationReasonContextMismatch: "Context Mismatch",
    validationReasonExecutionFailure: "Execution Failure",
    selectMeeting: "Select Meeting",
    flowEmptyState: "No meeting flow data available for this selection.",
    noBriefAvailable: "No pre-meeting brief key points available yet.",
    noRecommendations: "No recommendations available for this meeting.",
    decisionReason: "Decision Reason",
    editedRecommendation: "Edited Recommendation",
    saveDecision: "Save Decision",
    reportSummary: "Discussion Summary",
    commitments: "Commitments",
    deviations: "Deviations",
    consistencyUnknown: "Unknown",
    saveReport: "Save Report",
    saveOutcome: "Save Outcome",
    assessedAt: "Assessed At",
    linkedReport: "Linked Report",
    noReportLinked: "No linked report",
    addValidationFlag: "Validation Reason",
    validationNotes: "Validation Notes",
    addFlag: "Add Flag",
    noValidationFlags: "No validation flags yet.",
  },
  agencyProfile: {
    notFoundTitle: "Agency not found",
    backToAgencies: "Back to Agencies",
    tierLabel: (tier) => `Tier ${tier}`,
    renewalRisk: "Renewal Risk",
    addToPlan: "Add to Plan",
    generatePrep: "Generate Prep",
    tabOverview: "Overview",
    tabDiagnostics: "Diagnostics",
    tabMeetingPrep: "Meeting Prep",
    tabNotesTasks: "Notes & Tasks",
    premiumsWritten: "Premiums Written",
    totalRevenue: "Total Revenue",
    renewalRate: "Renewal Rate",
    claimsRatio: "Claims Ratio",
    compareWith: "vs",
    averageLabel: (value) => `Avg: ${value}`,
    concentration: "Concentration",
    healthScore: "Health Score",
    benchmarkComparison: "Benchmark Comparison",
    whyAgencyMattersToday: "Why This Agency Matters Today",
    renewalRiskAlert: (renewalRate, delta) =>
      `Renewal rate at ${renewalRate}% is ${delta.toFixed(1)} points below portfolio average. Immediate attention recommended.`,
    claimsRatioElevated: (claimsRatioPct, deltaPct) =>
      `At ${claimsRatioPct.toFixed(0)}%, claims are ${deltaPct.toFixed(0)} points above benchmark.`,
    growthOpportunity: (branch, growth) =>
      `${branch} branch showing strong growth at +${growth}% YoY.`,
    concentrationRiskText: (concentrationPct) =>
      `Portfolio concentration at ${concentrationPct.toFixed(0)}% suggests diversification opportunity.`,
    visitPlanning: "Visit Planning",
    lastVisit: "Last Visit",
    nextRecommendedVisit: "Next Recommended Visit",
    targetFrequency: "Target Frequency",
    preferredTime: "Preferred Time",
    branchYoyGrowth: "Branch YoY Growth",
    branchGrowthPercent: "Growth %",
    aiPerformanceAnalysis: "AI Performance Analysis",
    keyDrivers: "Key Drivers",
    risks: "Risks",
    opportunities: "Opportunities",
    keyDriverRenewal: (renewalRate, benchmarkRate) =>
      `Renewal rate: ${renewalRate}% (vs ${benchmarkRate}% benchmark)`,
    keyDriverClaims: (claimsRatioPct, benchmarkPct) =>
      `Claims ratio: ${claimsRatioPct.toFixed(0)}% (vs ${benchmarkPct.toFixed(0)}% benchmark)`,
    keyDriverConcentration: (concentrationPct) =>
      `Portfolio concentration: ${concentrationPct.toFixed(0)}%`,
    keyDriverBestBranch: (branch, growth) =>
      `Best performing branch: ${branch} (+${growth}%)`,
    riskRenewal: "Renewal risk flag active - customer retention needs focus",
    riskClaims: "Claims ratio above benchmark - review underwriting quality",
    riskConcentration: "High concentration risk - consider diversification strategy",
    opportunityLeverage: (branch) =>
      `Leverage ${branch} branch success for cross-sell opportunities`,
    opportunityImprove: (branch) =>
      `Improve ${branch} branch performance through targeted training`,
    opportunityPremiums: (premiumsMillion) =>
      `Total premiums at $${premiumsMillion}M - potential for expansion`,
    meetingNarrativeBuilder: "Meeting Narrative Builder",
    prepareMeetingNotes: "Prepare Meeting Notes",
    preparingMeetingNotes: "Preparing Notes...",
    meetingNotesPrepared: "Meeting notes prepared.",
    meetingNotesPreparationFailed: "Meeting notes preparation failed.",
    generateNarrative: "Generate Narrative",
    generateTalkTracks: "Generate 3 Talk Tracks",
    generateAgenda: "Generate Agenda (30-min)",
    talkTracksAppendix:
      "\n\nTALK TRACKS:\n1) Renewal retention\n2) Claims handling\n3) Growth cross-sell",
    agendaAppendix:
      "\n\nAGENDA (30 MIN):\n- 5m opening\n- 10m performance review\n- 10m risks/opportunities\n- 5m commitments",
    narrativePlaceholder: "Generated narrative will appear here...",
    saveToNotes: "Save to Notes",
    createTasksFromOutput: "Create Tasks from Output",
    exportAsPdf: "Export as PDF",
    exportPlanned: "Export is planned for next phase.",
    notesTasksTitle: "Notes & Tasks",
    notesTasksDescription:
      "Notes and tasks functionality will be available here. You can log meeting notes, track follow-ups, and create action items from AI-generated content.",
    narrativeGenerateBeforeSave: "Generate narrative content before saving.",
    narrativeSaved: "Narrative saved to notes.",
    narrativeSaveFailed: "Failed to save narrative.",
    narrativeGenerateBeforeTasks: "Generate narrative content before creating tasks.",
    taskCreatedFromNarrative: "Created task from narrative.",
    taskCreateFailed: "Failed to create task.",
    agencyAlreadyInPlan: "Agency is already in today's plan.",
    addedAgencyToPlan: (agencyId) => `Added ${agencyId} to today's plan.`,
    frequencyLabel: (value) => {
      const labels: Record<"weekly" | "monthly" | "quarterly", string> = {
        weekly: "Weekly",
        monthly: "Monthly",
        quarterly: "Quarterly",
      };
      return labels[value];
    },
    timeWindowLabel: (value) => {
      const labels: Record<"morning" | "afternoon" | "any", string> = {
        morning: "Morning",
        afternoon: "Afternoon",
        any: "Any",
      };
      return labels[value];
    },
    branchLabel: (value) => {
      const labels: Record<"motor" | "home" | "health", string> = {
        motor: "Motor",
        home: "Home",
        health: "Health",
      };
      return labels[value];
    },
    narrativeText: ({
      agencyName,
      healthScore,
      avgHealthScore,
      renewalRate,
      avgRenewalRate,
      claimsRatioPct,
      avgClaimsRatioPct,
      premiumsMillion,
      concentrationPct,
      renewalRisk,
      bestBranchLabel,
      bestBranchGrowth,
      worstBranchLabel,
    }) => `MEETING PREPARATION - ${agencyName}

OPENING CONTEXT:
Thank you for making time today. I wanted to review our partnership performance and discuss how we can strengthen our collaboration going forward.

PERFORMANCE RECAP:
• Overall Health Score: ${healthScore}/100 (Portfolio avg: ${avgHealthScore.toFixed(0)})
• Renewal Rate: ${renewalRate}% vs portfolio average of ${avgRenewalRate}%
  ${renewalRate < avgRenewalRate ? "⚠️ Below benchmark by " + (avgRenewalRate - renewalRate).toFixed(1) + " points" : "✓ Above benchmark"}
• Claims Ratio: ${claimsRatioPct.toFixed(0)}% vs portfolio average of ${avgClaimsRatioPct.toFixed(0)}%
  ${claimsRatioPct > avgClaimsRatioPct ? "⚠️ Higher than benchmark" : "✓ Better than benchmark"}
• Total Premiums: $${premiumsMillion}M
• Portfolio Concentration: ${concentrationPct.toFixed(0)}%

RISKS TO ADDRESS:
${renewalRisk ? "• ⚠️ RENEWAL RISK FLAG - Priority attention needed on customer retention\n" : ""}${claimsRatioPct > avgClaimsRatioPct ? "• Claims ratio above portfolio average - review claims management processes\n" : ""}${concentrationPct > 40 ? "• High portfolio concentration (>40%) - diversification opportunity\n" : ""}

OPPORTUNITIES:
• Best performing branch: ${bestBranchLabel.toUpperCase()} (+${bestBranchGrowth}% YoY)
${healthScore > 80 ? "• Strong overall health score - leverage for expansion\n" : ""}• Cross-sell potential between motor, home, and health products

QUESTIONS TO ASK:
1. What factors are driving your ${bestBranchLabel} branch success? Can we replicate this in other areas?
2. ${renewalRisk ? "I've noticed renewal rates trending down. What challenges are you facing with customer retention?" : "How can we support your excellent renewal performance?"}
3. Are there specific customer segments where you see the most growth potential?
4. What support or resources from us would make the biggest difference for your business?
5. How are you managing claims communication with customers?

PROPOSED COMMITMENTS:
• Schedule monthly performance reviews
• Provide enhanced training on ${worstBranchLabel} products
• Explore co-marketing opportunities for high-performing segments
• Set quarterly growth targets together
• Establish direct escalation channel for claims support

NEXT STEPS:
□ Review detailed claims data together
□ Schedule product training session
□ Create joint growth plan for next quarter
□ Follow up on specific customer concerns raised
□ Book next meeting before leaving`,
    taskTitle: "Follow up on agency profile narrative",
    taskDescription: "Convert generated narrative commitments into explicit action items.",
  },
  mapClusters: {
    title: "Visit Planning",
    subtitle: "Plan visits, optimize routes, and track field execution.",
    routeSummary: "Route Summary",
    agenciesTotal: "Agencies",
    plannedVisits: "Planned",
    visitedVisits: "Visited",
    pendingVisits: "Pending",
    routeRevision: "Route revision",
    routeUpdatedAt: "Last recalculated",
    routeNotCalculated: "Not calculated yet",
    routeLastReason: "Last trigger",
    reasonManual: "Manual",
    reasonVisitCompleted: "Visit completed",
    algorithmSettings: "Cluster Settings",
    numberOfClusters: "Number of clusters",
    weightByPriority: "Weight by priority",
    createClusters: "Create Clusters",
    recalculateRoute: "Recalculate Route (Mock)",
    recalculating: "Recalculating...",
    clusterResults: "Cluster Results",
    noClusters: "Adjust settings and create clusters to group agencies.",
    agenciesInCluster: "Agencies in cluster",
    totalValue: "Total value",
    addClusterToPlan: "Add Cluster to Plan",
    clusterTitle: (clusterId) => `Cluster ${clusterId}`,
    clusterAgencyCount: (count) => `${count} agenc${count === 1 ? "y" : "ies"}`,
    mapLegend: "Legend",
    legendPlanned: "Planned stop",
    legendUnplanned: "Not in plan",
    legendVisited: "Visited stop",
    legendClusterCenter: "Cluster center",
    selectedAgency: "Selected Agency",
    clickAgencyHint: "Click any map pin to review details and actions.",
    agencyDetails: "Agency details",
    location: "Location",
    healthScore: "Health score",
    renewalRisk: "Renewal risk",
    yes: "Yes",
    no: "No",
    routeStatus: "Route status",
    routeStatusPlanned: "Planned",
    routeStatusVisited: "Visited",
    routeStatusNotPlanned: "Not in plan",
    markVisited: "Mark Visit as Visited",
    alreadyVisited: "Already visited",
    addToPlan: "Add to Today's Plan",
    plannedRoute: "Planned Route",
    noPlannedVisits: "No visits planned yet. Add agencies from the map or Daily Plan.",
    stop: "Stop",
    markVisitFailed: "Could not mark this visit as visited.",
    visitAlreadyMarked: "This visit was already marked as visited.",
    visitMarked: (agencyName) => `${agencyName} marked as visited.`,
    routeRecalcTriggered: "Route recalculation hook triggered.",
    routeRecalcComplete: "Route state updated (mock recalculation complete).",
    routeRecalcBlocked: "Add at least one planned visit before recalculating.",
    agenciesAlreadyInPlan: "Selected agencies are already in today's plan.",
    agenciesAddedToPlan: (count) =>
      `Added ${count} agenc${count === 1 ? "y" : "ies"} to today's plan.`,
  },
  tasksFollowUps: {
    title: "Tasks & Follow-ups",
    subtitle: (count, syncing) => `${count} tasks${syncing ? " (syncing...)" : ""}`,
    aiSuggestions: "AI Suggestions",
    aiSuggestionsPlanned: "AI suggestions are planned next phase.",
    statusPlaceholder: "Status",
    statusAll: "All Status",
    statusPending: "Pending",
    statusInProgress: "In Progress",
    statusCompleted: "Completed",
    priorityPlaceholder: "Priority",
    priorityAll: "All Priorities",
    tableTask: "Task",
    tableAgency: "Agency",
    tableDueDate: "Due Date",
    tablePriority: "Priority",
    tableStatus: "Status",
    tableActions: "Actions",
    overdueBadge: "Overdue",
    taskSummaryTitle: "Task Summary",
    byPriorityTitle: "By Priority",
    aiInsightsTitle: "AI Insights",
    pendingLabel: "Pending",
    inProgressLabel: "In Progress",
    completedLabel: "Completed",
    highPriorityLabel: "High Priority",
    mediumPriorityLabel: "Medium Priority",
    lowPriorityLabel: "Low Priority",
    aiAssistantTitle: "AI Assistant",
    aiAssistantDescription: "Get intelligent task recommendations",
    suggestTopFollowUps: "Suggest Top 10 Follow-ups",
    summarizeOutstandingRisks: "Summarize Outstanding Risks",
    suggestionFlowPlanned: "Suggestion flow is planned.",
    riskSummaryFlowPlanned: "Risk summary flow is planned.",
    recommendationFlowPlanned: "Recommendation flow is planned next phase.",
    getRecommendations: "Get Recommendations",
    aiInsightSummary: (highPriorityCount) =>
      `You have ${highPriorityCount} high-priority tasks related to agencies with renewal risk.`,
    dateLocale: "en-US",
    statusLabel: (status) => {
      const labels: Record<"pending" | "in-progress" | "completed", string> = {
        pending: "Pending",
        "in-progress": "In Progress",
        completed: "Completed",
      };
      return labels[status];
    },
    priorityLabel: (priority) => {
      const labels: Record<"high" | "medium" | "low", string> = {
        high: "High",
        medium: "Medium",
        low: "Low",
      };
      return labels[priority];
    },
    loadFailed: "Failed to load persisted tasks.",
    createTask: "Create Task",
    creatingTask: "Creating...",
    createTaskDialogTitle: "Create Task",
    editTaskDialogTitle: "Edit Task",
    createTaskDialogDescription: "Add a follow-up with agency, action title, due date, and priority.",
    editTaskDialogDescription: "Update task details or delete this user-created task.",
    fieldAgency: "Agency",
    fieldTitle: "Action / Title",
    fieldDueDate: "Due Date",
    fieldPriority: "Priority",
    priorityHigh: "High",
    priorityMedium: "Medium",
    priorityLow: "Low",
    cancel: "Cancel",
    saveTask: "Save Task",
    updateTask: "Save Changes",
    deleteTask: "Delete Task",
    editTask: "Edit",
    completeTask: "Complete",
    taskCreated: "Task created.",
    taskUpdated: "Task updated.",
    taskDeleted: "Task deleted.",
    taskCompleted: "Task marked as completed.",
    taskCreateFailed: "Task creation failed.",
    titleRequired: "Task title is required.",
    dueDateRequired: "Due date is required.",
    agencyRequired: "Agency selection is required.",
    userCreatedTag: "User",
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
    title: "Sapyo Assistant",
    restartConversation: "Restart",
    welcome:
      "Hello! I'm your AI Portfolio Assistant. Ask me for meeting prep, daily route optimization, or portfolio risk summaries.",
    working: "Working on it...",
    askPlaceholder: "Ask me anything...",
    footer: "AI responses are generated based on your portfolio data",
    openAssistant: "Open AI Assistant",
    contextLabel: "Context",
    noContext: "General workspace",
    traceLabel: "AI trace",
    details: "Details",
    hideDetails: "Hide",
    requestFailed: "Assistant request failed.",
    requestFailedDetail: "I could not complete that request.",
    pendingActionTitle: "Confirmation required",
    pendingActionDescription: "I can run this action. Please confirm before I execute it:",
    confirmAction: "Confirm",
    cancelAction: "Cancel",
    actionCancelled: "Action cancelled. Ask a new question whenever you are ready.",
    actionPreviewDailyPlan:
      "Run `generateDailyPlan` with your current user language and return a fresh plan draft.",
    actionPreviewMeetingPrep: (agencyId) =>
      `Run generateMeetingPrep for ${agencyId} and return the structured meeting narrative.`,
    noDirectMatch:
      "No direct agency match found. Try asking for a specific agency code (e.g., AG001), meeting prep, or route optimization.",
    topAgencyMatches: "Top agency matches:",
    followUpHint: "Ask for meeting prep or route planning to continue.",
    openTaskHint: (count) => `${count} open tasks`,
    meetingSectionTitle: (agencyName, agencyId) => `Meeting Prep: ${agencyName} (${agencyId})`,
  },
};

const TR_COPY: I18nCopy = {
  locale: "tr-TR",
  layout: {
    appTitle: "Acente Portföy",
    appSubtitle: "Asistanı",
    dashboard: "Gösterge Paneli",
    agencies: "Acenteler",
    dailyPlan: "Günlük Plan",
    mapClusters: "Ziyaret Planlama",
    meetingPrep: "Toplantı Hazırlığı",
    tasks: "Görev ve Takipler",
    settings: "Ayarlar",
    unknownUser: "Bilinmeyen Kullanıcı",
    anonymousRole: "anonim",
    signOut: "Çıkış Yap",
  },
  login: {
    title: "Acente Portföy Asistanı",
    description: "Sigorta acente portföyünüzü yönetmek için giriş yapın",
    email: "E-posta",
    password: "Şifre",
    role: "Rol",
    salesperson: "Satış Temsilcisi",
    manager: "Yönetici",
    portfolioFilter: "Portföy Filtresi",
    portfolioOwner: "John Smith (Satış Sorumlusu)",
    portfolioRegion: "New York Bölgesi",
    portfolioAll: "Tüm Portföyler",
    language: "Dil",
    english: "English",
    turkish: "Türkçe",
    signIn: "Giriş Yap",
    signingIn: "Giriş Yapılıyor...",
    defaultsPrefix: "Varsayılan",
    signInSuccess: "Giriş başarıyla tamamlandı.",
  },
  dashboard: {
    title: "Gösterge Paneli",
    welcome: (name) => `Tekrar hoş geldiniz, ${name}. Portföy özetiniz hazır.`,
    userFallback: "Kullanıcı",
    todaysPlan: "Bugünün Planı",
    visitsPlanned: "Planlanan Ziyaret",
    estimatedTravelTime: "Tahmini Yolculuk",
    firstVisit: "İlk Ziyaret",
    viewDayPlan: "Günlük Planı Aç",
    nextVisit: "Sıradaki Ziyaret",
    priorityTier: (tier) => `Öncelik ${tier}`,
    renewalRisk: "Yenileme Riski",
    highClaims: "Yüksek Hasar",
    notScheduled: "Planlanmadı",
    noVisitsPlanned: "Henüz planlı ziyaret yok.",
    addVisitsInDailyPlan: "Bugünün rotasını oluşturmak için Günlük Plan'dan acente ekleyin.",
    noNextVisit: "Günlük Plan'a ikinci bir ziyaret ekleyin.",
    nextRecommendedVisit: "Sonraki Önerilen Ziyaret",
    generateMeetingPrep: "Toplantı Hazırlığı Oluştur",
    portfolioKpis: "Portföy KPI",
    totalPremiums: "Toplam Prim",
    totalRevenue: "Toplam Gelir",
    avgClaimsRatio: "Ort. Hasar Oranı",
    avgRenewalRate: "Ort. Yenileme Oranı",
    avgHealthScore: "Ort. Sağlık Skoru",
    benchmark: "Karşılaştırma",
    aboveTarget: "Hedefin üstünde",
    priorityFeed: "Öncelik Akışı (AI Sıralı)",
    viewAllAgencies: "Tüm Acenteleri Gör",
    concentrationRisk: "Konsantrasyon Riski",
    growthBadge: (branch, growth) => `Büyüme: ${branch} (+${growth}%)`,
    healthScore: "Sağlık Skoru",
    renewalRate: "Yenileme Oranı",
    claimsRatio: "Hasar Oranı",
    open: "Aç",
    addToPlan: "Plana Ekle",
    agencyAlreadyInPlan: "Acente bugünkü planda zaten var.",
    addedAgencyToPlan: (agencyId) => `${agencyId} bugünkü plana eklendi.`,
  },
  dailyPlan: {
    removeSelected: "Seçileni Kaldır",
    removeVisit: "Plandan Kaldır",
    removed: (agencyName) => `${agencyName} bugünkü plandan kaldırıldı.`,
    removeFailed: "Ziyaret plandan kaldırılamadı.",
    agencyAlreadyInPlan: "Acente bugünkü planda zaten var.",
    addedAgencyToPlan: (agencyId) => `${agencyId} bugünkü plana eklendi.`,
    routeOptimizationFailed: "Rota optimizasyonu başarısız.",
    routeOptimized: (km, minutes) => `Rota optimize edildi (${km.toFixed(1)} km / ${minutes} dk).`,
    meetingPrepGenerated: (agencyId) => `${agencyId} için toplantı hazırlığı oluşturuldu.`,
    meetingPrepGenerationFailed: "Toplantı hazırlığı oluşturma başarısız.",
    outcomeSaved: (agencyId) => `${agencyId} için sonuç kaydedildi.`,
    outcomeSaveFailed: "Toplantı sonucu kaydedilemedi.",
    generating: "Oluşturuluyor...",
    generatePrep: "Hazırlık Oluştur",
    risk: "Risk",
    candidatePool: "Aday Havuzu",
    searchAgencies: "Acente ara...",
    allAgencies: "Tüm Acenteler",
    dueThisWeek: "Bu Hafta Ziyaret",
    renewalRisk: "Yenileme Riski",
    highGrowth: "Yüksek Büyüme",
    addToPlan: "Plana Ekle",
    todaysPlan: "Bugünün Planı",
    visitsPlanned: (count) => `${count} ziyaret planlandı`,
    autosave: "Otomatik kayıt",
    optimizing: "Optimize ediliyor...",
    optimizeRoute: "Rotayı Optimize Et",
    noVisitsPlanned: "Henüz planlı ziyaret yok. Aday havuzundan acente ekleyin.",
    visitDetails: "Ziyaret Detayları",
    meetingObjective: "Toplantı Hedefi",
    objectiveRenewal: "Yenileme Görüşmesi",
    objectiveClaims: "Hasar İncelemesi",
    objectiveCrossSell: "Çapraz Satış Fırsatı",
    objectiveRelationship: "İlişki Geliştirme",
    timeWindow: "Zaman Aralığı",
    meetingPrep: "Toplantı Hazırlığı",
    notes: "Notlar",
    notesPlaceholder: "Bu ziyaret için not ekleyin...",
    generateMeetingPrep: "Toplantı Hazırlığı Oluştur",
    checklist: "Kontrol Listesi",
    checklistReviewKpis: "Acente KPI'larını gözden geçir",
    checklistPrepareTalkingPoints: "Konuşma maddelerini hazırla",
    checklistReviewLastNotes: "Son toplantı notlarını incele",
    afterVisit: "Ziyaret Sonrası",
    outcome: "Sonuç",
    selectOutcome: "Sonuç seçin...",
    outcomeNotSet: "Belirtilmedi",
    outcomeSuccess: "Başarılı",
    outcomeNeutral: "Nötr",
    outcomeRisk: "Risk",
    selectVisitHint: "Detayları görmek için bir ziyaret seçin",
    goalRenewal: "Yenileme",
    goalClaims: "Hasar",
    goalCrossSell: "Çapraz Satış",
    goalRelationship: "İlişki",
  },
  meetingPrep: {
    selectAgencies: "Acente Seçimi",
    selectedCount: (count) => `${count} seçildi`,
    risk: "Risk",
    generationSettings: "Üretim Ayarları",
    template: "Şablon",
    templateStandard: "Standart Değerlendirme",
    templateRenewal: "Yenileme İyileştirme Planı",
    templateClaims: "Hasar Oranı Görüşmesi",
    templateGrowth: "Büyüme Oyunu",
    templateConcentration: "Konsantrasyon Risk Azaltma",
    templateRelationship: "İlişki Sürdürme",
    tone: "Ton",
    toneFriendly: "Samimi",
    toneConsultative: "Danışman",
    toneAssertive: "Net",
    length: "Uzunluk",
    lengthShort: "Kısa (5 dk)",
    lengthMedium: "Orta (15 dk)",
    lengthLong: "Uzun (30 dk)",
    options: "Seçenekler",
    includeBenchmarks: "Karşılaştırmaları Dahil Et",
    generate: "Oluştur",
    generating: "Oluşturuluyor...",
    regenerateWithConstraints: "Koşullarla Yeniden Oluştur",
    generatedOutput: "Üretilen Çıktı",
    saving: "Kaydediliyor...",
    saveToNotes: "Notlara Kaydet",
    creating: "Oluşturuluyor...",
    createTasks: "Görev Oluştur",
    export: "Dışa Aktar",
    exportPlanned: "Dışa aktarma sonraki fazda planlandı.",
    emptyState: "Toplantı hazırlığı oluşturmak için bir acente seçip Oluştur'a basın.",
    selectAgencyBeforeGenerate: "Toplantı hazırlığı için bir acente seçin.",
    generatedNarratives: (count) => `${count} toplantı hazırlığı oluşturuldu.`,
    narrativeGenerationFailed: "İçerik oluşturma başarısız.",
    generateBeforeSave: "Notları kaydetmeden önce içerik oluşturun.",
    savedNotes: (count) => (count === 1 ? "Seçili acente için not kaydedildi." : `${count} acente için not kaydedildi.`),
    saveNotesFailed: "Not kaydetme başarısız.",
    selectAgencyFirst: "Önce bir acente seçin.",
    createdTasks: (count) => (count === 1 ? "1 görev oluşturuldu." : `${count} görev oluşturuldu.`),
    taskCreationFailed: "Görev oluşturma başarısız.",
    sectionTitle: (agencyName) => `TOPLANTI HAZIRLIĞI: ${agencyName}`,
    flowTitle: "Toplantı Asistan Akışı",
    preMeetingBriefPanel: "Toplantı Öncesi Brief",
    postMeetingReviewPanel: "Toplantı Sonrası Değerlendirme",
    outcomeTrackingPanel: "Sonuç Takibi",
    keyPoints: "Ana Noktalar",
    recommendationList: "Öneriler",
    recommendationRationale: "Gerekçe",
    expectedKpi: "Hedef KPI",
    expectedImpactWindow: "Beklenen Etki Penceresi",
    recommendationConfidence: "Güven Seviyesi",
    recommendationDecision: "Karar",
    decisionProposed: "Önerildi",
    decisionAccepted: "Kabul Edildi",
    decisionModified: "Düzenlendi",
    decisionRejected: "Reddedildi",
    plannedRecommendation: "Planlanan Öneri",
    meetingReportEvidence: "Toplantı Raporu Kanıtı",
    consistencyFlag: "Tutarlılık Bayrağı",
    consistencyMatch: "Eşleşiyor",
    consistencyMismatch: "Eşleşmiyor",
    aiCritiqueSuggestion: "AI Eleştiri / Öneri",
    effectivenessLabel: "Etkililik",
    effectivenessEffective: "Etkili",
    effectivenessIneffective: "Etkisiz",
    effectivenessInconclusive: "Belirsiz",
    baselineKpi: "Başlangıç KPI",
    kpiDeltaTPlus7: "KPI Delta (T+7)",
    kpiDeltaTPlus30: "KPI Delta (T+30)",
    validationFlags: "Doğrulama Bayrakları",
    validationReasonDataIssue: "Veri Sorunu",
    validationReasonContextMismatch: "Bağlam Uyumsuzluğu",
    validationReasonExecutionFailure: "Uygulama Hatası",
    selectMeeting: "Toplantı Seç",
    flowEmptyState: "Bu seçim için toplantı akışı verisi bulunamadı.",
    noBriefAvailable: "Henüz toplantı öncesi brief ana noktası yok.",
    noRecommendations: "Bu toplantı için öneri bulunamadı.",
    decisionReason: "Karar Gerekçesi",
    editedRecommendation: "Düzenlenen Öneri",
    saveDecision: "Kararı Kaydet",
    reportSummary: "Görüşme Özeti",
    commitments: "Taahhütler",
    deviations: "Sapmalar",
    consistencyUnknown: "Bilinmiyor",
    saveReport: "Raporu Kaydet",
    saveOutcome: "Sonucu Kaydet",
    assessedAt: "Değerlendirme Tarihi",
    linkedReport: "Bağlı Rapor",
    noReportLinked: "Bağlı rapor yok",
    addValidationFlag: "Doğrulama Nedeni",
    validationNotes: "Doğrulama Notu",
    addFlag: "Bayrak Ekle",
    noValidationFlags: "Henüz doğrulama bayrağı yok.",
  },
  agencyProfile: {
    notFoundTitle: "Acente bulunamadı",
    backToAgencies: "Acentelere Dön",
    tierLabel: (tier) => `Seviye ${tier}`,
    renewalRisk: "Yenileme Riski",
    addToPlan: "Plana Ekle",
    generatePrep: "Hazırlık Oluştur",
    tabOverview: "Genel Bakış",
    tabDiagnostics: "Teşhis",
    tabMeetingPrep: "Toplantı Hazırlığı",
    tabNotesTasks: "Notlar ve Görevler",
    premiumsWritten: "Yazılan Prim",
    totalRevenue: "Toplam Gelir",
    renewalRate: "Yenileme Oranı",
    claimsRatio: "Hasar Oranı",
    compareWith: "karşı",
    averageLabel: (value) => `Ort: ${value}`,
    concentration: "Konsantrasyon",
    healthScore: "Sağlık Skoru",
    benchmarkComparison: "Karşılaştırma Kıyaslaması",
    whyAgencyMattersToday: "Bu Acente Neden Bugün Önemli",
    renewalRiskAlert: (renewalRate, delta) =>
      `Yenileme oranı ${renewalRate}% ve portföy ortalamasının ${delta.toFixed(1)} puan altında. Acil odak önerilir.`,
    claimsRatioElevated: (claimsRatioPct, deltaPct) =>
      `${claimsRatioPct.toFixed(0)}% seviyesinde ve kıyaslamanın ${deltaPct.toFixed(0)} puan üstünde.`,
    growthOpportunity: (branch, growth) =>
      `${branch} branşı yıllık +${growth}% büyümeyle güçlü performans gösteriyor.`,
    concentrationRiskText: (concentrationPct) =>
      `Portföy konsantrasyonu ${concentrationPct.toFixed(0)}% seviyesinde, çeşitlendirme fırsatı var.`,
    visitPlanning: "Ziyaret Planlama",
    lastVisit: "Son Ziyaret",
    nextRecommendedVisit: "Sonraki Önerilen Ziyaret",
    targetFrequency: "Hedef Frekans",
    preferredTime: "Tercih Edilen Saat",
    branchYoyGrowth: "Branş Yıllık Büyüme",
    branchGrowthPercent: "Büyüme %",
    aiPerformanceAnalysis: "Yapay Zeka Performans Analizi",
    keyDrivers: "Ana Sürücüler",
    risks: "Riskler",
    opportunities: "Fırsatlar",
    keyDriverRenewal: (renewalRate, benchmarkRate) =>
      `Yenileme oranı: ${renewalRate}% (kıyas: ${benchmarkRate}%)`,
    keyDriverClaims: (claimsRatioPct, benchmarkPct) =>
      `Hasar oranı: ${claimsRatioPct.toFixed(0)}% (kıyas: ${benchmarkPct.toFixed(0)}%)`,
    keyDriverConcentration: (concentrationPct) =>
      `Portföy konsantrasyonu: ${concentrationPct.toFixed(0)}%`,
    keyDriverBestBranch: (branch, growth) =>
      `En iyi performans: ${branch} (+${growth}%)`,
    riskRenewal: "Yenileme riski aktif - müşteri tutundurmaya odaklanılmalı",
    riskClaims: "Hasar oranı kıyas üstünde - underwriting kalitesi gözden geçirilmeli",
    riskConcentration: "Yüksek konsantrasyon riski - çeşitlendirme stratejisi değerlendirilmeli",
    opportunityLeverage: (branch) =>
      `${branch} branşındaki başarıyı çapraz satışta kullanın`,
    opportunityImprove: (branch) =>
      `${branch} branş performansını hedefli eğitimle artırın`,
    opportunityPremiums: (premiumsMillion) =>
      `Toplam prim $${premiumsMillion}M seviyesinde - genişleme potansiyeli var`,
    meetingNarrativeBuilder: "Toplantı Anlatı Oluşturucu",
    prepareMeetingNotes: "Toplantı Notlarını Hazırla",
    preparingMeetingNotes: "Notlar Hazırlanıyor...",
    meetingNotesPrepared: "Toplantı notları hazırlandı.",
    meetingNotesPreparationFailed: "Toplantı notları hazırlanamadı.",
    generateNarrative: "Anlatı Oluştur",
    generateTalkTracks: "3 Konuşma Başlığı Oluştur",
    generateAgenda: "Gündem Oluştur (30 dk)",
    talkTracksAppendix:
      "\n\nKONUŞMA BAŞLIKLARI:\n1) Yenileme tutundurma\n2) Hasar yönetimi\n3) Büyüme çapraz satış",
    agendaAppendix:
      "\n\nGÜNDEM (30 DK):\n- 5 dk açılış\n- 10 dk performans değerlendirmesi\n- 10 dk risk/fırsatlar\n- 5 dk taahhütler",
    narrativePlaceholder: "Üretilen anlatı burada görünecek...",
    saveToNotes: "Notlara Kaydet",
    createTasksFromOutput: "Çıktıdan Görev Oluştur",
    exportAsPdf: "PDF Olarak Dışa Aktar",
    exportPlanned: "Dışa aktarma sonraki fazda planlandı.",
    notesTasksTitle: "Notlar ve Görevler",
    notesTasksDescription:
      "Not ve görev işlevleri burada yer alacak. Toplantı notlarını kaydedebilir, takipleri izleyebilir ve yapay zeka çıktısından aksiyon oluşturabilirsiniz.",
    narrativeGenerateBeforeSave: "Kaydetmeden önce anlatı içeriği oluşturun.",
    narrativeSaved: "Anlatı notlara kaydedildi.",
    narrativeSaveFailed: "Anlatı kaydedilemedi.",
    narrativeGenerateBeforeTasks: "Görev oluşturmadan önce anlatı içeriği oluşturun.",
    taskCreatedFromNarrative: "Anlatıdan görev oluşturuldu.",
    taskCreateFailed: "Görev oluşturulamadı.",
    agencyAlreadyInPlan: "Acente bugünkü planda zaten var.",
    addedAgencyToPlan: (agencyId) => `${agencyId} bugünkü plana eklendi.`,
    frequencyLabel: (value) => {
      const labels: Record<"weekly" | "monthly" | "quarterly", string> = {
        weekly: "Haftalık",
        monthly: "Aylık",
        quarterly: "Üç Aylık",
      };
      return labels[value];
    },
    timeWindowLabel: (value) => {
      const labels: Record<"morning" | "afternoon" | "any", string> = {
        morning: "Sabah",
        afternoon: "Öğleden Sonra",
        any: "Farketmez",
      };
      return labels[value];
    },
    branchLabel: (value) => {
      const labels: Record<"motor" | "home" | "health", string> = {
        motor: "Motor",
        home: "Konut",
        health: "Sağlık",
      };
      return labels[value];
    },
    narrativeText: ({
      agencyName,
      healthScore,
      avgHealthScore,
      renewalRate,
      avgRenewalRate,
      claimsRatioPct,
      avgClaimsRatioPct,
      premiumsMillion,
      concentrationPct,
      renewalRisk,
      bestBranchLabel,
      bestBranchGrowth,
      worstBranchLabel,
    }) => `TOPLANTI HAZIRLIĞI - ${agencyName}

AÇILIŞ BAĞLAMI:
Bugün zaman ayırdığınız için teşekkür ederim. İş birliği performansımızı değerlendirmek ve önümüzdeki dönemde iş birliğimizi nasıl güçlendirebileceğimizi konuşmak istiyorum.

PERFORMANS ÖZETİ:
• Genel Sağlık Skoru: ${healthScore}/100 (Portföy ort: ${avgHealthScore.toFixed(0)})
• Yenileme Oranı: ${renewalRate}% (portföy ort: ${avgRenewalRate}%)
  ${renewalRate < avgRenewalRate ? "⚠️ Kıyaslamanın " + (avgRenewalRate - renewalRate).toFixed(1) + " puan altında" : "✓ Kıyaslamanın üstünde"}
• Hasar Oranı: ${claimsRatioPct.toFixed(0)}% (portföy ort: ${avgClaimsRatioPct.toFixed(0)}%)
  ${claimsRatioPct > avgClaimsRatioPct ? "⚠️ Kıyaslamadan yüksek" : "✓ Kıyaslamadan iyi"}
• Toplam Prim: $${premiumsMillion}M
• Portföy Konsantrasyonu: ${concentrationPct.toFixed(0)}%

ELE ALINMASI GEREKEN RİSKLER:
${renewalRisk ? "• ⚠️ YENİLEME RİSKİ - Müşteri tutundurmada öncelikli aksiyon gerekli\n" : ""}${claimsRatioPct > avgClaimsRatioPct ? "• Hasar oranı portföy ortalamasının üzerinde - hasar yönetim süreçleri gözden geçirilmeli\n" : ""}${concentrationPct > 40 ? "• Yüksek portföy konsantrasyonu (>40%) - çeşitlendirme fırsatı\n" : ""}

FIRSATLAR:
• En iyi performans gösteren branş: ${bestBranchLabel.toUpperCase()} (+${bestBranchGrowth}% Y/Y)
${healthScore > 80 ? "• Güçlü genel sağlık skoru - genişleme için kaldıraç\n" : ""}• Motor, konut ve sağlık ürünlerinde çapraz satış potansiyeli

SORULACAK SORULAR:
1. ${bestBranchLabel} branşındaki başarınızı tetikleyen faktörler neler? Bunu diğer alanlara taşıyabilir miyiz?
2. ${renewalRisk ? "Yenileme oranlarında düşüş görüyorum. Müşteri tutundurmada karşılaştığınız zorluklar neler?" : "Güçlü yenileme performansınızı daha da desteklemek için ne yapabiliriz?"}
3. En yüksek büyüme potansiyelini hangi müşteri segmentlerinde görüyorsunuz?
4. Bizden alacağınız hangi destek işinize en fazla katkı sağlar?
5. Müşteri hasar iletişimini nasıl yönetiyorsunuz?

ÖNERİLEN TAAHHÜTLER:
• Aylık performans değerlendirme toplantıları
• ${worstBranchLabel} ürünleri için güçlendirilmiş eğitim
• Yüksek performanslı segmentlerde ortak pazarlama fırsatları
• Birlikte çeyreklik büyüme hedefleri belirleme
• Hasar desteği için doğrudan eskalasyon kanalı oluşturma

SONRAKİ ADIMLAR:
□ Detaylı hasar verisini birlikte inceleme
□ Ürün eğitim oturumu planlama
□ Gelecek çeyrek için ortak büyüme planı hazırlama
□ Müşteri geri bildirimlerine özel takip yapma
□ Ayrılmadan bir sonraki toplantıyı planlama`,
    taskTitle: "Acente profil anlatısı için takip",
    taskDescription: "Üretilen anlatıdaki taahhütleri somut aksiyon maddelerine dönüştür.",
  },
  mapClusters: {
    title: "Ziyaret Planlama",
    subtitle: "Ziyaret planı oluşturun, rotayı optimize edin ve saha ilerlemesini takip edin.",
    routeSummary: "Rota Özeti",
    agenciesTotal: "Acenteler",
    plannedVisits: "Planlanan",
    visitedVisits: "Ziyaret Edildi",
    pendingVisits: "Bekleyen",
    routeRevision: "Rota revizyonu",
    routeUpdatedAt: "Son yeniden hesaplama",
    routeNotCalculated: "Henüz hesaplanmadı",
    routeLastReason: "Son tetikleme",
    reasonManual: "Manuel",
    reasonVisitCompleted: "Ziyaret tamamlandı",
    algorithmSettings: "Küme Ayarları",
    numberOfClusters: "Küme sayısı",
    weightByPriority: "Önceliğe göre ağırlıklandır",
    createClusters: "Kümeleri Oluştur",
    recalculateRoute: "Rotayı Yeniden Hesapla (Mock)",
    recalculating: "Yeniden hesaplanıyor...",
    clusterResults: "Küme Sonuçları",
    noClusters: "Acenteleri gruplamak için ayarları değiştirip küme oluşturun.",
    agenciesInCluster: "Kümedeki acenteler",
    totalValue: "Toplam değer",
    addClusterToPlan: "Kümeyi Plana Ekle",
    clusterTitle: (clusterId) => `Küme ${clusterId}`,
    clusterAgencyCount: (count) => `${count} acente`,
    mapLegend: "Lejant",
    legendPlanned: "Planlı durak",
    legendUnplanned: "Plana dahil değil",
    legendVisited: "Ziyaret edilen durak",
    legendClusterCenter: "Küme merkezi",
    selectedAgency: "Seçili Acente",
    clickAgencyHint: "Detayları ve aksiyonları görmek için harita pinine tıklayın.",
    agencyDetails: "Acente detayları",
    location: "Konum",
    healthScore: "Sağlık skoru",
    renewalRisk: "Yenileme riski",
    yes: "Evet",
    no: "Hayır",
    routeStatus: "Rota durumu",
    routeStatusPlanned: "Planlandı",
    routeStatusVisited: "Ziyaret edildi",
    routeStatusNotPlanned: "Plana dahil değil",
    markVisited: "Ziyareti Tamamlandı Olarak İşaretle",
    alreadyVisited: "Zaten ziyaret edildi",
    addToPlan: "Günlük Plana Ekle",
    plannedRoute: "Planlanan Rota",
    noPlannedVisits: "Henüz planlı ziyaret yok. Harita veya Günlük Plan ekranından acente ekleyin.",
    stop: "Durak",
    markVisitFailed: "Bu ziyaret ziyaret edildi olarak işaretlenemedi.",
    visitAlreadyMarked: "Bu ziyaret zaten işaretlenmiş.",
    visitMarked: (agencyName) => `${agencyName} ziyaret edildi olarak işaretlendi.`,
    routeRecalcTriggered: "Rota yeniden hesaplama tetiklendi.",
    routeRecalcComplete: "Rota durumu güncellendi (mock hesaplama tamamlandı).",
    routeRecalcBlocked: "Yeniden hesaplama öncesinde en az bir planlı ziyaret ekleyin.",
    agenciesAlreadyInPlan: "Seçilen acenteler zaten günlük planda.",
    agenciesAddedToPlan: (count) => `${count} acente günlük plana eklendi.`,
  },
  tasksFollowUps: {
    title: "Görev ve Takip",
    subtitle: (count, syncing) => `${count} görev${syncing ? " (senkronize ediliyor...)" : ""}`,
    aiSuggestions: "Yapay Zeka Önerileri",
    aiSuggestionsPlanned: "Yapay zeka önerileri sonraki fazda planlandı.",
    statusPlaceholder: "Durum",
    statusAll: "Tüm Durumlar",
    statusPending: "Beklemede",
    statusInProgress: "Devam Ediyor",
    statusCompleted: "Tamamlandı",
    priorityPlaceholder: "Öncelik",
    priorityAll: "Tüm Öncelikler",
    tableTask: "Görev",
    tableAgency: "Acente",
    tableDueDate: "Termin Tarihi",
    tablePriority: "Öncelik",
    tableStatus: "Durum",
    tableActions: "Aksiyonlar",
    overdueBadge: "Gecikti",
    taskSummaryTitle: "Görev Özeti",
    byPriorityTitle: "Önceliğe Göre",
    aiInsightsTitle: "Yapay Zeka İçgörüleri",
    pendingLabel: "Beklemede",
    inProgressLabel: "Devam Ediyor",
    completedLabel: "Tamamlandı",
    highPriorityLabel: "Yüksek Öncelik",
    mediumPriorityLabel: "Orta Öncelik",
    lowPriorityLabel: "Düşük Öncelik",
    aiAssistantTitle: "Yapay Zeka Asistanı",
    aiAssistantDescription: "Akıllı görev önerileri alın",
    suggestTopFollowUps: "En İyi 10 Takibi Öner",
    summarizeOutstandingRisks: "Bekleyen Riskleri Özetle",
    suggestionFlowPlanned: "Öneri akışı planlandı.",
    riskSummaryFlowPlanned: "Risk özet akışı planlandı.",
    recommendationFlowPlanned: "Öneri akışı sonraki fazda planlandı.",
    getRecommendations: "Önerileri Getir",
    aiInsightSummary: (highPriorityCount) =>
      `${highPriorityCount} yüksek öncelikli göreviniz yenileme riski olan acentelerle ilişkili.`,
    dateLocale: "tr-TR",
    statusLabel: (status) => {
      const labels: Record<"pending" | "in-progress" | "completed", string> = {
        pending: "Beklemede",
        "in-progress": "Devam Ediyor",
        completed: "Tamamlandı",
      };
      return labels[status];
    },
    priorityLabel: (priority) => {
      const labels: Record<"high" | "medium" | "low", string> = {
        high: "Yüksek",
        medium: "Orta",
        low: "Düşük",
      };
      return labels[priority];
    },
    loadFailed: "Kayıtlı görevler yüklenemedi.",
    createTask: "Görev Oluştur",
    creatingTask: "Oluşturuluyor...",
    createTaskDialogTitle: "Görev Oluştur",
    editTaskDialogTitle: "Görevi Düzenle",
    createTaskDialogDescription: "Acente, aksiyon başlığı, termin ve öncelik alanlarıyla takip görevi ekleyin.",
    editTaskDialogDescription: "Görev detaylarını güncelleyin veya bu kullanıcı görevini silin.",
    fieldAgency: "Acente",
    fieldTitle: "Aksiyon / Başlık",
    fieldDueDate: "Termin",
    fieldPriority: "Öncelik",
    priorityHigh: "Yüksek",
    priorityMedium: "Orta",
    priorityLow: "Düşük",
    cancel: "İptal",
    saveTask: "Görevi Kaydet",
    updateTask: "Değişiklikleri Kaydet",
    deleteTask: "Görevi Sil",
    editTask: "Düzenle",
    completeTask: "Tamamla",
    taskCreated: "Görev oluşturuldu.",
    taskUpdated: "Görev güncellendi.",
    taskDeleted: "Görev silindi.",
    taskCompleted: "Görev tamamlandı olarak işaretlendi.",
    taskCreateFailed: "Görev oluşturma başarısız.",
    titleRequired: "Görev başlığı zorunludur.",
    dueDateRequired: "Termin tarihi zorunludur.",
    agencyRequired: "Acente seçimi zorunludur.",
    userCreatedTag: "Kullanıcı",
  },
  settings: {
    title: "Ayarlar",
    subtitle: "Tercih ve konfigürasyonlarınızı yönetin",
    workPreferences: "Çalışma Tercihleri",
    language: "Dil",
    defaultStartLocation: "Varsayılan Başlangıç Konumu",
    office: "Ofis",
    home: "Ev",
    manualEntry: "Manuel Giriş",
    startLocationHint: "Rota optimizasyonu için başlangıç noktası",
    workingHours: "Çalışma Saatleri",
    startTime: "Başlangıç",
    endTime: "Bitiş",
    routePreferences: "Rota Tercihleri",
    maxVisitsPerDay: "Günlük Maksimum Ziyaret",
    maxVisitsHint: "Tek bir günde önerilen maksimum acente ziyareti",
    maxTravelHours: "Maksimum Yolculuk Süresi (saat)",
    maxTravelHint: "Günlük toplam yolculuk süresi limiti",
    avgVisitMinutes: "Ortalama Ziyaret Süresi (dakika)",
    aiAssistantSettings: "AI Asistan Ayarları",
    includeBenchmarks: "Karşılaştırma Verilerini Her Zaman Dahil Et",
    includeBenchmarksHint: "AI tarafından oluşturulan metinlere portföy karşılaştırmaları eklenir",
    autoGenerateNotes: "Toplantı Notlarını Otomatik Oluştur",
    autoGenerateNotesHint: "Plana acente eklenince otomatik not şablonu oluştur",
    priorityNotifications: "Öncelik Bildirimleri",
    priorityNotificationsHint: "Yüksek öncelik ve yenileme riski alarmlarını al",
    defaultTone: "Varsayılan Anlatı Tonu",
    toneFriendly: "Samimi",
    toneConsultative: "Danışman",
    toneAssertive: "Net",
    notifications: "Bildirimler",
    visitReminders: "Ziyaret Hatırlatıcıları",
    visitRemindersHint: "Yaklaşan ziyaretler için hatırlatma al",
    taskDueAlerts: "Görev Termin Uyarıları",
    taskDueAlertsHint: "Yaklaşan görev terminleri için bildirim al",
    performanceAlerts: "Performans Uyarıları",
    performanceAlertsHint: "Önemli KPI değişimlerinde bildirim al",
    account: "Hesap",
    fullName: "Ad Soyad",
    email: "E-posta",
    role: "Rol",
    cancel: "İptal",
    saveChanges: "Değişiklikleri Kaydet",
    settingsSaved: "Ayarlar kaydedildi.",
    changesReverted: "Değişiklikler geri alındı.",
  },
  assistant: {
    title: "Sapyo Assistant",
    restartConversation: "Yeniden Baslat",
    welcome:
      "Merhaba! Ben AI Portföy Asistanınızım. Toplantı hazırlığı, günlük rota optimizasyonu veya portföy risk özetleri isteyebilirsiniz.",
    working: "Çalışıyorum...",
    askPlaceholder: "Bana bir şey sorun...",
    footer: "AI yanıtları portföy verilerinize göre oluşturulur",
    openAssistant: "AI Asistanı Aç",
    contextLabel: "Bağlam",
    noContext: "Genel çalışma alanı",
    traceLabel: "AI izi",
    details: "Ayrıntılar",
    hideDetails: "Gizle",
    requestFailed: "Asistan isteği başarısız.",
    requestFailedDetail: "Bu isteği tamamlayamadım.",
    pendingActionTitle: "Onay gerekli",
    pendingActionDescription: "Bu aksiyonu çalıştırabilirim. Çalıştırmadan önce onaylayın:",
    confirmAction: "Onayla",
    cancelAction: "İptal",
    actionCancelled: "Aksiyon iptal edildi. Hazır olduğunuzda yeni bir soru sorabilirsiniz.",
    actionPreviewDailyPlan:
      "Mevcut kullanıcı diliyle `generateDailyPlan` çağrısını çalıştır ve güncel plan taslağını döndür.",
    actionPreviewMeetingPrep: (agencyId) =>
      `${agencyId} için \`generateMeetingPrep\` çağrısını çalıştır ve yapılandırılmış toplantı anlatısını döndür.`,
    noDirectMatch:
      "Doğrudan acente eşleşmesi bulunamadı. Belirli bir kod (örnek: AG001), toplantı hazırlığı veya rota optimizasyonu isteyin.",
    topAgencyMatches: "En uygun acente eşleşmeleri:",
    followUpHint: "Devam etmek için toplantı hazırlığı veya rota planlama isteyin.",
    openTaskHint: (count) => `${count} açık görev`,
    meetingSectionTitle: (agencyName, agencyId) => `Toplantı Hazırlığı: ${agencyName} (${agencyId})`,
  },
};

export function getI18nCopy(language: AppLanguage): I18nCopy {
  return language === "tr" ? TR_COPY : EN_COPY;
}
