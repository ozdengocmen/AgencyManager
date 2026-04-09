import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { useAppState, type SettingsState } from "../../state";
import { toast } from "sonner";
import { useI18n } from "../../i18n";
import { getSystemAIModels, getSystemAISettings, updateSystemAISettings } from "../../api/systemAI";
import type { SystemAISettingsDetail } from "../../api/types";

export function Settings() {
  const { copy, language } = useI18n();
  const {
    state: { settings, session },
    applySettings,
  } = useAppState();

  const [draft, setDraft] = useState<SettingsState>(settings);
  const [aiDraft, setAiDraft] = useState({
    enabled: true,
    model: "gpt-4.1-mini",
    baseUrl: "",
    apiKey: "",
    hasApiKey: false,
    maskedApiKey: "",
  });
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isSavingAI, setIsSavingAI] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  useEffect(() => {
    if (session.user?.role !== "manager") {
      return;
    }

    const loadSystemAI = async () => {
      setIsLoadingAI(true);
      try {
        const response = await getSystemAISettings();
        applyAISettingsToDraft(response, setAiDraft);
        void loadAIModels();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : getAICopy(language).loadError);
      } finally {
        setIsLoadingAI(false);
      }
    };

    void loadSystemAI();
  }, [language, session.user?.role]);

  const loadAIModels = async () => {
    setIsLoadingModels(true);
    try {
      const response = await getSystemAIModels();
      setAvailableModels(response.items);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : aiCopy.loadModelsError);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const updateDraft = (patch: Partial<SettingsState>) => {
    setDraft((current) => ({
      ...current,
      ...patch,
    }));
  };

  const handleSave = () => {
    applySettings(draft);
    toast.success(copy.settings.settingsSaved);
  };

  const handleCancel = () => {
    setDraft(settings);
    toast.message(copy.settings.changesReverted);
  };

  const aiCopy = getAICopy(language);

  const handleSaveAI = async () => {
    setIsSavingAI(true);
    try {
      const response = await updateSystemAISettings({
        provider: "openai",
        enabled: aiDraft.enabled,
        model: aiDraft.model.trim() || "gpt-4.1-mini",
        base_url: aiDraft.baseUrl.trim() || null,
        api_key: aiDraft.apiKey.trim() || null,
        retain_existing_api_key: !aiDraft.apiKey.trim(),
        clear_api_key: false,
      });
      applyAISettingsToDraft(response, setAiDraft);
      void loadAIModels();
      toast.success(aiCopy.saveSuccess);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : aiCopy.saveError);
    } finally {
      setIsSavingAI(false);
    }
  };

  const roleLabel = session.user?.role || "salesperson";

  return (
    <div className="flex-1 min-w-0">
      <div className="max-w-4xl p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{copy.settings.title}</h1>
            <p className="text-slate-600 mt-1">{copy.settings.subtitle}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{copy.settings.workPreferences}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">{copy.settings.language}</Label>
                <Select
                  value={draft.language}
                  onValueChange={(value) => updateDraft({ language: value as SettingsState["language"] })}
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="tr">Turkce</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-location">{copy.settings.defaultStartLocation}</Label>
                <Select
                  value={draft.startLocation}
                  onValueChange={(value) =>
                    updateDraft({ startLocation: value as SettingsState["startLocation"] })
                  }
                >
                  <SelectTrigger id="start-location">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office">{copy.settings.office}</SelectItem>
                    <SelectItem value="home">{copy.settings.home}</SelectItem>
                    <SelectItem value="manual">{copy.settings.manualEntry}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-600">{copy.settings.startLocationHint}</p>
              </div>

              <div className="space-y-2">
                <Label>{copy.settings.workingHours}</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time" className="text-sm text-slate-600">
                      {copy.settings.startTime}
                    </Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={draft.startTime}
                      onChange={(event) => updateDraft({ startTime: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time" className="text-sm text-slate-600">
                      {copy.settings.endTime}
                    </Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={draft.endTime}
                      onChange={(event) => updateDraft({ endTime: event.target.value })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{copy.settings.routePreferences}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="max-visits">{copy.settings.maxVisitsPerDay}</Label>
                <Input
                  id="max-visits"
                  type="number"
                  value={draft.maxVisitsPerDay}
                  min="1"
                  max="10"
                  onChange={(event) =>
                    updateDraft({
                      maxVisitsPerDay: Number(event.target.value) || draft.maxVisitsPerDay,
                    })
                  }
                />
                <p className="text-sm text-slate-600">
                  {copy.settings.maxVisitsHint}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-travel">{copy.settings.maxTravelHours}</Label>
                <Input
                  id="max-travel"
                  type="number"
                  value={draft.maxTravelHours}
                  min="1"
                  max="8"
                  step="0.5"
                  onChange={(event) =>
                    updateDraft({
                      maxTravelHours: Number(event.target.value) || draft.maxTravelHours,
                    })
                  }
                />
                <p className="text-sm text-slate-600">{copy.settings.maxTravelHint}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avg-visit">{copy.settings.avgVisitMinutes}</Label>
                <Input
                  id="avg-visit"
                  type="number"
                  value={draft.avgVisitMinutes}
                  min="15"
                  max="120"
                  step="15"
                  onChange={(event) =>
                    updateDraft({
                      avgVisitMinutes: Number(event.target.value) || draft.avgVisitMinutes,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{copy.settings.aiAssistantSettings}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{copy.settings.includeBenchmarks}</Label>
                  <p className="text-sm text-slate-600">
                    {copy.settings.includeBenchmarksHint}
                  </p>
                </div>
                <Switch
                  checked={draft.includeBenchmarks}
                  onCheckedChange={(checked) => updateDraft({ includeBenchmarks: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{copy.settings.autoGenerateNotes}</Label>
                  <p className="text-sm text-slate-600">
                    {copy.settings.autoGenerateNotesHint}
                  </p>
                </div>
                <Switch
                  checked={draft.autoGenerateMeetingNotes}
                  onCheckedChange={(checked) => updateDraft({ autoGenerateMeetingNotes: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{copy.settings.priorityNotifications}</Label>
                  <p className="text-sm text-slate-600">
                    {copy.settings.priorityNotificationsHint}
                  </p>
                </div>
                <Switch
                  checked={draft.priorityNotifications}
                  onCheckedChange={(checked) => updateDraft({ priorityNotifications: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-tone">{copy.settings.defaultTone}</Label>
                <Select
                  value={draft.defaultTone}
                  onValueChange={(value) => updateDraft({ defaultTone: value as SettingsState["defaultTone"] })}
                >
                  <SelectTrigger id="default-tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">{copy.settings.toneFriendly}</SelectItem>
                    <SelectItem value="consultative">{copy.settings.toneConsultative}</SelectItem>
                    <SelectItem value="assertive">{copy.settings.toneAssertive}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {session.user?.role === "manager" ? (
            <Card>
              <CardHeader>
                <CardTitle>{aiCopy.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{aiCopy.enabled}</Label>
                    <p className="text-sm text-slate-600">{aiCopy.enabledHint}</p>
                  </div>
                  <Switch
                    checked={aiDraft.enabled}
                    onCheckedChange={(checked) => setAiDraft((current) => ({ ...current, enabled: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-model">{aiCopy.model}</Label>
                  <select
                    id="ai-model"
                    value={aiDraft.model}
                    onChange={(event) => setAiDraft((current) => ({ ...current, model: event.target.value }))}
                    className="border-input bg-input-background flex h-9 w-full rounded-md border px-3 py-2 text-sm outline-none"
                  >
                    {(availableModels.length > 0 ? availableModels : ["gpt-4.1-mini"]).map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => void loadAIModels()} disabled={isLoadingModels}>
                      {isLoadingModels ? aiCopy.loadingModels : aiCopy.refreshModels}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-base-url">{aiCopy.baseUrl}</Label>
                  <Input
                    id="ai-base-url"
                    value={aiDraft.baseUrl}
                    onChange={(event) => setAiDraft((current) => ({ ...current, baseUrl: event.target.value }))}
                    placeholder="https://api.openai.com/v1"
                  />
                  <p className="text-sm text-slate-600">{aiCopy.baseUrlHint}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-api-key">{aiCopy.apiKey}</Label>
                  <Input
                    id="ai-api-key"
                    type="password"
                    value={aiDraft.apiKey}
                    onChange={(event) => setAiDraft((current) => ({ ...current, apiKey: event.target.value }))}
                    placeholder={aiDraft.hasApiKey ? aiDraft.maskedApiKey || "Stored key available" : "sk-..."}
                  />
                  <p className="text-sm text-slate-600">
                    {aiDraft.hasApiKey
                      ? aiCopy.apiKeyStored(aiDraft.maskedApiKey || "")
                      : aiCopy.apiKeyMissing}
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveAI} disabled={isLoadingAI || isSavingAI}>
                    {isSavingAI ? aiCopy.saving : aiCopy.save}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>{copy.settings.notifications}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{copy.settings.visitReminders}</Label>
                  <p className="text-sm text-slate-600">{copy.settings.visitRemindersHint}</p>
                </div>
                <Switch
                  checked={draft.visitReminders}
                  onCheckedChange={(checked) => updateDraft({ visitReminders: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{copy.settings.taskDueAlerts}</Label>
                  <p className="text-sm text-slate-600">{copy.settings.taskDueAlertsHint}</p>
                </div>
                <Switch
                  checked={draft.taskDueAlerts}
                  onCheckedChange={(checked) => updateDraft({ taskDueAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{copy.settings.performanceAlerts}</Label>
                  <p className="text-sm text-slate-600">{copy.settings.performanceAlertsHint}</p>
                </div>
                <Switch
                  checked={draft.performanceAlerts}
                  onCheckedChange={(checked) => updateDraft({ performanceAlerts: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{copy.settings.account}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{copy.settings.fullName}</Label>
                <Input id="name" value={session.user?.name || ""} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{copy.settings.email}</Label>
                <Input id="email" type="email" value={session.user?.email || ""} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{copy.settings.role}</Label>
                <Input id="role" value={roleLabel} className="capitalize" disabled />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancel}>
              {copy.settings.cancel}
            </Button>
            <Button onClick={handleSave}>{copy.settings.saveChanges}</Button>
          </div>
      </div>
    </div>
  );
}

function applyAISettingsToDraft(
  settings: SystemAISettingsDetail,
  setAiDraft: Dispatch<
    SetStateAction<{
      enabled: boolean;
      model: string;
      baseUrl: string;
      apiKey: string;
      hasApiKey: boolean;
      maskedApiKey: string;
    }>
  >,
) {
  setAiDraft({
    enabled: settings.enabled,
    model: settings.model,
    baseUrl: settings.base_url || "",
    apiKey: settings.api_key || "",
    hasApiKey: settings.has_api_key,
    maskedApiKey: settings.masked_api_key || "",
  });
}

function getAICopy(language: "en" | "tr") {
  if (language === "tr") {
    return {
      title: "Global AI Runtime",
      enabled: "AI Çağrılarını Aktif Et",
      enabledHint: "Kapalıysa tüm agent akışları local fallback ile çalışır.",
      model: "Varsayılan Model",
      baseUrl: "Base URL",
      baseUrlHint: "Boş bırakırsan varsayılan OpenAI endpointi kullanılır.",
      apiKey: "OpenAI API Key",
      apiKeyStored: (masked: string) => `Kayıtlı anahtar var: ${masked}`,
      apiKeyMissing: "Henüz kayıtlı API key yok.",
      refreshModels: "Modelleri Yenile",
      loadingModels: "Yükleniyor...",
      save: "AI Ayarlarını Kaydet",
      saving: "Kaydediliyor...",
      saveSuccess: "Global AI ayarları kaydedildi.",
      saveError: "Global AI ayarları kaydedilemedi.",
      loadError: "Global AI ayarları yüklenemedi.",
      loadModelsError: "Model listesi yüklenemedi.",
    };
  }

  return {
    title: "Global AI Runtime",
    enabled: "Enable AI Calls",
    enabledHint: "When disabled, all agent flows use local fallback.",
    model: "Default Model",
    baseUrl: "Base URL",
    baseUrlHint: "Leave empty to use the default OpenAI endpoint.",
    apiKey: "OpenAI API Key",
    apiKeyStored: (masked: string) => `Stored key available: ${masked}`,
    apiKeyMissing: "No API key stored yet.",
    refreshModels: "Refresh Models",
    loadingModels: "Loading...",
    save: "Save AI Settings",
    saving: "Saving...",
    saveSuccess: "Global AI settings saved.",
    saveError: "Could not save global AI settings.",
    loadError: "Could not load global AI settings.",
    loadModelsError: "Could not load model list.",
  };
}
