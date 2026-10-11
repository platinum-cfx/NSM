# Git workflow — standing rule (owner directive, 2026-10-11)

> **"Update the github as well and do that for everything you work on."**

Every work unit — every fix batch, new test suite, doc update, anything —
ends with:

1. **commit** — meaningful message with the evidence numbers in it
   (e.g. "multiplayer 36/36"), and
2. **push** to `main` on https://github.com/platinum-cfx/NSM
   (`bash tools/push-github.sh <TOKEN>` or `$NSM_GH_TOKEN`).

No "done" claim without the push. If the push fails (no token available in
this environment, auth expired), say so explicitly and hand back the exact
command to finish it — never claim the remote is updated without running
`git ls-remote` to prove it.

## Why tokens never persist here

The development sandbox strips `.git/config` and all credential files from
its snapshots (by design). Consequences:

- The `origin` remote does not survive a session restart — the push script
  addresses the repo URL directly instead of relying on a saved remote.
- A token pasted into the conversation works for that conversation only.
  A fresh session needs a fresh paste (or run `tools/push-github.sh`
  yourself on your machine, where credentials live in your credential
  manager).
- Tokens pasted into chat are visible in the conversation — revoke them when
  the project wraps up, or rotate them periodically.

## History shape

The sandbox can lose `.git` internals between sessions; when that happens the
local history is rebuilt and **coalesced onto the pushed history** as a single
commit whose tree is exactly the tested workspace state (verified by tree
hash before pushing). The remote therefore always has the authoritative,
continuous history:

```
6b6fcb5  feat(compat): full resource lifecycle
f53ce2e  feat(compat): FiveM client-side Lua runtime (Prompt 4)
4688525  Multiplayer + DB integration green; qb-core client behavior; on-device selftest
```

## Server-side note for CI

`.github/workflows/ci.yml` (from the earlier repo layout) runs the six
original suites. The DB-backed suites (`multiplayer`, `db-integration`,
`qbcore-client`, `selftest`) need a MariaDB service on :3307 —
see `docs/TESTING.md` for the exact commands and preconditions.

## Incident 2026-10-11: coalesced push dropped 3,962 files — rules that follow

**What happened:** a coalesced commit (4688525) was built from a sandbox that
contained only the fivem-compat slice; pushing it replaced the whole repo tree,
deleting altv-js-module-v1, server, sources, website, client-new, masterlist,
.github and the project README from main (ad4e75f). Restored in 5ac6755 as a
union of the f53ce2e tree + compat work. No history was lost.

**Hard rules from now on:**
1. This clone is a **cone-mode sparse checkout** of `resources/ real_resources/
   docs/ tools/` only. Framework files (altv-js-module-v1, server, sources,
   website, client-new, masterlist, .github) are carried in the index with
   skip-worktree bits — they are NEVER on disk, so a stray `git add -A` can
   never delete them again. Do not disable sparse-checkout.
2. **Verify before every push:** `git diff --name-status origin/main HEAD` must
   show only intended additions/modifications inside the sparse cone. Any `D`
   entry outside an explicit, user-approved deletion list = STOP, do not push.
3. After any snapshot recovery, re-verify `git ls-tree --name-only HEAD` lists
   every framework top-level dir before the next push.
4. Coalesced/grafted commits must be built from the **union** of the remote
   tree and the new work — never from a sandbox-only tree.
