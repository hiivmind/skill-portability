# Tier 2: Rubrics & Patterns Verification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify every "Needs review" claim in `lib/rubrics/` and `lib/patterns/` against `docs/platforms/*.md` research docs. Fix discrepancies, confirm correct claims, update the reconciliation matrix.

**Architecture:** File-by-file verification. Rubric YAMLs are verified against platform research for condition accuracy and completeness. Pattern docs are verified for correct pseudocode logic and platform-specific claims.

**Tech Stack:** Markdown and YAML editing only. No code, no tests, no builds.

---

## Pre-analysis: Known issues from research comparison

Before starting, the plan author compared all files against research and identified these discrepancies:

| File | Issue | Severity |
|------|-------|----------|
| `codex.yaml` | No MCP conditions — cursor.yaml has `7_runtime.mcp.*` but codex.yaml doesn't | Fix needed |
| `gemini-cli.yaml` | hooks_path comment doesn't mention extension manifest | Minor fix |
| `openclaw.yaml` | Hook event names condition references only 4 events | Fix needed |
| `hook-merging.md` | Cursor generation drops `matcher` field — research confirms Cursor supports matchers | Fix needed |

Everything else appears correct based on research comparison.

---

### Task 1: Verify and fix rubric YAMLs (5 items)

**Files:**
- Modify: `lib/rubrics/codex.yaml`
- Modify: `lib/rubrics/gemini-cli.yaml`
- Modify: `lib/rubrics/openclaw.yaml`
- Read: `lib/rubrics/cursor.yaml`, `lib/rubrics/antigravity.yaml`
- Read: `docs/platforms/codex.md`, `docs/platforms/gemini-cli.md`, `docs/platforms/cursor.md`, `docs/platforms/antigravity.md`, `docs/platforms/openclaw.md`

- [ ] **Step 1: Add MCP conditions to codex.yaml**

Read `lib/rubrics/codex.yaml` and find the `7_runtime` category. Currently it has `agents.toml_exists`, `agents.toml_fields`, and `subagents.worker_role` but no MCP conditions.

Read `docs/platforms/codex.md` MCP section. Research confirms: `.mcp.json` and `config.toml [mcp]` both supported, `codex mcp add|remove|list` CLI commands.

Compare with `lib/rubrics/cursor.yaml` which has these MCP conditions as a pattern:
```yaml
- id: cursor.7_runtime.mcp.exists
  type: checkable
  component: mcp
  critical: false
  points: 1
  check: |
    Cursor uses mcp.json (no dot prefix); if file_exists(".mcp.json"):
      assert file_exists("mcp.json")
- id: cursor.7_runtime.mcp.no_resources
  type: checkable
  component: mcp
  critical: false
  points: 1
  check: |
    if file_exists("mcp.json"):
      for server in mcpServers: assert "resources" not in server
      (Cursor does not support MCP Resources)
```

Add equivalent Codex MCP conditions to `codex.yaml` under `7_runtime`, after the existing `subagents.worker_role` condition:

```yaml
    - id: codex.7_runtime.mcp.exists
      type: checkable
      component: mcp
      critical: false
      points: 1
      check: |
        if file_exists(".mcp.json"):
          assert valid_json(read(".mcp.json"))
          # Codex reads .mcp.json (same dot-prefixed name as Claude Code)
    - id: codex.7_runtime.mcp.config_toml
      type: judgement
      component: mcp
      critical: false
      points: 1
      check: |
        If plugin uses MCP servers, verify install documentation mentions
        both .mcp.json (portable) and config.toml [mcp_servers] (Codex-native)
        configuration paths.
```

- [ ] **Step 2: Fix gemini-cli.yaml hooks_path comment**

Read `lib/rubrics/gemini-cli.yaml` line 4. Current:
```yaml
hooks_path: null  # settings.json (user-configured, not file-based)
```

Research (`docs/platforms/gemini-cli.md`) confirms hooks can be in:
1. User `settings.json` under `hooks` object
2. Extension manifest (`gemini-extension.json`) `hooks` field

Update the comment:
```yaml
hooks_path: null  # settings.json or extension manifest hooks field (not standalone file)
```

- [ ] **Step 3: Verify gemini-cli.yaml subagent conditions**

Read `lib/rubrics/gemini-cli.yaml`, find subagent conditions. Current:
```yaml
- id: gemini.5_toolmap.subagent_syntax.at_agent
  type: judgement
  critical: true
  check: |
    If any skills reference Task or Agent tool usage, verify Gemini
    equivalent (@agent-name syntax) is documented...
```

Research confirms: `@agent-name <task>` syntax, built-in agents (generalist, cli_help, codebase_investigator), custom agents in `agents/` directories.

**Verdict: Correct.** The condition checks the key requirement (documenting @agent-name). No change needed.

