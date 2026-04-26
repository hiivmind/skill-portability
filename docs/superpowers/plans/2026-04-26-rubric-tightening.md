# Rubric Tightening & Condition-Linked Uplift — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace prose-based rubrics with structured YAML conditions linked to lookup tables, wire uplift actions to condition IDs via `# fixes:` annotations, and switch the platform set to Claude Code / Codex / Cursor / Gemini / Antigravity / OpenClaw.

**Architecture:** A single canonical lookup tables file (`lib/references/platform-mappings.md`) feeds into 6 platform rubric YAML files (`lib/patterns/platforms/*.yaml`). Each YAML condition has a stable ID, type (checkable/judgement), critical flag, and pseudocode check. The assessment skill evaluates conditions (JIT-generating scripts for checkable ones), the uplift skill references condition IDs via `# fixes:` annotations. The rubric framework document explains scoring formula and band calculation.

**Tech Stack:** Markdown, YAML, pseudocode. No runtime code — all logic is LLM-interpreted with JIT-scriptable checkable conditions.

**Spec:** `docs/superpowers/specs/2026-04-26-rubric-tightening-design.md`

---

## File Map

### New Files
| File | Responsibility |
|------|---------------|
| `lib/references/platform-mappings.md` | Canonical lookup tables (9 tables: model mapping, tool names, hook events, path variables, field stripping, manifest fields, hook format, skill dirs, agent formats) |
| `lib/patterns/platforms/claude-code.yaml` | Claude Code rubric — structured conditions |
| `lib/patterns/platforms/cursor.yaml` | Cursor rubric — structured conditions |
| `lib/patterns/platforms/gemini-cli.yaml` | Gemini CLI rubric — structured conditions |
| `lib/patterns/platforms/codex.yaml` | Codex rubric — structured conditions |
| `lib/patterns/platforms/antigravity.yaml` | Antigravity rubric — new platform |
| `lib/patterns/platforms/openclaw.yaml` | OpenClaw rubric — new platform |
| `lib/templates/manifests/antigravity/package.json.tmpl` | Antigravity manifest template |
| `lib/templates/manifests/openclaw/openclaw.plugin.json.tmpl` | OpenClaw manifest template |
| `lib/templates/install-docs/antigravity.md` | Antigravity install docs |
| `lib/templates/install-docs/openclaw.md` | OpenClaw install docs |
| `lib/templates/install-docs/adding-platform/antigravity.md` | Adding Antigravity section |
| `lib/templates/install-docs/adding-platform/openclaw.md` | Adding OpenClaw section |
| `lib/templates/install-docs/publishing/antigravity.md` | Antigravity publishing guide |
| `lib/templates/install-docs/publishing/openclaw.md` | OpenClaw publishing guide |

### Rewritten Files
| File | Nature of Change |
|------|-----------------|
| `lib/patterns/rubric-framework.md` | New scoring formula, condition types, N/A handling, percentage bands, blocker updates |
| `skills/assessing-plugin-portability/SKILL.md` | Reference condition IDs, JIT guidance, new platform set, new scoring |
| `skills/uplifting-a-plugin/SKILL.md` | `# fixes:` annotations, incremental uplift, new platform set, rubric-informed decisions |
| `skills/using-skill-portability/SKILL.md` | Updated platform list |

### Updated Files
| File | Nature of Change |
|------|-----------------|
| `lib/patterns/hook-merging.md` | Remove OpenCode/Copilot, add Antigravity/OpenClaw notes |
| `lib/patterns/bootstrapping.md` | Remove OpenCode/Copilot platform branches |
| `lib/patterns/detection-algorithm.md` | Add Antigravity/OpenClaw manifest detection, remove OpenCode/Copilot |
| `lib/patterns/manifest-generation.md` | New platform entries, remove dropped ones |
| `lib/patterns/injection-checks.md` | Remove OpenCode/Copilot checks |
| `lib/patterns/report-template.md` | Update platform list references |
| `lib/patterns/platforms/publishing-and-discoverability.md` | Add Antigravity/OpenClaw, remove OpenCode/Copilot |
| `lib/templates/context-files/AGENTS.md.tmpl` | Remove Copilot/OpenCode references |
| `lib/templates/hooks/session-start.sh` | Remove OpenCode/Copilot platform detection branches |

### Removed Files
| File | Reason |
|------|--------|
| `lib/patterns/platforms/opencode.md` | Platform dropped |
| `lib/patterns/platforms/copilot-cli.md` | Platform dropped |
| `lib/patterns/platforms/claude-code.md` | Replaced by .yaml |
| `lib/patterns/platforms/cursor.md` | Replaced by .yaml |
| `lib/patterns/platforms/gemini-cli.md` | Replaced by .yaml |
| `lib/patterns/platforms/codex.md` | Replaced by .yaml |
| `lib/references/copilot-tools.md` | Platform dropped |
| `lib/templates/manifests/opencode-plugin.js.tmpl` | Platform dropped |
| `lib/templates/manifests/package.json.tmpl` | Was OpenCode-specific |
| `lib/templates/context-files/copilot-instructions.md.tmpl` | Platform dropped |
| `lib/templates/install-docs/opencode.md` | Platform dropped |
| `lib/templates/install-docs/copilot-cli.md` | Platform dropped |
| `lib/templates/install-docs/adding-platform/opencode.md` | Platform dropped |
| `lib/templates/install-docs/adding-platform/copilot-cli.md` | Platform dropped |
| `lib/templates/install-docs/publishing/opencode.md` | Platform dropped |
| `lib/templates/install-docs/publishing/copilot-cli.md` | Platform dropped |
| `skills/*/references/copilot-tools.md` | Platform dropped (3 files) |

---

## Task 1: Create Canonical Lookup Tables

**Files:**
- Create: `lib/references/platform-mappings.md`

This is the foundation — every rubric condition and uplift action references these tables.

- [ ] **Step 1: Create platform-mappings.md with all 9 tables**

