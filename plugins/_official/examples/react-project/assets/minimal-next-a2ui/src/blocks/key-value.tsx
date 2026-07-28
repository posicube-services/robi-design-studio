'use client';

import type { BlockProps } from 'src/genui/schema';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { hookRegistry } from 'src/genui/hook-registry';

/**
 * @od-component KeyValueBlock
 * @mui components=Card,Stack,Typography
 * @notes Detail pattern: label/value rows. Two data modes — (a) hook + fields
 *   reads one record (rowIndex) from a registered hook, (b) literal `items`.
 *   Formatting mirrors DataTable's column formats so 상세/목록 stay consistent.
 * @posicube-minimal version=0.1.0
 */
type FieldDef = { field?: string; label?: string; format?: 'currency' | 'number' | 'date' };
type ItemDef = { label?: string; value?: string | number };

function formatValue(value: unknown, format?: FieldDef['format']): string {
  if (value == null || value === '') return '—';
  if (format === 'currency' && typeof value === 'number') return `$${value.toLocaleString()}`;
  if (format === 'number' && typeof value === 'number') return value.toLocaleString();
  if (format === 'date') {
    const date = new Date(String(value));
    if (!Number.isNaN(date.getTime())) return date.toLocaleDateString('ko-KR');
  }
  return String(value);
}

export function KeyValueBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    title?: string;
    hook?: string;
    rowIndex?: number;
    fields?: FieldDef[];
    items?: ItemDef[];
  };

  // Resolve the bound hook by name and call it unconditionally (stable per
  // node) — same uniform contract as DataTable/StatCard.
  const useData = hookRegistry[props.hook ?? 'useCustomers'] ?? hookRegistry.useCustomers;
  const { data, isLoading } = useData();

  const usesHook = Boolean(props.hook);
  const rows = (data as Record<string, unknown>[] | undefined) ?? [];
  const record = rows[props.rowIndex ?? 0];

  const entries: { label: string; value: string }[] = usesHook
    ? (props.fields ?? []).map((field) => ({
        label: field.label ?? field.field ?? '',
        value: formatValue(record?.[field.field ?? ''], field.format),
      }))
    : (props.items ?? []).map((item) => ({
        label: item.label ?? '',
        value: formatValue(item.value),
      }));

  return (
    <Card>
      {props.title && (
        <>
          <CardHeader title={props.title} />
          <Divider />
        </>
      )}
      <Stack sx={{ p: 3 }} spacing={2} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
        {usesHook && isLoading
          ? Array.from({ length: Math.max(props.fields?.length ?? 3, 1) }).map((_, index) => (
              <Skeleton key={index} variant="text" width="60%" />
            ))
          : entries.map((entry, index) => (
              <Stack key={index} direction="row" spacing={2}>
                <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 120 }}>
                  {entry.label}
                </Typography>
                <Typography variant="subtitle2">{entry.value}</Typography>
              </Stack>
            ))}
      </Stack>
    </Card>
  );
}
