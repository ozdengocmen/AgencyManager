import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Map,
  Sparkles,
  CheckSquare,
  Settings,
  MessageSquare
} from "lucide-react";
import { cn } from "./ui/utils";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";
import { AIAssistant } from "./AIAssistant";

const navigation = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Agencies", href: "/app/agencies", icon: Building2 },
  { name: "Daily Plan", href: "/app/daily-plan", icon: CalendarDays },
  { name: "Map & Clusters", href: "/app/map-clusters", icon: Map },
  { name: "Meeting Prep (AI)", href: "/app/meeting-prep", icon: Sparkles },
  // { name: "Tasks & Follow-ups", href: "/app/tasks", icon: CheckSquare },
  { name: "Settings", href: "/app/settings", icon: Settings },
];

export function Layout() {
  const location = useLocation();
  const [showAI, setShowAI] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="font-semibold text-xl">Agency Portfolio</h1>
          <p className="text-slate-400 text-sm mt-1">Assistant</p>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== "/app" && location.pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-medium">
              JS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Smith</p>
              <p className="text-xs text-slate-400">Salesperson</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>

      {/* AI Assistant Widget */}
      <AIAssistant isOpen={showAI} onClose={() => setShowAI(false)} />

      {!showAI && (
        <Button
          onClick={() => setShowAI(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg"
          size="icon"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}
