'use client';

import type { BlockProps } from 'src/genui/schema';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

import { hookRegistry } from 'src/genui/hook-registry';
import { Card } from 'src/ui/primitives';
import { fmt, paletteVar } from 'src/lib/tokens';

type Source = { hook?: string; agg?: 'count' | 'sum'; field?: string };

/** KPI tile with a trend delta and an optional sparkline. */
export function AnalyticsWidgetBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    label?: string; total?: unknown; source?: Source; color?: string;
    trend?: number; money?: boolean; sparkHook?: string; sparkField?: string;
  };
  const source = props.source ?? {};

  const useTotal = hookRegistry[source.hook ?? 'useCustomers'] ?? hookRegistry.useCustomers!;
  const useSpark = hookRegistry[props.sparkHook ?? 'useMonthlyRevenue'] ?? hookRegistry.useMonthlyRevenue!;
  const { data: totalData } = useTotal();
  const { data: sparkData } = useSpark();

  let total = props.total;
  if (source.hook) {
    const rows = (totalData as Record<string, unknown>[] | undefined) ?? [];
    total =
      source.agg === 'sum' && source.field
        ? rows.reduce((sum, row) => sum + Number(row[source.field!] ?? 0), 0)
        : rows.length;
  }

  const spark = props.sparkHook
    ? ((sparkData as Record<string, unknown>[] | undefined) ?? []).map((row) => ({
        v: Number(row[props.sparkField ?? 'revenue'] ?? 0),
      }))
    : [];

  const tint = paletteVar(props.color);
  const trend = Number(props.trend ?? 0);
  const Trend = trend < 0 ? TrendingDown : TrendingUp;
  const trendColor = trend < 0 ? paletteVar('error') : paletteVar('success');

  return (
    <Card className="flex items-center justify-between gap-4 px-6 py-5">
      <span className="flex flex-col gap-1">
        <span className="text-sm text-meta">{props.label ?? ''}</span>
        <span className="font-display text-2xl leading-tight tabular-nums text-fg">
          {typeof total === 'number'
            ? props.money
              ? fmt.currency(total)
              : fmt.number(total)
            : String(total ?? '')}
        </span>
        {props.trend === undefined ? null : (
          <span className="flex items-center gap-1 text-xs tabular-nums" style={{ color: trendColor }}>
            <Trend className="size-3" />
            {Math.abs(trend)}%
          </span>
        )}
      </span>
      {spark.length ? (
        <span className="h-14 w-24 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark}>
              <Area type="monotone" dataKey="v" stroke={tint} fill={tint} fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </span>
      ) : null}
    </Card>
  );
}
