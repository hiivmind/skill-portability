# Pattern Deduplication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace 9 hardcoded platform data instances in pattern files with REGISTRY lookups, adding 2 new API functions and 1 new PlatformSpec field.

**Architecture:** Prerequisites first (PlatformSpec changes), then pattern file edits in dependency order, then verification. All edits are text replacements in markdown pseudocode — no executable code changes.

**Tech Stack:** Markdown, pseudocode.

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `lib/references/platform-api.md` | Modify | Add `marketplace_path` to manifest type, add 2 reverse-lookup functions |
| `lib/references/platforms/claude-code.md` | Modify | Add `marketplace_path` field |
| `lib/references/platforms/cursor.md` | Modify | Add `marketplace_path` field |
| `lib/references/platforms/codex.md` | Modify | Add `marketplace_path` field |
| `lib/references/platforms/gemini-cli.md` | Modify | Add `marketplace_path: null` |
| `lib/references/platforms/antigravity.md` | Modify | Add `marketplace_path: null`, add GEMINI.md to secondary_files |
| `lib/references/platforms/openclaw.md` | Modify | Add `marketplace_path: null` |
| `lib/patterns/hook-merging.md` | Modify | Replace event mapping table, codex event list, gemini event map |
| `lib/patterns/inventory.md` | Modify | Replace manifest_checks, context_checks, helper references |
| `lib/patterns/injection-checks.md` | Modify | Replace hardcoded event names with hook_event() calls |
| `lib/patterns/bootstrapping.md` | Modify | Replace hook output format comment |
| `docs/reconciliation-matrix.md` | Modify | Add items for pattern deduplication |

---

### Task 1: Add marketplace_path to PlatformSpec type

**Files:**
- Modify: `lib/references/platform-api.md:58-62`

- [ ] **Step 1: Add marketplace_path field to the manifest type**

In `lib/references/platform-api.md`, find:

```
  # ── Manifest ──
  manifest: {
    path:            string | null,
    required_fields: List[string],
  },
```

Replace with:

```
  # ── Manifest ──
  manifest: {
    path:             string | null,
    marketplace_path: string | null,
    required_fields:  List[string],
  },
```

- [ ] **Step 2: Verify**

Run: `grep 'marketplace_path' lib/references/platform-api.md`
Expected: one line containing `marketplace_path`

- [ ] **Step 3: Commit**

```bash
git add lib/references/platform-api.md
git commit -m "Add marketplace_path to PlatformSpec.manifest type"
```

---

### Task 2: Add reverse-lookup functions to platform-api.md

**Files:**
- Modify: `lib/references/platform-api.md:191-193` (after last function)

- [ ] **Step 1: Add the two new functions**

In `lib/references/platform-api.md`, find the last line of the file (line 193, which is the closing triple-backtick of the Lookup Functions code block):

````
  strip_fields: tgt.frontmatter.strip
  model_format: tgt.frontmatter.model_format
```
````

Replace with:

````
  strip_fields: tgt.frontmatter.strip
  model_format: tgt.frontmatter.model_format

# ── Reverse lookups ──

FUNCTION platform_for_spec(filename)
  RETURNS platform ID from a spec filename like "codex.md" → "codex".
  FOR EACH pid IN REGISTRY:
    IF filename == pid + ".md": RETURN pid

FUNCTION platform_for_hooks(path)
  RETURNS platform ID from a hooks file path.
  IF "cursor" IN path: RETURN "cursor"
  RETURN "claude-code"
```
````

- [ ] **Step 2: Verify**

Run: `grep -c 'FUNCTION platform_for' lib/references/platform-api.md`
Expected: `2`

- [ ] **Step 3: Commit**

```bash
git add lib/references/platform-api.md
git commit -m "Add platform_for_spec and platform_for_hooks reverse-lookup functions"
```

---

### Task 3: Populate marketplace_path in all 6 platform spec files

