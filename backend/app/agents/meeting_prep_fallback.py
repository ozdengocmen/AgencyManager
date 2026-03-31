"""Local deterministic fallback for meeting prep generation."""

from __future__ import annotations

from typing import Any

from backend.app.schemas.agent_api import MeetingPrepRequest
from backend.app.schemas.agent_outputs import MeetingNarrative
from backend.app.services.structured_outputs import validate_contract_output
from backend.app.tools.data_access import get_agency_profile, get_portfolio_summary


def generate_local_meeting_narrative(
    request: MeetingPrepRequest,
) -> tuple[MeetingNarrative, list[str]]:
    profile = get_agency_profile(request.agency_id)
    portfolio = get_portfolio_summary(sales_owner=profile.agency.sales_owner)
    tools_used = ["get_agency_profile", "get_portfolio_summary"]

    agency = profile.agency
    kpi = profile.kpi
    benchmark = profile.benchmarks
    language_is_tr = request.language == "tr"

    renewal_delta = round(kpi.renewal_rate - benchmark.avg_renewal_rate, 2)
    claims_delta = round(kpi.claims_ratio - benchmark.avg_claims_ratio, 3)
    health_delta = round(kpi.overall_health_score - benchmark.avg_overall_health_score, 2)
    growth_lookup = {
        "motor": kpi.yoy_growth_motor,
        "home": kpi.yoy_growth_home,
        "health": kpi.yoy_growth_health,
    }
    best_branch_growth = growth_lookup[kpi.growth_best_branch]

    payload: dict[str, Any] = {
        "agency_id": agency.agency_id,
        "language": request.language,
        "tone": request.tone,
        "opening_context": (
            f"{agency.agency_name} ile bugun is birligimizi, performans metriklerini ve sonraki "
            f"adimlari gozden gecirecegiz."
            if language_is_tr
            else f"We will review partnership performance with {agency.agency_name} and align on "
            "next-step actions for the coming visit cycle."
        ),
        "talk_track": _talk_track(language_is_tr, agency.agency_name),
        "agenda": _agenda(language_is_tr),
        "questions_to_ask": _questions(language_is_tr),
        "risks": _risks(
            language_is_tr=language_is_tr,
            renewal_delta=renewal_delta,
            claims_delta=claims_delta,
            concentration=kpi.portfolio_concentration,
            renewal_risk_flag=kpi.renewal_risk_flag,
        ),
        "opportunities": [
            {
                "branch": kpi.growth_best_branch,
                "title": (
                    "Hizli buyuyen urun dalinda capraz satis"
                    if language_is_tr
                    else "Cross-sell acceleration in best-growth branch"
                ),
                "rationale": (
                    f"{kpi.growth_best_branch} dali Y/Y %{best_branch_growth:.1f}; bu oran portfoy "
                    f"ortalamasinin ustunde."
                    if language_is_tr
                    else f"{kpi.growth_best_branch} branch is growing {best_branch_growth:.1f}% YoY, "
                    "providing the strongest near-term expansion lever."
                ),
                "suggested_actions": (
                    [
                        "Ilk 20 musteri icin hedefli teklif listesi olustur",
                        "Acenteye haftalik capraz satis hunisi paylas",
                    ]
                    if language_is_tr
                    else [
                        "Build a top-20 account target list for bundled offers",
                        "Share a weekly branch-level cross-sell funnel with the agency",
                    ]
                ),
            }
        ],
        "recommendations": _recommendations(
            language_is_tr=language_is_tr,
            agency_id=agency.agency_id,
            renewal_delta=renewal_delta,
            claims_delta=claims_delta,
        ),
        "commitments_next_steps": (
            [
                "48 saat icinde acente ile yazili aksiyon plani paylas",
                "Bir sonraki gorusmede acik maddeleri durum bazli takip et",
            ]
            if language_is_tr
            else [
                "Share a written action plan with owners within 48 hours",
                "Track open items in the next visit using explicit due dates",
            ]
        ),
        "metric_quotes": [
            {
                "metric_key": "renewal_rate",
                "agency_value": kpi.renewal_rate,
                "benchmark_value": benchmark.avg_renewal_rate,
                "delta_vs_benchmark": renewal_delta,
                "quote_text": (
                    f"Yenileme orani {kpi.renewal_rate:.1f}; portfoy ortalamasi "
                    f"{benchmark.avg_renewal_rate:.1f}; fark {renewal_delta:+.1f} puan."
                    if language_is_tr
                    else f"Renewal rate is {kpi.renewal_rate:.1f} vs portfolio average "
                    f"{benchmark.avg_renewal_rate:.1f} ({renewal_delta:+.1f} pts)."
                ),
            },
            {
                "metric_key": "claims_ratio",
                "agency_value": kpi.claims_ratio,
                "benchmark_value": benchmark.avg_claims_ratio,
                "delta_vs_benchmark": claims_delta,
                "quote_text": (
                    f"Hasar orani {kpi.claims_ratio:.2f}; portfoy ortalamasi "
                    f"{benchmark.avg_claims_ratio:.2f}; fark {claims_delta:+.2f}."
                    if language_is_tr
                    else f"Claims ratio is {kpi.claims_ratio:.2f} vs portfolio average "
                    f"{benchmark.avg_claims_ratio:.2f} ({claims_delta:+.2f})."
                ),
            },
            {
                "metric_key": "overall_health_score",
                "agency_value": kpi.overall_health_score,
                "benchmark_value": benchmark.avg_overall_health_score,
                "delta_vs_benchmark": health_delta,
                "quote_text": (
                    f"Genel saglik skoru {kpi.overall_health_score:.1f}; portfoy ortalamasi "
                    f"{benchmark.avg_overall_health_score:.1f}; fark {health_delta:+.1f}."
                    if language_is_tr
                    else f"Overall health score is {kpi.overall_health_score:.1f} vs portfolio "
                    f"average {benchmark.avg_overall_health_score:.1f} ({health_delta:+.1f})."
                ),
            },
            {
                "metric_key": "portfolio_total_revenue",
                "agency_value": portfolio.total_revenue,
                "benchmark_value": None,
                "delta_vs_benchmark": None,
                "quote_text": (
                    f"Satis sorumlusunun toplam portfoy geliri {portfolio.total_revenue:.0f}."
                    if language_is_tr
                    else f"Sales owner total portfolio revenue is {portfolio.total_revenue:.0f}."
                ),
            },
        ],
        "missing_data_notes": [],
    }

    if request.additional_context.strip():
        payload["commitments_next_steps"].append(request.additional_context.strip())

    validated = validate_contract_output("MeetingNarrative", payload)
    narrative = MeetingNarrative.model_validate(validated.model_dump(mode="json"))
    return narrative, tools_used