- [ ] **Step 4: Verify cursor.yaml subagent conditions**

Read `lib/rubrics/cursor.yaml`, find subagent conditions. Current:
```yaml
- id: cursor.5_toolmap.subagent_syntax.documented
  type: judgement
  critical: false
  check: |
    If any skills use Task or Agent tool invocations, verify
    Cursor-compatible invocation patterns documented...
```

Research confirms: Cursor uses same Task/Agent syntax as Claude Code (Table 2).

**Verdict: Correct.** The condition is minimal but accurate — Cursor doesn't need different syntax. No change needed.

- [ ] **Step 5: Verify antigravity.yaml workflow conditions**

Read `lib/rubrics/antigravity.yaml`, find workflow conditions under `7_runtime`. Current:
```yaml
- id: antigravity.7_runtime.workflows.exist
  type: checkable
  critical: false
  check: |
    if dir_exists(".agents/workflows/"):
      workflows = glob(".agents/workflows/*")
      assert len(workflows) > 0
```

Research (`docs/platforms/antigravity.md`) confirms: workflows in `.agents/workflows/` as Markdown format.

**Verdict: Correct.** No change needed.

- [ ] **Step 6: Verify openclaw.yaml context file conditions**

Read `lib/rubrics/openclaw.yaml` header. Current: `context_files: [AGENTS.md]`.

Research (`docs/platforms/openclaw.md`) lists 7+ context files: AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md, USER.md, HEARTBEAT.md, MEMORY.md, BOOTSTRAP.md. However, these are auto-injected from `~/.openclaw/workspace/` (user workspace files), not plugin-provided files. A portable plugin only needs to generate `AGENTS.md`.

**Verdict: Correct.** The rubric correctly checks only AGENTS.md for plugin output. No change needed.

- [ ] **Step 7: Fix openclaw.yaml hook event names condition**

Read `lib/rubrics/openclaw.yaml`, find hook conditions. Current condition `openclaw.4_hooks.event_names.openclaw_names` references:
```
before_tool_call, tool_result_persist, gateway:startup, session:compact:before
```

This only lists 4 events. The openclaw-tools.md was expanded in Tier 1 to 15 events. Update the condition's event list to reference the full set or point to `lib/references/openclaw-tools.md` as the authoritative list.

Edit the condition check text to say:
```
If hook guidance exists, verify it uses correct OpenClaw snake_case event
names from LOOKUP["hook_events"]["openclaw"] (see lib/references/openclaw-tools.md
for full 15-event list): before_tool_call, after_tool_call, tool_result_persist,
llm_input, llm_output, message_received, message_sent, before_agent_finalize,
agent_end, before_model_resolve, before_compaction, after_compaction,
before_install, command, gateway:startup
```

- [ ] **Step 8: Commit rubric fixes**

```bash
git add lib/rubrics/codex.yaml lib/rubrics/gemini-cli.yaml lib/rubrics/openclaw.yaml
git commit -m "fix: rubric YAMLs — add Codex MCP conditions, update Gemini hooks comment, expand OpenClaw events"
```

---

### Task 2: Verify rubric-framework.md

**Files:**
- Read: `lib/rubrics/rubric-framework.md`

- [ ] **Step 1: Verify 7 category definitions**

Read `lib/rubrics/rubric-framework.md` category table. Current 7 categories:

| # | Category | What it measures |
|---|----------|-----------------|
| 1 | Manifest Packaging | Platform manifest present, correct schema, fields |
| 2 | Skill Compatibility | Skills discoverable, frontmatter correct, no unresolved tools |
| 3 | Context Delivery | Platform context file present, accurate, includes all skills |
| 4 | Hook Portability | Hooks adapted to platform format, correct event names |
| 5 | Tool Mapping | Sidecars, tool name translation, subagent communication |
| 6 | Install Readiness | Install docs exist, match structure, verification steps |
| 7 | Runtime Adapters | MCP, agents, commands, rules, policies |

Cross-check against research: do any platforms have capabilities that fall outside these 7 categories?

- Manifests ✓ (all platforms have some manifest)
- Skills ✓ (all platforms support SKILL.md)
- Context files ✓ (CLAUDE.md, AGENTS.md, GEMINI.md)
- Hooks ✓ (file-based, settings-based, SDK-based)
- Tool mapping ✓ (different tool names per platform)
- Install docs ✓ (different install methods)
- Runtime ✓ (MCP, agents, workflows, commands)

**Verdict: Correct.** Categories are comprehensive. No change needed.

---

### Task 3: Fix hook-merging.md Cursor matcher handling

**Files:**
- Modify: `lib/patterns/hook-merging.md`
- Read: `docs/platforms/cursor.md`

- [ ] **Step 1: Read current Cursor hook generation pseudocode**

