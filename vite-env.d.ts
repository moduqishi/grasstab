/// \u003creference types="vite/client" /\u003e

interface ImportMetaEnv {
  readonly VITE_TARGET_BROWSER?: string;
  readonly DEV: boolean;
  // 其他环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
