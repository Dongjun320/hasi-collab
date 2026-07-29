// 하단바에 들어가는 날씨 위젯: 아이콘 + 온도 + 지역.
// 데이터/캐싱/권한은 weatherStore가 담당. 여기선 표시만.
// enabled=off 이거나 위치 거부/에러 시 아무것도 안 그림.

import { useEffect } from 'react'
import { useWeatherStore } from '../store/weatherStore'

// WMO weather_code → 이모지 + 한글 설명
const weatherInfo = (code: number): { icon: string; label: string } => {
  if (code === 0) return { icon: '☀️', label: '맑음' }
  if (code <= 2) return { icon: '🌤️', label: '구름 조금' }
  if (code === 3) return { icon: '☁️', label: '흐림' }
  if (code <= 48) return { icon: '🌫️', label: '안개' }
  if (code <= 57) return { icon: '🌦️', label: '이슬비' }
  if (code <= 67) return { icon: '🌧️', label: '비' }
  if (code <= 77) return { icon: '🌨️', label: '눈' }
  if (code <= 82) return { icon: '🌦️', label: '소나기' }
  if (code <= 86) return { icon: '🌨️', label: '소낙눈' }
  return { icon: '⛈️', label: '뇌우' }
}

export function WeatherWidget() {
  const enabled = useWeatherStore((s) => s.enabled)
  const data = useWeatherStore((s) => s.data)
  const status = useWeatherStore((s) => s.status)
  const loadWeather = useWeatherStore((s) => s.loadWeather)

  useEffect(() => {
    if (enabled) loadWeather()
  }, [enabled, loadWeather])

  // off · 권한거부 · 에러면 자리 차지 안 하고 숨김
  if (!enabled || status === 'denied' || status === 'error') return null

  if (!data) {
    return <span className="no-drag text-[11px] text-white/40 select-none">날씨…</span>
  }

  const { icon, label } = weatherInfo(data.code)
  return (
    <div
      className="no-drag flex items-center gap-1.5 text-white/70 text-xs select-none"
      title={`${label}${data.region ? ` · ${data.region}` : ''}`}
    >
      <span className="text-sm leading-none">{icon}</span>
      <span className="font-semibold">{data.temp}°</span>
      {data.region && <span className="text-white/50 max-w-[90px] truncate">{data.region}</span>}
    </div>
  )
}
