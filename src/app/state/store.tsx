import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { getCurrentUser, loginRequest, logoutRequest } from "../api/auth";
import { getCurrentWorkflowDailyPlan } from "../api/workflows";
import type { UserRole } from "../api/types";
import {
  mockAgencies,
  mockDailyPlan,
  mockMeetingRecords,
  mockPostMeetingReports,
  mockPreMeetingBriefs,
  mockRecommendationDecisions,
  mockRecommendationOutcomes,
  mockRecommendations,
  mockTasks,
  mockValidationFlags,
  type DailyPlanVisit,
  type Task,
} from "../data/mockData";
import {
  IDLE_MUTATION,
  applyRecommendationDecision,
  mergeMeetingFlowDraftState,
  resolveMutationError,
  setSelectedMeetingId,
  toMutationRecord,
  upsertPostMeetingReportEntry,
  upsertRecommendationOutcomeEntry,
  upsertValidationFlagEntry,
  type MutationStatus,
  type RecommendationDecisionInput,
} from "./mutations";
import { readStorageJson, removeStorageKey, writeStorageJson } from "./storage";
import type {
  AssistantMessage,
  AssistantPendingAction,
  AssistantState,
  AppLanguage,
  AppState,
  MeetingFlowDraftState,
  MeetingPrepDraftState,
  PostMeetingReport,
  PlannerAutosave,
  PlannerDraftState,
  PlannerRouteRecalculationReason,
  PlannerRouteState,
  RecommendationOutcome,
  SessionState,
  SessionUser,
  SettingsState,
  TaskWorkspaceState,
  ValidationFlag,
  VisitChecklist,
  VisitOutcome,
} from "./types";

const SESSION_KEY = "agencymanager.session.v1";
const SETTINGS_KEY = "agencymanager.settings.v1";
const PLANNER_KEY = "agencymanager.planner.v1";
const MEETING_PREP_KEY = "agencymanager.meeting-prep.v1";
const MEETING_FLOW_KEY = "agencymanager.meeting-flow.v1";
const TASK_WORKSPACE_KEY = "agencymanager.tasks.v1";
const ASSISTANT_KEY = "agencymanager.assistant.v1";

interface StoredSession {
  user: SessionUser;
  token: string;
  sessionExpiry: string;
  language: AppLanguage;
}

interface LoginPayload {
  email: string;
  password: string;
  role: UserRole;
  language: AppLanguage;
  portfolioScope: string;
}

interface LoginResult {
  ok: boolean;
  message: string;
}

