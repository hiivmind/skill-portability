# Rubric Tightening & Condition-Linked Uplift

**Date:** 2026-04-26
**Status:** Approved design — implementation pending (current branch still has old platform set)
**Scope:** Rubric framework, all platform rubrics, lookup tables, assessment skill, uplift skill, templates

## Problem

The current rubric system has four interconnected problems:

1. **Ambiguous scoring criteria.** Rubrics use prose like "complete & accurate", "proper frontmatter", "thoroughly documents" — none testable or reproducible across LLM runs.
2. **No AND/OR logic.** Criteria within a score level are implicitly AND but never stated. Some read as OR. Scoring is subjective.
3. **Missing component types.** Coverage of agents, subagents, rules, commands, and policies is inconsistent across platforms. Cursor rules (`.mdc`), Gemini commands (`.toml`), Codex subagent communication (`spawn_agent`) are underspecified.
4. **Rubric-uplift drift.** The uplift skill makes decisions based on repo shape and skill count — never reads rubric scores. Templates have no linkage to the conditions they resolve.

Additionally, the platform set needs updating:
- **Add:** Antigravity, OpenClaw (from external reference implementation)
- **Remove:** OpenCode, Copilot CLI

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Platform set | Claude Code, Codex, Cursor, Gemini, Antigravity, OpenClaw | Aligns with external reference implementation; drops platforms with weakest ecosystem support |
| Rubric-uplift linkage | Shared condition IDs | Assessment checks conditions, uplift references same IDs as fix triggers. Single vocabulary. |
| Scoring logic | Hybrid: AND between levels, OR within | Critical flags gate the level; optional flags earn bonus points. Matches how platform validation actually works. |
| Component granularity | Keep 7 categories, tag conditions with component types | Avoids category explosion (54 sections) while making individual conditions addressable by component. |
| Lookup tables | Single canonical reference file | Avoids duplication, easy to update. Rubric pseudocode references tables by name. |
| Condition types | Checkable (deterministic) vs Judgement (LLM-interpreted) | Makes explicit what's objective vs subjective. LLM can JIT-generate scripts for checkable conditions. |
| Drift prevention | `# fixes:` annotations in uplift actions | Emergent registry via grep. No separate file to maintain. Orphan/phantom detection is scriptable. |

## Design

### 1. Condition ID Schema

Every scorable criterion gets a stable ID:

```
{platform}.{category_num}_{category_short}.{component}.{check_name}
```

Examples:
```
cursor.1_manifest.plugin_json.required_fields
cursor.1_manifest.plugin_json.conditional_keys
cursor.4_hooks.hooks_json.camelcase_events
gemini.5_toolmap.sidecar.task_to_at_agent
codex.2_skills.frontmatter.spawn_agent_documented
```

### 2. Condition Types

```yaml
type: checkable    # Deterministic. File exists, field matches table, pattern present.
                   # LLM can JIT-generate a bash/python script to evaluate.

type: judgement    # Requires interpretation. Content quality, documentation adequacy.
                   # LLM evaluates directly.
```

### 3. Condition Structure

Each condition in a platform rubric YAML file:

```yaml
- id: cursor.1_manifest.plugin_json.required_fields
  type: checkable
  component: plugin_json
  critical: true
  points: 1
  check: |
    fields = read_json(".cursor-plugin/plugin.json")
    for f in LOOKUP["manifest_required_fields"]["cursor"]:
      assert f in fields
  template: manifests/cursor-plugin/plugin.json.tmpl
```

- `id`: Stable identifier, referenced by assessment AND uplift
- `type`: `checkable` or `judgement`
- `component`: Tag for filtering by component type within a category
- `critical`: If `true`, gates the score level (must pass for Score 2+)
- `points`: Weight within the category (typically 1)
- `check`: Pseudocode (checkable) or prose description (judgement)
- `template`: Optional — which template resolves this condition

### 4. Scoring Formula

Per category, per platform:

```
critical_count  = number of conditions where critical == true
optional_count  = number of conditions where critical == false
critical_pass   = number of critical conditions that pass
optional_pass   = number of optional conditions that pass

# Guard: every scored category MUST have at least 1 critical condition.
# If a category has 0 critical conditions, it scores N/A (see Section 5).

Score 3: critical_pass == critical_count
         AND (optional_count == 0 OR optional_pass / optional_count >= 0.75)
Score 2: critical_pass == critical_count
         AND (optional_count == 0 OR optional_pass / optional_count < 0.75)
Score 1: critical_pass / critical_count >= 0.50
         AND critical_pass < critical_count
Score 0: critical_pass / critical_count < 0.50
```

