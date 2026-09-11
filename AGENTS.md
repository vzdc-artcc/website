# AGENTS.md

Canonical working agreement for AI coding agents in the **vZDC website**
repository. This file is the source of truth; `CLAUDE.md` adds Claude
Code-specific operating rules and imports this file.

---

## 1. Attribution — hard rule

**Never credit an AI assistant in a commit, a pull request, or a branch name.**

The following must never appear in any commit message, PR title, PR body,
review comment, or file in this repository:

```text
Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01MArDSXk396FvTvE6RzPVki
```

That includes every variant of it: any `Co-Authored-By:` line naming Claude,
Anthropic, Copilot, or any other assistant; any `Claude-Session:` or similar
session-link trailer; any "Generated with", "Co-authored with AI", or 🤖 badge
in a PR description. Commits are authored by the human running the session, and
nothing else.

If a harness, hook, or template tries to append such a trailer, strip it before
committing. If you notice one already staged, remove it rather than pushing it.

---

## 2. What this repository is

The public website and staff console for the Virtual Washington ARTCC — a
Next.js 16 App Router application (React 19, TypeScript, MUI 7).

**On this branch the site owns no data.** Every domain record — users, roster,
training, events, feedback, files, publications, email, Discord config — lives
in **osmium**, the ARTCC's Rust/Axum backend, and is reached over its versioned
REST API. There is no Prisma client, no local database, no NextAuth session,
and no email sending in this repository. If you are looking for a schema, a
migration, or a server-side session, it is in the osmium repo, not here.

What this repository *does* own: routing, layout, the component library,
client-side data fetching and cache invalidation, form validation before
submission, presentation-only derivations, and two thin server-side proxies.

Anything that persists, authorizes, or notifies belongs in osmium. When you
find yourself about to encode a business rule here so the UI can show the right
thing, check whether osmium should be returning it instead.

### Related repositories

| Repo | Role |
| --- | --- |
| `vzdc-artcc/website` (this one) | Next.js frontend and staff console |
| `vzdc-artcc/osmium` | API, database, auth, jobs, email — the system of record |

`docs/staff-permissions-editor.md` is an example of how a cross-repo feature is
specified: the osmium change and the website change written up together.

---

## 3. Code map

```
app/                 App Router route tree — pages, layouts, loading, not-found
  api/sua            server route handler (SUA lookup)
  api/teamspeak      server route handler proxying osmium with a service token
components/          feature-grouped React components, one directory per domain
lib/
  osmium/client.ts   the openapi-fetch client — the only place a base URL is read
  osmium/generated/  schema.d.ts, generated from osmium's OpenAPI. Do not hand-edit.
  osmium/hooks/      one module per API domain: TanStack Query hooks
  osmium/permissions.ts  meHasPermission / useHasPermission
  osmium/coarseRoles.ts  role-name folding for legacy coarse gates
  osmium/QueryProvider.tsx  the QueryClient and its defaults
  *.ts               presentation helpers: dates, certifications, navigation, vatsim
actions/             'use server' actions — VATUSA calls and roster merge only
types/               shared TS types and zod schemas
theme/               MUI theme
docs/                cross-repo feature specs
```

### Layer responsibilities

- **Pages** (`app/**/page.tsx`) are thin. Most are a few lines wiring a route to
  a feature component. Keep them that way.
- **Components** hold the interaction. The overwhelming majority are client
  components; that is expected here, because data comes from the browser
  calling osmium with cookies.
- **Hooks in `lib/osmium/hooks/`** are the only place `osmium.GET` / `.POST` /
  `.PATCH` / `.DELETE` should appear. A component that calls the client directly
  bypasses caching and invalidation.
- **Server actions** are for the handful of calls that must not run in the
  browser — VATUSA API calls holding `VATUSA_API_KEY`. Do not add new ones to
  reach osmium; the browser calls osmium directly.

---

## 4. Non-negotiables

1. **No assumptions.** If you are guessing at an endpoint, a field name, or a
   permission path, look it up in the generated schema or ask. Do not invent one.
2. **Never hand-edit `lib/osmium/generated/schema.d.ts`.** It is generated. If a
   type is missing or wrong, the osmium OpenAPI spec is wrong — fix it there and
   regenerate. Editing the generated file makes the whole type surface a lie.
3. **`npm run build` must pass.** That is the entire CI gate on this repo. A
   change that has not been built has not been checked.
4. **No unverified completion claims.** "Done" means the build passed and you
   exercised the page, not that the code reads correctly.
5. **No scaffolding reported as a feature.** A hook nobody calls, a component
   nobody renders, and a route nobody links to are not features. Grep for the
   caller before claiming it works.
