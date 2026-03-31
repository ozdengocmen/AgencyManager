import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowRight, Building2 } from "lucide-react";

import { mockAgencies } from "../../data/mockData";
import { useI18n } from "../../i18n";

export function MeetingPrep() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { copy } = useI18n();
  const isTurkish = copy.locale.startsWith("tr");

  useEffect(() => {
    const agencyId = params.get("agency");
    if (!agencyId) {
      return;
    }
    if (!mockAgencies.some((agency) => agency.agency_id === agencyId)) {
      return;
    }

    navigate(`/app/agencies/${agencyId}?tab=meeting-prep`, { replace: true });
  }, [navigate, params]);

  return (
    <div className="flex-1 min-w-0 min-h-0 p-6 bg-slate-50">
      <div className="mx-auto max-w-3xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{copy.layout.meetingPrep}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <p>
              {isTurkish
                ? "Toplantı hazırlığı artık acente bazlı yönetiliyor. Her acentenin geçmiş toplantıları, aksiyonları ve takipleri kendi profil ekranında ayrı olarak yönetilir."
                : "Meeting preparation is now managed at the agency level. Previous meetings, actions, and follow-ups are handled separately inside each agency profile."}
            </p>
            <p>
              {isTurkish
                ? "Acenteler ekranından bir acente açın ve 'Toplantı Hazırlığı' ile 'Notlar ve Görevler' sekmelerini kullanın."
                : "Open an agency from the Agencies screen and use the 'Meeting Prep' and 'Notes & Tasks' tabs."}
            </p>
            <div className="pt-2">
              <Link to="/app/agencies">
                <Button>
                  <Building2 className="w-4 h-4 mr-2" />
                  {copy.layout.agencies}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