interface AppStateContextValue {
  state: AppState;
  login(payload: LoginPayload): Promise<LoginResult>;
  logout(): void;
  applySettings(next: SettingsState): void;
  addAgencyToPlan(agencyId: string): boolean;
  removePlannerVisit(visitId: string): boolean;
  replacePlannerVisits(visits: DailyPlanVisit[]): void;
  movePlannerVisit(dragIndex: number, hoverIndex: number): void;
  updatePlannerVisit(visitId: string, patch: Partial<DailyPlanVisit>): void;
  selectPlannerVisit(visitId: string | null): void;
  setPlannerFilters(next: { searchQuery?: string; filterPreset?: string }): void;
  setVisitChecklist(visitId: string, patch: Partial<VisitChecklist>): void;
  setVisitOutcome(visitId: string, outcome: VisitOutcome): void;
  markPlannerVisitVisited(visitId: string): boolean;
  recalculatePlannerRoute(
    reason?: Exclude<PlannerRouteRecalculationReason, null>,
  ): void;
  setPlannerAutosave(next: Partial<PlannerAutosave>): void;
  selectMeetingPrepAgency(agencyId: string | null): void;
  updateMeetingPrepDraft(next: Partial<MeetingPrepDraftState>): void;
  selectMeetingFlowMeeting(meetingId: string | null): void;
  setRecommendationDecision(input: RecommendationDecisionInput): void;
  upsertPostMeetingReport(report: PostMeetingReport): void;
  upsertRecommendationOutcome(outcome: RecommendationOutcome): void;
  upsertValidationFlag(flag: ValidationFlag): void;
  setTaskFilters(next: Partial<Pick<TaskWorkspaceState, "statusFilter" | "priorityFilter">>): void;
  completeTask(taskId: string): void;
  upsertTasks(tasks: Task[], options?: { markAsUserCreated?: boolean }): void;
  updateTask(taskId: string, patch: Partial<Omit<Task, "id">>): void;
  removeTask(taskId: string): void;
  setTaskSelection(taskIds: string[]): void;
  updateAssistant(next: Partial<AssistantState>): void;
  appendAssistantMessage(message: AssistantMessage): void;
  replaceAssistantMessages(messages: AssistantMessage[]): void;
  setAssistantPendingAction(action: AssistantPendingAction | null): void;
  setAssistantMobileOpen(isOpen: boolean): void;
  setMutationStatus(key: string, status: MutationStatus, error?: string | null): void;
  setMutationError(key: string, error: unknown, fallback: string): void;
  clearMutation(key: string): void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

const HARDCODED_USERS: Record<
  UserRole,
  { email: string; password: string; name: string; portfolioScope: string }
> = {
  salesperson: {
    email: "john.smith@company.com",
    password: "password",
    name: "John Smith",
    portfolioScope: "john-smith",
  },
  manager: {
    email: "ayse.demir@company.com",
    password: "manager123",
    name: "Ayse Demir",
    portfolioScope: "all",
  },
};

const DEFAULT_SETTINGS: SettingsState = {
  language: "en",
  defaultTone: "consultative",
  maxVisitsPerDay: 5,
  maxTravelHours: 4,
  avgVisitMinutes: 45,
  startLocation: "office",
  startTime: "09:00",
  endTime: "17:00",
  includeBenchmarks: true,
  autoGenerateMeetingNotes: true,
  priorityNotifications: true,
  visitReminders: true,
  taskDueAlerts: true,
  performanceAlerts: false,
};

const DEFAULT_AUTOSAVE: PlannerAutosave = {
  status: "idle",
  error: null,
  lastSavedAt: null,
  lastPlanId: null,
};

const DEFAULT_ROUTE: PlannerRouteState = {
  visitedVisitIds: [],
  routeRevision: 0,
  lastRecalculatedAt: null,
  lastRecalculationReason: null,
};

const DEFAULT_MEETING_PREP: MeetingPrepDraftState = {
  selectedAgencyId: null,
  template: "standard",
  tone: "consultative",
  length: "medium",
  includeBenchmarks: true,
  generatedOutput: "",
  generatedAt: null,
  sourceAgencyId: null,
};

const DEFAULT_TASK_WORKSPACE: TaskWorkspaceState = {
  tasks: mockTasks,
  statusFilter: "all",
  priorityFilter: "all",
  selectedTaskIds: [],
  userCreatedTaskIds: [],
  lastSyncedAt: null,
};

const DEFAULT_ASSISTANT: AssistantState = {
  messages: [],
  draftInput: "",
  lastPrompt: "",
  lastTrace: null,
  lastEvidenceMap: {},
  lastError: null,
  showTraceDetails: false,
  pendingAction: null,
  mobileOpen: false,
};

const DEFAULT_SESSION: SessionState = {
  status: "bootstrapping",
  user: null,
  token: null,
  language: "en",
  sessionExpiry: null,
};

const DEFAULT_PLANNER: PlannerDraftState = {
  visits: mockDailyPlan,
  selectedVisitId: mockDailyPlan[0]?.id || null,
  filterPreset: "all",
  searchQuery: "",
  checklistByVisit: {},
  outcomesByVisit: {},
  autosave: DEFAULT_AUTOSAVE,
  route: DEFAULT_ROUTE,
};

const DEFAULT_REPORT_BY_MEETING = new Map(
  mockPostMeetingReports.map((report) => [report.meeting_id, report.id]),
);

const DEFAULT_MEETING_FLOW_BASE: MeetingFlowDraftState = {
  meetings: mockMeetingRecords,
  pre_meeting_briefs: mockPreMeetingBriefs,
  recommendations: mockRecommendations,
  recommendation_decisions: mockRecommendationDecisions,
  post_meeting_reports: mockPostMeetingReports.map((report) => ({
    ...report,
    linked_outcome_ids: [],
  })),
  recommendation_outcomes: mockRecommendationOutcomes.map((outcome) => ({
    ...outcome,
    linked_report_id: DEFAULT_REPORT_BY_MEETING.get(outcome.meeting_id) || null,
  })),
  validation_flags: mockValidationFlags,
  selected_meeting_id: mockMeetingRecords[0]?.id || null,
  updated_at: null,
};

const DEFAULT_MEETING_FLOW = mergeMeetingFlowDraftState(DEFAULT_MEETING_FLOW_BASE, {});

type Action =
  | { type: "BOOTSTRAP_SESSION"; payload: SessionState }
  | { type: "LOGIN_SUCCESS"; payload: SessionState }
  | {
      type: "HYDRATE_PLANNER_FROM_BACKEND";
      payload: {
        visits: DailyPlanVisit[];
        checklistByVisit: Record<string, VisitChecklist>;
        outcomesByVisit: Record<string, VisitOutcome>;
        planId: string | null;
        savedAt: string | null;
      };
    }
  | { type: "LOGOUT" }
  | { type: "APPLY_SETTINGS"; payload: SettingsState }
  | { type: "ADD_PLANNER_VISIT"; payload: DailyPlanVisit }
  | { type: "REMOVE_PLANNER_VISIT"; payload: string }
  | { type: "REPLACE_PLANNER_VISITS"; payload: DailyPlanVisit[] }
  | { type: "MOVE_PLANNER_VISIT"; payload: { dragIndex: number; hoverIndex: number } }
  | { type: "UPDATE_PLANNER_VISIT"; payload: { visitId: string; patch: Partial<DailyPlanVisit> } }
  | { type: "SELECT_PLANNER_VISIT"; payload: string | null }
  | { type: "SET_PLANNER_FILTERS"; payload: { searchQuery?: string; filterPreset?: string } }
  | { type: "SET_VISIT_CHECKLIST"; payload: { visitId: string; patch: Partial<VisitChecklist> } }
  | { type: "SET_VISIT_OUTCOME"; payload: { visitId: string; outcome: VisitOutcome } }
  | { type: "MARK_PLANNER_VISIT_VISITED"; payload: { visitId: string; recalculatedAt: string } }
  | {
      type: "RECALCULATE_PLANNER_ROUTE";
      payload: { reason: Exclude<PlannerRouteRecalculationReason, null>; recalculatedAt: string };
    }
  | { type: "SET_PLANNER_AUTOSAVE"; payload: Partial<PlannerAutosave> }
  | { type: "SELECT_MEETING_PREP_AGENCY"; payload: string | null }
  | { type: "UPDATE_MEETING_PREP_DRAFT"; payload: Partial<MeetingPrepDraftState> }
  | { type: "SET_MEETING_FLOW_SELECTION"; payload: string | null }
  | { type: "SET_RECOMMENDATION_DECISION"; payload: RecommendationDecisionInput }
  | { type: "UPSERT_POST_MEETING_REPORT"; payload: PostMeetingReport }
  | { type: "UPSERT_RECOMMENDATION_OUTCOME"; payload: RecommendationOutcome }
  | { type: "UPSERT_VALIDATION_FLAG"; payload: ValidationFlag }
  | {
      type: "SET_TASK_FILTERS";
      payload: Partial<Pick<TaskWorkspaceState, "statusFilter" | "priorityFilter">>;
    }
  | { type: "UPSERT_TASKS"; payload: { tasks: Task[]; markAsUserCreated: boolean } }
  | { type: "UPDATE_TASK"; payload: { taskId: string; patch: Partial<Omit<Task, "id">> } }
  | { type: "REMOVE_TASK"; payload: string }
  | { type: "COMPLETE_TASK"; payload: string }
  | { type: "SET_TASK_SELECTION"; payload: string[] }
  | { type: "UPDATE_ASSISTANT"; payload: Partial<AssistantState> }
  | { type: "APPEND_ASSISTANT_MESSAGE"; payload: AssistantMessage }
  | { type: "REPLACE_ASSISTANT_MESSAGES"; payload: AssistantMessage[] }
  | { type: "SET_ASSISTANT_PENDING_ACTION"; payload: AssistantPendingAction | null }
  | { type: "SET_ASSISTANT_MOBILE_OPEN"; payload: boolean }
  | { type: "SET_MUTATION"; payload: { key: string; status: MutationStatus; error: string | null } }
  | { type: "CLEAR_MUTATION"; payload: string };

function normalizePlannerRoute(raw: unknown): PlannerRouteState {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_ROUTE;
  }

  const payload = raw as Partial<PlannerRouteState>;
  const uniqueVisitedVisitIds = Array.from(
    new Set((Array.isArray(payload.visitedVisitIds) ? payload.visitedVisitIds : []).filter((id): id is string => typeof id === "string" && id.length > 0)),
  );

