import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Mic, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { createContactClosure, listContactClosures, validateContactClosure } from "../../../api/contactClosure";
import type {
  ContactClosureDetail,
  ContactClosureInputMode,
  ContactClosureValidationResult,
} from "../../../api/types";
import { useI18n } from "../../../i18n";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Label } from "../../ui/label";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";

interface ContactClosureCardProps {
  agencyId: string;
}

type ContactReason =
  | "renewal"
  | "claims"
  | "collections"
  | "technical"
  | "growth"
  | "relationship"
  | "general";

export function ContactClosureCard({ agencyId }: ContactClosureCardProps) {
  const { language } = useI18n();
  const copy = useMemo(() => getCopy(language), [language]);
  const [inputMode, setInputMode] = useState<ContactClosureInputMode>("manual");
  const [contactReason, setContactReason] = useState<ContactReason>("general");
  const [rawNote, setRawNote] = useState("");
  const [validation, setValidation] = useState<ContactClosureValidationResult | null>(null);
  const [savedItems, setSavedItems] = useState<ContactClosureDetail[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await listContactClosures(agencyId);
        setSavedItems(response.items);
      } catch {
        setSavedItems([]);
      }
    };
    void load();
  }, [agencyId]);

  const canSave = Boolean(validation?.is_valid && rawNote.trim());

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const result = await validateContactClosure({
        agency_id: agencyId,
        contact_reason: contactReason,
        input_mode: inputMode,
        raw_note: rawNote,
      });
      setValidation(result);
      if (result.is_valid) {
        toast.success(copy.validSuccess);
      } else {
        toast.error(copy.validFailed);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : copy.validationError);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saved = await createContactClosure({
        agency_id: agencyId,
        contact_reason: contactReason,
        input_mode: inputMode,
        raw_note: rawNote,
      });
      setValidation(saved.validation_result);
      setSavedItems((current) => [saved, ...current].slice(0, 5));
      toast.success(copy.savedSuccess);
      setRawNote("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : copy.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">{copy.description}</p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{copy.inputMode}</Label>
            <RadioGroup
              value={inputMode}
              onValueChange={(value) => setInputMode(value as ContactClosureInputMode)}
              className="grid grid-cols-2 gap-3"
            >
              <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                <RadioGroupItem value="manual" id="contact-manual" />
                <span>{copy.manual}</span>
              </label>
              <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                <RadioGroupItem value="speech" id="contact-speech" />
                <Mic className="h-4 w-4 text-slate-500" />
                <span>{copy.speech}</span>
              </label>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-reason">{copy.contactReason}</Label>
            <Select value={contactReason} onValueChange={(value) => setContactReason(value as ContactReason)}>
              <SelectTrigger id="contact-reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="renewal">{copy.reasons.renewal}</SelectItem>
                <SelectItem value="claims">{copy.reasons.claims}</SelectItem>
                <SelectItem value="collections">{copy.reasons.collections}</SelectItem>
                <SelectItem value="technical">{copy.reasons.technical}</SelectItem>
                <SelectItem value="growth">{copy.reasons.growth}</SelectItem>
                <SelectItem value="relationship">{copy.reasons.relationship}</SelectItem>
                <SelectItem value="general">{copy.reasons.general}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="closure-note">{copy.noteLabel}</Label>
          <Textarea
            id="closure-note"
            className="min-h-[180px]"
            placeholder={copy.placeholder}
            value={rawNote}
            onChange={(event) => setRawNote(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleValidate} disabled={isValidating || !rawNote.trim()}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            {isValidating ? copy.validating : copy.validate}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !canSave}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? copy.saving : copy.save}
          </Button>
        </div>

        {validation ? (
          <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={validation.is_valid ? "default" : "destructive"}>
                {validation.is_valid ? copy.validBadge : copy.invalidBadge}
              </Badge>
              <Badge variant="outline">{copy.quality(validation.quality_score)}</Badge>
              <Badge variant="secondary">{validation.validator_version}</Badge>
              <Badge variant={validation.provider === "openai" ? "default" : "outline"}>
                {copy.provider(validation.provider)}
              </Badge>
              <Badge variant="outline">{validation.model}</Badge>
            </div>

            {validation.warnings.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900">{copy.warningTitle}</p>
                {validation.warnings.map((warning) => (
                  <div key={warning} className="flex items-start gap-2 text-sm text-amber-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {validation.rejection_reasons.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900">{copy.rejectionTitle}</p>
                {validation.rejection_reasons.map((reason) => (
                  <div key={reason} className="flex items-start gap-2 text-sm text-rose-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900">{copy.summaryTitle}</p>
              <p className="text-sm text-slate-700">{validation.summary || copy.noSummary}</p>
            </div>

            {validation.action_items.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900">{copy.actionsTitle}</p>
                {validation.action_items.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {savedItems.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-900">{copy.savedHistory}</p>
            {savedItems.map((item) => (
              <div key={item.closure_id} className="rounded-md border p-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{copy.reasons[item.contact_reason as ContactReason] || item.contact_reason}</Badge>
                  <Badge variant="secondary">{item.input_mode === "speech" ? copy.speech : copy.manual}</Badge>
                  <Badge variant="outline">{copy.quality(item.quality_score)}</Badge>
                </div>
                <p className="text-sm text-slate-900">{item.summary}</p>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function getCopy(language: "en" | "tr") {
  if (language === "tr") {
    return {
      title: "Temas Kapatma",
      description:
        "Temas sonrası notu girin. Kayıt öncesi kalite kontrolü yapılır; çok genel veya aksiyonsuz notlar reddedilir.",
      inputMode: "Giriş Türü",
      manual: "Manuel Not",
      speech: "Konuşma Metni",
      contactReason: "Temas Nedeni",
      noteLabel: "Temas Kapatma Notu",
      placeholder:
        "Örnek: Acente ile yenileme oranındaki düşüş konuşuldu. Nisan sonuna kadar yenileme listesi paylaşılacak. Tahsilat ekibine geciken ödemeler için ayrıca not iletilecek.",
      validate: "Notu Doğrula",
      validating: "Doğrulanıyor...",
      save: "Kaydet",
      saving: "Kaydediliyor...",
      validBadge: "Geçerli",
      invalidBadge: "Yetersiz",
      warningTitle: "AI Uyarıları",
      rejectionTitle: "Düzeltilmesi Gerekenler",
      summaryTitle: "Yapılandırılmış Özet",
      actionsTitle: "Tespit Edilen Aksiyonlar",
      noSummary: "Henüz özet yok.",
      quality: (score: number) => `Kalite Skoru: ${score}/100`,
      provider: (provider: "openai" | "local-fallback") =>
        provider === "openai" ? "OpenAI Özetleme" : "Fallback Özetleme",
      validSuccess: "Not kalite kontrolünden geçti.",
      validFailed: "Not yetersiz. Kaydetmeden önce düzelt.",
      validationError: "Not doğrulanamadı.",
      savedSuccess: "Temas kapatma notu kaydedildi.",
      saveError: "Temas kapatma notu kaydedilemedi.",
      savedHistory: "Son kayıtlar",
      reasons: {
        renewal: "Yenileme",
        claims: "Hasar",
        collections: "Tahsilat",
        technical: "Teknik",
        growth: "Büyüme",
        relationship: "İlişki",
        general: "Genel",
      },
    };
  }

  return {
    title: "Contact Closure",
    description:
      "Capture the note after a visit. The note is checked before save; generic or action-free notes are rejected.",
    inputMode: "Input Mode",
    manual: "Manual Note",
    speech: "Speech Transcript",
    contactReason: "Contact Reason",
    noteLabel: "Closure Note",
    placeholder:
      "Example: We reviewed the drop in renewal rate with the agency. A renewal list will be shared by end of April. A separate note will be sent to collections for overdue balances.",
    validate: "Validate Note",
    validating: "Validating...",
    save: "Save",
    saving: "Saving...",
    validBadge: "Valid",
    invalidBadge: "Needs Work",
    warningTitle: "AI Warnings",
    rejectionTitle: "What Must Be Improved",
    summaryTitle: "Structured Summary",
    actionsTitle: "Detected Actions",
    noSummary: "No summary yet.",
    quality: (score: number) => `Quality Score: ${score}/100`,
    provider: (provider: "openai" | "local-fallback") =>
      provider === "openai" ? "OpenAI Summary" : "Fallback Summary",
    validSuccess: "Note passed validation.",
    validFailed: "Note is too weak. Fix it before saving.",
    validationError: "Validation failed.",
    savedSuccess: "Contact closure note saved.",
    saveError: "Could not save contact closure note.",
    savedHistory: "Recent records",
    reasons: {
      renewal: "Renewal",
      claims: "Claims",
      collections: "Collections",
      technical: "Technical",
      growth: "Growth",
      relationship: "Relationship",
      general: "General",
    },
  };
}
