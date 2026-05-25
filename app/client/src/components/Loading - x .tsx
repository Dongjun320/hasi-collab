import React from 'react';

const styles = `
  @keyframes roll-in {
    0%   { transform: translateX(90px) rotate(15deg) scaleX(-1); }
    55%  { transform: translateX(-5px) rotate(-5deg) scaleX(-1); }
    78%  { transform: translateX(3px) rotate(2deg) scaleX(-1); }
    100% { transform: translateX(0px) rotate(0deg) scaleX(-1); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(-2deg) scaleX(-1); }
    50%       { transform: translateY(-10px) rotate(2deg) scaleX(-1); }
  }
  @keyframes trail-fade {
    0%   { opacity: 0; stroke-dashoffset: 140; }
    25%  { opacity: 0.4; stroke-dashoffset: 60; }
    100% { opacity: 0.08; stroke-dashoffset: 0; }
  }
  @keyframes wave-slide {
    0%   { stroke-dashoffset: 70; opacity: 0; }
    18%  { opacity: 1; }
    70%  { stroke-dashoffset: -10; opacity: 0.7; }
    100% { stroke-dashoffset: -40; opacity: 0; }
  }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes progress-fill {
    0%   { width: 0%; }
    30%  { width: 24%; }
    65%  { width: 57%; }
    88%  { width: 80%; }
    100% { width: 92%; }
  }

  .pal-page-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 2rem;
  }
  .pal-scene {
    position: relative;
    width: 320px;
    height: 240px;
  }
  .pal-plane-wrap {
    position: absolute;
    left: 50%;
    top: 38px;
    margin-left: -36px;
    transform: scaleX(-1);
    animation: roll-in 1.1s cubic-bezier(0.22,1,0.36,1) forwards,
               float 2.8s ease-in-out 1.1s infinite;
    transform-origin: center;
    z-index: 3;
  }
  .pal-plane-svg {
    width: 72px;
    height: 72px;
  }
  .pal-scene-svg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
  }
  .pal-wave-path {
    fill: none;
    stroke: #A8E6B8;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-dasharray: 70;
    stroke-dashoffset: 70;
    opacity: 0;
  }
  .pal-wt1 { animation: wave-slide 1.9s ease-in-out 1.30s infinite; }
  .pal-wt2 { animation: wave-slide 1.9s ease-in-out 1.65s infinite; }
  .pal-wb1 { animation: wave-slide 1.9s ease-in-out 1.45s infinite; }
  .pal-wb2 { animation: wave-slide 1.9s ease-in-out 1.80s infinite; }
  .pal-label {
    margin-top: 14px;
    font-size: 15px;
    font-weight: 500;
    color: #555;
    animation: fade-in 0.5s ease-out 0.9s both;
  }
  .pal-sub-label {
    margin-top: 6px;
    font-size: 12px;
    color: #999;
    animation: fade-in 0.5s ease-out 1.1s both;
  }
  .pal-progress-track {
    width: 160px;
    height: 3px;
    background: #D4F0A0;
    border-radius: 99px;
    margin-top: 16px;
    overflow: hidden;
    animation: fade-in 0.4s ease-out 1s both;
  }
  .pal-progress-bar {
    height: 100%;
    background: #5CC87A;
    border-radius: 99px;
    animation: progress-fill 3.5s cubic-bezier(0.4,0,0.2,1) 0.5s forwards;
    width: 0;
  }
  .pal-trail {
    fill: none;
    stroke: #D4F0A0;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-dasharray: 140;
    animation: trail-fade 1.8s ease-out 0.3s forwards;
    opacity: 0;
  }
`;

