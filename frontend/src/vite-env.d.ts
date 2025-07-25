/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URI: string;
  readonly VITE_GRAPHQL_URI_DEV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'tailwind-config' {
  const config: Config;
  export default config;
}

import '@tanstack/react-table';
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
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
  }
}

declare global {
  interface Window {
    [key: string]: any;
  }
}
