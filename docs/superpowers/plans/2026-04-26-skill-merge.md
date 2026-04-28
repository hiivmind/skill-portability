# Skill Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge `assessing-plugin-portability` and `uplifting-a-plugin` into a single `plugin-portability` skill with Phase 0 intent detection via AskUserQuestion.

**Architecture:** The merged skill is a workflow orchestrator (~150-200 lines) that references external pseudocode files. Phase 0a asks mode + platforms before scanning, Phase 0b asks uplift target after detection (shape-informed). Assessment always runs full scoring. Uplift phases are gated by ALLOWED_CATEGORIES table and per-platform depth.

**Tech Stack:** Markdown, YAML. No runtime code — all LLM-interpreted.

**Spec:** `docs/superpowers/specs/2026-04-26-skill-merge-design.md`

---

## File Map

### New Files
| File | Responsibility |
|------|---------------|
| `skills/plugin-portability/SKILL.md` | Merged workflow orchestrator |
| `skills/plugin-portability/references/codex-tools.md` | Pointer to `lib/references/codex-tools.md` |
| `skills/plugin-portability/references/gemini-tools.md` | Pointer to `lib/references/gemini-tools.md` |
| `lib/patterns/inventory.md` | Consolidated inventory pseudocode |

### Modified Files
| File | Change |
|------|--------|
| `lib/patterns/platforms/claude-code.yaml` | Add `template` field to fixable conditions |
| `lib/patterns/platforms/cursor.yaml` | Add `template` field to fixable conditions |
| `lib/patterns/platforms/gemini-cli.yaml` | Add `template` field to fixable conditions |
| `lib/patterns/platforms/codex.yaml` | Add `template` field to fixable conditions |
| `lib/patterns/platforms/antigravity.yaml` | Add `template` field to fixable conditions |
| `lib/patterns/platforms/openclaw.yaml` | Add `template` field to fixable conditions |
| `skills/using-plugin-portability/SKILL.md` | Reference `plugin-portability` |

### Removed Files
| File | Reason |
|------|--------|
| `skills/assessing-plugin-portability/SKILL.md` | Folded into merged skill |
| `skills/assessing-plugin-portability/references/codex-tools.md` | Moved |
| `skills/assessing-plugin-portability/references/gemini-tools.md` | Moved |
| `skills/uplifting-a-plugin/SKILL.md` | Folded into merged skill |
| `skills/uplifting-a-plugin/references/codex-tools.md` | Moved |
| `skills/uplifting-a-plugin/references/gemini-tools.md` | Moved |

---

## Task 1: Populate `template` Field in Platform YAML Rubrics

**Files:**
- Modify: `lib/patterns/platforms/claude-code.yaml`
- Modify: `lib/patterns/platforms/cursor.yaml`
- Modify: `lib/patterns/platforms/gemini-cli.yaml`
- Modify: `lib/patterns/platforms/codex.yaml`
- Modify: `lib/patterns/platforms/antigravity.yaml`
- Modify: `lib/patterns/platforms/openclaw.yaml`

Every condition that can be fixed by generating or merging an artifact needs a `template` field. Conditions that are assessment-only (judgement about quality, no artifact to generate) leave `template` absent.

- [ ] **Step 1: Add `template` fields to `claude-code.yaml`**

Read the file. For each condition, determine if a template in `lib/templates/` can fix it. Add the `template` field with the path relative to `lib/templates/`. Use `?merge` suffix for conditions that fix existing files (e.g., missing fields in an existing manifest).

Mapping for Claude Code:

| Condition ID | Template Path |
|---|---|
| `claude.1_manifest.plugin_json.exists` | `manifests/claude-plugin/plugin.json.tmpl` |
| `claude.1_manifest.plugin_json.required_fields` | `manifests/claude-plugin/plugin.json.tmpl?merge` |
| `claude.1_manifest.plugin_json.keywords` | `manifests/claude-plugin/plugin.json.tmpl?merge` |
| `claude.1_manifest.marketplace_json.exists` | `manifests/claude-plugin/marketplace.json.tmpl` |
| `claude.1_manifest.marketplace_json.valid_entries` | `manifests/claude-plugin/marketplace.json.tmpl?merge` |
| `claude.3_context.claude_md.exists` | `context-files/CLAUDE.md.tmpl` |
| `claude.4_hooks.hooks_json.exists` | `hooks/hooks.json.tmpl` |
| All `claude.2_skills.*` | (no template — skills are authored, not generated) |
| All `claude.5_toolmap.*` | (no template — Claude is reference platform) |
| All `claude.6_install.*` judgement conditions | (no template — prose quality) |
| All `claude.7_runtime.*` | (no template — MCP/agents are authored) |

