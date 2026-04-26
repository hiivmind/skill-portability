# Reconciliation Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all 15 definitively wrong and likely wrong platform claims identified in the reconciliation matrix.

**Architecture:** Work file-by-file from canonical sources outward. Fix platform-mappings.md first (consumed by everything else), then tool references, rubrics, patterns, templates, and finally update the matrix. Every change cross-referenced against `docs/platforms/*.md` research docs.

**Tech Stack:** Markdown, YAML, pseudocode. No runtime code.

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `lib/references/platform-mappings.md` | Canonical lookup tables (Tables 2, 3, 7, 13) |
| Modify | `lib/references/gemini-tools.md` | Gemini tool mapping and subagent docs |
| Modify | `lib/references/codex-tools.md` | Codex tool mapping and hooks note |
| Modify | `lib/rubrics/codex.yaml` | Codex hook portability conditions |
| Modify | `lib/patterns/hook-merging.md` | Codex hook generation, Gemini hooks location |
| Modify | `lib/templates/install-docs/codex.md` | Codex hooks feature flag |
| Modify | `lib/patterns/manifest-generation.md` | Gemini manifest optional fields |
| Modify | `docs/reconciliation-matrix.md` | Status updates for all fixed items |

---

### Task 1: Fix platform-mappings.md Tables 2 and 3

**Files:**
- Modify: `lib/references/platform-mappings.md:30-77`

- [ ] **Step 1: Fix Table 2 — Codex Edit and WebFetch**

In `lib/references/platform-mappings.md`, find Table 2 and change:

```markdown
| Edit | replace | Edit | Edit | Edit | Edit |
```

to:

```markdown
| Edit | replace | apply_patch | Edit | Edit | Edit |
```

And change:

```markdown
| WebFetch | web_fetch | WebFetch | WebFetch | WebFetch | WebFetch |
```

to:

```markdown
| WebFetch | web_fetch | (N/A — use MCP) | WebFetch | WebFetch | WebFetch |
```

- [ ] **Step 2: Fix Table 3 — Replace all Codex N/A with actual events**

Replace the entire Table 3 with this updated version. Changes: all Codex columns filled, 4 new Gemini-only rows, 1 new Codex-only row.

```markdown
## Table 3: Hook Event Mapping

| Claude Event | Cursor | Gemini | Codex | Antigravity | OpenClaw |
|---|---|---|---|---|---|
| SessionStart | sessionStart | SessionStart | SessionStart | N/A | gateway:startup (plugin SDK) |
| PreToolUse | preToolUse | BeforeTool | PreToolUse | N/A | before_tool_call (plugin SDK) |
| PostToolUse | postToolUse | AfterTool | PostToolUse | N/A | tool_result_persist (plugin SDK) |
| PostToolUseFailure | postToolUseFailure | (N/A) | (N/A) | N/A | N/A |
| SubagentStart | subagentStart | (N/A) | (N/A) | N/A | N/A |
| SubagentStop | subagentStop | (N/A) | (N/A) | N/A | N/A |
| PreCompact | preCompact | PreCompress | (N/A) | N/A | session:compact:before (plugin SDK) |
| Stop | stop | AfterAgent | Stop | N/A | N/A |
| UserPromptSubmit | beforeSubmitPrompt | (N/A) | UserPromptSubmit | N/A | N/A |
| (N/A) | (N/A) | BeforeModel | (N/A) | N/A | N/A |
| (N/A) | (N/A) | AfterModel | (N/A) | N/A | N/A |
| (N/A) | (N/A) | BeforeToolSelection | (N/A) | N/A | N/A |
| (N/A) | (N/A) | Notification | (N/A) | N/A | N/A |
| (N/A) | (N/A) | (N/A) | PermissionRequest | N/A | N/A |

**Rules**:
- Codex hooks require `codex_hooks = true` feature flag in `config.toml`.
- Codex `PermissionRequest` has no Claude Code equivalent — it controls approval flow.
- Antigravity has no hook system.
- Gemini hooks go in user `settings.json` or the extension manifest `hooks` field.
- Gemini has 4 platform-specific events not available on other platforms (BeforeModel, AfterModel, BeforeToolSelection, Notification).
- OpenClaw hooks use TypeScript plugin SDK (`api.registerHook()`), not file-based config.
- Cursor uses camelCase; Gemini and Codex use PascalCase.
```