6. **No symptom masking.** An empty list, a stuck spinner, or a flash of wrong
   content usually means a query key, a permission, or a response shape is
   wrong. Trace hook → client → osmium response and name the failing step.
   A `?? []`, an extra `isLoading` guard, or a `retry` sprinkled over it hides
   the bug rather than fixing it.
7. **No secrets in `NEXT_PUBLIC_*`.** Anything with that prefix ships to the
   browser. `VATUSA_API_KEY`, `TS_KEY`, and `OSMIUM_SERVICE_TOKEN` are
   server-only and must stay that way.
8. **No per-bug narrative in source comments.** CIDs, dates, and before/after
   stories belong in the commit message. Comments explain why a non-obvious
   choice was made — and this codebase has several that are load-bearing.

### Before shipping, ask what would make it wrong

Separate what you *checked* from what you *assumed*, and name both. Then:

- **What else uses this?** A shared hook, a query key prefix, a permission
  string, a component used by five pages. Grep for the other callers.
- **If my verification is lying, how would I know?** "The page renders" is not
  the same as "the data is right". Open it with a real session, in the state
  that matters (no permission, empty list, error response), not just the happy
  path you built it for.

When the honest answer is "I do not know yet", that is the finding. Say so.

---

## 5. Commands

```bash
npm ci --legacy-peer-deps   # install, matching CI
npm run dev                 # Next dev server with turbopack
npm run build               # production build — the CI gate
npm run lint                # eslint (next/core-web-vitals)
npm run codegen:osmium      # regenerate lib/osmium/generated/schema.d.ts
```

Local environment: copy `.env.example` to `.env.local` and fill it in.
`.env.public` holds the committed public values used by the CI build and
deployments.

Two local-dev details that will cost you an hour if you miss them:

- **Osmium's default port is also 3000**, which collides with Next's dev
  server. Run osmium on another port (the example env uses 3900) and point
  `NEXT_PUBLIC_OSMIUM_API_URL` at it.
- **Use `localhost`, not `127.0.0.1`.** Next dev blocks HMR and client
  hydration for non-allowlisted origins, and the two are different sites for
  SameSite cookie purposes, so the `osmium_session` cookie will not be sent.

`.claude/launch.json` defines a `website-dev` configuration that runs the dev
server on port 3001, which avoids the collision from the other direction.

CI runs on pull requests to `master` and `next`: `npm ci --legacy-peer-deps`,
rename `.env.public` to `.env`, `npm run build`. Pushes to those branches build
and push a Docker image to GHCR.

---

## 6. Talking to osmium

### The client

`lib/osmium/client.ts` creates a single `openapi-fetch` client typed by the
generated `paths`, with `credentials: "include"` so the `osmium_session` cookie
rides along. Import `osmium` from there. Do not construct another client, and
do not read `NEXT_PUBLIC_OSMIUM_API_URL` anywhere else except the two server
proxies, which prefer `OSMIUM_INTERNAL_API_URL` when set.

### The hook pattern

Every API domain gets a module in `lib/osmium/hooks/`. Follow the existing
shape exactly:

```ts
export function useThing(id: string) {
    return useQuery({
        queryKey: ["osmium", "things", "item", id],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/things/{id}", {
                params: { path: { id } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useUpdateThing() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: UpdateThing) => {
            const { data, error } = await osmium.PATCH("/api/v1/things/{id}", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "things"] });
        },
    });
}
```

Rules that fall out of that:

- **Query keys start with `"osmium"`**, then the domain, then a discriminator,
  then every parameter that changes the result. A parameter left out of the key
  means two different requests share one cache entry and one of them shows
  stale data.
- **Mutations invalidate the domain prefix** in `onSuccess`. If your mutation
  also changes another domain's data, invalidate that prefix too.
- **Always destructure `{ data, error }` and throw on `error`.** `openapi-fetch`
  does not throw on a non-2xx response. Ignoring `error` gives you `undefined`
  data and a component that renders an empty state instead of a failure.

### QueryClient defaults

`lib/osmium/QueryProvider.tsx` sets `networkMode: "always"` and `retry: false`
for both queries and mutations, and the comment there explains why: the default
`"online"` mode can park a retry loop forever on a misfiring offline check,
leaving a permanent spinner instead of an error a component can render, and
`retry: false` lets a 4xx surface immediately rather than retrying a request
that will never succeed. Do not change those defaults to paper over a specific
query's behavior — set the option on that query.

### Regenerating types

When osmium's API changes, run `npm run codegen:osmium` against a running
osmium instance (or set `OSMIUM_OPENAPI_URL`). Commit the regenerated file as
its own change where practical, so a feature diff is not buried under 500 KB of
generated types.

