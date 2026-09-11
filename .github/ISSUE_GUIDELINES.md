# Issue Guidelines

How work is tracked on `vzdc-artcc/website`. Binding on developers and on AI
agents alike. The GitHub issue forms in `.github/ISSUE_TEMPLATE/` exist so a
controller who has never opened a terminal can file something that already
conforms to this; if you are filing through a form, it has done most of this for
you.

**Repo:** `vzdc-artcc/website` · **Issue reference:** `#123`
**Board:** `Osmium / Website`, project **#7**, owner `vzdc-artcc`

The board is shared with `vzdc-artcc/osmium`. Its `Repository` field is what
separates the two, so always say which repo you mean when an issue number could
be either.

**Which repo does this belong in?** The website renders; osmium decides. If the
wrong data comes back from the API, if a permission is wrong, or if a record
saves incorrectly, that is an osmium issue. If the right data is rendered wrong,
laid out wrong, or not rendered at all, it is a website issue. When you cannot
tell, file it here and say so — moving an issue between repos is one click.

---

## 1. No AI attribution, anywhere

Nothing an agent writes carries an AI marker. Not in a commit, not in a PR, not
in an issue, not in an issue comment. No `Co-Authored-By:` trailer naming an
assistant, no session-link trailer, no "Drafted by" footer, no 🤖 badge.

Comments post as the account owner and read as written by them. Two things
follow:

- **Never refer to the account owner in the third person.** "Agreed with Carson
  to use the existing hook" reads as the author talking about themselves. Say
  "you", or name the actual other person.
- **Never expose agent tooling or agent limitations.** "I could not fetch that",
  "my context did not include" — none of it means anything to a reader. State
  the fact plainly or leave it out.

---

## 2. The issue itself

### Title

A sentence describing the defect or the outcome. Not a page name, not a noun
phrase, not a label.

| Bad | Good |
| --- | --- |
| `Training calendar` | `Training calendar shows sessions in UTC for users set to Eastern` |
| `Roster page` | `Roster page renders an empty table while /me is still loading` |
| `Fix API keys` | `Revoking an API key leaves the row in the table until a hard refresh` |

Someone scanning fifty rows must be able to tell what each one is without
opening it.

### Body

Four things, always, in this order. Everything else is optional.

1. **What happens** — the observed behavior, stated concretely.
2. **What should happen** — the expected behavior. Do not make the reader infer
   it from the complaint.
3. **How to reproduce** — numbered steps a stranger can follow, naming the real
   page path and the real control you clicked.
4. **Where you saw it** — environment, browser, and the account you were signed
   in as.

A feature request substitutes "what should happen" with the outcome wanted and
"how to reproduce" with the situation that makes it necessary.

### Grounding rules for the reproduction

- **Give a page path, never a full URL.** `/training/sessions/42`, not
  `https://www.vzdc.org/training/...`. Paths come from the `app/` route tree.
- **Name the control, using the label on screen.** "The Save button on the
  Certifications card", not "the save thing".
- **Say who you were signed in as.** Almost every staff surface here is gated on
  an explicit permission, so a report that does not say what the account could
  do is not reproducible. "Signed out", "a normal controller", "a mentor",
  "someone with facility admin" are four different tests.
- **A screenshot is worth having, and is not a substitute for the steps.**
  Attach one for anything visual, but still write the steps — a screenshot
  cannot be searched, and it cannot tell us what you clicked to get there.
- **Check the browser console.** A blank section or a stuck spinner usually
  leaves an error there. Paste it.

### Markup

GitHub markdown, deliberately plain. Backticks for code, paths, and identifiers.
Fenced blocks with a language tag. `-` bullets. Numbered steps. Tables where a
table genuinely helps.

Avoid raw HTML, `<details>` folds (they hide the thing you meant someone to
read), headings inside a short comment, and screenshots of text that could have
been pasted as text. Write `#123` and `abc1234` bare — GitHub auto-links both,
so a pasted URL is just noise.

---

## 3. Referring to an issue: number, summary, status

**Every mention carries all three: `#123 [short summary] (Status)`.**

```text
#88 [training calendar shows UTC for Eastern users] (In build)
#91 [roster renders empty while /me loads] (Triaging)
#77 [publications page 404s on a draft] (Code Review)
```

A bare `#88` makes the reader open a tab to find out what it is, and a list of
bare numbers is unreadable. Shorten the title to whatever identifies it.

