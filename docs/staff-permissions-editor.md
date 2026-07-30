# Staff Permissions Editor

Cross-repo feature spec: Osmium backend fix + website facility-admin UI.
Inspired by Immich’s API-key permissions picker (`ApiKeyPermissionsPicker` /
`UserApiKeyGrid`).

## Problem

Osmium already has fine-grained dotted permissions (`resource.….action`) and
admin APIs for reading the catalog and reading/updating a user’s access:

- `GET /api/v1/admin/access/catalog` — assignable catalog (permission tree)
- `GET /api/v1/admin/users/{cid}/access` — effective permissions + `server_admin`
- `POST /api/v1/admin/users/{cid}/access` — replace direct grants

Two gaps block staff from managing that ACL on the live site:

1. **Website UI** still edits coarse Prisma `Role` / `StaffPosition` enums on
   `/admin/staff/[cid]` (`RoleCard`, `StaffPositionCard`). Those do not map to
   Osmium’s permission tree.
2. **Login wipes grants.** On every non–server-admin login,
   `ensure_user_login_access` in `../osmium/src/handlers/auth.rs` calls
   `replace_user_permissions` with a fixed baseline list. Any admin-granted
   direct permissions would be lost on the next login.

## Goals

- Facility staff can view and edit any user’s Osmium permissions with an
  Immich-style searchable, grouped checkbox picker.
- The editor lives at `/admin/staff/[cid]` and **replaces** both Role and Staff
  Position forms.
- Baseline self-service permissions apply **only on first user insert** (when
  the `identity.users` row is created), then persist across logins—including
  after admin edits.
- `SERVER_ADMIN` remains env-bootstrapped (`OSMIUM_SERVER_ADMIN_CID`) and is
  not assignable or editable through this UI.

## Non-goals

- Role-assignment API / editing `access.user_roles` for humans (catalog
  `service_account_roles` stay out of this UI).
- Replacing website NextAuth `STAFF` layout gating (deferred to migration
  Phase 8 / `/me`-based gating).
- Full users/roster cutover off Prisma (`ProfileCard` and the staff CID picker
  may stay Prisma short-term).
- Named permission presets / templates (follow-up if needed).

---

## Backend (Osmium)

### 1. First-login-only baseline grants

**Today**

`bootstrap_login_user` upserts the user, then every successful login path calls
`ensure_user_login_access`. For any CID that is not the configured server
admin, that function always:

```text
replace_user_permissions(user_id, BASELINE_LIST)
```

**Required change**

1. Detect **insert vs update** when creating/updating the user during login
   (e.g. extend `upsert_login_user` so the SQL `RETURNING` includes whether the
   row was newly inserted — Postgres `xmax = 0` / equivalent — or return a
   boolean from the bootstrap path).
2. Apply the baseline direct grants **only when the user row was newly
   inserted**.
3. On subsequent logins for normal users, **do not** read or write
   `access.user_permissions`.
4. Keep `SERVER_ADMIN` sync on login of `OSMIUM_SERVER_ADMIN_CID` (existing
   `assign_server_admin` singleton behavior is fine to run every login; it is
   idempotent).

**Baseline list** (content unchanged; only the *when* changes):

| Permission |
|---|
| `auth.profile.read` |
| `auth.profile.update` |
| `auth.teamspeak_uids.read` |
| `auth.teamspeak_uids.create` |
| `auth.teamspeak_uids.delete` |
| `auth.sessions.delete` |
| `users.vatusa_refresh.self.request` |
| `users.visit_artcc.request` |
| `users.visitor_applications.self.read` |
| `users.visitor_applications.self.request` |
| `feedback.items_self.read` |
| `feedback.items.create` |
| `events.positions.self.request` |

Suggested shape after the fix:

```text
bootstrap_login_user(...) -> (user_id, was_new_user)
ensure_user_login_access(pool, user_id, cid, was_new_user)
  if cid == SERVER_ADMIN_CID -> assign_server_admin
  else if was_new_user -> replace_user_permissions(BASELINE)
  else -> no-op
```

