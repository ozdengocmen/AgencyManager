"""Local deterministic fallback for post-meeting comparison analysis."""

from __future__ import annotations

from typing import Any

from backend.app.schemas.agent_api import MeetingRecommendationInput, PostMeetingReviewRequest
from backend.app.schemas.agent_outputs import MeetingExpectedKpi, PostMeetingAnalysis
from backend.app.services.structured_outputs import validate_contract_output
from backend.app.tools.data_access import get_agency_profile

_CLAIMS_KPI = "claims_ratio"
_POSITIVE_KPIS: set[MeetingExpectedKpi] = {
    "renewal_rate",
    "yoy_growth_motor",
    "yoy_growth_home",
    "yoy_growth_health",
    "overall_health_score",
}
_KPI_KEYWORDS: dict[MeetingExpectedKpi, tuple[str, ...]] = {
    "renewal_rate": ("renewal", "retention", "yenileme"),
    "claims_ratio": ("claim", "hasar", "loss ratio"),
    "yoy_growth_motor": ("motor", "auto", "cross-sell"),
    "yoy_growth_home": ("home", "konut", "property"),
    "yoy_growth_health": ("health", "saglik", "medical"),
    "overall_health_score": ("health score", "service quality", "memnuniyet"),
}


def generate_local_post_meeting_analysis(
    request: PostMeetingReviewRequest,
) -> tuple[PostMeetingAnalysis, list[str]]:
    profile = get_agency_profile(request.agency_id)
    tools_used = ["get_agency_profile"]
    language_is_tr = request.language == "tr"

    meeting_id = request.meeting_id or f"MEET-{request.agency_id}"
    report_id = f"RPT-{meeting_id}"
    report_summary = request.report_summary.strip() or _default_report_summary(
        language_is_tr=language_is_tr,
        agency_name=profile.agency.agency_name,
    )
    commitments = list(request.commitments) or _default_commitments(language_is_tr=language_is_tr)
    deviations = list(request.deviations)
    recommendations = list(request.recommendations) or _default_recommendations(
        language_is_tr=language_is_tr,
        agency_id=request.agency_id,
    )

    report_text = _normalized_report_text(
        report_summary=report_summary,
        commitments=commitments,
        deviations=deviations,
        additional_context=request.additional_context,
    )
    kpi_snapshot = profile.kpi.model_dump(mode="json")

    comparisons: list[dict[str, Any]] = []
    outcomes: list[dict[str, Any]] = []
    match_count = 0
    for index, recommendation in enumerate(recommendations, start=1):
        consistency = _resolve_consistency(recommendation=recommendation, report_text=report_text)
        if consistency == "match":
            match_count += 1
        evidence = _build_evidence_text(
            language_is_tr=language_is_tr,
            consistency=consistency,
            expected_kpi=recommendation.expected_kpi,
        )
        consistency_note = _build_consistency_note(
            language_is_tr=language_is_tr,
            consistency=consistency,
            decision=recommendation.decision,
        )
        suggestion = _build_suggestion(
            language_is_tr=language_is_tr,
            consistency=consistency,
            decision=recommendation.decision,
            expected_kpi=recommendation.expected_kpi,
        )
        baseline_value = float(kpi_snapshot.get(recommendation.expected_kpi, 0.0))
        t_plus_7_delta, t_plus_30_delta = _estimate_deltas(
            expected_kpi=recommendation.expected_kpi,
            confidence=recommendation.confidence,
            decision=recommendation.decision,
            consistency=consistency,
        )
        effectiveness = _classify_effectiveness(
            expected_kpi=recommendation.expected_kpi,
            decision=recommendation.decision,
            consistency=consistency,
            t_plus_30_delta=t_plus_30_delta,
        )
        outcome_id = f"OUT-{meeting_id}-{index:02d}"

        comparisons.append(
            {
                "recommendation_id": recommendation.recommendation_id,
                "planned_recommendation": recommendation.text,
                "decision": recommendation.decision,
                "expected_kpi": recommendation.expected_kpi,
                "confidence": recommendation.confidence,
                "meeting_report_evidence": evidence,
                "consistency": consistency,
                "consistency_note": consistency_note,
                "ai_suggestion": suggestion,
            }
        )
        outcomes.append(
            {
                "outcome_id": outcome_id,
                "recommendation_id": recommendation.recommendation_id,
                "linked_report_id": report_id,
                "baseline_value": baseline_value,
                "t_plus_7_delta": t_plus_7_delta,
                "t_plus_30_delta": t_plus_30_delta,
                "effectiveness": effectiveness,
                "expected_window_days": recommendation.expected_window_days,
            }
        )

    payload: dict[str, Any] = {
        "meeting_id": meeting_id,
        "agency_id": request.agency_id,
        "report_id": report_id,
        "language": request.language,
        "report_summary": report_summary,
        "commitments": commitments,
        "deviations": deviations,
        "consistency_summary": _build_consistency_summary(
            language_is_tr=language_is_tr,
            match_count=match_count,
            total=len(recommendations),
        ),
        "report_quality_notes": _build_report_quality_notes(
            language_is_tr=language_is_tr,
            report_summary=report_summary,
            commitments=commitments,
            deviations=deviations,
        ),
        "comparisons": comparisons,
        "outcomes": outcomes,
        "missing_data_notes": _build_missing_data_notes(
            language_is_tr=language_is_tr,
            report_summary=request.report_summary,
            recommendations=request.recommendations,
        ),
    }

    validated = validate_contract_output("PostMeetingAnalysis", payload)
    analysis = PostMeetingAnalysis.model_validate(validated.model_dump(mode="json"))
    return analysis, tools_used