- [ ] **Step 3: Verify the edit**

Run: `grep -c "N/A" lib/references/platform-mappings.md`

The count should be lower than before (Codex N/A entries removed from Table 3). Visually confirm Table 3 has 14 rows (9 original + 4 Gemini-only + 1 Codex-only).

- [ ] **Step 4: Commit**

```bash
git add lib/references/platform-mappings.md
git commit -m "fix: platform-mappings Tables 2,3 — Codex hooks exist, Edit→apply_patch"
```

---

### Task 2: Fix platform-mappings.md Tables 7 and 13

**Files:**
- Modify: `lib/references/platform-mappings.md:120-215`

- [ ] **Step 1: Add Codex row to Table 7**

Find Table 7 and replace it with this updated version that adds a Codex column:

```markdown
## Table 7: Hook Format Rules

| Rule | Claude Code | Cursor | Gemini | Codex | OpenClaw |
|---|---|---|---|---|---|
| Event name case | PascalCase | camelCase | PascalCase | PascalCase | snake_case (SDK) |
| Timeout unit | seconds | seconds | milliseconds | seconds | N/A (SDK-managed) |
| Async support | yes (optional) | no (strip) | no (strip) | no (strip) | yes (async handlers) |
| Structure | nested (matcher → hooks[]) | flat (matcher at hook level) | settings.json or extension manifest `hooks` field | nested (same as Claude Code) | `api.registerHook()` (TypeScript) |
| Output key | `hookSpecificOutput.additionalContext` | `additional_context` | N/A | `permissionDecision` / `decision` (event-specific) | return value from handler |

**Notes**: Antigravity has no hook system — omitted from this table.
```

- [ ] **Step 2: Fix Table 13 — Codex and Gemini MCP**

Find Table 13 and replace:

```markdown
| Codex | — | MCP not supported via config file |
```

with:

```markdown
| Codex | `.mcp.json` or `config.toml [mcp]` | Supports stdio and SSE transports |
```

And replace:

```markdown
| Gemini | — | MCP not supported via config file |
```

with:

```markdown
| Gemini | `gemini-extension.json` → `mcpServers` | Extension-bundled MCP servers |
```

- [ ] **Step 3: Verify the edit**

Run: `grep "MCP not supported" lib/references/platform-mappings.md`

Expected: only Antigravity should still say "MCP not supported" (if it does). Codex and Gemini should no longer appear.

- [ ] **Step 4: Commit**

```bash
git add lib/references/platform-mappings.md
git commit -m "fix: platform-mappings Tables 7,13 — add Codex hooks format, fix MCP support"
```

---

### Task 3: Fix gemini-tools.md — subagent support and tool verification

**Files:**
- Modify: `lib/references/gemini-tools.md`

- [ ] **Step 1: Replace the "No subagent support" section**

In `lib/references/gemini-tools.md`, find these lines:

```markdown
## No subagent support

Gemini CLI has no equivalent to Claude Code's `Task` tool. Skills that rely on subagent dispatch (`subagent-driven-development`, `dispatching-parallel-agents`) will fall back to single-session execution via `executing-plans`.
```

Replace with:

```markdown
## Subagent dispatch

Gemini CLI has full subagent support. Use `@agent-name <task>` syntax in prompts or let the agent route automatically.

| Skill references | Gemini CLI equivalent |
| ---------------- | --------------------- |
| `Task` tool (dispatch subagent) | `@agent-name` in prompt, or automatic routing |
| `Agent` tool (dispatch subagent) | `@agent-name` in prompt, or automatic routing |

### Built-in agents

- `generalist` — general-purpose with all tools
- `cli_help` — Gemini CLI features expert
- `codebase_investigator` — codebase exploration specialist

### Custom agents

Define custom agents as Markdown files with YAML frontmatter in `.gemini/agents/` (project), `~/.gemini/agents/` (user), or `agents/` in extensions.

Subagents use `complete_task` to return results to the parent agent.
```