def _talk_track(language_is_tr: bool, agency_name: str) -> list[str]:
    if language_is_tr:
        return [
            f"{agency_name} ile son donem performansini net metriklerle ac.",
            "Yenileme ve hasar oranindaki kritik sapmalari ortak nedenlerle bagla.",
            "Toplantiyi somut sahipli aksiyonlar ve tarihli takip maddeleriyle kapat.",
        ]
    return [
        f"Open with a data-based recap of recent performance for {agency_name}.",
        "Link renewal and claims deviations to concrete operational drivers.",
        "Close with owner-specific actions and dated follow-ups.",
    ]


def _agenda(language_is_tr: bool) -> list[dict[str, Any]]:
    if language_is_tr:
        return [
            {
                "order": 1,
                "topic": "Acilis ve hedef",
                "objective": "Toplanti kapsaminda hizali hedef koy",
                "duration_minutes": 10,
            },
            {
                "order": 2,
                "topic": "Performans ve riskler",
                "objective": "KPI sapmalarini kok nedenleriyle degerlendir",
                "duration_minutes": 20,
            },
            {
                "order": 3,
                "topic": "Aksiyon plani",
                "objective": "Sorumlulari ve teslim tarihlerini netlestir",
                "duration_minutes": 15,
            },
        ]
    return [
        {
            "order": 1,
            "topic": "Opening and objective",
            "objective": "Align meeting goal and decision scope",
            "duration_minutes": 10,
        },
        {
            "order": 2,
            "topic": "Performance and risks",
            "objective": "Review KPI deltas and root causes",
            "duration_minutes": 20,
        },
        {
            "order": 3,
            "topic": "Action commitments",
            "objective": "Confirm owners and due dates",
            "duration_minutes": 15,
        },
    ]


def _questions(language_is_tr: bool) -> list[str]:
    if language_is_tr:
        return [
            "Yenileme orani dususunun birincil nedeni nedir?",
            "Hasar artisini tetikleyen urun veya segment hangisi?",
            "Hizli buyuyen urun dalinda hangi capraz satis firsatlari var?",
            "Operasyonel darboz yaratabilecek surec adimi hangisi?",
            "Bir sonraki gorusmeye kadar hangi iki aksiyonu tamamlayabiliriz?",
        ]
    return [
        "What is the main root cause behind renewal-rate pressure?",
        "Which segment is driving the claims-ratio increase?",
        "Where can we expand cross-sell in the best-growth branch?",
        "Which process bottleneck is most likely to block progress?",
        "Which two actions can we complete before the next visit?",
    ]


