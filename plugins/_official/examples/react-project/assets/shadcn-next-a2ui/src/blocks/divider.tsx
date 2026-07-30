import type { BlockProps } from 'src/genui/schema';

/** Horizontal rule, optionally with a centred label. */
export function DividerBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { label?: string };

  if (!props.label) return <hr className="my-4 h-px border-0 bg-border-soft" />;

  return (
    <div className="my-4 flex items-center gap-3">
      <span className="h-px flex-1 bg-border-soft" />
      <span className="text-xs text-meta">{props.label}</span>
      <span className="h-px flex-1 bg-border-soft" />
    </div>
  );
}
