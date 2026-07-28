@AGENTS.md

---

## Posicube fork

This repo is Posicube's fork of `nexu-io/open-design`. Everything above is
upstream's contract and still applies. Posicube-specific context lives in
**[`docs/posicube/`](./docs/posicube/README.md)** — read that before working on
A2UI, the react-project pipeline, or anything that touches upstream files.

Two rules that are easy to break by accident:

1. **Do not restructure upstream code.** Add at extension points instead. The
   fork modifies only ~10 upstream files (+226/−2 lines, all insertions), which
   is what keeps `git merge upstream/main` painless. See
   `docs/posicube/fork-maintenance.md`.
2. **Posicube docs go in `docs/posicube/`** — never in root `AGENTS.md` or other
   upstream doc paths. Upstream has no such directory, so it can never conflict.
