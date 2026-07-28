import type { ReactNode } from 'react';

/**
 * @od-component genui/schema
 * @notes The POC's own minimal UI spec — A2UI-shaped (flat adjacency list)
 *   but intentionally NOT coupled to Google A2UI v0.9, so we avoid spec churn.
 *   A2UI import/export can be bolted on later as a serialization layer.
 *
 *   A spec is a flat list of nodes. Parent→child is expressed by `children`
 *   holding child node IDs (adjacency list) — this shape is easy for an LLM to
 *   emit incrementally and easy to validate. The renderer walks from `root`.
 *
 *   `type` is a key into the component registry (src/genui/registry.tsx). The
 *   LLM only ever picks from that fixed vocabulary + props — it never emits
 *   MUI/JSX code — which is exactly why design consistency holds: the renderer
 *   is the single authority on how each node looks.
 * @posicube-minimal version=0.1.0
 */
export type UINodeId = string;

export type UINodeProps = Record<string, unknown>;

export type UINode = {
  id: UINodeId;
  /** Registry key — must exist in src/genui/registry.tsx. */
  type: string;
  props?: UINodeProps;
  /** Child node IDs, in render order. */
  children?: UINodeId[];
};

export type UISpec = {
  version: string;
  root: UINodeId;
  nodes: UINode[];
};

/** Props every registry block receives: its node + already-rendered children. */
export type BlockProps = {
  node: UINode;
  children?: ReactNode;
};

export type BlockComponent = (props: BlockProps) => ReactNode;