- [ ] **Step 2: Update the tool table — fix Task row**

Find this line in the tool mapping table:

```markdown
| `Task` tool (dispatch subagent) | No equivalent — Gemini CLI does not support subagents |
```

Replace with:

```markdown
| `Task` tool (dispatch subagent) | `@agent-name` in prompt (see [Subagent dispatch](#subagent-dispatch)) |
```

- [ ] **Step 3: Update "Additional Gemini CLI tools"**

Find the "Additional Gemini CLI tools" table and replace it with this expanded version:

```markdown
## Additional Gemini CLI tools

These tools are available in Gemini CLI but have no Claude Code equivalent:

| Tool | Purpose |
| ---- | ------- |
| `read_many_files` | Read multiple files at once (triggered by `@path`) |
| `list_directory` | List files and subdirectories |
| `save_memory` | Persist facts to GEMINI.md across sessions |
| `get_internal_docs` | Access Gemini CLI's own documentation |
| `complete_task` | Subagent-only: finalize mission and return result |
| `enter_plan_mode` / `exit_plan_mode` | Switch to read-only research mode |
| `browser_agent` | Experimental web browser automation |
```

- [ ] **Step 4: Verify**

Run: `grep -c "subagent\|No equivalent" lib/references/gemini-tools.md`

"No equivalent" should return 0 matches. "subagent" should return multiple matches.

- [ ] **Step 5: Commit**

```bash
git add lib/references/gemini-tools.md
git commit -m "fix: gemini-tools.md — add subagent support, expand tool list"
```

---

### Task 4: Fix codex-tools.md — Edit, WebFetch, hooks note

**Files:**
- Modify: `lib/references/codex-tools.md`

- [ ] **Step 1: Fix Edit mapping**

Find this row in the tool table:

```markdown
| `Edit` (file editing) | `Edit` |
```

Replace with:

```markdown
| `Edit` (file editing) | `apply_patch` |
```

- [ ] **Step 2: Fix WebFetch mapping**

Find this row:

```markdown
| `WebFetch` (fetch URL) | `WebFetch` |
```

Replace with:

```markdown
| `WebFetch` (fetch URL) | No direct equivalent — use MCP for URL fetching |
```

- [ ] **Step 3: Add Hooks section**

Add this section after the "Codex App Finishing" section at the end of the file:

```markdown
## Hooks

Codex has a lifecycle hook system behind a feature flag. Enable it in config:

```toml
# ~/.codex/config.toml or .codex/config.toml
[features]
codex_hooks = true
```

Codex hooks use the same JSON protocol and PascalCase event names as Claude Code (`SessionStart`, `PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `Stop`). Codex also has a `PermissionRequest` event with no Claude Code equivalent.

Hook config goes in `hooks.json` (same format as Claude Code) or inline `[hooks]` tables in `config.toml`. Default timeout: 600 seconds.

See `lib/patterns/hook-merging.md` for generation logic.
```

- [ ] **Step 4: Verify**

Run: `grep "apply_patch" lib/references/codex-tools.md`

Expected: at least 1 match (the tool table row).

Run: `grep "WebFetch" lib/references/codex-tools.md`

Expected: the row should say "No direct equivalent".

- [ ] **Step 5: Commit**

```bash
git add lib/references/codex-tools.md
git commit -m "fix: codex-tools.md — Edit→apply_patch, WebFetch N/A, add hooks docs"
```

---

### Task 5: Fix codex.yaml — hooks_path and hook conditions

**Files:**
- Modify: `lib/rubrics/codex.yaml:1-4` and `lib/rubrics/codex.yaml:147-151`

- [ ] **Step 1: Fix the header**

Find:

```yaml
hooks_path: null  # Codex has no hook system
```

Replace with:

```yaml
hooks_path: hooks.json  # Same JSON format as Claude Code; requires codex_hooks feature flag
```

- [ ] **Step 2: Replace empty 4_hooks category with conditions**

Find:

```yaml
  4_hooks:
    # N/A — Codex has no hook system (LOOKUP Table 3: all events map to N/A).
    # Hook scripts are copied as standalone utilities only.
    conditions: []
