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

// 💡 새로 생성한 가드 컴포넌트를 import 합니다. (경로는 프로젝트 구조에 맞게 수정해주세요)
import { RequireAuth } from "./components/RequireAuth.tsx";
import { GuestOnly } from "./components/GuestOnly.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    // 이미 로그인된 유저는 접근하지 못하도록 GuestOnly로 감쌉니다.
    element: <GuestOnly><LoginPage /></GuestOnly>
  },
  {
    path: "/oauth2/redirect",
    element: <OAuth2RedirectPage />
  },
  {
    path: "/channel/:channelId",
    // 💡 (참고) 지시사항에는 없었지만, 개별 채널 접근도 보호가 필요하다면 아래처럼 감싸주시면 됩니다.
    element: <RequireAuth><ChannelsPage /></RequireAuth>
  },
  {
    path: "/ComponentTestPage",
    element: <ComponentTestPage />
  },
  {
    path: "/WorkspaceHome",
    // 지시사항에 따라 WorkspaceHome을 RequireAuth로 감쌉니다.
    element: <RequireAuth><WorkspaceHome /></RequireAuth>
  },

  {
    path: "/workspace",
    // 💡 하위(children) 라우트들을 일일이 감쌀 필요 없이,
    // 부모인 WorkspaceLayout 하나만 감싸주면 하위 페이지 모두 자동으로 보호됩니다.
    // 기존의 `Component: WorkspaceLayout` 방식을 `element: <Layout/>` 방식으로 변경했습니다.
    element: <RequireAuth><WorkspaceLayout /></RequireAuth>,
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
    ],
  },
]);