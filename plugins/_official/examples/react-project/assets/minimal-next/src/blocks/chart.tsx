'use client';

import type { BlockProps } from 'src/genui/schema';

import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';

import { Chart, useChart } from 'src/components/chart';
import { hookRegistry } from 'src/genui/hook-registry';

/**
 * @od-component ChartBlock
 * @mui components=Card,CardHeader
 * @mui-minimal component=Chart path=src/components/chart
 * @notes Chart pattern on Minimal's ApexCharts theme (useChart supplies the
 *   design defaults). Two data modes:
 *   (a) hook aggregation — group a bound hook's rows by `groupBy` and count/sum
 *       (categorical: bar/donut), OR project one row-field as a series
 *       (`valueField` over `categoryField` for time-series line/area).
 *   (b) literal — spec provides `categories` + `series`.
 *   The renderer owns the pixels; the spec only picks type + data.
 * @posicube-minimal version=0.1.0
 */
type ChartType = 'bar' | 'line' | 'area' | 'donut';

type ChartSeries = { name?: string; data: number[] };

function currency(value: number): string {
  return `$${value.toLocaleString()}`;
}

export function ChartBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    title?: string;
    type?: ChartType;
    hook?: string;
    groupBy?: string;
    agg?: 'count' | 'sum';
    field?: string;
    categoryField?: string;
    valueField?: string;
    seriesName?: string;
    categories?: string[];
    series?: ChartSeries[];
    money?: boolean;
  };

  const type: ChartType = props.type ?? 'bar';
  const usesHook = Boolean(props.hook);

  // Call the resolved hook unconditionally (uniform contract). For literal
  // mode it defaults to useCustomers and we simply ignore its data.
  const useData = hookRegistry[props.hook ?? 'useCustomers'] ?? hookRegistry.useCustomers;
  const { data, isLoading } = useData();
  const rows = (data as Record<string, unknown>[] | undefined) ?? [];

  let categories: string[] = props.categories ?? [];
  let series: ChartSeries[] = props.series ?? [];

  if (usesHook) {
    if (props.categoryField && props.valueField) {
      // Time-series / row projection: category = categoryField, value = valueField.
      categories = rows.map((row) => String(row[props.categoryField as string] ?? ''));
      series = [
        {
          name: props.seriesName ?? props.valueField,
          data: rows.map((row) => Number(row[props.valueField as string]) || 0),
        },
      ];
    } else if (props.groupBy) {
      // Categorical aggregation: group rows by field, count or sum.
      const buckets = new Map<string, number>();
      for (const row of rows) {
        const key = String(row[props.groupBy] ?? '—');
        const add = props.agg === 'sum' ? Number(row[props.field ?? '']) || 0 : 1;
        buckets.set(key, (buckets.get(key) ?? 0) + add);
      }
      categories = [...buckets.keys()];
      series = [{ name: props.seriesName ?? '값', data: [...buckets.values()] }];
    }
  }

  const isRadial = type === 'donut';

  const chartOptions = useChart({
    labels: isRadial ? categories : undefined,
    xaxis: isRadial ? undefined : { categories },
    stroke: type === 'bar' ? { width: 0 } : undefined,
    fill: type === 'area' ? { type: 'gradient' } : undefined,
    legend: isRadial ? { show: true } : undefined,
    tooltip: props.money ? { y: { formatter: (value: number) => currency(value) } } : undefined,
    yaxis: props.money ? { labels: { formatter: (value: number) => currency(value) } } : undefined,
  });

  // Donut takes a flat number[] series; xy charts take [{name,data}].
  const donutSeries = series[0]?.data ?? [];
  const chartSeries = isRadial ? donutSeries : series;

  // Axis charts (bar/line/area) mount ApexCharts with the row-derived
  // categories/series. Mounting once with an EMPTY axis dataset (while the
  // bound hook is still loading) and then transitioning to the populated
  // data once it resolves crashes ApexCharts' internal axis parser and
  // leaves the card permanently blank — reproducible in both dev and prod.
  // Every other hook-bound block (DataTable, KeyValue, StatCard) already
  // renders a loading placeholder instead of mounting with empty data;
  // Chart didn't, so give it the same guard.
  const loadingHookData = usesHook && isLoading;

  // react-apexcharts calls ApexCharts.updateOptions() whenever `series` or
  // `options` changes IDENTITY, even if the content is unchanged — and every
  // render here creates brand-new objects (useChart's `merge`, array/object
  // literals), so ANY unrelated re-render of this block (e.g. the resolved
  // hook's own isLoading flip, even in literal mode where its data is
  // unused) issues a spurious updateOptions() call. For bar-type charts,
  // that call throws inside ApexCharts' axis parser and leaves the chart
  // permanently blank (reproducible in dev and prod on apexcharts 5.15.0 /
  // react-apexcharts 1.9.0) — a real library-version regression, not a data
  // problem. Stabilizing the identity by content (not merely by render)
  // avoids triggering the buggy update path when nothing actually changed.
  const stableSeriesKey = JSON.stringify(chartSeries);
  const stableSeries = useMemo(() => chartSeries, [stableSeriesKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const stableOptionsKey = JSON.stringify(chartOptions);
  const stableOptions = useMemo(() => chartOptions, [stableOptionsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card>
      {props.title && (
        <>
          <CardHeader title={props.title} sx={{ pb: 2.5 }} />
          <Divider />
        </>
      )}
      <Box sx={{ p: 3 }}>
        {loadingHookData ? (
          <Skeleton variant="rounded" sx={{ height: 320 }} />
        ) : (
          <Chart type={type} series={stableSeries} options={stableOptions} sx={{ height: 320 }} />
        )}
      </Box>
    </Card>
  );
}
