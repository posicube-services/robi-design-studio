import type { BlockProps } from 'src/genui/schema';

import { FilterProvider } from 'src/genui/filter-context';
import { MAX_WIDTH } from 'src/lib/tokens';

/**
 * Screen root. Also mounts the filter bus, so SearchField/FilterChips/SelectFilter
 * can drive a DataTable that shares their `bind` key.
 */
export function PageBlock({ node, children }: BlockProps) {
  const props = (node.props ?? {}) as { maxWidth?: string };

  return (
    <FilterProvider>
      <main
        className="mx-auto flex flex-col gap-6 px-6 py-10"
        style={{ maxWidth: MAX_WIDTH[props.maxWidth ?? 'lg'] ?? MAX_WIDTH.lg }}
      >
        {children}
      </main>
    </FilterProvider>
  );
}