```

Replace with:

```yaml
  4_hooks:
    conditions:
      - id: codex.4_hooks.hooks_json.exists
        type: checkable
        component: hooks_json
        critical: false
        points: 1
        check: |
          # Codex hooks are optional (behind feature flag) — not critical
          if file_exists("hooks/hooks.json"):
            json = read_json("hooks/hooks.json")
            assert "hooks" in json, "hooks.json missing top-level 'hooks' key"

      - id: codex.4_hooks.event_names.pascalcase
        type: checkable
        component: event_names
        critical: true
        points: 1
        check: |
          if file_exists("hooks/hooks.json"):
            hooks = read_json("hooks/hooks.json")
            valid_events = ["SessionStart", "PreToolUse", "PostToolUse",
                            "PermissionRequest", "UserPromptSubmit", "Stop"]
            for event in hooks.get("hooks", {}):
              assert event in valid_events, \
                f"Invalid Codex hook event: {event} — must be PascalCase (Table 3)"

      - id: codex.4_hooks.feature_flag.documented
        type: judgement
        component: install_docs
        critical: true
        points: 1
        check: |
          If hooks/hooks.json exists, install documentation must include the
          Codex hooks feature flag enablement:
            [features]
            codex_hooks = true
          Without this flag, hooks silently do nothing.

      - id: codex.4_hooks.scripts.no_claude_paths
        type: checkable
        component: scripts
        critical: true
        points: 1
        check: |
          for script in glob("hooks/scripts/*"):
            content = read(script)
            if "${CLAUDE_PLUGIN_ROOT}" in content:
              # Codex has no plugin root variable — scripts must use
              # relative paths or detect their own location
              assert "dirname" in content or "BASH_SOURCE" in content, \
                f"{script}: bare ${{CLAUDE_PLUGIN_ROOT}} without self-location fallback"
```

- [ ] **Step 3: Verify YAML syntax**

Run: `python3 -c "import yaml; yaml.safe_load(open('lib/rubrics/codex.yaml'))" && echo "YAML valid"`

Expected: `YAML valid`

- [ ] **Step 4: Commit**

```bash
git add lib/rubrics/codex.yaml
git commit -m "fix: codex.yaml — add hook portability conditions (hooks exist)"
```

---

### Task 6: Fix hook-merging.md — add Codex generation, fix Gemini location

**Files:**
- Modify: `lib/patterns/hook-merging.md`

- [ ] **Step 1: Add Codex event mapping to the Event Name Mapping table**

Find the table at the top of hook-merging.md and add a Codex column. Replace the existing table:

```markdown
| Claude Code event | Cursor event | Notes |
|---|---|---|
| `SessionStart` | `sessionStart` | |
| `PreToolUse` | `preToolUse` | |
| `PostToolUse` | `postToolUse` | |
| `PostToolUseFailure` | `postToolUseFailure` | |
| `SubagentStart` | `subagentStart` | |
| `SubagentStop` | `subagentStop` | |
| `PreCompact` | `preCompact` | |
| `Stop` | `stop` | |
| `UserPromptSubmit` | `beforeSubmitPrompt` | |
```

with:

```markdown
| Claude Code event | Cursor event | Codex event | Notes |
|---|---|---|---|
| `SessionStart` | `sessionStart` | `SessionStart` | |
| `PreToolUse` | `preToolUse` | `PreToolUse` | |
| `PostToolUse` | `postToolUse` | `PostToolUse` | |
| `PostToolUseFailure` | `postToolUseFailure` | (N/A) | |
| `SubagentStart` | `subagentStart` | (N/A) | |
| `SubagentStop` | `subagentStop` | (N/A) | |
| `PreCompact` | `preCompact` | (N/A) | |
| `Stop` | `stop` | `Stop` | |
| `UserPromptSubmit` | `beforeSubmitPrompt` | `UserPromptSubmit` | |
| (N/A) | (N/A) | `PermissionRequest` | Codex-only |
```

Also update the Cursor-only events line to mention Codex:

Find:

```markdown
Cursor-only events (no Claude Code equivalent):
```

Add after it:

```markdown

