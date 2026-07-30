'use client';

import type { BlockProps } from 'src/genui/schema';

import { hookRegistry } from 'src/genui/hook-registry';
import { Card, CardHeader } from 'src/ui/primitives';

type Field = { field?: string; label?: string };
type Item = { label?: string; value?: string };

/**
 * Definition list. Either literal `items`, or `fields` read off one row of a hook
 * (`rowIndex`, default 0) — the detail-view counterpart to DataTable.
 */
export function KeyValueBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    title?: string; hook?: string; rowIndex?: number; fields?: Field[]; items?: Item[];
  };

  const useData = hookRegistry[props.hook ?? 'useCustomers'] ?? hookRegistry.useCustomers!;
  const { data } = useData();

  let pairs: Item[] = Array.isArray(props.items) ? props.items : [];
  if (props.hook && Array.isArray(props.fields)) {
    const rows = (data as Record<string, unknown>[] | undefined) ?? [];
    const row = rows[Number(props.rowIndex ?? 0)] ?? {};
    pairs = props.fields.map((f) => ({
      label: f.label ?? f.field ?? '',
      value: String(row[f.field ?? ''] ?? ''),
    }));
  }

  return (
    <Card>
      <CardHeader title={props.title} />
      <dl className="m-0 divide-y divide-border-soft px-6 pb-6">
        {pairs.map((pair, i) => (
          <div key={i} className="flex items-baseline justify-between gap-4 py-3">
            <dt className="text-sm text-meta">{pair.label ?? ''}</dt>
            <dd className="m-0 text-sm text-fg">{pair.value ?? ''}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