**Edge case rules:**
- A category with 0 critical conditions and >0 optional conditions scores **N/A** (not vacuously 3). This prevents score inflation from categories that have no real gates.
- A category with 0 total conditions scores **N/A**.
- When `optional_count == 0` and all critical conditions pass, the score is **3** (no optional bar to clear).
- When `critical_count == 1`, Score 1 is impossible (50% of 1 rounds to 1, which is all-pass → Score 2). This is by design: a single-critical category is binary pass/fail.

### 5. N/A Category Handling

If a platform has zero conditions in a category, OR zero critical conditions in a category:

```
Category scores N/A (not 0)
Max possible score adjusts downward (only scored categories count)
Scored categories = categories with at least 1 critical condition

Band calculation:
  actual_score  = sum of scored category scores
  max_score     = scored_category_count * 3
  percentage    = actual_score / max_score

  Strong:  >= 85%
  Viable:  >= 60%
  Partial: >= 35%
  Weak:    < 35%

Guard: if scored_category_count < 3, band is capped at PARTIAL
       (too few categories to claim Strong/Viable readiness)
```

### 6. Seven Categories with Component Tags

| # | Category | Component Tags |
|---|----------|---------------|
| 1 | Manifest Packaging | `plugin_json`, `marketplace_json`, `extension_json`, `package_json`, `openclaw_json` |
| 2 | Skill Compatibility | `frontmatter`, `discovery`, `tool_refs` |
| 3 | Context Delivery | `claude_md`, `agents_md`, `gemini_md`, `rules_mdc` |
| 4 | Hook Portability | `hooks_json`, `scripts`, `event_names`, `output_format` |
| 5 | Tool Mapping | `sidecar`, `model_mapping`, `subagent_syntax` |
| 6 | Install Readiness | `install_docs`, `publishing`, `verification` |
| 7 | Runtime Adapters | `mcp`, `agents`, `commands`, `rules`, `policies`, `subagents` |

### 7. Component Support Matrix

Source of truth for which conditions exist per platform:

| Component | Claude Code | Cursor | Gemini | Codex | Antigravity | OpenClaw |
|-----------|------------|--------|--------|-------|-------------|----------|
| Skills | `skills/*/SKILL.md` | `skills/*/SKILL.md` | `skills/*/SKILL.md` | `.agents/skills/*/SKILL.md` | `.agents/skills/*/SKILL.md` (preferred) or `.agent/skills/*/SKILL.md` (legacy) | `skills/*/SKILL.md` |
| Agents | `agents/*.md` | `agents/*.md` | `agents/*.md` | `.codex/agents/*.toml` | combined in AGENTS.md | `agents.list[]` in config (not manifest) |
| Commands | deprecated | optional `commands/` | `commands/*.toml` | none | `.agents/workflows/` (slash commands) | TS handlers |
| Rules | none | `.cursor/rules/*.mdc` | none | none | `.agent/rules/*.md` + GEMINI.md (highest priority) | none |
| Hooks | `hooks/hooks.json` | `hooks/hooks-cursor.json` | user `settings.json` (guidance only) | none (scripts as utilities) | none | plugin hooks via `api.registerHook()` (`before_tool_call`, `tool_result_persist`) |
| MCP | `.mcp.json` | `mcp.json` (no Resources) | implicit | none | none | none |
| Policies | none | none | `policies/*.toml` | none | none | none |
| Subagents | `Task` tool | implicit | `@agent-name` | `spawn_agent` | implicit | `agents.list[]` |
| Marketplace | `.claude-plugin/marketplace.json` | `.cursor-plugin/marketplace.json` | none | `.codex-plugin/marketplace.json` | `package.json` (OpenVSX/extension) | `openclaw.plugin.json` + `package.json` with `openclaw` block |
| Context file | `CLAUDE.md` | `AGENTS.md` + `.cursor/rules/` | `GEMINI.md` (`@` includes) | `AGENTS.md` | GEMINI.md > AGENTS.md > `.agent/rules/` (priority order) | `AGENTS.md` |

**Platform research notes (2026-04-26):**