### 2. Grant access-management permissions to `STAFF`

`access.catalog.read`, `access.users.read`, and `access.users.update` exist in
the permission catalog but are not usefully granted to facility staff after the
hierarchical permission migrations.

Add a migration that grants all three to the **`STAFF` role** in
`access.role_permissions`.

**Bootstrap note:** humans are no longer assigned `USER`/`STAFF` roles on login
by default (direct permissions are the primary human model). Until a
role-assignment API exists:

- Anyone who already holds the `STAFF` role gets these via the role grant.
- Everyone else who should manage permissions needs them as **direct grants**.
- The practical bootstrap path: `SERVER_ADMIN` uses this UI (after the
  first-login fix) to grant `access.catalog.read` + `access.users.read` +
  `access.users.update` to the first facility admins.

### 3. Existing API contract (no new endpoints for v1)

| Method | Path | Permission | Behavior |
|---|---|---|---|
| `GET` | `/api/v1/admin/access/catalog` | `access.catalog.read` | Full permission tree (+ service-account role names; UI ignores roles) |
| `GET` | `/api/v1/admin/users/{cid}/access` | `access.users.read` | Effective permission tree + `server_admin` |
| `POST` | `/api/v1/admin/users/{cid}/access` | `access.users.update` | Replace **direct** `user_permissions` from nested tree; audit `USER_ACCESS` |
| `GET` | `/api/v1/admin/acl` | `access.self.read` | Optional debug for the acting staffer’s effective ACL |

**Wire format** (nested tree, `snake_case` actions as leaf arrays):

```json
{
  "permissions": {
    "auth": {
      "profile": ["read", "update"]
    },
    "training": {
      "lessons": ["read", "update"]
    }
  }
}
```

**Save semantics**

- `GET` returns **effective** permissions (roles ∪ direct grants − denies;
  `SERVER_ADMIN` ⇒ full catalog).
- `POST` writes **direct** grants only. Saving a tree that was loaded from
  effective permissions materializes those leaves as direct grants (acceptable
  for v1; role rows are untouched).
- `normalize_permission_tree` today rejects an empty tree (`400`). The UI must
  always include the locked baseline leaves so POST is never empty.
- `SERVER_ADMIN` is not assignable via this endpoint; if the target’s
  `server_admin` is true, the UI is read-only.

---

## Frontend (Website)

### Placement

[`app/admin/staff/[cid]/page.tsx`](../app/admin/staff/[cid]/page.tsx):

- Keep `ProfileCard` (Prisma OK until users/roster migration).
- Remove `RoleCard` and `StaffPositionCard`.
- Add a full-width client `UserPermissionsCard` driven by Osmium hooks.

Staff layout / CID picker ([`app/admin/staff/layout.tsx`](../app/admin/staff/layout.tsx))
unchanged. Facility admin shell remains gated by NextAuth `STAFF` until
Phase 8.

### UX (Immich-inspired, Material UI)

Mirror Immich’s picker behavior, implemented with MUI (hard migration
constraint — not Svelte / Immich UI components):

```text
┌─────────────────────────────────────────────────────────┐
│ ProfileCard                                             │
├─────────────────────────────────────────────────────────┤
│ Permissions                                             │
│ [search________________]            [Select all]        │
│ ☑ Baseline (locked) — self-service permissions          │
│ ☐ auth                                                  │
│   ☑ auth.profile.read (locked if baseline)              │
│   ☐ auth.dev_login.create                               │
│ ☐ training                                              │
│   ☐ training.lessons.read                               │
│   …                                                     │
│                                          [Save]         │
└─────────────────────────────────────────────────────────┘
```

**Behavior**

1. Load catalog + current user access in parallel.
2. Flatten catalog leaves to dotted strings (`training.lessons.read`).
3. Group by **top-level segment** (`auth`, `access`, `training`, `web`, …).
4. Search filters group titles and permission strings (case-insensitive).
5. Global “select all” (catalog minus nothing special except keep baseline
   locked checked) + per-group select-all + per-permission checkboxes.
6. If `server_admin === true`: banner (“Server admin — managed via env”) and
   no save control.