  return {
    visitedVisitIds: uniqueVisitedVisitIds,
    routeRevision:
      typeof payload.routeRevision === "number" && Number.isFinite(payload.routeRevision)
        ? Math.max(0, payload.routeRevision)
        : 0,
    lastRecalculatedAt:
      typeof payload.lastRecalculatedAt === "string" ? payload.lastRecalculatedAt : null,
    lastRecalculationReason:
      payload.lastRecalculationReason === "manual" || payload.lastRecalculationReason === "visit-completed"
        ? payload.lastRecalculationReason
        : null,
  };
}

function sanitizePlannerRouteForVisits(route: PlannerRouteState, visits: DailyPlanVisit[]): PlannerRouteState {
  const visitIdSet = new Set(visits.map((visit) => visit.id));
  const visitedVisitIds = route.visitedVisitIds.filter((visitId) => visitIdSet.has(visitId));
  if (visitedVisitIds.length === route.visitedVisitIds.length) {
    return route;
  }
  return {
    ...route,
    visitedVisitIds,
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "BOOTSTRAP_SESSION":
      return {
        ...state,
        session: action.payload,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        session: action.payload,
        settings: {
          ...state.settings,
          language: action.payload.language,
        },
      };
    case "HYDRATE_PLANNER_FROM_BACKEND":
      {
        const hydratedRoute = sanitizePlannerRouteForVisits(state.planner.route, action.payload.visits);
        return {
          ...state,
          planner: {
            ...state.planner,
            visits: action.payload.visits,
            selectedVisitId: action.payload.visits[0]?.id || null,
            checklistByVisit: action.payload.checklistByVisit,
            outcomesByVisit: action.payload.outcomesByVisit,
            autosave: {
              ...state.planner.autosave,
              status: action.payload.planId ? "success" : "idle",
              error: null,
              lastPlanId: action.payload.planId,
              lastSavedAt: action.payload.savedAt,
            },
            route: hydratedRoute,
          },
        };
      }
    case "LOGOUT":
      return {
        ...state,
        session: {
          ...DEFAULT_SESSION,
          status: "anonymous",
          language: state.settings.language,
        },
        planner: DEFAULT_PLANNER,
        meetingPrep: DEFAULT_MEETING_PREP,
        meetingFlow: DEFAULT_MEETING_FLOW,
        tasks: {
          ...DEFAULT_TASK_WORKSPACE,
          tasks: mockTasks,
        },
        assistant: {
          ...DEFAULT_ASSISTANT,
        },
        mutations: {},
      };
    case "APPLY_SETTINGS":
      return {
        ...state,
        settings: action.payload,
        session: {
          ...state.session,
          language: action.payload.language,
        },
      };
    case "ADD_PLANNER_VISIT": {
      if (state.planner.visits.some((visit) => visit.agency_id === action.payload.agency_id)) {
        return state;
      }
      const nextVisits = [...state.planner.visits, action.payload].map((visit, index) => ({
        ...visit,
        order: index + 1,
      }));
      return {
        ...state,
        planner: {
          ...state.planner,
          visits: nextVisits,
          selectedVisitId: action.payload.id,
        },
      };
    }
    case "REMOVE_PLANNER_VISIT": {
      const targetIndex = state.planner.visits.findIndex((visit) => visit.id === action.payload);
      if (targetIndex === -1) {
        return state;
      }

      const nextVisits = state.planner.visits
        .filter((visit) => visit.id !== action.payload)
        .map((visit, index) => ({
          ...visit,
          order: index + 1,
        }));

      const nextChecklistByVisit = { ...state.planner.checklistByVisit };
      delete nextChecklistByVisit[action.payload];

      const nextOutcomesByVisit = { ...state.planner.outcomesByVisit };
      delete nextOutcomesByVisit[action.payload];

      const nextSelectedVisitId =
        state.planner.selectedVisitId === action.payload
          ? nextVisits[Math.min(targetIndex, nextVisits.length - 1)]?.id || null
          : state.planner.selectedVisitId;

      return {
        ...state,
        planner: {
          ...state.planner,
          visits: nextVisits,
          selectedVisitId: nextSelectedVisitId,
          checklistByVisit: nextChecklistByVisit,
          outcomesByVisit: nextOutcomesByVisit,
          route: {
            ...state.planner.route,
            visitedVisitIds: state.planner.route.visitedVisitIds.filter(
              (visitId) => visitId !== action.payload,
            ),
          },
        },
      };
    }
    case "REPLACE_PLANNER_VISITS": {
      const visits = action.payload.map((visit, index) => ({
        ...visit,
        order: index + 1,
      }));
      const route = sanitizePlannerRouteForVisits(state.planner.route, visits);
      return {
        ...state,
        planner: {
          ...state.planner,
          visits,
          selectedVisitId: visits[0]?.id || null,
          route,
        },
      };
    }
    case "MOVE_PLANNER_VISIT": {
      const nextVisits = [...state.planner.visits];
      const [removed] = nextVisits.splice(action.payload.dragIndex, 1);
      nextVisits.splice(action.payload.hoverIndex, 0, removed);
      return {
        ...state,
        planner: {
          ...state.planner,
          visits: nextVisits.map((visit, index) => ({
            ...visit,
            order: index + 1,
          })),
        },
      };
    }
    case "UPDATE_PLANNER_VISIT":
      return {
        ...state,
        planner: {
          ...state.planner,
          visits: state.planner.visits.map((visit) =>
            visit.id === action.payload.visitId
              ? {
                  ...visit,
                  ...action.payload.patch,
                }
              : visit,
          ),
        },
      };
    case "SELECT_PLANNER_VISIT":
      return {
        ...state,
        planner: {
          ...state.planner,
          selectedVisitId: action.payload,
        },
      };
    case "SET_PLANNER_FILTERS":
      return {
        ...state,
        planner: {
          ...state.planner,
          searchQuery: action.payload.searchQuery ?? state.planner.searchQuery,
          filterPreset: action.payload.filterPreset ?? state.planner.filterPreset,
        },
      };
    case "SET_VISIT_CHECKLIST":
      return {
        ...state,
        planner: {
          ...state.planner,
          checklistByVisit: {
            ...state.planner.checklistByVisit,
            [action.payload.visitId]: {
              reviewKpis: false,
              prepareTalkingPoints: false,
              reviewLastNotes: false,
              ...(state.planner.checklistByVisit[action.payload.visitId] || {}),
              ...action.payload.patch,
            },
          },
        },
      };
    case "SET_VISIT_OUTCOME":
      return {
        ...state,
        planner: {
          ...state.planner,
          outcomesByVisit: {
            ...state.planner.outcomesByVisit,
            [action.payload.visitId]: action.payload.outcome,
          },
        },
      };
    case "MARK_PLANNER_VISIT_VISITED": {
      if (!state.planner.visits.some((visit) => visit.id === action.payload.visitId)) {
        return state;
      }
      if (state.planner.route.visitedVisitIds.includes(action.payload.visitId)) {
        return state;
      }
      return {
        ...state,
        planner: {
          ...state.planner,
          route: {
            ...state.planner.route,
            visitedVisitIds: [...state.planner.route.visitedVisitIds, action.payload.visitId],
            routeRevision: state.planner.route.routeRevision + 1,
            lastRecalculatedAt: action.payload.recalculatedAt,
            lastRecalculationReason: "visit-completed",
          },
        },
      };
    }
    case "RECALCULATE_PLANNER_ROUTE":
      return {
        ...state,
        planner: {
          ...state.planner,
          route: {
            ...state.planner.route,
            routeRevision: state.planner.route.routeRevision + 1,
            lastRecalculatedAt: action.payload.recalculatedAt,
            lastRecalculationReason: action.payload.reason,
          },
        },
      };
    case "SET_PLANNER_AUTOSAVE":
      return {
        ...state,
        planner: {
          ...state.planner,
          autosave: {
            ...state.planner.autosave,
            ...action.payload,
          },
        },
      };
    case "SELECT_MEETING_PREP_AGENCY":
      return {
        ...state,
        meetingPrep: {
          ...state.meetingPrep,
          selectedAgencyId: action.payload,
        },
      };
    case "UPDATE_MEETING_PREP_DRAFT":
      return {
        ...state,
        meetingPrep: {
          ...state.meetingPrep,
          ...action.payload,
        },
      };
    case "SET_MEETING_FLOW_SELECTION":
      return {
        ...state,
        meetingFlow: setSelectedMeetingId(state.meetingFlow, action.payload),
      };
    case "SET_RECOMMENDATION_DECISION":
      return {
        ...state,
        meetingFlow: applyRecommendationDecision(state.meetingFlow, action.payload),
      };
    case "UPSERT_POST_MEETING_REPORT":
      return {
        ...state,
        meetingFlow: upsertPostMeetingReportEntry(state.meetingFlow, action.payload),
      };
    case "UPSERT_RECOMMENDATION_OUTCOME":
      return {
        ...state,
        meetingFlow: upsertRecommendationOutcomeEntry(state.meetingFlow, action.payload),
      };
    case "UPSERT_VALIDATION_FLAG":
      return {
        ...state,
        meetingFlow: upsertValidationFlagEntry(state.meetingFlow, action.payload),
      };
    case "SET_TASK_FILTERS":
      return {
        ...state,
        tasks: {
          ...state.tasks,
          ...action.payload,
        },
      };
    case "UPSERT_TASKS": {
      const byId = new Map(state.tasks.tasks.map((task) => [task.id, task]));
      for (const task of action.payload.tasks) {
        byId.set(task.id, task);
      }
      const userCreatedTaskIds = action.payload.markAsUserCreated
        ? Array.from(
            new Set([
              ...state.tasks.userCreatedTaskIds,
              ...action.payload.tasks.map((task) => task.id),
            ]),
          )
        : state.tasks.userCreatedTaskIds;
      return {
        ...state,
        tasks: {
          ...state.tasks,
          tasks: Array.from(byId.values()),
          userCreatedTaskIds,
          lastSyncedAt: new Date().toISOString(),
        },
      };
    }
    case "UPDATE_TASK": {
      let found = false;
      const nextTasks = state.tasks.tasks.map((task) => {
        if (task.id !== action.payload.taskId) {
          return task;
        }
        found = true;
        return {
          ...task,
          ...action.payload.patch,
        };
      });

      if (!found) {
        return state;
      }

      return {
        ...state,
        tasks: {
          ...state.tasks,
          tasks: nextTasks,
          lastSyncedAt: new Date().toISOString(),
        },
      };
    }
    case "REMOVE_TASK":
      return {
        ...state,
        tasks: {
          ...state.tasks,
          tasks: state.tasks.tasks.filter((task) => task.id !== action.payload),
          selectedTaskIds: state.tasks.selectedTaskIds.filter((taskId) => taskId !== action.payload),
          userCreatedTaskIds: state.tasks.userCreatedTaskIds.filter((taskId) => taskId !== action.payload),
          lastSyncedAt: new Date().toISOString(),
        },
      };
    case "COMPLETE_TASK":
      return {
        ...state,
        tasks: {
          ...state.tasks,
          tasks: state.tasks.tasks.map((task) =>
            task.id === action.payload
              ? {
                  ...task,
                  status: "completed",
                }
              : task,
          ),
        },
      };
    case "SET_TASK_SELECTION":
      return {
        ...state,
        tasks: {
          ...state.tasks,
          selectedTaskIds: action.payload,
        },
      };
    case "UPDATE_ASSISTANT":
      return {
        ...state,
        assistant: {
          ...state.assistant,
          ...action.payload,
        },
      };
    case "APPEND_ASSISTANT_MESSAGE":
      return {
        ...state,
        assistant: {
          ...state.assistant,
          messages: [...state.assistant.messages, action.payload],
        },
      };
    case "REPLACE_ASSISTANT_MESSAGES":
      return {
        ...state,
        assistant: {
          ...state.assistant,
          messages: action.payload,
        },
      };
    case "SET_ASSISTANT_PENDING_ACTION":
      return {
        ...state,
        assistant: {
          ...state.assistant,
          pendingAction: action.payload,
        },
      };
    case "SET_ASSISTANT_MOBILE_OPEN":
      return {
        ...state,
        assistant: {
          ...state.assistant,
          mobileOpen: action.payload,
        },
      };
    case "SET_MUTATION":
      return {
        ...state,
        mutations: {
          ...state.mutations,
          [action.payload.key]: toMutationRecord(action.payload.status, action.payload.error),
        },
      };
    case "CLEAR_MUTATION": {
      const nextMutations = { ...state.mutations };
      delete nextMutations[action.payload];
      return {
        ...state,
        mutations: nextMutations,
      };
    }
    default:
      return state;
  }
}