**Files:**
- Modify: `lib/references/platforms/claude-code.md`
- Modify: `lib/references/platforms/cursor.md`
- Modify: `lib/references/platforms/codex.md`
- Modify: `lib/references/platforms/gemini-cli.md`
- Modify: `lib/references/platforms/antigravity.md`
- Modify: `lib/references/platforms/openclaw.md`

- [ ] **Step 1: claude-code.md — add marketplace_path**

Find:

```
  manifest: {
    path: ".claude-plugin/plugin.json",
    required_fields: ["name", "version", "description", "author.name", "author.email"],
  },
```

Replace with:

```
  manifest: {
    path: ".claude-plugin/plugin.json",
    marketplace_path: ".claude-plugin/marketplace.json",
    required_fields: ["name", "version", "description", "author.name", "author.email"],
  },
```

- [ ] **Step 2: cursor.md — add marketplace_path**

Find:

```
  manifest: {
    path: ".cursor-plugin/plugin.json",
    required_fields: ["name", "displayName", "description", "version", "author"],
  },
```

Replace with:

```
  manifest: {
    path: ".cursor-plugin/plugin.json",
    marketplace_path: ".cursor-plugin/marketplace.json",
    required_fields: ["name", "displayName", "description", "version", "author"],
  },
```

- [ ] **Step 3: codex.md — add marketplace_path**

Find:

```
  manifest: {
    path: ".codex-plugin/plugin.json",
    required_fields: ["name", "version", "description"],
  },
```

Replace with:

```
  manifest: {
    path: ".codex-plugin/plugin.json",
    marketplace_path: ".agents/plugins/marketplace.json",
    required_fields: ["name", "version", "description"],
  },
```

- [ ] **Step 4: gemini-cli.md — add marketplace_path (null)**

Find:

```
  manifest: {
    path: "gemini-extension.json",
    required_fields: ["name", "version", "description", "contextFileName"],
  },
```

Replace with:

```
  manifest: {
    path: "gemini-extension.json",
    marketplace_path: null,
    required_fields: ["name", "version", "description", "contextFileName"],
  },
```

- [ ] **Step 5: antigravity.md — add marketplace_path (null) and add GEMINI.md to secondary_files**

Find:

```
  manifest: {
    path: "package.json",
    required_fields: ["name", "displayName", "version", "description", "publisher"],
  },
```

Replace with:

```
  manifest: {
    path: "package.json",
    marketplace_path: null,
    required_fields: ["name", "displayName", "version", "description", "publisher"],
  },
```

Also find:

```
    secondary_files: [".agents/rules/*.md"],
```

Replace with:

```
    secondary_files: ["GEMINI.md", ".agents/rules/*.md"],
```

- [ ] **Step 6: openclaw.md — add marketplace_path (null)**

Find:

```
  manifest: {
    path: "openclaw.plugin.json",
    required_fields: ["id", "configSchema"],
  },
```

Replace with:

```
  manifest: {
    path: "openclaw.plugin.json",
    marketplace_path: null,
    required_fields: ["id", "configSchema"],
  },
```

- [ ] **Step 7: Verify**

Run: `grep -c 'marketplace_path' lib/references/platforms/*.md`
Expected: each file shows 1

Run: `grep 'secondary_files' lib/references/platforms/antigravity.md`
Expected: contains `"GEMINI.md"`

- [ ] **Step 8: Commit**

```bash
git add lib/references/platforms/*.md
git commit -m "Add marketplace_path to all platform specs, GEMINI.md to Antigravity secondary_files"
```

---

### Task 4: Replace event mapping table and codex event list in hook-merging.md

**Files:**
- Modify: `lib/patterns/hook-merging.md:7-26,102-103`

- [ ] **Step 1: Replace event name mapping section (lines 7-26)**

Find:

```
## Event Name Mapping

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

Cursor-only events (no Claude Code equivalent):
`sessionEnd`, `beforeShellExecution`, `afterShellExecution`, `beforeMCPExecution`, `afterMCPExecution`, `beforeReadFile`, `afterFileEdit`, `afterAgentResponse`, `afterAgentThought`

Codex-only events (no Claude Code equivalent):
`PermissionRequest`
```