7. **Locked baseline group:** every baseline permission is always checked and
   disabled. Always merged into the POST body so an admin cannot lock a user
   out of profile / sessions / self-service flows, and so the empty-tree
   rejection never fires.
8. Save via React Query mutation + `react-toastify` (same pattern as
   broadcasts / feedback).
9. **Dossier entry required (follow-up):** any successful permission change from
   this UI must create a dossier entry on the **modified user’s** log (in
   addition to Osmium’s `USER_ACCESS` audit). The save flow should collect a
   short reason/message before POST; refuse to save without it.

### New code (implementation inventory)

| Area | Location |
|---|---|
| Hooks | `lib/osmium/hooks/access.ts` — `useAccessCatalog`, `useUserAccess(cid)`, `useUpdateUserAccess` |
| Tree helpers | Flatten nested catalog/access trees ↔ `string[]`; group by top segment; merge baseline into save payload |
| Components | `components/Access/UserPermissionsCard.tsx`, `components/Access/PermissionsPicker.tsx` |
| Page | `app/admin/staff/[cid]/page.tsx` — swap cards |

Hook conventions match existing Osmium domains (`queryKey: ["osmium", "access", …]`,
`openapi-fetch` client, snake_case bodies, invalidate on mutation).

Local typing: generated OpenAPI currently types `permissions` as `unknown`;
narrow to a nested tree / flat string helper types in the hook module rather
than waiting on codegen improvements.

### Removal / deprecation

After this ships, `RoleCard` / `StaffPositionCard` /
`RoleForm` / `StaffPositionForm` are unused by `/admin/staff/[cid]`.
Prisma `actions/role.ts` (`saveRoles`, `saveStaffPositions`) becomes unused by
this route. Delete those in Phase 8 cleanup unless something else still
imports them. Web-system Discord role forms are unrelated and stay.

### Dual-login / gating

Until Phase 8:

- Opening `/admin/staff/*` still requires NextAuth session with `STAFF`.
- Osmium calls need the `osmium_session` cookie (Phase 0b bridge). Without it,
  catalog/access requests 401 — surface a clear error (“Log in to Osmium /
  complete the auth bridge”).
- Later: hide or disable the editor unless `/me` (or `/admin/acl`) includes
  `access.users.update`; catalog needs `access.catalog.read`.

---

## Edge cases

| Case | Handling |
|---|---|
| Target is `SERVER_ADMIN` | Read-only UI; no POST |
| Admin clears all non-baseline boxes | Save still sends locked baseline; succeeds |
| Admin grants every catalog permission | `SERVER_ADMIN` may grant the full catalog (materializes as direct grants, not `SERVER_ADMIN`). Non–server-admins may only grant a subset of their own effective permissions (follow-up) |
| User has leftover role-based grants | `GET` shows them in effective tree; `POST` copies selected leaves to direct grants; roles unchanged |
| Existing users before first-login fix | Their current direct grants stop being wiped; no automatic re-baseline |
| Brand-new user after fix | Gets baseline once on insert only |
| Admin saves permission changes (follow-up) | Requires a dossier message; writes a dossier entry on the target user’s log; `USER_ACCESS` audit still recorded |

---

## Verification

### Osmium

- [x] New user first login → baseline rows present in `access.user_permissions`.
- [x] Second login for that user → permission rows unchanged (including after an
      admin POST).
- [x] Admin `POST /admin/users/{cid}/access` → grants persist across a subsequent
      login.
- [x] `OSMIUM_SERVER_ADMIN_CID` login still receives `SERVER_ADMIN`.
- [x] Migration grants `access.catalog.read` / `access.users.read` /
      `access.users.update` to role `STAFF`.
- [x] Caller without `access.users.update` gets 401 on POST; without
      `access.catalog.read` gets 401 on catalog GET.
