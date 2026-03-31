import type { AppLanguage } from "../../state";

interface AgenciesListCopy {
  title: string;
  subtitle: (count: number) => string;
  searchPlaceholder: string;
  cityPlaceholder: string;
  allCities: string;
  priorityTierPlaceholder: string;
  allTiers: string;
  tierLabel: (tier: "A" | "B" | "C") => string;
  renewalRiskFilter: string;
  tableAgencyName: string;
  tableLocation: string;
  tableTier: string;
  tableHealthScore: string;
  tableRenewalRate: string;
  tableClaimsRatio: string;
  tableConcentration: string;
  tableBestBranch: string;
  tableNextVisit: string;
  tableActions: string;
  riskBadge: string;
  versusLabel: string;
  addToPlanAction: string;
  dateLocale: string;
  growthBranchLabel: (branch: string) => string;
  meetingPrepBulkAction: (count: number) => string;
  createVisitPlanBulkAction: (count: number) => string;
  rowMeetingPrepAction: string;
  addSelectedAlreadyInPlan: string;
  addedSelectedToPlan: (count: number) => string;
  agencyAlreadyInPlan: string;
  addedAgencyToPlan: (agencyId: string) => string;
  selectAgencyForMeetingPrep: string;
}

const COPY_BY_LANGUAGE: Record<AppLanguage, AgenciesListCopy> = {
  en: {
    title: "Agencies",
    subtitle: (count) => `${count} agencies in portfolio`,
    searchPlaceholder: "Search agencies...",
    cityPlaceholder: "City",
    allCities: "All Cities",
    priorityTierPlaceholder: "Priority Tier",
    allTiers: "All Tiers",
    tierLabel: (tier) => `Tier ${tier}`,
    renewalRiskFilter: "Renewal Risk",
    tableAgencyName: "Agency Name",
    tableLocation: "Location",
    tableTier: "Tier",
    tableHealthScore: "Health Score",
    tableRenewalRate: "Renewal Rate",
    tableClaimsRatio: "Claims Ratio",
    tableConcentration: "Concentration",
    tableBestBranch: "Best Branch",
    tableNextVisit: "Next Visit",
    tableActions: "Actions",
    riskBadge: "Risk",
    versusLabel: "vs",
    addToPlanAction: "Add to Plan",
    dateLocale: "en-US",
    growthBranchLabel: (branch) => {
      const labels: Record<string, string> = {
        motor: "Motor",
        home: "Home",
        health: "Health",
      };
      return labels[branch] || branch;
    },
    meetingPrepBulkAction: (count) => `Generate Meeting Prep (${count})`,
    createVisitPlanBulkAction: (count) => `Create Visit Plan (${count})`,
    rowMeetingPrepAction: "Meeting Prep",
    addSelectedAlreadyInPlan: "Selected agencies are already in today's plan.",
    addedSelectedToPlan: (count) => `Added ${count} agency(ies) to today's plan.`,
    agencyAlreadyInPlan: "Agency is already in today's plan.",
    addedAgencyToPlan: (agencyId) => `Added ${agencyId} to today's plan.`,
    selectAgencyForMeetingPrep: "Select at least one agency for meeting prep.",
  },
  tr: {
    title: "Acenteler",
    subtitle: (count) => `Portföyde ${count} acente`,
    searchPlaceholder: "Acente ara...",
    cityPlaceholder: "Şehir",
    allCities: "Tüm Şehirler",
    priorityTierPlaceholder: "Öncelik Seviyesi",
    allTiers: "Tüm Seviyeler",
    tierLabel: (tier) => `Seviye ${tier}`,
    renewalRiskFilter: "Yenileme Riski",
    tableAgencyName: "Acente Adı",
    tableLocation: "Konum",
    tableTier: "Seviye",
    tableHealthScore: "Sağlık Skoru",
    tableRenewalRate: "Yenileme Oranı",
    tableClaimsRatio: "Hasar Oranı",
    tableConcentration: "Konsantrasyon",
    tableBestBranch: "En İyi Branş",
    tableNextVisit: "Sonraki Ziyaret",
    tableActions: "Aksiyonlar",
    riskBadge: "Risk",
    versusLabel: "karşı",
    addToPlanAction: "Plana Ekle",
    dateLocale: "tr-TR",
    growthBranchLabel: (branch) => {
      const labels: Record<string, string> = {
        motor: "Motor",
        home: "Konut",
        health: "Sağlık",
      };
      return labels[branch] || branch;
    },
    meetingPrepBulkAction: (count) => `Toplantı Hazırlığı Oluştur (${count})`,
    createVisitPlanBulkAction: (count) => `Ziyaret Planı Oluştur (${count})`,
    rowMeetingPrepAction: "Toplantı Hazırlığı",
    addSelectedAlreadyInPlan: "Seçilen acenteler bugünkü planda zaten var.",
    addedSelectedToPlan: (count) => `${count} acente bugünkü plana eklendi.`,
    agencyAlreadyInPlan: "Acente bugünkü planda zaten var.",
    addedAgencyToPlan: (agencyId) => `${agencyId} bugünkü plana eklendi.`,
    selectAgencyForMeetingPrep: "Toplantı hazırlığı için en az bir acente seçin.",
  },
};

export function getAgenciesListCopy(language: AppLanguage): AgenciesListCopy {
  return COPY_BY_LANGUAGE[language];
}
