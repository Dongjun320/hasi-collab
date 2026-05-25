/** @type {import('tailwindcss').Config} */
export default {
  plugins: {
    '@tailwindcss/postcss': {}, /* 👈 여기 이름을 이렇게 바꿔주세요! */
    autoprefixer: {},
  },
} 
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 모든 TSX 파일에서 클래스를 감지합니다.
  ],
  theme: {
    extend: {
      // 기존 styles.css 및 App.css의 애니메이션을 Tailwind로 이식
      keyframes: {
        float: {
          '0%': { transform: 'translateX(-200px)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        toastOut: {
          from: { opacity: '1', transform: 'translateX(0)' },
          to: { opacity: '0', transform: 'translateX(110%)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'cloud-float': 'float 30s infinite linear',
        'toast-in': 'toastIn 0.3s ease forwards',
        'toast-out': 'toastOut 0.3s ease forwards',
        'fade-in-up': 'fadeInUp 0.3s ease',
      },
      // 프로젝트 고유의 그라데이션 및 색상 확장 가능
      backgroundImage: {
        'hasi-gradient': 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
        'dashboard-gradient': 'linear-gradient(to bottom, #6ee7b7, #fde047)',
      }
    },
  },
  plugins: [],
}
