/**
 * Collector for the A2UI generation-consistency measurement.
 *
 * Runs one brief N times through the real daemon (`od project create` +
 * `od run start`) and copies the raw evidence of each iteration to disk.
 * It computes NO metrics — that is `analyze.ts`. The split is deliberate:
 * agent runs cost money and minutes, so the expensive half must be re-runnable
 * independently of the cheap half. You can change how a metric is computed and
 * re-analyze without spending another provider budget.
 *
 * Usage:
 *   pnpm exec tsx scripts/posicube/a2ui-measure/collect.ts \
 *     --brief a-customer-dashboard --runs 10 --no-retry
 *
 * Prerequisites: a daemon is up (`pnpm tools-dev`) and the daemon package is
 * built (`pnpm --filter @open-design/daemon build`).
 */

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import { BRIEFS, briefById, briefMessage, type Brief } from "./briefs.ts";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const odCli = path.join(repoRoot, "apps/daemon/dist/cli.js");
const seedRoot = path.join(
  repoRoot,
  "plugins/_official/examples/react-project/assets",
);

/** Directories the authoring skill marks read-only. Any change here is contract editing. */
const CONTRACT_DIRS = ["src/authoring", "src/genui", "src/blocks"] as const;
/** Where a spec-bypassing agent writes real React instead. */
const CODE_DIRS = ["src/app", "src/components"] as const;
const CODE_EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js"]);

type Options = {
  brief: Brief;
  runs: number;
  variant: string;
  seedDir: string;
  designSystem: string;
  agent: string | null;
  noRetry: boolean;
  outDir: string;
  dataDir: string;
  daemonUrl: string | null;
};

export type FileDelta = {
  /** Path relative to the project root. */
  file: string;
  status: "added" | "modified" | "removed";
};

export type IterationRecord = {
  index: number;
  briefId: string;
  briefKind: string;
  variant: string;
  designSystem: string;
  projectId: string | null;
  runId: string | null;
  specWritten: boolean;
  /** True when the run finished without the CLI reporting an error. */
  ok: boolean;
  error: string | null;
  elapsedMs: number;
  /** Edits to files the skill declares read-only. */
  contractEdits: FileDelta[];
  /** Source files under src/app or src/components that the seed does not ship. */
  extraSourceFiles: string[];
};

function fail(message: string): never {
  console.error(`a2ui-measure: ${message}`);
  process.exit(1);
}

function parseArgs(argv: readonly string[]): Options {
  const flags = new Map<string, string>();
  const booleans = new Set<string>();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === undefined || !token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      booleans.add(key);
    } else {
      flags.set(key, next);
      i += 1;
    }
  }

  if (booleans.has("help") || booleans.has("h")) {
    console.log(usage());
    process.exit(0);
  }

  const briefId = flags.get("brief");
  if (briefId === undefined) {
    fail(`--brief is required. Known briefs:\n${knownBriefs()}`);
  }
  const brief = briefById(briefId);
  if (brief === undefined) {
    fail(`unknown brief "${briefId}". Known briefs:\n${knownBriefs()}`);
  }

  const runsRaw = flags.get("runs") ?? "10";
  const runs = Number.parseInt(runsRaw, 10);
  if (!Number.isInteger(runs) || runs < 1) {
    fail(`--runs must be a positive integer, got "${runsRaw}"`);
  }

  const variant = flags.get("variant") ?? "a2ui-shadcn";
  // Mirrors apps/daemon/src/routes/runs.ts: the daemon regex-matches the label,
  // testing shadcn BEFORE plain a2ui because both contain "a2ui".
  const seedName = /a2ui/i.test(variant)
    ? /shadcn|tailwind/i.test(variant)
      ? "shadcn-next-a2ui"
      : "minimal-next-a2ui"
    : /plain/i.test(variant)
      ? "scaffold-next"
      : "minimal-next";
  const seedDir = path.join(seedRoot, seedName);
  if (!existsSync(seedDir)) {
    fail(`seed directory not found for variant "${variant}": ${seedDir}`);
  }

  const agent = flags.get("agent");
  const daemonUrl = flags.get("daemon-url");

  return {
    brief,
    runs,
    variant,
    seedDir,
    designSystem: flags.get("design-system") ?? "github",
    agent: agent ?? null,
    noRetry: booleans.has("no-retry"),
    outDir: path.resolve(
      flags.get("out") ?? path.join(repoRoot, ".tmp/a2ui-measure", brief.id),
    ),
    dataDir: path.resolve(flags.get("data-dir") ?? path.join(repoRoot, ".od")),
    daemonUrl: daemonUrl ?? null,
  };
}