```markdown
# Platform Mappings

Canonical lookup tables for cross-platform plugin portability.
Referenced by rubric conditions (pseudocode `LOOKUP["table_name"]["platform"]`)
and by uplift templates (`{{! fixes: ... }}`).

---

## Table 1: Model Mapping

Maps Claude Code model shortnames to platform equivalents.

| Claude Model | Gemini | Codex | OpenClaw | Cursor | Antigravity |
|---|---|---|---|---|---|
| opus | gemini-2.5-pro | gpt-5.4 | anthropic/claude-opus-4-6 | inherit | (removed) |
| sonnet | gemini-2.5-flash | gpt-5.4-mini | anthropic/claude-sonnet-4-5 | inherit | (removed) |
| haiku | gemini-2.0-flash-lite | gpt-5.4-mini | anthropic/claude-haiku-4-5 | inherit | (removed) |

**Rules:**
- Cursor always uses `inherit` (defers to user's model selection)
- Antigravity strips the model field entirely
- Codex maps both sonnet and haiku to `gpt-5.4-mini`

---

## Table 2: Tool Name Mapping

Maps Claude Code tool names to platform equivalents.

| Claude Tool | Gemini | Codex | Cursor | Antigravity | OpenClaw |
|---|---|---|---|---|---|
| Read | read_file | (same) | (same) | (same) | (same) |
| Write | write_file | (same) | (same) | (same) | (same) |
| Edit | replace | (same) | (same) | (same) | (same) |
| Bash | run_shell_command | (same) | (same) | (same) | (same) |
| Grep | grep_search | (same) | (same) | (same) | (same) |
| Glob | list_files | (same) | (same) | (same) | (same) |
| Task | @agent-name | spawn_agent | (same) | (same) | agents.list[] |
| Agent | @agent-name | spawn_agent | (same) | (same) | agents.list[] |
| TodoWrite | (N/A) | update_plan | (same) | (same) | (N/A) |
| Skill | (N/A) | (N/A) | (same) | (same) | (N/A) |

**Rules:**
- `(same)` means the platform uses the same tool name as Claude Code
- Gemini has no Task/Agent tool — uses `@agent-name` syntax in prompts
- Codex replaces Task/Agent with `spawn_agent` and TodoWrite with `update_plan`
- OpenClaw manages agents via `agents.list[]` in runtime config, not a tool

---

## Table 3: Hook Event Mapping

Maps Claude Code hook events to platform equivalents.

| Claude Event | Cursor | Gemini | Codex | Antigravity | OpenClaw |
|---|---|---|---|---|---|
| SessionStart | sessionStart | SessionStart | N/A | N/A | gateway:startup (plugin SDK) |
| PreToolUse | preToolUse | BeforeTool | N/A | N/A | before_tool_call (plugin SDK) |
| PostToolUse | postToolUse | AfterTool | N/A | N/A | tool_result_persist (plugin SDK) |
| PostToolUseFailure | postToolUseFailure | (N/A) | N/A | N/A | N/A |
| SubagentStart | subagentStart | (N/A) | N/A | N/A | N/A |
| SubagentStop | subagentStop | (N/A) | N/A | N/A | N/A |
| PreCompact | preCompact | PreCompress | N/A | N/A | session:compact:before (plugin SDK) |
| Stop | stop | AfterAgent | N/A | N/A | N/A |
| UserPromptSubmit | beforeSubmitPrompt | (N/A) | N/A | N/A | N/A |

**Rules:**
- Codex and Antigravity have no hook systems
- Gemini hooks go in user `settings.json`, not repo files — generate guidance only
- OpenClaw hooks use TypeScript plugin SDK (`api.registerHook()`), not file-based config
- Cursor uses camelCase; Gemini uses PascalCase

---

## Table 4: Path Variable Mapping

Maps path variables used in hook scripts.

| Claude Variable | Cursor | Gemini | Codex | Antigravity | OpenClaw |
|---|---|---|---|---|---|
| `${CLAUDE_PLUGIN_ROOT}` | `${CURSOR_PLUGIN_ROOT}` | `${extensionPath}${/}` | N/A | N/A | N/A |
| `/hooks/scripts/` | `/scripts/` | `/scripts/` | N/A | N/A | N/A |

---

## Table 5: Field Stripping Sets

Frontmatter fields to remove when converting from Claude Code.

| Field | Gemini | Codex | OpenClaw | Cursor | Antigravity |
|---|---|---|---|---|---|
| `disable-model-invocation` | strip | strip | strip | **keep** | strip |
| `allowed-tools` | strip | strip | strip | strip | strip |

**Rules:**
- Cursor keeps `disable-model-invocation` (supported natively)
- All platforms strip `allowed-tools` (Claude-specific)

---

## Table 6: Manifest Required Fields

Required fields per platform manifest.

| Platform | Manifest Path | Required Fields |
|---|---|---|
| Claude Code | `.claude-plugin/plugin.json` | name, version, description, author.name, author.email |
| Cursor | `.cursor-plugin/plugin.json` | name, displayName, description, version, author |
| Gemini | `gemini-extension.json` | name, version, description, contextFileName |
| Codex (native) | `.codex-plugin/plugin.json` | name, version, description |
| Antigravity | `package.json` | name, displayName, version, description, publisher |
| OpenClaw | `openclaw.plugin.json` | id, configSchema |

**Notes:**
- Antigravity: For skill-only distribution, no package.json is needed — drop into `.agents/skills/`
- OpenClaw: Full plugins also need `package.json` with `openclaw.extensions` and `openclaw.compat`
- Gemini: `contextFileName` is always `"GEMINI.md"`

---

## Table 7: Hook Format Rules

Platform-specific hook configuration rules.

| Rule | Claude Code | Cursor | Gemini | OpenClaw |
|---|---|---|---|---|
| Event name case | PascalCase | camelCase | PascalCase | snake_case (SDK) |
| Timeout unit | seconds | seconds | milliseconds | N/A (SDK-managed) |
| Async support | yes (optional) | no (strip) | no (strip) | yes (async handlers) |
| Structure | nested (matcher → hooks[]) | flat (matcher at hook level) | settings.json (user-configured) | `api.registerHook()` (TypeScript) |
| Output key | `hookSpecificOutput.additionalContext` | `additional_context` | N/A | return value from handler |

**Notes:**
- Codex and Antigravity have no hook systems — omitted from this table
- Gemini timeout conversion: multiply Claude seconds × 1000
- Cursor flattening: each nested hook becomes its own entry with matcher promoted

---

## Table 8: Skill Output Directory

Where skills and agents live per platform.

| Platform | Skills Path | Agents Path |
|---|---|---|
| Claude Code | `skills/` | `agents/` |
| Cursor | `skills/` | `agents/` |
| Gemini | `skills/` | `agents/` |
| Codex | `.agents/skills/` | `.codex/agents/` |
| Antigravity | `.agents/skills/` (preferred) or `.agent/skills/` (legacy) | `.agent/rules/` |
| OpenClaw | `skills/` | in manifest `agents.list[]` |

---

## Table 9: Agent Output Format

How agents are represented per platform.

| Platform | Format | Model Field | Tools Field |
|---|---|---|---|
| Claude Code | Markdown (`agents/*.md`) | Claude model name | Claude tool names |
| Cursor | Markdown (`agents/*.md`) + `.mdc` rule | `inherit` | stripped |
| Gemini | Markdown (`agents/*.md`) | Gemini model name | `["*"]` (wildcard) |
| Codex | TOML (`.codex/agents/*.toml`) | Codex model name | stripped |
| Antigravity | Combined `AGENTS.md` + `.agent/rules/*.md` | (removed) | (removed) |
| OpenClaw | Listed in manifest `agents.list[]` | OpenClaw `provider/model` | stripped |
```

- [ ] **Step 2: Verify the file renders correctly**

Run: `wc -l lib/references/platform-mappings.md`
Expected: ~160-170 lines

- [ ] **Step 3: Commit**

```bash
git add lib/references/platform-mappings.md
git commit -m "feat: add canonical platform lookup tables

Single reference file with 9 tables: model mapping, tool names, hook events,
path variables, field stripping, manifest fields, hook format, skill dirs,
agent formats. Referenced by rubric conditions and uplift templates."
```

---

## Task 2: Rewrite Rubric Framework

**Files:**
- Rewrite: `lib/patterns/rubric-framework.md`

Replace the current prose-based framework (95 lines) with the new structured system: condition types, hybrid scoring formula, percentage-based bands, N/A handling.

- [ ] **Step 1: Rewrite rubric-framework.md**

```markdown
# Rubric Framework

Shared scoring model for plugin portability assessment. Used by `assessing-plugin-portability`.
Per-platform conditions are in `platforms/<platform>.yaml`.
Lookup tables are in `lib/references/platform-mappings.md`.

---

## Condition Structure

Each condition in a platform rubric YAML file:

```yaml
- id: {platform}.{category_num}_{category_short}.{component}.{check_name}
  type: checkable | judgement
  component: {component_tag}
  critical: true | false
  points: 1
  check: |
    pseudocode (checkable) or prose description (judgement)
  template: optional — path to template that fixes this condition
```

### Condition ID Format

```
{platform}.{category_num}_{category_short}.{component}.{check_name}
```

Examples:
```
cursor.1_manifest.plugin_json.required_fields
gemini.5_toolmap.sidecar.task_to_at_agent
codex.2_skills.frontmatter.spawn_agent_documented
```

### Condition Types

| Type | Meaning | Evaluation |
|------|---------|------------|
| `checkable` | Deterministic — file exists, field matches table, pattern present | LLM generates a read-only script from pseudocode, executes it, records pass/fail from exit code |
| `judgement` | Requires interpretation — content quality, documentation adequacy | LLM reads referenced files, applies its interpretation, records pass/fail with reasoning |

### Condition Fields

| Field | Required | Purpose |
|-------|----------|---------|
| `id` | yes | Stable identifier. Referenced by assessment AND uplift (`# fixes:` annotations) |
| `type` | yes | `checkable` or `judgement` |
| `component` | yes | Tag for filtering by component type within a category |
| `critical` | yes | If `true`, gates score levels (must pass for Score 2+) |
| `points` | yes | Weight within category (typically 1) |
| `check` | yes | Pseudocode block (checkable) or prose description (judgement) |
| `template` | no | Path to template in `lib/templates/` that resolves this condition |

---

## Scoring Scale

Seven categories per platform, each scored 0-3.

### Category List

| # | Category | What it measures | Component Tags |
|---|----------|-----------------|---------------|
| 1 | Manifest Packaging | Platform manifest present, correct schema, complete fields | `plugin_json`, `marketplace_json`, `extension_json`, `package_json`, `openclaw_json` |
| 2 | Skill Compatibility | Skills discoverable, frontmatter correct, no unresolved tool assumptions | `frontmatter`, `discovery`, `tool_refs` |
| 3 | Context Delivery | Platform context file present, accurate, includes all skills | `claude_md`, `agents_md`, `gemini_md`, `rules_mdc` |
| 4 | Hook Portability | Hooks adapted to platform format, correct event names, cross-platform scripts | `hooks_json`, `scripts`, `event_names`, `output_format` |
| 5 | Tool Mapping | Sidecars, tool name translation, subagent communication | `sidecar`, `model_mapping`, `subagent_syntax` |
| 6 | Install Readiness | Install docs exist, match actual structure, include verification steps | `install_docs`, `publishing`, `verification` |
| 7 | Runtime Adapters | MCP, agents, commands, rules, policies, marketplace | `mcp`, `agents`, `commands`, `rules`, `policies`, `subagents` |

### Scoring Formula

Per category, per platform:

```pseudocode
critical_count  = number of conditions where critical == true
optional_count  = number of conditions where critical == false
critical_pass   = number of critical conditions that pass
optional_pass   = number of optional conditions that pass

# Guard: every scored category MUST have at least 1 critical condition.
# If a category has 0 critical conditions, it scores N/A (see below).

IF critical_pass == critical_count:
  IF optional_count == 0 OR optional_pass / optional_count >= 0.75:
    score = 3
  ELSE:
    score = 2
ELIF critical_pass / critical_count >= 0.50:
  score = 1
ELSE:
  score = 0
```

**Edge cases:**
- Category with 0 critical conditions → N/A (prevents vacuous truth inflation)
- Category with 0 total conditions → N/A
- `optional_count == 0` and all critical pass → Score 3
- `critical_count == 1` → binary: Score 2+ (passes) or Score 0 (fails)

---

## Bands

```pseudocode
scored_categories = [c for c in categories if c.score != N/A]
scored_count      = len(scored_categories)
actual_score      = sum(c.score for c in scored_categories)
max_score         = scored_count * 3
percentage        = actual_score / max_score

IF scored_count < 3:
  band = min(band, "partial")  # Cap: too few categories to claim Strong/Viable

IF percentage >= 0.85: band = "strong"
ELIF percentage >= 0.60: band = "viable"
ELIF percentage >= 0.35: band = "partial"
ELSE: band = "weak"
```

| Band | Percentage | Interpretation |
|------|-----------|----------------|
| Strong | >= 85% | Platform fully supported |
| Viable | >= 60% | Moderate gaps, straightforward to complete |
| Partial | >= 35% | Significant work needed |
| Weak | < 35% | Minimal or no support |

---

## Blocker Detection

Blockers override raw scores. A repo with a decent score may still have one critical structural problem.

| Blocker | Severity | Detection |
|---------|----------|-----------|
| No trustworthy metadata source | Critical | All metadata fields from hard fallbacks only |
| Unresolved tool assumptions | Major | Skill references platform-specific tools with no sidecar in `references/` |
| Hook env hard-coding | Major | Hook scripts reference `CLAUDE_PLUGIN_ROOT` without env branching |
| Docs/structure mismatch | Major | Install docs describe paths that don't exist in repo |
| Whole-repo assumption | Minor | Repo requires whole-repo install but only documents single-skill copying |
| Missing subagent translation | Minor | Skills dispatch via `Task`/`Agent` but no codex-tools or gemini-tools sidecar |
| Gemini import gaps | Minor | `GEMINI.md` exists but missing `@` includes for some skills |

---

## JIT Code Generation

When evaluating checkable conditions, the LLM may generate a read-only script
from the condition's pseudocode and execute it, rather than manually interpreting
each check. The pseudocode operations (`read_json`, `file_exists`,
`parse_frontmatter`, `glob`) map to read-only filesystem queries.

This skill is used by plugin authors on their own repos. JIT scripts are
read-only checks — they do not modify files or access paths outside the
plugin root.

---

## Report Format

The assessment report must include all of these sections:

1. Repo shape classification
2. Canonical metadata source with extracted fields
3. Per-platform scores (7 categories each, with individual condition pass/fail)
4. Blockers with severity
5. Uplift recommendation (skill-first, full-portable-plugin, or curated-note-only)
6. Codex-specific recommendation (native-skill-discovery or native-plugin-packaging)
7. Required uplift artifacts list (mapped to condition IDs)
8. Session-start injection status

---

## Uplift Linkage

### `# fixes:` Annotations

Every uplift action (template rendering, hook porting, sidecar creation) carries
a `# fixes:` annotation linking it to the condition IDs it resolves.

### Drift Detection

```pseudocode
rubric_ids  = collect all condition IDs from lib/patterns/platforms/*.yaml
uplift_ids  = collect all "fixes:" references from skills/uplifting-a-plugin/
template_ids = collect all "fixes:" references from lib/templates/

orphan_conditions = rubric_ids - (uplift_ids | template_ids)
phantom_fixes     = (uplift_ids | template_ids) - rubric_ids
```

### Incremental Uplift

When assessment shows a platform already VIABLE (>= 60%), uplift only fixes
failing conditions instead of regenerating all artifacts.
```

- [ ] **Step 2: Verify line count is reasonable**

Run: `wc -l lib/patterns/rubric-framework.md`
Expected: ~180-200 lines (was 95)

- [ ] **Step 3: Commit**

```bash
git add lib/patterns/rubric-framework.md
git commit -m "feat: rewrite rubric framework with structured conditions and hybrid scoring

Replaces prose scoring with condition ID schema, checkable/judgement types,
hybrid AND/OR formula, percentage-based bands, N/A handling, and JIT guidance."
```

---

## Task 3: Write Claude Code Platform Rubric (YAML)

**Files:**
- Create: `lib/patterns/platforms/claude-code.yaml`
- Remove: `lib/patterns/platforms/claude-code.md`

Claude Code is the reference platform — it has the most components and no tool translation needed.

- [ ] **Step 1: Create claude-code.yaml**

Write the full YAML rubric with all 7 categories. Claude Code has conditions in all 7 categories. Key characteristics:
- Manifest: `.claude-plugin/plugin.json` + `marketplace.json`
- Skills: standard `skills/*/SKILL.md`, no field stripping needed (reference platform)
- Context: `CLAUDE.md`
- Hooks: `hooks/hooks.json`, PascalCase events, nested structure
- Tool mapping: no sidecar needed (Claude is the reference), but tools should match built-in set
- Install: `/plugin install` marketplace + local `claude --plugin-dir`
- Runtime: `.mcp.json`, `agents/*.md`, deprecated `commands/`

Each condition must have: `id`, `type`, `component`, `critical`, `points`, `check`, and optional `template`.

Reference the spec Section 3 "Per-Platform Differences" for Claude Code specifics. Use `LOOKUP["table_name"]["claude-code"]` in pseudocode to reference platform-mappings.md tables.

Target: ~25-30 conditions across 7 categories.

- [ ] **Step 2: Validate YAML syntax**

Run: `python3 -c "import yaml; yaml.safe_load(open('lib/patterns/platforms/claude-code.yaml'))" && echo "VALID"`
Expected: VALID

- [ ] **Step 3: Remove old prose rubric**

```bash
git rm lib/patterns/platforms/claude-code.md
```

- [ ] **Step 4: Commit**

```bash
git add lib/patterns/platforms/claude-code.yaml
git commit -m "feat: replace Claude Code prose rubric with structured YAML conditions

~28 conditions across 7 categories. Each condition has stable ID, type
(checkable/judgement), critical flag, and pseudocode check referencing
platform-mappings.md lookup tables."
```

---

## Task 4: Write Cursor Platform Rubric (YAML)

**Files:**
- Create: `lib/patterns/platforms/cursor.yaml`
- Remove: `lib/patterns/platforms/cursor.md`

Cursor is the most feature-rich target platform — skills, agents, commands, rules (.mdc), hooks (camelCase, flat), MCP (no Resources).

- [ ] **Step 1: Create cursor.yaml**

Use the full Cursor rubric from the spec (Design Section 3) as the reference. All 7 categories have conditions. Key specifics:
- Manifest: `.cursor-plugin/plugin.json` with conditional keys (omit agents/commands/hooks if dirs missing)
- Skills: standard path, strip only `allowed-tools` (keep `disable-model-invocation`)
- Context: `AGENTS.md` + `.cursor/rules/*.mdc` with `alwaysApply: true` frontmatter
- Hooks: `hooks/hooks-cursor.json`, camelCase events, flat structure (no nested hooks[]), `additional_context` output
- Tool mapping: model must be `inherit`, no Claude model names leaked
- Runtime: `mcp.json` (no dot prefix, no MCP Resources), agents with `model: inherit`

Target: ~30 conditions.

- [ ] **Step 2: Validate YAML syntax**

Run: `python3 -c "import yaml; yaml.safe_load(open('lib/patterns/platforms/cursor.yaml'))" && echo "VALID"`
Expected: VALID

- [ ] **Step 3: Remove old prose rubric**

```bash
git rm lib/patterns/platforms/cursor.md
```

- [ ] **Step 4: Commit**

```bash
git add lib/patterns/platforms/cursor.yaml
git commit -m "feat: replace Cursor prose rubric with structured YAML conditions

~30 conditions covering all 7 categories including .mdc rules, flat hook
structure, conditional manifest keys, and MCP (no Resources) constraints."
```

---

## Task 5: Write Gemini CLI Platform Rubric (YAML)

**Files:**
- Create: `lib/patterns/platforms/gemini-cli.yaml`
- Remove: `lib/patterns/platforms/gemini-cli.md`

Gemini has unique requirements: `@` includes in GEMINI.md, `gemini-tools.md` sidecar per skill, `Task` → `@agent-name`, commands as `.toml`, policies as `.toml`.

- [ ] **Step 1: Create gemini-cli.yaml**

Key specifics:
- Manifest: `gemini-extension.json` with `contextFileName: "GEMINI.md"`, lowercase-dash name
- Skills: standard path, strip `disable-model-invocation` and `allowed-tools`
- Context: `GEMINI.md` with `@` includes for EVERY skill SKILL.md AND its `references/gemini-tools.md`
- Hooks: Category 4 has fewer checkable conditions — hooks go in user `settings.json`, generate guidance only
- Tool mapping: CRITICAL — `gemini-tools.md` sidecar required, `Task` → `@agent-name`
- Runtime: `agents/*.md`, `commands/*.toml`, `policies/*.toml`

Category 4 (hooks) will have fewer conditions than other platforms since Gemini hooks are settings-based, not file-based. Most hook conditions will be `type: judgement`.

Target: ~25 conditions.

- [ ] **Step 2: Validate YAML syntax**

Run: `python3 -c "import yaml; yaml.safe_load(open('lib/patterns/platforms/gemini-cli.yaml'))" && echo "VALID"`
Expected: VALID

- [ ] **Step 3: Remove old prose rubric**

```bash
git rm lib/patterns/platforms/gemini-cli.md
```

- [ ] **Step 4: Commit**

```bash
git add lib/patterns/platforms/gemini-cli.yaml
git commit -m "feat: replace Gemini CLI prose rubric with structured YAML conditions

~25 conditions. Critical: gemini-tools.md sidecar per skill, @ includes in
GEMINI.md, Task-to-@agent-name translation, contextFileName requirement."
```

---

## Task 6: Write Codex Platform Rubric (YAML)

**Files:**
- Create: `lib/patterns/platforms/codex.yaml`
- Remove: `lib/patterns/platforms/codex.md`

Codex has a two-path system (skill-discovery vs native-plugin) and no hook system. Category 4 is N/A.

- [ ] **Step 1: Create codex.yaml**

Key specifics:
- Manifest: Two paths — skill-discovery (AGENTS.md + `.codex/INSTALL.md`) vs native (`.codex-plugin/plugin.json` + `marketplace.json`). Conditions should check for the chosen path.
- Skills: `.agents/skills/*/SKILL.md` path, `codex-tools.md` sidecar required, `spawn_agent` replaces Task, `update_plan` replaces TodoWrite
- Context: `AGENTS.md`
- Hooks: N/A — Category 4 has zero conditions. Hook scripts copied as standalone utilities only.
- Tool mapping: CRITICAL — `codex-tools.md` must document spawn_agent and update_plan
- Runtime: `.codex/agents/*.toml` with TOML-specific validation

Target: ~20 conditions (fewer due to N/A hooks category).

- [ ] **Step 2: Validate YAML syntax**

Run: `python3 -c "import yaml; yaml.safe_load(open('lib/patterns/platforms/codex.yaml'))" && echo "VALID"`
Expected: VALID

- [ ] **Step 3: Remove old prose rubric**

```bash
git rm lib/patterns/platforms/codex.md
```

- [ ] **Step 4: Commit**

```bash
git add lib/patterns/platforms/codex.yaml
git commit -m "feat: replace Codex prose rubric with structured YAML conditions

~20 conditions. Hooks category is N/A. Two-path manifest system.
Critical: codex-tools.md sidecar with spawn_agent/update_plan mapping."
```

---

## Task 7: Write Antigravity Platform Rubric (YAML)

**Files:**
- Create: `lib/patterns/platforms/antigravity.yaml`

New platform. Google VS Code fork. No hooks. Skills in `.agents/skills/` (preferred) or `.agent/skills/` (legacy). Context priority: GEMINI.md > AGENTS.md > `.agent/rules/`.

- [ ] **Step 1: Create antigravity.yaml**

Key specifics:
- Manifest: `package.json` with displayName, publisher for OpenVSX extension distribution. Skill-only plugins need no manifest.
- Skills: `.agents/skills/*/SKILL.md` (preferred) or `.agent/skills/*/SKILL.md` (legacy, still supported). Strip `disable-model-invocation`, `allowed-tools`. Strip model field entirely.
- Context: GEMINI.md (highest user priority) > AGENTS.md > `.agent/rules/*.md`
- Hooks: N/A — no hook system
- Tool mapping: model field removed entirely, tools same as Claude
- Install: OpenVSX registry (`antigravity --install-extension`) for extensions, direct directory copy for skills
- Runtime: `.agent/rules/*.md`, `.agents/workflows/` for slash commands

Categories 4 (Hooks) is N/A. Target: ~18 conditions.

- [ ] **Step 2: Validate YAML syntax**

Run: `python3 -c "import yaml; yaml.safe_load(open('lib/patterns/platforms/antigravity.yaml'))" && echo "VALID"`
Expected: VALID

- [ ] **Step 3: Commit**

```bash
git add lib/patterns/platforms/antigravity.yaml
git commit -m "feat: add Antigravity platform rubric (new platform)

~18 conditions. Google VS Code fork. No hooks (N/A). Skills in .agents/skills/
(preferred) or .agent/skills/ (legacy). Context priority: GEMINI.md > AGENTS.md."
```

---

## Task 8: Write OpenClaw Platform Rubric (YAML)

**Files:**
- Create: `lib/patterns/platforms/openclaw.yaml`

New platform. TypeScript gateway. Plugin SDK hooks (not file-based). Auto-detects Claude/Codex/Cursor bundles.

- [ ] **Step 1: Create openclaw.yaml**

Key specifics:
- Manifest: `openclaw.plugin.json` with `id` + `configSchema` (required). Full plugins also need `package.json` with `openclaw` block.
- Skills: standard `skills/*/SKILL.md`. Strip `disable-model-invocation`, `allowed-tools`.
- Context: `AGENTS.md`
- Hooks: Category 4 has conditions but they're mostly `type: judgement` since hooks use TypeScript plugin SDK (`api.registerHook()`). Check for `before_tool_call` and `tool_result_persist` documentation/guidance.
- Tool mapping: model uses `provider/model` format (e.g., `anthropic/claude-opus-4-6`)
- Install: ClawHub, npm, or local `plugins.load.paths`
- Runtime: `agents.list[]` in config (not manifest), bundle auto-detection noted

Target: ~18 conditions.

- [ ] **Step 2: Validate YAML syntax**

Run: `python3 -c "import yaml; yaml.safe_load(open('lib/patterns/platforms/openclaw.yaml'))" && echo "VALID"`
Expected: VALID

- [ ] **Step 3: Commit**

```bash
git add lib/patterns/platforms/openclaw.yaml
git commit -m "feat: add OpenClaw platform rubric (new platform)