Replace with:

```
## Event Name Mapping

Event mappings are derived from REGISTRY. To get the platform-native name
for any canonical event:

  hook_event(platform, canonical_event)

Example: hook_event("cursor", "session.start") → "sessionStart"

For platform-specific events beyond the canonical set, see
REGISTRY[platform].hooks.extra_events.
```

- [ ] **Step 2: Replace codex_events hardcoded list (lines 102-103)**

Find:

```
  codex_events = ["SessionStart", "PreToolUse", "PostToolUse",
                   "UserPromptSubmit", "Stop", "PermissionRequest"]
```

Replace with:

```
  codex_events = [entry.name FOR event, entry IN REGISTRY["codex"].hooks.events
                  WHERE entry.name IS NOT null]
                + [entry.name FOR entry IN REGISTRY["codex"].hooks.extra_events]
```

- [ ] **Step 3: Verify**

Run: `grep -cP '^\| .*(SessionStart|PreToolUse|PostToolUse).*\|' lib/patterns/hook-merging.md`
Expected: `0`

Run: `grep -n 'codex_events' lib/patterns/hook-merging.md`
Expected: shows REGISTRY-derived expression

- [ ] **Step 4: Commit**

```bash
git add lib/patterns/hook-merging.md
git commit -m "Replace event mapping table and codex event list with REGISTRY lookups"
```

---

### Task 5: Replace gemini event map in hook-merging.md

**Files:**
- Modify: `lib/patterns/hook-merging.md:237-265`

- [ ] **Step 1: Replace the gemini event map and loop**

Find:

