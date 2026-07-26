# Website Management Portal Spec

This document specifies a new **Website Management** portal on the vZDC
website: a server-admin-only surface for web/server infrastructure that
replaces today's Web System Administration (`/web-system`). It assumes
osmium (`../osmium`) as the API and identity authority (see
[`osmium-migration-plan.md`](./osmium-migration-plan.md) and osmium
`docs/architecture/auth-and-access.md`).

This is a product/tech spec for UI work that has **not** started. It does
not re-derive osmium's permission model or API contracts — those live in
osmium docs and are cited by path below.

---

## Guiding principles

1. **Highest privilege only.** The portal is for the singleton Osmium
   `SERVER_ADMIN`, not facility staff, not WM/`WEB_TEAM`.
2. **Server/web infra, not facility ops.** API keys, ACL, audit, jobs,
   email platform, Discord integrations — not roster, training, events,
   or member-facing web content.
3. **Same shell as other admin portals.** Material UI, `MenuWrapper` +
   sidebar + `Grid` layout matching Facility / Training / Events admin.
4. **No new osmium endpoints for v1.** Wire UI to APIs that already exist.
5. **Parity with existing Discord UI, then add.** Port Discord first so
   WM workflow is not stranded; ship API keys and the rest after.

---

## Decisions already made

- **Replace Web System Administration** (dropdown label, routes under
  `/web-system`, WM/`WEB_TEAM` gate) with **Website Management**.
- **Audience:** Osmium `SERVER_ADMIN` only — claimed on login when the
  user's CID matches `OSMIUM_SERVER_ADMIN_CID`. Not WM, not `WEB_TEAM`,
  not facility `STAFF`.
- **Scope (v1):** server-admin core only:
  - API keys
  - Access control (ACL / catalog / per-user grants)
  - Audit log
  - Background jobs
  - Email platform (templates, preview, send, outbox, resubscribe)
  - Discord integrations (migrated from `/web-system`)
- **Base path:** `/website-management` (new). Do not reuse `/web-system`
  so redirects and clean removal stay explicit.
- **Out of this portal:** broadcasts, welcome messages, publications,
  stats prefixes, file center (remain Facility Admin); email branding
  (`emails.branding.*`, STAFF-shaped) stays out of v1.

---

## 1. Current state

### Web System Administration (to be replaced)

| Piece | Path |
|-------|------|
| Nav entry | `components/Navbar/LoginButton.tsx` — "Web System Administration" |
| Layout gate | `app/web-system/layout.tsx` — `WM` staff position **or** `WEB_TEAM` role |
| Menu | `components/Admin/WebSystemAdminMenu.tsx` |
| Pages | Overview (`SyncTimes` + recent Prisma logs), Discord config CRUD under `app/web-system/discord-configs/**` |

No API key UI exists. The migration plan Phase 2 noted api-keys had
nothing to migrate; this spec is where that UI is defined.

### Osmium privilege reality (relevant to this portal)

| Capability | Osmium permission(s) | Who has it today |
|------------|----------------------|------------------|
| API key CRUD (cross-user) | `api_keys.read/create/update/delete` | Seeded onto `SERVER_ADMIN` only |
| Email templates / preview / send / outbox / suppressions | `emails.templates.read`, `emails.preview.create`, `emails.send.create`, `emails.outbox.read`, `emails.suppressions.*` | Catalogued; not granted to `STAFF` — effectively `SERVER_ADMIN` |
| Email branding | `emails.branding.*` | `STAFF` — **out of this portal v1** |
| ACL / access catalog / user access | `access.self.read`, `access.catalog.read`, `access.users.read`, `access.users.update` | Largely `STAFF` via hierarchical remap; portal UI still `SERVER_ADMIN`-gated |
| Audit | `audit.logs.read` | `STAFF`-shaped grant; portal UI `SERVER_ADMIN`-gated |
| Jobs list/detail | `system.read` | `STAFF`-shaped; portal UI `SERVER_ADMIN`-gated |
| Job run | `users.controller_status.update` (today) | Facility-shaped perm; see open questions |
| Discord / outbound jobs / announcements | `integrations.stats.update` | `STAFF`-shaped; portal UI `SERVER_ADMIN`-gated |

