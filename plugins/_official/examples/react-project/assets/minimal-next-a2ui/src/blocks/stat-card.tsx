'use client';

import type { BlockProps } from 'src/genui/schema';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { hookRegistry } from 'src/genui/hook-registry';

/**
 * @od-component StatCardBlock
 * @mui components=Card,Typography
 * @notes KPI tile. Two modes:
 *   - static: `value` literal.
 *   - bound:  `source` computes the value live from a data hook
 *             (count / countWhere / sum) — so KPIs reflect real data instead
 *             of hardcoded numbers. The bound branch lives in a child component
 *             that ALWAYS calls exactly one hook (rules-of-hooks safe); the
 *             static branch calls none.
 *   `color` selects a theme palette key (sanctioned accents + semantic).
 * @posicube-minimal version=0.1.0
 */
type StatWhere = { field: string; equals: string | number };

type StatSource = {
  hook: string;
  agg: 'count' | 'countWhere' | 'sum';
  field?: string;
  equals?: string | number;
  /** Optional row filter for `sum` (e.g. sum amount where status === "paid"). */
  where?: StatWhere;
  format?: 'number' | 'currency';
};

export function StatCardBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    label?: string;
    value?: string | number;
    color?: string;
    source?: StatSource;
  };
  const color = props.color ?? 'primary';

  return (
    <Card sx={{ flex: 1, minWidth: 180, p: 3 }}>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        {props.label}
      </Typography>
      {props.source ? (
        <BoundStatValue source={props.source} color={color} />
      ) : (
        <Typography variant="h3" sx={{ mt: 1, color: `${color}.main` }}>
          {props.value}
        </Typography>
      )}
    </Card>
  );
}

function BoundStatValue({ source, color }: { source: StatSource; color: string }) {
  const useData = hookRegistry[source.hook] ?? hookRegistry.useCustomers;
  const { data, isLoading } = useData();
  const rows = (data as Record<string, unknown>[] | undefined) ?? [];
  const display = isLoading ? '…' : formatStat(aggregate(rows, source), source);

  return (
    <Typography variant="h3" sx={{ mt: 1, color: `${color}.main` }}>
      {display}
    </Typography>
  );
}

function aggregate(rows: Record<string, unknown>[], source: StatSource): number {
  switch (source.agg) {
    case 'countWhere':
      return rows.filter((row) => String(row[source.field ?? '']) === String(source.equals)).length;
    case 'sum': {
      const filtered = source.where
        ? rows.filter((row) => String(row[source.where!.field]) === String(source.where!.equals))
        : rows;
      return filtered.reduce((acc, row) => acc + (Number(row[source.field ?? '']) || 0), 0);
    }
    case 'count':
    default:
      return rows.length;
  }
}

function formatStat(value: number, source: StatSource): string {
  if (source.format === 'currency') {
    return `$${value.toLocaleString()}`;
  }
  return value.toLocaleString();
}