Add `template:` line after the `check:` block in each applicable condition.

- [ ] **Step 2: Add `template` fields to `cursor.yaml`**

| Condition ID | Template Path |
|---|---|
| `cursor.1_manifest.plugin_json.exists` | `manifests/cursor-plugin/plugin.json.tmpl` |
| `cursor.1_manifest.plugin_json.required_fields` | `manifests/cursor-plugin/plugin.json.tmpl?merge` |
| `cursor.1_manifest.plugin_json.conditional_keys` | `manifests/cursor-plugin/plugin.json.tmpl?merge` |
| `cursor.1_manifest.marketplace_json.exists` | `manifests/cursor-plugin/marketplace.json.tmpl` |
| `cursor.3_context.agents_md.exists` | `context-files/AGENTS.md.tmpl` |
| `cursor.4_hooks.hooks_json.exists` | `hooks/hooks-cursor.json.tmpl` |
| `cursor.2_skills.frontmatter.*` | (no template — skills authored) |
| `cursor.5_toolmap.model_mapping.*` | (no template — frontmatter is authored) |
| Judgement conditions | (no template) |

- [ ] **Step 3: Add `template` fields to `gemini-cli.yaml`**

| Condition ID | Template Path |
|---|---|
| `gemini.1_manifest.extension_json.exists` | `manifests/gemini-extension.json.tmpl` |
| `gemini.1_manifest.extension_json.required_fields` | `manifests/gemini-extension.json.tmpl?merge` |
| `gemini.1_manifest.extension_json.context_filename` | `manifests/gemini-extension.json.tmpl?merge` |
| `gemini.3_context.gemini_md.exists` | `context-files/GEMINI.md.tmpl` |
| `gemini.3_context.gemini_md.at_includes_skills` | `context-files/GEMINI.md.tmpl?merge` |
| `gemini.3_context.gemini_md.at_includes_sidecars` | `context-files/GEMINI.md.tmpl?merge` |

- [ ] **Step 4: Add `template` fields to `codex.yaml`**

| Condition ID | Template Path |
|---|---|
| `codex.1_manifest.plugin_json.exists` | `manifests/codex-plugin/plugin.json.tmpl` |
| `codex.1_manifest.plugin_json.required_fields` | `manifests/codex-plugin/plugin.json.tmpl?merge` |
| `codex.1_manifest.marketplace_json.exists` | `manifests/codex-plugin/marketplace.json.tmpl` |
| `codex.3_context.agents_md.skill_coverage` | `context-files/AGENTS.md.tmpl?merge` |

- [ ] **Step 5: Add `template` fields to `antigravity.yaml`**

| Condition ID | Template Path |
|---|---|
| `antigravity.1_manifest.package_json.exists` | `manifests/antigravity/package.json.tmpl` |
| `antigravity.1_manifest.package_json.required_fields` | `manifests/antigravity/package.json.tmpl?merge` |
| `antigravity.3_context.agents_md.exists` | `context-files/AGENTS.md.tmpl` |

- [ ] **Step 6: Add `template` fields to `openclaw.yaml`**

| Condition ID | Template Path |
|---|---|
| `openclaw.1_manifest.openclaw_json.exists` | `manifests/openclaw/openclaw.plugin.json.tmpl` |
| `openclaw.1_manifest.openclaw_json.required_fields` | `manifests/openclaw/openclaw.plugin.json.tmpl?merge` |
| `openclaw.3_context.agents_md.exists` | `context-files/AGENTS.md.tmpl` |

- [ ] **Step 7: Validate all YAML still parses**

```bash
for f in lib/patterns/platforms/*.yaml; do
  python3 -c "import yaml; yaml.safe_load(open('$f'))" && echo "OK: $f" || echo "FAIL: $f"
done
```
Expected: All OK

- [ ] **Step 8: Verify template paths exist**

