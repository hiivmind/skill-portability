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

Assess or uplift a plugin for multi-platform portability. Single entry point for both modes.

**Input:** `plugin_path` (string, required) -- path to plugin root directory.
**Output:** Assessment report; if uplift mode, also generated artifacts with `fixes:` annotations.

> **External references:**
> `lib/patterns/detection-algorithm.md` | `lib/patterns/inventory.md` | `lib/rubrics/rubric-framework.md`
> `lib/rubrics/*.yaml` | `lib/references/platform-api.md` | `lib/references/platforms/*.md` | `lib/patterns/manifest-generation.md`
> `lib/patterns/hook-merging.md` | `lib/patterns/bootstrapping.md` | `lib/patterns/injection-checks.md`
> `lib/templates/install-docs/` | `lib/templates/manifests/` | `lib/templates/context-files/`

---

## Overview

| Phase | Description | Runs |
|-------|-------------|------|
| **0a: Intent** | Q1 (mode) + Q2 (platforms) | Always |
| **1: Detect** | Scan metadata, elect canonical, classify shape | Always |
| **2: Inventory** | Discover all assets, manifests, sidecars, hooks, injection | Always |
| **0b: Uplift Target** | Q3 (shape-derived recommendation, user confirms) | Uplift only |
| **3: Score** | Full condition-driven rubric per platform | Always |
| **4: Report** | Per-platform scores, blockers, uplift strategy | Always; **assess mode STOPS here** |
| **5: Generate** | Manifests, context files, sidecars | Uplift only |
| **6: Port** | Hook adaptation across platforms | Uplift only |
| **7: Document** | Install docs per platform | Uplift only |
| **8: Bootstrap** | Session-start injection (opt-in) | Uplift only |
| **9: Summary** | Files created, merged, skipped, manual actions | Uplift only |

---

## Phase 0a: Intent

Runs BEFORE any file scanning. Two structured questions.

```pseudocode
INTENT_UPFRONT():
  # Q1: Mode
  mode = AskUserQuestion(
    question: "Assess only (diagnostic, read-only) or Uplift (generate missing artifacts)?",
    header: "Mode",
    options: [
      { label: "Assess", description: "Score portability across platforms. Read-only, no changes." },
      { label: "Uplift", description: "Generate missing platform artifacts to close portability gaps." }
    ],
    multiSelect: false
  )

  # Q2: Platforms
  platforms = AskUserQuestion(
    question: "Which platforms to target?",
    header: "Platforms",
    options: [
      { label: "All platforms", description: "Claude Code, Cursor, Gemini, Codex, Antigravity, OpenClaw" },
      { label: "Select platforms", description: "Choose specific platforms to assess or uplift" }
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
        { label: "Gemini CLI",   description: "Google CLI with @ includes and settings-based hooks" },
        { label: "Codex",        description: "OpenAI CLI with TOML agents and spawn_agent" },
        { label: "Antigravity",  description: "Google VS Code fork, OpenVSX, .agents/skills/" },
        { label: "OpenClaw",     description: "TypeScript gateway with plugin SDK hooks" }
      ],
      multiSelect: true
    )
  ELSE:
    platforms = ["claude-code", "cursor", "gemini-cli", "codex", "antigravity", "openclaw"]

  RETURN { mode, platforms }
```

---

## Phase 1: Detect

Follow `lib/patterns/detection-algorithm.md`.

```pseudocode
DETECT(plugin_path):
  computed.sources  = scan_metadata_sources(plugin_path)
  IF len(computed.sources) == 0: DISPLAY "No plugin signals found."; EXIT
  computed.canonical = elect_canonical(computed.sources)
  computed.metadata  = build_metadata_model(computed.sources)
  computed.shape     = classify_shape(computed.sources)
  print_inference_summary(computed.metadata, computed.canonical)
```

---

## Phase 2: Inventory

Follow `lib/patterns/inventory.md`. Populates:

- `computed.skills`, `computed.agents`, `computed.commands`, `computed.hooks`
- `computed.manifest_results`, `computed.context_results`, `computed.sidecar_results`
- `computed.frontmatter_results`, `computed.hook_results`, `computed.injection_results`
- `computed.existing_files` (for conflict detection during uplift)

---

## Phase 0b: Uplift Target

Runs AFTER detection (needs shape). Uplift mode only.