function getDefaultVisitTimeWindow(preferred: "morning" | "afternoon" | "any"): string {
  if (preferred === "morning") {
    return "9:00 AM - 10:00 AM";
  }
  if (preferred === "afternoon") {
    return "2:00 PM - 3:00 PM";
  }
  return "11:00 AM - 12:00 PM";
}

function mergeTaskWorkspace(payload: Partial<TaskWorkspaceState>): TaskWorkspaceState {
  const taskIds = new Set((payload.tasks && payload.tasks.length > 0 ? payload.tasks : DEFAULT_TASK_WORKSPACE.tasks).map((task) => task.id));
  const userCreatedTaskIds = Array.isArray(payload.userCreatedTaskIds)
    ? payload.userCreatedTaskIds.filter(
        (taskId): taskId is string => typeof taskId === "string" && taskIds.has(taskId),
      )
    : [];

  return {
    ...DEFAULT_TASK_WORKSPACE,
    ...payload,
    tasks: payload.tasks && payload.tasks.length > 0 ? payload.tasks : DEFAULT_TASK_WORKSPACE.tasks,
    selectedTaskIds: payload.selectedTaskIds || [],
    userCreatedTaskIds,
  };
}

function mergeAssistantState(payload: Partial<AssistantState>): AssistantState {
  const messages = Array.isArray(payload.messages)
    ? payload.messages.filter(
        (message): message is AssistantMessage =>
          Boolean(message) &&
          typeof message.id === "string" &&
          (message.role === "assistant" || message.role === "user") &&
          typeof message.content === "string",
      )
    : [];

  const normalizedEvidenceMap: Record<string, string[]> = {};
  if (payload.lastEvidenceMap && typeof payload.lastEvidenceMap === "object") {
    for (const [key, references] of Object.entries(payload.lastEvidenceMap)) {
      normalizedEvidenceMap[key] = Array.isArray(references)
        ? references.filter((entry): entry is string => typeof entry === "string")
        : [];
    }
  }

  const pendingAction =
    payload.pendingAction &&
    (payload.pendingAction.type === "meeting-prep" || payload.pendingAction.type === "daily-plan")
      ? {
          type: payload.pendingAction.type,
          prompt: payload.pendingAction.prompt || "",
          agencyId: payload.pendingAction.agencyId || null,
          preview: payload.pendingAction.preview || "",
        }
      : null;

  return {
    ...DEFAULT_ASSISTANT,
    ...payload,
    messages,
    draftInput: typeof payload.draftInput === "string" ? payload.draftInput : "",
    lastPrompt: typeof payload.lastPrompt === "string" ? payload.lastPrompt : "",
    lastTrace:
      payload.lastTrace &&
      typeof payload.lastTrace.runId === "string" &&
      typeof payload.lastTrace.provider === "string" &&
      typeof payload.lastTrace.model === "string"
        ? {
            runId: payload.lastTrace.runId,
            provider: payload.lastTrace.provider,
            model: payload.lastTrace.model,
            toolsUsed: Array.isArray(payload.lastTrace.toolsUsed)
              ? payload.lastTrace.toolsUsed.filter((tool): tool is string => typeof tool === "string")
              : [],
            warnings: Array.isArray(payload.lastTrace.warnings)
              ? payload.lastTrace.warnings.filter((warning): warning is string => typeof warning === "string")
              : [],
          }
        : null,
    lastEvidenceMap: normalizedEvidenceMap,
    lastError: typeof payload.lastError === "string" && payload.lastError ? payload.lastError : null,
    showTraceDetails: payload.showTraceDetails === true,
    pendingAction,
    mobileOpen: payload.mobileOpen === true,
  };
}