`SERVER_ADMIN` resolves to every row in `access.permissions` (including
permissions added later). It is **not** assignable via
`POST /api/v1/admin/users/{cid}/access` — only via env bootstrap on login.

`WM`, `AWM`, and `WEB_TEAM` exist as org/title roles but have almost no
seeded `role_permissions`. They must not gate this portal.

---

## 2. Access model (website)

### Portal gate

Allow entry only when the authenticated Osmium session includes the
`SERVER_ADMIN` role (or equivalent signal from the session / ACL payload
once auth cutover lands).

Until osmium is the sole identity authority, do **not** fall back to
NextAuth `WEB_TEAM` / `WM`. Prefer blocking the portal or gating on an
explicit interim check against the same CID as `OSMIUM_SERVER_ADMIN_CID`
rather than widening the audience.

### Nav

In `LoginButton.tsx` (desktop dropdown + mobile sidebar):

- Rename **Web System Administration** → **Website Management**
- Href → `/website-management/overview`
- Visibility → server admin only (same check as layout)

### Roles left behind

`WEB_TEAM` and the WM staff title remain org labels (roster, RoleForm,
etc.) unless separately deprecated. Losing portal access for WM/`WEB_TEAM`
is intentional.

---

## 3. Target information architecture

Same pattern as Facility (`/admin`), Training (`/training`), Events
(`/events/admin`):

- Layout: `app/website-management/layout.tsx` — session gate + `Grid`
  (sidebar ~2/9 on `lg`, content grow)
- Menu: `components/Admin/WebsiteManagementMenu.tsx` wrapping
  `MenuWrapper` (title **Website Management**; subheading can show
  server-admin CID/display name)

| Nav item | Route | Purpose |
|----------|-------|---------|
| Overview | `/website-management/overview` | Job health summary + recent audit snippet |
| API Keys | `/website-management/api-keys` | List / create / manage keys |
| API Key detail | `/website-management/api-keys/[keyId]` | Detail, edit permissions, revoke |
| Access Control | `/website-management/access` | Catalog + search/select user |
| User access | `/website-management/access/[cid]` | View/edit that user's roles & grants |
| Audit Log | `/website-management/audit` | Paginated audit trail |
| Background Jobs | `/website-management/jobs` | List job runs; detail + optional Run |
| Email — Templates | `/website-management/emails/templates` | Discover templates |
| Email — Preview / Send | `/website-management/emails/send` | Preview + queue send |
| Email — Outbox | `/website-management/emails/outbox` (+ `[id]`) | Inspect durable queue |
| Email — Resubscribe | `/website-management/emails/resubscribe` | Suppression lift |
| Discord | `/website-management/discord` (+ existing config/channel/role/category subroutes) | Port of today's Discord CRUD |

### Redirects / removal

- Permanent redirects from `/web-system/*` → closest `/website-management/*`
  (at least overview → overview, `discord-configs` → `discord`).
- After redirects bake: delete `app/web-system/**`,
  `WebSystemAdminMenu.tsx`, and leftover `WEB_TEAM`/`WM` portal checks.

---

## 4. Feature specs

### 4.1 Overview

Replace Prisma `SyncTimes` + `Log` reads with:

- Job list/status from `GET /api/v1/admin/jobs` (and optionally a few
  named `GET /api/v1/admin/jobs/{job_name}`)
- A short recent slice from `GET /api/v1/admin/audit`

This also unblocks the migration plan's note that `SyncTimes` can be
removed once the old web-system overview reads osmium jobs.

### 4.2 API Keys (primary new feature)

Ground truth: `../osmium/docs/api/api-keys.md`, routes under
`/api/v1/api-keys`, permissions `api_keys.*`.

**List** (`GET /api/v1/api-keys`)

- Paginated table: name, prefix/`last_four`, status, created by,
  created/last used/expires, actions.
