/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEEPSEEK_API_KEY: string;
  // Add other VITE_* environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}