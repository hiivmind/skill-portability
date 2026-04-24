# Portability Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the audit skill with a scored assessment skill, rewrite the uplift skill with full 6-platform coverage, and add per-platform rubric scoring, Codex/Copilot artifact generation, and install doc generation.

**Architecture:** Two skills with a clean read/write split backed by a shared `lib/` containing a detection algorithm, rubric framework, 6 platform scoring modules, manifest schemas, hook merging patterns, install doc templates, and tool mapping references. Pattern files currently scoped per-skill move to shared `lib/patterns/`.

**Tech Stack:** Markdown skill files with YAML frontmatter, pseudocode logic blocks, template files with `{{placeholder}}` substitution.

---

## File Structure

### Files to move (copy then delete originals)

| From | To |
|------|-----|
| `skills/uplifting-a-plugin/patterns/manifest-generation.md` | `lib/patterns/manifest-generation.md` |
| `skills/uplifting-a-plugin/patterns/hook-merging.md` | `lib/patterns/hook-merging.md` |
| `skills/uplifting-a-plugin/patterns/bootstrapping.md` | `lib/patterns/bootstrapping.md` |
| `skills/auditing-plugin-portability/patterns/injection-checks.md` | `lib/patterns/injection-checks.md` |

### Files to create

| File | Responsibility |
|------|----------------|
| `lib/patterns/rubric-framework.md` | Scoring scale (0-3), 7 categories, bands (weak/partial/viable/strong), blocker severity levels |
| `lib/patterns/platforms/claude-code.md` | Claude Code scoring rules per category |
| `lib/patterns/platforms/cursor.md` | Cursor scoring rules per category |
| `lib/patterns/platforms/gemini-cli.md` | Gemini CLI scoring rules per category |
| `lib/patterns/platforms/opencode.md` | OpenCode scoring rules per category |
| `lib/patterns/platforms/copilot-cli.md` | Copilot CLI scoring rules per category |
| `lib/patterns/platforms/codex.md` | Codex scoring rules per category |
| `lib/templates/install-docs/claude-code.md` | Claude Code install doc template |
| `lib/templates/install-docs/cursor.md` | Cursor install doc template |
| `lib/templates/install-docs/gemini-cli.md` | Gemini CLI install doc template |
| `lib/templates/install-docs/opencode.md` | OpenCode install doc template |
| `lib/templates/install-docs/copilot-cli.md` | Copilot CLI install doc template |
| `lib/templates/install-docs/codex.md` | Codex install doc template |
| `skills/assessing-plugin-portability/SKILL.md` | 5-phase assessment skill (replaces auditing skill) |

### Files to rewrite

| File | Change |
|------|--------|
| `skills/uplifting-a-plugin/SKILL.md` | Rewrite from 5-phase (291 lines) to 8-phase (~350 lines) |

### Files to modify

| File | Change |
|------|--------|
| `lib/patterns/detection-algorithm.md` | Add D5 shape classification (~40 lines appended) |
| `lib/patterns/manifest-generation.md` | Add `codex-plugin` and `copilot-instructions` schemas (~50 lines appended) |
| `lib/patterns/hook-merging.md` | Add Copilot event mapping, Copilot hook format, Gemini hook guidance (~100 lines appended) |

### Files to delete

| File | Reason |
|------|--------|
| `skills/auditing-plugin-portability/SKILL.md` | Replaced by `assessing-plugin-portability` |
| `skills/auditing-plugin-portability/SKILL_original.md` | Backup from previous restructuring |
| `skills/auditing-plugin-portability/patterns/injection-checks.md` | Moved to `lib/patterns/` |
| `skills/auditing-plugin-portability/references/*` | Duplicates of `lib/references/` |
| `skills/uplifting-a-plugin/SKILL_original.md` | Backup from previous restructuring |
| `skills/uplifting-a-plugin/patterns/manifest-generation.md` | Moved to `lib/patterns/` |
| `skills/uplifting-a-plugin/patterns/hook-merging.md` | Moved to `lib/patterns/` |
| `skills/uplifting-a-plugin/patterns/bootstrapping.md` | Moved to `lib/patterns/` |
| `skills/uplifting-a-plugin/references/*` | Duplicates of `lib/references/` |

---

### Task 1: Move pattern files to shared lib

**Files:**
- Move: `skills/uplifting-a-plugin/patterns/manifest-generation.md` → `lib/patterns/manifest-generation.md`
- Move: `skills/uplifting-a-plugin/patterns/hook-merging.md` → `lib/patterns/hook-merging.md`
- Move: `skills/uplifting-a-plugin/patterns/bootstrapping.md` → `lib/patterns/bootstrapping.md`
- Move: `skills/auditing-plugin-portability/patterns/injection-checks.md` → `lib/patterns/injection-checks.md`

- [ ] **Step 1: Copy pattern files to lib/patterns/**

```bash
cp skills/uplifting-a-plugin/patterns/manifest-generation.md lib/patterns/manifest-generation.md
cp skills/uplifting-a-plugin/patterns/hook-merging.md lib/patterns/hook-merging.md
cp skills/uplifting-a-plugin/patterns/bootstrapping.md lib/patterns/bootstrapping.md
cp skills/auditing-plugin-portability/patterns/injection-checks.md lib/patterns/injection-checks.md
```

- [ ] **Step 2: Delete the old per-skill pattern directories and reference duplicates**

```bash
rm -rf skills/uplifting-a-plugin/patterns/
rm -rf skills/uplifting-a-plugin/references/
rm -rf skills/auditing-plugin-portability/patterns/
rm -rf skills/auditing-plugin-portability/references/
```

- [ ] **Step 3: Delete backup files from previous restructuring**

```bash
rm -f skills/uplifting-a-plugin/SKILL_original.md
rm -f skills/auditing-plugin-portability/SKILL_original.md
```

- [ ] **Step 4: Verify lib/patterns/ has all expected files**

```bash
ls -la lib/patterns/
```

Expected output should show: `detection-algorithm.md`, `manifest-generation.md`, `hook-merging.md`, `bootstrapping.md`, `injection-checks.md`

- [ ] **Step 5: Commit**

```bash
git add -A lib/patterns/ skills/uplifting-a-plugin/ skills/auditing-plugin-portability/
git commit -m "refactor: move pattern files from per-skill to shared lib/patterns/"
```

---

### Task 2: Add D5 shape classification to detection algorithm

**Files:**
- Modify: `lib/patterns/detection-algorithm.md`

- [ ] **Step 1: Update the file header to reference both skills by new names**

In `lib/patterns/detection-algorithm.md`, change line 3:

Old:
```
Shared by `uplifting-a-plugin` and `auditing-plugin-portability`. Run once at start.
```

New:
```
Shared by `uplifting-a-plugin` and `assessing-plugin-portability`. Run once at start.
```

- [ ] **Step 2: Add D1 source for `.codex-plugin/plugin.json`**

After the `package.json` source definition (line 30) and before the `AGENTS.md` source definition (line 31), insert a new source entry:

```
    {
      path:   ".codex-plugin/plugin.json",
      fields: ["name", "description", "version"]
    },
```

- [ ] **Step 3: Add `.codex-plugin/plugin.json` to tie-break order**

In the `ELECT_CANONICAL` function (around line 71), add `.codex-plugin/plugin.json` after `package.json` in the `tie_break_order` array:

Old:
```
  tie_break_order = [
    ".claude-plugin/plugin.json",
    ".cursor-plugin/plugin.json",
    "gemini-extension.json",
    "package.json",
    "AGENTS.md",
    # first skills/*/SKILL.md alphabetically by directory name
  ]