- Server admin sees keys created by others.

**Create** (`POST /api/v1/api-keys`)

- Fields: `name` (required), `description`, `permissions` (required,
  ≥1 canonical permission), optional `expires_at`.
- Permission picker sourced from `GET /api/v1/admin/access/catalog`
  (server admin may grant any current permission).
- On success: show plaintext `secret` (`osm_…`) **once** in a dismissible /
  copyable banner; never re-fetchable.

**Detail / edit** (`GET` + `PATCH /api/v1/api-keys/{key_id}`)

- Show grouped permissions, metadata; allow rename, description clear,
  full permission-set replace.

**Revoke** (`DELETE /api/v1/api-keys/{key_id}`)

- Confirm dialog; marks credential revoked / account disabled.

Hooks: add `lib/osmium/hooks/api-keys.ts` (and catalog reuse from access
hooks) following existing React Query patterns.

### 4.3 Access Control

Ground truth: `../osmium/docs/api/admin.md` (Permission Payloads),
`../osmium/docs/route-permissions.md`.

| UI | Endpoint | Permission |
|----|----------|------------|
| Self ACL (optional debug on overview or access home) | `GET /api/v1/admin/acl` | `access.self.read` |
| Catalog browser | `GET /api/v1/admin/access/catalog` | `access.catalog.read` |
| User access view | `GET /api/v1/admin/users/{cid}/access` | `access.users.read` |
| Grant/revoke | `POST /api/v1/admin/users/{cid}/access` | `access.users.update` |

**Hard rule to surface in UI copy:** `SERVER_ADMIN` is env-claimed and
**not** assignable through the access POST. The API filters it out of the
catalog for assignment.

### 4.4 Audit Log

- `GET /api/v1/admin/audit` → `audit.logs.read`
- Paginated table with filters osmium already supports; show actor,
  action, timestamps; expandable before/after JSON when present
  (snapshots are stored JSON — do not rewrite timezones in UI).

### 4.5 Background Jobs

- List: `GET /api/v1/admin/jobs` → `system.read`
- Detail: `GET /api/v1/admin/jobs/{job_name}` → `system.read`
- Run: `POST /api/v1/admin/jobs/{job_name}/run` — include in UI behind a
  confirm dialog (see open questions on permission shape).

Also useful nearby (same Discord/integrations family, optional on jobs
or Discord page):

- `GET /api/v1/admin/integrations/outbound-jobs`
- `POST /api/v1/admin/integrations/outbound-jobs/run`

### 4.6 Email Platform

Ground truth: `../osmium/docs/api/emails.md`.

| Page | Endpoints | Permissions |
|------|-----------|-------------|
| Templates | `GET /api/v1/emails/templates` | `emails.templates.read` |
| Preview / Send | `POST /api/v1/emails/preview`, `POST /api/v1/emails/send` | `emails.preview.create`, `emails.send.create` |
| Outbox | `GET /api/v1/emails/outbox`, `GET .../outbox/{id}` | `emails.outbox.read` |
| Resubscribe | `POST /api/v1/emails/resubscribe` | `emails.suppressions.update` |

**Out of v1:** `GET/PATCH /api/v1/admin/emails/branding` (Facility /
STAFF-shaped).

Public preference routes (`/emails/preferences`) stay user-facing, not
this portal.

### 4.7 Discord Integrations

Lift existing `app/web-system/discord-configs/**` into
`app/website-management/discord/**` (or keep component tree and only
change routes/menu). Endpoints already used today map to
`/api/v1/admin/integrations/discord/*` → `integrations.stats.update`.

Optional: `POST /api/v1/admin/notifications/announcements` as a small
utility on the Discord/overview area — same permission family.

---

## 5. Explicit non-goals (v1)

- Facility Admin domains: roster, visitors, LOA, solo certs, staffing,
  SUA, controller status/lifecycle, feedback/incident decide, etc.
- Training / Events admin portals (unchanged).
- Web content currently under Facility Admin: broadcasts, welcome
  messages, publications, stats prefixes, file center / CDN audit.
