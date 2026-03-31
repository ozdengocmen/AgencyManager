import { useCallback, useEffect, useState } from "react";
import { RotateCcw, Send, Sparkles } from "lucide-react";

import { generateDailyPlan, generateMeetingPrep } from "../api/agent";
import {
  formatDailyPlanAssistantText,
  formatMeetingNarrativeText,
  formatPortfolioSummaryAssistantText,
} from "../api/formatters";
import { getPortfolioSummary, listAgencies } from "../api/tools";
import { mockAgencies } from "../data/mockData";
import { useI18n, type I18nCopy } from "../i18n";
import {
  useAppState,
  type AppLanguage,
  type AssistantActionType,
  type AssistantMessage,
  type AssistantPendingAction,
  type AssistantTraceSummary,
} from "../state";
import { AIInteractionShell } from "./ai/AIInteractionShell";
import { classifyAssistantIntent, findAgencyIdFromPrompt, type AssistantIntent } from "./ai/assistantUtils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

interface AIAssistantProps {
  mode?: "dock" | "sheet";
  contextLabel?: string;
  contextHints?: string[];
}

interface AssistantResponsePayload {
  content: string;
  trace: AssistantTraceSummary | null;
  evidenceMap: Record<string, string[]>;
}

export function AIAssistant({
  contextLabel,
  contextHints = [],
}: AIAssistantProps) {
  const {
    state: { settings, assistant },
    updateAssistant,
    appendAssistantMessage,
    replaceAssistantMessages,
    setAssistantPendingAction,
  } = useAppState();
  const { copy: i18nCopy } = useI18n();
  const copy = i18nCopy.assistant;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const onlyWelcomeMessage =
      assistant.messages.length === 1 &&
      assistant.messages[0]?.id === "assistant-welcome" &&
      assistant.messages[0]?.role === "assistant";

    if (assistant.messages.length === 0) {
      replaceAssistantMessages([
        {
          id: "assistant-welcome",
          role: "assistant",
          content: copy.welcome,
        },
      ]);
      return;
    }

    if (onlyWelcomeMessage && assistant.messages[0]?.content !== copy.welcome) {
      replaceAssistantMessages([
        {
          id: "assistant-welcome",
          role: "assistant",
          content: copy.welcome,
        },
      ]);
    }
  }, [assistant.messages, copy.welcome, replaceAssistantMessages]);

  const appendAssistantReply = useCallback(
    (content: string) => {
      appendAssistantMessage(createMessage("assistant", content));
    },
    [appendAssistantMessage],
  );

  const executeIntent = useCallback(
    async (intent: AssistantIntent, prompt: string) => {
      setIsLoading(true);
      updateAssistant({
        lastError: null,
        showTraceDetails: false,
        lastTrace: null,
        lastEvidenceMap: {},
      });

      try {
        const response = await buildAssistantResponse(intent, prompt, settings.language, copy);
        appendAssistantReply(response.content);
        updateAssistant({
          lastPrompt: prompt,
          lastTrace: response.trace,
          lastEvidenceMap: response.evidenceMap,
          lastError: null,
          pendingAction: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : copy.requestFailed;
        appendAssistantReply(`${copy.requestFailedDetail}\n${message}`);
        updateAssistant({
          lastPrompt: prompt,
          lastError: message,
          lastTrace: null,
          lastEvidenceMap: {},
          pendingAction: null,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [appendAssistantReply, copy, settings.language, updateAssistant],
  );

  const queueActionConfirmation = useCallback(
    (actionType: AssistantActionType, prompt: string, agencyId: string | null) => {
      const resolvedAgencyId = resolveAgencyId(prompt, agencyId);
      const preview =
        actionType === "daily-plan"
          ? copy.actionPreviewDailyPlan
          : copy.actionPreviewMeetingPrep(resolvedAgencyId || "AG001");
      const pendingAction: AssistantPendingAction = {
        type: actionType,
        prompt,
        agencyId: resolvedAgencyId,
        preview,
      };
      setAssistantPendingAction(pendingAction);
      appendAssistantReply(`${copy.pendingActionDescription}\n${preview}`);
    },
    [appendAssistantReply, copy, setAssistantPendingAction],
  );

  const handleSend = useCallback(() => {
    if (!assistant.draftInput.trim() || isLoading) {
      return;
    }

    const prompt = assistant.draftInput.trim();
    appendAssistantMessage(createMessage("user", prompt));
    updateAssistant({
      draftInput: "",
      lastPrompt: prompt,
      lastError: null,
      showTraceDetails: false,
      lastTrace: null,
      lastEvidenceMap: {},
      pendingAction: null,
    });

    const intent = classifyAssistantIntent(prompt);
    if (intent.kind === "action") {
      queueActionConfirmation(intent.action, prompt, intent.agencyId);
      return;
    }

    void executeIntent(intent, prompt);
  }, [assistant.draftInput, appendAssistantMessage, executeIntent, isLoading, queueActionConfirmation, updateAssistant]);

  const handleRetry = useCallback(() => {
    if (!assistant.lastPrompt || isLoading) {
      return;
    }

    const intent = classifyAssistantIntent(assistant.lastPrompt);
    if (intent.kind === "action") {
      const agencyId = resolveAgencyId(assistant.lastPrompt, intent.agencyId);
      void executeIntent(
        {
          kind: "action",
          action: intent.action,
          agencyId,
        },
        assistant.lastPrompt,
      );
      return;
    }

    void executeIntent(intent, assistant.lastPrompt);
  }, [assistant.lastPrompt, executeIntent, isLoading]);

  const handleConfirmAction = useCallback(() => {
    if (!assistant.pendingAction || isLoading) {
      return;
    }

    const intent: AssistantIntent = {
      kind: "action",
      action: assistant.pendingAction.type,
      agencyId: assistant.pendingAction.agencyId,
    };
    void executeIntent(intent, assistant.pendingAction.prompt);
  }, [assistant.pendingAction, executeIntent, isLoading]);

  const handleCancelAction = useCallback(() => {
    if (!assistant.pendingAction) {
      return;
    }
    setAssistantPendingAction(null);
    appendAssistantReply(copy.actionCancelled);
  }, [appendAssistantReply, assistant.pendingAction, copy.actionCancelled, setAssistantPendingAction]);

  const handleRestartConversation = useCallback(() => {
    if (isLoading) {
      return;
    }

    replaceAssistantMessages([
      {
        id: "assistant-welcome",
        role: "assistant",
        content: copy.welcome,
      },
    ]);
    updateAssistant({
      draftInput: "",
      lastPrompt: "",
      lastError: null,
      showTraceDetails: false,
      lastTrace: null,
      lastEvidenceMap: {},
      pendingAction: null,
    });
  }, [copy.welcome, isLoading, replaceAssistantMessages, updateAssistant]);

  const shellStatus = isLoading
    ? "loading"
    : assistant.lastError
      ? "error"
      : assistant.lastTrace
        ? "success"
        : "idle";
  const showShell = shellStatus === "loading" || shellStatus === "error" || assistant.showTraceDetails;

  return (
    <Card className="relative flex h-full min-h-0 flex-col gap-0 rounded-none border-0 bg-white">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-3 right-14 z-10 h-8 w-8 text-slate-100 hover:bg-white/15 hover:text-white"
        onClick={handleRestartConversation}
        disabled={isLoading}
        aria-label={copy.restartConversation}
        title={copy.restartConversation}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <CardHeader className="shrink-0 border-b bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <CardTitle className="text-base text-white">{copy.title}</CardTitle>
        </div>
        <p className="text-xs text-slate-300">
          {copy.contextLabel}: {contextLabel || copy.noContext}
        </p>
        {contextHints.length > 0 ? (
          <div className="flex flex-wrap gap-1 pt-1">
            {contextHints.slice(0, 3).map((hint) => (
              <span
                key={hint}
                className="rounded bg-slate-700/80 px-2 py-0.5 text-[11px] text-slate-100"
              >
                {hint}
              </span>
            ))}
          </div>
        ) : null}
      </CardHeader>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4">
        <div className="w-full min-w-0 max-w-full space-y-4">
          {assistant.messages.map((message) => (
            <div
              key={message.id}
              className={`flex w-full min-w-0 max-w-full ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`w-fit min-w-0 max-w-full rounded-lg px-4 py-2 ${
                  message.role === "user" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-all [overflow-wrap:anywhere]">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
          {isLoading ? (
            <div className="flex w-full min-w-0 justify-start">
              <div className="w-fit min-w-0 max-w-full rounded-lg bg-slate-100 px-4 py-2 text-slate-900">
                <p className="text-sm whitespace-pre-wrap break-all [overflow-wrap:anywhere]">
                  {copy.working}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <CardContent className="shrink-0 space-y-3 border-t p-4">
        {assistant.pendingAction ? (
          <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-semibold">{copy.pendingActionTitle}</p>
            <p className="text-xs leading-5">{assistant.pendingAction.preview}</p>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleConfirmAction} disabled={isLoading}>
                {copy.confirmAction}
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancelAction} disabled={isLoading}>
                {copy.cancelAction}
              </Button>
            </div>
          </div>
        ) : null}
        <div className="flex gap-2">
          <Input
            placeholder={copy.askPlaceholder}
            value={assistant.draftInput}
            onChange={(event) => updateAssistant({ draftInput: event.target.value })}
            onKeyDown={(event) => event.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend} size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {shellStatus === "success" && assistant.lastTrace ? (
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            <span className="truncate">
              {copy.traceLabel}: {assistant.lastTrace.runId}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() =>
                updateAssistant({
                  showTraceDetails: !assistant.showTraceDetails,
                })
              }
            >
              {assistant.showTraceDetails ? copy.hideDetails : copy.details}
            </Button>
          </div>
        ) : null}
        {showShell ? (
          <div className="max-h-44 overflow-auto">
            <AIInteractionShell
              language={settings.language}
              status={shellStatus}
              error={assistant.lastError}
              trace={assistant.lastTrace}
              evidenceMap={assistant.lastEvidenceMap}
              onRetry={assistant.lastPrompt ? handleRetry : null}
              loadingText={copy.working}
            />
          </div>
        ) : null}
        <p className="text-xs text-slate-600">{copy.footer}</p>
      </CardContent>
    </Card>
  );
}

async function buildAssistantResponse(
  intent: AssistantIntent,
  prompt: string,
  language: AppLanguage,
  copy: I18nCopy["assistant"],
): Promise<AssistantResponsePayload> {
  if (intent.kind === "action" && intent.action === "daily-plan") {
    const result = await generateDailyPlan({
      language,
      max_visits: 4,
      save_result: false,
    });
    return {
      content: formatDailyPlanAssistantText(result.plan),
      trace: {
        runId: result.run_id,
        provider: result.provider,
        model: result.model,
        toolsUsed: result.tools_used,
        warnings: result.warnings,
      },
      evidenceMap: result.evidence_map,
    };
  }

  if (intent.kind === "action" && intent.action === "meeting-prep") {
    const targetAgencyId = resolveAgencyId(prompt, intent.agencyId) || "AG001";
    const result = await generateMeetingPrep({
      agency_id: targetAgencyId,
      tone: "consultative",
      language,
      save_result: false,
      additional_context: `UserPrompt=${prompt}`,
    });
    const agencyName =
      mockAgencies.find((agency) => agency.agency_id === targetAgencyId)?.agency_name || targetAgencyId;
    return {
      content: formatMeetingNarrativeText(result.narrative, {
        sectionTitle: copy.meetingSectionTitle(agencyName, targetAgencyId),
        includeBenchmarks: true,
        maxTalkTrackItems: 3,
        maxQuestions: 4,
      }),
      trace: {
        runId: result.run_id,
        provider: result.provider,
        model: result.model,
        toolsUsed: result.tools_used,
        warnings: result.warnings,
      },
      evidenceMap: result.evidence_map,
    };
  }

  if (intent.kind === "query" && intent.query === "portfolio") {
    const [summary, agencies] = await Promise.all([
      getPortfolioSummary(),
      listAgencies({ sort: "renewal_risk_first", limit: 3 }),
    ]);
    const riskAgencyNames = agencies.items
      .filter((item) => item.kpi.renewal_risk_flag)
      .map((item) => item.agency.agency_name);
    return {
      content: formatPortfolioSummaryAssistantText(summary, riskAgencyNames),
      trace: null,
      evidenceMap: {},
    };
  }

  const agencies = await listAgencies({ search: prompt, limit: 3 });
  if (agencies.items.length === 0) {
    return {
      content: copy.noDirectMatch,
      trace: null,
      evidenceMap: {},
    };
  }

  return {
    content: [
      copy.topAgencyMatches,
      ...agencies.items.map(
        (item) =>
          `- ${item.agency.agency_name} (${item.agency.agency_id}), renewal ${item.kpi.renewal_rate.toFixed(1)}%, health ${item.kpi.overall_health_score.toFixed(1)}`,
      ),
      "",
      copy.followUpHint,
    ].join("\n"),
    trace: null,
    evidenceMap: {},
  };
}

function resolveAgencyId(prompt: string, explicitAgencyId: string | null): string | null {
  if (explicitAgencyId) {
    return explicitAgencyId;
  }

  const promptAgencyId = findAgencyIdFromPrompt(prompt);
  if (promptAgencyId) {
    return promptAgencyId;
  }

  const normalizedPrompt = prompt.toLowerCase();
  const matchedAgency = mockAgencies.find((agency) =>
    normalizedPrompt.includes(agency.agency_name.toLowerCase()),
  );
  return matchedAgency?.agency_id || null;
}

function createMessage(role: AssistantMessage["role"], content: string): AssistantMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
  };
}
