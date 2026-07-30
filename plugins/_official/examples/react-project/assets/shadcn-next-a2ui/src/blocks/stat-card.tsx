'use client';

import type { BlockProps } from 'src/genui/schema';

import { hookRegistry } from 'src/genui/hook-registry';
import { Card } from 'src/ui/primitives';
import { fmt, paletteVar } from 'src/lib/tokens';

type Source = { hook?: string; agg?: 'count' | 'sum'; field?: string };

/** Single KPI tile. `value` is literal; `source` derives it from a hook instead. */
export function StatCardBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { label?: string; value?: unknown; color?: string; source?: Source };
  const source = props.source ?? {};

  const useData = hookRegistry[source.hook ?? 'useCustomers'] ?? hookRegistry.useCustomers!;
  const { data } = useData();

  let value = props.value;
  if (source.hook) {
    const rows = (data as Record<string, unknown>[] | undefined) ?? [];
    value =
      source.agg === 'sum' && source.field
        ? rows.reduce((sum, row) => sum + Number(row[source.field!] ?? 0), 0)
        : rows.length;
  }

  const tint = paletteVar(props.color);

  return (
    <Card className="flex items-center gap-4 px-6 py-5">
      <span
        className="size-10 shrink-0 rounded-md"
        style={{ background: `color-mix(in oklab, ${tint} 16%, transparent)` }}
        aria-hidden
      />
      <span className="flex flex-col">
        <span className="font-display text-2xl leading-tight text-fg tabular-nums">
          {typeof value === 'number' ? fmt.number(value) : String(value ?? '')}
        </span>
        <span className="text-sm text-meta">{props.label ?? ''}</span>
      </span>
    </Card>
  );
}
