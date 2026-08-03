import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { cn } from 'src/lib/cn';

/**
 * Modal built on the native `<dialog>` element.
 *
 * `showModal()` gives focus trapping, inertness of the page behind, Escape to
 * close, and the top layer — all things a hand-rolled div-with-overlay has to
 * reimplement and usually gets wrong. The seed has no Radix dependency, so this
 * is the honest way to get correct modal behaviour.
 */
export function Dialog({
  open,
  onClose,
  title,
  footer,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // A click landing on the dialog itself (not its content box) is a
      // backdrop click, since the backdrop is painted by the element.
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        'm-auto w-[min(32rem,calc(100vw-2rem))] rounded-lg border border-border bg-surface p-0 text-fg shadow-raised',
        'backdrop:bg-black/40',
        className,
      )}
    >
      {title ? (
        <h2 className="m-0 border-b border-border-soft px-6 py-4 font-display text-lg text-fg">
          {title}
        </h2>
      ) : null}
      <div className="px-6 py-5">{children}</div>
      {footer ? (
        <div className="flex justify-end gap-2 border-t border-border-soft px-6 py-4">{footer}</div>
      ) : null}
    </dialog>
  );
}
