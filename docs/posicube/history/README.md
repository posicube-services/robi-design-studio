# History — primary sources

Verbatim artifacts from the sessions that shaped this fork. They are kept
unedited: the summaries in the parent directory are the *current* truth, while
these record how it was arrived at and what was rejected.

| File | What it is |
| --- | --- |
| `2026-07-22-requirements-interview.md` | Socratic requirements interview that produced decisions D1–D8. Also carries the exposed-assumptions table (what was believed at the start vs what survived) and the acceptance criteria. |
| `2026-07-23-consensus-plan.md` | Planner → Architect → Critic pass over the implementation plan. Verdict was **ITERATE**, not approve — it lists the blocking findings and the required changes. Worth reading before adding to the A2UI design. |
| `2026-07-23-rebase-plan.md` | The plan for moving off the snapshot repo onto a real fork: what counted as additive vs a modification, and the cost estimate. Executed; see `../fork-maintenance.md` for the outcome. |

**Caveat:** these are dated snapshots. Where they disagree with
`../architecture-decisions.md`, `../fork-maintenance.md`, or `../status.md`,
the parent directory wins — decisions moved after these were written (the A2UI
`variant` split, for instance, postdates all three).
