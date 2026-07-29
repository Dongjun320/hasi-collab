// 하단바에 들어가는 날씨 위젯: 아이콘 + 온도 + 지역.
// 데이터/캐싱/권한은 weatherStore가 담당. 여기선 표시만.
// enabled=off 이거나 위치 거부/에러 시 아무것도 안 그림.

import { useEffect } from 'react'
import { useWeatherStore } from '../store/weatherStore'

// WMO weather_code → 이모지 + 한글 설명
const weatherInfo = (code: number): { icon: string; label: string } => {
  if (code === 0) return { icon: '☀️', label: '快晴' }
  if (code <= 2) return { icon: '🌤️', label: '晴れ' }
  if (code === 3) return { icon: '☁️', label: '曇り' }
  if (code <= 48) return { icon: '🌫️', label: '霧' }
  if (code <= 57) return { icon: '🌦️', label: '霧雨' }
  if (code <= 67) return { icon: '🌧️', label: '雨' }
  if (code <= 77) return { icon: '🌨️', label: '雪' }
  if (code <= 82) return { icon: '🌦️', label: 'にわか雨' }
  if (code <= 86) return { icon: '🌨️', label: 'にわか雪' }
  return { icon: '⛈️', label: '雷雨' }
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
    return <span className="no-drag text-[11px] text-white/40 select-none">天気…</span>
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
