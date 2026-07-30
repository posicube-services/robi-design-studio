'use client';

import type { BlockProps } from 'src/genui/schema';
import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { hookRegistry } from 'src/genui/hook-registry';
import { Card, CardHeader } from 'src/ui/primitives';
import { fmt, seriesColors } from 'src/lib/tokens';

/**
 * @od-component ChartBlock
 * @notes Recharts rather than ApexCharts. Series colours come from
 *   `seriesColors`, derived from `--accent`, because the token contract has
 *   exactly one brand colour — the MUI seed sidestepped that by taking its
 *   palette from the MUI theme, i.e. by not being brand-driven.
 *
 *   Also retires a known defect: `type: "bar"` rendered blank on
 *   apexcharts@5 / react-apexcharts@1.9 (see docs/posicube/status.md).
 */
type Row = Record<string, unknown>;
type Series = { name: string; data: number[] };

export function ChartBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    title?: string;
    type?: 'bar' | 'line' | 'area' | 'donut';
    hook?: string;
    groupBy?: string;
    agg?: 'count' | 'sum';
    field?: string;
    categoryField?: string;
    valueField?: string;
    seriesName?: string;
    money?: boolean;
    categories?: string[];
    series?: Series[];
  };

  // Called unconditionally to keep hook order stable; ignored in literal mode.
  const useData = hookRegistry[props.hook ?? 'useCustomers'] ?? hookRegistry.useCustomers!;
  const { data } = useData();

  const { categories, series } = useMemo(() => {
    // Mode (b): literal categories + series win when supplied.
    if (Array.isArray(props.categories) && Array.isArray(props.series)) {
      return { categories: props.categories, series: props.series };
    }

    const rows = (data as Row[] | undefined) ?? [];

    // Mode (a2): project a time series.
    if (props.categoryField && props.valueField) {
      const labels = rows.map((r) => String(r[props.categoryField!] ?? ''));
      const values = rows.map((r) => Number(r[props.valueField!] ?? 0));
      return { categories: labels, series: [{ name: props.seriesName ?? props.valueField, data: values }] };
    }

    // Mode (a1): group rows and aggregate.
    if (props.groupBy) {
      const buckets = new Map<string, number>();
      for (const row of rows) {
        const key = String(row[props.groupBy] ?? '');
        const add = props.agg === 'sum' && props.field ? Number(row[props.field] ?? 0) : 1;
        buckets.set(key, (buckets.get(key) ?? 0) + add);
      }
      return {
        categories: [...buckets.keys()],
        series: [{ name: props.seriesName ?? (props.agg === 'sum' ? (props.field ?? 'sum') : 'count'), data: [...buckets.values()] }],
      };
    }

    return { categories: [] as string[], series: [] as Series[] };
  }, [data, props.categories, props.series, props.categoryField, props.valueField, props.groupBy, props.agg, props.field, props.seriesName]);

  const type = props.type ?? 'bar';
  const colors = seriesColors(Math.max(type === 'donut' ? categories.length : series.length, 1));
  const tickFmt = (v: number) => (props.money ? fmt.compact(v, true) : fmt.number(v));

  const rows = categories.map((label, i) => {
    const row: Record<string, string | number> = { label };
    for (const s of series) row[s.name] = s.data[i] ?? 0;
    return row;
  });
  const donutRows = categories.map((label, i) => ({ label, value: series[0]?.data[i] ?? 0 }));

  return (
    <Card>
      <CardHeader title={props.title} />
      <div className="h-72 px-3 pb-5">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'donut' ? (
            <PieChart>
              <Pie data={donutRows} dataKey="value" nameKey="label" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
                {donutRows.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} stroke="var(--surface)" />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP} formatter={(v) => tickFmt(Number(v))} />
              <Legend wrapperStyle={LEGEND} />
            </PieChart>
          ) : type === 'line' ? (
            <LineChart data={rows}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" {...AXIS} />
              <YAxis {...AXIS} tickFormatter={tickFmt} />
              <Tooltip contentStyle={TOOLTIP} formatter={(v) => tickFmt(Number(v))} />
              <Legend wrapperStyle={LEGEND} />
              {series.map((s, i) => (
                <Line key={s.name} type="monotone" dataKey={s.name} stroke={colors[i]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          ) : type === 'area' ? (
            <AreaChart data={rows}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" {...AXIS} />
              <YAxis {...AXIS} tickFormatter={tickFmt} />
              <Tooltip contentStyle={TOOLTIP} formatter={(v) => tickFmt(Number(v))} />
              <Legend wrapperStyle={LEGEND} />
              {series.map((s, i) => (
                <Area key={s.name} type="monotone" dataKey={s.name} stroke={colors[i]} fill={colors[i]} fillOpacity={0.18} strokeWidth={2} />
              ))}
            </AreaChart>
          ) : (
            <BarChart data={rows}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" {...AXIS} />
              <YAxis {...AXIS} tickFormatter={tickFmt} />
              <Tooltip contentStyle={TOOLTIP} formatter={(v) => tickFmt(Number(v))} />
              <Legend wrapperStyle={LEGEND} />
              {series.map((s, i) => (
                <Bar key={s.name} dataKey={s.name} fill={colors[i]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

const AXIS = { stroke: 'var(--meta)', fontSize: 12 } as const;
const GRID = 'var(--border-soft)';
const TOOLTIP = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  color: 'var(--fg)',
} as const;
const LEGEND = { fontSize: 'var(--text-xs)', color: 'var(--meta)' } as const;
