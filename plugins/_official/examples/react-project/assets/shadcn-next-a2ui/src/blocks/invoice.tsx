import type { BlockProps } from 'src/genui/schema';

import { Badge, Card, CardHeader } from 'src/ui/primitives';
import { fmt, statusTone } from 'src/lib/tokens';

type Item = { description?: string; qty?: number; unitPrice?: number };

/** Invoice document with a computed subtotal / tax / total. */
export function InvoiceBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    invoiceNo?: string; issueDate?: string; billTo?: string; status?: string; taxRate?: number; items?: Item[];
  };
  const items = Array.isArray(props.items) ? props.items : [];
  const subtotal = items.reduce((sum, it) => sum + Number(it.qty ?? 0) * Number(it.unitPrice ?? 0), 0);
  const tax = Math.round(subtotal * (Number(props.taxRate ?? 0) / 100));

  return (
    <Card>
      <CardHeader
        title={props.invoiceNo ? `인보이스 ${props.invoiceNo}` : '인보이스'}
        action={props.status ? <Badge tone={statusTone(props.status)}>{props.status}</Badge> : undefined}
      />
      <div className="grid grid-cols-2 gap-4 px-6 pb-5 text-sm">
        <span className="flex flex-col gap-1">
          <span className="text-xs text-meta">청구 대상</span>
          <span className="text-fg">{props.billTo ?? ''}</span>
        </span>
        <span className="flex flex-col gap-1">
          <span className="text-xs text-meta">발행일</span>
          <span className="text-fg">{props.issueDate ?? ''}</span>
        </span>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-surface-warm text-xs text-meta">
            <th className="px-6 py-3 text-left">항목</th>
            <th className="px-6 py-3 text-right">수량</th>
            <th className="px-6 py-3 text-right">단가</th>
            <th className="px-6 py-3 text-right">금액</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-t border-border-soft">
              <td className="px-6 py-3 text-fg">{item.description ?? ''}</td>
              <td className="px-6 py-3 text-right tabular-nums text-fg-2">{item.qty ?? 0}</td>
              <td className="px-6 py-3 text-right tabular-nums text-fg-2">{fmt.currency(item.unitPrice ?? 0)}</td>
              <td className="px-6 py-3 text-right tabular-nums text-fg">
                {fmt.currency(Number(item.qty ?? 0) * Number(item.unitPrice ?? 0))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="m-0 flex flex-col gap-2 border-t border-border-soft px-6 py-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-meta">소계</dt>
          <dd className="m-0 tabular-nums text-fg-2">{fmt.currency(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-meta">세금 ({Number(props.taxRate ?? 0)}%)</dt>
          <dd className="m-0 tabular-nums text-fg-2">{fmt.currency(tax)}</dd>
        </div>
        <div className="flex justify-between border-t border-border-soft pt-2">
          <dt className="text-fg">합계</dt>
          <dd className="m-0 font-display text-lg tabular-nums text-fg">{fmt.currency(subtotal + tax)}</dd>
        </div>
      </dl>
    </Card>
  );
}
