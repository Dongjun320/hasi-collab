import { useEffect, useRef } from 'react'

const CHARS = ['H', 'A', 'S', 'I'] as const

const PILLARS = [
  { x: 70,  y2: 114, cls: 'lsw-p1' },
  { x: 115, y2: 98,  cls: 'lsw-p2' },
  { x: 160, y2: 91,  cls: 'lsw-p3' },
  { x: 200, y2: 91,  cls: 'lsw-p4' },
  { x: 245, y2: 98,  cls: 'lsw-p5' },
  { x: 290, y2: 114, cls: 'lsw-p6' },
] as const

const C0 = [93,  242, 206]
const C1 = [255, 235, 59]
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const eio  = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2

const CSS = `
  @keyframes lsw-char-in {
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes lsw-draw {
    to { stroke-dashoffset: 0; }
  }
  @keyframes lsw-fade-in {
    to { opacity: 1; }
  }
  @keyframes lsw-logo-pulse {
    0%, 100% { filter: brightness(1); }
    50%      { filter: brightness(1.25) drop-shadow(0 0 8px rgba(93,242,206,0.4)); }
  }
  .lsw-char {
    display: inline-block;
    opacity: 0;
    transform: translateY(22px);
    animation: lsw-char-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards 0s;
  }
  .lsw-beam {
    stroke-dasharray: 320;
    stroke-dashoffset: 320;
    animation: lsw-draw 0.75s ease-out forwards 0s;
  }
  .lsw-arch {
    animation: lsw-draw 0.75s ease-in-out forwards 0s;
  }
  .lsw-p1 { stroke-dasharray: 26; stroke-dashoffset: 26; animation: lsw-draw .75s ease forwards 0s; }
  .lsw-p2 { stroke-dasharray: 42; stroke-dashoffset: 42; animation: lsw-draw .75s ease forwards 0s; }
  .lsw-p3 { stroke-dasharray: 49; stroke-dashoffset: 49; animation: lsw-draw .75s ease forwards 0s; }
  .lsw-p4 { stroke-dasharray: 49; stroke-dashoffset: 49; animation: lsw-draw .75s ease forwards 0s; }
  .lsw-p5 { stroke-dasharray: 42; stroke-dashoffset: 42; animation: lsw-draw .75s ease forwards 0s; }
  .lsw-p6 { stroke-dasharray: 26; stroke-dashoffset: 26; animation: lsw-draw .75s ease forwards 0s; }
  .lsw-logo-pulse {
    animation: lsw-logo-pulse 2.8s ease-in-out infinite 1.2s;
  }
  .lsw-status {
    opacity: 0;
    animation: lsw-fade-in .3s ease forwards 0.5s;
  }
`