~18 conditions. TypeScript gateway with plugin SDK hooks. Dual manifest
(openclaw.plugin.json + package.json). Bundle auto-detection noted."
```

---

## Task 9: Remove Dropped Platform Files

**Files:**
- Remove: `lib/patterns/platforms/opencode.md`
- Remove: `lib/patterns/platforms/copilot-cli.md`
- Remove: `lib/references/copilot-tools.md`
- Remove: `lib/templates/manifests/opencode-plugin.js.tmpl`
- Remove: `lib/templates/manifests/package.json.tmpl`
- Remove: `lib/templates/context-files/copilot-instructions.md.tmpl`
- Remove: `lib/templates/install-docs/opencode.md`
- Remove: `lib/templates/install-docs/copilot-cli.md`
- Remove: `lib/templates/install-docs/adding-platform/opencode.md`
- Remove: `lib/templates/install-docs/adding-platform/copilot-cli.md`
- Remove: `lib/templates/install-docs/publishing/opencode.md`
- Remove: `lib/templates/install-docs/publishing/copilot-cli.md`
- Remove: `skills/assessing-plugin-portability/references/copilot-tools.md`
- Remove: `skills/uplifting-a-plugin/references/copilot-tools.md`
- Remove: `skills/using-skill-portability/references/copilot-tools.md`

- [ ] **Step 1: Remove all OpenCode and Copilot files**

```bash
git rm lib/patterns/platforms/opencode.md \
  lib/patterns/platforms/copilot-cli.md \
  lib/references/copilot-tools.md \
  lib/templates/manifests/opencode-plugin.js.tmpl \
  lib/templates/manifests/package.json.tmpl \
  lib/templates/context-files/copilot-instructions.md.tmpl \
  lib/templates/install-docs/opencode.md \
  lib/templates/install-docs/copilot-cli.md \
  lib/templates/install-docs/adding-platform/opencode.md \
  lib/templates/install-docs/adding-platform/copilot-cli.md \
  lib/templates/install-docs/publishing/opencode.md \
  lib/templates/install-docs/publishing/copilot-cli.md \
  skills/assessing-plugin-portability/references/copilot-tools.md \
  skills/uplifting-a-plugin/references/copilot-tools.md \
  skills/using-skill-portability/references/copilot-tools.md
