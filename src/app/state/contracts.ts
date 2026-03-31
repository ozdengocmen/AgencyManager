export const screenStateContract = {
  login: {
    backend: ["auth login", "auth me", "auth logout"],
    localStorage: ["session"],
    transient: ["email input", "password input", "role selector"],
  },
  dashboard: {
    backend: ["agent/tool reads"],
    localStorage: [],
    transient: ["sorted priority feed view"],
  },
  agencies: {
    backend: ["tool reads"],
    localStorage: [],
    transient: ["search", "filters", "row selection"],
  },
  agencyProfile: {
    backend: ["tool reads", "meeting prep save", "task create"],
    localStorage: ["meeting prep draft"],
    transient: ["active tab", "chart interactions"],
  },
  dailyPlan: {
    backend: [
      "daily plan autosave",
      "daily plan restore on session",
      "meeting outcome log",
      "agent generation",
    ],
    localStorage: ["planner draft"],
    transient: ["candidate filter/search panel"],
  },
  meetingPrep: {
    backend: ["agent generation", "meeting prep save", "task create"],
    localStorage: ["meeting prep draft", "meeting flow draft"],
    transient: ["loading state"],
  },
  tasks: {
    backend: ["task list", "task create"],
    localStorage: ["task workspace filters", "local completion overrides"],
    transient: ["bulk selection"],
  },
  settings: {
    backend: [],
    localStorage: ["settings"],
    transient: ["unsaved form edits"],
  },
  assistant: {
    backend: ["agent generation", "tool reads"],
    localStorage: ["assistant thread", "assistant draft", "assistant trace metadata"],
    transient: ["current request loading"],
  },
} as const;
