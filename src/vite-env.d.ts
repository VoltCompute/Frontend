/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL de base de l'API backend VoltCompute (ex: http://localhost:8000) */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
