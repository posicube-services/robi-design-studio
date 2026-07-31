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
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  materializeReactScaffold,
  parseRootTokens,
  renderMuiBrandTokens,
  resolveBrandTokensCss,
} from '../src/react-scaffold.js';

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

describe('parseRootTokens', () => {
  it('reads declarations and strips the comments brands annotate them with', () => {
    const tokens = parseRootTokens(
      ':root {\n  /* ── Surface ── */\n  --bg: #ffffff;\n  --accent: #4a154b; /* aubergine */\n}',
    );
    expect(tokens['--bg']).toBe('#ffffff');
    expect(tokens['--accent']).toBe('#4a154b');
  });

  // A section-header comment sits ABOVE the declaration it labels, so stripping
  // comments only from the value side left the header glued to the next
  // property name and dropped every annotated token on the floor.
  it('does not let a leading comment swallow the property name', () => {
    const tokens = parseRootTokens(':root {\n  /* header */\n  --accent: #abcdef;\n}');
    expect(Object.keys(tokens)).toEqual(['--accent']);
  });

  // Exactly one of the 152 brands ships a dark block, in a second `:root`.
  // Taking the last write would hand the light scheme dark values.
  it('reads only the first :root block', () => {
    const tokens = parseRootTokens(
      ':root { --bg: #ffffff; }\n:root[data-theme="dark"] { --bg: #141a21; }',
    );
    expect(tokens['--bg']).toBe('#ffffff');
  });
});

