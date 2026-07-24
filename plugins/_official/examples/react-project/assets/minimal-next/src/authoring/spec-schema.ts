import type { PropSpec } from './catalog';

import { z } from 'zod';

import { BLOCK_TYPES, HOOK_NAMES, MUTATION_NAMES, BLOCKS_BY_TYPE } from './catalog';

/**
 * @od-component authoring/spec-schema
 * @notes The validation GATE. A spec — whether hand-written or LLM-authored —
 *   must pass this before it can be published/rendered. Three layers:
 *     1. Structural (zod): node shape, `type` constrained to catalog types.
 *     2. Per-block props (zod, COMPILED from catalog PropSpecs): unknown prop
 *        keys are rejected (strict), enum values must be in the Minimal domain
 *        (variant/color/size/spacing...), required props must be present.
 *     3. Semantic (superRefine): unique ids, root exists, children reference
 *        existing nodes, hooks exist, reachability + acyclicity.
 *   This is what rejects a hallucinated/incoherent spec instead of rendering
 *   garbage — and what makes "theme 밖의 값" literally unrepresentable.
 * @posicube-minimal version=0.2.0
 */
const nodeTypeEnum = z.enum(BLOCK_TYPES as [string, ...string[]]);

// ---- per-block props schemas, compiled from the catalog ---------------------

function zodForProp(prop: PropSpec): z.ZodTypeAny {
  let base: z.ZodTypeAny;
  switch (prop.kind) {
    case 'string':
      base = z.string();
      break;
    case 'number':
      base = z.number();
      break;
    case 'boolean':
      base = z.boolean();
      break;
    case 'enum':
      // Fail fast: z.union([]) silently rejects EVERY value, which would read
      // as "valid spec wrongly rejected" — an empty domain is a catalog bug.
      if (!prop.values?.length) {
        throw new Error(`catalog enum prop has no values (${prop.description})`);
      }
      base = z.union(prop.values.map((value) => z.literal(value)));
      break;
    case 'hook':
      base = z.enum(HOOK_NAMES as [string, ...string[]]);
      break;
    case 'mutation':
      base = z.enum(MUTATION_NAMES as [string, ...string[]]);
      break;
    case 'json':
      // Structured payloads (columns, fields, options...) — shape is described
      // in the catalog prose; deep validation is the blocks' defensive parsing.
      base = z.union([
        z.record(z.string(), z.unknown()),
        z.array(z.unknown()),
        z.string(),
        z.number(),
        z.boolean(),
      ]);
      break;
  }
  return prop.required ? base : base.optional();
}

const propsSchemaByType: Record<string, z.ZodTypeAny> = Object.fromEntries(
  Object.values(BLOCKS_BY_TYPE).map((block) => [
    block.type,
    z.strictObject(
      Object.fromEntries(Object.entries(block.props).map(([name, prop]) => [name, zodForProp(prop)]))
    ),
  ])
);

export const nodeSchema = z.object({
  id: z.string().min(1),
  type: nodeTypeEnum,
  props: z.record(z.string(), z.unknown()).optional(),
  children: z.array(z.string().min(1)).optional(),
});

