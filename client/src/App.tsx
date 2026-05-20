import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ChannelPage from './pages/ChannelPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/channel/:channelId" element={<ChannelPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
