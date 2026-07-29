// 하단바 날씨 위젯용 store.
// Open-Meteo(무료·키 없음) + BigDataCloud 역지오코딩(무료·키 없음)으로
// 사용자 위치의 현재 날씨를 가져온다. enabled(on/off)만 localStorage에 저장.
//
// 호출 절약: 10분 캐시 + 위치 권한 거부/에러 시 조용히 숨김(위젯에서 처리).

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WeatherData {
  temp: number      // 섭씨 (반올림)
  code: number      // WMO weather_code
  region: string    // 도시/지역명 (없으면 '')
}

export type WeatherStatus = 'idle' | 'loading' | 'ready' | 'error' | 'denied'

interface WeatherState {
  enabled: boolean          // 설정 on/off (기본 on) — persist 대상
  data: WeatherData | null
  status: WeatherStatus
  lastFetch: number         // epoch ms
  setEnabled: (v: boolean) => void
  loadWeather: (force?: boolean) => void
}

const CACHE_MS = 10 * 60 * 1000  // 10분 안에는 재조회 안 함

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set, get) => ({
      enabled: true,
      data: null,
      status: 'idle',
      lastFetch: 0,

      setEnabled: (v) => {
        set({ enabled: v })
        if (v) get().loadWeather()
      },

      loadWeather: (force = false) => {
        const s = get()
        if (!s.enabled) return
        if (s.status === 'loading') return
        if (!force && s.data && Date.now() - s.lastFetch < CACHE_MS) return  // 캐시 유효
        if (!('geolocation' in navigator)) { set({ status: 'error' }); return }

        set({ status: 'loading' })
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude: lat, longitude: lon } = pos.coords
              const [wRes, gRes] = await Promise.all([
                fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`),
                fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ja`),
              ])
              const w = await wRes.json()
              const g = await gRes.json().catch(() => ({} as any))
              const region = g.city || g.locality || g.principalSubdivision || ''
              set({
                data: {
                  temp: Math.round(w.current.temperature_2m),
                  code: w.current.weather_code,
                  region,
                },
                status: 'ready',
                lastFetch: Date.now(),
              })
            } catch {
              set({ status: 'error' })
            }
          },
          () => set({ status: 'denied' }),   // 사용자가 위치 거부
          { timeout: 10000, maximumAge: CACHE_MS },
        )
      },
    }),
    {
      name: 'hasi-weather',
      partialize: (s) => ({ enabled: s.enabled }),  // enabled만 저장 (날씨 데이터는 매번 새로)
    },
  ),
)