export const specSchema = z
  .object({
    version: z.string().min(1),
    root: z.string().min(1),
    nodes: z.array(nodeSchema).min(1),
  })
  .superRefine((spec, ctx) => {
    const ids = new Set<string>();
    for (const node of spec.nodes) {
      if (ids.has(node.id)) {
        ctx.addIssue({ code: 'custom', message: `duplicate node id "${node.id}"` });
      }
      ids.add(node.id);
    }

    if (!ids.has(spec.root)) {
      ctx.addIssue({ code: 'custom', message: `root "${spec.root}" is not among nodes` });
    }

    for (const node of spec.nodes) {
      for (const childId of node.children ?? []) {
        if (!ids.has(childId)) {
          ctx.addIssue({
            code: 'custom',
            message: `node "${node.id}" references missing child "${childId}"`,
          });
        }
      }

      // Per-block props gate — compiled from the catalog PropSpecs. Rejects
      // unknown prop keys, out-of-domain enum values, and missing required
      // props, with the node id in the message so the LLM can self-correct.
      const propsSchema = propsSchemaByType[node.type];
      if (propsSchema) {
        const result = propsSchema.safeParse(node.props ?? {});
        if (!result.success) {
          for (const issue of result.error.issues) {
            const path = issue.path.length > 0 ? `props.${issue.path.join('.')}` : 'props';
            ctx.addIssue({
              code: 'custom',
              message: `node "${node.id}" (${node.type}) ${path}: ${issue.message}`,
            });
          }
        }
      }

      const props = node.props as Record<string, unknown> | undefined;

      // Children-shape guard: a block that doesn't render children must not
      // declare them (silent-drop would otherwise hide content).
      const manifest = BLOCKS_BY_TYPE[node.type];
      if (manifest && !manifest.acceptsChildren && (node.children?.length ?? 0) > 0) {
        ctx.addIssue({
          code: 'custom',
          message: `node "${node.id}" (${node.type}) does not accept children`,
        });
      }

      // Bound StatCard: validate inside the json-kind `source` payload too —
      // a hallucinated agg would otherwise silently fall back to `count` and
      // show a wrong KPI number.
      const source = props?.source as Record<string, unknown> | undefined;
      const sourceHook = source?.hook;
      if (typeof sourceHook === 'string' && !HOOK_NAMES.includes(sourceHook)) {
        ctx.addIssue({
          code: 'custom',
          message: `node "${node.id}" stat source uses unknown hook "${sourceHook}" (available: ${HOOK_NAMES.join(', ')})`,
        });
      }
      if (source) {
        const SOURCE_AGGS = ['count', 'countWhere', 'sum'];
        const SOURCE_FORMATS = ['number', 'currency'];
        if (source.agg !== undefined && !SOURCE_AGGS.includes(source.agg as string)) {
          ctx.addIssue({
            code: 'custom',
            message: `node "${node.id}" stat source uses unknown agg "${String(source.agg)}" (available: ${SOURCE_AGGS.join(', ')})`,
          });
        }
        if (source.format !== undefined && !SOURCE_FORMATS.includes(source.format as string)) {
          ctx.addIssue({
            code: 'custom',
            message: `node "${node.id}" stat source uses unknown format "${String(source.format)}" (available: ${SOURCE_FORMATS.join(', ')})`,
          });
        }
      }
    }

    // Reachability + acyclicity — every node must be reachable from root (no
    // orphans), and the children graph must be a DAG. A cycle would recurse the
    // renderer forever, so it must die here, not at render time. Iterative DFS
    // with gray/black coloring: `onPath` is the current DFS path (gray), `seen`
    // is fully processed (black); a child already on the path is a back-edge.
    const byId = new Map(spec.nodes.map((node) => [node.id, node] as const));
    const seen = new Set<string>();
    const onPath = new Set<string>();
    const stack: { id: string; phase: 'enter' | 'exit' }[] = [{ id: spec.root, phase: 'enter' }];
    while (stack.length > 0) {
      const frame = stack.pop() as { id: string; phase: 'enter' | 'exit' };
      if (frame.phase === 'exit') {
        onPath.delete(frame.id);
        continue;
      }
      if (seen.has(frame.id)) continue;
      seen.add(frame.id);
      onPath.add(frame.id);
      stack.push({ id: frame.id, phase: 'exit' });
      const node = byId.get(frame.id);
      for (const childId of node?.children ?? []) {
        if (onPath.has(childId)) {
          ctx.addIssue({
            code: 'custom',
            message: `cycle detected: node "${frame.id}" references ancestor "${childId}"`,
          });
        } else if (!seen.has(childId)) {
          stack.push({ id: childId, phase: 'enter' });
        }
      }
    }
    for (const node of spec.nodes) {
      if (!seen.has(node.id)) {
        ctx.addIssue({ code: 'custom', message: `node "${node.id}" is unreachable from root` });
      }
    }
  });

export type ValidatedSpec = z.infer<typeof specSchema>;

export function validateSpec(data: unknown) {
  return specSchema.safeParse(data);
}