```bash
grep -roh 'template: [^ ]*' lib/patterns/platforms/*.yaml | sed 's/template: //' | sed 's/?merge//' | sort -u | while read tmpl; do
  if [ -f "lib/templates/$tmpl" ]; then echo "OK: $tmpl"; else echo "MISSING: $tmpl"; fi
done
```
Expected: All OK (no MISSING)

- [ ] **Step 9: Commit**

```bash
git add lib/patterns/platforms/*.yaml
git commit -m "feat: populate template field on fixable conditions in all 6 rubrics

Every condition that can be fixed by artifact generation now has a template
field. Uses ?merge suffix for conditions targeting existing files."
```

---

## Task 2: Create Consolidated Inventory Pattern

**Files:**
- Create: `lib/patterns/inventory.md`

This merges the assessment skill's 7 inventory substeps with the uplift skill's asset discovery into a single pass.

- [ ] **Step 1: Read both skills' inventory phases for reference**

Read `skills/assessing-plugin-portability/SKILL.md` lines covering Phase 2 (inventory substeps 2.1-2.7) and `skills/uplifting-a-plugin/SKILL.md` lines covering Phase 2 (discover assets + check conflicts).

- [ ] **Step 2: Create `lib/patterns/inventory.md`**

```markdown
# Inventory

Unified asset and readiness inventory. Run once, results used by both
scoring (Phase 3) and generation (Phases 5-9).

Referenced by `skills/plugin-portability/SKILL.md`.

---

## Inventory Algorithm

```pseudocode
INVENTORY(plugin_path, computed):

  ## 2.1 Discover Assets

  computed.skills = []
  FOR skill_path IN glob(plugin_path + "/skills/*/SKILL.md"):
    fm = parse_frontmatter(skill_path)
    computed.skills.append({
      path: skill_path,
      dir: dirname(skill_path),
      name: fm.get("name", basename(dirname(skill_path))),
      description: fm.get("description", ""),
      frontmatter: fm
    })

  computed.agents = glob(plugin_path + "/agents/*.md")
  computed.commands = glob(plugin_path + "/commands/*")
  computed.hooks = {
    json: file_exists(plugin_path + "/hooks/hooks.json"),
    cursor: file_exists(plugin_path + "/hooks/hooks-cursor.json"),
    run_hook_cmd: file_exists(plugin_path + "/hooks/run-hook.cmd")
  }

  ## 2.2 Check Platform Manifests

  manifest_checks = [
    { platform: "claude-code",  path: ".claude-plugin/plugin.json" },
    { platform: "claude-code",  path: ".claude-plugin/marketplace.json" },
    { platform: "cursor",       path: ".cursor-plugin/plugin.json" },
    { platform: "cursor",       path: ".cursor-plugin/marketplace.json" },
    { platform: "gemini-cli",   path: "gemini-extension.json" },
    { platform: "codex",        path: ".codex-plugin/plugin.json" },
    { platform: "codex",        path: ".agents/plugins/marketplace.json" },
    { platform: "antigravity",  path: "package.json" },
    { platform: "openclaw",     path: "openclaw.plugin.json" }
  ]

  computed.manifest_results = []
  FOR check IN manifest_checks:
    status = "PRESENT" IF file_exists(plugin_path + "/" + check.path) ELSE "MISSING"
    computed.manifest_results.append({ platform: check.platform, path: check.path, status: status })

  ## 2.3 Check Context Files

  context_checks = [
    { platform: "claude-code",  path: "CLAUDE.md" },
    { platform: "cursor",       path: "AGENTS.md" },
    { platform: "gemini-cli",   path: "GEMINI.md" },
    { platform: "codex",        path: "AGENTS.md" },
    { platform: "antigravity",  path: "AGENTS.md" },
    { platform: "antigravity",  path: "GEMINI.md" },
    { platform: "openclaw",     path: "AGENTS.md" }
  ]

  computed.context_results = []
  FOR check IN context_checks:
    status = "PRESENT" IF file_exists(plugin_path + "/" + check.path) ELSE "MISSING"
    computed.context_results.append({ platform: check.platform, path: check.path, status: status })

  ## 2.4 Check Per-Skill Sidecars

  computed.sidecar_results = []
  sidecar_files = ["codex-tools.md", "gemini-tools.md"]
  FOR skill IN computed.skills:
    FOR sidecar IN sidecar_files:
      sidecar_path = skill.dir + "/references/" + sidecar
      status = "PRESENT" IF file_exists(sidecar_path) ELSE "MISSING"
      computed.sidecar_results.append({ skill: skill.name, sidecar: sidecar, status: status })

  ## 2.5 Check Frontmatter Compatibility

  computed.frontmatter_results = []
  FOR skill IN computed.skills:
    fm = skill.frontmatter
    issues = []
    IF "name" NOT IN fm: issues.append("missing name")
    IF "description" NOT IN fm: issues.append("missing description")
    computed.frontmatter_results.append({ skill: skill.name, issues: issues })

  ## 2.6 Check Hooks

  computed.hook_results = {
    hooks_json: {},
    hooks_cursor_json: {}
  }
  IF computed.hooks.json:
    hooks_data = read_json(plugin_path + "/hooks/hooks.json")
    FOR event IN hooks_data.get("hooks", {}):
      computed.hook_results.hooks_json[event] = hooks_data["hooks"][event]
  IF computed.hooks.cursor:
    cursor_data = read_json(plugin_path + "/hooks/hooks-cursor.json")
    FOR event IN cursor_data:
      IF event != "version":
        computed.hook_results.hooks_cursor_json[event] = cursor_data[event]

  ## 2.7 Check Session-Start Injection

  computed.injection_results = check_injection(plugin_path, computed.metadata.name)
  # See lib/patterns/injection-checks.md for the 7-component check

  ## 2.8 Collect Existing Files for Conflict Detection

  computed.existing_files = set()
  FOR result IN computed.manifest_results:
    IF result.status == "PRESENT":
      computed.existing_files.add(result.path)
  FOR result IN computed.context_results:
    IF result.status == "PRESENT":
      computed.existing_files.add(result.path)
  # Also add hook files, sidecar files, etc.
  IF computed.hooks.json: computed.existing_files.add("hooks/hooks.json")
  IF computed.hooks.cursor: computed.existing_files.add("hooks/hooks-cursor.json")
  FOR result IN computed.sidecar_results:
    IF result.status == "PRESENT":
      computed.existing_files.add(result.skill + "/references/" + result.sidecar)
