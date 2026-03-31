import { useEffect, useMemo } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  Building2,
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Map,
  MessageSquare,
  Settings,
  Sparkles,
} from "lucide-react";

import { mockAgencies } from "../data/mockData";
import { useI18n } from "../i18n";
import { useAppState, useServerCache } from "../state";
import { AIAssistant } from "./AIAssistant";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Sheet, SheetContent } from "./ui/sheet";
import { cn } from "./ui/utils";

interface AssistantContext {
  label: string;
  hints: string[];
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    state: { assistant, meetingPrep, planner, session, tasks },
    logout,
    setAssistantMobileOpen,
    updateAssistant,
  } = useAppState();
  const { clear } = useServerCache();
  const { copy } = useI18n();

  const navigation = [
    { name: copy.layout.dashboard, href: "/app", icon: LayoutDashboard },
    { name: copy.layout.agencies, href: "/app/agencies", icon: Building2 },
    { name: copy.layout.dailyPlan, href: "/app/daily-plan", icon: CalendarDays },
    { name: copy.layout.mapClusters, href: "/app/visit-planning", icon: Map },
    { name: copy.layout.meetingPrep, href: "/app/meeting-prep", icon: Sparkles },
    { name: copy.layout.tasks, href: "/app/tasks", icon: CheckSquare },
    { name: copy.layout.settings, href: "/app/settings", icon: Settings },
  ];

  const assistantContext = useMemo<AssistantContext>(() => {
    const pathname = location.pathname;
    const hints: string[] = [];

    if (pathname.startsWith("/app/agencies/")) {
      const agencyId = pathname.split("/")[3] || "";
      if (agencyId) {
        hints.push(formatAgencyHint(agencyId));
      }
      return { label: copy.layout.agencies, hints };
    }

    if (pathname.startsWith("/app/daily-plan")) {
      if (planner.selectedVisitId) {
        const selectedVisit = planner.visits.find((visit) => visit.id === planner.selectedVisitId);
        if (selectedVisit?.agency_id) {
          hints.push(formatAgencyHint(selectedVisit.agency_id));
        }
      }
      return { label: copy.layout.dailyPlan, hints };
    }

    if (pathname.startsWith("/app/meeting-prep")) {
      if (meetingPrep.selectedAgencyId) {
        hints.push(formatAgencyHint(meetingPrep.selectedAgencyId));
      }
      return { label: copy.layout.meetingPrep, hints };
    }

    if (pathname.startsWith("/app/tasks")) {
      const pendingCount = tasks.tasks.filter((task) => task.status !== "completed").length;
      hints.push(copy.assistant.openTaskHint(pendingCount));
      return { label: copy.layout.tasks, hints };
    }

    if (pathname.startsWith("/app/visit-planning") || pathname.startsWith("/app/map-clusters")) {
      return { label: copy.layout.mapClusters, hints };
    }

    if (pathname.startsWith("/app/settings")) {
      return { label: copy.layout.settings, hints };
    }

    if (pathname.startsWith("/app/agencies")) {
      return { label: copy.layout.agencies, hints };
    }

    return { label: copy.layout.dashboard, hints };
  }, [copy.assistant, copy.layout, location.pathname, meetingPrep.selectedAgencyId, planner.selectedVisitId, planner.visits, tasks.tasks]);

  const handleLogout = () => {
    logout();
    clear();
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("assistant") !== "open") {
      return;
    }

    updateAssistant({
      draftInput: params.get("assistant_prompt") || "",
    });
    setAssistantMobileOpen(true);

    params.delete("assistant");
    params.delete("assistant_prompt");
    const nextSearch = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true },
    );
  }, [location.pathname, location.search, navigate, setAssistantMobileOpen, updateAssistant]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-slate-900 text-white">
        <div className="border-b border-slate-700 p-6">
          <h1 className="text-xl font-semibold">{copy.layout.appTitle}</h1>
          <p className="mt-1 text-sm text-slate-400">{copy.layout.appSubtitle}</p>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/app" && location.pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="border-t border-slate-700 p-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-medium">
              {(session.user?.name || copy.layout.unknownUser)
                .split(" ")
                .map((piece) => piece[0] || "")
                .slice(0, 2)
                .join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{session.user?.name || copy.layout.unknownUser}</p>
              <p className="text-xs capitalize text-slate-400">
                {session.user?.role || copy.layout.anonymousRole}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-200 hover:bg-slate-800 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {copy.layout.signOut}
          </Button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <Outlet />
        </div>
      </div>

      <Sheet open={assistant.mobileOpen} onOpenChange={setAssistantMobileOpen}>
        <SheetContent
          side="right"
          className="w-full p-0 sm:max-w-md [&>button]:text-white [&>button]:opacity-100 [&>button:hover]:bg-white/15"
        >
          <AIAssistant
            mode="sheet"
            contextLabel={assistantContext.label}
            contextHints={assistantContext.hints}
          />
        </SheetContent>
      </Sheet>

      {!assistant.mobileOpen ? (
        <Button
          onClick={() => setAssistantMobileOpen(true)}
          className="fixed right-4 bottom-4 z-50 h-12 w-12 rounded-full shadow-lg md:right-6 md:bottom-6 md:h-14 md:w-14"
          size="icon"
          aria-label={copy.assistant.openAssistant}
        >
          <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      ) : null}
    </div>
  );
}

function formatAgencyHint(agencyId: string): string {
  const agency = mockAgencies.find((item) => item.agency_id === agencyId);
  return agency ? `${agency.agency_name} (${agency.agency_id})` : agencyId;
}