const PaperAirplaneLoading: React.FC = () => {
  return (
    <>
      <style>{styles}</style>
      <div className="pal-page-wrap" role="status" aria-label="로딩 중">
        <div className="pal-scene">

          {/* Background SVG: trail, waves, bridge */}
          <svg
            className="pal-scene-svg"
            viewBox="0 0 320 240"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Tower gradient: light → bright → dark green */}
              <linearGradient id="pal-towerGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#5CC87A" />
                <stop offset="45%"  stopColor="#A8E6B8" />
                <stop offset="100%" stopColor="#2E8B4F" />
              </linearGradient>
              {/* Deck gradient: light → mid green */}
              <linearGradient id="pal-deckGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#A8E6B8" />
                <stop offset="100%" stopColor="#5CC87A" />
              </linearGradient>
            </defs>

            {/* Trail */}
            <path
              className="pal-trail"
              d="M 260 74 Q 232 70 205 74 Q 185 78 172 72"
            />

            {/* Air waves along wings */}
            <path className="pal-wave-path pal-wt1" d="M 190 58 Q 174 50 158 58 Q 142 66 126 58" />
            <path className="pal-wave-path pal-wt2" d="M 178 51 Q 162 43 146 51 Q 130 59 114 51" />
            <path className="pal-wave-path pal-wb1" d="M 190 90 Q 174 98 158 90 Q 142 82 126 90" />
            <path className="pal-wave-path pal-wb2" d="M 178 97 Q 162 105 146 97 Q 130 89 114 97" />

            {/* Water ripple */}
            <ellipse cx="160" cy="237" rx="88" ry="4" fill="#A8E6B8" opacity="0.18" />

            {/* Main cable shadow */}
            <path
              fill="none" stroke="#2E8B4F" strokeWidth="1.5"
              strokeLinecap="round" opacity="0.25"
              d="M 63 231 Q 160 170 257 231"
            />
            {/* Main cable */}
            <path
              fill="none" stroke="#5CC87A" strokeWidth="3"
              strokeLinecap="round"
              d="M 62 230 Q 160 167 258 230"
            />

            {/* Deck shadow */}
            <rect x="54" y="228" width="212" height="5" rx="2.5" fill="#2E8B4F" opacity="0.3" />
            {/* Deck body */}
            <rect x="54" y="221" width="212" height="8" rx="4" fill="url(#pal-deckGrad)" />
            {/* Deck highlight */}
            <rect x="60" y="222" width="200" height="2" rx="1" fill="#D4F0A0" opacity="0.55" />

            {/* Left tower */}
            <rect x="88" y="193" width="12" height="36" rx="6" fill="url(#pal-towerGrad)" />
            <ellipse cx="94" cy="193" rx="6" ry="5" fill="#A8E6B8" />
            <ellipse cx="91" cy="196" rx="2" ry="6" fill="#D4F0A0" opacity="0.5" />

            {/* Right tower */}
            <rect x="220" y="193" width="12" height="36" rx="6" fill="url(#pal-towerGrad)" />
            <ellipse cx="226" cy="193" rx="6" ry="5" fill="#A8E6B8" />
            <ellipse cx="223" cy="196" rx="2" ry="6" fill="#D4F0A0" opacity="0.5" />

            {/* Suspender cables */}
            <line x1="107" y1="221" x2="101" y2="207" stroke="#5CC87A" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
            <line x1="129" y1="221" x2="124" y2="199" stroke="#5CC87A" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
            <line x1="150" y1="221" x2="150" y2="194" stroke="#5CC87A" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
            <line x1="170" y1="221" x2="170" y2="194" stroke="#5CC87A" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
            <line x1="191" y1="221" x2="196" y2="199" stroke="#5CC87A" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
            <line x1="213" y1="221" x2="219" y2="207" stroke="#5CC87A" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />

            {/* Water surface */}
            <path
              fill="none" stroke="#A8E6B8" strokeWidth="1"
              strokeLinecap="round" opacity="0.28"
              d="M 54 236 Q 100 233 160 235 Q 220 237 266 234"
            />
          </svg>

          {/* Paper airplane — green palette */}
          <div className="pal-plane-wrap">
            <svg
              className="pal-plane-svg"
              viewBox="0 0 80 80"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
            >
              {/* Main body */}
              <polygon points="8,40 72,16 56,40 72,64" fill="#5CC87A" opacity="0.93" />
              {/* Top face */}
              <polygon points="8,40 72,16 44,48" fill="#2E8B4F" />
              {/* Bottom face */}
              <polygon points="56,40 44,48 72,64" fill="#1a5e33" opacity="0.7" />
              {/* Belly flap */}
              <polygon points="8,40 44,48 40,56" fill="#A8E6B8" opacity="0.6" />
              {/* Crease line */}
              <line x1="44" y1="48" x2="72" y2="16" stroke="#D4F0A0" strokeWidth="0.8" opacity="0.5" />
            </svg>
          </div>
        </div>

        <p className="pal-label">작업을 처리하고 있어요</p>
        <p className="pal-sub-label">잠시만 기다려 주세요</p>

        <div className="pal-progress-track">
          <div className="pal-progress-bar" />
        </div>
      </div>
    </>
  );
};

export default PaperAirplaneLoading;