```
```

- [ ] **Step 3: Verify the file is well-formed**

Run: `wc -l lib/patterns/inventory.md`
Expected: ~120-130 lines

- [ ] **Step 4: Commit**

```bash
git add lib/patterns/inventory.md
git commit -m "feat: add consolidated inventory pattern

Merges assessment's 7 inventory substeps with uplift's asset discovery
into a single pass. Results used by both scoring and generation."
```

---

## Task 3: Create Merged `plugin-portability` Skill

**Files:**
- Create: `skills/plugin-portability/SKILL.md`

This is the main deliverable — a concise workflow orchestrator that references external pseudocode files.

- [ ] **Step 1: Read both current skills for content to merge**

Read `skills/assessing-plugin-portability/SKILL.md` and `skills/uplifting-a-plugin/SKILL.md` fully. Extract the unique elements from each that need to be preserved in the merged skill.

- [ ] **Step 2: Create `skills/plugin-portability/SKILL.md`**

Write the merged skill. It should be ~150-200 lines. Structure:

```markdown
---
name: plugin-portability
description: >
  Use when you need to assess or uplift a plugin for multi-platform portability.
  Gauges intent upfront (diagnostic or uplift, which platforms, uplift target),
  then runs shared detection, inventory, and condition-driven scoring across all
  platforms. For uplift, generates missing artifacts with fixes: annotations
  linked to rubric conditions. Supports incremental uplift for viable+ platforms.
  Platforms: Claude Code, Cursor, Gemini CLI, Codex, Antigravity, OpenClaw.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Plugin Portability

Assess or uplift a plugin for multi-platform portability. Single entry point
for both diagnostic assessment and artifact generation.

**Input:** `plugin_path` (string, required) — Path to the plugin root directory.
**Output:** Assessment report (always) + generated artifacts (uplift mode only).

> **Detection Algorithm:** `lib/patterns/detection-algorithm.md`
> **Inventory:** `lib/patterns/inventory.md`
> **Rubric Framework:** `lib/patterns/rubric-framework.md`
> **Platform Rubrics:** `lib/patterns/platforms/<platform>.yaml`
> **Lookup Tables:** `lib/references/platform-mappings.md`
> **Manifest Generation:** `lib/patterns/manifest-generation.md`
> **Hook Merging:** `lib/patterns/hook-merging.md`
> **Bootstrapping:** `lib/patterns/bootstrapping.md`
> **Injection Checks:** `lib/patterns/injection-checks.md`
> **Install Doc Templates:** `lib/templates/install-docs/`

---

## Overview

| Phase | Description |
| ----- | ----------- |
| **Phase 0a: Intent** | Ask mode (assess/uplift) + platforms via AskUserQuestion |
| **Phase 1: Detect** | Scan metadata, elect canonical, build model, classify shape |
| **Phase 2: Inventory** | Unified asset + readiness inventory |
| **Phase 0b: Uplift Target** | If uplift: ask uplift target (shape-informed recommendation) |
| **Phase 3: Score** | Full condition-driven assessment per platform |
| **Phase 4: Report** | Detailed assessment report. If assess mode: STOP |
| **Phase 5: Generate** | Uplift: manifests, context files, sidecars |
| **Phase 6: Port** | Uplift: hook adaptation |
| **Phase 7: Document** | Uplift: install documentation |
| **Phase 8: Bootstrap** | Uplift: session-start injection |
| **Phase 9: Summary** | Uplift: files created, merged, manual actions |

**Minimum starting state:** At least one `skills/*/SKILL.md` with frontmatter,
or any platform manifest file.

---

## Phase 0a: Intent

Ask before any file scanning. Use `AskUserQuestion` on Claude Code, or
platform-equivalent structured input on other platforms.

```pseudocode
INTENT_UPFRONT():
  mode = AskUserQuestion(
    question: "Assess only (diagnostic, read-only) or Uplift (generate missing artifacts)?",
    header: "Mode",
    options: [
      { label: "Assess", description: "Score portability across platforms. Read-only, no changes." },
      { label: "Uplift", description: "Generate missing platform artifacts to close portability gaps." }
    ],
    multiSelect: false
  )

  platforms = AskUserQuestion(
    question: "Which platforms to target?",
    header: "Platforms",
    options: [
      { label: "All platforms", description: "Claude Code, Cursor, Gemini, Codex, Antigravity, OpenClaw" },
      { label: "Select platforms", description: "Choose specific platforms" }
    ],
    multiSelect: false
  )

  IF platforms == "Select platforms":
    platforms = AskUserQuestion(
      question: "Select target platforms:",
      header: "Platforms",
      options: [
        { label: "Claude Code",  description: "Reference platform" },
        { label: "Cursor",       description: "VS Code fork with rules, hooks, MCP" },
        { label: "Gemini CLI",   description: "Google CLI with @ includes" },
        { label: "Codex",        description: "OpenAI CLI with TOML agents" },
        { label: "Antigravity",  description: "Google VS Code fork, OpenVSX" },
        { label: "OpenClaw",     description: "TypeScript gateway with plugin SDK" }
      ],
      multiSelect: true
    )
  ELSE:
    platforms = ["claude-code", "cursor", "gemini-cli", "codex", "antigravity", "openclaw"]

  RETURN { mode, platforms }
```

---

## Phase 1: Detect

Run the shared detection algorithm. See `lib/patterns/detection-algorithm.md`.

```pseudocode
DETECT(plugin_path):
  computed.sources = scan_metadata_sources(plugin_path)
  IF len(computed.sources) == 0:
    DISPLAY "No recognisable plugin signals found in {plugin_path}."
    DISPLAY "Provide at least one platform manifest or one skills/*/SKILL.md"
    DISPLAY "with name and description frontmatter."
    EXIT

  computed.canonical = elect_canonical(computed.sources)
  computed.metadata  = build_metadata_model(computed.sources)
  computed.shape     = classify_shape(computed.sources)
  print_inference_summary(computed.metadata, computed.canonical)
