import type { NavigateFunction } from "react-router";

import type { AppLanguage } from "../../state";
import type { AssistantActionType } from "../../state";

interface LocationLike {
  pathname: string;
  search: string;
}

export type AssistantIntent =
  | { kind: "action"; action: AssistantActionType; agencyId: string | null }
  | { kind: "query"; query: "portfolio" | "agency-search"; agencyId: string | null };

export function getOpenInAssistantLabel(language: AppLanguage): string {
  return language === "tr" ? "AI Asistaninda Ac" : "Open in AI Assistant";
}

export function openInAssistant(
  navigate: NavigateFunction,
  location: LocationLike,
  prompt: string,
): void {
  const params = new URLSearchParams(location.search);
  params.set("assistant", "open");
  params.set("assistant_prompt", prompt);
  navigate({
    pathname: location.pathname,
    search: `?${params.toString()}`,
  });
}

export function classifyAssistantIntent(prompt: string): AssistantIntent {
  const text = normalizeForIntent(prompt);
  const agencyId = findAgencyIdFromPrompt(prompt);
  const asksForMeeting =
    /(meeting|prep|narrative|agenda|toplanti|hazirlik|anlati|gundem|gorusme|ziyaret notu)/.test(text);
  const asksForDailyPlan =
    /(daily plan|route|visit plan|cluster|optimize|gunluk plan|rota|ziyaret plani|kume|optimiz)/.test(
      text,
    );
  const asksToPreparePlan = /(plan|program).*(hazirla|olustur|uret|generate|create|prepare)/.test(text);
  const mentionsSpecificAgency =
    /\b(agency|acente|ag\d{3}|this agency|bu acente|selected agency|secili acente)\b/.test(text) ||
    Boolean(agencyId);
  const asksForPortfolio =
    /(portfolio|risk|renewal|claims|benchmark|portfoy|yenileme|hasar|karsilastirma)/.test(text);

  if (asksForDailyPlan) {
    return {
      kind: "action",
      action: "daily-plan",
      agencyId,
    };
  }

  if (asksToPreparePlan && mentionsSpecificAgency) {
    return {
      kind: "action",
      action: "meeting-prep",
      agencyId,
    };
  }

  if (asksForMeeting) {
    return {
      kind: "action",
      action: "meeting-prep",
      agencyId,
    };
  }

  if (asksForPortfolio) {
    return {
      kind: "query",
      query: "portfolio",
      agencyId,
    };
  }

  return {
    kind: "query",
    query: "agency-search",
    agencyId,
  };
}

export function findAgencyIdFromPrompt(prompt: string): string | null {
  const match = prompt.match(/\bAG\d{3}\b/i);
  if (match) {
    return match[0].toUpperCase();
  }
  return null;
}

function normalizeForIntent(input: string): string {
  const lower = input.toLowerCase();
  const transliterated = lower
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ü", "u")
    .replaceAll("ç", "c");
  return transliterated.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
