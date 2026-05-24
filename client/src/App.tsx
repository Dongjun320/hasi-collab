import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ChannelPage from './pages/ChannelPage'
import ComponentTestPage from './pages/ComponentTestPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/channel/:channelId" element={<ChannelPage />} />
        <Route path="/ComponentTestPage" element={<ComponentTestPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