```

---

## Phase 2: Inventory

Run the unified inventory. See `lib/patterns/inventory.md`.

```pseudocode
INVENTORY(plugin_path, computed)
# Populates: computed.skills, computed.agents, computed.commands, computed.hooks,
#   computed.manifest_results, computed.context_results, computed.sidecar_results,
#   computed.frontmatter_results, computed.hook_results, computed.injection_results,
#   computed.existing_files
```

---

## Phase 0b: Uplift Target

If uplift mode, ask the user to confirm the shape-derived uplift target.

```pseudocode
IF intent.mode != "uplift":
  SKIP

IF computed.shape == "bare-skill-repo" AND len(computed.skills) <= 3:
  recommended = "skill-first"
  reason = "Bare skill repo with " + str(len(computed.skills)) + " skills"
ELIF computed.shape == "curated-distribution":
  recommended = "curated-note-only"
  reason = "Curated distribution (marketplace, no source skills)"
ELSE:
  recommended = "full-portable-plugin"
  reason = computed.shape + " with " + str(len(computed.skills)) + " skills"

computed.uplift_target = AskUserQuestion(
  question: "Repo detected as: " + reason + ". What level of uplift?",
  header: "Uplift target",
  options: [
    # Recommended option first with "(Recommended)" suffix
    { label: recommended_label + " (Recommended)", description: recommended_desc },
    ...other options...
  ],
  multiSelect: false
)
```

See spec for full option construction logic.

---

## Phase 3: Score

Full condition-driven assessment. See `lib/patterns/rubric-framework.md`.

```pseudocode
SCORE(computed, intent.platforms):
  FOR platform IN intent.platforms:
    rubric = load_yaml("lib/patterns/platforms/" + platform + ".yaml")
    # Evaluate each condition (checkable via JIT script, judgement via LLM)
    # Compute category scores using hybrid formula
    # Compute band and percentage
    computed.scores[platform] = { categories, band, percentage, results, failing }

  computed.blockers = detect_blockers(computed)

  # Auto-derive per-platform depth for uplift
  IF intent.mode == "uplift":
    FOR platform IN intent.platforms:
      IF computed.scores[platform].band IN ["strong", "viable"]:
        computed.recommendation_for[platform] = "incremental"
      ELSE:
        computed.recommendation_for[platform] = "full"
