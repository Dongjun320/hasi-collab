import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ComponentTestPage from "./pages/ComponentTestPage.tsx";
import { WorkspaceHome } from "./pages/WorkspaceHome.tsx";
import { WorkspaceLayout } from "./pages/WorkspaceLayout.tsx";
import { DirectMessagesPage } from "./pages/DirectMessagesPage.tsx";
import { ChannelsPage } from "./pages/ChannelsPage";
import { KanbanPage } from "./pages/KanbanPage.tsx";
import { CalendarPage } from "./pages/CalendarPage.tsx";
import { ThreadsPage } from "./pages/ThreadsPage.tsx";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage.tsx";
import OAuth2RedirectPage from "./pages/OAuth2RedirectPage.tsx";
import MailPage from "./pages/MailPage.tsx";

export const router = createBrowserRouter([
  { path: "/",
    element: <LoginPage /> },
  { path: "/oauth2/redirect",
    element: <OAuth2RedirectPage />},
  { path: "/channel/:channelId",
    element: <ChannelsPage /> },
  { path: "/ComponentTestPage",
    element: <ComponentTestPage /> },
  { path: "/WorkspaceHome",
    element: <WorkspaceHome /> },

  {
    path: "/workspace",
    Component: WorkspaceLayout,
    children: [
      { index: true, Component: ChannelsPage },
      { path: "channels/:channelId", Component: ChannelsPage },
      { path: "dm", Component: DirectMessagesPage },
      { path: "dm/:userId", Component: DirectMessagesPage },
      { path: "threads", Component: ThreadsPage },
      { path: "kanban", Component: KanbanPage },
      { path: "calendar", Component: CalendarPage },
      { path: "profile", Component: ProfilePage },
      { path: "settings", Component: SettingsPage },
      { path: "mail", Component: MailPage },
    ],
  },
]);