def _default_recommendations(
    *,
    language_is_tr: bool,
    agency_id: str,
) -> list[MeetingRecommendationInput]:
    if language_is_tr:
        return [
            MeetingRecommendationInput(
                recommendation_id=f"{agency_id}-PM-01",
                text="Yenileme gorusmelerinde riskli police grubunu haftalik takip et.",
                rationale="Yenileme kaybini azaltmak icin riskli grup daha sik izlenmeli.",
                expected_kpi="renewal_rate",
                expected_window_days=30,
                confidence=0.72,
                decision="accepted",
            ),
            MeetingRecommendationInput(
                recommendation_id=f"{agency_id}-PM-02",
                text="Hasar frekansi yuksek segmentte fiyatlama adimlarini yeniden kalibre et.",
                rationale="Hasar orani baskisini azaltmak icin segment bazli fiyatlama duzeltmesi gerekir.",
                expected_kpi="claims_ratio",
                expected_window_days=30,
                confidence=0.7,
                decision="modified",
            ),
        ]
    return [
        MeetingRecommendationInput(
            recommendation_id=f"{agency_id}-PM-01",
            text="Track high-risk renewals weekly and escalate blockers within 48 hours.",
            rationale="Retention pressure requires tighter cadence and faster intervention windows.",
            expected_kpi="renewal_rate",
            expected_window_days=30,
            confidence=0.72,
            decision="accepted",
        ),
        MeetingRecommendationInput(
            recommendation_id=f"{agency_id}-PM-02",
            text="Recalibrate pricing controls in claim-heavy micro-segments this cycle.",
            rationale="Claims pressure should be reduced via stricter segment-level control points.",
            expected_kpi="claims_ratio",
            expected_window_days=30,
            confidence=0.7,
            decision="modified",
        ),
    ]


def _default_report_summary(*, language_is_tr: bool, agency_name: str) -> str:
    if language_is_tr:
        return (
            f"{agency_name} toplantisinda yenileme baskisi ve hasar sapmasi icin duzeltici aksiyonlar konusuldu."
        )
    return (
        f"Meeting with {agency_name} covered renewal pressure and claims-drift corrections with clear ownership."
    )


def _default_commitments(*, language_is_tr: bool) -> list[str]:
    if language_is_tr:
        return [
            "Riskli police listesi haftalik olarak guncellenecek.",
            "Hasar frekansi yuksek segment icin fiyatlama kontrol adimi acilacak.",
        ]
    return [
        "High-risk policy list will be reviewed weekly.",
        "Pricing-control checkpoint will be added for high-claim segments.",
    ]


def _normalized_report_text(
    *,
    report_summary: str,
    commitments: list[str],
    deviations: list[str],
    additional_context: str,
) -> str:
    parts = [report_summary, *commitments, *deviations]
    if additional_context.strip():
        parts.append(additional_context.strip())
    return " ".join(parts).casefold()


def _resolve_consistency(
    *,
    recommendation: MeetingRecommendationInput,
    report_text: str,
) -> str:
    if recommendation.decision == "rejected":
        return "mismatch"
    keywords = _KPI_KEYWORDS[recommendation.expected_kpi]
    has_signal = any(keyword in report_text for keyword in keywords)
    return "match" if has_signal else "mismatch"


def _build_evidence_text(
    *,
    language_is_tr: bool,
    consistency: str,
    expected_kpi: MeetingExpectedKpi,
) -> str:
    if consistency == "match":
        if language_is_tr:
            return f"Toplanti notlari {expected_kpi} hedefi ile uyumlu acik bir uygulama sinyali iceriyor."
        return f"Meeting report includes explicit execution signal aligned with {expected_kpi}."
    if language_is_tr:
        return f"Toplanti notlarinda {expected_kpi} hedefi ile ilgili yeterli uygulama kaniti yok."
    return f"Meeting report lacks clear execution evidence tied to {expected_kpi}."