```

- [ ] **Step 2: Verify no remaining references to dropped platforms**

Run: `grep -rn "opencode\|copilot-cli\|copilot_cli\|OpenCode\|Copilot CLI" lib/ skills/ --include="*.md" --include="*.yaml" --include="*.tmpl" --include="*.sh" --include="*.json" | grep -v "superpowers/specs/" | grep -v "superpowers/plans/"`
Expected: No output (specs/plans may reference them historically — that's fine)

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: remove OpenCode and Copilot CLI platform files

Drops 15 files. Platform set is now: Claude Code, Codex, Cursor,
Gemini, Antigravity, OpenClaw."
```

---

## Task 10: Create Antigravity and OpenClaw Templates

**Files:**
- Create: `lib/templates/manifests/antigravity/package.json.tmpl`
- Create: `lib/templates/manifests/openclaw/openclaw.plugin.json.tmpl`
- Create: `lib/templates/install-docs/antigravity.md`
- Create: `lib/templates/install-docs/openclaw.md`
- Create: `lib/templates/install-docs/adding-platform/antigravity.md`
- Create: `lib/templates/install-docs/adding-platform/openclaw.md`
- Create: `lib/templates/install-docs/publishing/antigravity.md`
- Create: `lib/templates/install-docs/publishing/openclaw.md`