function normalizeMeetingPrepDraftState(
  payload: Partial<MeetingPrepDraftState> & {
    selectedAgencyIds?: unknown;
    sourceAgencyIds?: unknown;
  },
): MeetingPrepDraftState {
  const knownAgencyIds = new Set(mockAgencies.map((agency) => agency.agency_id));

  const selectedAgencyIdLegacy =
    Array.isArray(payload.selectedAgencyIds) && typeof payload.selectedAgencyIds[0] === "string"
      ? payload.selectedAgencyIds[0]
      : null;
  const sourceAgencyIdLegacy =
    Array.isArray(payload.sourceAgencyIds) && typeof payload.sourceAgencyIds[0] === "string"
      ? payload.sourceAgencyIds[0]
      : null;

  const selectedAgencyIdCandidate =
    typeof payload.selectedAgencyId === "string" ? payload.selectedAgencyId : selectedAgencyIdLegacy;
  const sourceAgencyIdCandidate =
    typeof payload.sourceAgencyId === "string" ? payload.sourceAgencyId : sourceAgencyIdLegacy;

  const selectedAgencyId =
    selectedAgencyIdCandidate && knownAgencyIds.has(selectedAgencyIdCandidate)
      ? selectedAgencyIdCandidate
      : null;
  const sourceAgencyId =
    sourceAgencyIdCandidate && knownAgencyIds.has(sourceAgencyIdCandidate)
      ? sourceAgencyIdCandidate
      : null;

  return {
    ...DEFAULT_MEETING_PREP,
    template:
      typeof payload.template === "string" && payload.template
        ? payload.template
        : DEFAULT_MEETING_PREP.template,
    tone:
      payload.tone === "friendly" || payload.tone === "consultative" || payload.tone === "assertive"
        ? payload.tone
        : DEFAULT_MEETING_PREP.tone,
    length:
      payload.length === "short" || payload.length === "medium" || payload.length === "long"
        ? payload.length
        : DEFAULT_MEETING_PREP.length,
    includeBenchmarks:
      typeof payload.includeBenchmarks === "boolean"
        ? payload.includeBenchmarks
        : DEFAULT_MEETING_PREP.includeBenchmarks,
    generatedOutput:
      typeof payload.generatedOutput === "string"
        ? payload.generatedOutput
        : DEFAULT_MEETING_PREP.generatedOutput,
    generatedAt:
      typeof payload.generatedAt === "string" ? payload.generatedAt : DEFAULT_MEETING_PREP.generatedAt,
    selectedAgencyId,
    sourceAgencyId,
  };
}