- [x] (Follow-up) Non–server-admin POST that changes (adds or removes) a
      permission the caller does not hold effectively is rejected with `401`.
      Diff-based against the target's existing *direct* grants, not a
      whole-set subset check like API keys use — permissions the target
      already has from elsewhere (role, another admin's prior grant) are
      left alone as long as the save doesn't actually touch them.
      `SERVER_ADMIN` callers unrestricted. See `tests/admin_user_access.rs`.
- [x] (Follow-up) Successful access update from the staff UI creates a dossier
      entry on the modified user’s log (verified via direct DB query, not just
      the toast/reload).

### Website

- [x] `/admin/staff/[cid]` shows ProfileCard + Permissions picker only (no Role /
      Staff Position cards).
- [x] Search, select-all, per-group select-all, and individual toggles work.
- [x] Baseline permissions are checked and not toggleable.
- [x] Save round-trip: reload shows the same selection (plus any role-derived
      effective leaves still present until roles change).
- [x] Server-admin target is read-only.
- [x] Missing Osmium session surfaces a usable error, not a blank form.
- [x] (Follow-up) Permissions the actor does not hold render disabled with a
      "not yours to grant" chip; select-all/group-select-all only touch
      assignable + baseline leaves.
- [x] (Follow-up) Save requires a dossier reason field (native + JS
      validation); after save, the target user’s dossier shows the new entry.

---

## Implementation order

1. Osmium: first-login-only baseline + regression tests.
2. Osmium: migration granting `access.*` management perms to `STAFF`.
3. Website: access hooks + tree helpers + `PermissionsPicker` /
   `UserPermissionsCard`.
4. Website: swap `/admin/staff/[cid]` cards.
5. Manual QA with dual NextAuth + Osmium session.

---

## Follow-ups (done)

- [x] Restrict the permissions tree so an actor can only assign permissions they
      already hold effectively. If they lack a permission, it must not be
      assignable in the tree (disabled or hidden), and
      `POST /api/v1/admin/users/{cid}/access` must reject grants outside that
      subset (same idea as API keys’ `validate_permissions_are_subset`).
      `SERVER_ADMIN` remains unrestricted.

  **Implementation note**: not a literal port of the API-key subset check.
  API keys replace a key's *entire* permission set in one shot with no
  prior history, so "whole submitted set ⊆ creator's permissions" is the
  right rule there. A human target's permissions can legitimately include
  things the editing actor doesn't hold (role membership, a previous
  admin's grant), so the same whole-set rule would block an actor from
  saving *any* change whenever the target had anything outside the actor's
  reach — including permissions the actor never touched. Implemented
  instead as a diff: `added = requested - existing_direct`,
  `removed = existing_direct - requested`; reject only if
  `(added ∪ removed)` isn't a subset of the actor's own effective
  permissions. New repo fn `fetch_user_direct_permission_names` reads raw
  `access.user_permissions` rows (the effective view merges in role
  grants, which would make everything look "already there"). The frontend
  complements this by never resubmitting a permission outside the actor's
  own set in the first place (see `UserPermissionsCard.tsx`), so an actor
  can save changes within their own sphere even when the target holds
  unrelated permissions the actor lacks.
- [x] Any modification of permissions from this UI must create a dossier entry
      on the **modified user’s** log. Collect a required reason/message in the
      save flow; do not allow save without it. Keep the existing `USER_ACCESS`
      audit as well.

  **Implementation note**: `UpdateUserAccessRequest` gained a required
  `reason` field. The dossier write happens inside the same DB transaction
  as `replace_user_permissions` (new `record_access_dossier_entry`,
  `admin.rs`) — a plain `INSERT` into `feedback.dossier_entries`, not
  gated behind `training.dossier.create` separately, mirroring how
  submitting a training session auto-logs roster-change dossier entries
  without requiring the submitter to hold dossier-write permission on
  top of `training.sessions.create`.

---

## Related docs

- Migration plan Phase 6 — [osmium-migration-plan.md](./osmium-migration-plan.md)
- Osmium route ↔ permission map — `../osmium/docs/route-permissions.md`
- Osmium auth architecture — `../osmium/docs/architecture/auth-and-access.md`
- Osmium admin API — `../osmium/docs/api/admin.md` (payload notes partially stale;
  prefer this spec + handler code for access update shape)
