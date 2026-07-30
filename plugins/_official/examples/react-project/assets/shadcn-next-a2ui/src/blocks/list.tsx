import type { BlockProps } from 'src/genui/schema';

type Item = { primary?: string; secondary?: string };

/** Simple two-line list. */
export function ListBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { items?: Item[] };
  const items = Array.isArray(props.items) ? props.items : [];

  return (
    <ul className="m-0 list-none divide-y divide-border-soft p-0">
      {items.map((item, i) => (
        <li key={i} className="flex flex-col gap-1 py-3">
          <span className="text-sm text-fg">{item.primary ?? ''}</span>
          {item.secondary ? <span className="text-xs text-meta">{item.secondary}</span> : null}
        </li>
      ))}
    </ul>
  );
}
