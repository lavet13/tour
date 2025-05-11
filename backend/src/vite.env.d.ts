/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PORT: number;
  readonly VITE_GRAPHQL_ENDPOINT: string;
  readonly VITE_JWT_SECRET: string;
  readonly VITE_REFRESH_TOKEN_SECRET: string;
  readonly VITE_FRONTEND_URL: string;
  readonly VITE_TELEGRAM_BOT_ENABLED: string;
  readonly VITE_TELEGRAM_BOT_TOKEN: string;
  readonly VITE_TELEGRAM_MANAGER_CHAT_IDS: string;
  readonly VITE_TELEGRAM_MINI_APP_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