- [ ] **Step 1: Create Antigravity manifest template**

```json
{{! fixes: antigravity.1_manifest.package_json.required_fields }}
{
  "name": "{{name}}",
  "displayName": "{{displayName}}",
  "version": "{{version}}",
  "description": "{{description}}",
  "publisher": "{{author.name}}",
  "author": "{{author.name}}",
  "keywords": {{keywords}},
  "categories": ["AI", "Other"]
}
```

Write to `lib/templates/manifests/antigravity/package.json.tmpl`.

- [ ] **Step 2: Create OpenClaw manifest template**

```json
{{! fixes: openclaw.1_manifest.openclaw_json.required_fields }}
{
  "id": "{{name}}",
  "name": "{{displayName}}",
  "description": "{{description}}",
  "version": "{{version}}",
  "skills": {{skillsList}},
  "configSchema": {
    "type": "object",
    "properties": {},
    "additionalProperties": false
  }
}
```

Write to `lib/templates/manifests/openclaw/openclaw.plugin.json.tmpl`.

- [ ] **Step 3: Create Antigravity install docs**

Write `lib/templates/install-docs/antigravity.md` with:
- Skill-only install: copy to `.agents/skills/` (preferred) or `~/.gemini/antigravity/skills/` (global)
- Extension install: `antigravity --install-extension <file>.vsix` or OpenVSX registry
- Verification: check skill appears in conversation start listing