`Status` is the board column verbatim — `Blocked`, `Triaging`, `To Do`,
`Returned`, `In build`, `Post build`, `Testing Queue`, `In Test`, `Code Review`,
`Shippable`, `Done`. Not a paraphrase, and not the GitHub open/closed state,
which is a different thing. Take it from the board you just queried rather than
from memory; issues move between reading the board and writing about it.

This applies everywhere an issue is named: chat, reports, PR descriptions,
commit bodies, and issue comments.

---

## 4. Comments: the budget

An issue is read by whoever picks the work up next year. It is not a development
log. An issue whose thread is longer than its description is one nobody
re-reads.

**Four comments per issue per round of work, maximum. One per purpose.**

| Purpose | When | Budget |
| --- | --- | --- |
| Plan | the plan is approved | 600 characters |
| Spec correction | the issue states something false | 400 characters |
| Verification notes | the work is ready to check | 1,200 characters |
| Failure response | verification failed and you fixed it | 1,200 characters |

Count before you post. If you are over, the fix is never to compress prose into
denser prose. It is to move material into the PR.

### What goes in the PR instead

The issue answers "what changed and how do I check it". The PR answers "how was
it built". When a comment runs long, almost everything you want to keep belongs
on the other side of that line: implementation reasoning, alternatives
considered, why a review suggestion was not taken, anything about getting code
to `next`, notes addressed to a reviewer rather than to whoever verifies the
behavior, and incidental tidy-ups.

Link the PR once. GitHub cross-links it both ways already.

### Comments that must not be posted at all

There is no status-update comment. If a comment would not change what gets
verified or what the next engineer needs to know, it does not get posted. Never:

- tooling narration — "the build is clean now", "eslint passes";
- build or lint results in any form;
- rebase, branch, worktree, or merge-conflict reports;
- progress without outcome — "starting the second half now";
- anything you would describe as being for the record rather than for a reader.

A genuine blocker is the exception, and it is a real comment with a real ask:
what is blocked, what you need, what you tried. **"Blocked on an osmium change"
is the most common one here** — say which endpoint or field you need and link
the osmium issue.

### Tone

Write as an engineer, in the first person, reporting outcomes.

> **Good.** The calendar now renders in the timezone from your profile instead of
> UTC. To check: set your timezone to Eastern on `/profile/edit`, then open
> `/training/calendar` — a 1800Z session should show as 1400.

> **Bad.** **[Implementation Complete]** — Timezone handling has been implemented
> as per requirements. Awaiting sign-off.

