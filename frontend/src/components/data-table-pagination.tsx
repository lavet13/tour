import type { Table } from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { parseIntSafe } from '@/helpers/parse-int-safe';
import { useControllableState } from '@/hooks/use-controllable-state';
import { NumberFormatValues, NumericFormat } from 'react-number-format';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className='flex flex-col gap-4 items-start justify-between px-2 py-4'>
      {/* Selected rows info */}
      <div className='text-sm text-muted-foreground order-last sm:order-first w-full sm:w-auto text-center sm:text-left'>
        {table.getFilteredSelectedRowModel().rows.length} из{' '}
        {table.getFilteredRowModel().rows.length} строк(и) выбрано.
      </div>

      {/* Pagination controls container */}
      <div className='flex flex-col sm:flex-row items-center gap-4 sm:gap-2 md:gap-4 w-full sm:w-auto'>
        {/* Rows per page selector */}
        <div className='flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start'>
          <p className='text-sm font-medium'>Строк:</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={value => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 40, 50].map(pageSize => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Navigation buttons and current page indicator */}
        <div className='flex items-center gap-1 sm:gap-0 md:gap-2'>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8 p-0'
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>Перейти к первой странице</span>
            <ChevronsLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8 p-0'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>Перейти к предыдущей странице</span>
            <ChevronLeft className='h-4 w-4' />
          </Button>

          {/* Current page indicator */}
          <div className='flex items-center justify-center text-sm font-medium gap-1 min-w-[5rem] px-1.5 sm:px-0'>
            <span className='hidden sm:inline'>Стр.</span>
            {table.getState().pagination.pageIndex + 1}
            <span className='hidden sm:inline'>из</span>
            <span className='sm:hidden'>/ </span>
            {table.getPageCount().toLocaleString()}
          </div>

          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8 p-0'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>Перейти к следующей странице</span>
            <ChevronRight className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8 p-0'
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>Перейти к последней странице</span>
            <ChevronsRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
      <span className='flex self-center sm:self-start items-center gap-1'>
        Перейти к странице: <PaginatedInput table={table} />
      </span>
    </div>
  );
}

interface PaginatedInputProps<TData> {
  table: Table<TData>;
  value?: any;
  onValueChange?: (value: any) => void;
}

function PaginatedInput<TData>({
  table,
  value: valueProp,
  onValueChange,
}: PaginatedInputProps<TData>) {
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: table.getState().pagination.pageIndex + 1,
    onChange: onValueChange,
  });

  const isAllowed = (values: { floatValue?: number }) => {
    const { floatValue } = values;

    return (
      floatValue === undefined ||
      (floatValue >= 1 && floatValue <= table.getPageCount())
    );
  };

  const isDisabled = !isAllowed({ floatValue: value });

  const handleValueChange = (values: { floatValue?: number }) => {
    const { floatValue } = values;

    if (floatValue !== undefined) {
      setValue(floatValue);
      if (isAllowed(values)) {
        table.setPageIndex(floatValue - 1);
      }
    }
  };

  return (
    <NumericFormat
      className='p-1 w-16 h-8 flex-1'
      type='tel'
      value={value}
      onValueChange={handleValueChange}
      allowNegative={false}
      isAllowed={isAllowed}
      decimalScale={0}
      thousandSeparator={false}
      customInput={Input}
      disabled={isDisabled}
    />
  );
}