- [ ] **Step 4: Create OpenClaw install docs**

Write `lib/templates/install-docs/openclaw.md` with:
- ClawHub install: `openclaw plugins install {{name}}`
- npm install: `openclaw plugins install @org/openclaw-{{name}}`
- Local install: add to `plugins.load.paths` in `openclaw.json`
- Bundle auto-detection: note that `.claude-plugin/` layout may work without conversion
- Verification: check plugin loads in gateway logs

- [ ] **Step 5: Create adding-platform sections for both**

Write `lib/templates/install-docs/adding-platform/antigravity.md` and `openclaw.md` following the pattern of existing adding-platform files (see `adding-platform/cursor.md` as reference — ~9-15 lines each).

- [ ] **Step 6: Create publishing sections for both**

Write `lib/templates/install-docs/publishing/antigravity.md` (OpenVSX submission) and `openclaw.md` (ClawHub/npm publishing) following existing patterns (see `publishing/cursor.md` as reference — ~15-20 lines each).

- [ ] **Step 7: Commit**

```bash
git add lib/templates/manifests/antigravity/ lib/templates/manifests/openclaw/ \
  lib/templates/install-docs/antigravity.md lib/templates/install-docs/openclaw.md \
  lib/templates/install-docs/adding-platform/antigravity.md \
  lib/templates/install-docs/adding-platform/openclaw.md \
  lib/templates/install-docs/publishing/antigravity.md \
  lib/templates/install-docs/publishing/openclaw.md
git commit -m "feat: add Antigravity and OpenClaw templates

Manifest templates, install docs, adding-platform sections, and
publishing guides for both new platforms."
```

---

## Task 11: Annotate Existing Templates with `# fixes:` References

**Files:**
- Modify: `lib/templates/manifests/claude-plugin/plugin.json.tmpl`
- Modify: `lib/templates/manifests/claude-plugin/marketplace.json.tmpl`
- Modify: `lib/templates/manifests/cursor-plugin/plugin.json.tmpl`
- Modify: `lib/templates/manifests/cursor-plugin/marketplace.json.tmpl`
- Modify: `lib/templates/manifests/gemini-extension.json.tmpl`
- Modify: `lib/templates/manifests/codex-plugin/plugin.json.tmpl`
- Modify: `lib/templates/manifests/codex-plugin/marketplace.json.tmpl`
- Modify: `lib/templates/context-files/CLAUDE.md.tmpl`
- Modify: `lib/templates/context-files/AGENTS.md.tmpl`
- Modify: `lib/templates/context-files/GEMINI.md.tmpl`

- [ ] **Step 1: Add fixes annotations to each template**

Add a `{{! fixes: <condition_id> }}` comment as the first line of each template file, referencing the condition IDs it resolves. For example:

For `claude-plugin/plugin.json.tmpl`, add:
```
{{! fixes: claude.1_manifest.plugin_json.exists }}
{{! fixes: claude.1_manifest.plugin_json.required_fields }}
```

For `cursor-plugin/plugin.json.tmpl`, add:
```
{{! fixes: cursor.1_manifest.plugin_json.exists }}
{{! fixes: cursor.1_manifest.plugin_json.required_fields }}
{{! fixes: cursor.1_manifest.plugin_json.conditional_keys }}
```

For `gemini-extension.json.tmpl`, add:
```
{{! fixes: gemini.1_manifest.extension_json.exists }}
{{! fixes: gemini.1_manifest.extension_json.required_fields }}
```

For `CLAUDE.md.tmpl`, add:
```
{{! fixes: claude.3_context.claude_md.exists }}
```

For `AGENTS.md.tmpl`, add:
```
{{! fixes: cursor.3_context.agents_md.exists }}
{{! fixes: codex.3_context.agents_md.exists }}
{{! fixes: antigravity.3_context.agents_md.exists }}
{{! fixes: openclaw.3_context.agents_md.exists }}
```

For `GEMINI.md.tmpl`, add:
```
{{! fixes: gemini.3_context.gemini_md.exists }}
{{! fixes: gemini.3_context.gemini_md.at_includes }}
```

Also update `AGENTS.md.tmpl` to remove any Copilot/OpenCode references in its content.

Apply the same pattern to each remaining template — the exact condition IDs come from the YAML rubrics written in Tasks 3-8.

- [ ] **Step 2: Verify no template references a condition ID that doesn't exist in a rubric**

Run: `grep -roh 'fixes: [a-z]*\.[0-9]_[a-z]*\.[a-z_]*\.[a-z_]*' lib/templates/ | sort -u > /tmp/template_ids.txt && grep -roh 'id: [a-z]*\.[0-9]_[a-z]*\.[a-z_]*\.[a-z_]*' lib/patterns/platforms/*.yaml | sed 's/id: /fixes: /' | sort -u > /tmp/rubric_ids.txt && comm -23 /tmp/template_ids.txt /tmp/rubric_ids.txt`
Expected: No output (no phantom fixes)

- [ ] **Step 3: Commit**

```bash
git add lib/templates/
git commit -m "feat: annotate templates with fixes: condition ID references

Every template now declares which rubric conditions it resolves.
Enables drift detection via grep."
```