Read `lib/patterns/hook-merging.md`, find the `GENERATE_CURSOR_HOOKS` function. The current pseudocode generates each Cursor hook entry as:
```
{ "command": entry.command }
```

This drops the `matcher` field from the source Claude hooks.

- [ ] **Step 2: Verify Cursor supports matchers**

Read `docs/platforms/cursor.md` lines 386-427. Research confirms:
- `matcher` is a valid per-script option (line 395): "Pipe-delimited filter pattern"
- Matchers have event-specific semantics (lines 413-426): preToolUse matches tool type, beforeShellExecution matches command string, etc.

Cursor DOES support matchers. The generation pseudocode should carry them over.

- [ ] **Step 3: Fix the pseudocode**

Find the line in `GENERATE_CURSOR_HOOKS` that builds the cursor entry object. Change from:
```
append { "command": entry.command }
```

To:
```
cursor_entry = { "command": entry.command }
IF entry has matcher:
  cursor_entry["matcher"] = entry.matcher
append cursor_entry
```

Also find any comment or note that says Cursor doesn't support matchers and remove or correct it.

- [ ] **Step 4: Commit**

```bash
git add lib/patterns/hook-merging.md
git commit -m "fix: hook-merging — Cursor hooks support matchers, carry over from source"
```

---

### Task 4: Verify manifest-generation.md

**Files:**
- Read: `lib/patterns/manifest-generation.md`
- Read: `docs/platforms/codex.md`

- [ ] **Step 1: Verify Codex manifest fields**

Read `lib/patterns/manifest-generation.md` codex-plugin section. Current:
- Target: `.codex-plugin/plugin.json`
- Template: `lib/templates/manifests/codex-plugin/plugin.json.tmpl`

Read `docs/platforms/codex.md` manifest section. Research confirms `.codex-plugin/plugin.json` with required fields: name, version, description.

**Verdict: Correct.** No change needed.

- [ ] **Step 2: Verify all template references exist**

Check each template path referenced in manifest-generation.md:

```bash
for tmpl in \
  lib/templates/manifests/claude-plugin/plugin.json.tmpl \
  lib/templates/manifests/claude-plugin/marketplace.json.tmpl \
  lib/templates/context-files/CLAUDE.md.tmpl \
  lib/templates/manifests/cursor-plugin/plugin.json.tmpl \
  lib/templates/manifests/cursor-plugin/marketplace.json.tmpl \
  lib/templates/manifests/gemini-extension.json.tmpl \
  lib/templates/context-files/GEMINI.md.tmpl \
  lib/templates/context-files/AGENTS.md.tmpl \
  lib/templates/manifests/codex-plugin/plugin.json.tmpl \
  lib/templates/manifests/codex-plugin/marketplace.json.tmpl; do
  [ -f "$tmpl" ] && echo "OK: $tmpl" || echo "MISSING: $tmpl"
done
```

If any are missing, note in report but don't create them (Tier 3 scope).

**Verdict: Expected correct.** No change needed to manifest-generation.md itself.

---

### Task 5: Verify detection, bootstrapping, and inventory patterns

**Files:**
- Read: `lib/patterns/detection-algorithm.md`, `lib/patterns/bootstrapping.md`, `lib/patterns/inventory.md`
- Read: All `docs/platforms/*.md` as needed

- [ ] **Step 1: Verify detection-algorithm.md signal paths**

Read `lib/patterns/detection-algorithm.md`, find SCAN_METADATA_SOURCES. Verify each platform manifest path:

| Platform | Detection path | Research says | Match? |
|----------|---------------|---------------|--------|
| Claude | `.claude-plugin/plugin.json` | `.claude-plugin/plugin.json` | ✓ |
| Cursor | `.cursor-plugin/plugin.json` | `.cursor-plugin/plugin.json` | ✓ |
| Codex | `.codex-plugin/plugin.json` | `.codex-plugin/plugin.json` | ✓ |
| Gemini | `gemini-extension.json` | `gemini-extension.json` | ✓ |
| Antigravity | `package.json` (optional) | No formal manifest | ✓ |
| OpenClaw | — (check if listed) | `openclaw.plugin.json` | Verify |

Check if `openclaw.plugin.json` is in the detection algorithm's source list. If missing, it should be added.

- [ ] **Step 2: Verify bootstrapping.md hook output format**

Read `lib/patterns/bootstrapping.md`, find the platform branching in session-start script. Current:
```bash
if [ -n "${CURSOR_PLUGIN_ROOT:-}" ]; then
  # outputs additional_context (snake_case)
elif [ -n "${CLAUDE_PLUGIN_ROOT:-}" ]; then
  # outputs hookSpecificOutput.additionalContext (nested)
else
  # outputs additionalContext (top-level)
fi
```