**Antigravity (Google):** VS Code fork using OpenVSX registry. Preferred skill
path migrated from `.agent/` to `.agents/` (legacy still supported). Context
priority: System Rules > GEMINI.md > AGENTS.md > `.agent/rules/`. For skill-only
distribution, no package.json needed — drop skills into `.agents/skills/`.
Supports `.agents/workflows/` for custom slash commands. No file-based hook system.

**OpenClaw:** Open-source gateway platform (TypeScript). Requires BOTH
`openclaw.plugin.json` (with `id` + `configSchema`) AND `package.json` with
`openclaw` block (extensions, compat, build) for full native plugins. Skill-only
plugins can omit the package.json. Has plugin-level hooks via `api.registerHook()`
with `before_tool_call` and `tool_result_persist` events (corrects external
converter's claim of "no tool-level hooks"). Auto-detects `.claude-plugin/`,
`.codex-plugin/`, `.cursor-plugin/` bundle layouts — may work without conversion.
Install via ClawHub, npm, or local `plugins.load.paths`.

### 8. Lookup Tables (`lib/references/platform-mappings.md`)

Single canonical file containing all tables referenced by condition pseudocode. Tables:

#### 8.1 Model Mapping

| Claude Model | Gemini | Codex | OpenClaw | Cursor | Antigravity |
|---|---|---|---|---|---|
| opus | gemini-2.5-pro | gpt-5.4 | anthropic/claude-opus-4-6 | inherit | (removed) |
| sonnet | gemini-2.5-flash | gpt-5.4-mini | anthropic/claude-sonnet-4-5 | inherit | (removed) |
| haiku | gemini-2.0-flash-lite | gpt-5.4-mini | anthropic/claude-haiku-4-5 | inherit | (removed) |

#### 8.2 Tool Name Mapping

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

#### 8.3 Hook Event Mapping

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

Note: OpenClaw hooks use a plugin SDK (`api.registerHook()`), not file-based
configuration. Portable hook scripts cannot be directly converted — they require
a TypeScript wrapper that calls `api.registerHook()` with the appropriate event.

#### 8.4 Path Variable Mapping

| Claude Variable | Cursor | Gemini | Codex | Antigravity | OpenClaw |
|---|---|---|---|---|---|
| `${CLAUDE_PLUGIN_ROOT}` | `${CURSOR_PLUGIN_ROOT}` | `${extensionPath}${/}` | N/A | N/A | N/A |
| `/hooks/scripts/` | `/scripts/` | `/scripts/` | N/A | N/A | N/A |

#### 8.5 Field Stripping Sets

| Field | Gemini | Codex | OpenClaw | Cursor | Antigravity |
|---|---|---|---|---|---|
| `disable-model-invocation` | strip | strip | strip | **keep** | strip |
| `allowed-tools` | strip | strip | strip | strip | strip |

#### 8.6 Manifest Required Fields

| Platform | Required Fields |
|---|---|
| Claude Code | name, version, description, author (with email) |
| Cursor | name, displayName, description, version, author |
| Gemini | name, version, description, contextFileName |
| Codex (native) | name, version, description |
| Antigravity | name, displayName, version, description, publisher (for OpenVSX extension; skill-only needs no manifest) |
| OpenClaw | id, configSchema (in `openclaw.plugin.json`); full plugins also need `package.json` with `openclaw.extensions`, `openclaw.compat` |

#### 8.7 Hook Format Rules

| Rule | Claude Code | Cursor | Gemini | OpenClaw |
|---|---|---|---|---|
| Event name case | PascalCase | camelCase | PascalCase (BeforeTool/AfterTool) | snake_case (plugin SDK) |
| Timeout unit | seconds | seconds | milliseconds | N/A (SDK-managed) |
| Async support | yes (optional field) | no (strip) | no (strip) | yes (async handlers) |
| Structure | nested (matcher → hooks[]) | flat (matcher at hook level) | settings.json (user-configured) | `api.registerHook()` (TypeScript) |
| Output key | `hookSpecificOutput.additionalContext` | `additional_context` | N/A | return value from handler |

Note: Codex and Antigravity have no hook systems — omitted from this table.

#### 8.8 Skill Output Directory

| Platform | Skills Path | Agents Path |
|---|---|---|
| Claude Code | `skills/` | `agents/` |
| Cursor | `skills/` | `agents/` |
| Gemini | `skills/` | `agents/` |
| Codex | `.agents/skills/` | `.codex/agents/` |
| Antigravity | `.agents/skills/` (preferred) or `.agent/skills/` (legacy) | `.agent/rules/` |
| OpenClaw | `skills/` | in manifest `agents.list[]` |

#### 8.9 Agent Output Format

| Platform | Format | Model Field |
|---|---|---|
| Claude Code | Markdown (agents/*.md) | Claude model name |
| Cursor | Markdown (agents/*.md) + .mdc rule | `inherit` |
| Gemini | Markdown (agents/*.md) | Gemini model name, tools: ["*"] |
| Codex | TOML (.codex/agents/*.toml) | Codex model name |
| Antigravity | Combined AGENTS.md + .agent/rules/*.md | (removed) |
| OpenClaw | Listed in manifest agents.list[] | OpenClaw provider/model |

### 9. Uplift Linkage

#### 9.1 `# fixes:` Annotations

Every uplift action carries a `# fixes:` annotation:

```pseudocode
# In uplift skill Phase 4: Generate
for platform in target_platforms:
  for condition in rubric[platform].1_manifest.conditions:
    if condition.has_template:
      if not file_exists(condition.target_path):
        render(condition.template, metadata)
        # fixes: {condition.id}
```

In template file headers:

```
{{! fixes: cursor.1_manifest.plugin_json.required_fields }}
{{! fixes: cursor.1_manifest.plugin_json.conditional_keys }}
```

#### 9.2 Drift Detection

```pseudocode
rubric_ids = collect all condition IDs from lib/patterns/platforms/*.yaml
uplift_ids = collect all "fixes:" references from skills/uplifting-a-plugin/
template_ids = collect all "fixes:" references from lib/templates/

orphan_conditions = rubric_ids - uplift_ids
# Conditions scored but never fixed by uplift

phantom_fixes = uplift_ids - rubric_ids
# Uplift references conditions that don't exist in rubric
```

Assessment skill can run this as meta-validation.

#### 9.3 Incremental Uplift

When assessment shows a platform already VIABLE (>= 60%):

```pseudocode
for platform in target_platforms:
  if scores[platform].band in ["STRONG", "VIABLE"]:
    # Only fix failing conditions
    failing = [c for c in rubric[platform].all_conditions if not c.passes]
    for condition in failing:
      if condition.has_template:
        execute_fix(condition)
  else:
    # Full generation
    execute_full_uplift(platform)
```

#### 9.4 JIT Code Generation Guidance

The assessment skill includes this instruction for the evaluating LLM:

```
When evaluating checkable conditions:
  1. Read the condition's pseudocode
  2. Generate a read-only bash or python script that implements the check
  3. Execute the script
  4. Record pass/fail from exit code

When evaluating judgement conditions:
  1. Read the condition's prose description
  2. Read the referenced file(s)
  3. Apply your interpretation
  4. Record pass/fail with reasoning
```

**Execution scope note:** This skill is used by plugin authors assessing and
uplifting their own plugins. The target repo is always the author's own
working directory. JIT-generated scripts are read-only checks (file existence,
JSON field presence, pattern matching) — they do not modify files, execute
target repo content, or access paths outside the plugin root. The pseudocode
operations (`read_json`, `file_exists`, `parse_frontmatter`, `glob`) map to
read-only filesystem queries, not arbitrary shell execution.

### 10. Platform Rubric Reference: Cursor (Full Example)

See Design Section 3 in brainstorming conversation for the complete Cursor rubric
with all 7 categories, ~30 conditions, typed as checkable/judgement with
pseudocode checks and component tags.

Other platforms follow the same structure with differences documented in
Section 3: "Per-Platform Differences."

## File Changes

### New Files

| File | Purpose |
|------|---------|
| `lib/references/platform-mappings.md` | Canonical lookup tables (9 tables) |
| `lib/patterns/platforms/claude-code.yaml` | Claude Code rubric (structured conditions) |
| `lib/patterns/platforms/cursor.yaml` | Cursor rubric |
| `lib/patterns/platforms/gemini-cli.yaml` | Gemini rubric |
| `lib/patterns/platforms/codex.yaml` | Codex rubric |
| `lib/patterns/platforms/antigravity.yaml` | Antigravity rubric (new platform) |
| `lib/patterns/platforms/openclaw.yaml` | OpenClaw rubric (new platform) |
| `lib/templates/manifests/antigravity/package.json.tmpl` | Antigravity manifest template |
| `lib/templates/manifests/openclaw/openclaw.plugin.json.tmpl` | OpenClaw manifest template |
| `lib/templates/install-docs/antigravity.md` | Antigravity install docs |
| `lib/templates/install-docs/openclaw.md` | OpenClaw install docs |
| `lib/templates/install-docs/adding-platform/antigravity.md` | Adding Antigravity section |
| `lib/templates/install-docs/adding-platform/openclaw.md` | Adding OpenClaw section |

### Rewritten Files

| File | Nature of Change |
|------|-----------------|
| `lib/patterns/rubric-framework.md` | New scoring formula, condition types, N/A handling, percentage bands |
| `skills/assessing-plugin-portability/SKILL.md` | Reference condition IDs, JIT guidance, new scoring |
| `skills/uplifting-a-plugin/SKILL.md` | `# fixes:` annotations, incremental uplift, rubric-informed decisions |
| `skills/using-skill-portability/SKILL.md` | Updated platform list |

### Updated Files

| File | Nature of Change |
|------|-----------------|
| `lib/patterns/hook-merging.md` | Remove OpenCode/Copilot, add Antigravity/OpenClaw (both N/A) |
| `lib/patterns/bootstrapping.md` | Remove OpenCode/Copilot platform branches |
| `lib/patterns/detection-algorithm.md` | Add Antigravity/OpenClaw manifest detection, remove OpenCode/Copilot |
| `lib/patterns/manifest-generation.md` | New platform entries, remove dropped ones |
| `lib/patterns/injection-checks.md` | Remove OpenCode/Copilot checks |

### Removed Files

| File | Reason |
|------|--------|
| `lib/patterns/platforms/opencode.md` | Platform dropped |
| `lib/patterns/platforms/copilot-cli.md` | Platform dropped |
| `lib/references/copilot-tools.md` | Platform dropped |
| `lib/templates/manifests/opencode-plugin.js.tmpl` | Platform dropped |
| `lib/templates/manifests/package.json.tmpl` | Was OpenCode-specific |
| `lib/templates/context-files/copilot-instructions.md.tmpl` | Platform dropped |
| `lib/templates/install-docs/opencode.md` | Platform dropped |
| `lib/templates/install-docs/copilot-cli.md` | Platform dropped |
| `lib/templates/install-docs/adding-platform/opencode.md` | Platform dropped |
| `lib/templates/install-docs/adding-platform/copilot-cli.md` | Platform dropped |
| `lib/patterns/platforms/claude-code.md` | Replaced by .yaml |
| `lib/patterns/platforms/cursor.md` | Replaced by .yaml |
| `lib/patterns/platforms/gemini-cli.md` | Replaced by .yaml |
| `lib/patterns/platforms/codex.md` | Replaced by .yaml |

## Migration Order

1. **Lookup tables** — `platform-mappings.md` (everything references it)
2. **Rubric framework** — rewrite `rubric-framework.md`
3. **Platform rubrics** — 4 rewrites + 2 new, all as .yaml
4. **Skills & templates** — assessment, uplift, templates with `fixes:` annotations, new platform templates
5. **Pattern docs** — update hook-merging, bootstrapping, detection-algorithm, manifest-generation, injection-checks

## External Reference

Design informed by analysis of `agentic-commerce-skills-plugins/scripts/` — a Python CLI pipeline converting Claude Code plugins to Gemini, Antigravity, Codex, OpenClaw, and Cursor. Key extractions:
- Model mapping tables (frontmatter.py)
- Hook event/tool name mappings (hooks.py)
- Cursor hook flattening rules (cursor.py)
- Manifest required fields per platform (manifest.py, validate.py)
- Field stripping sets (frontmatter.py)
- 50+ validation checks decomposed into our condition ID system

## Addendum: Codex Adversarial Review Response (2026-04-26)

**[high] JIT execution safety** — Acknowledged but accepted risk. This skill is
used by plugin authors on their own repos, not on untrusted third-party code.
JIT-generated scripts are read-only filesystem checks (file_exists, read_json,
parse_frontmatter, glob). Added explicit scope note in Section 9.4.

**[medium] Scoring formula edge cases** — Fixed. Section 4 now defines explicit
behavior for zero-critical categories (→ N/A), zero-optional categories
(→ Score 3 if all critical pass), single-critical categories (binary pass/fail),
and adds a minimum-scored-categories guard for band calculation.

**[medium] Platform set not reflected in branch** — Fixed. Status updated to
"Approved design — implementation pending." The spec is the design document;
implementation follows via the migration order in the spec. Old platform files
will be removed and new platform files created during implementation phases 3-5.
