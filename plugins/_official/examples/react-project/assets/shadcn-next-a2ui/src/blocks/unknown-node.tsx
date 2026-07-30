/**
 * @od-component UnknownNode
 * @notes Visible diagnostic for a missing node id or unregistered node type.
 *   Fails loud (not silent) so a hallucinated LLM spec is obvious in review —
 *   and so a partially-ported registry degrades legibly instead of crashing,
 *   which is what makes an incremental block port safe.
 */
export function UnknownNode({ label }: { label: string }) {
  return (
    <div
      role="note"
      className="my-2 rounded-md border border-dashed border-danger/60 bg-danger/8 px-4 py-3 font-mono text-sm text-danger"
    >
      ⚠ genui: {label}
    </div>
  );
}
