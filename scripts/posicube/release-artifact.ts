/**
 * Copy a packaged artifact out for distribution under a versioned filename.
 *
 * `tools-pack` names its output after the product and namespace
 * (`robi Design Studio-default.dmg`) and — importantly — its install, start,
 * uninstall and smoke commands all locate artifacts by re-deriving that same
 * name in each platform's `paths.ts` under `tools/pack`. Renaming the build
 * output directly means changing the pattern in a dozen coupled places, so this
 * renames at delivery
 * instead: the build keeps the name its own tooling expects, and what people
 * download carries the version and architecture.
 *
 * Both facts matter to whoever receives the file. Without the version a second
 * download lands as `… (1).dmg` and nobody can tell which is current; without
 * the architecture an Intel Mac user can take the arm64 build and report only
 * that "it will not open".
 *
 *   pnpm exec tsx scripts/posicube/release-artifact.ts mac
 *   pnpm exec tsx scripts/posicube/release-artifact.ts win --out ~/Desktop
 */

import { copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';

const require = createRequire(import.meta.url);
const REPO_ROOT = path.resolve(import.meta.dirname, '../..');
const SLUG = 'robi-design-studio';

/**
 * Where `tools-pack` leaves each platform's finished artifacts.
 *
 * Named folders rather than a recursive sweep: the same tree also holds
 * `payload/…-payload.zip`, which is the updater's internal payload and not
 * something to hand anyone. A sweep by extension picked it up and published it
 * as if it were the app.
 */
const SOURCES: Record<string, { dirs: string[]; extensions: string[] }> = {
  mac: { dirs: ['dmg', 'zip'], extensions: ['.dmg', '.zip'] },
  win: { dirs: ['builder'], extensions: ['-setup.exe'] },
  linux: { dirs: ['appimage', 'builder'], extensions: ['.AppImage'] },
};

const platformRoot = (platform: string) =>
  path.join(REPO_ROOT, '.tmp', 'tools-pack', 'out', platform, 'namespaces', 'default');

/**
 * The architecture the artifact was built for.
 *
 * Read from the host rather than parsed out of the filename: `tools-pack` builds
 * for the machine it runs on, and the name it produces carries the namespace,
 * not the arch.
 */
function hostArch(): string {
  return process.arch === 'arm64' ? 'arm64' : process.arch === 'x64' ? 'x64' : process.arch;
}

async function findArtifacts(
  root: string,
  dirs: string[],
  extensions: string[],
): Promise<string[]> {
  const found: string[] = [];
  for (const dir of dirs) {
    let entries;
    try {
      entries = await readdir(path.join(root, dir), { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (extensions.some((ext) => entry.name.endsWith(ext))) {
        found.push(path.join(root, dir, entry.name));
      }
    }
  }
  return found;
}

async function main(): Promise<void> {
  const [platform, ...rest] = process.argv.slice(2);
  const outFlag = rest.indexOf('--out');
  const outDir = path.resolve(
    REPO_ROOT,
    outFlag === -1 ? 'dist/release' : (rest[outFlag + 1] ?? 'dist/release'),
  );

  const source = platform ? SOURCES[platform] : undefined;
  if (platform === undefined || source === undefined) {
    console.error(`usage: release-artifact.ts <${Object.keys(SOURCES).join('|')}> [--out <dir>]`);
    process.exit(1);
    return;
  }

  const version = String(require(path.join(REPO_ROOT, 'package.json')).version);
  const artifacts = await findArtifacts(platformRoot(platform), source.dirs, source.extensions);
  if (artifacts.length === 0) {
    console.error(
      `no ${platform} artifact found — run \`pnpm tools-pack ${platform} build\` first`,
    );
    process.exit(1);
    return;
  }

  await mkdir(outDir, { recursive: true });
  for (const artifact of artifacts) {
    const setup = artifact.includes('-setup') ? '-setup' : '';
    const name = `${SLUG}-${version}-${hostArch()}${setup}${path.extname(artifact)}`;
    const destination = path.join(outDir, name);
    await copyFile(artifact, destination);
    const { size } = await stat(destination);
    console.log(`${name}  ${(size / 1024 / 1024).toFixed(0)} MB`);
  }
  console.log(`→ ${path.relative(REPO_ROOT, outDir)}`);
}

await main();