No formal register, no reference to internal workflow ("awaiting approval", "as
instructed"), no passive voice hiding who did what.

---

## 5. Verification notes

The comment that says the work is ready. Template:

```text
Done — <one sentence on what changed>. PR: #<n>

How to check:
1. <step naming a real page path, the account you need, and a real control>
2. <step>
3. <step>

Edge cases: <at most three, each one the branch actually handles>
Deploy: <env vars / osmium dependency, or "nothing">
```

**Every line must be grounded in code that shipped on this branch.** Page paths
come from the `app/` route tree. Control labels must be strings that actually
appear in a component in the diff. Described behavior must trace to a function
in the diff. If a line cannot be validated against the diff, delete it — a short
set of fully grounded notes is worth far more than a long set sprinkled with
plausible inaccuracies.

**Name the account.** "As a controller with no staff permissions" and "as
someone with facility admin" produce different pages here, so a check that does
not say which is not reproducible.

**Say what state you need.** Loading, empty, error, and no-permission are the
four that break most often and the four nobody thinks to check. If the change
touches any of them, put it in the steps.

**The deploy line is not optional.** In this repo that usually means: a new
`NEXT_PUBLIC_*` variable, a new image host in `next.config.ts`, a regenerated
`lib/osmium/generated/schema.d.ts`, or an osmium version this depends on. Say
which, or say "nothing".

---

## 6. The board

`Osmium / Website` — project **#7**, owner `vzdc-artcc`. Eleven columns, left to
right. Use these names verbatim; do not invent shorter ones.

| Column | Means | Who moves it |
| --- | --- | --- |
| `Blocked` | cannot continue, or sequencing blocked | you — and say why, with a real ask |
| `Triaging` | filed, not yet triaged | **you, when you file it** |
| `To Do` | scoped and cleared to start | the maintainer |
| `Returned` | kicked back for rework | the maintainer |
| `In build` | actively being implemented | **you, when you start** |
| `Post build` | built and self-reviewed, pending verification | **you, when you hand back** |
| `Testing Queue` | selected for human testing | the maintainer |
| `In Test` | under test | the maintainer |
| `Code Review` | final approval before shipping | the maintainer |
| `Shippable` | approved and ready to ship | the maintainer |
| `Done` | merged and deployed | when the PR merges |

An agent sets three of these and only three: `Triaging` on anything it files,
`In build` when it starts, and `Post build` when it hands back. Every transition
out of `Triaging` is the maintainer's, and so are `Testing Queue`, `In Test`,
`Code Review`, `Returned`, `Shippable`, and `Done`.

`Blocked` is yours to set, but only alongside a comment naming what would
unblock it. Moving an item to `Blocked` silently says nothing.

Priority is **not** a board field. It lives on the label, so it shows up in
`gh issue list` and on the issue itself rather than only to whoever opens the
board.

### Ids, for `gh project item-edit`

```text
project id       PVT_kwDOCLQ6cs4BjL9-
Status field id  PVTSSF_lADOCLQ6cs4BjL9-zhiBRW0
```

List the current option ids — do not memorize them, and do not assume a column
kept its id through a rename:

```bash
gh project field-list 7 --owner vzdc-artcc --format json --limit 30 \
  | python3 -c "import sys,json;[print(o['id'],o['name']) for f in json.load(sys.stdin)['fields'] if f['name']=='Status' for o in f['options']]"
```

Find an item id, then set its status:

```bash
gh project item-list 7 --owner vzdc-artcc --format json --limit 300 \
  | python3 -c "import sys,json;print([i['id'] for i in json.load(sys.stdin)['items'] if (i.get('content') or {}).get('number')==123][0])"

gh project item-edit --project-id PVT_kwDOCLQ6cs4BjL9- --id <item-id> \
  --field-id PVTSSF_lADOCLQ6cs4BjL9-zhiBRW0 --single-select-option-id <option-id>
```

Two things that make that lookup lie. `--limit` defaults low, so always pass it
and sanity-check the count against the board. And because the board carries
issues from two repos, an issue number alone is ambiguous — filter on the
repository too when a number could exist in both.

### Changing the column set

`updateProjectV2Field` replaces the whole `singleSelectOptions` list rather than
appending to it, and **list order is column order**. An entry carrying an
existing option id renames that option in place and keeps every item assigned to
it. An entry with no id creates a new column. An entry you omit is deleted,
taking its items' status with it.

So: send the complete list every time, with the id on every option you mean to
keep. Back the board up first and diff item id to status afterwards. A dropped
id is indistinguishable from a rename until you look at the items. Remember the
board is shared — a column change here also changes osmium's workflow.

---

## 7. Filing an issue is two steps

`gh issue create` does **not** put the issue on the board, and an issue that is
not on the board does not exist as work. Nobody triages it and it surfaces only
to whoever thinks to run `gh issue list`.

```bash
gh issue create --repo vzdc-artcc/website --title "..." --body-file <file> \
  --label "type:bug" --label "area:training"

gh project item-add 7 --owner vzdc-artcc \
  --url https://github.com/vzdc-artcc/website/issues/<n>
```

**Then set its Status to `Triaging`.** `item-add` leaves Status empty, and an
item with no Status sits in no column at all — worse than not being on the
board, because it looks filed while being invisible on the thing people read.

**Verify, do not assume.** Both `item-add` and `item-edit` print nothing on
success, so neither command's silence is evidence. Re-run the item lookup and
read the status back before reporting the issue as filed.

**An empty read straight after `item-add` is lag, not failure.** The item is not
queryable the instant the command returns, so chaining the add into a lookup in
one shell invocation routinely finds nothing. Re-run the lookup as a separate
call before concluding anything, and **never re-run `item-add` to "fix" it** —
the add already landed, and a second one puts the issue on the board twice.

`Triaging` is where an agent's involvement ends. Accepting it, prioritizing it,
and moving it to `To Do` are the maintainer's calls.

---

## 8. Labels

Labels are the canonical classification. The board's `Status` field is the
canonical workflow state. Do not mirror status in labels or the two will drift.

| Prefix | Meaning | Set by |
| --- | --- | --- |
| `type:` | bug / feature / chore / documentation | whoever files |
| `area:` | which part of the site | whoever files |
| `priority:` | critical / high / medium / low / trivial | **the maintainer, never an agent** |
| `technical-debt` | qualifying pre-existing follow-ups | agent, per the four tests below |
| `blocked-by-osmium` | needs an API change before it can be built | either |

The canonical list lives in `.github/labels.yml` and is synced by
`.github/workflows/labels.yml`. Add a label there, not through the GitHub UI, or
the next sync run will not know about it.

`bug`, `enhancement`, `roadmap`, `in progress`, `completed`, and the other
GitHub defaults are **legacy**. They are still on 32 closed issues and are kept
for that reason. Do not apply them to anything new.

### Never set the priority yourself

If you are an agent, the severity you would assign is your opening assumption,
not your decision. Put the options to the maintainer and let them pick.

| Review severity | Default label |
| --- | --- |
| CRITICAL | `priority:critical` |
| MAJOR | `priority:high` |
| MODERATE | `priority:medium` |
| MINOR | `priority:low` |
| NITPICK | `priority:trivial` |

---

## 9. Scope, and when a follow-up is allowed

Work within the logical scope of the issue — the scope a sensible engineer would
read into it, not the letter of its wording, and not beyond it.

**A defect you introduced is yours to fix, now, on this branch.** Never defer it
and never file it, whatever its grade and however tangential it feels. Settle
authorship with the diff, not from memory: if the line appears in
`git diff origin/next...HEAD` as an addition, you wrote it.

**File a follow-up only when all four are true:**

1. It is a **defect** — broken behavior. Not a refactor, a component you would
   like to extract, a doc correction, or a tidier abstraction.
2. It is **pre-existing** on `origin/next`.
3. It is **outside the logical scope** of the issue you are on.
4. It is **not already filed** — in this repo *or* in osmium.

Fail any one and there is no issue. A defect in scope gets fixed here; a
non-defect gets left alone and named in your report. Qualifying issues carry
`technical-debt` and reference the parent (`Relates to #123` in the body).

**Test 3 has a tell you will otherwise talk yourself past: does it block *this*
branch?** A defect standing between your work and a merge is not outside the
logical scope, however unrelated its subject looks. It is the work — the issue
you are on cannot be delivered without it. Ask the concrete question rather than
the abstract one: if this stays open, can the branch ship?

**Never open an issue for work you are about to do in this session.** The issue
exists to survive the session. Work that will not survive it does not need one.

### Test 4: searching for duplicates

The first three tests interrogate the finding. None asks whether somebody raised
it before, so you can pass the gate cleanly and still file a duplicate.

**Search the entity, not your phrasing.** Two descriptions of one defect rarely
share a verb. Search the component, hook, route, or query key — `useTrainingSessions`,
`RequirePermission`, `app/training/calendar` — never the wording of your finding.

**Search both repos.** A rendering complaint here is often already filed in
osmium as a wrong-response-shape defect, and the reverse happens just as often.

**Apply no state filter.** `--state all`. A closed duplicate is the strongest
signal there is: a human already judged this work, and re-filing walks back into
a decision that was already made.

```bash
gh issue list --repo vzdc-artcc/website --state all --search "useTrainingSessions" --limit 30
gh issue list --repo vzdc-artcc/osmium  --state all --search "training calendar timezone" --limit 30
```

Then scan the neighbours — same-incident issues cluster in creation time and so
in number.

**When you find one, do not drop your finding.** The later observation is often
the better-evidenced one. Comment on the existing issue with whatever yours
establishes that it does not, and report it in one line instead of filing. Do not
reopen, re-label, or reassign it; it is not yours.

**Same page is not the same defect.** The test is same defect or same requested
outcome, not same neighbourhood. If you cannot name the single change that would
close both, they are not duplicates.

---

## 10. Reading an issue before you work it

Never work from the title and body alone.

1. **Body** — every requirement, acceptance criterion, and scope boundary.
2. **All comments** — `gh issue view <n> --comments`. Comments routinely carry
   the real requirements: scope changes, design decisions, clarifications that
   override the body.
3. **Synthesise** a consolidated requirements list merging body and comments.
   Where a comment contradicts the body, the later comment wins.
4. **Linked issues and PRs** — `gh issue view <n> --json ...` shows
   cross-references. Follow them, and follow any osmium issue they name.

**The full comment thread is the spec.** Reviewing code against the body alone
misses every clarification that happened after the issue was written.

**Screenshots are often the real spec here.** Where the detail lives in a pasted
image, `gh` gives you a URL and not the bytes, and an authenticated
`user-images.githubusercontent.com` URL will not fetch. Do not burn attempts on
it — ask for the image to be pasted into the chat.

### Other rules

- Never close an issue you did not complete. Never bulk-transition.
- If the acceptance criteria do not match the implementation, flag the
  discrepancy before marking anything done.
- If the fix belongs in osmium, say so on this issue and open the osmium one
  rather than building a workaround in a component.
