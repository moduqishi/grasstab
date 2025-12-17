/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TARGET_BROWSER?: string;
  readonly DEV: boolean;
  // 其他环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Chrome Extension API 类型声明
declare namespace chrome {
  namespace search {
    interface QueryInfo {
      text: string;
      disposition?: 'CURRENT_TAB' | 'NEW_TAB' | 'NEW_WINDOW';
      tabId?: number;
    }
    function query(queryInfo: QueryInfo): void;
  }
}
