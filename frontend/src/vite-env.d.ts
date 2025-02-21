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
import { List } from 'lucide-react';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'select' | 'combobox' | 'dateRange' | 'timeRange' | 'range';
    items?: Array<any>;
  }
  interface FilterFns<TData extends RowData> {
    fuzzy: FilterFnOption<TData>;
  }
  interface TableMeta<TData extends RowData> {
    // updateData: (originalId: string, columnId: string, value: unknown) => void;
    onEditSchedule?: (id: string) => void;
    onDeleteSchedule?: (id: string) => void;
  }
}