```
GENERATE_GEMINI_HOOK_GUIDANCE(claude_hooks):
  gemini_event_map = {
    "SessionStart":    "SessionStart",
    "PreToolUse":      "BeforeTool",
    "PostToolUse":     "AfterTool",
    "PreCompact":      "PreCompress",
    "Stop":            "AfterAgent",
  }

  guidance = "### Gemini CLI Hook Configuration\n\n"
  guidance += "Add the following to your `~/.gemini/settings.json`:\n\n"
  guidance += "```json\n{\n  \"hooks\": {\n"

  FOR event, entries IN claude_hooks.hooks:
    IF event NOT IN gemini_event_map:
      SKIP
    gemini_event = gemini_event_map[event]
```

Replace with:

```
GENERATE_GEMINI_HOOK_GUIDANCE(claude_hooks):
  guidance = "### Gemini CLI Hook Configuration\n\n"
  guidance += "Add the following to your `~/.gemini/settings.json`:\n\n"
  guidance += "```json\n{\n  \"hooks\": {\n"

  FOR canonical_event IN CanonicalEvent:
    gemini_name = hook_event("gemini-cli", canonical_event)
    IF gemini_name IS null: SKIP
    claude_name = hook_event("claude-code", canonical_event)
    IF claude_name NOT IN claude_hooks.hooks: SKIP
    entries = claude_hooks.hooks[claude_name]
```

- [ ] **Step 2: Update the loop body variable reference**

Find (in the line after the replacement above):

```
    FOR entry IN entries:
      guidance += '    "' + gemini_event + '": [{\n'
```

Replace with:

```
    FOR entry IN entries:
      guidance += '    "' + gemini_name + '": [{\n'
```

- [ ] **Step 3: Verify**

Run: `grep -n 'gemini_event_map' lib/patterns/hook-merging.md`
Expected: no output

- [ ] **Step 4: Commit**

```bash
git add lib/patterns/hook-merging.md
git commit -m "Replace gemini event map with REGISTRY-derived hook_event() lookups"
```

---

### Task 6: Replace hardcoded lists in inventory.md

**Files:**
- Modify: `lib/patterns/inventory.md:26-60,143,146,152-159`

- [ ] **Step 1: Replace manifest_checks (lines 26-38)**

Find:

```
  ## 2.2 Check Platform Manifests
  ## 10 paths across 6 platforms. Record { platform, path, status }.
  manifest_checks = [
    { platform: "claude-code",  path: ".claude-plugin/plugin.json" },
    { platform: "claude-code",  path: ".claude-plugin/marketplace.json" },
    { platform: "cursor",       path: ".cursor-plugin/plugin.json" },
    { platform: "cursor",       path: ".cursor-plugin/marketplace.json" },
    { platform: "gemini-cli",   path: "gemini-extension.json" },
    { platform: "codex",        path: ".codex-plugin/plugin.json" },
    { platform: "codex",        path: ".agents/plugins/marketplace.json" },
    { platform: "antigravity",  path: "package.json" },
    { platform: "openclaw",     path: "openclaw.plugin.json" },
  ]
```

Replace with:

```
  ## 2.2 Check Platform Manifests
  ## Derive paths from REGISTRY. Record { platform, path, status }.
  manifest_checks = []
  FOR pid, spec IN REGISTRY:
    IF spec.manifest.path IS NOT null:
      manifest_checks.append({ platform: pid, path: spec.manifest.path })
    IF spec.manifest.marketplace_path IS NOT null:
      manifest_checks.append({ platform: pid, path: spec.manifest.marketplace_path })
```

- [ ] **Step 2: Replace context_checks (lines 45-55)**

Find:

```
  ## 2.3 Check Context Files
  ## 7 checks: CLAUDE.md, AGENTS.md x4, GEMINI.md x2.
  context_checks = [
    { platform: "claude-code",  path: "CLAUDE.md" },
    { platform: "cursor",       path: "AGENTS.md" },
    { platform: "gemini-cli",   path: "GEMINI.md" },
    { platform: "codex",        path: "AGENTS.md" },
    { platform: "antigravity",  path: "AGENTS.md" },
    { platform: "antigravity",  path: "GEMINI.md" },
    { platform: "openclaw",     path: "AGENTS.md" },
  ]
```

Replace with:

```
  ## 2.3 Check Context Files
  ## Derive from REGISTRY primary_file + secondary_files.
  context_checks = []
  FOR pid, spec IN REGISTRY:
    context_checks.append({ platform: pid, path: spec.context.primary_file })
    FOR secondary IN spec.context.secondary_files:
      context_checks.append({ platform: pid, path: secondary })
```

- [ ] **Step 3: Replace spec_platform and hook_platform calls (lines 143, 146)**

Find:

```
      computed.existing_files.append({ path: p, platform: spec_platform(r.file) })
```

Replace with:

```
      computed.existing_files.append({ path: p, platform: platform_for_spec(r.file) })
```

Find:

```
      computed.existing_files.append({ path: r.path, platform: hook_platform(r.path) })
```

Replace with:

```
      computed.existing_files.append({ path: r.path, platform: platform_for_hooks(r.path) })
```

- [ ] **Step 4: Update Helper References table (lines 152-159)**

Find:

```
## Helper References

| Helper | Defined in |
|--------|-----------|
| `parse_yaml_frontmatter` | inline — read between `---` markers |
| `check_injection_components` | `lib/patterns/injection-checks.md` |
| `spec_platform(file)` | `"gemini-cli.md" → "gemini-cli"`, `"codex.md" → "codex"` |
| `hook_platform(path)` | `"hooks.json" → "claude-code"`, `"hooks-cursor.json" → "cursor"` |
```

Replace with:

```
## Helper References

| Helper | Defined in |
|--------|-----------|
| `parse_yaml_frontmatter` | inline — read between `---` markers |
| `check_injection_components` | `lib/patterns/injection-checks.md` |
| `platform_for_spec(file)` | `lib/references/platform-api.md` |
| `platform_for_hooks(path)` | `lib/references/platform-api.md` |
```

- [ ] **Step 5: Verify**

Run: `grep -c 'platform:.*path:' lib/patterns/inventory.md`
Expected: `0`

Run: `grep -n 'spec_platform\|hook_platform' lib/patterns/inventory.md`
Expected: no output

Run: `grep -n 'platform_for_spec\|platform_for_hooks' lib/patterns/inventory.md`
Expected: two lines (one each)

- [ ] **Step 6: Commit**

```bash
git add lib/patterns/inventory.md
git commit -m "Replace hardcoded manifest/context lists and helpers with REGISTRY lookups"
```

---

### Task 7: Replace hardcoded event names in injection-checks.md

**Files:**
- Modify: `lib/patterns/injection-checks.md:50-67`

- [ ] **Step 1: Replace SessionStart check (lines 50-57)**

Find:

```
  # 5. hooks.json SessionStart entry
  IF file_exists("hooks/hooks.json"):
    content = Read("hooks/hooks.json")
    IF content contains "SessionStart" AND content contains "session-start":
      results.append({ component: "hooks/hooks.json (SessionStart)", status: "PRESENT" })
    ELSE:
      results.append({ component: "hooks/hooks.json (SessionStart)", status: "MISSING" })
  ELSE:
    results.append({ component: "hooks/hooks.json (SessionStart)", status: "MISSING" })
```

Replace with:

```
  # 5. hooks.json SessionStart entry
  claude_event = hook_event("claude-code", "session.start")
  IF file_exists("hooks/hooks.json"):
    content = Read("hooks/hooks.json")
    IF content contains claude_event AND content contains "session-start":
      results.append({ component: "hooks/hooks.json (" + claude_event + ")", status: "PRESENT" })
    ELSE:
      results.append({ component: "hooks/hooks.json (" + claude_event + ")", status: "MISSING" })
  ELSE:
    results.append({ component: "hooks/hooks.json (" + claude_event + ")", status: "MISSING" })
```

- [ ] **Step 2: Replace sessionStart check (lines 59-67)**

Find:

```
  # 6. hooks-cursor.json sessionStart entry
  IF file_exists("hooks/hooks-cursor.json"):
    content = Read("hooks/hooks-cursor.json")
    IF content contains "sessionStart" AND content contains "session-start":
      results.append({ component: "hooks/hooks-cursor.json (sessionStart)", status: "PRESENT" })
    ELSE:
      results.append({ component: "hooks/hooks-cursor.json (sessionStart)", status: "MISSING" })
  ELSE:
    results.append({ component: "hooks/hooks-cursor.json (sessionStart)", status: "MISSING" })
```

Replace with:

```
  # 6. hooks-cursor.json sessionStart entry
  cursor_event = hook_event("cursor", "session.start")
  IF file_exists("hooks/hooks-cursor.json"):
    content = Read("hooks/hooks-cursor.json")
    IF content contains cursor_event AND content contains "session-start":
      results.append({ component: "hooks/hooks-cursor.json (" + cursor_event + ")", status: "PRESENT" })
    ELSE:
      results.append({ component: "hooks/hooks-cursor.json (" + cursor_event + ")", status: "MISSING" })
  ELSE:
    results.append({ component: "hooks/hooks-cursor.json (" + cursor_event + ")", status: "MISSING" })
```

- [ ] **Step 3: Verify**

Run: `grep -n '"SessionStart"\|"sessionStart"' lib/patterns/injection-checks.md`
Expected: no output (all replaced with hook_event() calls)

- [ ] **Step 4: Commit**

```bash
git add lib/patterns/injection-checks.md
git commit -m "Replace hardcoded hook event names with hook_event() lookups"
```

---

### Task 8: Replace hook output comment in bootstrapping.md

**Files:**
- Modify: `lib/patterns/bootstrapping.md:127-130`

- [ ] **Step 1: Replace the comment block**

Find:

```
# Output context injection as JSON.
# Cursor hooks expect additional_context (snake_case).
# Claude Code hooks expect hookSpecificOutput.additionalContext (nested).
# Other platforms expect additionalContext (top-level, SDK standard).
```

Replace with:

```
# Output format per platform — see REGISTRY[platform].hooks.output_key
# and REGISTRY[platform].hooks.structure for the authoritative mapping.
```

- [ ] **Step 2: Verify**

Run: `grep -n 'additional_context (snake_case)\|hookSpecificOutput.additionalContext (nested)' lib/patterns/bootstrapping.md`
Expected: no output

- [ ] **Step 3: Commit**

```bash
git add lib/patterns/bootstrapping.md
git commit -m "Replace inline hook output format comment with REGISTRY reference"
```

---

### Task 9: Final verification and reconciliation matrix

- [ ] **Step 1: Run all verification commands**

```bash
echo "=== 1. No event mapping table rows ===" && grep -cP '^\| .*(SessionStart|PreToolUse|PostToolUse).*\|' lib/patterns/hook-merging.md ; echo "=== 2. codex_events REGISTRY ===" && grep -n 'codex_events' lib/patterns/hook-merging.md ; echo "=== 3. No gemini_event_map ===" && grep -n 'gemini_event_map' lib/patterns/hook-merging.md ; echo "=== 4. No hardcoded manifest checks ===" && grep -c 'platform:.*path:' lib/patterns/inventory.md ; echo "=== 5. No old helpers ===" && grep -n 'spec_platform\|hook_platform' lib/patterns/inventory.md ; echo "=== 6. New functions in API ===" && grep -n 'platform_for_spec\|platform_for_hooks' lib/references/platform-api.md ; echo "=== 7. No hardcoded event names in injection-checks ===" && grep -n '"SessionStart"\|"sessionStart"' lib/patterns/injection-checks.md ; echo "=== 8. marketplace_path in all specs ===" && grep -c 'marketplace_path' lib/references/platforms/*.md ; echo "=== DONE ==="
```

Expected: checks 1,3,4,5,7 return 0/no output; check 2 shows REGISTRY expression; check 6 shows 2 functions; check 8 shows 1 per file.

- [ ] **Step 2: Add reconciliation matrix items**

In `docs/reconciliation-matrix.md`, find:

```
### Verification status

All tiers, platform API restructure, and rubric check alignment: complete, zero gaps.
```

Replace with:

```
### Pattern Deduplication

40. ~~**hook-merging.md**: 20-line event mapping table duplicated REGISTRY data~~ Fixed — replaced with hook_event() reference
41. ~~**hook-merging.md**: Hardcoded codex_events list~~ Fixed — derived from REGISTRY canonical + extra_events
42. ~~**hook-merging.md**: Inline gemini_event_map dictionary~~ Fixed — replaced with hook_event() lookups
43. ~~**inventory.md**: Hardcoded manifest_checks list~~ Fixed — derived from REGISTRY manifest.path + marketplace_path
44. ~~**inventory.md**: Hardcoded context_checks list~~ Fixed — derived from REGISTRY primary_file + secondary_files
45. ~~**inventory.md**: Inline spec_platform/hook_platform helpers~~ Fixed — replaced with platform_for_spec/platform_for_hooks from platform-api.md
46. ~~**injection-checks.md**: Hardcoded "SessionStart"/"sessionStart" strings~~ Fixed — replaced with hook_event() calls
47. ~~**bootstrapping.md**: Inline hook output format documentation~~ Fixed — references REGISTRY[platform].hooks.output_key
48. ~~**PlatformSpec**: Missing marketplace_path field~~ Fixed — added to type and all 6 platform specs
49. ~~**antigravity.md**: GEMINI.md in priority_note prose, not secondary_files~~ Fixed — added to secondary_files

### Verification status

All tiers, platform API restructure, rubric check alignment, and pattern deduplication: complete, zero gaps.
```

- [ ] **Step 3: Commit**

```bash
git add docs/reconciliation-matrix.md
git commit -m "Mark pattern deduplication items 40-49 as fixed in reconciliation matrix"
```