```

New:
```
  tie_break_order = [
    ".claude-plugin/plugin.json",
    ".cursor-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "gemini-extension.json",
    "package.json",
    "AGENTS.md",
    # first skills/*/SKILL.md alphabetically by directory name
  ]
```

- [ ] **Step 4: Append D5 shape classification at the end of the file**

After line 173 (the final line), append:

```markdown

---

## Step D5: Classify Repo Shape

```pseudocode
FUNCTION CLASSIFY_SHAPE(found_sources):
  platform_manifests = FILTER found_sources WHERE path IN [
    ".claude-plugin/plugin.json",
    ".cursor-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "gemini-extension.json",
  ]

  has_skills = ANY source.path MATCHES "skills/*/SKILL.md"
  has_marketplace = ANY source.path MATCHES "*marketplace.json"
  has_package_json = ANY source.path == "package.json"
  has_opencode_shim = ANY source.path MATCHES ".opencode/plugins/*.js"

  manifest_count = len(platform_manifests)
  IF has_package_json OR has_opencode_shim:
    manifest_count += 1

  IF manifest_count == 0 AND has_skills:
    RETURN "bare-skill-repo"
  ELIF manifest_count == 1:
    RETURN "single-platform-plugin"
  ELIF manifest_count >= 2:
    RETURN "multi-platform-source"
  ELIF has_marketplace AND NOT has_skills:
    RETURN "curated-distribution"
  ELSE:
    RETURN "unclassified"
```

Shape definitions:

| Shape | Description |
|-------|-------------|
| `bare-skill-repo` | Skills exist but no platform manifests |
| `single-platform-plugin` | One platform's manifest present |
| `multi-platform-source` | Two or more platform manifests |
| `curated-distribution` | Marketplace packaging without upstream skill authoring |
| `unclassified` | Does not match any known pattern |
```

- [ ] **Step 5: Commit**

```bash
git add lib/patterns/detection-algorithm.md
git commit -m "feat: add D5 shape classification and Codex source to detection algorithm"
```

---

### Task 3: Create rubric framework

**Files:**
- Create: `lib/patterns/rubric-framework.md`

- [ ] **Step 1: Create the rubric framework file**

Write the following to `lib/patterns/rubric-framework.md`:

```markdown
# Rubric Framework

Shared scoring model for plugin portability assessment. Used by `assessing-plugin-portability`.
Per-platform scoring rules are in `platforms/<platform>.md`.

---

## Scoring Scale

Every category on every platform uses this scale:

| Score | Meaning |
|-------|---------|
| 0 | Missing — no artifact or capability present |
| 1 | Partial — exists but fragile, incomplete, or tightly coupled to one platform |
| 2 | Usable — works but has gaps (missing fields, incomplete coverage) |
| 3 | Strong — fully portable, complete, correctly structured |

---

## Categories

Seven categories, applied per-platform, each scored 0-3:

| # | Category | What it measures |
|---|----------|-----------------|
| 1 | Manifest packaging | Platform manifest present, correct schema, complete fields |
| 2 | Skill compatibility | Skills discoverable, frontmatter correct, no unresolved tool assumptions |
| 3 | Context delivery | Platform context file present, accurate, includes all skills |
| 4 | Hook portability | Hooks adapted to platform format, correct event names, cross-platform scripts |
| 5 | Tool mapping | Per-skill sidecar present, tool name translation documented |
| 6 | Install readiness | Install docs exist, match actual structure, include verification steps |
| 7 | Runtime adapters | MCP, agents, commands adapted or documented for the platform |

---

## Bands

Per-platform total out of 21:

| Band | Score | Interpretation |
|------|-------|----------------|
| Strong | 18-21 | Platform fully supported |
| Viable | 13-17 | Moderate gaps, straightforward to complete |
| Partial | 8-12 | Significant work needed |
| Weak | 0-7 | Minimal or no support for this platform |

```pseudocode
FUNCTION CLASSIFY_BAND(total):
  IF total >= 18: RETURN "strong"
  ELIF total >= 13: RETURN "viable"
  ELIF total >= 8: RETURN "partial"
  ELSE: RETURN "weak"
```

---

## Blocker Severity

Blockers override raw scores. A repo with a decent score may still have one critical structural problem.

| Level | Meaning |
|-------|---------|
| Critical | Uplift cannot proceed safely without resolving first |
| Major | Uplift can proceed but output will be partial or fragile |
| Minor | Uplift can proceed normally |

---

## Blocker Detection Rules

| Blocker | Severity | Detection |
|---------|----------|-----------|
| No trustworthy metadata source | Critical | All metadata fields from hard fallbacks only |
| Unresolved tool assumptions | Major | Skill references platform-specific tools with no sidecar in `references/` |
| Hook env hard-coding | Major | Hook scripts reference `CLAUDE_PLUGIN_ROOT` or similar without env branching |
| Docs/structure mismatch | Major | Install docs in README describe paths that don't exist in repo |
| Whole-repo assumption | Minor | Repo requires whole-repo install but only documents single-skill copying |
| Missing subagent translation | Minor | Skills dispatch via `Task`/`Agent` but no codex-tools or copilot-tools sidecar |
| Gemini import gaps | Minor | `GEMINI.md` exists but missing `@` includes for some skills |

---

## Report Format

The assessment report must include all of these sections. If any are missing, the assessment is incomplete.

1. Repo shape classification
2. Canonical metadata source with extracted fields
3. Per-platform scores (7 categories each)
4. Blockers with severity
5. Uplift recommendation (skill-first, full-portable-plugin, hybrid, or curated-note-only)
6. Codex-specific recommendation (native-skill-discovery, native-plugin-packaging, or curated-package-note)
7. Required uplift artifacts list
8. Session-start injection status
```

- [ ] **Step 2: Commit**

```bash
git add lib/patterns/rubric-framework.md
git commit -m "feat: add shared rubric framework with scoring scale, bands, and blocker rules"
```

---

### Task 4: Create per-platform scoring rules (6 files)

**Files:**
- Create: `lib/patterns/platforms/claude-code.md`
- Create: `lib/patterns/platforms/cursor.md`
- Create: `lib/patterns/platforms/gemini-cli.md`
- Create: `lib/patterns/platforms/opencode.md`
- Create: `lib/patterns/platforms/copilot-cli.md`
- Create: `lib/patterns/platforms/codex.md`

Each file follows the same structure: 7 categories with score-level criteria specific to that platform. The content is derived from the spec's "Per-Platform Scoring Rules" section and the `docs/platforms/` research docs.

- [ ] **Step 1: Create `lib/patterns/platforms/` directory**

```bash
mkdir -p lib/patterns/platforms
```

- [ ] **Step 2: Write `lib/patterns/platforms/claude-code.md`**

```markdown
# Claude Code Scoring Rules

