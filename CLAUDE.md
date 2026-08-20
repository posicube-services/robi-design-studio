@AGENTS.md

---

## Posicube fork

This repo is Posicube's fork of `nexu-io/open-design`. Everything above is
upstream's contract and still applies. Posicube-specific context lives in
**[`docs/posicube/`](./docs/posicube/README.md)** — read that before working on
A2UI, the react-project pipeline, or anything that touches upstream files.

Two rules that are easy to break by accident:

1. **Do not restructure upstream code.** Add at extension points instead. The
   fork modifies 39 non-i18n upstream files (+614/−49 lines as of v0.19.2), and
   how small that number stays is what decides whether `git merge upstream/main`
   is painless. It was 17 files and one conflict a sync ago; it is 39 files and
   35 conflicts now. See `docs/posicube/fork-maintenance.md` before adding to
   it — especially for in-place renames, which are the main cause of the growth.
2. **Posicube docs go in `docs/posicube/`** — never in root `AGENTS.md` or other
   upstream doc paths. Upstream has no such directory, so it can never conflict.
