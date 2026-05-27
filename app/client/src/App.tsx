<<<<<<< HEAD
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage' // 1. 로그인 페이지 컴포넌트를 import 합니다.
import ChannelPage from './pages/ChannelPage'
import ComponentTestPage from './pages/ComponentTestPage' 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<LoginPage />} />
        
        <Route path="/channel/:channelId" element={<ChannelPage />} />
        <Route path="/componentTest" element={<ComponentTestPage />} />
      </Routes>
    </BrowserRouter>
  )
=======
import { RouterProvider } from 'react-router-dom'
import { router } from "./routes"


function App() {
  return <RouterProvider router={router} />
>>>>>>> SH
}

export default App