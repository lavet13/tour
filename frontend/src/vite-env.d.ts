/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'tailwind-config' {
  const config: Config;
  export default config;
}

import '@tanstack/react-table'; //or vue, svelte, solid, qwik, etc.

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'select' | 'dateRange' | 'range'
  }
}
