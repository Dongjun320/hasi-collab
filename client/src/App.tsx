import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ChannelPage from './pages/ChannelPage'
import ComponentTestPage from './pages/ComponentTestPage' // 컴포넌트 import 추가 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/channel/:channelId" element={<ChannelPage />} />
        {/* 테스트 페이지 라우트 추가 */}
        <Route path="/componentTest" element={<ComponentTestPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App