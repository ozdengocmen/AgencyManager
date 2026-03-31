import { useEffect, useState } from "react";
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

export function Settings() {
  const { copy } = useI18n();
  const {
    state: { settings, session },
    applySettings,
  } = useAppState();

  const [draft, setDraft] = useState<SettingsState>(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

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
