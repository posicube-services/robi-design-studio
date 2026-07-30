import type { BlockProps } from 'src/genui/schema';
import { ChevronRight } from 'lucide-react';

/** Screen title with optional breadcrumbs, subtitle and a single action label. */
export function PageHeaderBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    title?: string; breadcrumbs?: string[]; subtitle?: string; action?: string;
  };
  const crumbs = Array.isArray(props.breadcrumbs) ? props.breadcrumbs : [];

  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-display text-2xl leading-tight tracking-display text-fg">
          {props.title ?? ''}
        </h1>
        {crumbs.length ? (
          <nav aria-label="breadcrumb" className="flex items-center gap-1 text-xs text-meta">
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 ? <ChevronRight className="size-3 opacity-50" /> : null}
                <span className={i === crumbs.length - 1 ? 'text-fg-2' : ''}>{crumb}</span>
              </span>
            ))}
          </nav>
        ) : null}
        {props.subtitle ? <p className="m-0 text-sm text-fg-2">{props.subtitle}</p> : null}
      </div>
      {props.action ? (
        <button
          type="button"
          className="w-fit rounded-md bg-accent px-4 py-2 text-sm text-accent-on transition-colors duration-fast ease-standard hover:bg-accent-hover"
        >
          {props.action}
        </button>
      ) : null}
    </header>
  );
}