def _build_consistency_note(
    *,
    language_is_tr: bool,
    consistency: str,
    decision: str,
) -> str:
    if consistency == "match":
        if language_is_tr:
            return f"Karar durumu '{decision}' ve rapor anlatimi birbirini destekliyor."
        return f"Decision state '{decision}' is supported by the report narrative."
    if language_is_tr:
        return f"Karar durumu '{decision}' ile rapor icerigi arasinda uyumsuzluk var."
    return f"Decision state '{decision}' is not sufficiently reflected in the report content."


def _build_suggestion(
    *,
    language_is_tr: bool,
    consistency: str,
    decision: str,
    expected_kpi: MeetingExpectedKpi,
) -> str:
    if consistency == "match":
        if language_is_tr:
            return f"{expected_kpi} etkisini dogrulamak icin T+7 ve T+30 KPI olcumu planla."
        return f"Schedule T+7 and T+30 KPI checks to validate {expected_kpi} impact."
    if language_is_tr:
        return (
            f"Raporu guncelleyip {expected_kpi} hedefine bagli aksiyonlari sahip, tarih ve olcum ile netlestir."
        )
    return (
        f"Update the report with explicit owner, date, and measurable action tied to {expected_kpi}."
    )


def _estimate_deltas(
    *,
    expected_kpi: MeetingExpectedKpi,
    confidence: float,
    decision: str,
    consistency: str,
) -> tuple[float, float]:
    adoption_factor = {"accepted": 1.0, "modified": 0.8, "proposed": 0.55, "rejected": 0.0}[decision]
    if adoption_factor == 0.0:
        return 0.0, 0.0

    consistency_factor = 1.0 if consistency == "match" else -0.65
    if expected_kpi == _CLAIMS_KPI:
        direction = -1.0
        magnitude = 0.018
        t30 = round(direction * magnitude * (0.55 + confidence) * adoption_factor * consistency_factor, 3)
        t7 = round(t30 * 0.45, 3)
        return t7, t30

    direction = 1.0 if expected_kpi in _POSITIVE_KPIS else 0.0
    magnitude = 1.35
    t30 = round(direction * magnitude * (0.55 + confidence) * adoption_factor * consistency_factor, 2)
    t7 = round(t30 * 0.45, 2)
    return t7, t30


def _classify_effectiveness(
    *,
    expected_kpi: MeetingExpectedKpi,
    decision: str,
    consistency: str,
    t_plus_30_delta: float,
) -> str:
    if decision == "rejected":
        return "inconclusive"
    if expected_kpi == _CLAIMS_KPI:
        if consistency == "match" and t_plus_30_delta <= -0.005:
            return "effective"
        if t_plus_30_delta >= 0.003:
            return "ineffective"
        return "inconclusive"

    if consistency == "match" and t_plus_30_delta >= 0.35:
        return "effective"
    if t_plus_30_delta <= -0.25:
        return "ineffective"
    return "inconclusive"


def _build_consistency_summary(*, language_is_tr: bool, match_count: int, total: int) -> str:
    if language_is_tr:
        return f"{total} onerinin {match_count} tanesi toplanti raporuyla dogrudan uyumlu."
    return f"{match_count} of {total} recommendations are directly aligned with report evidence."


def _build_report_quality_notes(
    *,
    language_is_tr: bool,
    report_summary: str,
    commitments: list[str],
    deviations: list[str],
) -> list[str]:
    notes: list[str] = []
    if len(report_summary.strip()) < 60:
        notes.append(
            "Rapor ozeti kisa; KPI etkisini destekleyen daha somut kanit eklenmeli."
            if language_is_tr
            else "Report summary is brief; add concrete KPI-linked evidence."
        )
    if not commitments:
        notes.append(
            "Sahipli taahhut maddesi yok; takip icin en az bir teslim tarihi eklenmeli."
            if language_is_tr
            else "No owner commitment found; add at least one dated follow-up item."
        )
    if not deviations:
        notes.append(
            "Sapma kaydi yok; planlanan ve gerceklesen farklar acikca yazilmali."
            if language_is_tr
            else "No deviation captured; document planned-vs-actual differences explicitly."
        )
    if notes:
        return notes
    return [
        "Rapor yapisi yeterli; bir sonraki adim KPI olcum disiplinini korumak."
        if language_is_tr
        else "Report quality is sufficient; keep KPI follow-up cadence for the next cycle."
    ]


def _build_missing_data_notes(
    *,
    language_is_tr: bool,
    report_summary: str,
    recommendations: list[MeetingRecommendationInput],
) -> list[str]:
    notes: list[str] = []
    if not report_summary.strip():
        notes.append(
            "Rapor ozeti bos geldigi icin varsayilan ozet kullanildi."
            if language_is_tr
            else "Report summary was empty; a deterministic default summary was used."
        )
    if not recommendations:
        notes.append(
            "Oneri listesi bos oldugu icin varsayilan post-meeting onerileri uretilmistir."
            if language_is_tr
            else "Recommendation list was empty; deterministic fallback recommendations were generated."
        )
    return notes