Verify against research:
- Cursor `additional_context`: Confirmed by cursor-tools.md (verified Tier 1)
- Claude Code `hookSpecificOutput.additionalContext`: Confirmed by claude-code.md line 336
- Codex: Same JSON protocol as Claude Code — but Codex doesn't set `$CLAUDE_PLUGIN_ROOT`, so falls into "else" branch. Research says Codex uses "same JSON protocol" but doesn't explicitly confirm the output key. The else branch outputs `additionalContext` (top-level), which may or may not be correct for Codex.

**Verdict: Correct for Cursor and Claude Code.** The Codex output key is unverifiable from current research (falls into else branch which outputs top-level `additionalContext`). Note in matrix.

- [ ] **Step 3: Verify inventory.md skill discovery paths**

Read `lib/patterns/inventory.md`, find skill discovery logic. Verify:

| Platform | Discovery glob | Research says | Match? |
|----------|---------------|---------------|--------|
| All (standard) | `skills/*/SKILL.md` | Claude, Cursor, Gemini, OpenClaw | ✓ |
| Codex | `.agents/skills/*/SKILL.md` | `.agents/skills/` | ✓ |
| Antigravity | `.agents/skills/*/SKILL.md` + `.agent/skills/*/SKILL.md` | Both paths confirmed | ✓ |

**Verdict: Correct.** No change needed.

---

### Task 6: Update reconciliation matrix

**Files:**
- Modify: `docs/reconciliation-matrix.md`

- [ ] **Step 1: Update all section 2 (Rubrics) statuses**

| Item | New status |
|------|-----------|
| codex.yaml MCP conditions | `Fixed` — added MCP conditions |
| gemini-cli.yaml hooks_path | `Fixed` — updated comment |
| gemini-cli.yaml subagent conditions | `Correct` — @agent-name condition exists |
| cursor.yaml subagent conditions | `Correct` — documented condition exists |
| antigravity.yaml workflow conditions | `Correct` — .agents/workflows/ confirmed |
| openclaw.yaml context file conditions | `Correct` — AGENTS.md correct for plugin output |
| rubric-framework.md category definitions | `Correct` — 7 categories comprehensive |

- [ ] **Step 2: Update all section 3 (Patterns) statuses**

| Item | New status |
|------|-----------|
| hook-merging.md Cursor format | `Fixed` — matchers now carried over |
| manifest-generation.md Codex fields | `Correct` — fields match research |
| manifest-generation.md template refs | `Correct` — all templates verified |
| detection-algorithm.md signals | `Correct` (verify OpenClaw path) |
| bootstrapping.md hook output | `Correct` — Cursor and Claude verified; Codex output key unverifiable |
| inventory.md skill paths | `Correct` — all paths match research |

- [ ] **Step 3: Add Tier 2 summary subsection**

After the "Fixed (Tier 1)" section, add:

```markdown
### Fixed (Tier 2 — rubrics/patterns verification)

23. ~~**codex.yaml**: No MCP conditions~~ Fixed — added mcp.exists and mcp.config_toml
24. ~~**gemini-cli.yaml**: hooks_path comment missing extension manifest~~ Fixed
25. ~~**openclaw.yaml**: Hook event names condition listed only 4 events~~ Fixed — references full 15-event list
26. ~~**hook-merging.md**: Cursor hook generation dropped matchers~~ Fixed — matchers now carried over
```

- [ ] **Step 4: Verify no "Needs review" in sections 2 and 3**

```bash
sed -n '/^## 2\. Rubrics/,/^## 4\. Templates/p' docs/reconciliation-matrix.md | grep -c "Needs review"
```

Expected: `0`

- [ ] **Step 5: Commit**

```bash
git add docs/reconciliation-matrix.md
git commit -m "fix: reconciliation matrix — resolve all Tier 2 rubric/pattern verification items"
```

---

## Verification Checklist

After all tasks complete:

```bash
# No "Needs review" in sections 2 and 3
sed -n '/^## 2\. Rubrics/,/^## 4\. Templates/p' docs/reconciliation-matrix.md | grep "Needs review"
# Expected: no output

# Codex MCP conditions exist
grep "codex.7_runtime.mcp" lib/rubrics/codex.yaml
# Expected: 2 matches

# Gemini hooks_path comment updated
grep "hooks_path" lib/rubrics/gemini-cli.yaml
# Expected: mentions "extension manifest"

# Cursor matchers in hook-merging
grep -i "matcher" lib/patterns/hook-merging.md | head -5
# Expected: includes matcher carry-over logic

# All template files exist
ls lib/templates/manifests/*/plugin.json.tmpl lib/templates/manifests/gemini-extension.json.tmpl lib/templates/context-files/*.tmpl 2>/dev/null | wc -l
# Expected: 7+
```
