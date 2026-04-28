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
> `lib/references/uplift-targets/registry.md` | `lib/references/templates/registry.md`
> `lib/patterns/hook-merging.md` | `lib/patterns/bootstrapping.md` | `lib/patterns/injection-checks.md`
> `lib/templates/install-docs/` | `lib/templates/manifests/` | `lib/templates/context-files/`

---

## Verification Gates

Every phase that depends on an external reference must read the file and
prove it was loaded before executing phase logic. Two patterns:

```pseudocode
LOAD_AND_VERIFY(path, proof):
  content = Read(path)
  IF content IS empty OR unreadable:
    HALT "Cannot proceed: {path} not found or empty"
  extracted = proof(content)
  DISPLAY "Loaded {path}: {extracted}"

GLOB_AND_VERIFY(pattern, proof):
  files = Glob(pattern)
  IF files IS empty:
    HALT "Cannot proceed: no files matching {pattern}"
  extracted = proof(files)
  DISPLAY "Found {pattern}: {extracted}"
```

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
        { label: "Antigravity",  description: "Google VS Code fork, .agents/skills/ auto-discovery" },
        { label: "OpenClaw",     description: "TypeScript gateway with plugin SDK hooks" }
      ],
      multiSelect: true
    )
  ELSE:
    platforms = ["claude-code", "cursor", "gemini-cli", "codex", "antigravity", "openclaw"]

  # Q3: Archetype
  archetype = AskUserQuestion(
    question: "What is this plugin's invocation pattern?",
    header: "Archetype",
    options: [
      { label: "On-demand",      description: "Called explicitly when the user needs it (e.g., portability tools, code generators)" },
      { label: "Always-present", description: "Governs workflows on every session — needs context injection (e.g., superpowers, single-purpose agents)" }
    ],
    multiSelect: false
  )

  RETURN { mode, platforms, archetype }
```

---

## Phase 1: Detect

```pseudocode
DETECT(plugin_path):
  LOAD_AND_VERIFY("lib/patterns/detection-algorithm.md",
    proof: content contains FUNCTION definitions for
      SCAN_METADATA_SOURCES, ELECT_CANONICAL, BUILD_METADATA_MODEL,
      PRINT_INFERENCE_SUMMARY, CLASSIFY_SHAPE)

  # Execute the algorithm as defined in detection-algorithm.md
  computed.sources  = scan_metadata_sources(plugin_path)
  IF len(computed.sources) == 0: DISPLAY "No plugin signals found."; EXIT
  computed.canonical = elect_canonical(computed.sources)
  computed.metadata  = build_metadata_model(computed.sources)
  computed.shape     = classify_shape(computed.sources)
  print_inference_summary(computed.metadata, computed.canonical)
```

---

## Phase 2: Inventory

```pseudocode
INVENTORY(plugin_path, computed):
  LOAD_AND_VERIFY("lib/patterns/inventory.md",
    proof: content contains substeps 2.1 through 2.8)

  # Execute the inventory as defined in inventory.md
  # Populates: computed.skills, computed.agents, computed.commands,
  # computed.hooks, computed.manifest_results, computed.context_results,
  # computed.sidecar_results, computed.frontmatter_results,
  # computed.hook_results, computed.injection_results,
  # computed.existing_files
```

---

## Phase 0b: Uplift Target

Runs AFTER detection (needs shape). Uplift mode only.

```pseudocode
INTENT_UPLIFT_TARGET(computed):
  IF intent.mode != "uplift": RETURN

  LOAD_AND_VERIFY("lib/references/uplift-targets/registry.md",
    proof: UPLIFT_TARGETS contains 3 entries:
      skill-first, full-portable-plugin, curated-note-only)

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

  # Q3: Build options from UPLIFT_TARGETS registry
  options = []
  FOR id, target IN UPLIFT_TARGETS:
    options.append({ label: title_case(id), description: target.description })
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

Always runs full scoring.

```pseudocode
SCORE(computed, platforms):
  LOAD_AND_VERIFY("lib/rubrics/rubric-framework.md",
    proof: content contains scoring formula with critical_pass/critical_count
      threshold and 4 bands: strong, viable, partial, weak)

  LOAD_AND_VERIFY("lib/references/platform-api.md",
    proof: content contains TYPE PlatformSpec and FUNCTION definitions for
      tool_name, hook_event, strip_fields, supported_tools)

  FOR platform IN platforms:
    LOAD_AND_VERIFY("lib/references/platforms/" + platform + ".md",
      proof: content contains REGISTRY[platform] with tools, hooks,
        manifest, frontmatter sections)

    LOAD_AND_VERIFY("lib/rubrics/" + platform + ".yaml",
      proof: file parses as YAML with categories containing conditions
        with id, type, check fields)

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

Derived from `lib/references/uplift-targets/registry.md`.

### Template action types

- **create** -- `template: manifests/foo.tmpl` -- render to target if file absent
- **merge** -- `template: manifests/foo.tmpl?merge` -- update existing file with missing fields
- **none** -- `template: null` -- assessment-only, reported as manual action

### Phase 5: Generate

```pseudocode
LOAD_AND_VERIFY("lib/references/uplift-targets/registry.md",
  proof: allowed_categories(computed.uplift_target) returns a non-empty list)

LOAD_AND_VERIFY("lib/references/templates/registry.md",
  proof: TEMPLATE_REGISTRY contains 12 entries)

LOAD_AND_VERIFY("lib/patterns/manifest-generation.md",
  proof: content contains 3 rendering modes: plain, conditional, builder
    and per-schema GENERATE functions)

allowed = allowed_categories(computed.uplift_target)

FOR platform IN intent.platforms:
  FOR condition IN computed.scores[platform].failing:
    IF condition.category NOT IN allowed: SKIP
    IF NOT condition.template:
      computed.manual_actions.append(condition); CONTINUE

    target_path = template_for_path(condition.template).target_path
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

### Phase 6: Port

```pseudocode
PORT(computed, intent):
  IF "4_hooks" NOT IN allowed: SKIP

  LOAD_AND_VERIFY("lib/patterns/hook-merging.md",
    proof: content contains GENERATE_CURSOR_HOOKS,
      GENERATE_CODEX_HOOKS, GENERATE_GEMINI_HOOK_GUIDANCE)

  # Execute hook porting as defined in hook-merging.md
```

### Phase 7: Document

```pseudocode
DOCUMENT(computed, intent):
  GLOB_AND_VERIFY("lib/templates/install-docs/**/*.md",
    proof: list template files found, at least one per target platform)

  FOR platform IN intent.platforms:
    LOAD_AND_VERIFY install doc template for platform
    # Generate install documentation from template
```

Always runs (`"6_install"` is in all allowed sets).

### Phase 8: Bootstrap

```pseudocode
BOOTSTRAP(computed, intent):
  IF computed.uplift_target == "curated-note-only": SKIP
  IF intent.archetype == "on-demand":
    REPORT "Bootstrapping: skipped (on-demand plugin — hooks and using-skill not applicable)"
    SKIP

  LOAD_AND_VERIFY("lib/patterns/bootstrapping.md",
    proof: content contains steps 4.1 through 4.8)

  # Execute bootstrapping as defined in bootstrapping.md
```

### Phase 9: Summary

```pseudocode
SUMMARY(computed):
  DISPLAY "## Files Created"   -- computed.created_files
  DISPLAY "## Files Updated"   -- computed.merged_files
  DISPLAY "## Manual Actions"  -- computed.manual_actions (condition.id + check)
```
