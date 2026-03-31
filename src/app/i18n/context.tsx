import { createContext, useContext, useMemo, type ReactNode } from "react";

import { useAppState, type AppLanguage } from "../state";
import { getI18nCopy, type I18nCopy } from "./copy";

interface I18nContextValue {
  language: AppLanguage;
  copy: I18nCopy;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const {
    state: { settings },
  } = useAppState();

  const value = useMemo<I18nContextValue>(
    () => ({
      language: settings.language,
      copy: getI18nCopy(settings.language),
    }),
    [settings.language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
