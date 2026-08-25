//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import './i18n'   // i18next 초기화 (앱 렌더 전)
import App from './App'

createRoot(document.getElementById('root')!).render(
    <App />
)
