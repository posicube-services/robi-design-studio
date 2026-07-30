'use client';

import type { BlockProps } from 'src/genui/schema';
import { Children, isValidElement, useState } from 'react';

import { Button, Card } from 'src/ui/primitives';

/** Multi-step wizard: N labels + N children, with 이전/다음 navigation. */
export function StepperBlock({ node, children }: BlockProps) {
  const props = (node.props ?? {}) as { labels?: string[]; finishLabel?: string };
  const labels = Array.isArray(props.labels) ? props.labels : [];
  const panels = Children.toArray(children).filter(isValidElement);
  const [step, setStep] = useState(0);
  const last = step >= Math.max(labels.length - 1, 0);

  return (
    <Card>
      <ol className="m-0 flex list-none items-center gap-2 overflow-x-auto px-6 py-5">
        {labels.map((label, i) => {
          const reached = i <= step;
          return (
            <li key={label} className="flex shrink-0 items-center gap-2">
              <span
                className={`inline-flex size-6 items-center justify-center rounded-pill text-xs transition-colors duration-fast ease-standard ${
                  reached ? 'bg-accent text-accent-on' : 'bg-border-soft text-meta'
                }`}
              >
                {i + 1}
              </span>
              <span className={`whitespace-nowrap text-sm ${i === step ? 'text-fg' : 'text-meta'}`}>
                {label}
              </span>
              {i < labels.length - 1 ? <span className="h-px w-8 bg-border-soft" aria-hidden /> : null}
            </li>
          );
        })}
      </ol>

      <div className="min-h-24 border-t border-border-soft px-6 py-6">{panels[step] ?? null}</div>

      <div className="flex items-center justify-end gap-2 border-t border-border-soft px-6 py-4">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          이전
        </Button>
        <Button disabled={last} onClick={() => setStep((s) => Math.min(s + 1, labels.length - 1))}>
          {last ? (props.finishLabel ?? '완료') : '다음'}
        </Button>
      </div>
    </Card>
  );
}
