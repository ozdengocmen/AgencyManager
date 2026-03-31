import type { ReactNode } from "react";

import { AlertTriangle, RotateCcw, Sparkles } from "lucide-react";

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import type { AppLanguage } from "../../state";

export interface AIInteractionTrace {
  runId: string;
  provider: string;
  model: string;
  toolsUsed: string[];
  warnings: string[];
}

interface AIInteractionShellProps {
  language: AppLanguage;
  status: "idle" | "loading" | "error" | "success";
  error: string | null;
  trace: AIInteractionTrace | null;
  evidenceMap?: Record<string, string[]>;
  onRetry?: (() => void) | null;
  loadingText?: string;
  emptyText?: string;
  children?: ReactNode;
}

const COPY = {
  en: {
    aiGenerated: "AI generated",
    loading: "Generating AI output...",
    failed: "AI request failed",
    retry: "Retry",
    runId: "Run ID",
    provider: "Provider",
    model: "Model",
    toolsUsed: "Tools used",
    warnings: "Warnings",
    none: "None",
    whyThisOutput: "Why this output?",
  },
  tr: {
    aiGenerated: "Yapay zeka uretimi",
    loading: "Yapay zeka cikti uretiyor...",
    failed: "Yapay zeka istegi basarisiz oldu",
    retry: "Tekrar dene",
    runId: "Calisma ID",
    provider: "Saglayici",
    model: "Model",
    toolsUsed: "Kullanilan araclar",
    warnings: "Uyarilar",
    none: "Yok",
    whyThisOutput: "Bu cikti neden boyle?",
  },
} as const;

export function AIInteractionShell({
  language,
  status,
  error,
  trace,
  evidenceMap,
  onRetry,
  loadingText,
  emptyText,
  children,
}: AIInteractionShellProps) {
  const copy = COPY[language];
  const evidenceEntries = Object.entries(evidenceMap || {});
  const hasContent = Boolean(children);

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span>{copy.aiGenerated}</span>
        </div>
        {status === "success" && (
          <Badge variant="secondary" className="text-xs">
            {trace ? `${copy.runId}: ${trace.runId}` : copy.aiGenerated}
          </Badge>
        )}
      </div>

      {status === "loading" && (
        <p className="text-sm text-slate-600">{loadingText || copy.loading}</p>
      )}

      {status === "error" && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 text-sm text-rose-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error || copy.failed}</span>
            </div>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                {copy.retry}
              </Button>
            )}
          </div>
        </div>
      )}

      {trace && (
        <div className="grid gap-2 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700 md:grid-cols-2">
          <div>
            <span className="font-semibold">{copy.provider}:</span> {trace.provider}
          </div>
          <div>
            <span className="font-semibold">{copy.model}:</span> {trace.model}
          </div>
          <div className="md:col-span-2">
            <span className="font-semibold">{copy.toolsUsed}:</span>{" "}
            {trace.toolsUsed.length > 0 ? trace.toolsUsed.join(", ") : copy.none}
          </div>
          <div className="md:col-span-2">
            <span className="font-semibold">{copy.warnings}:</span>{" "}
            {trace.warnings.length > 0 ? trace.warnings.join(" | ") : copy.none}
          </div>
        </div>
      )}

      {evidenceEntries.length > 0 && (
        <div className="rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700">
          <p className="mb-2 font-semibold">{copy.whyThisOutput}</p>
          <ul className="space-y-1">
            {evidenceEntries.map(([key, references]) => (
              <li key={key}>
                <span className="font-medium">{key}:</span> {references.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasContent ? (
        <div>{children}</div>
      ) : (
        status === "idle" &&
        emptyText && <p className="text-sm text-slate-600">{emptyText}</p>
      )}
    </div>
  );
}
