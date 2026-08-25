import { RouterProvider } from 'react-router-dom'
import { router } from "./routes"
import Toast from "./components/Toast"
import { useToastStore } from "./store/toastStore"
import './styles/index.css'
import { ProfileModal } from "./components/ProfileModal";
import { SettingsModal } from "./components/SettingsModal";
import { ErrorBoundary } from "./components/ErrorBoundary";


function App() {
  const { current, hide } = useToastStore()

  return (
    // 루트 경계: 어떤 렌더 에러든 흰 화면 대신 진단 fallback을 보여줌
    <ErrorBoundary label="root">
      <RouterProvider router={router} />
      {/* 전역 모달 전용 경계: 모달이 죽어도(fallback=null) 라우터/앱 본체는 살아있음 */}
      <ErrorBoundary label="global-modals" fallback={null}>
        <Toast
          isOpen={!!current}
          message={current?.message ?? ''}
          type={current?.type}
          onClose={hide}
        />
        <ProfileModal />
        <SettingsModal />
      </ErrorBoundary>
    </ErrorBoundary>
  )
}

export default App