Platform-specific scoring criteria for the 7-category rubric.
See `lib/patterns/rubric-framework.md` for the shared scoring scale.

---

## Artifact Checklist

Files checked by the assess skill for Claude Code:

| File | Category |
|------|----------|
| `.claude-plugin/plugin.json` | Manifest packaging |
| `.claude-plugin/marketplace.json` | Manifest packaging |
| `CLAUDE.md` | Context delivery |
| `hooks/hooks.json` | Hook portability |
| `.mcp.json` | Runtime adapters |

---

## Category 1: Manifest Packaging

Score 3 when:
- `.claude-plugin/plugin.json` present
- Contains `name`, `description`, `version`, `author` (name + email), `keywords`
- `.claude-plugin/marketplace.json` present with valid plugin entries

Score 2 when:
- `plugin.json` present but missing fields (no author, no version, no keywords)
- No `marketplace.json`

Score 1 when:
- No manifest but components exist in default directories (auto-discovered)

Score 0 when:
- No `.claude-plugin/` directory and no discoverable components

---

## Category 2: Skill Compatibility

Score 3 when:
- Skills in `skills/<name>/SKILL.md` with `name` and `description` frontmatter
- No unresolved tool assumptions (Claude Code is the reference platform)

Score 2 when:
- Skills exist but some lack frontmatter fields

Score 1 when:
- Skills exist using legacy `commands/` format

Score 0 when:
- No skills

---

## Category 3: Context Delivery

Score 3 when:
- `CLAUDE.md` present with accurate plugin description
- `SessionStart` hooks configured for always-on context if needed

Score 2 when:
- `CLAUDE.md` exists but is incomplete or generic

Score 1 when:
- No context file but skills are self-documenting

Score 0 when:
- No context delivery mechanism

---

## Category 4: Hook Portability

Score 3 when:
- `hooks/hooks.json` uses valid event names and handler types
- Scripts handle cross-platform paths
- `hooks/run-hook.cmd` polyglot wrapper present for Windows

Score 2 when:
- Hooks exist but bash-only (no Windows wrapper)

Score 1 when:
- Hooks exist but reference hard-coded platform paths

Score 0 when:
- No hooks

---

## Category 5: Tool Mapping

Score 3 when:
- Claude Code is the reference platform — no sidecar needed for itself
- Other platform sidecars exist in `references/` per skill

Score 2 when:
- Some sidecars present but not all three (copilot-tools, codex-tools, gemini-tools)

Score 1 when:
- No sidecars present

Score 0 when:
- Skills use Claude-specific constructs with no documentation

---

## Category 6: Install Readiness

Score 3 when:
- Install docs exist explaining Claude Code plugin installation
- Marketplace install and local development paths documented
- Verification steps included

Score 2 when:
- Partial install docs (one method only)

Score 1 when:
- Install path inferrable from manifest but not documented

Score 0 when:
- No install documentation

---

## Category 7: Runtime Adapters

Score 3 when:
- `.mcp.json` configured if MCP servers are used
- Agents in `agents/` with proper frontmatter
- Commands in `commands/` if applicable

Score 2 when:
- Some runtime components exist but are incomplete

Score 1 when:
- Runtime components exist but are misconfigured

Score 0 when:
- No runtime adapters present or needed
```

- [ ] **Step 3: Write `lib/patterns/platforms/cursor.md`**

```markdown
# Cursor Scoring Rules

Platform-specific scoring criteria for the 7-category rubric.
See `lib/patterns/rubric-framework.md` for the shared scoring scale.

---

## Artifact Checklist

| File | Category |
|------|----------|
| `.cursor-plugin/plugin.json` | Manifest packaging |
| `.cursor/rules/*.mdc` | Context delivery |
| `hooks/hooks-cursor.json` | Hook portability |
| `mcp.json` | Runtime adapters |
| `AGENTS.md` | Context delivery |

---

## Category 1: Manifest Packaging

Score 3 when:
- `.cursor-plugin/plugin.json` present with `name`, `displayName`, `description`, `version`, `author`
- `logo` field set
- Conditional `agents`/`commands` keys match actual directories

Score 2 when:
- Manifest present but missing `displayName` or `logo`

Score 1 when:
- No manifest but skills exist in auto-discoverable paths

Score 0 when:
- No `.cursor-plugin/` directory

---

## Category 2: Skill Compatibility

Score 3 when:
- Skills in `skills/<name>/SKILL.md` with `name` and `description` frontmatter
- Skills are in Cursor-discoverable paths (`.cursor/skills/`, `.agents/skills/`, or `skills/`)

Score 2 when:
- Skills present but only in Claude-specific paths (`.claude/skills/`)

Score 1 when:
- Skills exist but lack frontmatter

Score 0 when:
- No skills

---

## Category 3: Context Delivery

Score 3 when:
- `.cursor/rules/*.mdc` files with correct frontmatter and activation modes
- `AGENTS.md` present at project root

Score 2 when:
- `AGENTS.md` present but no Cursor-specific rules

Score 1 when:
- Only legacy `.cursorrules` file

Score 0 when:
- No context delivery for Cursor

---

## Category 4: Hook Portability

Score 3 when:
- `hooks/hooks-cursor.json` present with camelCase event names
- Hook output uses `additional_context` (snake_case)
- `hooks/run-hook.cmd` present for Windows

Score 2 when:
- Claude Code hooks exist and can be auto-mapped by Cursor

Score 1 when:
- Hooks exist but use Claude-specific output format (`additionalContext` camelCase)

Score 0 when:
- No hooks

---

## Category 5: Tool Mapping

Score 3 when:
- Cursor uses same tool concepts as Claude Code — no sidecar needed for itself
- Skills do not reference tools unavailable in Cursor

Score 2 when:
- Skills reference some Claude-specific tools without Cursor equivalent

Score 1 when:
- No tool mapping documentation

Score 0 when:
- Skills heavily depend on Claude-specific tools

---

## Category 6: Install Readiness

Score 3 when:
- Install docs explain Cursor marketplace install or local `~/.cursor/plugins/local/` path
- Verification steps included
- Restart requirement documented

Score 2 when:
- Partial docs (marketplace only, no local path)

Score 1 when:
- Install path inferrable but undocumented

Score 0 when:
- No install documentation for Cursor

---

## Category 7: Runtime Adapters

Score 3 when:
- `mcp.json` (not `.mcp.json`) configured if MCP servers are used
- Agents in `agents/` compatible with Cursor frontmatter
- No dependency on MCP Resources (unsupported in Cursor)

Score 2 when:
- MCP config exists but uses `.mcp.json` path (Cursor expects `mcp.json`)

Score 1 when:
- Runtime depends on features unsupported by Cursor

Score 0 when:
- No runtime adapters
```

- [ ] **Step 4: Write `lib/patterns/platforms/gemini-cli.md`**

```markdown
# Gemini CLI Scoring Rules

Platform-specific scoring criteria for the 7-category rubric.
See `lib/patterns/rubric-framework.md` for the shared scoring scale.

---

## Artifact Checklist

