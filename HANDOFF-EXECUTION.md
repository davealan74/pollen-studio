# Pollen Studio — execution handoff

**For a fresh Claude Code session.** This worktree is dedicated to executing the implementation plan; the brainstorming + planning conversation lives in the sibling `/Users/dave/projects/pollen-studio` worktree on `main`.

## Open this session in: `/Users/dave/projects/pollen-studio-impl`

Branch: `feat/v1` (already checked out)
Origin: `git@git.techmagic.info:dave/pollen-studio.git`

## Paste this as your first message

```
I'm continuing execution of the Pollen Studio implementation plan.

Worktree: /Users/dave/projects/pollen-studio-impl (branch feat/v1)
Plan:    /Users/dave/projects/pollen-studio/docs/superpowers/plans/2026-05-21-pollen-studio-implementation.md
Spec:    /Users/dave/projects/pollen-studio/docs/superpowers/specs/2026-05-21-pollen-studio-design.md
Memory:  see pollen-studio.md (status "v1 in progress on feat/v1")

Invoke the superpowers:subagent-driven-development skill against the plan above.
Start at Task 1 and run straight through Task 20, two-stage review (spec then quality) after each.

Important constraints from spec §1.4 (read it):
- No mention of Claude / Claude Code / "generated with" / AI assistance in any commit message, code comment, README, package.json, meta tag, or user-facing string.
- No Co-Authored-By: Claude lines on commits in this repo. Author identity is "Dave Alan Caruana / Techmagic" only.
- Footer attribution: © 2026 Dave Alan Caruana / Techmagic → https://techmagic.info

Push: `git push -u origin feat/v1` is pre-authorized (per the
feedback_git-push-techmagic-preauthorized memory). Push after every couple of tasks.

Block on Task 11 only if the pk_ client ID hasn't been registered at
enter.pollinations.ai yet — Tasks 1–10 + tests work without it.
```

## Pre-flight checklist for the fresh session

- [ ] `pwd` returns `/Users/dave/projects/pollen-studio-impl`
- [ ] `git status` is clean and on `feat/v1`
- [ ] `node --version` ≥ v20
- [ ] `pnpm --version` ≥ 9 (else `npm i -g pnpm@9`)
- [ ] Plan file exists at the path above (read-only — it lives on `main`)

## What's already done (don't redo)

- Brainstorming + spec (committed on `main`, on Forgejo)
- Plan written + reviewed (committed on `main`, **not on `feat/v1` yet** — that's expected; plan is read across worktrees)
- Vhost + DNS + LE cert + autodom default index live at https://pollenstudio.cru2.net
- Worktree at `/Users/dave/projects/pollen-studio-impl` on `feat/v1`

## When done with all 20 tasks

Per the skill, after the final code reviewer passes, invoke
`superpowers:finishing-a-development-branch` to choose merge vs PR vs cleanup.

The deploy script (`scripts/deploy.sh`, built by Task 19) rsyncs `build/` to
`/var/www/autodom/pollenstudio.cru2.net/htdocs/` on `newhetzner3`.
