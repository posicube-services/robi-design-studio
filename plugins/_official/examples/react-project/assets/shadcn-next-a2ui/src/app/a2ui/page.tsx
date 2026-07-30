import type { UISpec } from 'src/genui/schema';

import fs from 'node:fs';
import path from 'node:path';


import { SpecRenderer } from 'src/genui/renderer';
import { validateSpec } from 'src/authoring/spec-schema';
import { QueryProvider } from 'src/lib/react-query/query-provider';

/**
 * /a2ui — A2UI render route.
 *
 * Loads the project-scoped `a2ui-spec.json` (written by the agent via the
 * `a2ui-spec` design-template skill), runs it through the SAME validation gate
 * (src/authoring/spec-schema), and renders it through the SAME MUI Minimal
 * registry ported from genui-studio (src/genui, src/blocks).
 *
 * `force-dynamic` so a fresh spec written by the agent appears on the next
 * request without a rebuild — the authoring loop is: agent writes
 * a2ui-spec.json -> this route renders it -> preview reflects it.
 */
export const dynamic = 'force-dynamic';

const SPEC_FILE = 'a2ui-spec.json';

type LoadResult = { ok: true; spec: UISpec } | { ok: false; error: string };

function loadSpec(): LoadResult {
  const specPath = path.join(process.cwd(), SPEC_FILE);

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
  } catch (e) {
    return {
      ok: false,
      error: `${SPEC_FILE}을(를) 읽을 수 없습니다 (${specPath}): ${(e as Error).message}`,
    };
  }

  // Belt-and-suspenders: the agent should only write gated specs, but the file
  // is hand-editable — re-run the gate so a broken spec fails loud, not garbled.
  const result = validateSpec(raw);
  if (!result.success) {
    return {
      ok: false,
      error: `검증 게이트를 통과하지 못했습니다: ${result.error.issues
        .map((issue) => issue.message)
        .join('; ')}`,
    };
  }

  return { ok: true, spec: result.data as UISpec };
}

export default function A2uiPage() {
  const loaded = loadSpec();

  if (!loaded.ok) {
    return (
      <div className="mx-auto max-w-(--container-max) px-6 py-10">
        <div
          role="alert"
          className="rounded-md border border-danger/45 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          A2UI 렌더 실패 — {loaded.error}
        </div>
      </div>
    );
  }

  return (
    <QueryProvider>
      <SpecRenderer spec={loaded.spec} />
    </QueryProvider>
  );
}