Codex-only events (no Claude Code equivalent):
`PermissionRequest`
```

- [ ] **Step 2: Add "Generate Codex Hooks from Claude Hooks" section**

Insert this new section immediately after the "Generate Cursor Hooks from Claude Hooks" section (after the empty hooks-cursor.json example, before "Merge SessionStart into Existing Hooks"):

```markdown
---

## Generate Codex Hooks from Claude Hooks

Codex uses the same JSON protocol, same PascalCase event names, and same nested
structure as Claude Code. The hooks.json file is identical — no event remapping
needed.

```
GENERATE_CODEX_HOOKS(plugin_path):
  source = read_json(plugin_path / "hooks/hooks.json")

  if source is missing or source.hooks is empty:
    return  // No hooks to port — Codex can use the Claude hooks.json directly

  // Claude Code hooks.json IS the Codex hooks.json — same format.
  // Only difference: Codex requires a feature flag to enable hooks.
  // The install docs handle that (see lib/templates/install-docs/codex.md).

  // Check for unmapped events
  codex_events = ["SessionStart", "PreToolUse", "PostToolUse",
                   "UserPromptSubmit", "Stop", "PermissionRequest"]
  flags = []

  for event in source.hooks:
    if event not in codex_events:
      flags.append(event)

  if flags:
    report: "These Claude Code hook events have no Codex equivalent and will
             be ignored: " + ", ".join(flags)

  // Check for Claude-specific path variables
  for event, entries in source.hooks:
    for entry in entries:
      if entry.command contains "$CLAUDE_PLUGIN_ROOT":
        report: "Hook command references $CLAUDE_PLUGIN_ROOT — Codex has no
                 plugin root variable. Use relative paths or self-location."
```

**Key difference from Cursor generation:** No file is created. Codex reads the
same `hooks/hooks.json` as Claude Code. The only action is to verify
compatibility and flag unmapped events.
```

- [ ] **Step 3: Fix Gemini Hook Guidance section**

Find:

```markdown
## Gemini Hook Guidance

Gemini CLI hooks are configured in user `settings.json`, not in the repo. The uplift skill generates guidance text for install docs instead of writing a hooks file.
```

Replace with:

```markdown
## Gemini Hook Guidance

Gemini CLI hooks can be configured in two places:
1. **User `settings.json`** — for standalone use (user configures manually)
2. **Extension manifest** — `hooks` field in `gemini-extension.json` (for extension distribution)

For extension distribution, the uplift skill should add hooks to the manifest.
For standalone use, it generates guidance text for install docs.
```

- [ ] **Step 4: Verify**

Run: `grep -c "Codex" lib/patterns/hook-merging.md`

Expected: multiple matches (event table, generation section, notes).

Run: `grep "extension manifest" lib/patterns/hook-merging.md`

Expected: at least 1 match in the Gemini section.

- [ ] **Step 5: Commit**

```bash
git add lib/patterns/hook-merging.md
git commit -m "fix: hook-merging.md — add Codex hook generation, fix Gemini hooks location"
```

---

### Task 7: Add hooks section to Codex install docs

**Files:**
- Modify: `lib/templates/install-docs/codex.md`

- [ ] **Step 1: Add Hooks section**

In `lib/templates/install-docs/codex.md`, find the "### Multi-agent support" section. Insert a new section immediately before it:

```markdown
### Hooks

If this plugin includes hooks (`hooks/hooks.json`), enable the Codex hooks feature flag:

```toml
# ~/.codex/config.toml
[features]
codex_hooks = true
```

Without this flag, hooks are silently ignored. Codex uses the same `hooks/hooks.json` format as Claude Code — no separate hook file is needed.

