# AGENTS.md - Invoice GL Tax Distribution

> NOTE:
> This is the repo-specific agent file for the invoice GL tax distribution app.
> It uses the Castlebound workflow style as a loose baseline, adapted for a small
> static HTML/CSS/JavaScript project.

---

## Project Purpose

This app supports invoice coding review by grouping invoice line items by GL code,
calculating invoice subtotal and tax, and distributing tax across GL groups based
on each GL group's share of the subtotal.

The project is intended to demonstrate practical frontend development skill,
accounts payable process understanding, and thoughtful process-improvement design.

---

## Hard Boundaries

- Do not add private employer data.
- Do not add real vendor names, real invoice numbers, real GL lists, real invoice
  amounts, or confidential workplace details.
- Use fake/demo invoice data only unless the user explicitly says otherwise.
- Do not invent business impact, usage, adoption, savings, error reduction, or
  employer approval.
- Resume/project wording must stay modest and truthful.
- Avoid inflated language such as "enterprise," "production-grade,"
  "revolutionized," or "automated end-to-end."

Acceptable wording includes "built," "designed," "created," "supports,"
"helps standardize," and "demonstrates."

---

## Project Conventions

- Keep the app simple and browser-friendly.
- Prefer plain HTML, CSS, and JavaScript unless the user approves a larger stack
  change.
- Keep changes small, scoped, and reviewable.
- Do not combine unrelated feature, styling, storage, and documentation changes in
  one PR.
- Use browser-local storage only for local demo/personal workflow features:
  - `localStorage` for preferences and shortcuts.
  - IndexedDB for saved coded invoices.
- Add import/export as a safety net before relying on browser storage for
  important invoice records.
- Make limitations clear in docs and UI when relevant.

---

## Two-Mode Workflow

### Discussion Mode (Default)

Before any code or documentation edits, provide a Design Snapshot:

1. Goal
2. Files expected to change
3. Behavior or documentation contract
4. Validation plan
5. Risks and scope limits

Then stop and wait for:

```text
LOCKED: Yes
```

or:

```text
Approved
```

No edits before approval unless the user explicitly asks for a direct change.

### Implementation Mode

After approval:

- Work on exactly one logical PR-sized change.
- Keep changes reversible and independently reviewable.
- Preserve existing behavior unless the approved scope says otherwise.
- Run the most relevant validation available.
- End with what changed, how it was checked, and what remains.

---

## Planned PR Roadmap

Use small branches and PRs. Current intended roadmap:

1. `docs/project-readme-refresh`
   - Refresh README with purpose, workflow, technology, limitations, and demo notes.

2. `refactor/html-css-baseline-cleanup`
   - Fix HTML structure, labels, layout rough edges, and obvious unfinished UI.

3. `fix/invoice-validation-and-rounding`
   - Improve invoice validation and tax rounding so GL totals tie to invoice total.

4. `feature/demo-invoice`
   - Add fake demo invoice data and a clear invoice reset flow.

5. `feature/toolbar-panels`
   - Turn Profile, Settings, and Shortcuts into functioning toolbar panels.

6. `feature/storage-capability-check`
   - Detect browser support for preferences, saved invoices, and file export.

7. `feature/profile-preferences`
   - Save accent color, layout density, and similar preferences in `localStorage`.

8. `feature/invoice-settings`
   - Add saved behavior settings such as light/dark mode and tax distribution on/off.

9. `feature/gl-shortcuts`
   - Add browser-saved GL shortcut mappings for faster invoice coding.

10. `feature/invoice-summary-copy`
    - Add a clean coded invoice summary and copy-to-clipboard action.

11. `feature/indexeddb-invoice-storage`
    - Save, load, and delete coded invoices using IndexedDB.

12. `feature/invoice-export-import`
    - Export/import coded invoices as local files for backup and portability.

13. `test/manual-demo-checklist`
    - Add a manual validation checklist for core workflows and edge cases.

14. `docs/resume-project-summary`
    - Add honest project summary and draft resume bullet options.

---

## Branch And Commit Style

Use Conventional Commit naming where practical.

Branch examples:

```text
docs/project-readme-refresh
fix/invoice-validation-and-rounding
feature/gl-shortcuts
```

Commit examples:

```text
docs(project): refresh README for invoice coding app
fix(calculation): distribute rounding adjustment across GL totals
feat(shortcuts): add browser-saved GL code shortcuts
```

Do not include AI attribution, generated-by lines, or co-author lines.

---

## PR Close-Out (Trigger: "READY TO CLOSE")

When the user says:

```text
READY TO CLOSE: <summary>
```

Output, in order:

1. Branch name
2. Suggested commit message
3. Git push command
4. PR body
5. Suggested labels
6. Squash merge message
7. Cleanup checklist

Use this PR body format:

```md
# Title
type(scope): short summary

## Why
One or two sentences describing the goal or problem.

## What changed
- Key change
- Key change
- Key change

## How to test
1. Step one
2. Step two
3. Note any automated or manual validation

## Checklist
- [x] Scope is limited to this PR's stated purpose
- [x] No private employer/vendor/invoice data added
- [x] README/docs updated if applicable
- [x] Manual validation completed or marked N/A with reason

## Related
- Refs/Closes: N/A
```

---

## Context Threshold Protocol

When the session is running long, warn early:

```text
CONTEXT WARNING
This session is approaching its reliable limit.
Consider starting a new chat soon.
Type HANDOFF when ready for a clean transition block.
```

---

## HANDOFF Task (Trigger: "HANDOFF")

When the user types `HANDOFF`, immediately output this block with no preamble:

```md
## HANDOFF BLOCK

**Date:** <YYYY-MM-DD>
**Branch:** <current branch>
**Active PR/Issue:** <PR/issue or N/A>
**Roadmap step:** <current roadmap item>

**Last completed step:**
<specific completed work>

**Next step:**
<specific next action>

**Assumptions made this session:**
- <assumption or N/A>

**Relevant files touched:**
- <file path> - <what changed>

**Validation status:**
- <manual/automated checks run or not run>

**Paste into new chat:**
Attach AGENTS.md and this block. Say: "Continuing from handoff."
```

---

## Task Refresh (Trigger: "task refresh")

When the user types `task refresh`, output:

- `HANDOFF` - structured transition block for switching sessions
- `READY TO CLOSE: <summary>` - PR close-out output
- `task refresh` - this list

---

## Core Philosophy

- Structure before code.
- Small PRs over giant merges.
- Practical AP workflow clarity over flashy features.
- Browser-friendly storage with clear limitations.
- Honest resume framing only.
