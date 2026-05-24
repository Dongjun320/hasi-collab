import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage' // 1. 로그인 페이지 컴포넌트를 import 합니다.
import ChannelPage from './pages/ChannelPage'
<<<<<<< HEAD
import ComponentTestPage from './pages/ComponentTestPage'
=======
import ComponentTestPage from './pages/ComponentTestPage' 
>>>>>>> origin/ParkKyutae-branch

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<LoginPage />} />
        
        <Route path="/channel/:channelId" element={<ChannelPage />} />
<<<<<<< HEAD
        <Route path="/ComponentTestPage" element={<ComponentTestPage />} />
=======
        <Route path="/componentTest" element={<ComponentTestPage />} />
>>>>>>> origin/ParkKyutae-branch
      </Routes>
    </BrowserRouter>
  )
}

export default App
export default App