```

---

## Phase 4: Report

Always emitted.

```pseudocode
REPORT(computed, intent):
  DISPLAY repo shape, metadata summary
  FOR platform IN intent.platforms:
    DISPLAY platform band, percentage, per-category scores
    DISPLAY per-condition pass/fail with condition IDs
  DISPLAY blockers

  IF intent.mode == "uplift":
    DISPLAY uplift strategy per platform
    DISPLAY artifacts to generate (from failing conditions with template field)

  IF intent.mode == "assess":
    STOP
```

---

## Phases 5-9: Uplift

Gated by `ALLOWED_CATEGORIES` table and per-platform depth.
See `lib/patterns/manifest-generation.md`, `lib/patterns/hook-merging.md`,
`lib/patterns/bootstrapping.md`.

```pseudocode
ALLOWED_CATEGORIES = {
  "skill-first":          ["2_skills", "3_context", "5_toolmap", "6_install"],
  "full-portable-plugin": ["1_manifest", "2_skills", "3_context", "4_hooks",
                           "5_toolmap", "6_install", "7_runtime"],
  "curated-note-only":    ["6_install"]
}

allowed = ALLOWED_CATEGORIES[computed.uplift_target]

# Phase 5: Generate — for each failing condition in allowed categories:
#   - create: render template if target doesn't exist
#   - merge: update existing file with missing fields
#   - none (no template): add to manual_actions
#   Each action carries: # fixes: {condition.id}

# Phase 6: Port — hook adaptation (skipped if 4_hooks not in allowed)
# Phase 7: Document — install docs (always in allowed)
# Phase 8: Bootstrap — session-start injection (skipped if curated-note-only)
```

---

## Phase 9: Summary

```pseudocode
SUMMARY(computed):
  DISPLAY files created, files merged/updated, manual actions required
```
```

- [ ] **Step 3: Verify line count**

Run: `wc -l skills/plugin-portability/SKILL.md`
Expected: 150-200 lines

- [ ] **Step 4: Commit**

```bash
git add skills/plugin-portability/SKILL.md
git commit -m "feat: create merged plugin-portability skill

Single entry point replacing assessing-plugin-portability and
uplifting-a-plugin. Phase 0 intent via AskUserQuestion, shared
detection/inventory/scoring, conditional uplift phases."
```

---

## Task 4: Create Reference File Pointers

**Files:**
- Create: `skills/plugin-portability/references/codex-tools.md`
- Create: `skills/plugin-portability/references/gemini-tools.md`

- [ ] **Step 1: Create the reference directory and pointer files**

```bash
mkdir -p skills/plugin-portability/references
```

Write `skills/plugin-portability/references/codex-tools.md`:
```
See [lib/references/codex-tools.md](../../lib/references/codex-tools.md) for the full Codex tool mapping.
```