def _recommendations(
    *,
    language_is_tr: bool,
    agency_id: str,
    renewal_delta: float,
    claims_delta: float,
) -> list[dict[str, Any]]:
    renewal_confidence = 0.78 if renewal_delta < 0 else 0.66
    claims_confidence = 0.74 if claims_delta > 0 else 0.62

    if language_is_tr:
        return [
            {
                "recommendation_id": f"{agency_id}-REC-01",
                "text": "Yenileme gorusmelerini once riskli 40 policeye odaklayacak sekilde planla.",
                "source": "ai_generated",
                "rationale": (
                    f"Yenileme orani benchmarka gore {renewal_delta:+.1f} puan sapmis durumda; "
                    "kayip riski yuksek segmentte erken temas gerekli."
                ),
                "expected_kpi": "renewal_rate",
                "expected_window_days": 30,
                "confidence": renewal_confidence,
            },
            {
                "recommendation_id": f"{agency_id}-REC-02",
                "text": "Hasar nedeni yuksek segmentlerde fiyatlama ve risk secim kurallarini sikilastir.",
                "source": "ai_generated",
                "rationale": (
                    f"Hasar orani benchmarka gore {claims_delta:+.2f}; "
                    "segment bazli duzeltme adimi olmadan karlilik baskisi surer."
                ),
                "expected_kpi": "claims_ratio",
                "expected_window_days": 30,
                "confidence": claims_confidence,
            },
        ]

    return [
        {
            "recommendation_id": f"{agency_id}-REC-01",
            "text": "Prioritize renewal outreach for the highest-risk 40 policies this cycle.",
            "source": "ai_generated",
            "rationale": (
                f"Renewal rate is {renewal_delta:+.1f} points versus benchmark; "
                "early retention conversations are needed in the highest-risk cohort."
            ),
            "expected_kpi": "renewal_rate",
            "expected_window_days": 30,
            "confidence": renewal_confidence,
        },
        {
            "recommendation_id": f"{agency_id}-REC-02",
            "text": "Tighten underwriting and pricing checks in high-claim micro-segments.",
            "source": "ai_generated",
            "rationale": (
                f"Claims ratio is {claims_delta:+.2f} versus benchmark; "
                "segment-level controls are needed to protect profitability."
            ),
            "expected_kpi": "claims_ratio",
            "expected_window_days": 30,
            "confidence": claims_confidence,
        },
    ]


def _risks(
    *,
    language_is_tr: bool,
    renewal_delta: float,
    claims_delta: float,
    concentration: float,
    renewal_risk_flag: bool,
) -> list[dict[str, Any]]:
    risks: list[dict[str, Any]] = []
    if renewal_risk_flag or renewal_delta < 0:
        risks.append(
            {
                "title": "Yenileme baskisi" if language_is_tr else "Renewal pressure",
                "severity": "high" if renewal_delta <= -5 else "medium",
                "explanation": (
                    "Yenileme performansi portfoy ortalamasinin altinda ve kayip riski olusturuyor."
                    if language_is_tr
                    else "Renewal performance is below portfolio average and increases retention risk."
                ),
                "linked_metrics": ["renewal_rate"],
                "mitigation_actions": (
                    ["Haftalik yenileme takibi", "Kayip dosyalar icin kok neden analizi"]
                    if language_is_tr
                    else ["Run weekly renewal tracking", "Perform root-cause review for lost renewals"]
                ),
            }
        )
    if claims_delta > 0.02:
        risks.append(
            {
                "title": "Hasar orani sapmasi" if language_is_tr else "Claims-ratio drift",
                "severity": "medium",
                "explanation": (
                    "Hasar orani benchmark ustunde, karlilik ve fiyatlama disiplini etkilenebilir."
                    if language_is_tr
                    else "Claims ratio is above benchmark and may pressure profitability."
                ),
                "linked_metrics": ["claims_ratio"],
                "mitigation_actions": (
                    ["Yuksek frekansli segment incelemesi", "Risk secim kurallarini guncelle"]
                    if language_is_tr
                    else ["Review high-frequency claim segments", "Tighten risk selection rules"]
                ),
            }
        )
    if concentration >= 0.40:
        risks.append(
            {
                "title": "Portfoy yogunlasmasi" if language_is_tr else "Portfolio concentration risk",
                "severity": "medium",
                "explanation": (
                    "Yuksek yogunlasma tek segment dalgalanmasina duyarliligi artiriyor."
                    if language_is_tr
                    else "High concentration increases exposure to a narrow risk segment."
                ),
                "linked_metrics": ["portfolio_concentration"],
                "mitigation_actions": (
                    ["Urun karmasini dengele", "Alternatif segmentlerde hedefli buyume"]
                    if language_is_tr
                    else ["Rebalance product mix", "Target growth in less-concentrated segments"]
                ),
            }
        )
    if not risks:
        risks.append(
            {
                "title": "Kontrollu izleme" if language_is_tr else "Controlled monitoring",
                "severity": "low",
                "explanation": (
                    "Su an belirgin kritik risk yok; izleme disiplinini koru."
                    if language_is_tr
                    else "No critical risk stands out now; maintain monitoring cadence."
                ),
                "linked_metrics": ["overall_health_score"],
                "mitigation_actions": (
                    ["Aylik KPI kontrolu"] if language_is_tr else ["Maintain monthly KPI checkpoint"]
                ),
            }
        )
    return risks
