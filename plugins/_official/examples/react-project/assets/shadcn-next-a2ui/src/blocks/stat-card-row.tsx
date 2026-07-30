import type { BlockProps } from 'src/genui/schema';

/** Responsive row of StatCards. */
export function StatCardRowBlock({ node: _node, children }: BlockProps) {
  return <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}
