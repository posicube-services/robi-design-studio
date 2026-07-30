'use client';

import type { BlockProps } from 'src/genui/schema';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown, MoreVertical } from 'lucide-react';

import { hookRegistry } from 'src/genui/hook-registry';
import { applyBinding, useFilterBinding } from 'src/genui/filter-context';
import { useMutationHandlers } from 'src/genui/mutation-registry';
import { Badge, Button, Card, CardHeader, Checkbox, EmptyState, Progress } from 'src/ui/primitives';
import { fmt, paletteVar, statusTone } from 'src/lib/tokens';

/**
 * @od-component DataTableBlock
 * @notes The block the substrate choice hinges on. MUI ships this as
 *   `@mui/x-data-grid`; here it is table markup plus @tanstack/react-table for
 *   sort/select/paginate. Feature surface is deliberately what the CATALOG
 *   declares — virtualization, column resize/reorder, grouping and CSV export are
 *   DataGrid features no catalog prop exposes, so they are not reproduced.
 */
type Row = Record<string, unknown>;

type ColumnSpec = {
  field: string;
  header: string;
  format?: 'currency' | 'number' | 'date' | 'entity' | 'progress';
  secondaryField?: string;
  suffix?: string;
};

type RowAction =
  | string
  | { label: string; type?: 'navigate' | 'mutation'; href?: string; mutation?: string; confirm?: string };