export default function LoadingScreenWhite() {
  const logoRef      = useRef<HTMLDivElement>(null)
  const charRefs     = useRef<(HTMLSpanElement | null)[]>([])
  const archRef      = useRef<SVGPathElement>(null)
  const dotsLayerRef = useRef<SVGGElement>(null)
  const statusRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 아치 길이로 dasharray 설정
    if (archRef.current) {
      const len = Math.ceil(archRef.current.getTotalLength())
      archRef.current.style.strokeDasharray  = `${len}`
      archRef.current.style.strokeDashoffset = `${len}`
    }

    // 글자별 그라디언트 주입 (민트→흰색)
    if (logoRef.current) {
      const logoRect = logoRef.current.getBoundingClientRect()
      charRefs.current.forEach(ch => {
        if (!ch) return
        const xOff = ch.getBoundingClientRect().left - logoRect.left
        const s = ch.style as unknown as Record<string, string>
        s.backgroundImage      = 'linear-gradient(90deg, #5DF2CE 0%, #a8f5e5 55%, #FFEB3B 100%)'
        s.backgroundSize       = `${logoRect.width}px 100%`
        s.backgroundPosition   = `-${xOff}px 0`
        s.webkitBackgroundClip = 'text'
        s.webkitTextFillColor  = 'transparent'
        s.backgroundClip       = 'text'
      })
    }

    // 상태 텍스트 말줄임
    let dotN = 3
    const ellipsisId = setInterval(() => {
      dotN = dotN >= 3 ? 1 : dotN + 1
      if (statusRef.current) {
        statusRef.current.textContent = '팀을 연결하는 중' + '.'.repeat(dotN)
      }
    }, 550)

    // 흐르는 점 — 아치 곡선 위를 따라 이동
    const layer    = dotsLayerRef.current!
    const archPath = archRef.current
    if (!archPath) return

    const totalLen = archPath.getTotalLength()

    function spawnDot() {
      if (!layer || !archPath) return
      const el  = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      const dur = 900 + Math.random() * 400
      el.setAttribute('r',       (4.5 + Math.random() * 2.0).toFixed(1))
      el.setAttribute('cx',      archPath.getPointAtLength(0).x.toFixed(1))
      el.setAttribute('cy',      archPath.getPointAtLength(0).y.toFixed(1))
      el.setAttribute('opacity', '0')
      layer.appendChild(el)

      let t0: number | null = null
      function tick(ts: number) {
        if (!t0) t0 = ts
        const p  = Math.min((ts - t0) / dur, 1)
        const e  = eio(p)
        const pt = archPath!.getPointAtLength(e * totalLen)
        el.setAttribute('cx', pt.x.toFixed(1))
        el.setAttribute('cy', pt.y.toFixed(1))
        el.setAttribute('fill',
          `rgb(${Math.round(lerp(C0[0], C1[0], e))},` +
          `${Math.round(lerp(C0[1], C1[1], e))},` +
          `${Math.round(lerp(C0[2], C1[2], e))})`
        )
        const alpha = (p < 0.1 ? p / 0.1 : p > 0.9 ? (1 - p) / 0.1 : 1) * 0.9
        el.setAttribute('opacity', alpha.toFixed(3))
        if (p < 1) requestAnimationFrame(tick)
        else if (el.parentNode) layer.removeChild(el)
      }
      requestAnimationFrame(tick)
    }

    const timers: ReturnType<typeof setTimeout>[] = []
    const intervals: ReturnType<typeof setInterval>[] = []
    timers.push(setTimeout(() => {
      spawnDot()
      timers.push(setTimeout(spawnDot, 280))
      timers.push(setTimeout(spawnDot, 560))
      intervals.push(setInterval(spawnDot, 400))
    }, 800))

    return () => {
      clearInterval(ellipsisId)
      timers.forEach(clearTimeout)
      intervals.forEach(clearInterval)
    }
  }, [])

  return (
    <>
      <style>{CSS}</style>
      <div className="w-full h-full flex items-center justify-center bg-[#2C3434] overflow-hidden rounded-2xl">
        {/* 배경 방사광 */}
        <div
          className="pointer-events-none fixed inset-0"
          style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(93,242,206,0.08) 0%, transparent 70%)' }}
        />

        <div className="relative flex flex-col items-center gap-9">
          {/* 로고 */}
          <div ref={logoRef} className="lsw-logo-pulse text-[38px] font-bold tracking-[10px]">
            {CHARS.map((ch, i) => (
              <span
                key={ch}
                ref={el => { charRefs.current[i] = el }}
                className="lsw-char"
              >
                {ch}
              </span>
            ))}
          </div>

          {/* 브릿지 SVG */}
          <svg width="360" height="160" viewBox="0 0 360 160" fill="none" className="block overflow-visible">
            <defs>
              <linearGradient id="lsw-grad-white" x1="20" y1="0" x2="340" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#5DF2CE" />
                <stop offset="100%" stopColor="#DDEB3B" />
              </linearGradient>
              <filter id="lsw-glow-white" x="-15%" y="-40%" width="130%" height="180%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g filter="url(#lsw-glow-white)">
              <line className="lsw-beam"
                x1="20" y1="140" x2="340" y2="140"
                stroke="url(#lsw-grad-white)" strokeWidth="4" strokeLinecap="round"
              />
              <path
                ref={archRef}
                className="lsw-arch"
                d="M 20 140 Q 180 40 340 140"
                stroke="url(#lsw-grad-white)" strokeWidth="4" strokeLinecap="round"
              />
              {PILLARS.map(({ x, y2, cls }) => (
                <line
                  key={x}
                  className={cls}
                  x1={x} y1="140" x2={x} y2={y2}
                  stroke="url(#lsw-grad-white)" strokeWidth="3" strokeLinecap="round"
                />
              ))}
            </g>

            <g ref={dotsLayerRef} />
          </svg>

          {/* 상태 텍스트 */}
          <div
            ref={statusRef}
            className="lsw-status text-xs tracking-[3.5px] text-[#6A8A8A] uppercase"
          >
            팀을 연결하는 중...
          </div>
        </div>
      </div>
    </>
  )
}