```

- [ ] **Step 2: Verify**

Run: `grep "codex_hooks" lib/templates/install-docs/codex.md`

Expected: 1 match.

- [ ] **Step 3: Commit**

```bash
git add lib/templates/install-docs/codex.md
git commit -m "fix: codex install docs — add hooks feature flag enablement"
```

---

### Task 8: Fix manifest-generation.md — Gemini extension fields

**Files:**
- Modify: `lib/patterns/manifest-generation.md:131-137`

- [ ] **Step 1: Expand the gemini-extension section**

Find the entire gemini-extension section:

```markdown
## gemini-extension

**Target:** `gemini-extension.json`

> **Template:** `lib/templates/manifests/gemini-extension.json.tmpl`

---
```

Replace with:

```markdown
## gemini-extension

**Target:** `gemini-extension.json`

> **Template:** `lib/templates/manifests/gemini-extension.json.tmpl`

### Required fields

`name` (kebab-case, matches npm conventions), `version` (semver).

### Optional fields (conditional generation)

| Field | Include when | Value |
|-------|-------------|-------|
| `description` | Always | From computed metadata |
| `contextFileName` | Always | `"GEMINI.md"` |
| `mcpServers` | Source plugin has `.mcp.json` | Map of server configs with `${extensionPath}` variables |
| `hooksDir` | Hooks exist in non-default path | Relative path (default `hooks/` is auto-discovered) |
| `skillsDir` | Skills exist in non-default path | Relative path (default `skills/` is auto-discovered) |
| `settings` | Plugin requires user configuration | Array of `{ name, description, envVar, sensitive? }` |
| `plan` | Plugin uses planning artifacts | `{ "directory": "<path>" }` |
| `excludeTools` | Plugin restricts dangerous operations | Array of tool exclusion strings |

### Variable substitution

Use `${extensionPath}` for absolute paths, `${workspacePath}` for workspace-relative, `${/}` for OS path separator.

---
```

- [ ] **Step 2: Verify**

Run: `grep "mcpServers\|hooksDir\|skillsDir" lib/patterns/manifest-generation.md`

Expected: 3 matches (one for each field in the table).

- [ ] **Step 3: Commit**

```bash
git add lib/patterns/manifest-generation.md
git commit -m "fix: manifest-generation.md — document Gemini extension optional fields"
```

---

### Task 9: Update reconciliation matrix

**Files:**
- Modify: `docs/reconciliation-matrix.md`

- [ ] **Step 1: Update all fixed items in the matrix**

In `docs/reconciliation-matrix.md`, make these status changes. For each cell listed below, change the Status column value:

**Section 1 (References / platform-mappings.md — Table 2):**
- "Codex / Edit" row: `Wrong` → `Fixed`
- "Codex / WebFetch" row: `Wrong` → `Fixed`

**Section 1 (References / platform-mappings.md — Table 3):**
- "All Codex events" row: `Wrong` → `Fixed`
- "Codex / SessionStart" row: `Wrong` → `Fixed`
- "Codex / PreToolUse" row: `Wrong` → `Fixed`
- "Codex / PostToolUse" row: `Wrong` → `Fixed`
- "Codex / UserPromptSubmit" row: `Wrong` → `Fixed`
- "Codex / Stop" row: `Wrong` → `Fixed`
- "Codex / PermissionRequest" row: `Missing` → `Fixed`
- "Gemini / mapped events" row: `Missing` → `Fixed`
- "Table 3 notes" row: `Wrong` → `Fixed`

**Section 1 (References / platform-mappings.md — Table 7):**
- "Codex row" row: `Wrong` → `Fixed`
- "Gemini hooks location" row: `Wrong` → `Fixed`

**Section 1 (References / platform-mappings.md — Table 13):**
- "Codex" row: `Wrong` → `Fixed`
- "Gemini" row: `Needs review` → `Fixed`

**Section 1 (References / gemini-tools.md):**
- "Subagent support" row: `Wrong` → `Fixed`

**Section 1 (References / codex-tools.md):**
- "Edit mapping" row: `Wrong` → `Fixed`
- "WebFetch" row: `Wrong` → `Fixed`

**Section 2 (Rubrics / codex.yaml):**
- "`hooks_path: null`" row: `Wrong` → `Fixed`
- "Hook conditions" row: `Missing` → `Fixed`

**Section 3 (Patterns / hook-merging.md):**
- "Codex hooks" row: `Missing` → `Fixed`
- "Gemini hooks" row: `Wrong` → `Fixed`

**Section 3 (Patterns / manifest-generation.md):**
- "Gemini manifest fields" row: `Needs review` → `Fixed`

**Section 4 (Templates / hooks):**
- "Codex hooks template" row: `Missing` → `Fixed (not needed — same format as Claude Code)`

**Section 4 (Templates / install-docs):**
- Add a new row for codex.md if not present, status: `Fixed`

- [ ] **Step 2: Update the Summary section**

In the "Summary: Items Requiring Action" section, move all fixed items from
"Definitively Wrong" and "Likely Wrong" into a new "Fixed" subsection, or
strike them through. Update the count.

Replace the entire summary section with:

```markdown
## Summary: Items Requiring Action

