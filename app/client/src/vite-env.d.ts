/// <reference types="vite/client" />

// build 시점에 인라인되는 env. 값은 번들에 그대로 포함되므로 secret 금지.
interface ImportMetaEnv {
  /** service(8080) REST 베이스. 비우면 같은 origin + Vite 프록시 사용 (개발용). */
  readonly VITE_API_BASE_URL?: string;
  /** messenger(8081) REST 베이스. */
  readonly VITE_MESSENGER_API_BASE_URL?: string;
  /** messenger STOMP 엔드포인트. HTTPS 배포에서는 반드시 wss://. */
  readonly VITE_WS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