function knownBriefs(): string {
  return BRIEFS.map((b) => `  ${b.id}  [kind ${b.kind}]  ${b.title}`).join("\n");
}

function usage(): string {
  return [
    "Collect raw evidence for the A2UI consistency measurement.",
    "",
    "Usage:",
    "  pnpm exec tsx scripts/posicube/a2ui-measure/collect.ts --brief <id> [options]",
    "",
    "Options:",
    "  --brief <id>            Required. One of:",
    knownBriefs(),
    "  --runs <n>              Iterations (default 10).",
    "  --variant <label>       Scaffold variant label (default a2ui-shadcn).",
    "  --design-system <id>    Design system to apply (default github).",
    "  --agent <id>            Agent to run (claude|codex|opencode). Daemon default if omitted.",
    "  --no-retry              Append the retry-suppression clause; measures FIRST attempt.",
    "  --out <dir>             Artifact root (default .tmp/a2ui-measure/<brief>).",
    "  --data-dir <dir>        Daemon data dir (default <repo>/.od).",
    "  --daemon-url <url>      Daemon HTTP base.",
    "",
    "Then: pnpm exec tsx scripts/posicube/a2ui-measure/analyze.ts --in <dir>",
  ].join("\n");
}

type CommandResult = { code: number; stdout: string; stderr: string };

function runOd(args: readonly string[], daemonUrl: string | null): Promise<CommandResult> {
  const full = daemonUrl === null ? [...args] : [...args, "--daemon-url", daemonUrl];
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [odCli, ...full], {
      cwd: repoRoot,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", (err) => {
      resolve({ code: 1, stdout, stderr: `${stderr}\n${err.message}` });
    });
    child.on("close", (code) => {
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

/**
 * `od --json` prints one JSON document, but `--follow` interleaves progress
 * lines before it. Take the last parseable JSON value in the stream rather than
 * assuming the whole of stdout is JSON.
 */
function parseJsonLoose(stdout: string): unknown {
  const trimmed = stdout.trim();
  if (trimmed === "") return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through to line scanning
  }
  const lines = trimmed.split("\n");
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i]?.trim();
    if (line === undefined || line === "") continue;
    if (!line.startsWith("{") && !line.startsWith("[")) continue;
    try {
      return JSON.parse(line);
    } catch {
      continue;
    }
  }
  return null;
}

