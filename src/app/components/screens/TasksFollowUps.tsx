import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { Calendar, CheckCircle2, Circle, Clock, Sparkles } from "lucide-react";
import { createTasks, listTasks } from "../../api/persistence";
import type { PersistenceTaskRecord } from "../../api/types";
import { mockAgencies, type Task } from "../../data/mockData";
import { useI18n } from "../../i18n";
import { getMutationStatus, resolveMutationError, useAppState, useServerCache } from "../../state";
import { toast } from "sonner";
import { TaskEditorDialog, type TaskEditorFormState } from "./TaskEditorDialog";
import { getOpenInAssistantLabel, openInAssistant } from "../ai/assistantUtils";

const MUTATION_LOAD_TASKS = "tasks.load";
const MUTATION_CREATE_TASK = "tasks.create";

export function TasksFollowUps() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    state,
    setTaskFilters,
    completeTask,
    upsertTasks,
    updateTask,
    removeTask,
    setTaskSelection,
    setMutationStatus,
    setMutationError,
  } = useAppState();
  const { get, set } = useServerCache();
  const { tasks, session, settings } = state;
  const { copy: i18nCopy } = useI18n();
  const copy = i18nCopy.tasksFollowUps;
  const openAssistantLabel = getOpenInAssistantLabel(settings.language);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskDialogMode, setTaskDialogMode] = useState<"create" | "edit">("create");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState<TaskEditorFormState>(() => ({
    agencyId: mockAgencies[0]?.agency_id || "",
    title: "",
    dueDate: getDefaultDueDate(),
    priority: "medium",
  }));

  const isLoading = getMutationStatus(state, MUTATION_LOAD_TASKS) === "loading";
  const isCreatingTask = getMutationStatus(state, MUTATION_CREATE_TASK) === "loading";
  const selectedAgencyFromSelection = tasks.selectedTaskIds[0]
    ? tasks.tasks.find((task) => task.id === tasks.selectedTaskIds[0])?.agency_id || mockAgencies[0]?.agency_id || ""
    : mockAgencies[0]?.agency_id || "";
  const taskCacheKey = session.user ? `tasks:${session.user.role}` : null;

  useEffect(() => {
    if (session.status !== "authenticated" || !session.user) {
      return;
    }

    const cacheKey = `tasks:${session.user.role}`;
    const cached = get<Task[]>(cacheKey);
    if (cached) {
      upsertTasks(cached);
      return;
    }

    const loadTasks = async () => {
      setMutationStatus(MUTATION_LOAD_TASKS, "loading", null);
      try {
        const response = await listTasks({ assignee: session.user?.role });
        const mapped = response.items.map(mapPersistenceTaskToTask);
        upsertTasks(mapped);
        set(cacheKey, mapped);
        setMutationStatus(MUTATION_LOAD_TASKS, "success", null);
      } catch (error) {
        setMutationError(MUTATION_LOAD_TASKS, error, copy.loadFailed);
      }
    };

    void loadTasks();
  }, [copy.loadFailed, get, session.status, session.user, set, setMutationError, setMutationStatus, upsertTasks]);

  const syncTaskCache = useCallback(
    (nextTasks: Task[]) => {
      if (!taskCacheKey) {
        return;
      }
      set(taskCacheKey, nextTasks);
    },
    [set, taskCacheKey],
  );

  const openCreateTaskDialog = useCallback(() => {
    setTaskDialogMode("create");
    setEditingTaskId(null);
    setTaskForm({
      agencyId: selectedAgencyFromSelection,
      title: "",
      dueDate: getDefaultDueDate(),
      priority: "medium",
    });
    setIsTaskDialogOpen(true);
  }, [selectedAgencyFromSelection]);

  const openEditTaskDialog = useCallback((task: Task) => {
    setTaskDialogMode("edit");
    setEditingTaskId(task.id);
    setTaskForm({
      agencyId: task.agency_id,
      title: task.title,
      dueDate: task.due_date,
      priority: task.priority,
    });
    setIsTaskDialogOpen(true);
  }, []);

  const handleTaskDialogChange = useCallback((patch: Partial<TaskEditorFormState>) => {
    setTaskForm((current) => ({
      ...current,
      ...patch,
    }));
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.tasks.filter((task) => {
      if (tasks.statusFilter !== "all" && task.status !== tasks.statusFilter) {
        return false;
      }
      if (tasks.priorityFilter !== "all" && task.priority !== tasks.priorityFilter) {
        return false;
      }
      return true;
    });
  }, [tasks.priorityFilter, tasks.statusFilter, tasks.tasks]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Circle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default" as const,
      "in-progress": "secondary" as const,
      pending: "outline" as const,
    };
    return variants[status as keyof typeof variants] || "outline";
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "destructive" as const,
      medium: "secondary" as const,
      low: "outline" as const,
    };
    return variants[priority as keyof typeof variants] || "outline";
  };

  const toggleTask = (taskId: string) => {
    if (tasks.selectedTaskIds.includes(taskId)) {
      setTaskSelection(tasks.selectedTaskIds.filter((item) => item !== taskId));
      return;
    }
    setTaskSelection([...tasks.selectedTaskIds, taskId]);
  };

  const toggleAll = () => {
    if (tasks.selectedTaskIds.length === filteredTasks.length) {
      setTaskSelection([]);
      return;
    }
    setTaskSelection(filteredTasks.map((task) => task.id));
  };

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
    toast.success(copy.taskCompleted);
  };

  const handleSaveTask = async () => {
    if (!session.user) {
      return;
    }
    if (!taskForm.agencyId) {
      toast.error(copy.agencyRequired);
      return;
    }
    const trimmedTitle = taskForm.title.trim();
    if (!trimmedTitle) {
      toast.error(copy.titleRequired);
      return;
    }
    if (!taskForm.dueDate) {
      toast.error(copy.dueDateRequired);
      return;
    }

    if (taskDialogMode === "edit") {
      if (!editingTaskId) {
        return;
      }
      updateTask(editingTaskId, {
        agency_id: taskForm.agencyId,
        title: trimmedTitle,
        due_date: taskForm.dueDate,
        priority: taskForm.priority,
      });
      const nextTasks = tasks.tasks.map((task) =>
        task.id === editingTaskId
          ? {
              ...task,
              agency_id: taskForm.agencyId,
              title: trimmedTitle,
              due_date: taskForm.dueDate,
              priority: taskForm.priority,
            }
          : task,
      );
      syncTaskCache(nextTasks);
      toast.success(copy.taskUpdated);
      setIsTaskDialogOpen(false);
      return;
    }

    setMutationStatus(MUTATION_CREATE_TASK, "loading", null);
    try {
      const created = await createTasks({
        tasks: [
          {
            agency_id: taskForm.agencyId,
            assignee: session.user.role,
            title: trimmedTitle,
            description: "User-created task from Tasks workspace.",
            due_date: taskForm.dueDate,
            priority: taskForm.priority,
            status: "pending",
          },
        ],
      });

      const createdTasks = created.items.map(mapPersistenceTaskToTask);
      upsertTasks(createdTasks, { markAsUserCreated: true });
      syncTaskCache(mergeTasksById(tasks.tasks, createdTasks));
      toast.success(copy.taskCreated);
      setMutationStatus(MUTATION_CREATE_TASK, "success", null);
      setIsTaskDialogOpen(false);
    } catch (error) {
      setMutationError(MUTATION_CREATE_TASK, error, copy.taskCreateFailed);
      toast.error(resolveMutationError(error, copy.taskCreateFailed));
    }
  };

  const handleDeleteTask = () => {
    if (!editingTaskId) {
      return;
    }
    removeTask(editingTaskId);
    syncTaskCache(tasks.tasks.filter((task) => task.id !== editingTaskId));
    toast.success(copy.taskDeleted);
    setIsTaskDialogOpen(false);
  };

  const taskSummary = {
    pending: tasks.tasks.filter((task) => task.status === "pending").length,
    inProgress: tasks.tasks.filter((task) => task.status === "in-progress").length,
    completed: tasks.tasks.filter((task) => task.status === "completed").length,
    high: tasks.tasks.filter((task) => task.priority === "high").length,
    medium: tasks.tasks.filter((task) => task.priority === "medium").length,
    low: tasks.tasks.filter((task) => task.priority === "low").length,
  };

  const handleOpenAssistant = () => {
    const selectedTasks = tasks.tasks.filter((task) => tasks.selectedTaskIds.includes(task.id));
    const contextTasks = (selectedTasks.length > 0 ? selectedTasks : tasks.tasks).slice(0, 5);
    const taskContext = contextTasks.map((task) => `${task.title} (${task.agency_id})`).join(", ");
    const prompt =
      settings.language === "tr"
        ? `Gorevleri onceliklendir ve takip aksiyonlari oner: ${taskContext}`
        : `Prioritize these follow-up tasks and suggest next actions: ${taskContext}`;
    openInAssistant(navigate, location, prompt);
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <div className="border-b bg-white px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{copy.title}</h1>
            <p className="text-slate-600 mt-1">{copy.subtitle(filteredTasks.length, isLoading)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleOpenAssistant}>
              <Sparkles className="w-4 h-4 mr-2" />
              {openAssistantLabel}
            </Button>
            <Button onClick={openCreateTaskDialog} disabled={isCreatingTask}>
              {isCreatingTask ? copy.creatingTask : copy.createTask}
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <Select
            value={tasks.statusFilter}
            onValueChange={(value) => setTaskFilters({ statusFilter: value as Task["status"] | "all" })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={copy.statusPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{copy.statusAll}</SelectItem>
              <SelectItem value="pending">{copy.statusPending}</SelectItem>
              <SelectItem value="in-progress">{copy.statusInProgress}</SelectItem>
              <SelectItem value="completed">{copy.statusCompleted}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={tasks.priorityFilter}
            onValueChange={(value) =>
              setTaskFilters({
                priorityFilter: value as Task["priority"] | "all",
              })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={copy.priorityPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{copy.priorityAll}</SelectItem>
              <SelectItem value="high">{copy.priorityHigh}</SelectItem>
              <SelectItem value="medium">{copy.priorityMedium}</SelectItem>
              <SelectItem value="low">{copy.priorityLow}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-blue-50 border-b px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-slate-900">{copy.aiAssistantTitle}</p>
              <p className="text-sm text-slate-600">{copy.aiAssistantDescription}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.message(copy.suggestionFlowPlanned)}>
              {copy.suggestTopFollowUps}
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.message(copy.riskSummaryFlowPlanned)}>
              {copy.summarizeOutstandingRisks}
            </Button>
          </div>
        </div>
      </div>

      <div className="w-max min-w-full p-8 space-y-8">
          <div>
            <Card className="min-w-[1080px]">
              <CardContent className="p-0">
                <Table className="min-w-[1080px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          filteredTasks.length > 0 && tasks.selectedTaskIds.length === filteredTasks.length
                        }
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>{copy.tableTask}</TableHead>
                    <TableHead>{copy.tableAgency}</TableHead>
                    <TableHead>{copy.tableDueDate}</TableHead>
                    <TableHead>{copy.tablePriority}</TableHead>
                    <TableHead>{copy.tableStatus}</TableHead>
                    <TableHead>{copy.tableActions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => {
                    const agency = mockAgencies.find((item) => item.agency_id === task.agency_id);
                    const dueDate = new Date(task.due_date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isOverdue = dueDate < today && task.status !== "completed";
                    const isUserCreated = tasks.userCreatedTaskIds.includes(task.id);

                    return (
                      <TableRow key={task.id}>
                        <TableCell>
                          <Checkbox
                            checked={tasks.selectedTaskIds.includes(task.id)}
                            onCheckedChange={() => toggleTask(task.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(task.status)}
                              <span className="font-medium">{task.title}</span>
                              {isUserCreated ? (
                                <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                                  {copy.userCreatedTag}
                                </Badge>
                              ) : null}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {agency && (
                            <Link to={`/app/agencies/${agency.agency_id}`} className="text-blue-600 hover:text-blue-700">
                              {agency.agency_name}
                            </Link>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                              {dueDate.toLocaleDateString(copy.dateLocale, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          {isOverdue && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              {copy.overdueBadge}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityBadge(task.priority)}>
                            {copy.priorityLabel(task.priority)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadge(task.status)}>
                            {copy.statusLabel(task.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {isUserCreated ? (
                              <Button variant="ghost" size="sm" onClick={() => openEditTaskDialog(task)}>
                                {copy.editTask}
                              </Button>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCompleteTask(task.id)}
                              disabled={task.status === "completed"}
                            >
                              {copy.completeTask}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{copy.taskSummaryTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{copy.pendingLabel}</span>
                    <span className="font-semibold">{taskSummary.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{copy.inProgressLabel}</span>
                    <span className="font-semibold">{taskSummary.inProgress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{copy.completedLabel}</span>
                    <span className="font-semibold">{taskSummary.completed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{copy.byPriorityTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{copy.highPriorityLabel}</span>
                    <span className="font-semibold text-red-600">{taskSummary.high}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{copy.mediumPriorityLabel}</span>
                    <span className="font-semibold text-amber-600">{taskSummary.medium}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{copy.lowPriorityLabel}</span>
                    <span className="font-semibold">{taskSummary.low}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{copy.aiInsightsTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">{copy.aiInsightSummary(taskSummary.high)}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => toast.message(copy.recommendationFlowPlanned)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {copy.getRecommendations}
                </Button>
              </CardContent>
            </Card>
          </div>
      </div>

      <TaskEditorDialog
        open={isTaskDialogOpen}
        mode={taskDialogMode}
        isCreating={isCreatingTask}
        canDelete={taskDialogMode === "edit" && Boolean(editingTaskId) && tasks.userCreatedTaskIds.includes(editingTaskId || "")}
        form={taskForm}
        agencies={mockAgencies}
        copy={copy}
        onOpenChange={setIsTaskDialogOpen}
        onFormChange={handleTaskDialogChange}
        onSave={() => {
          void handleSaveTask();
        }}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}

function mapPersistenceTaskToTask(task: PersistenceTaskRecord): Task {
  return {
    id: task.task_id,
    agency_id: task.agency_id,
    title: task.title,
    description: task.description,
    due_date: task.due_date,
    status: task.status,
    priority: task.priority,
  };
}

function getDefaultDueDate(): string {
  return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function mergeTasksById(current: Task[], incoming: Task[]): Task[] {
  const byId = new Map(current.map((task) => [task.id, task]));
  for (const task of incoming) {
    byId.set(task.id, task);
  }
  return Array.from(byId.values());
}
