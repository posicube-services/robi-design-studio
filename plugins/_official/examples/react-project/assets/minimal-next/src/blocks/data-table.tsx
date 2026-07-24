'use client';

import type { ReactNode } from 'react';
import type { BlockProps } from 'src/genui/schema';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableSortLabel from '@mui/material/TableSortLabel';
import TableContainer from '@mui/material/TableContainer';
import LinearProgress from '@mui/material/LinearProgress';
import TablePagination from '@mui/material/TablePagination';

import { Iconify } from 'src/components/iconify';
import { hookRegistry } from 'src/genui/hook-registry';
import { useMutationHandlers } from 'src/genui/mutation-registry';
import { applyBinding, useFilterBinding } from 'src/genui/filter-context';

/**
 * @od-component DataTableBlock
 * @mui components=Card,Table,TableSortLabel,TablePagination,Checkbox,Chip,Avatar,LinearProgress,Menu
 * @notes Rich list pattern (minimals.cc product-list class). Composed from
 *   base MUI — the ported Minimal theme overrides own the pixels, so no
 *   vendor table utils are needed. Spec-level features: entity/progress cell
 *   formats, checkbox selection, client-side sorting, pagination, row action
 *   menu. All optional — a minimal spec renders the simple table unchanged.
 * @posicube-minimal version=0.3.0
 */
type ColumnFormat = 'text' | 'number' | 'currency' | 'date' | 'entity' | 'progress';
type ColumnDef = {
  field: string;
  header: string;
  format?: ColumnFormat;
  /** entity format — field shown as the secondary line under the name. */
  secondaryField?: string;
  /** progress format — caption suffix, e.g. "in stock". */
  suffix?: string;
};

type ChipColor = 'success' | 'info' | 'error' | 'warning' | 'default' | 'primary';

/**
 * Row action — either a plain label (visual only, legacy) or a structured
 * action the LLM references by type:
 *  - navigate: client-side nav to an internal path; `href` may template row
 *    fields with {field}, e.g. "/p/customer-detail?id={id}".
 *  - mutation: call a mutation-registry entry by NAME with the row as vars
 *    (e.g. deleteCustomer). `confirm` gates destructive ones.
 */
type RowAction =
  | string
  | {
      label: string;
      type?: 'navigate' | 'mutation';
      href?: string;
      mutation?: string;
      confirm?: string;
    };

// Generic status → chip color. Unknown values fall back to 'default' so any
// data hook works without a code change.
const STATUS_COLOR: Record<string, ChipColor> = {
  active: 'success',
  trialing: 'info',
  churned: 'error',
  suspended: 'warning',
  invited: 'info',
  disabled: 'default',
  pending: 'warning',
  paid: 'success',
  refunded: 'info',
  failed: 'error',
  published: 'info',
  draft: 'default',
};