| File | Category |
|------|----------|
| `gemini-extension.json` | Manifest packaging |
| `GEMINI.md` | Context delivery |
| `settings.json` hooks block | Hook portability |
| `agents/*.md` | Runtime adapters |
| `commands/*.toml` | Runtime adapters |

---

## Category 1: Manifest Packaging

Score 3 when:
- `gemini-extension.json` present with `name`, `version`, `description`
- `name` matches directory name (lowercase, dashes only)
- `contextFileName` set correctly

Score 2 when:
- Manifest present but missing `description` or `contextFileName`

Score 1 when:
- No manifest but `GEMINI.md` exists

Score 0 when:
- No Gemini CLI extension structure

---

## Category 2: Skill Compatibility

Score 3 when:
- Skills in `skills/<name>/SKILL.md` with proper frontmatter
- `references/gemini-tools.md` sidecar present per skill
- No dependency on `Task`/`Agent` tool (Gemini uses `@agent-name` syntax)

Score 2 when:
- Skills present but missing gemini-tools sidecar

Score 1 when:
- Skills reference Claude-specific tools without mapping

Score 0 when:
- Skills cannot function in Gemini CLI

---

## Category 3: Context Delivery

Score 3 when:
- `GEMINI.md` present with `@` include directives for every skill
- Each skill has both `@./skills/<name>/SKILL.md` and `@./skills/<name>/references/gemini-tools.md`
- Modular `@` imports used appropriately

Score 2 when:
- `GEMINI.md` exists but missing some skill includes

Score 1 when:
- `GEMINI.md` exists but is static prose (no `@` includes)

Score 0 when:
- No `GEMINI.md`

---

## Category 4: Hook Portability

Score 3 when:
- Hook guidance exists for `settings.json` configuration
- Event names use Gemini's naming (`BeforeTool`/`AfterTool`, not `PreToolUse`/`PostToolUse`)
- `gemini hooks migrate --from-claude` is documented as an option

Score 2 when:
- Claude Code hooks exist and can be migrated via built-in utility

Score 1 when:
- Hooks exist but use incompatible event names or output format

Score 0 when:
- No hooks

Note: Gemini hooks live in user `settings.json`, not in the repo. Assessment checks for guidance documentation, not a standalone hooks file.

---

## Category 5: Tool Mapping

Score 3 when:
- `references/gemini-tools.md` sidecar present per skill
- Tool name differences documented (`read_file`, `replace`, `write_file`, `grep_search`, `run_shell_command`)
- Subagent dispatch difference noted (`@agent-name` not `Task` tool)

Score 2 when:
- Some sidecar files present but not all skills covered

Score 1 when:
- No tool mapping files

Score 0 when:
- Skills use Claude-specific tools with no translation path

---

## Category 6: Install Readiness

Score 3 when:
- Install docs explain `gemini extensions install` from GitHub or local path
- Three-tier install locations documented (system/user/project)
- Restart requirement documented
- Verification step included

Score 2 when:
- Basic install path documented without full detail

Score 1 when:
- Install path inferrable but undocumented

Score 0 when:
- No install documentation for Gemini CLI

---

## Category 7: Runtime Adapters

Score 3 when:
- `agents/*.md` with mandatory YAML frontmatter (`name`, `description`)
- `commands/*.toml` if custom commands are provided
- MCP servers configured in `gemini-extension.json` using `${extensionPath}` paths
- `policies/*.toml` if policy rules are provided

Score 2 when:
- Some runtime components present but incomplete frontmatter

Score 1 when:
- Agent files missing mandatory frontmatter (will silently fail)

Score 0 when:
- No runtime adapters
```

- [ ] **Step 5: Write `lib/patterns/platforms/opencode.md`**

```markdown
# OpenCode Scoring Rules

Platform-specific scoring criteria for the 7-category rubric.
See `lib/patterns/rubric-framework.md` for the shared scoring scale.

---

## Artifact Checklist

| File | Category |
|------|----------|
| `.opencode/plugins/<name>.js` | Manifest packaging |
| `package.json` | Manifest packaging |
| `AGENTS.md` | Context delivery |
| `opencode.json` | Runtime adapters |

---

## Category 1: Manifest Packaging

Score 3 when:
- `.opencode/plugins/<name>.js` plugin entrypoint present
- `package.json` present with correct `main` field pointing to plugin
- `opencode.json` configured with plugin reference if npm-distributed

Score 2 when:
- Plugin code exists but `package.json` `main` field is incorrect or missing

Score 1 when:
- No OpenCode plugin but skills are in compatible discovery paths

Score 0 when:
- No OpenCode-compatible structure

---

## Category 2: Skill Compatibility

Score 3 when:
- Skills in discovery-compatible paths (`.opencode/skills/`, `.agents/skills/`, `.claude/skills/`, or `skills/`)
- Frontmatter has `name` and `description`
- Tool references use lowercase names (`read`, `edit`, `bash`) or sidecars document the mapping

Score 2 when:
- Skills present but only in Claude-specific paths

Score 1 when:
- Skills reference tools not available in OpenCode

Score 0 when:
- No skills in any discoverable path

---

## Category 3: Context Delivery

