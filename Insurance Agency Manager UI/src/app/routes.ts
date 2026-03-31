import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Login } from "./components/screens/Login";
import { Dashboard } from "./components/screens/Dashboard";
import { AgenciesList } from "./components/screens/AgenciesList";
import { AgencyProfile } from "./components/screens/AgencyProfile";
import { DailyPlan } from "./components/screens/DailyPlan";
import { MapClusters } from "./components/screens/MapClusters";
import { MeetingPrep } from "./components/screens/MeetingPrep";
import { TasksFollowUps } from "./components/screens/TasksFollowUps";
import { Settings } from "./components/screens/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/app",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "agencies", Component: AgenciesList },
      { path: "agencies/:id", Component: AgencyProfile },
      { path: "daily-plan", Component: DailyPlan },
      { path: "map-clusters", Component: MapClusters },
      { path: "meeting-prep", Component: MeetingPrep },
      { path: "tasks", Component: TasksFollowUps },
      { path: "settings", Component: Settings },
    ],
  },
]);
