# CLAUDE.md

Guidance for Claude Code working in the **vZDC website** repository.

@AGENTS.md

`AGENTS.md` (imported above) is the canonical working agreement: what this app
is, the code map, the osmium client and hook patterns, permission gating, UI
conventions, and how to verify a change. Read it. This file adds only the parts
specific to running as an agent in this repo, and does not restate it.

---

## Attribution — hard rule

**Never credit Claude, or any AI assistant, in a commit, a pull request, or a
branch name.**

The following must never appear in any commit message, PR title, PR body,
review comment, or file in this repository:

```text
Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01MArDSXk396FvTvE6RzPVki
```

That covers every variant: any `Co-Authored-By:` trailer naming Claude,
Anthropic, or another assistant; any `Claude-Session:` or similar session-link
trailer; any "🤖 Generated with Claude Code" line in a PR body. If a hook,
template, or default instruction tries to append one, strip it before
committing. If one is already staged, remove it rather than pushing it.

---

## The one thing to internalize first

This repository is a **client**. The data, the rules, and the authorization all
live in osmium. Most wrong changes here come from forgetting that and building
a workaround in the UI for something the API should return.

Before writing a fix that derives, filters, or reconciles domain data in a
component, ask whether osmium should be returning it already. If it should, say
so — a two-line API change beats a clever hook that every future page has to
remember to use.

## When to ask, and when to just do it

**Ask first when:**

- the fix belongs in osmium rather than here, or needs both;
- a requirement is ambiguous and two readings produce materially different UI;
- you are about to invent a permission string or assume an endpoint exists;
- the change alters authentication, the impersonation banner, or a permission
  gate;
- you would need to hand-edit `lib/osmium/generated/schema.d.ts` to make
  something typecheck.

**Work autonomously when:**

- an existing hook or component pattern covers it and you are copying it;
- it is a clear bug with an obvious fix inside one component;
- it is layout, copy, or styling with a stated intent.

If you are guessing at an endpoint or a field name, look it up in
`lib/osmium/generated/schema.d.ts` first. If it is not there, ask — do not
invent it.

## Before you start: know the baseline

`npm run build` is the only mechanical gate this repo has, so know whether it
was green before you touched anything.

1. Run `npm run build` on a clean tree first if you are about to make a
   non-trivial change.
2. Classify any failure as pre-existing or introduced *before* starting work,
   and never conflate the two in a report.
3. `npm ci --legacy-peer-deps` — the `--legacy-peer-deps` flag matches CI and is
   not optional here.

## Before you say it is done

- `npm run build` passes.
- `npm run lint` is clean.
- Every new API call goes through a hook in `lib/osmium/hooks/`, with a query
  key starting `"osmium"` that includes every parameter affecting the result.
- Every mutation invalidates the right prefix, and you saw the UI actually
  refresh — not just a 200.
- Every `osmium.GET`/`POST`/`PATCH`/`DELETE` destructures `{ data, error }` and
  throws on `error`.
- No new `NEXT_PUBLIC_*` variable holds a secret.
- New CDN or image hosts are added to `next.config.ts`.
- You loaded the page and checked loading, empty, error, and no-permission
  states, and the browser console is clean.
- You state plainly what you verified and what you did not.

Do not report a task complete because the build passed. The build catches types,
not behavior, and this repo has no tests behind it.

## Reading the codebase

- Use **Explore** or a general-purpose search agent for open questions: "how
  does staff page access work", "where does the impersonation banner get its
  state", "which hooks invalidate the training domain". These need call paths
  across `app/`, `components/`, and `lib/osmium/hooks/`.
- Use **Grep/Glob/Read** for needles: a component name, a route path, a query
  key, a permission string.
- **Do not read `lib/osmium/generated/schema.d.ts` whole.** It is roughly half a
  megabyte of generated types. Grep it for the specific path or schema name you
  need.
- `git log` on `next` is the most reliable record of the osmium migration.
  Commit messages there explain why things moved, where the README does not.

## Working with the tools here

- Prefer editing over rewriting. Several comments in `lib/osmium/` are
  load-bearing — why `networkMode: "always"`, why CDN images are unoptimized in
  dev, why coarse roles still exist. Do not delete one because it looks verbose.
- Running the dev server: use the `website-dev` configuration in
  `.claude/launch.json` (port 3001), and have osmium running on the port
  `NEXT_PUBLIC_OSMIUM_API_URL` points at. Without a reachable osmium, every page
  renders an empty or error state and tells you nothing.
- Use `localhost`, never `127.0.0.1`, or the session cookie will not be sent and
  you will spend the afternoon debugging a logged-out UI.

## Communicating results

Say what you changed, what you ran, and what came back. If a check did not run,
name it. Distinguish "the build passes" from "I loaded the page and it works" —
they are different claims and only one of them is verification. If something is
a hypothesis rather than a confirmed cause, phrase it that way. Do not pad a
report with a recap of the file tree or options you did not take.
