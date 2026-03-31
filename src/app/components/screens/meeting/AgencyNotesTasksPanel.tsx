import { useMemo, useState } from "react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Textarea } from "../../ui/textarea";
import { Download, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { generateMeetingPrep } from "../../../api/agent";
import { formatMeetingNarrativeText } from "../../../api/formatters";
import { createTasks, saveMeetingPrep } from "../../../api/persistence";
import type { PersistenceTaskRecord } from "../../../api/types";
import type { Task } from "../../../data/mockData";
import { useI18n } from "../../../i18n";
import { useAppState } from "../../../state";
import { AIInteractionShell, type AIInteractionTrace } from "../../ai/AIInteractionShell";

interface AgencyNotesTasksPanelProps {
  agencyId: string;
  agencyName: string;
}

export function AgencyNotesTasksPanel({ agencyId, agencyName }: AgencyNotesTasksPanelProps) {
  const {
    state: { settings, session, tasks },
    upsertTasks,
    completeTask,
  } = useAppState();
  const { copy: i18nCopy } = useI18n();
  const meetingCopy = i18nCopy.meetingPrep;
  const agencyCopy = i18nCopy.agencyProfile;
  const tasksCopy = i18nCopy.tasksFollowUps;

  const [narrative, setNarrative] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  const [aiStatus, setAiStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiTrace, setAiTrace] = useState<AIInteractionTrace | null>(null);
  const [aiEvidenceMap, setAiEvidenceMap] = useState<Record<string, string[]>>({});

  const agencyTasks = useMemo(
    () =>
      tasks.tasks
        .filter((task) => task.agency_id === agencyId)
        .sort((left, right) => left.due_date.localeCompare(right.due_date) || left.id.localeCompare(right.id)),
    [agencyId, tasks.tasks],
  );

  const handleGenerateNotes = async () => {
    setIsGenerating(true);
    setAiStatus("loading");
    setAiError(null);

    try {
      const response = await generateMeetingPrep({
        agency_id: agencyId,
        user_id: session.user?.role,
        tone: settings.defaultTone,
        language: settings.language,
        additional_context: "Source=agency-profile; Output=meeting-notes",
        save_result: false,
      });

      const generatedNotes = formatMeetingNarrativeText(response.narrative, {
        sectionTitle: i18nCopy.assistant.meetingSectionTitle(agencyName, agencyId),
        includeBenchmarks: settings.includeBenchmarks,
        maxTalkTrackItems: 4,
        maxQuestions: 5,
      });
      setNarrative(generatedNotes);
      setAiTrace({
        runId: response.run_id,
        provider: response.provider,
        model: response.model,
        toolsUsed: response.tools_used,
        warnings: response.warnings,
      });
      setAiEvidenceMap(response.evidence_map);
      setAiStatus("success");
      toast.success(agencyCopy.meetingNotesPrepared);
    } catch (error) {
      const message = error instanceof Error ? error.message : agencyCopy.meetingNotesPreparationFailed;
      setAiStatus("error");
      setAiError(message);
      toast.error(`${agencyCopy.meetingNotesPreparationFailed}\n${message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveNarrative = async () => {
    if (!narrative.trim()) {
      toast.error(agencyCopy.narrativeGenerateBeforeSave);
      return;
    }

    setIsSaving(true);
    try {
      await saveMeetingPrep({
        agency_id: agencyId,
        narrative_json: {
          source: "agency-profile",
          generated_output: narrative,
          generated_at: new Date().toISOString(),
          tone: settings.defaultTone,
          language: settings.language,
        },
      });
      toast.success(agencyCopy.narrativeSaved);
    } catch (error) {
      const message = error instanceof Error ? error.message : agencyCopy.narrativeSaveFailed;
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateTasksFromNarrative = async () => {
    if (!narrative.trim()) {
      toast.error(agencyCopy.narrativeGenerateBeforeTasks);
      return;
    }

    const assignee = session.user?.role || "salesperson";
    const dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    setIsCreatingTasks(true);
    try {
      const result = await createTasks({
        tasks: [
          {
            agency_id: agencyId,
            assignee,
            title: agencyCopy.taskTitle,
            description: agencyCopy.taskDescription,
            due_date: dueDate,
            priority: "medium",
            status: "pending",
          },
        ],
      });
      upsertTasks(result.items.map(mapPersistenceTaskToTask));
      toast.success(agencyCopy.taskCreatedFromNarrative);
    } catch (error) {
      const message = error instanceof Error ? error.message : agencyCopy.taskCreateFailed;
      toast.error(message);
    } finally {
      setIsCreatingTasks(false);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
    toast.success(tasksCopy.taskCompleted);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{agencyCopy.meetingNarrativeBuilder}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleGenerateNotes} disabled={isGenerating}>
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? agencyCopy.preparingMeetingNotes : agencyCopy.prepareMeetingNotes}
            </Button>
            {narrative ? (
              <Button variant="outline" onClick={handleGenerateNotes} disabled={isGenerating}>
                {meetingCopy.regenerateWithConstraints}
              </Button>
            ) : null}
          </div>

          <AIInteractionShell
            language={settings.language}
            status={aiStatus}
            error={aiError}
            trace={aiTrace}
            evidenceMap={aiEvidenceMap}
            onRetry={() => {
              void handleGenerateNotes();
            }}
            loadingText={meetingCopy.generating}
            emptyText={meetingCopy.emptyState}
          >
            {narrative ? (
              <Textarea
                placeholder={agencyCopy.narrativePlaceholder}
                value={narrative}
                onChange={(event) => setNarrative(event.target.value)}
                className="min-h-[420px] font-mono text-sm"
              />
            ) : null}
          </AIInteractionShell>

          {narrative ? (
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSaveNarrative} disabled={isSaving}>
                <FileText className="w-4 h-4 mr-2" />
                {isSaving ? meetingCopy.saving : agencyCopy.saveToNotes}
              </Button>
              <Button variant="outline" onClick={handleCreateTasksFromNarrative} disabled={isCreatingTasks}>
                {isCreatingTasks ? meetingCopy.creating : agencyCopy.createTasksFromOutput}
              </Button>
              <Button variant="outline" onClick={() => toast.message(agencyCopy.exportPlanned)}>
                <Download className="w-4 h-4 mr-2" />
                {agencyCopy.exportAsPdf}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tasksCopy.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {agencyTasks.length === 0 ? (
            <p className="text-sm text-slate-600">{agencyCopy.notesTasksDescription}</p>
          ) : (
            agencyTasks.map((task) => (
              <div key={task.id} className="rounded-md border p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{task.title}</p>
                    <p className="text-xs text-slate-600">{task.description}</p>
                  </div>
                  {task.status !== "completed" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      {tasksCopy.completeTask}
                    </Button>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {tasksCopy.tableDueDate}: {new Date(task.due_date).toLocaleDateString(i18nCopy.locale)}
                  </Badge>
                  <Badge variant="secondary">{tasksCopy.statusLabel(task.status)}</Badge>
                  <Badge variant="outline">{tasksCopy.priorityLabel(task.priority)}</Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
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
    priority: task.priority,
    status: task.status,
  };
}