/** Pull an id out of a CLI response without assuming one exact envelope shape. */
function extractId(value: unknown, keys: readonly string[]): string | null {
  if (value === null || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  for (const key of keys) {
    const direct = record[key];
    if (typeof direct === "string" && direct !== "") return direct;
  }
  for (const nestedKey of ["project", "run", "data", "result"]) {
    const nested = record[nestedKey];
    if (nested !== undefined && nested !== null && typeof nested === "object") {
      const found = extractId(nested, keys);
      if (found !== null) return found;
    }
  }
  return null;
}

function walkFiles(root: string, relative = ""): string[] {
  const absolute = path.join(root, relative);
  if (!existsSync(absolute)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const childRelative = relative === "" ? entry.name : `${relative}/${entry.name}`;
    if (entry.isDirectory()) {
      out.push(...walkFiles(root, childRelative));
    } else if (entry.isFile()) {
      out.push(childRelative);
    }
  }
  return out;
}

function hashFile(file: string): string {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

/**
 * Compare a finished project against the pristine seed.
 *
 * Both failure modes recorded in docs/posicube/status.md are the same signal —
 * the agent hitting the catalog ceiling and routing around it — so they are
 * collected together and separated only at report time:
 *   contractEdits    the agent widened the contract to fit its spec
 *   extraSourceFiles the agent wrote React instead of (or alongside) a spec
 */
function diffAgainstSeed(
  projectDir: string,
  seedDir: string,
): { contractEdits: FileDelta[]; extraSourceFiles: string[] } {
  const contractEdits: FileDelta[] = [];
  for (const dir of CONTRACT_DIRS) {
    const seedFiles = new Set(walkFiles(path.join(seedDir, dir)));
    const projectFiles = new Set(walkFiles(path.join(projectDir, dir)));
    for (const file of seedFiles) {
      const relative = `${dir}/${file}`;
      if (!projectFiles.has(file)) {
        contractEdits.push({ file: relative, status: "removed" });
        continue;
      }
      const seedHash = hashFile(path.join(seedDir, dir, file));
      const projectHash = hashFile(path.join(projectDir, dir, file));
      if (seedHash !== projectHash) {
        contractEdits.push({ file: relative, status: "modified" });
      }
    }
    for (const file of projectFiles) {
      if (!seedFiles.has(file)) {
        contractEdits.push({ file: `${dir}/${file}`, status: "added" });
      }
    }
  }

  const extraSourceFiles: string[] = [];
  for (const dir of CODE_DIRS) {
    const seedFiles = new Set(walkFiles(path.join(seedDir, dir)));
    for (const file of walkFiles(path.join(projectDir, dir))) {
      if (seedFiles.has(file)) continue;
      if (!CODE_EXTENSIONS.has(path.extname(file))) continue;
      extraSourceFiles.push(`${dir}/${file}`);
    }
  }

  return { contractEdits, extraSourceFiles };
}

async function collectOne(
  options: Options,
  index: number,
  iterationDir: string,
): Promise<IterationRecord> {
  const started = Date.now();
  const label = `${options.brief.id}-${String(index).padStart(3, "0")}`;
  const base: Omit<IterationRecord, "elapsedMs"> = {
    index,
    briefId: options.brief.id,
    briefKind: options.brief.kind,
    variant: options.variant,
    designSystem: options.designSystem,
    projectId: null,
    runId: null,
    specWritten: false,
    ok: false,
    error: null,
    contractEdits: [],
    extraSourceFiles: [],
  };
  const done = (record: Omit<IterationRecord, "elapsedMs">): IterationRecord => ({
    ...record,
    elapsedMs: Date.now() - started,
  });

  // skipDiscoveryBrief keeps the agent from opening a <question-form> and
  // stalling forever — an unattended measurement has nobody to answer it.
  const metadataPath = path.join(iterationDir, "project-metadata.json");
  writeFileSync(
    metadataPath,
    `${JSON.stringify({ kind: "react-project", skipDiscoveryBrief: true }, null, 2)}\n`,
  );

  const created = await runOd(
    [
      "project",
      "create",
      "--name",
      label,
      "--plugin",
      "example-react-project",
      "--design-system",
      options.designSystem,
      "--metadata-json",
      metadataPath,
      "--json",
    ],
    options.daemonUrl,
  );
  writeFileSync(path.join(iterationDir, "project-create.log"), `${created.stdout}\n${created.stderr}`);
  const projectId = extractId(parseJsonLoose(created.stdout), ["id", "projectId"]);
  if (created.code !== 0 || projectId === null) {
    return done({
      ...base,
      error: `project create failed (exit ${created.code}); see project-create.log`,
    });
  }

  const inputs = JSON.stringify({ framework: "next", variant: options.variant });
  const runArgs = [
    "run",
    "start",
    "--project",
    projectId,
    "--plugin",
    "example-react-project",
    "--inputs",
    inputs,
    "--message",
    briefMessage(options.brief, options.noRetry),
    "--follow",
    "--json",
  ];
  if (options.agent !== null) runArgs.push("--agent", options.agent);

  const started2 = await runOd(runArgs, options.daemonUrl);
  writeFileSync(path.join(iterationDir, "run-start.log"), `${started2.stdout}\n${started2.stderr}`);
  const runId = extractId(parseJsonLoose(started2.stdout), ["id", "runId"]);

  const projectDir = path.join(options.dataDir, "projects", projectId);
  if (!existsSync(projectDir)) {
    return done({
      ...base,
      projectId,
      runId,
      error: `project dir not found: ${projectDir} (check --data-dir)`,
    });
  }

  const specPath = path.join(projectDir, "a2ui-spec.json");
  const specWritten = existsSync(specPath);
  if (specWritten) {
    cpSync(specPath, path.join(iterationDir, "a2ui-spec.json"));
  }

  const { contractEdits, extraSourceFiles } = diffAgainstSeed(projectDir, options.seedDir);

  return done({
    ...base,
    projectId,
    runId,
    specWritten,
    ok: started2.code === 0,
    error: started2.code === 0 ? null : `run start exited ${started2.code}; see run-start.log`,
    contractEdits,
    extraSourceFiles,
  });
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (!existsSync(odCli)) {
    fail(
      `od CLI not built at ${odCli}\n` +
        "  run: pnpm --filter @open-design/daemon build",
    );
  }
  if (!existsSync(options.dataDir)) {
    fail(`daemon data dir not found: ${options.dataDir} (is the daemon running?)`);
  }

  mkdirSync(options.outDir, { recursive: true });
  const runsDir = path.join(options.outDir, "runs");
  mkdirSync(runsDir, { recursive: true });

  console.log(
    `a2ui-measure: brief=${options.brief.id} kind=${options.brief.kind} ` +
      `runs=${options.runs} variant=${options.variant} ds=${options.designSystem} ` +
      `retry=${options.noRetry ? "suppressed" : "allowed"}`,
  );
  console.log(`a2ui-measure: artifacts → ${options.outDir}`);

  const records: IterationRecord[] = [];
  for (let index = 1; index <= options.runs; index += 1) {
    const iterationDir = path.join(runsDir, String(index).padStart(3, "0"));
    mkdirSync(iterationDir, { recursive: true });
    process.stdout.write(`  [${index}/${options.runs}] `);
    const record = await collectOne(options, index, iterationDir);
    records.push(record);
    writeFileSync(
      path.join(iterationDir, "meta.json"),
      `${JSON.stringify(record, null, 2)}\n`,
    );
    const marks = [
      record.specWritten ? "spec" : "NO-SPEC",
      record.contractEdits.length > 0 ? `contract:${record.contractEdits.length}` : null,
      record.extraSourceFiles.length > 0 ? `extra-tsx:${record.extraSourceFiles.length}` : null,
      record.error,
    ].filter((value): value is string => value !== null);
    console.log(`${Math.round(record.elapsedMs / 1000)}s  ${marks.join("  ")}`);
  }

  writeFileSync(
    path.join(options.outDir, "session.json"),
    `${JSON.stringify(
      {
        briefId: options.brief.id,
        briefKind: options.brief.kind,
        briefTitle: options.brief.title,
        runs: options.runs,
        variant: options.variant,
        designSystem: options.designSystem,
        seedDir: path.relative(repoRoot, options.seedDir),
        retrySuppressed: options.noRetry,
        records,
      },
      null,
      2,
    )}\n`,
  );

  console.log(
    `\na2ui-measure: collected ${records.length} iterations.\n` +
      `  analyze: pnpm exec tsx scripts/posicube/a2ui-measure/analyze.ts --in ${path.relative(repoRoot, options.outDir)}`,
  );
}

await main();