- Email branding UI.
- Unimplemented osmium surfaces: `web.pages` / `web.announcements`
  handlers, GDPR `GET /api/v1/me/data-export`, rate-limit admin
  (`system.rate_limit.update`), durable IP request log admin — future
  candidates only if product wants them later.
- Broadening portal access to WM / `WEB_TEAM` / `STAFF`.

---

## 6. Osmium API cheat sheet (v1)

```
GET/POST          /api/v1/api-keys
GET/PATCH/DELETE  /api/v1/api-keys/{key_id}

GET               /api/v1/admin/acl
GET               /api/v1/admin/access/catalog
GET/POST          /api/v1/admin/users/{cid}/access
GET               /api/v1/admin/audit
GET               /api/v1/admin/jobs
GET               /api/v1/admin/jobs/{job_name}
POST              /api/v1/admin/jobs/{job_name}/run

GET               /api/v1/emails/templates
POST              /api/v1/emails/preview
POST              /api/v1/emails/send
GET               /api/v1/emails/outbox
GET               /api/v1/emails/outbox/{id}
POST              /api/v1/emails/resubscribe

GET/POST/PATCH…   /api/v1/admin/integrations/discord/*
GET/POST          /api/v1/admin/integrations/outbound-jobs[ /run ]
POST              /api/v1/admin/notifications/announcements
```

No osmium schema or route changes required for v1. If job-run permission
should be a dedicated `system.*` grant instead of
`users.controller_status.update`, that is an osmium follow-up (ask before
changing endpoints per migration-plan rules).

---

## 7. Implementation phases (when building)

Phased so Discord is not stranded and API keys land early.

**Phase WM-0 — Scaffold**

- [ ] `app/website-management/layout.tsx` + `WebsiteManagementMenu.tsx`
- [ ] Overview stub
- [ ] Nav rename + `SERVER_ADMIN` visibility
- [ ] Redirects `/web-system` → `/website-management`

**Phase WM-1 — Discord port**

- [ ] Move/repoint Discord pages under `/website-management/discord`
- [ ] Wire to osmium Discord hooks if still on Prisma

**Phase WM-2 — API Keys**

- [ ] `lib/osmium/hooks/api-keys.ts`
- [ ] List / create / detail / revoke UI (one-time secret UX)

**Phase WM-3 — Access, audit, jobs**

- [ ] Access catalog + per-CID editor
- [ ] Audit log page
- [ ] Jobs list/detail (+ Run if kept)
- [ ] Overview backed by jobs + audit

**Phase WM-4 — Email platform**

- [ ] Templates, preview/send, outbox, resubscribe

**Phase WM-5 — Clean removal**

- [ ] Delete `app/web-system/**`, `WebSystemAdminMenu.tsx`
- [ ] Remove WM/`WEB_TEAM` portal gates from nav/layout
- [ ] Update migration plan scratch notes (`SyncTimes` / web-system
      overview) as done when applicable

Each phase should land as its own PR where practical.

---

## 8. Relation to the migration plan

- Migration Phase 2: api-keys had no consuming UI — **this spec defines it**.
- Migration Phase 6 / clean removal: `SyncTimes` removal waits on overview
  reading osmium jobs — **Overview in this portal is that consumer**.
- Auth cutover (osmium session as sole authority) is a **soft prerequisite**
  for a clean `SERVER_ADMIN` gate; interim CID check is acceptable only as
  a documented bridge.

---

## 9. Open questions

- Should **job Run** stay in this portal given its current permission
  (`users.controller_status.update`), or wait for an osmium
  `system.*` split?
- After this portal ships, should `WEB_TEAM` remain assignable in
  RoleForm at all, or become a no-op label?
- Is `POST /api/v1/admin/notifications/announcements` in v1 Discord
  scope or deferred?
- Exact session field for gating (`roles` includes `SERVER_ADMIN` vs.
  dedicated flag from `/me` or ACL) — confirm against the post-cutover
  session shape before coding the layout gate.