---

## Task 12: Rewrite Assessment Skill

**Files:**
- Rewrite: `skills/assessing-plugin-portability/SKILL.md`

The assessment skill needs to: reference the new YAML rubrics and condition IDs, use the new scoring formula, evaluate checkable vs judgement conditions differently, update the platform set, and include JIT guidance.

- [ ] **Step 1: Rewrite SKILL.md**

Key changes from the current 442-line skill:

**Frontmatter:** Update description to mention condition IDs and 6-platform set. Remove `copilot-tools.md` from references, update platform list.

**Phase 2 (Inventory):** Update manifest check list — replace `opencode` and `copilot-cli` entries with `antigravity` and `openclaw`:
```pseudocode
manifest_checks = [
  { platform: "claude-code",  path: ".claude-plugin/plugin.json" },
  { platform: "claude-code",  path: ".claude-plugin/marketplace.json" },
  { platform: "cursor",       path: ".cursor-plugin/plugin.json" },
  { platform: "gemini-cli",   path: "gemini-extension.json" },
  { platform: "gemini-cli",   path: "GEMINI.md" },
  { platform: "codex",        path: ".codex-plugin/plugin.json" },
  { platform: "codex",        path: ".agents/plugins/marketplace.json" },
  { platform: "antigravity",  path: "package.json" },
  { platform: "antigravity",  path: ".agents/skills/" },
  { platform: "openclaw",     path: "openclaw.plugin.json" }
]
```

**Phase 3 (Score):** Replace prose-based scoring with condition-driven evaluation:
```pseudocode
SCORE_PLATFORM(platform, plugin_path):
  rubric = load_yaml("lib/patterns/platforms/" + platform + ".yaml")
  results = {}

  FOR category IN rubric.categories:
    FOR condition IN category.conditions:
      IF condition.type == "checkable":
        # Generate and execute read-only check script from pseudocode
        passed = jit_evaluate(condition.check, plugin_path)
      ELSE:
        # LLM interprets prose description against actual files
        passed = judgement_evaluate(condition.check, plugin_path)
      results[condition.id] = passed

    # Apply scoring formula from rubric-framework.md
    category.score = compute_score(category.conditions, results)

  platform_score = compute_band(rubric.categories)
  RETURN platform_score, results
```

**Phase 5 (Report):** Update to include individual condition pass/fail in the per-platform scores table. Map failing conditions to required uplift artifacts via condition IDs.

**References section:** Update file references in the header to point to `.yaml` rubrics and `platform-mappings.md`.

- [ ] **Step 2: Verify the skill references the correct files**

Run: `grep -c "\.yaml" skills/assessing-plugin-portability/SKILL.md`
Expected: Multiple matches (references to platform YAML files)

Run: `grep -c "opencode\|copilot" skills/assessing-plugin-portability/SKILL.md`
Expected: 0

- [ ] **Step 3: Commit**

```bash
git add skills/assessing-plugin-portability/SKILL.md
git commit -m "feat: rewrite assessment skill for condition-driven scoring

References YAML rubrics with condition IDs. Evaluates checkable conditions
via JIT scripts, judgement conditions via LLM interpretation. New scoring
formula with percentage-based bands and N/A handling."
```

---

## Task 13: Rewrite Uplift Skill

**Files:**
- Rewrite: `skills/uplifting-a-plugin/SKILL.md`

The uplift skill needs: `# fixes:` annotations on every generation action, incremental uplift path, updated platform set, rubric-informed recommendations.

- [ ] **Step 1: Rewrite SKILL.md**

Key changes from the current 580-line skill:

**Frontmatter:** Update description and platform list. Remove `copilot-tools.md` reference, add `platform-mappings.md`.

**Phase 3 (Recommend):** Add rubric-informed decision making:
```pseudocode
RECOMMEND(computed, target_platforms):
  # Quick assessment (optional but recommended)
  scores = {}
  FOR platform IN target_platforms:
    scores[platform] = quick_assess(platform, computed.plugin_path)

  # Shape-based recommendation (existing logic)
  IF computed.shape == "bare-skill-repo" AND len(computed.skills) <= 3:
    recommendation = "skill-first"
  ELIF computed.shape == "curated-distribution":
    recommendation = "curated-note-only"
  ELSE:
    recommendation = "full-portable-plugin"

  # Override: incremental uplift for already-viable platforms
  FOR platform IN target_platforms:
    IF scores[platform].band IN ["STRONG", "VIABLE"]:
      recommendation_for[platform] = "incremental"
    ELSE:
      recommendation_for[platform] = recommendation
```

**Phase 4 (Generate):** Every generation action gets a `# fixes:` annotation:
```pseudocode
GENERATE_MANIFESTS(computed, target_platforms):
  FOR platform IN target_platforms:
    IF recommendation_for[platform] == "incremental":
      # Only fix failing conditions
      failing = get_failing_conditions(platform, "1_manifest")
      FOR condition IN failing:
        IF condition.template:
          render(condition.template, computed.metadata)
          # fixes: {condition.id}
    ELSE:
      # Full generation
      template = LOOKUP manifest template for platform
      render(template, computed.metadata)
      # fixes: {platform}.1_manifest.*.exists
      # fixes: {platform}.1_manifest.*.required_fields
```

Apply the same pattern to all generation phases (context files, sidecars, hooks, install docs).

**Platform list updates:** Replace all `opencode` and `copilot-cli` references with `antigravity` and `openclaw`. Update platform selection checklist.

**Phase 5 (Port):** Update hook merging to reference `LOOKUP["hook_events"]` tables instead of inline mappings. Add note that Antigravity and OpenClaw have no portable hook porting (N/A).

**Phase 6 (Document):** Update install doc generation to use Antigravity/OpenClaw templates.

- [ ] **Step 2: Verify fixes annotations are present**

Run: `grep -c "fixes:" skills/uplifting-a-plugin/SKILL.md`
Expected: >= 15 (at least one per major generation action)

Run: `grep -c "opencode\|copilot" skills/uplifting-a-plugin/SKILL.md`
Expected: 0

- [ ] **Step 3: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "feat: rewrite uplift skill with condition-linked fixes annotations