Write `skills/plugin-portability/references/gemini-tools.md`:
```
See [lib/references/gemini-tools.md](../../lib/references/gemini-tools.md) for the full Gemini tool mapping.
```

- [ ] **Step 2: Commit**

```bash
git add skills/plugin-portability/references/
git commit -m "feat: add reference pointers for merged skill"
```

---

## Task 5: Update `using-plugin-portability`

**Files:**
- Modify: `skills/using-plugin-portability/SKILL.md`

- [ ] **Step 1: Rewrite the skill table and descriptions**

Replace the current content (which lists two separate skills) with:

```markdown
---
name: using-plugin-portability
description: Use when starting a session with the plugin-portability plugin. Session-start bootstrapping that lists available skills and platform-specific invocation instructions.
---

# Using Skill Portability

This plugin provides the following skills:

| Skill | Description |
| ----- | ----------- |
| `plugin-portability` | Assess or uplift a plugin for multi-platform portability. Asks intent upfront (assess/uplift, platforms, uplift target), runs condition-driven scoring, and optionally generates missing artifacts. Platforms: Claude Code, Cursor, Gemini CLI, Codex, Antigravity, OpenClaw. |

## How to Invoke

**Claude Code / Cursor:** Use the `Skill` tool with skill name `plugin-portability`.

**Gemini CLI:** Use the `activate_skill` tool with skill name `plugin-portability`.

**Antigravity / OpenClaw / Codex:** Skills are auto-discovered. Follow the SKILL.md instructions directly.

## Tool Name Mapping

Skills use Claude Code tool names. See `lib/references/` for platform-specific equivalents.
```

- [ ] **Step 2: Commit**

```bash
git add skills/using-plugin-portability/SKILL.md
git commit -m "chore: update using-plugin-portability for merged skill name"
```

---

## Task 6: Remove Old Skill Directories

**Files:**
- Remove: `skills/assessing-plugin-portability/` (entire directory)
- Remove: `skills/uplifting-a-plugin/` (entire directory)

- [ ] **Step 1: Remove both directories**

```bash
git rm -r skills/assessing-plugin-portability/
git rm -r skills/uplifting-a-plugin/
```

- [ ] **Step 2: Commit**

```bash
git commit -m "chore: remove old assessment and uplift skill directories

Replaced by unified skills/plugin-portability/SKILL.md"
```

---

## Task 7: Final Validation

- [ ] **Step 1: Verify no remaining references to old skill names**

```bash
grep -rn "assessing-plugin-portability\|uplifting-a-plugin" skills/ lib/ --include="*.md" --include="*.yaml" --include="*.tmpl" --include="*.sh"
```
Expected: No output

- [ ] **Step 2: Verify all template paths in rubrics exist**

```bash
grep -roh 'template: [^ ]*' lib/patterns/platforms/*.yaml | sed 's/template: //' | sed 's/?merge//' | sort -u | while read tmpl; do
  if [ -f "lib/templates/$tmpl" ]; then echo "OK: $tmpl"; else echo "MISSING: $tmpl"; fi
done
```
Expected: All OK

- [ ] **Step 3: Verify YAML rubrics still parse**

```bash
for f in lib/patterns/platforms/*.yaml; do
  python3 -c "import yaml; yaml.safe_load(open('$f'))" && echo "OK: $f" || echo "FAIL: $f"
done
```
Expected: All OK

- [ ] **Step 4: Verify skill structure**

```bash
ls skills/plugin-portability/SKILL.md skills/plugin-portability/references/codex-tools.md skills/plugin-portability/references/gemini-tools.md skills/using-plugin-portability/SKILL.md
```
Expected: All 4 files exist

```bash
ls skills/assessing-plugin-portability/ skills/uplifting-a-plugin/ 2>&1
```
Expected: "No such file or directory" for both

- [ ] **Step 5: Check for references to old skill names in pattern docs**

```bash
grep -rn "assessing-plugin-portability\|uplifting-a-plugin" lib/patterns/ --include="*.md"
```
Expected: No output. If any found, update those pattern docs.

- [ ] **Step 6: Commit any final fixes**

```bash
git add -A && git status
# Only commit if there are changes
git commit -m "chore: final validation cleanup for skill merge" 2>/dev/null || echo "Nothing to commit"
```