### Fixed (this batch)

1. ~~Table 2: Codex Edit → `apply_patch`~~ Fixed
2. ~~Table 2: Codex WebFetch → N/A~~ Fixed
3. ~~Table 3: All Codex events marked N/A~~ Fixed
4. ~~Table 3 notes: "Codex has no hook system"~~ Fixed
5. ~~Table 7: Codex omitted~~ Fixed
6. ~~Table 13: Codex MCP "not supported"~~ Fixed
7. ~~gemini-tools.md: "No subagent support"~~ Fixed
8. ~~codex-tools.md: Edit and WebFetch wrong~~ Fixed
9. ~~codex.yaml: `hooks_path: null`~~ Fixed
10. ~~hook-merging.md: No Codex hook generation~~ Fixed
11. ~~hooks templates: No Codex hook template~~ Fixed (not needed)
12. ~~Table 3: Gemini missing 4 hook events~~ Fixed
13. ~~Table 7: Gemini hooks location incomplete~~ Fixed
14. ~~Table 13: Gemini MCP claim~~ Fixed
15. ~~manifest-generation.md: Gemini manifest fields incomplete~~ Fixed

### Needs Systematic Verification

16. All remaining tool name mappings (Table 2) against source code refs
17. All manifest template schemas against researched schemas
18. All install doc commands against researched install methods
19. All rubric conditions against researched platform capabilities
20. All context file templates against researched context file formats
```

- [ ] **Step 3: Commit**

```bash
git add docs/reconciliation-matrix.md
git commit -m "fix: reconciliation matrix — mark all 15 items as fixed"
```

---

### Task 10: Final verification

- [ ] **Step 1: Run markdownlint**

```bash
npx markdownlint-cli2 lib/references/platform-mappings.md lib/references/gemini-tools.md lib/references/codex-tools.md lib/patterns/hook-merging.md lib/patterns/manifest-generation.md lib/templates/install-docs/codex.md docs/reconciliation-matrix.md
```

Fix any lint errors that appear.

- [ ] **Step 2: Validate YAML**

```bash
python3 -c "import yaml; yaml.safe_load(open('lib/rubrics/codex.yaml'))" && echo "codex.yaml valid"
```

- [ ] **Step 3: Run CI structure check**

```bash
bash -c 'source .github/workflows/ci.yml 2>/dev/null; find . -name "*.sh" -type f | head -5'
```

Or simply verify the files exist:

```bash
ls lib/references/platform-mappings.md lib/references/gemini-tools.md lib/references/codex-tools.md lib/rubrics/codex.yaml lib/patterns/hook-merging.md lib/templates/install-docs/codex.md lib/patterns/manifest-generation.md docs/reconciliation-matrix.md
```

Expected: all 8 files listed without errors.

- [ ] **Step 4: Fix any lint errors and commit if needed**

```bash
git add -A && git commit -m "fix: resolve lint errors from reconciliation fixes"
```

Only run this if Step 1 found errors.