```pseudocode
INTENT_UPLIFT_TARGET(computed):
  IF intent.mode != "uplift": RETURN

  # Derive recommendation from shape
  IF computed.shape == "bare-skill-repo" AND len(computed.skills) <= 3:
    recommended = "skill-first"
    reason = "Bare skill repo with " + str(len(computed.skills)) + " skills"
  ELIF computed.shape == "curated-distribution":
    recommended = "curated-note-only"
    reason = "Curated distribution (marketplace, no source skills)"
  ELSE:
    recommended = "full-portable-plugin"
    reason = computed.shape + " with " + str(len(computed.skills)) + " skills"

  # Q3: Build options with "(Recommended)" suffix on derived choice
  options = [
    { label: "Skill-first",          description: "Sidecars, tool mapping, context files only." },
    { label: "Full portable plugin", description: "Manifests, context, hooks, install docs -- everything." },
    { label: "Curated note only",    description: "Documentation only. No generated artifacts." }
  ]
  FOR opt IN options:
    IF opt.label.lower().startswith(recommended.replace("-", " ")):
      opt.label += " (Recommended)"
      options = [opt] + [o for o in options if o != opt]

  computed.uplift_target = AskUserQuestion(
    question: "Repo detected as: " + reason + ". What level of uplift?",
    header: "Uplift target",
    options: options,
    multiSelect: false
  )
```

---

## Phase 3: Score

Always runs full scoring. References `lib/rubrics/rubric-framework.md` and `lib/rubrics/*.yaml`.

```pseudocode
SCORE(computed, platforms):
  FOR platform IN platforms:
    rubric = load_yaml("lib/rubrics/" + platform + ".yaml")
    FOR category IN rubric.categories:
      FOR condition IN category.conditions:
        passed = jit_evaluate(condition, computed)
        results[condition.id] = { passed, type: condition.type }
      category.score = compute_category_score(category, results)
    computed.scores[platform] = { categories, band, percentage, results, failing }
  computed.blockers = detect_blockers(computed)

  # Auto-derive per-platform depth (uplift mode only)
  IF intent.mode == "uplift":
    FOR platform IN platforms:
      IF computed.scores[platform].band IN ["strong", "viable"]:
        computed.recommendation_for[platform] = "incremental"
      ELSE:
        computed.recommendation_for[platform] = "full"
```

**Two-layer uplift:** Shape target (Phase 0b, user-confirmed) controls WHAT categories. Per-platform depth (auto from scores) controls HOW MUCH.

---

## Phase 4: Report

```pseudocode
REPORT(computed, intent):
  DISPLAY "## Repo Shape: " + computed.shape
  DISPLAY metadata summary table

  FOR platform IN intent.platforms:
    score = computed.scores[platform]
    DISPLAY "## " + platform + " -- " + score.band + " (" + score.percentage + "%)"
    FOR category IN score.categories:
      DISPLAY "### " + category.name + ": " + category.score + "/3"
      FOR condition IN category.conditions:
        DISPLAY ("pass" IF results[condition.id].passed ELSE "FAIL") + " " + condition.id

  DISPLAY blockers

  IF intent.mode == "uplift":
    DISPLAY uplift strategy per platform + artifacts to generate
  IF intent.mode == "assess":
    STOP
```

---

## Phases 5-9: Uplift

### Allowed categories by uplift target

```pseudocode
ALLOWED_CATEGORIES = {
  "skill-first":          ["2_skills", "3_context", "5_toolmap", "6_install"],
  "full-portable-plugin": ["1_manifest", "2_skills", "3_context", "4_hooks",
                           "5_toolmap", "6_install", "7_runtime"],
  "curated-note-only":    ["6_install"]
}
```

### Template action types

- **create** -- `template: manifests/foo.tmpl` -- render to target if file absent
- **merge** -- `template: manifests/foo.tmpl?merge` -- update existing file with missing fields
- **none** -- `template: null` -- assessment-only, reported as manual action

### Phase 5: Generate

```pseudocode
allowed = ALLOWED_CATEGORIES[computed.uplift_target]

FOR platform IN intent.platforms:
  FOR condition IN computed.scores[platform].failing:
    IF condition.category NOT IN allowed: SKIP
    IF NOT condition.template:
      computed.manual_actions.append(condition); CONTINUE

    target_path = resolve_target_path(condition.template, platform)
    action = parse_action(condition.template)  # "create" or "merge"

    IF action == "create" AND NOT exists(target_path):
      render(condition.template, computed.metadata)    # fixes: {condition.id}
    ELIF action == "merge" AND exists(target_path):
      merge_update(condition.template, target_path)    # fixes: {condition.id}
    ELIF action == "create" AND exists(target_path):
      computed.manual_actions.append(condition)         # exists but fails -- manual review
    ELSE:
      render(condition.template, computed.metadata)     # fixes: {condition.id}
```

### Phase 6: Port -- `lib/patterns/hook-merging.md`

Skipped if `"4_hooks" NOT IN allowed`.

### Phase 7: Document -- `lib/templates/install-docs/`

Always runs (`"6_install"` is in all allowed sets).

### Phase 8: Bootstrap -- `lib/patterns/bootstrapping.md`

Skipped if `uplift_target == "curated-note-only"`.

### Phase 9: Summary

```pseudocode
SUMMARY(computed):
  DISPLAY "## Files Created"   -- computed.created_files
  DISPLAY "## Files Updated"   -- computed.merged_files
  DISPLAY "## Manual Actions"  -- computed.manual_actions (condition.id + check)
```