function buildInitialState(): AppState {
  const settings = readStorageJson<SettingsState>(SETTINGS_KEY, DEFAULT_SETTINGS);
  const planner = readStorageJson<Partial<PlannerDraftState>>(PLANNER_KEY, {});
  const meetingPrep = normalizeMeetingPrepDraftState(
    readStorageJson<
      Partial<MeetingPrepDraftState> & {
        selectedAgencyIds?: unknown;
        sourceAgencyIds?: unknown;
      }
    >(MEETING_PREP_KEY, {}),
  );
  const meetingFlow = mergeMeetingFlowDraftState(
    DEFAULT_MEETING_FLOW,
    readStorageJson<Partial<MeetingFlowDraftState>>(MEETING_FLOW_KEY, {}),
  );
  const tasks = mergeTaskWorkspace(readStorageJson<Partial<TaskWorkspaceState>>(TASK_WORKSPACE_KEY, {}));
  const assistant = mergeAssistantState(readStorageJson<Partial<AssistantState>>(ASSISTANT_KEY, {}));
  const initialVisits =
    Array.isArray(planner.visits) ? planner.visits : DEFAULT_PLANNER.visits;
  const initialRoute = sanitizePlannerRouteForVisits(
    normalizePlannerRoute(planner.route),
    initialVisits,
  );
  const initialSelectedVisitId =
    typeof planner.selectedVisitId === "string" &&
    initialVisits.some((visit) => visit.id === planner.selectedVisitId)
      ? planner.selectedVisitId
      : initialVisits[0]?.id || null;

  return {
    session: {
      ...DEFAULT_SESSION,
      language: settings.language,
    },
    settings,
    planner: {
      ...DEFAULT_PLANNER,
      ...planner,
      visits: initialVisits,
      selectedVisitId: initialSelectedVisitId,
      autosave: {
        ...DEFAULT_AUTOSAVE,
        ...(planner.autosave || {}),
      },
      route: initialRoute,
    },
    meetingPrep,
    meetingFlow,
    tasks,
    assistant,
    mutations: {},
  };
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function normalizeVisits(raw: unknown): DailyPlanVisit[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const normalized: DailyPlanVisit[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const row = item as Partial<DailyPlanVisit> & Record<string, unknown>;
    const agencyId = typeof row.agency_id === "string" ? row.agency_id : "";
    if (!agencyId) {
      continue;
    }

    normalized.push({
      id: typeof row.id === "string" && row.id ? row.id : `V${Date.now()}${normalized.length}`,
      agency_id: agencyId,
      goal:
        row.goal === "renewal" || row.goal === "claims" || row.goal === "cross-sell"
          ? row.goal
          : "relationship",
      time_window: typeof row.time_window === "string" ? row.time_window : "11:00 AM - 12:00 PM",
      notes: typeof row.notes === "string" ? row.notes : "",
      order: typeof row.order === "number" ? row.order : normalized.length + 1,
    });
  }

  return normalized.map((visit, index) => ({ ...visit, order: index + 1 }));
}

function normalizeChecklistByVisit(raw: unknown): Record<string, VisitChecklist> {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const normalized: Record<string, VisitChecklist> = {};
  for (const [visitId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== "object") {
      continue;
    }
    const input = value as Partial<VisitChecklist>;
    normalized[visitId] = {
      reviewKpis: input.reviewKpis === true,
      prepareTalkingPoints: input.prepareTalkingPoints === true,
      reviewLastNotes: input.reviewLastNotes === true,
    };
  }
  return normalized;
}

function normalizeOutcomesByVisit(raw: unknown): Record<string, VisitOutcome> {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const normalized: Record<string, VisitOutcome> = {};
  for (const [visitId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value === "success" || value === "neutral" || value === "risk") {
      normalized[visitId] = value;
      continue;
    }
    normalized[visitId] = "unknown";
  }
  return normalized;
}

function restoreSessionFromStorage(settingsLanguage: AppLanguage): SessionState {
  const stored = readStorageJson<StoredSession | null>(SESSION_KEY, null);
  if (!stored) {
    return {
      ...DEFAULT_SESSION,
      status: "anonymous",
      language: settingsLanguage,
    };
  }

  const expiry = new Date(stored.sessionExpiry).getTime();
  if (!Number.isFinite(expiry) || expiry <= Date.now()) {
    removeStorageKey(SESSION_KEY);
    return {
      ...DEFAULT_SESSION,
      status: "anonymous",
      language: settingsLanguage,
    };
  }

  return {
    status: "authenticated",
    user: stored.user,
    token: stored.token,
    sessionExpiry: stored.sessionExpiry,
    language: stored.language,
  };
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);
  const plannerHydrationTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      const restored = restoreSessionFromStorage(state.settings.language);
      if (restored.status !== "authenticated" || !restored.token) {
        dispatch({
          type: "BOOTSTRAP_SESSION",
          payload: restored,
        });
        return;
      }

      try {
        const me = await getCurrentUser();
        dispatch({
          type: "BOOTSTRAP_SESSION",
          payload: {
            status: "authenticated",
            user: {
              id: me.user.user_id,
              role: me.user.role,
              name: me.user.full_name,
              email: me.user.email,
              portfolioScope: me.user.portfolio_scope,
            },
            token: restored.token,
            language: restored.language,
            sessionExpiry: me.session_expires_at,
          },
        });
      } catch {
        removeStorageKey(SESSION_KEY);
        dispatch({
          type: "BOOTSTRAP_SESSION",
          payload: {
            ...DEFAULT_SESSION,
            status: "anonymous",
            language: state.settings.language,
          },
        });
      }
    };

    void bootstrap();
  }, []);

  useEffect(() => {
    if (state.session.status === "authenticated" && state.session.user && state.session.token && state.session.sessionExpiry) {
      writeStorageJson<StoredSession>(SESSION_KEY, {
        user: state.session.user,
        token: state.session.token,
        sessionExpiry: state.session.sessionExpiry,
        language: state.session.language,
      });
      return;
    }

    if (state.session.status !== "bootstrapping") {
      removeStorageKey(SESSION_KEY);
    }
  }, [state.session]);

  useEffect(() => {
    writeStorageJson(SETTINGS_KEY, state.settings);
  }, [state.settings]);

  useEffect(() => {
    writeStorageJson(PLANNER_KEY, state.planner);
  }, [state.planner]);

  useEffect(() => {
    writeStorageJson(MEETING_PREP_KEY, state.meetingPrep);
  }, [state.meetingPrep]);

  useEffect(() => {
    writeStorageJson(MEETING_FLOW_KEY, state.meetingFlow);
  }, [state.meetingFlow]);

  useEffect(() => {
    writeStorageJson(TASK_WORKSPACE_KEY, state.tasks);
  }, [state.tasks]);

  useEffect(() => {
    writeStorageJson(ASSISTANT_KEY, {
      ...state.assistant,
      mobileOpen: false,
    });
  }, [state.assistant]);

  useEffect(() => {
    if (state.session.status !== "authenticated" || !state.session.token) {
      plannerHydrationTokenRef.current = null;
      return;
    }

    if (plannerHydrationTokenRef.current === state.session.token) {
      return;
    }

    plannerHydrationTokenRef.current = state.session.token;

    const hydratePlanner = async () => {
      try {
        const current = await getCurrentWorkflowDailyPlan({ plan_date: todayIsoDate() });
        const planJson = current.plan_json || {};

        dispatch({
          type: "HYDRATE_PLANNER_FROM_BACKEND",
          payload: {
            visits: normalizeVisits((planJson as Record<string, unknown>).visits),
            checklistByVisit: normalizeChecklistByVisit(
              (planJson as Record<string, unknown>).checklist_by_visit,
            ),
            outcomesByVisit: normalizeOutcomesByVisit(
              (planJson as Record<string, unknown>).outcomes_by_visit,
            ),
            planId: current.plan_id,
            savedAt: current.updated_at,
          },
        });
      } catch (error) {
        const message = resolveMutationError(error, "");
        if (message.toLowerCase().includes("not found")) {
          dispatch({
            type: "HYDRATE_PLANNER_FROM_BACKEND",
            payload: {
              visits: DEFAULT_PLANNER.visits,
              checklistByVisit: {},
              outcomesByVisit: {},
              planId: null,
              savedAt: null,
            },
          });
          return;
        }
      }
    };

    void hydratePlanner();
  }, [state.session.status, state.session.token]);

  const login = useCallback(async (payload: LoginPayload): Promise<LoginResult> => {
    try {
      const response = await loginRequest({
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        role: payload.role,
        language: payload.language,
        portfolio_scope: payload.portfolioScope || undefined,
      });

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          status: "authenticated",
          user: {
            id: response.user.user_id,
            role: response.user.role,
            name: response.user.full_name,
            email: response.user.email,
            portfolioScope: response.user.portfolio_scope,
          },
          token: response.token,
          language: payload.language,
          sessionExpiry: response.expires_at,
        },
      });

      return {
        ok: true,
        message: "Session started.",
      };
    } catch (error) {
      return {
        ok: false,
        message: resolveMutationError(error, "Invalid credentials for selected role."),
      };
    }
  }, []);

  const logout = useCallback(() => {
    const performLogout = async () => {
      try {
        await logoutRequest();
      } catch {
        // Continue with local logout to avoid trapping users in stale sessions.
      } finally {
        dispatch({ type: "LOGOUT" });
        removeStorageKey(SESSION_KEY);
        removeStorageKey(PLANNER_KEY);
        removeStorageKey(MEETING_PREP_KEY);
        removeStorageKey(MEETING_FLOW_KEY);
        removeStorageKey(TASK_WORKSPACE_KEY);
        removeStorageKey(ASSISTANT_KEY);
      }
    };

    void performLogout();
  }, []);

  const applySettings = useCallback((next: SettingsState) => {
    dispatch({ type: "APPLY_SETTINGS", payload: next });
  }, []);

  const addAgencyToPlan = useCallback(
    (agencyId: string): boolean => {
      if (state.planner.visits.some((visit) => visit.agency_id === agencyId)) {
        return false;
      }

      const agency = mockAgencies.find((item) => item.agency_id === agencyId);
      if (!agency) {
        return false;
      }

      const nextVisit: DailyPlanVisit = {
        id: `V${Date.now()}`,
        agency_id: agencyId,
        goal: "relationship",
        time_window: getDefaultVisitTimeWindow(agency.preferred_visit_time_window),
        notes: "",
        order: state.planner.visits.length + 1,
      };

      dispatch({ type: "ADD_PLANNER_VISIT", payload: nextVisit });
      return true;
    },
    [state.planner.visits],
  );

  const removePlannerVisit = useCallback(
    (visitId: string): boolean => {
      if (!state.planner.visits.some((visit) => visit.id === visitId)) {
        return false;
      }

      dispatch({ type: "REMOVE_PLANNER_VISIT", payload: visitId });
      return true;
    },
    [state.planner.visits],
  );

  const replacePlannerVisits = useCallback((visits: DailyPlanVisit[]) => {
    dispatch({ type: "REPLACE_PLANNER_VISITS", payload: visits });
  }, []);

  const movePlannerVisit = useCallback((dragIndex: number, hoverIndex: number) => {
    dispatch({ type: "MOVE_PLANNER_VISIT", payload: { dragIndex, hoverIndex } });
  }, []);

  const updatePlannerVisit = useCallback((visitId: string, patch: Partial<DailyPlanVisit>) => {
    dispatch({ type: "UPDATE_PLANNER_VISIT", payload: { visitId, patch } });
  }, []);

  const selectPlannerVisit = useCallback((visitId: string | null) => {
    dispatch({ type: "SELECT_PLANNER_VISIT", payload: visitId });
  }, []);

  const setPlannerFilters = useCallback((next: { searchQuery?: string; filterPreset?: string }) => {
    dispatch({ type: "SET_PLANNER_FILTERS", payload: next });
  }, []);

  const setVisitChecklist = useCallback((visitId: string, patch: Partial<VisitChecklist>) => {
    dispatch({ type: "SET_VISIT_CHECKLIST", payload: { visitId, patch } });
  }, []);

  const setVisitOutcome = useCallback((visitId: string, outcome: VisitOutcome) => {
    dispatch({ type: "SET_VISIT_OUTCOME", payload: { visitId, outcome } });
  }, []);

  const markPlannerVisitVisited = useCallback(
    (visitId: string): boolean => {
      if (!state.planner.visits.some((visit) => visit.id === visitId)) {
        return false;
      }
      if (state.planner.route.visitedVisitIds.includes(visitId)) {
        return false;
      }
      dispatch({
        type: "MARK_PLANNER_VISIT_VISITED",
        payload: {
          visitId,
          recalculatedAt: new Date().toISOString(),
        },
      });
      return true;
    },
    [state.planner.route.visitedVisitIds, state.planner.visits],
  );

  const recalculatePlannerRoute = useCallback(
    (reason: Exclude<PlannerRouteRecalculationReason, null> = "manual") => {
      dispatch({
        type: "RECALCULATE_PLANNER_ROUTE",
        payload: {
          reason,
          recalculatedAt: new Date().toISOString(),
        },
      });
    },
    [],
  );

  const setPlannerAutosave = useCallback((next: Partial<PlannerAutosave>) => {
    dispatch({ type: "SET_PLANNER_AUTOSAVE", payload: next });
  }, []);

  const selectMeetingPrepAgency = useCallback((agencyId: string | null) => {
    dispatch({ type: "SELECT_MEETING_PREP_AGENCY", payload: agencyId });
  }, []);

  const updateMeetingPrepDraft = useCallback((next: Partial<MeetingPrepDraftState>) => {
    dispatch({ type: "UPDATE_MEETING_PREP_DRAFT", payload: next });
  }, []);

  const selectMeetingFlowMeeting = useCallback((meetingId: string | null) => {
    dispatch({ type: "SET_MEETING_FLOW_SELECTION", payload: meetingId });
  }, []);

  const setRecommendationDecision = useCallback((input: RecommendationDecisionInput) => {
    dispatch({ type: "SET_RECOMMENDATION_DECISION", payload: input });
  }, []);

  const upsertPostMeetingReport = useCallback((report: PostMeetingReport) => {
    dispatch({ type: "UPSERT_POST_MEETING_REPORT", payload: report });
  }, []);

  const upsertRecommendationOutcome = useCallback((outcome: RecommendationOutcome) => {
    dispatch({ type: "UPSERT_RECOMMENDATION_OUTCOME", payload: outcome });
  }, []);

  const upsertValidationFlag = useCallback((flag: ValidationFlag) => {
    dispatch({ type: "UPSERT_VALIDATION_FLAG", payload: flag });
  }, []);

  const setTaskFilters = useCallback(
    (next: Partial<Pick<TaskWorkspaceState, "statusFilter" | "priorityFilter">>) => {
      dispatch({ type: "SET_TASK_FILTERS", payload: next });
    },
    [],
  );

  const completeTask = useCallback((taskId: string) => {
    dispatch({ type: "COMPLETE_TASK", payload: taskId });
  }, []);

  const upsertTasks = useCallback((tasks: Task[], options?: { markAsUserCreated?: boolean }) => {
    dispatch({
      type: "UPSERT_TASKS",
      payload: {
        tasks,
        markAsUserCreated: options?.markAsUserCreated === true,
      },
    });
  }, []);

  const updateTask = useCallback((taskId: string, patch: Partial<Omit<Task, "id">>) => {
    dispatch({ type: "UPDATE_TASK", payload: { taskId, patch } });
  }, []);

  const removeTask = useCallback((taskId: string) => {
    dispatch({ type: "REMOVE_TASK", payload: taskId });
  }, []);

  const setTaskSelection = useCallback((taskIds: string[]) => {
    dispatch({ type: "SET_TASK_SELECTION", payload: taskIds });
  }, []);

  const updateAssistant = useCallback((next: Partial<AssistantState>) => {
    dispatch({ type: "UPDATE_ASSISTANT", payload: next });
  }, []);

  const appendAssistantMessage = useCallback((message: AssistantMessage) => {
    dispatch({ type: "APPEND_ASSISTANT_MESSAGE", payload: message });
  }, []);

  const replaceAssistantMessages = useCallback((messages: AssistantMessage[]) => {
    dispatch({ type: "REPLACE_ASSISTANT_MESSAGES", payload: messages });
  }, []);

  const setAssistantPendingAction = useCallback((action: AssistantPendingAction | null) => {
    dispatch({ type: "SET_ASSISTANT_PENDING_ACTION", payload: action });
  }, []);

  const setAssistantMobileOpen = useCallback((isOpen: boolean) => {
    dispatch({ type: "SET_ASSISTANT_MOBILE_OPEN", payload: isOpen });
  }, []);

  const setMutationStatus = useCallback((key: string, status: MutationStatus, error: string | null = null) => {
    dispatch({
      type: "SET_MUTATION",
      payload: {
        key,
        status,
        error,
      },
    });
  }, []);

  const setMutationError = useCallback((key: string, error: unknown, fallback: string) => {
    dispatch({
      type: "SET_MUTATION",
      payload: {
        key,
        status: "error",
        error: resolveMutationError(error, fallback),
      },
    });
  }, []);

  const clearMutation = useCallback((key: string) => {
    dispatch({ type: "CLEAR_MUTATION", payload: key });
  }, []);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      login,
      logout,
      applySettings,
      addAgencyToPlan,
      removePlannerVisit,
      replacePlannerVisits,
      movePlannerVisit,
      updatePlannerVisit,
      selectPlannerVisit,
      setPlannerFilters,
      setVisitChecklist,
      setVisitOutcome,
      markPlannerVisitVisited,
      recalculatePlannerRoute,
      setPlannerAutosave,
      selectMeetingPrepAgency,
      updateMeetingPrepDraft,
      selectMeetingFlowMeeting,
      setRecommendationDecision,
      upsertPostMeetingReport,
      upsertRecommendationOutcome,
      upsertValidationFlag,
      setTaskFilters,
      completeTask,
      upsertTasks,
      updateTask,
      removeTask,
      setTaskSelection,
      updateAssistant,
      appendAssistantMessage,
      replaceAssistantMessages,
      setAssistantPendingAction,
      setAssistantMobileOpen,
      setMutationStatus,
      setMutationError,
      clearMutation,
    }),
    [
      state,
      login,
      logout,
      applySettings,
      addAgencyToPlan,
      removePlannerVisit,
      replacePlannerVisits,
      movePlannerVisit,
      updatePlannerVisit,
      selectPlannerVisit,
      setPlannerFilters,
      setVisitChecklist,
      setVisitOutcome,
      markPlannerVisitVisited,
      recalculatePlannerRoute,
      setPlannerAutosave,
      selectMeetingPrepAgency,
      updateMeetingPrepDraft,
      selectMeetingFlowMeeting,
      setRecommendationDecision,
      upsertPostMeetingReport,
      upsertRecommendationOutcome,
      upsertValidationFlag,
      setTaskFilters,
      completeTask,
      upsertTasks,
      updateTask,
      removeTask,
      setTaskSelection,
      updateAssistant,
      appendAssistantMessage,
      replaceAssistantMessages,
      setAssistantPendingAction,
      setAssistantMobileOpen,
      setMutationStatus,
      setMutationError,
      clearMutation,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}

export function getMutationStatus(state: AppState, key: string): MutationStatus {
  return state.mutations[key]?.status || IDLE_MUTATION.status;
}

export function getDefaultCredentials(role: UserRole): { email: string; password: string; language: AppLanguage } {
  const account = HARDCODED_USERS[role];
  return {
    email: account.email,
    password: account.password,
    language: "en",
  };
}
