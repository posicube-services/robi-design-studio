// A generated react-project has to wear the design system the user picked.
//
// The token-consuming seeds carry the active brand in exactly one file,
// `src/app/brand-tokens.css`, and their `globals.css` documents brand
// application as "replace it with that brand's tokens.css verbatim" — which
// nothing did. The agent sometimes read that comment and copied the file, so
// brands appeared to work; tightening the A2UI instruction to "the spec is your
// only deliverable" removed that accident and left projects on the seed's
// default palette (picking Slack produced the default blue, not aubergine).
// These specs pin the write to the scaffolder, where it is deterministic.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { materializeReactScaffold } from '../src/react-scaffold.js';

const SEED_DEFAULT_TOKENS = ':root { --accent: #2f6feb; }\n';
const SLACK_TOKENS = ':root { --accent: #4a154b; }\n';

let tmpDir: string;
let assetsRoot: string;
let projectDir: string;

/** Minimal stand-in for a bundled seed, under the name the resolver expects. */
async function writeSeed(
  seedDirName: string,
  files: Record<string, string>,
): Promise<void> {
  for (const [rel, body] of Object.entries(files)) {
    const abs = path.join(assetsRoot, seedDirName, rel);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, body, 'utf8');
  }
}

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), 'od-react-brand-'));
  assetsRoot = path.join(tmpDir, 'assets');
  projectDir = path.join(tmpDir, 'project');
  await mkdir(projectDir, { recursive: true });
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('materializeReactScaffold brand tokens', () => {
  it('writes the active design system tokens over the seed default', async () => {
    await writeSeed('shadcn-next-a2ui', {
      'package.json': '{"name":"seed"}',
      'src/app/brand-tokens.css': SEED_DEFAULT_TOKENS,
    });

    const state = await materializeReactScaffold({
      projectId: 'p1',
      projectDir,
      pluginAssetsRoot: assetsRoot,
      framework: 'next',
      variant: 'a2ui-shadcn',
      designSystemId: 'slack',
      brandTokensCss: SLACK_TOKENS,
    });

    expect(state.error).toBeNull();
    expect(state.brandTokensApplied).toBe('slack');
    const written = await readFile(
      path.join(projectDir, 'src', 'app', 'brand-tokens.css'),
      'utf8',
    );
    expect(written).toBe(SLACK_TOKENS);
  });

  it('leaves the seed default in place when no brand tokens resolve', async () => {
    await writeSeed('shadcn-next-a2ui', {
      'package.json': '{"name":"seed"}',
      'src/app/brand-tokens.css': SEED_DEFAULT_TOKENS,
    });

    const state = await materializeReactScaffold({
      projectId: 'p2',
      projectDir,
      pluginAssetsRoot: assetsRoot,
      framework: 'next',
      variant: 'a2ui-shadcn',
      designSystemId: 'prose-only-brand',
      brandTokensCss: undefined,
    });

    expect(state.brandTokensApplied).toBeNull();
    const written = await readFile(
      path.join(projectDir, 'src', 'app', 'brand-tokens.css'),
      'utf8',
    );
    expect(written).toBe(SEED_DEFAULT_TOKENS);
  });

  // The MUI seeds take their palette from a JS theme and ship no
  // `brand-tokens.css`; writing one would be dead weight the seed never imports.
  it('is a no-op for a seed that does not consume tokens that way', async () => {
    await writeSeed('minimal-next', { 'package.json': '{"name":"seed"}' });

    const state = await materializeReactScaffold({
      projectId: 'p3',
      projectDir,
      pluginAssetsRoot: assetsRoot,
      framework: 'next',
      variant: 'minimal',
      designSystemId: 'slack',
      brandTokensCss: SLACK_TOKENS,
    });

    expect(state.error).toBeNull();
    expect(state.brandTokensApplied).toBeNull();
    await expect(
      readFile(path.join(projectDir, 'src', 'app', 'brand-tokens.css'), 'utf8'),
    ).rejects.toThrow();
  });
});