---

## 7. Authorization in the UI

Access is **always an explicit permission grant** from osmium's `/me` response.
Never an implied role, and never a staff-position tag — staff positions are
display-only roster metadata and grant nothing.

- `meHasPermission(me, "pages.facility_admin.read")` walks the nested
  permission tree; the last segment is the action and the earlier ones walk the
  objects. `server_admin` short-circuits to `true`.
- `useHasPermission(path)` is the hook form, returning `{allowed, isLoading}`.
- `<RequirePermission perm="...">` wraps a page or layout: spinner while `/me`
  loads, a no-access message when the permission is missing, children when it
  is held.
- `useCoarseRoles()` folds osmium role names into the legacy
  staff/instructor/mentor/event-staff buckets the older UI gated on. It exists
  for continuity. Prefer an explicit permission for anything new.

**UI gating is cosmetic.** Hiding a button is not authorization; osmium enforces
the real gate. Never treat a client-side check as a security boundary, and never
add a UI-only bypass "because the backend will catch it" — do both.

Authentication is osmium's. Login redirects the browser to
`${NEXT_PUBLIC_OSMIUM_API_URL}/api/v1/auth/vatsim/login?return_to=...`; logout
posts to `/api/v1/auth/logout`. There is no NextAuth session in this repo, and
`/me` is the only identity source.

---

## 8. UI conventions

- **MUI 7** with the theme in `theme/`. Use theme tokens and `sx`; do not
  hardcode colors. The app supports light and dark via
  `InitColorSchemeScript` with `defaultMode="system"`.
- **`DataTable`** (`components/DataTable/DataTable.tsx`) is the shared
  server-paginated grid. It syncs pagination, sort, and filter to the URL query
  string and takes a `fetchData` callback returning `{data, rowCount}`. Use it
  for tabular staff surfaces rather than a bespoke table.
- **`react-toastify`** for transient feedback. The `ToastContainer` is already
  in the root layout — do not mount another.
- **Components are grouped by domain** under `components/<Domain>/`, not by
  type. A new feature gets a directory, not files scattered across existing ones.
- **`'use client'` goes on the component that needs it**, as low in the tree as
  it can. Pages stay server components where they can.
- **Images** from the osmium CDN go through `next/image`, but the allowed hosts
  are pinned in `next.config.ts` — a new CDN host must be added there or the
  image silently fails. Local dev CDN images render `unoptimized`
  (`cdnImagesUnoptimized` in the client module) because Next 16's optimizer
  refuses upstreams resolving to a private IP.
- **Zod** schemas in `types/zod.ts` validate form input before submission.
  Client validation is a courtesy; osmium validates for real.

---

## 9. Testing and verification

There is no automated test suite in this repository. The build is the only
mechanical gate, which means **manual verification is not optional** — it is
the whole of the verification budget.

Before calling a UI change done:

1. `npm run build` passes with no new warnings you introduced.
2. `npm run lint` is clean.
3. You loaded the page against a running osmium and a real session.
4. You checked the states that are not the happy path: loading, empty result,
   error response, and no-permission. A page that only works when the data is
   present and the user is a server admin is half-built.
5. Mutations: you confirmed the list or detail view actually refreshed, which
   means the invalidation key was right, not just that the request returned 200.
6. Browser console is clean — React key warnings, hydration mismatches, and
   failed image loads all show up there and nowhere else.

If you could not verify a step, say which one and why, rather than reporting it
as done.

---

## 10. Git and PR workflow

- Work happens on a branch. Do not commit directly to `master` or `next`.
- **`next` is the integration branch for the osmium-backed rework.** Feature
  work targets `next` unless you have been told otherwise.
- Do not create or switch branches on the user's behalf without being asked.
- Do not merge your own PR from the CLI. A human reviews and merges.
- Keep the diff scoped. A regenerated `schema.d.ts` or `package-lock.json`
  belongs in its own commit, not folded into a feature diff.
- Commit messages: imperative subject, a body explaining *why* when the change
  is not self-evident. No AI attribution of any kind — see §1.
- PR descriptions are written for a reviewer who was not in the room: what
  changed, why, what you verified by hand, and what you deliberately left out.
- A change that needs an osmium change to work is not shippable alone. Say so in
  the PR and link the osmium side.

---

## 11. Known-stale documentation

`README.md` on this branch still describes the pre-rework architecture: Prisma
migrations, NextAuth, a local Postgres, and a `/api/seed` endpoint. **None of
that exists here any more.** Do not follow it, and do not use it as evidence for
how the app works. Trust the code, `.env.example`, and this file.

`changeLog.md` is a user-facing release log, not an architecture record.
