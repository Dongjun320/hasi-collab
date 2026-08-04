import { RouterProvider } from 'react-router-dom'
import { router } from "./routes"
import Toast from "./components/Toast"
import { useToastStore } from "./store/toastStore"
import './styles/index.css'
import { ProfileModal } from "./components/ProfileModal";
import { SettingsModal } from "./components/SettingsModal";


function App() {
  const { current, hide } = useToastStore()

  return (
    <>
      <RouterProvider router={router} />
      <Toast
        isOpen={!!current}
        message={current?.message ?? ''}
        type={current?.type}
        onClose={hide}
      />
      <ProfileModal />
      <SettingsModal />
    </>


  )
}

export default App