Score 3 when:
- `AGENTS.md` present (OpenCode's primary context file)
- Content accurately describes plugin capabilities and skill listing

Score 2 when:
- Only `CLAUDE.md` present (works as fallback if no `AGENTS.md`)

Score 1 when:
- No context file but skills are self-documenting

Score 0 when:
- No context delivery mechanism

Important: OpenCode uses "first type wins" — if ANY `AGENTS.md` exists, ALL `CLAUDE.md` files are ignored.

---

## Category 4: Hook Portability

Score 3 when:
- Plugin uses `experimental.chat.messages.transform` for session-start injection
- Transform correctly uses `msg.info.role` (not `msg.role`)
- Bootstrap content injected into first user message

Score 2 when:
- Plugin uses `config` hook to inject commands/agents but no message transform

Score 1 when:
- No session-start injection but `AGENTS.md` provides equivalent context

Score 0 when:
- No hook mechanism

Note: OpenCode hooks are code-based (in the plugin JS/TS file), not file-based configs.

---

## Category 5: Tool Mapping

Score 3 when:
- Tool names documented: `read`, `edit`, `write`, `bash`, `glob`, `grep`, `task`, `skill`
- Differences from Claude Code noted (lowercase, `list` instead of `ls`)

Score 2 when:
- Some tool mapping present

Score 1 when:
- No tool mapping documentation

Score 0 when:
- Skills heavily depend on Claude-specific tool names

---

## Category 6: Install Readiness

Score 3 when:
- Install docs explain local file placement (`.opencode/plugins/`)
- npm package install via `opencode.json` `"plugin"` array documented if applicable
- Bun dependency noted
- Restart requirement documented

Score 2 when:
- Basic install path documented

Score 1 when:
- Install path inferrable but undocumented

Score 0 when:
- No install documentation for OpenCode

---

## Category 7: Runtime Adapters

Score 3 when:
- MCP config in `opencode.json` (not `.mcp.json`) if MCP servers are used
- `config` hook injects servers programmatically if needed
- No dependency on MCP features unsupported by OpenCode

Score 2 when:
- MCP config exists but uses wrong path format

Score 1 when:
- Runtime depends on features unsupported by OpenCode

Score 0 when:
- No runtime adapters
```

- [ ] **Step 6: Write `lib/patterns/platforms/copilot-cli.md`**

```markdown
# Copilot CLI Scoring Rules

Platform-specific scoring criteria for the 7-category rubric.
See `lib/patterns/rubric-framework.md` for the shared scoring scale.

---

## Artifact Checklist

| File | Category |
|------|----------|
| `.github/copilot-instructions.md` | Context delivery |
| `.github/instructions/*.instructions.md` | Context delivery |
| `.github/agents/*.agent.md` | Runtime adapters |
| `.github/hooks/*.json` | Hook portability |
| `.github/skills/<name>/SKILL.md` | Skill compatibility |

Note: Copilot has no plugin manifest file.

---

## Category 1: Manifest Packaging

Score 3 when:
- `.github/copilot-instructions.md` present with accurate project context
- Cross-platform context files (`AGENTS.md`, `CLAUDE.md`) present (Copilot reads these)

Score 2 when:
- Only `AGENTS.md`/`CLAUDE.md` present (no `.github/copilot-instructions.md`)

Score 1 when:
- No Copilot-specific structure but skills exist in cross-platform paths

Score 0 when:
- No Copilot-compatible structure

Note: Copilot has no plugin manifest. Scoring is based on instruction files instead.

---

## Category 2: Skill Compatibility

Score 3 when:
- Skills in `.github/skills/<name>/SKILL.md` or cross-platform `skills/` path
- Frontmatter has `name` and `description`
- `references/copilot-tools.md` sidecar present per skill

Score 2 when:
- Skills present with frontmatter but missing copilot-tools sidecar

Score 1 when:
- Skills reference tools not available in Copilot CLI

Score 0 when:
- No skills in any discoverable path

---

## Category 3: Context Delivery

Score 3 when:
- `.github/copilot-instructions.md` for repo-wide context
- Path-specific `.github/instructions/*.instructions.md` where applicable
- `AGENTS.md` and/or `CLAUDE.md` present (Copilot reads both)

Score 2 when:
- Only cross-platform context files (no `.github/` instructions)

Score 1 when:
- Minimal or generic instructions

Score 0 when:
- No instruction files

---

## Category 4: Hook Portability

Score 3 when:
- `.github/hooks/*.json` files with correct format
- Separate `bash` and `powershell` fields for cross-platform
- Scripts handle their own tool name filtering (no `matcher` field)

Score 2 when:
- Hooks from another platform can be adapted
- Only bash scripts (no powershell)

Score 1 when:
- Hooks exist but use incompatible format or output structure

Score 0 when:
- No hooks

Key differences: no `matcher` field (filtering in script), separate `bash`/`powershell` fields (not `command`), default 30s timeout, only `preToolUse` can block.

---

## Category 5: Tool Mapping

Score 3 when:
- `references/copilot-tools.md` sidecar present per skill
- Tool differences documented (`view`=Read, `create`=Write, `edit`/`apply_patch`=Edit)
- Subagent dispatch mapped

Score 2 when:
- Some tool mapping present

Score 1 when:
- No tool mapping documentation

Score 0 when:
- Skills heavily depend on Claude-specific tools

---

## Category 6: Install Readiness

Score 3 when:
- Install docs explain Copilot CLI skill discovery paths
- `~/.copilot/skills/` and `.github/skills/` paths documented
- `gh skill install` flow documented if applicable
- Verification steps included

Score 2 when:
- Basic install path documented

Score 1 when:
- Install path inferrable but undocumented

Score 0 when:
- No install documentation for Copilot CLI

---

## Category 7: Runtime Adapters

Score 3 when:
- `.github/agents/*.agent.md` with proper frontmatter (`description` required, `tools` allowlist)
- `target` field set appropriately (`vscode`, `github-copilot`, or omitted)
- MCP servers configured via `~/.copilot/mcp-config.json` or agent `mcp-servers` frontmatter

Score 2 when:
- Agent definitions exist but lack required frontmatter fields

Score 1 when:
- Agent prompts exist but without proper `.agent.md` format

Score 0 when:
- No runtime adapters
```

- [ ] **Step 7: Write `lib/patterns/platforms/codex.md`**

```markdown
# Codex Scoring Rules

Platform-specific scoring criteria for the 7-category rubric.
See `lib/patterns/rubric-framework.md` for the shared scoring scale.

---

## Artifact Checklist

Artifacts depend on the chosen consumption path:

### Skill-discovery path

| File | Category |
|------|----------|
| `AGENTS.md` | Context delivery |
| `.codex/INSTALL.md` | Install readiness |
| `references/codex-tools.md` (per skill) | Tool mapping |

### Native plugin path

| File | Category |
|------|----------|
| `.codex-plugin/plugin.json` | Manifest packaging |
| `.agents/plugins/marketplace.json` | Manifest packaging |
| `AGENTS.md` | Context delivery |
| `.codex/INSTALL.md` | Install readiness |
| `references/codex-tools.md` (per skill) | Tool mapping |

---

## Category 1: Manifest Packaging

Score 3 when:
- Explicit decision made between skill-discovery and plugin packaging
- If plugin path: `.codex-plugin/plugin.json` present with `name`, `description`, `version`, `skills`
- If plugin path: `marketplace.json` present with valid plugin entry
- If skill-discovery path: `AGENTS.md` present with complete skill listing

Score 2 when:
- One path partially implemented (e.g., manifest without marketplace)

Score 1 when:
- Skills exist in compatible paths but no Codex-specific packaging

Score 0 when:
- No Codex-compatible structure

---

## Category 2: Skill Compatibility

Score 3 when:
- Skills in standard `skills/<name>/SKILL.md` with frontmatter
- `references/codex-tools.md` sidecar present per skill
- Subagent dispatch uses Codex message framing (`spawn_agent` with `worker` role)
- Environment detection present for worktree-aware skills

Score 2 when:
- Skills present with frontmatter but missing codex-tools sidecar

Score 1 when:
- Skills reference Claude-specific tools without mapping

Score 0 when:
- Skills cannot function in Codex

---

## Category 3: Context Delivery

Score 3 when:
- `AGENTS.md` present with complete skill listing and tool mapping guidance
- `.codex/INSTALL.md` present with install instructions
- Context file accurately describes capabilities

Score 2 when:
- `AGENTS.md` present but missing install docs

Score 1 when:
- Only `CLAUDE.md` present (Codex reads as fallback)

Score 0 when:
- No context delivery

---

## Category 4: Hook Portability

Score 3 when:
- Hooks ported to Codex plugin format if applicable
- Hook scripts compatible with Codex runtime

Score 2 when:
- Hooks exist in Claude format but adaptable

Score 1 when:
- Hooks hard-coded to Claude environment

Score 0 when:
- No hooks

---

## Category 5: Tool Mapping

Score 3 when:
- `references/codex-tools.md` sidecar present per skill
- `Task` → `spawn_agent` mapping documented with message framing
- `TodoWrite` → `update_plan` mapping documented
- Named agent dispatch workaround documented
- Multi-agent config flag (`multi_agent = true`) noted

Score 2 when:
- Basic tool mapping present but missing subagent dispatch details

Score 1 when:
- No tool mapping documentation

Score 0 when:
- Skills heavily depend on Claude-specific tools

---

## Category 6: Install Readiness

Score 3 when:
- `.codex/INSTALL.md` present with platform-specific install instructions
- Chosen consumption path (skill-discovery vs plugin) explicitly documented
- Verification steps included
- Restart requirements documented
- Distinction between upstream source and curated marketplace package stated

Score 2 when:
- Install docs exist but are incomplete or generic

Score 1 when:
- Install path inferrable but undocumented

Score 0 when:
- No install documentation for Codex

---

## Category 7: Runtime Adapters

Score 3 when:
- Multi-agent config awareness documented
- Sandbox/detached-HEAD handling documented for Codex App
- MCP servers configured if applicable

Score 2 when:
- Some runtime considerations documented

Score 1 when:
- Runtime depends on features unsupported by Codex

Score 0 when:
- No runtime adapters
```

- [ ] **Step 8: Commit all 6 platform scoring files**

```bash
git add lib/patterns/platforms/
git commit -m "feat: add per-platform scoring rules for all 6 target platforms"
```

---

### Task 5: Create install doc templates (6 files)

**Files:**
- Create: `lib/templates/install-docs/claude-code.md`
- Create: `lib/templates/install-docs/cursor.md`
- Create: `lib/templates/install-docs/gemini-cli.md`
- Create: `lib/templates/install-docs/opencode.md`
- Create: `lib/templates/install-docs/copilot-cli.md`
- Create: `lib/templates/install-docs/codex.md`

Each file is a template with `{{placeholders}}` that the uplift skill renders with metadata.

- [ ] **Step 1: Create `lib/templates/install-docs/` directory**

```bash
mkdir -p lib/templates/install-docs
```

- [ ] **Step 2: Write `lib/templates/install-docs/claude-code.md`**

```markdown
## Claude Code

### Marketplace install

```bash
claude plugin install {{name}}@{{marketplaceName}}
```

### Local development

```bash
claude --plugin-dir ./path-to-{{name}}
```

### Project install

Add to `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": ["./path-to-marketplace"]
}
```

### Verify

```bash
claude plugin list
```

Look for `{{name}}` in the output.
```

- [ ] **Step 3: Write `lib/templates/install-docs/cursor.md`**

```markdown
## Cursor

### Marketplace install

Search for **{{displayName}}** in the Cursor marketplace panel or visit `cursor.com/marketplace`.

### Local development

Copy the plugin directory to `~/.cursor/plugins/local/{{name}}/` and restart Cursor (Developer: Reload Window).

### Verify

Open Cursor and check that skills from {{displayName}} appear when typing `/` in chat.
```

- [ ] **Step 4: Write `lib/templates/install-docs/gemini-cli.md`**

```markdown
## Gemini CLI

### Install from GitHub

```bash
gemini extensions install {{repository}}
```

### Install from local path

```bash
gemini extensions install /path/to/{{name}}
```

### Verify

```bash
gemini extensions list
```

Look for `{{name}}` in the output. Restart Gemini CLI if it was running during install.

### Hook configuration

Gemini CLI hooks are configured in your user `settings.json`, not in the repo. If this plugin includes hooks, add the following to `~/.gemini/settings.json`:

(See the hook guidance section in the generated install docs for the specific configuration to copy.)
```

- [ ] **Step 5: Write `lib/templates/install-docs/opencode.md`**

```markdown
## OpenCode

### Local plugin install

Copy `.opencode/plugins/{{name}}.js` to your project's `.opencode/plugins/` directory, or to `~/.config/opencode/plugins/` for global install.

### npm install (if published)

Add to your `opencode.json`:

```json
{
  "plugin": ["{{name}}"]
}
```

### Context file

OpenCode uses `AGENTS.md` as its primary context file. If both `AGENTS.md` and `CLAUDE.md` exist, only `AGENTS.md` is loaded.

### Verify

Restart OpenCode and check that skills are listed when the agent invokes the `skill` tool.

### Requirements

OpenCode requires [Bun](https://bun.sh) for plugin loading.
```

- [ ] **Step 6: Write `lib/templates/install-docs/copilot-cli.md`**

```markdown
## Copilot CLI

### Skill install

Skills are auto-discovered from the `skills/` directory. Clone the repo and skills will be available:

```bash
git clone {{repository}}
```

Alternatively, install individual skills:

```bash
gh skill install {{repository}}
```

### Context

Copilot reads `.github/copilot-instructions.md` for repo-wide context. It also reads `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` from the project root.

### Custom agents

Custom agents are in `.github/agents/`. They are auto-discovered when the repo is the current working directory.

### Verify

Start Copilot CLI in the repo directory and check that skills appear:

```bash
copilot
```

Type `/` to see available skills.
```

- [ ] **Step 7: Write `lib/templates/install-docs/codex.md`**

```markdown
## Codex

### Skill-discovery install

Clone the repo and expose the skills directory:

```bash
git clone {{repository}}
ln -s $(pwd)/{{name}}/skills ~/.agents/skills/{{name}}
```

Restart Codex. Skills will be discoverable through native skill discovery.

### Native plugin install

If packaged as a Codex plugin:

1. Ensure `.codex-plugin/plugin.json` exists in the plugin directory
2. Add a marketplace entry:

```json
{
  "plugins": [
    {
      "name": "{{name}}",
      "source": "./plugins/{{name}}"
    }
  ]
}
```

3. Place `marketplace.json` at `~/.agents/plugins/marketplace.json` (home-local) or `<repo>/.agents/plugins/marketplace.json` (repo-local)
4. Restart Codex

### Context file

Codex uses `AGENTS.md` as its primary context file.

### Multi-agent support

If this plugin's skills use subagent dispatch, enable multi-agent mode:

```toml
# ~/.codex/config.toml
[features]
multi_agent = true
```

### Verify

Start a new Codex session and check that skills are listed.
```

- [ ] **Step 8: Commit all install doc templates**

```bash
git add lib/templates/install-docs/
git commit -m "feat: add per-platform install doc templates with placeholder substitution"
```

---

### Task 6: Expand manifest-generation.md with Codex and Copilot schemas

**Files:**
- Modify: `lib/patterns/manifest-generation.md`

- [ ] **Step 1: Append `codex-plugin` schema at the end of the file**

After the existing `opencode-shim` section, append:

```markdown

---

## codex-plugin

**Target:** `.codex-plugin/plugin.json`

Create `.codex-plugin/` directory if needed. Only generated when Codex recommendation is `native-plugin-packaging`.

```json
{
  "name": "{{name}}",
  "description": "{{description}}",
  "version": "{{version}}",
  "skills": "./skills/",
  "hooks": "./hooks/"
}
```

---

## copilot-instructions

**Target:** `.github/copilot-instructions.md`

Create `.github/` directory if needed.

```markdown
# {{displayName}}

{{description}}

## Skills

This project provides agent skills in the `skills/` directory. Skills follow the open SKILL.md standard and are auto-discovered by Copilot CLI.

## Tool Name Mapping

Skills use Claude Code tool names. Copilot CLI equivalents:

- `Read` → `view`
- `Write` → `create`
- `Edit` → `edit` / `apply_patch`
- `Bash` → `bash` / `powershell`
- `Grep` → `grep` / `rg`
- `Glob` → `glob`
- `Skill` → `skill`
- `Task` / `Agent` → subagent dispatch

See each skill's `references/copilot-tools.md` for detailed mapping.
```
```

- [ ] **Step 2: Commit**

```bash
git add lib/patterns/manifest-generation.md
git commit -m "feat: add codex-plugin and copilot-instructions manifest schemas"
```

---

### Task 7: Expand hook-merging.md with Copilot and Gemini support

**Files:**
- Modify: `lib/patterns/hook-merging.md`

- [ ] **Step 1: Read the current file to find the end**

```bash
wc -l lib/patterns/hook-merging.md
```

- [ ] **Step 2: Append Copilot event mapping, Copilot hook format, and Gemini hook guidance**

After the last line of the existing file, append:

```markdown

---

## Claude Code → Copilot Event Mapping

| Claude Code | Copilot CLI | Copilot VS Code |
|-------------|-------------|-----------------|
| `SessionStart` | `sessionStart` | `SessionStart` |
| `PreToolUse` | `preToolUse` | `PreToolUse` |
| `PostToolUse` | `postToolUse` | `PostToolUse` |
| `SubagentStart` | N/A | `SubagentStart` |
| `SubagentStop` | `subagentStop` | `SubagentStop` |
| `Stop` | `agentStop` | `Stop` |
| `PreCompact` | N/A | `PreCompact` |
| `UserPromptSubmit` | `userPromptSubmitted` | `UserPromptSubmit` |

---

## Copilot Hook Format

```pseudocode
GENERATE_COPILOT_HOOKS(claude_hooks):
  copilot_hooks = { "version": 1, "hooks": {} }

  event_map = {
    "SessionStart":    "sessionStart",
    "PreToolUse":      "preToolUse",
    "PostToolUse":     "postToolUse",
    "SubagentStop":    "subagentStop",
    "Stop":            "agentStop",
    "UserPromptSubmit": "userPromptSubmitted",
  }

  FOR event, entries IN claude_hooks.hooks:
    IF event NOT IN event_map:
      SKIP  # Event not supported in Copilot CLI
    copilot_event = event_map[event]
    copilot_hooks.hooks[copilot_event] = []

    FOR entry IN entries:
      copilot_entry = {
        "type": "command",
        "bash": entry.hooks[0].command,
        "powershell": convert_to_powershell_path(entry.hooks[0].command),
        "timeoutSec": min(entry.hooks[0].timeout / 1000, 30)
      }
      # No matcher field — Copilot hooks filter in script body
      copilot_hooks.hooks[copilot_event].append(copilot_entry)

  Write(".github/hooks/hooks.json", JSON.stringify(copilot_hooks, indent=2))
```

Key differences from Claude Code hooks:
- Separate `bash` and `powershell` fields instead of `command`
- No `matcher` — tool name filtering must be done in the script by inspecting `toolName` from stdin JSON
- Default timeout is 30 seconds
- Only `preToolUse` can deny/block actions; all other hooks are observational
- Hooks stored in `.github/hooks/` not `hooks/`

---

## Gemini Hook Guidance

Gemini CLI hooks are configured in user `settings.json`, not in the repo. The uplift skill generates guidance text for install docs instead of writing a hooks file.

```pseudocode
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

    FOR entry IN entries:
      guidance += '    "' + gemini_event + '": [{\n'
      IF entry.matcher:
        guidance += '      "matcher": "' + entry.matcher + '",\n'
      guidance += '      "sequential": true,\n'
      guidance += '      "hooks": [{\n'
      guidance += '        "type": "command",\n'
      guidance += '        "command": "' + entry.hooks[0].command + '",\n'
      guidance += '        "timeout": ' + str(entry.hooks[0].timeout or 60000) + '\n'
      guidance += '      }]\n'
      guidance += '    }],\n'

  guidance += "  }\n}\n```\n"
  RETURN guidance
```

Key differences from Claude Code hooks:
- Hooks configured in `settings.json`, not a standalone JSON file
- Event names differ: `BeforeTool`/`AfterTool` not `PreToolUse`/`PostToolUse`
- `PreCompress` not `PreCompact`
- Timeout in milliseconds (default 60000), not seconds
- `matcher` field uses regex or exact match (similar to Claude Code)
- Exit code 2 = system block (same as Claude Code)
- Built-in migration: `gemini hooks migrate --from-claude`
```

- [ ] **Step 3: Commit**

```bash
git add lib/patterns/hook-merging.md
git commit -m "feat: add Copilot hook generation and Gemini hook guidance to hook-merging"
```

---

### Task 8: Write the assess skill

**Files:**
- Create: `skills/assessing-plugin-portability/SKILL.md`

This is the largest single file. It replaces the current auditing skill with a 5-phase assessment skill that includes shape classification, per-platform rubric scoring, blocker detection, and uplift recommendations.

- [ ] **Step 1: Write `skills/assessing-plugin-portability/SKILL.md`**

Write the complete file content. The pseudocode is taken directly from the spec (sections "Assess Skill: Phase Hierarchy" through "Phase 5: Report"). The file should include:

- YAML frontmatter (name, description, allowed-tools, inputs, outputs) — from spec lines 80-98
- Phase overview table — from spec lines 100-108
- Phase 1: Detect — from spec lines 110-148, referencing `lib/patterns/detection-algorithm.md`
- Phase 2: Inventory — from spec lines 150-253, all platform manifest/context/sidecar/hook/MCP checks
- Phase 3: Score — from spec lines 256-315, referencing `lib/patterns/rubric-framework.md` and `lib/patterns/platforms/`
- Phase 4: Recommend — from spec lines 318-354, shape-based recommendation logic
- Phase 5: Report — from spec lines 357-415, full report template
- State flow diagram
- Reference documentation section listing all referenced lib files
- Related skills section pointing to uplifting-a-plugin

The full content is defined in the spec. The implementer should read the spec sections and produce the SKILL.md following the bp-assess exemplar pattern (numeric hierarchical headings, pseudocode blocks, external references).

- [ ] **Step 2: Commit**

```bash
git add skills/assessing-plugin-portability/SKILL.md
git commit -m "feat: add assessing-plugin-portability skill with 5-phase rubric scoring"
```

---

### Task 9: Rewrite the uplift skill

**Files:**
- Rewrite: `skills/uplifting-a-plugin/SKILL.md`

Rewrite from the current 5-phase structure (291 lines) to the new 8-phase structure (~350 lines) with Recommend, Port, and Document phases added.

- [ ] **Step 1: Rewrite `skills/uplifting-a-plugin/SKILL.md`**

Write the complete file content. The pseudocode is taken directly from the spec (sections "Uplift Skill: Phase Hierarchy" through "Phase 8: Report"). The file should include:

- YAML frontmatter (name, description, allowed-tools, inputs, outputs) — from spec lines 424-443
- Phase overview table — from spec lines 446-457
- Phase 1: Detect — from spec lines 459-474
- Phase 2: Inventory — from spec lines 476-515, with structured `{ path, platform }` records and `skill.dir` distinction
- Phase 3: Recommend — from spec lines 517-533, Codex packaging decision
- Phase 4: Generate — from spec lines 535-591, expanded manifest table with platform fields and conditions
- Phase 5: Port — from spec lines 593-623, Copilot hook generation, Gemini hook guidance
- Phase 6: Document — from spec lines 625-686, install docs for all platforms with Write() calls
- Phase 7: Bootstrap — from spec lines 688-711, unchanged from current
- Phase 8: Report — from spec lines 713-747, structured artifact display
- State flow diagram
- Reference documentation section
- Related skills section pointing to assessing-plugin-portability

The implementer should read the spec sections and produce the SKILL.md following the bp-assess exemplar pattern.

- [ ] **Step 2: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "feat: rewrite uplift skill with 8 phases, Codex/Copilot support, install docs"
```

---

### Task 10: Delete old auditing skill and clean up

**Files:**
- Delete: `skills/auditing-plugin-portability/SKILL.md`
- Delete: `skills/auditing-plugin-portability/` directory (should be empty after Task 1)

- [ ] **Step 1: Delete the old auditing skill directory**

```bash
rm -rf skills/auditing-plugin-portability/
```

- [ ] **Step 2: Verify the new skill is in place**

```bash
ls skills/assessing-plugin-portability/SKILL.md
```

Expected: file exists.

- [ ] **Step 3: Verify directory structure matches the spec**

```bash
find lib/ -type f | sort
find skills/ -type f -name "*.md" | sort
```

Expected `lib/` structure:
```
lib/patterns/detection-algorithm.md
lib/patterns/rubric-framework.md
lib/patterns/manifest-generation.md
lib/patterns/hook-merging.md
lib/patterns/bootstrapping.md
lib/patterns/injection-checks.md
lib/patterns/platforms/claude-code.md
lib/patterns/platforms/cursor.md
lib/patterns/platforms/gemini-cli.md
lib/patterns/platforms/opencode.md
lib/patterns/platforms/copilot-cli.md
lib/patterns/platforms/codex.md
lib/references/copilot-tools.md
lib/references/codex-tools.md
lib/references/gemini-tools.md
lib/templates/hooks/session-start.sh
lib/templates/hooks/run-hook.cmd
lib/templates/install-docs/claude-code.md
lib/templates/install-docs/cursor.md
lib/templates/install-docs/gemini-cli.md
lib/templates/install-docs/opencode.md
lib/templates/install-docs/copilot-cli.md
lib/templates/install-docs/codex.md
```

Expected `skills/` structure:
```
skills/assessing-plugin-portability/SKILL.md
skills/uplifting-a-plugin/SKILL.md
```

- [ ] **Step 4: Commit**

```bash
git add -A skills/auditing-plugin-portability/
git commit -m "chore: remove old auditing-plugin-portability skill (replaced by assessing)"
```

---

### Task 11: Update repo manifests and context files

**Files:**
- Modify: `.claude-plugin/plugin.json` — update skills list
- Modify: `.cursor-plugin/plugin.json` — update skills list
- Modify: `AGENTS.md` — update skill references
- Modify: `GEMINI.md` — update `@` includes
- Modify: `gemini-extension.json` — no change needed (auto-discovers)

- [ ] **Step 1: Check current AGENTS.md for auditing references**

```bash
grep -n "auditing" AGENTS.md
```

- [ ] **Step 2: Update AGENTS.md — replace auditing references with assessing**

Replace any reference to `auditing-plugin-portability` with `assessing-plugin-portability` in `AGENTS.md`.

- [ ] **Step 3: Check current GEMINI.md for auditing references**

```bash
grep -n "auditing" GEMINI.md
```

- [ ] **Step 4: Update GEMINI.md — replace auditing skill includes with assessing**

Replace `@./skills/auditing-plugin-portability/SKILL.md` with `@./skills/assessing-plugin-portability/SKILL.md` and update the corresponding gemini-tools.md reference.

- [ ] **Step 5: Check plugin.json files for skill path references**

```bash
grep -r "auditing" .claude-plugin/ .cursor-plugin/
```

- [ ] **Step 6: Update plugin manifests if they reference the old skill name**

Update any references from `auditing-plugin-portability` to `assessing-plugin-portability`.

- [ ] **Step 7: Commit**

```bash
git add AGENTS.md GEMINI.md .claude-plugin/ .cursor-plugin/
git commit -m "chore: update manifests and context files for skill rename"
```

---

### Task 12: Final verification and push

- [ ] **Step 1: Verify all files referenced in the spec exist**

```bash
# Spec-defined files
for f in \
  lib/patterns/detection-algorithm.md \
  lib/patterns/rubric-framework.md \
  lib/patterns/manifest-generation.md \
  lib/patterns/hook-merging.md \
  lib/patterns/bootstrapping.md \
  lib/patterns/injection-checks.md \
  lib/patterns/platforms/claude-code.md \
  lib/patterns/platforms/cursor.md \
  lib/patterns/platforms/gemini-cli.md \
  lib/patterns/platforms/opencode.md \
  lib/patterns/platforms/copilot-cli.md \
  lib/patterns/platforms/codex.md \
  lib/references/copilot-tools.md \
  lib/references/codex-tools.md \
  lib/references/gemini-tools.md \
  lib/templates/hooks/session-start.sh \
  lib/templates/hooks/run-hook.cmd \
  lib/templates/install-docs/claude-code.md \
  lib/templates/install-docs/cursor.md \
  lib/templates/install-docs/gemini-cli.md \
  lib/templates/install-docs/opencode.md \
  lib/templates/install-docs/copilot-cli.md \
  lib/templates/install-docs/codex.md \
  skills/assessing-plugin-portability/SKILL.md \
  skills/uplifting-a-plugin/SKILL.md; do
  if [ ! -f "$f" ]; then echo "MISSING: $f"; fi
done
echo "Check complete"
```

Expected: no MISSING lines, only "Check complete".

- [ ] **Step 2: Verify no old files remain**

```bash
ls skills/auditing-plugin-portability/ 2>/dev/null && echo "ERROR: old skill still exists" || echo "OK: old skill removed"
ls skills/uplifting-a-plugin/patterns/ 2>/dev/null && echo "ERROR: old patterns still exist" || echo "OK: old patterns removed"
ls skills/uplifting-a-plugin/references/ 2>/dev/null && echo "ERROR: old references still exist" || echo "OK: old references removed"
```

Expected: all OK lines.

- [ ] **Step 3: Verify cross-references in SKILL.md files**

```bash
# Check that assess skill references lib files correctly
grep "lib/patterns/" skills/assessing-plugin-portability/SKILL.md
# Check that uplift skill references lib files correctly
grep "lib/patterns/" skills/uplifting-a-plugin/SKILL.md
```

Expected: references to `lib/patterns/detection-algorithm.md`, `lib/patterns/rubric-framework.md`, `lib/patterns/platforms/`, `lib/patterns/manifest-generation.md`, `lib/patterns/hook-merging.md`, `lib/patterns/bootstrapping.md`, `lib/patterns/injection-checks.md`.

- [ ] **Step 4: Push to GitHub**

```bash
git push origin main
```
