import type { ReactNode } from 'react';
import { useState } from 'react';
import { cn } from 'src/lib/cn';

export interface NavItem {
  label: ReactNode;
  href: string;
  icon?: ReactNode;
}

export interface NavSection {
  title?: ReactNode;
  items: NavItem[];
}

/**
 * App shell: collapsible sidebar + top bar.
 *
 * Edit `sections` to make the sidebar reflect the app you are building — a
 * shell still advertising demo routes is the clearest sign a screen was never
 * finished.
 */
export function DashboardLayout({
  brand,
  sections,
  activeHref,
  topBarRight,
  children,
}: {
  brand?: ReactNode;
  sections: NavSection[];
  activeHref?: string;
  topBarRight?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-bg text-fg">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-20 w-64 shrink-0 border-r border-border bg-surface',
          'transition-transform duration-normal ease-standard',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:static lg:translate-x-0',
        )}
      >
        <div className="flex h-16 items-center px-5 font-display text-lg text-fg">{brand}</div>
        <nav className="px-3 pb-6">
          {sections.map((section, i) => (
            <div key={i} className="mb-5">
              {section.title ? (
                <p className="mb-1.5 px-3 text-xs font-medium tracking-wide text-fg-2 uppercase">
                  {section.title}
                </p>
              ) : null}
              <ul className="m-0 list-none p-0">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={item.href === activeHref ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm',
                        'transition-colors duration-fast ease-standard',
                        item.href === activeHref
                          ? 'bg-accent/12 font-medium text-accent'
                          : 'text-fg-2 hover:bg-surface-warm hover:text-fg',
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="사이드바 닫기"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-10 bg-black/30 lg:hidden"
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border bg-surface/80 px-5 backdrop-blur">
          <button
            type="button"
            aria-label="사이드바 열기"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 text-fg-2 hover:bg-surface-warm lg:hidden"
          >
            ☰
          </button>
          <div className="ml-auto flex items-center gap-2">{topBarRight}</div>
        </header>
        <main className="mx-auto w-full max-w-(--container-max) flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