export function DataTableBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    hook?: string;
    title?: string;
    columns?: ColumnDef[];
    statusField?: string;
    emptyLabel?: string;
    bind?: string;
    searchFields?: string[];
    selectable?: boolean;
    pageSize?: number;
    rowActions?: RowAction[];
  };

  const columns = props.columns ?? [];
  const router = useRouter();
  // Resolve all registered mutations once (hooks-rules safe — fixed registry).
  const mutationHandlers = useMutationHandlers();

  // Resolve the bound hook by name (stable per node) and call it once,
  // unconditionally — uniform { data, isLoading } contract for every block.
  const useData = hookRegistry[props.hook ?? 'useCustomers'] ?? hookRegistry.useCustomers;
  const { data, isLoading } = useData();
  const allRows = (data as Record<string, unknown>[] | undefined) ?? [];

  // Subscribe to the spec's filter bus and filter rows client-side.
  const binding = useFilterBinding(props.bind);
  const filtered = props.bind ? applyBinding(allRows, binding, props.searchFields) : allRows;

  // Sorting (client-side, per clicked column).
  const [orderBy, setOrderBy] = useState<string | null>(null);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const sorted = useMemo(() => {
    if (!orderBy) return filtered;
    const factor = order === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = a[orderBy];
      const vb = b[orderBy];
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * factor;
      return String(va ?? '').localeCompare(String(vb ?? '')) * factor;
    });
  }, [filtered, orderBy, order]);

  // Pagination — enabled only when the spec sets pageSize. Filters can shrink
  // the result set below the current page, so clamp FIRST and slice with the
  // clamped page (page state itself may lag one render — harmless).
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(props.pageSize ?? 10);
  const safePage = Math.min(page, Math.max(0, Math.ceil(sorted.length / rowsPerPage) - 1));
  const paginated = props.pageSize
    ? sorted.slice(safePage * rowsPerPage, (safePage + 1) * rowsPerPage)
    : sorted;

  // Selection — keyed by STABLE row identity (row.id), never by position:
  // sorting/filtering reorders positions and index-based selection would
  // silently select different rows.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const rowKey = (row: Record<string, unknown>, index: number): string =>
    typeof row.id === 'string' || typeof row.id === 'number' ? String(row.id) : `#${index}`;

  const allKeys = sorted.map((row, index) => rowKey(row, index));
  const selectedVisible = allKeys.filter((key) => selected.has(key));

  const toggleAll = () => {
    setSelected(selectedVisible.length === sorted.length ? new Set() : new Set(allKeys));
  };

  const handleSort = (field: string) => {
    if (orderBy === field) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(field);
      setOrder('asc');
    }
  };

  const columnCount = columns.length + (props.selectable ? 1 : 0) + (props.rowActions?.length ? 1 : 0);

  return (
    <Card>
      {props.title && (
        // Minimal CardHeader has 0 bottom padding by theme (24/24/0) — give the
        // title breathing room before the table head instead of a hard divider
        // (the head's grey band already separates).
        <CardHeader
          title={props.title}
          subheader={
            props.selectable && selectedVisible.length > 0
              ? `${selectedVisible.length}개 선택됨`
              : undefined
          }
          sx={{ pb: 2.5 }}
        />
      )}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {props.selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={sorted.length > 0 && selectedVisible.length === sorted.length}
                    indeterminate={selectedVisible.length > 0 && selectedVisible.length < sorted.length}
                    onChange={toggleAll}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={column.field} sortDirection={orderBy === column.field ? order : false}>
                  <TableSortLabel
                    active={orderBy === column.field}
                    direction={orderBy === column.field ? order : 'asc'}
                    onClick={() => handleSort(column.field)}
                  >
                    {column.header}
                  </TableSortLabel>
                </TableCell>
              ))}
              {props.rowActions?.length ? <TableCell align="right" /> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {Array.from({ length: columnCount }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnCount}>
                  <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                    <Typography variant="subtitle1">
                      {props.emptyLabel ?? '표시할 데이터가 없습니다'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      필터를 초기화해 보세요.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              paginated.map((row, rowIndex) => {
                const absoluteIndex = props.pageSize ? safePage * rowsPerPage + rowIndex : rowIndex;
                const key = rowKey(row, absoluteIndex);
                return (
                  <TableRow key={key} hover selected={selected.has(key)}>
                    {props.selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected.has(key)}
                          onChange={() =>
                            setSelected((prev) => {
                              const next = new Set(prev);
                              if (next.has(key)) next.delete(key);
                              else next.add(key);
                              return next;
                            })
                          }
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.field}>
                        {renderCell(row, column, props.statusField)}
                      </TableCell>
                    ))}
                    {props.rowActions?.length ? (
                      <TableCell align="right" sx={{ pr: 1 }}>
                        <RowActionsMenu
                          actions={props.rowActions}
                          row={row}
                          router={router}
                          mutationHandlers={mutationHandlers}
                        />
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      {props.pageSize ? (
        <TablePagination
          component="div"
          count={sorted.length}
          page={safePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          onPageChange={(_, next) => setPage(next)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
        />
      ) : null}
    </Card>
  );
}

// ----------------------------------------------------------------------

function fillTemplate(template: string, row: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (_, field) => encodeURIComponent(String(row[field] ?? '')));
}

type RowActionsMenuProps = {
  actions: RowAction[];
  row: Record<string, unknown>;
  router: ReturnType<typeof useRouter>;
  mutationHandlers: Record<string, (vars: Record<string, unknown>) => void>;
};

function RowActionsMenu({ actions, row, router, mutationHandlers }: RowActionsMenuProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const run = (action: RowAction) => {
    setAnchor(null);
    if (typeof action === 'string') return; // legacy visual-only label

    if (action.confirm && typeof window !== 'undefined' && !window.confirm(action.confirm)) return;

    if (action.type === 'navigate' && action.href) {
      const href = fillTemplate(action.href, row);
      // Internal paths only — never let a spec navigate off-app.
      if (href.startsWith('/')) router.push(href);
      return;
    }
    if (action.type === 'mutation' && action.mutation) {
      mutationHandlers[action.mutation]?.(row);
    }
  };

  return (
    <>
      <IconButton size="small" onClick={(event) => setAnchor(event.currentTarget)}>
        <Iconify icon="eva:more-vertical-fill" width={18} />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {actions.map((action, index) => {
          const label = typeof action === 'string' ? action : action.label;
          const destructive = typeof action !== 'string' && Boolean(action.confirm);
          return (
            <MenuItem
              key={index}
              onClick={() => run(action)}
              sx={destructive ? { color: 'error.main' } : undefined}
            >
              {label}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

const ENTITY_AVATAR_COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;

function renderCell(
  row: Record<string, unknown>,
  column: ColumnDef,
  statusField?: string
): ReactNode {
  const value = row[column.field];

  if (statusField && column.field === statusField) {
    const status = String(value);
    return <Chip size="small" label={status} color={STATUS_COLOR[status] ?? 'default'} />;
  }

  switch (column.format) {
    case 'entity': {
      const name = String(value ?? '');
      const secondary = column.secondaryField ? String(row[column.secondaryField] ?? '') : '';
      const colorIndex = name.length % ENTITY_AVATAR_COLORS.length;
      return (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Avatar color={ENTITY_AVATAR_COLORS[colorIndex]} sx={{ width: 40, height: 40 }}>
            {name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle2">{name}</Typography>
            {secondary && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {secondary}
              </Typography>
            )}
          </Box>
        </Stack>
      );
    }
    case 'progress': {
      const amount = typeof value === 'number' ? Math.min(100, Math.max(0, value)) : 0;
      const tone = amount === 0 ? 'error' : amount < 20 ? 'warning' : 'success';
      const caption =
        amount === 0 ? '재고 없음' : `${value}${column.suffix ? ` ${column.suffix}` : ''}`;
      return (
        <Box sx={{ minWidth: 100 }}>
          <LinearProgress
            variant="determinate"
            value={amount}
            color={tone}
            sx={{ mb: 0.75, height: 6, maxWidth: 80 }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {caption}
          </Typography>
        </Box>
      );
    }
    case 'currency':
      if (typeof value === 'number') {
        return value === 0 ? '—' : `$${value.toLocaleString()}`;
      }
      return value == null ? '' : String(value);
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : String(value ?? '');
    case 'date':
    case 'text':
    default:
      return value == null ? '' : String(value);
  }
}
