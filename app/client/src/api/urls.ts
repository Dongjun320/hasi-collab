// 환경별로 달라지는 service(8080) 주소를 한곳에서 만듭니다.
// 컴포넌트가 import.meta.env를 직접 읽지 않도록 하기 위한 모듈입니다.
//
// 개발: 환경변수 없이도 기존 동작 그대로.
// 배포: Cloudflare Pages의 VITE_API_BASE_URL 하나로 전부 전환됩니다.

/**
 * /api/** 경로용 베이스.
 *
 * 기본값이 '' — 개발에서는 상대경로가 되어 vite.config.ts의 `/api` 프록시가 처리합니다. 배포에서는 절대 URL.
 */
export const SERVICE_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * /oauth2/authorization/** 는 XHR이 아니라 브라우저 최상위 이동(window.location /
 * window.open)이라 Vite 프록시가 가로채지 않습니다. 따라서 빈 베이스를 쓰면
 * 개발 서버(5173)로 가서 404가 납니다 — 여기서는 `??`가 아니라 `||`로
 * 빈 문자열까지 fallback 시켜야 합니다.
 */
export function oauthAuthorizeUrl(provider: string): string {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  return `${base}/oauth2/authorization/${provider}`;
}