// This is the shape of a real outage: `registerRunRoutes` was handed a `paths`
// object that omitted the design-system roots even though its type declared
// them, so resolution threw, the throw escaped into the seeding step, and NO
// seed was written at all — the agent then hand-copied 400+ files.
describe('resolveBrandTokensCss degrades instead of throwing', () => {
  it('returns undefined when the roots are missing', async () => {
    await expect(
      resolveBrandTokensCss('slack', undefined, undefined),
    ).resolves.toBeUndefined();
  });

  it('returns undefined for an unknown design system', async () => {
    await expect(
      resolveBrandTokensCss('no-such-brand', '/nonexistent', '/nonexistent'),
    ).resolves.toBeUndefined();
  });

  it('returns undefined when no design system is selected', async () => {
    await expect(resolveBrandTokensCss(null, '/a', '/b')).resolves.toBeUndefined();
  });
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

  // The MUI seed reads the same tokens as values, because its theme does alpha
  // math on them. Same injection point, different file.
  it('rewrites the MUI seed token module with parsed values', async () => {
    await writeSeed('minimal-next-a2ui', {
      'package.json': '{"name":"seed"}',
      'src/theme/brand-tokens.ts': 'export const brandTokens = { accent: "#00a76f" };\n',
    });

    const state = await materializeReactScaffold({
      projectId: 'p4',
      projectDir,
      pluginAssetsRoot: assetsRoot,
      framework: 'next',
      variant: 'a2ui',
      designSystemId: 'slack',
      brandTokensCss: ':root {\n  /* Surface */\n  --accent: #4a154b;\n  --bg: #ffffff;\n}',
    });

    expect(state.brandTokensApplied).toBe('slack');
    const written = await readFile(
      path.join(projectDir, 'src', 'theme', 'brand-tokens.ts'),
      'utf8',
    );
    expect(written).toContain('accent: "#4a154b"');
    expect(written).toContain('bg: "#ffffff"');
    expect(written).not.toContain('#00a76f');
  });

  // The plain starters have neither file; writing one would be dead weight.
  it('is a no-op for a seed that consumes tokens neither way', async () => {
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

// Brands express colours in ways MUI's `decomposeColor` cannot read. Emitting
// them verbatim crashed the theme at module evaluation with
// `Invalid hex color: var(--surface)` and took the whole preview down.
describe('non-literal colour values', () => {
  const render = async (css: string) => {
    await writeSeed('minimal-next-a2ui', {
      'package.json': '{"name":"seed"}',
      'src/theme/brand-tokens.ts': 'export const brandTokens = {};\n',
    });
    await materializeReactScaffold({
      projectId: 'pv',
      projectDir,
      pluginAssetsRoot: assetsRoot,
      framework: 'next',
      variant: 'a2ui',
      designSystemId: 'brand',
      brandTokensCss: css,
    });
    return readFile(path.join(projectDir, 'src', 'theme', 'brand-tokens.ts'), 'utf8');
  };

  // Slack says "no warm tier here" by aliasing; 48 declarations do this.
  it('follows a var() alias to the value it points at', async () => {
    const out = await render(
      ':root { --accent: #4a154b; --surface: #f8f8f8; --surface-warm: var(--surface); }',
    );
    expect(out).toContain('surfaceWarm: "#f8f8f8"');
    expect(out).not.toContain('var(--surface)');
  });

  // 219 declarations are color-mix, mostly pressed states — exactly what the
  // seed derives anyway, so dropping them loses nothing.
  it('omits color-mix so the seed derives that step instead', async () => {
    const out = await render(
      ':root { --accent: #4a154b; --accent-hover: color-mix(in oklab, var(--accent), black 8%); }',
    );
    // Assert on the emitted values, not the whole file — the generated header
    // explains the color-mix rule and would match a naive substring check.
    expect(out.slice(out.indexOf('DEFAULT_BRAND_TOKENS,'))).not.toContain('color-mix');
    expect(out).not.toContain('accentHover:');
  });

  it('keeps rgb/hsl, which MUI reads natively', async () => {
    const out = await render(':root { --accent: #4a154b; --fg: rgba(0, 0, 0, 0.85); }');
    expect(out).toContain('fg: "rgba(0, 0, 0, 0.85)"');
  });

  // Fonts and radius are not colours and must survive untouched.
  it('passes non-colour tokens through', async () => {
    const out = await render(':root { --accent: #4a154b; --radius-md: 6px; --font-body: Inter; }');
    expect(out).toContain('radiusMd: "6px"');
    expect(out).toContain('fontBody: "Inter"');
  });

  it('declines to inject when the accent itself is unreadable', async () => {
    const out = await render(':root { --accent: oklch(0.7 0.1 200); }');
    expect(out).toBe('export const brandTokens = {};\n');
  });

  it('always spreads the defaults so the type stays satisfied', async () => {
    const out = await render(':root { --accent: #4a154b; }');
    expect(out).toContain('...DEFAULT_BRAND_TOKENS');
  });
});

// Colour syntax varies brand by brand, so a sample proves little: 219
// declarations are color-mix and 48 are var() aliases, spread unevenly. This
// sweeps every bundled brand and asserts the emitted module never carries a
// value MUI's decomposeColor would reject at module evaluation.
describe('every bundled brand renders a usable token module', () => {
  const COLOUR_FIELD = /^\s+(accent|accentOn|accentHover|accentActive|success|warn|danger|bg|surface|surfaceWarm|fg|fg2): "([^"]*)"/;

  it('emits only colours MUI can parse', async () => {
    const root = path.resolve(__dirname, '../../../design-systems');
    const brands = (await readdir(root, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
    expect(brands.length).toBeGreaterThan(100);

    const offenders: string[] = [];
    let rendered = 0;
    for (const brand of brands) {
      let css: string;
      try {
        css = await readFile(path.join(root, brand, 'tokens.css'), 'utf8');
      } catch {
        continue;
      }
      const out = renderMuiBrandTokens(css);
      if (out === null) continue;
      rendered += 1;
      for (const line of out.split('\n')) {
        const m = COLOUR_FIELD.exec(line);
        if (m && !/^(#|rgba?\(|hsla?\()/i.test(m[2] ?? '')) {
          offenders.push(`${brand}: ${m[1]} = ${m[2]}`);
        }
      }
    }
    expect(offenders).toEqual([]);
    expect(rendered).toBeGreaterThan(100);
  });
});

// The seeds grew up separately and name the same file three ways. Each one
// carried a "replace this with the active design system's tokens.css" comment
// and no executor, so a Next.js/React project came out unbranded even though a
// brand was picked.
describe('every seed that carries a CSS token file gets it written', () => {
  const cases: Array<[string, string]> = [
    ['shadcn-next-a2ui', 'src/app/brand-tokens.css'],
    ['minimal-next', 'src/styles/tokens.css'],
    ['minimal-vite', 'src/styles/tokens.css'],
    ['scaffold-next', 'src/app/tokens.css'],
  ];

  for (const [seed, rel] of cases) {
    it(`writes ${rel} for ${seed}`, async () => {
      await writeSeed(seed, {
        'package.json': '{"name":"seed"}',
        [rel]: SEED_DEFAULT_TOKENS,
      });

      const variant = seed.includes('shadcn')
        ? 'a2ui-shadcn'
        : seed.startsWith('scaffold')
          ? 'plain'
          : 'minimal';
      const state = await materializeReactScaffold({
        projectId: `css-${seed}`,
        projectDir,
        pluginAssetsRoot: assetsRoot,
        framework: seed.includes('vite') ? 'vite' : 'next',
        variant,
        designSystemId: 'slack',
        brandTokensCss: SLACK_TOKENS,
      });

      expect(state.brandTokensApplied).toBe('slack');
      expect(await readFile(path.join(projectDir, rel), 'utf8')).toBe(SLACK_TOKENS);
    });
  }
});
