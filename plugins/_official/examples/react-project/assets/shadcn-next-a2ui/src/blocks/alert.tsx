import type { BlockProps } from 'src/genui/schema';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';

import { paletteOn, paletteVar } from 'src/lib/tokens';

const ICON = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
} as const;

/** Inline message. `severity` is required by the catalog. */
export function AlertBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { severity?: string; title?: string; text?: string; variant?: string };
  const severity = (props.severity ?? 'info') as keyof typeof ICON;
  const Icon = ICON[severity] ?? Info;
  const fill = paletteVar(severity, 'info');
  const variant = props.variant ?? 'standard';

  const style =
    variant === 'filled'
      ? { background: fill, color: paletteOn(severity, 'info') }
      : variant === 'outlined'
        ? { color: fill, borderWidth: 1, borderStyle: 'solid' as const, borderColor: `color-mix(in oklab, ${fill} 45%, transparent)` }
        : { background: `color-mix(in oklab, ${fill} 12%, transparent)`, color: fill };

  return (
    <div role="alert" className="flex items-start gap-3 rounded-md px-4 py-3 text-sm" style={style}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span className="flex flex-col gap-1">
        {props.title ? <strong className="font-medium">{props.title}</strong> : null}
        <span>{props.text ?? ''}</span>
      </span>
    </div>
  );
}