export function DataTableBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    title?: string;
    hook?: string;
    statusField?: string;
    emptyLabel?: string;
    bind?: string;
    searchFields?: string[];
    selectable?: boolean;
    pageSize?: number;
    rowActions?: RowAction[];
    columns?: ColumnSpec[];
  };

  // Called unconditionally so every render path keeps the same hook order.
  const useData = hookRegistry[props.hook ?? 'useCustomers'] ?? hookRegistry.useCustomers!;
  const { data, isLoading } = useData();
  const binding = useFilterBinding(props.bind);
  const mutations = useMutationHandlers();
  const router = useRouter();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const columns = Array.isArray(props.columns) ? props.columns : [];
  const rows = useMemo(
    () => applyBinding((data as Row[] | undefined) ?? [], binding, props.searchFields),
    [data, binding, props.searchFields],
  );

  const defs = useMemo<ColumnDef<Row>[]>(
    () =>
      columns.map((spec) => ({
        id: spec.field,
        accessorFn: (row) => row[spec.field],
        header: spec.header,
        cell: ({ row }) => renderCell(spec, row.original, props.statusField),
      })),
    [columns, props.statusField],
  );

  const table = useReactTable({
    data: rows,
    columns: defs,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(props.pageSize
      ? { getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: props.pageSize } } }
      : {}),
  });

  const pageRows = table.getRowModel().rows;
  const allOnPage = pageRows.length > 0 && pageRows.every((r) => selected[r.id]);
  const someOnPage = pageRows.some((r) => selected[r.id]);
  const selectedCount = Object.values(selected).filter(Boolean).length;

  function runAction(action: RowAction, row: Row) {
    if (typeof action === 'string') return;
    if (action.confirm && !window.confirm(action.confirm)) return;
    if (action.type === 'navigate' && action.href) {
      // `{field}` templates against the row, so one spec serves every row.
      router.push(action.href.replace(/\{(\w+)\}/g, (_, f) => String(row[f] ?? '')));
      return;
    }
    if (action.type === 'mutation' && action.mutation) mutations[action.mutation]?.(row);
  }

  return (
    <Card>
      <CardHeader
        title={props.title}
        action={selectedCount ? <span className="text-sm text-meta">{selectedCount}개 선택됨</span> : undefined}
      />

      {isLoading ? (
        <div className="flex flex-col gap-2 px-6 pb-6">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-10 animate-pulse rounded-md bg-border-soft/60" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState>{props.emptyLabel ?? '데이터가 없습니다'}</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface-warm">
                {props.selectable ? (
                  <th className="w-10 px-6 py-3 text-left">
                    <Checkbox
                      label="전체 선택"
                      checked={allOnPage}
                      indeterminate={someOnPage}
                      onChange={(next) => {
                        const patch: Record<string, boolean> = {};
                        for (const r of pageRows) patch[r.id] = next;
                        setSelected((cur) => ({ ...cur, ...patch }));
                      }}
                    />
                  </th>
                ) : null}
                {table.getHeaderGroups()[0]?.headers.map((header) => {
                  const dir = header.column.getIsSorted();
                  return (
                    <th key={header.id} className="whitespace-nowrap px-6 py-3 text-left">
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 text-xs text-meta transition-colors duration-fast ease-standard hover:text-fg"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {dir === 'asc' ? (
                          <ArrowUp className="size-3" />
                        ) : dir === 'desc' ? (
                          <ArrowDown className="size-3" />
                        ) : (
                          <ChevronsUpDown className="size-3 opacity-40" />
                        )}
                      </button>
                    </th>
                  );
                })}
                {props.rowActions?.length ? <th className="w-10 px-6 py-3" /> : null}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => (
                <tr key={row.id} className="border-t border-border-soft">
                  {props.selectable ? (
                    <td className="px-6 py-4">
                      <Checkbox
                        label={`${i + 1}행 선택`}
                        checked={Boolean(selected[row.id])}
                        onChange={(next) => setSelected((cur) => ({ ...cur, [row.id]: next }))}
                      />
                    </td>
                  ) : null}
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 align-middle text-fg">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                  {props.rowActions?.length ? (
                    <td className="relative px-6 py-4">
                      <Button
                        variant="ghost"
                        className="px-2"
                        onClick={() => setOpenMenu(openMenu === row.id ? null : row.id)}
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                      {openMenu === row.id ? (
                        <div className="absolute right-6 z-10 mt-1 min-w-32 rounded-md border border-border bg-surface py-1 shadow-raised">
                          {props.rowActions.map((action, k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => {
                                setOpenMenu(null);
                                runAction(action, row.original);
                              }}
                              className="block w-full px-4 py-2 text-left text-sm text-fg hover:bg-surface-warm"
                            >
                              {typeof action === 'string' ? action : action.label}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {props.pageSize && rows.length > 0 && !isLoading ? (
        <div className="flex items-center justify-between gap-3 border-t border-border-soft px-6 py-4">
          <span className="text-xs text-meta">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()} 페이지 · 총 {rows.length}건
          </span>
          <div className="flex gap-2">
            <Button variant="outline" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
              이전
            </Button>
            <Button variant="outline" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
              다음
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function renderCell(spec: ColumnSpec, row: Row, statusField?: string) {
  const value = row[spec.field];

  if (statusField && spec.field === statusField) {
    return <Badge tone={statusTone(value)}>{String(value ?? '')}</Badge>;
  }

  switch (spec.format) {
    case 'entity': {
      const primary = String(value ?? '');
      const secondary = spec.secondaryField ? String(row[spec.secondaryField] ?? '') : '';
      return (
        <span className="flex items-center gap-3">
          <span
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-pill text-xs"
            style={{
              background: `color-mix(in oklab, ${paletteVar('primary')} 14%, transparent)`,
              color: paletteVar('primary'),
            }}
          >
            {primary.slice(0, 1)}
          </span>
          <span className="flex flex-col">
            <span className="text-fg">{primary}</span>
            {secondary ? <span className="text-xs text-meta">{secondary}</span> : null}
          </span>
        </span>
      );
    }
    case 'progress':
      return <Progress value={Number(value ?? 0)} {...(spec.suffix ? { suffix: spec.suffix } : {})} />;
    case 'currency':
      return <span className="tabular-nums">{fmt.currency(value)}</span>;
    case 'number':
      return <span className="tabular-nums">{fmt.number(value)}</span>;
    case 'date':
      return <span className="text-fg-2">{fmt.date(value)}</span>;
    default:
      return <span>{String(value ?? '')}</span>;
  }
}
