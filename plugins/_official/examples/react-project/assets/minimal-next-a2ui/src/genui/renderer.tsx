'use client';

import type { UINode, UISpec } from './schema';

import { useMemo } from 'react';

import { registry } from './registry';
import { FilterProvider } from './filter-context';
import { UnknownNode } from 'src/blocks/unknown-node';

/**
 * @od-component SpecRenderer
 * @notes The whole POC in one idea: walk a flat-adjacency-list spec and render
 *   each node through the registry. Recursion follows `children` IDs. Unknown
 *   node types render a visible diagnostic instead of crashing — important for
 *   LLM-generated specs where a hallucinated type must fail loud, not silent.
 * @posicube-minimal version=0.1.0
 */
export function SpecRenderer({ spec }: { spec: UISpec }) {
  const index = useMemo(() => {
    const map = new Map<string, UINode>();
    for (const node of spec.nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [spec]);

  return (
    <FilterProvider>
      <NodeView id={spec.root} index={index} ancestors={EMPTY_ANCESTORS} />
    </FilterProvider>
  );
}

// Defense-in-depth: the gate rejects cyclic specs, but if an unvalidated spec
// ever reaches the renderer, a cycle must degrade loud instead of blowing the
// stack (SSR 500). `ancestors` is the current render path.
const EMPTY_ANCESTORS: ReadonlySet<string> = new Set();

type NodeViewProps = {
  id: string;
  index: Map<string, UINode>;
  ancestors: ReadonlySet<string>;
};

function NodeView({ id, index, ancestors }: NodeViewProps) {
  if (ancestors.has(id)) {
    return <UnknownNode label={`cycle detected at node id: "${id}"`} />;
  }

  const node = index.get(id);
  if (!node) {
    return <UnknownNode label={`missing node id: "${id}"`} />;
  }

  const Block = registry[node.type];
  if (!Block) {
    return <UnknownNode label={`unknown node type: "${node.type}" (id: ${node.id})`} />;
  }

  const childAncestors = node.children?.length ? new Set(ancestors).add(id) : ancestors;
  const children = node.children?.map((childId) => (
    <NodeView key={childId} id={childId} index={index} ancestors={childAncestors} />
  ));

  return <Block node={node}>{children}</Block>;
}
