# Reconciliation Fixes — Design Spec

**Goal:** Fix all 15 definitively wrong and likely wrong items identified in
`docs/reconciliation-matrix.md`, working file-by-file from canonical sources
outward. Every change must be consistent with the researched platform docs in
`docs/platforms/*.md`.

**Follow-up:** A separate task covers systematic verification of every remaining
"Needs review" cell in the matrix (all tool name mappings, manifest schemas,
install docs, rubric conditions, templates). Not in scope here.

---

## Files Changed (in order)

| Order | File | Items Fixed |
|-------|------|-------------|
| 1 | `lib/references/platform-mappings.md` | Tables 2, 3, 7, 13 (7 items) |
| 2 | `lib/references/gemini-tools.md` | Subagent claim, tool name verification (2 items) |
| 3 | `lib/references/codex-tools.md` | Edit/WebFetch mappings (2 items) |
| 4 | `lib/rubrics/codex.yaml` | hooks_path, hook conditions (1 item) |
| 5 | `lib/patterns/hook-merging.md` | Codex hook generation, Gemini hooks location (2 items) |
| 6 | `lib/templates/hooks/` | Codex hook template evaluation (1 item) |
| 7 | `docs/reconciliation-matrix.md` | Status updates for all fixed items |

---

## 1. platform-mappings.md

### Table 2: Tool Name Mapping

- Codex / Edit: `Edit` → `apply_patch`
- Codex / WebFetch: `WebFetch` → `(N/A — use MCP)`

### Table 3: Hook Event Mapping

Replace all Codex `N/A` entries with actual event names. Codex has a full hook
system behind a feature flag (`codex_hooks = true` in config.toml). Events use
PascalCase, same as Claude Code.

| Claude Event | Codex (new value) |
|---|---|
| SessionStart | `SessionStart` |
| PreToolUse | `PreToolUse` |
| PostToolUse | `PostToolUse` |
| UserPromptSubmit | `UserPromptSubmit` |
| Stop | `Stop` |

Add new row for `PermissionRequest` (Codex-only event, no Claude Code equivalent).

Add missing Gemini events to existing rows or new rows:

| Event | Gemini (add) |
|---|---|
| BeforeModel | `BeforeModel` (new row) |
| AfterModel | `AfterModel` (new row) |
| BeforeToolSelection | `BeforeToolSelection` (new row) |
| Notification | `Notification` (new row) |

Update Table 3 notes:
- Remove "Codex has no hook system"
- Add "Codex hooks require `codex_hooks = true` feature flag in config.toml"
- Add note about Codex PermissionRequest having no Claude equivalent

### Table 7: Hook Format Rules

Add Codex row:

| Rule | Codex |
|---|---|
| Event name case | PascalCase |
| Timeout unit | seconds |
| Async support | Needs verification from research |
| Structure | nested (same as Claude Code) |
| Output key | Verify from research |

Fix Gemini hooks location: "settings.json or extension manifest `hooks` field"
(not settings.json only).

### Table 13: MCP Configuration

- Codex: `(N/A)` → `.mcp.json` and `config.toml [mcp]` section
- Gemini: Verify from research doc — update if MCP is supported via extensions

---

## 2. gemini-tools.md

Remove the "No subagent support" section entirely. Replace with:

- Subagent dispatch documentation
- Built-in agents: `generalist`, `cli_help`, `codebase_investigator`
- Custom agents: Markdown files in `agents/` with YAML frontmatter
- Map Claude Code's `Task`/`Agent` tool to Gemini's `dispatch_agent` or
  `@agent-name` syntax (verify exact mechanism from research doc)

Verify all tool names against the `tool-names.ts` source cited in the Gemini
platform research doc. Fix any discrepancies found.

---

## 3. codex-tools.md

- Change Edit mapping from `Edit` to `apply_patch` in the tool table
- Change WebFetch from `WebFetch` to "No direct equivalent — use MCP for URL
  fetching" in the tool table
- Add a "Hooks" section noting that Codex has a hook system behind a feature
  flag, with the same event names as Claude Code

---

## 4. codex.yaml

- Change `hooks_path: null` to the actual hooks path (verify from research —
  likely `hooks.json` next to config layers)
- Add hook portability conditions under `4_hooks` category:
  - Hook config file exists (or inline TOML in config.toml)
  - Event names match Codex conventions (PascalCase)
  - Feature flag documented in install docs

The conditions should follow the same pattern as the existing cursor.yaml hook
conditions for consistency.

---

## 5. hook-merging.md

### Add: Generate Codex Hooks from Claude Hooks

New section after "Generate Cursor Hooks from Claude Hooks". Since Codex uses
the same JSON protocol and PascalCase event names as Claude Code, the merge
logic is simpler than Cursor's:

- Copy hooks.json structure (same format)
- Event names are identical (no remapping needed)
- Add feature flag note to install docs
- Handle PermissionRequest (Codex-only, skip if source is Claude)

### Fix: Gemini Hook Guidance

Update the existing Gemini section to note that hooks can also be declared in
the extension manifest (`hooks` field in `gemini-extension.json`), not only in
user `settings.json`. The uplift skill should generate both: manifest hooks for
extension distribution, and settings.json guidance for standalone use.

---

## 6. hooks templates

Evaluate whether a separate `hooks-codex.json.tmpl` is needed. Since Codex uses
the same JSON protocol as Claude Code, the existing `hooks.json.tmpl` may serve
both platforms. If the only difference is the feature flag requirement, document
that in hook-merging.md and install docs rather than creating a separate template.

Decision: make during implementation based on schema comparison.

---

## 7. reconciliation-matrix.md

After all fixes are applied, update every fixed item's status from
`Wrong`/`Missing` to `Fixed` in the matrix tables.

---

## Exclusions

- No changes to the per-skill sidecar pointer files (tracked in issues #11/#12)
- No changes to manifest templates (schemas are a "Needs review" item for the
  systematic follow-up)
- No changes to install doc templates (systematic follow-up)
- No changes to SKILL.md pseudocode (no platform-specific errors found there)

---

## Follow-Up Task

Systematic verification of every "Needs review" cell in the reconciliation
matrix. This covers:

- All remaining tool name mappings (Table 2) against source code refs
- All manifest template schemas against researched schemas
- All install doc commands against researched install methods
- All rubric conditions against researched platform capabilities
- All context file templates against researched context file formats

To be tracked as a separate GitHub issue after this fix batch lands.
