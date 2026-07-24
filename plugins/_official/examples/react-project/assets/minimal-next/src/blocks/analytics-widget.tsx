'use client';

import type { BlockProps } from 'src/genui/schema';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Chart, useChart } from 'src/components/chart';
import { Iconify } from 'src/components/iconify';
import { hookRegistry } from 'src/genui/hook-registry';

/**
 * @od-component AnalyticsWidgetBlock
 * @mui components=Card,Typography
 * @mui-minimal component=AnalyticsWidgetSummary path=vendor/next-ts/src/sections/overview
 * @notes Rich KPI widget (Minimal dashboard style): label + big total + trend
 *   delta + optional sparkline. Total can be a live `source` (same aggregation
 *   as StatCard) or a static `total`. Sparkline from a hook's numeric field.
 * @posicube-minimal version=0.1.0
 */
type PaletteColor = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

type StatSource = {
  hook: string;
  agg: 'count' | 'countWhere' | 'sum';
  field?: string;
  equals?: string | number;
  where?: { field: string; equals: string | number };
};

function aggregate(rows: Record<string, unknown>[], source: StatSource): number {
  switch (source.agg) {
    case 'count':
      return rows.length;
    case 'countWhere':
      return rows.filter((row) => String(row[source.field ?? '']) === String(source.equals)).length;
    case 'sum': {
      const filtered = source.where
        ? rows.filter((row) => String(row[source.where!.field]) === String(source.where!.equals))
        : rows;
      return filtered.reduce((total, row) => total + (Number(row[source.field ?? '']) || 0), 0);
    }
    default:
      return 0;
  }
}

export function AnalyticsWidgetBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    label?: string;
    total?: string | number;
    source?: StatSource;
    color?: PaletteColor;
    trend?: number; // percent, e.g. 12.5 or -3.2
    money?: boolean;
    sparkHook?: string;
    sparkField?: string;
  };

  const color: PaletteColor = props.color ?? 'primary';

  // Live total via source (resolve hook unconditionally; ignore if unused).
  const useData = hookRegistry[props.source?.hook ?? 'useCustomers'] ?? hookRegistry.useCustomers;
  const { data } = useData();
  const rows = (data as Record<string, unknown>[] | undefined) ?? [];

  // Sparkline series (separate hook; also resolved unconditionally).
  const useSpark = hookRegistry[props.sparkHook ?? 'useMonthlyRevenue'] ?? hookRegistry.useMonthlyRevenue;
  const { data: sparkData } = useSpark();
  const sparkRows = (sparkData as Record<string, unknown>[] | undefined) ?? [];

  const total = props.source ? aggregate(rows, props.source) : props.total;
  const display =
    props.money && typeof total === 'number' ? `$${total.toLocaleString()}` : String(total ?? '—');

  const spark = props.sparkHook && props.sparkField
    ? sparkRows.map((row) => Number(row[props.sparkField as string]) || 0)
    : [];

  const trendUp = (props.trend ?? 0) >= 0;

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: [`var(--palette-${color}-main)`],
    stroke: { width: 2 },
    tooltip: { enabled: false },
    xaxis: { labels: { show: false } },
    yaxis: { labels: { show: false } },
    grid: { show: false },
  });

  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            {props.label}
          </Typography>
          <Typography variant="h3" sx={{ mt: 1, color: `${color}.main` }}>
            {display}
          </Typography>
          {props.trend !== undefined && (
            <Stack direction="row" sx={{ mt: 1, alignItems: 'center', gap: 0.5 }}>
              <Iconify
                icon={trendUp ? 'eva:trending-up-fill' : 'eva:trending-down-fill'}
                sx={{ color: trendUp ? 'success.main' : 'error.main' }}
                width={18}
              />
              <Typography variant="subtitle2" sx={{ color: trendUp ? 'success.main' : 'error.main' }}>
                {trendUp ? '+' : ''}{props.trend}%
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                지난 기간 대비
              </Typography>
            </Stack>
          )}
        </Box>
        {spark.length > 0 && (
          <Box sx={{ width: 80 }}>
            <Chart type="line" series={[{ data: spark }]} options={chartOptions} sx={{ height: 56 }} />
          </Box>
        )}
      </Stack>
    </Card>
  );
}