Every generation action carries # fixes: {condition.id}. Incremental
uplift path for VIABLE platforms. New platform set. Rubric-informed
recommendation overrides."
```

---

## Task 14: Update Using-Skill-Portability Skill

**Files:**
- Modify: `skills/using-skill-portability/SKILL.md`
- Remove: `skills/using-skill-portability/references/copilot-tools.md`

- [ ] **Step 1: Update SKILL.md with new platform list**

Replace the platform list in the skill table. Remove OpenCode and Copilot references. Add Antigravity and OpenClaw to the available platforms section.

- [ ] **Step 2: Remove copilot-tools.md reference**

```bash
git rm skills/using-skill-portability/references/copilot-tools.md
```

- [ ] **Step 3: Commit**

```bash
git add skills/using-skill-portability/
git commit -m "chore: update using-skill-portability with new platform set"
```

---

## Task 15: Update Pattern Documents

**Files:**
- Modify: `lib/patterns/detection-algorithm.md`
- Modify: `lib/patterns/hook-merging.md`
- Modify: `lib/patterns/bootstrapping.md`
- Modify: `lib/patterns/manifest-generation.md`
- Modify: `lib/patterns/injection-checks.md`
- Modify: `lib/patterns/report-template.md`
- Modify: `lib/patterns/platforms/publishing-and-discoverability.md`

These files all reference the old platform set and need surgical updates.

- [ ] **Step 1: Update detection-algorithm.md**

In the `SCAN_METADATA_SOURCES` pseudocode:
- Remove `opencode` scan (`".opencode/plugins/" + name + ".js"`)
- Remove `copilot-cli` scan (`"package.json"` for Copilot, `".github/copilot-instructions.md"`)
- Add `antigravity` scan: check for `package.json` with `publisher` field, `.agents/skills/` or `.agent/skills/` directory
- Add `openclaw` scan: check for `openclaw.plugin.json`

In the `CLASSIFY_SHAPE` pseudocode:
- Update the manifests list: replace opencode/copilot with antigravity/openclaw detection

- [ ] **Step 2: Update hook-merging.md**

- Remove OpenCode section (code-based hooks in `.opencode/plugins/`)
- Remove Copilot CLI section (`.github/hooks/*.json` with bash/powershell)
- Add Antigravity note: "Antigravity has no hook system. Hook scripts are not portable to this platform."
- Add OpenClaw note: "OpenClaw uses TypeScript plugin SDK (`api.registerHook()`). File-based hooks require a TypeScript wrapper. See `LOOKUP['hook_events']['openclaw']` in platform-mappings.md for event mapping."

- [ ] **Step 3: Update bootstrapping.md**

- Remove OpenCode platform branch in session-start script (the `experimental.chat.messages.transform` section)
- Remove Copilot CLI platform branch
- Add Antigravity context: GEMINI.md `@` includes (same as Gemini, since Antigravity reads GEMINI.md)
- Add OpenClaw context: AGENTS.md is primary context file
- Update the platform detection logic in session-start script template to detect Antigravity/OpenClaw env vars if applicable

- [ ] **Step 4: Update manifest-generation.md**

- Remove OpenCode entries (opencode-package, opencode-shim schemas)
- Remove Copilot entry (copilot-instructions schema)
- Add Antigravity entry: `antigravity-package` schema, plain substitution mode
- Add OpenClaw entry: `openclaw-manifest` schema, plain substitution mode
- Update the schema-to-template mapping table (13 artifacts → ~13, replacing dropped with new)

- [ ] **Step 5: Update injection-checks.md**

- Remove OpenCode check (#7: `.opencode/plugins/{{name}}.js` contains transform)
- Update check count (8 → 7 or adjust numbering)
- Verify remaining checks reference correct platforms

- [ ] **Step 6: Update report-template.md**

- Update any platform list references

- [ ] **Step 7: Update publishing-and-discoverability.md**

- Remove OpenCode and Copilot CLI entries from the Quick Discovery Matrix
- Add Antigravity: OpenVSX registry, `antigravity --install-extension`, skill-only via directory copy
- Add OpenClaw: ClawHub (official), npm, local `plugins.load.paths`, bundle auto-detection

- [ ] **Step 8: Verify no remaining references to dropped platforms in pattern docs**

Run: `grep -rn "opencode\|copilot-cli\|copilot_cli\|OpenCode\|Copilot CLI" lib/patterns/ --include="*.md" | grep -v "publishing-and-discoverability.md"`
Expected: No output (publishing doc was just updated)

Run: `grep -rn "opencode\|copilot-cli\|copilot_cli\|OpenCode\|Copilot CLI" lib/patterns/platforms/publishing-and-discoverability.md`
Expected: No output

- [ ] **Step 9: Commit**

```bash
git add lib/patterns/
git commit -m "feat: update all pattern docs for new platform set

Remove OpenCode/Copilot references from detection-algorithm, hook-merging,
bootstrapping, manifest-generation, injection-checks, report-template, and
publishing-and-discoverability. Add Antigravity and OpenClaw entries."
```

---

## Task 16: Update Remaining Templates

**Files:**
- Modify: `lib/templates/context-files/AGENTS.md.tmpl`
- Modify: `lib/templates/hooks/session-start.sh`

- [ ] **Step 1: Update AGENTS.md.tmpl**

Remove any references to Copilot CLI or OpenCode in the template content. The template uses `{{skillIncludes}}` builder mode — verify no hardcoded platform references exist that need updating.

- [ ] **Step 2: Update session-start.sh**

The session-start hook script detects platforms via environment variables. Remove the OpenCode and Copilot detection branches:
- Remove: `COPILOT_CLI` env detection
- Remove: OpenCode `msg.info.role` handling
- Keep: `CURSOR_PLUGIN_ROOT`, `CLAUDE_PLUGIN_ROOT` detection
- The script output format stays the same for remaining platforms

- [ ] **Step 3: Commit**

```bash
git add lib/templates/context-files/AGENTS.md.tmpl lib/templates/hooks/session-start.sh
git commit -m "chore: remove OpenCode/Copilot branches from templates"
```

---

## Task 17: Final Validation

- [ ] **Step 1: Verify all YAML rubrics parse**

```bash
for f in lib/patterns/platforms/*.yaml; do
  python3 -c "import yaml; yaml.safe_load(open('$f'))" && echo "OK: $f" || echo "FAIL: $f"
done
```
Expected: All OK

- [ ] **Step 2: Verify no orphan conditions (rubric IDs not referenced by any template or uplift action)**

```bash
grep -roh 'id: [a-z][a-z0-9_]*\.[0-9]_[a-z_]*\.[a-z_]*\.[a-z_]*' lib/patterns/platforms/*.yaml | sed 's/id: //' | sort -u > /tmp/all_rubric_ids.txt
grep -roh 'fixes: [a-z][a-z0-9_]*\.[0-9]_[a-z_]*\.[a-z_]*\.[a-z_]*' skills/ lib/templates/ | sed 's/fixes: //' | sort -u > /tmp/all_fixes_ids.txt
echo "=== Orphan conditions (in rubric, not in fixes) ==="
comm -23 /tmp/all_rubric_ids.txt /tmp/all_fixes_ids.txt
echo "=== Phantom fixes (in fixes, not in rubric) ==="
comm -13 /tmp/all_rubric_ids.txt /tmp/all_fixes_ids.txt
```
Expected: Both lists should be empty or very small (some judgement conditions may intentionally have no template fix)

- [ ] **Step 3: Verify no remaining references to dropped platforms anywhere in lib/ or skills/**

```bash
grep -rn "opencode\|copilot-cli\|copilot_cli\|OpenCode\|Copilot CLI\|copilot-tools" lib/ skills/ --include="*.md" --include="*.yaml" --include="*.tmpl" --include="*.sh" --include="*.json"
```
Expected: No output

- [ ] **Step 4: Verify platform count is correct**

```bash
ls lib/patterns/platforms/*.yaml | wc -l
```
Expected: 6

```bash
ls lib/patterns/platforms/*.md | wc -l
```
Expected: 1 (only publishing-and-discoverability.md remains)

- [ ] **Step 5: Commit any final fixes, then tag**

```bash
git add -A
git status  # Review changes
git commit -m "chore: final validation cleanup for rubric tightening"
```
