# Skill Merge: Unified Plugin Portability Skill

**Date:** 2026-04-26
**Status:** Approved design — implementation pending
**Scope:** Merge assessing-plugin-portability and uplifting-a-plugin into a single `plugin-portability` skill
**Depends on:** 2026-04-26-rubric-tightening-design.md (implemented)

## Problem

The two main skills (`assessing-plugin-portability` and `uplifting-a-plugin`)
have substantial duplication:

- Phase 1 (Detect) is 95% identical between both skills
- Manifest/context file path lists are duplicated
- Uplift contains an optional lightweight quick-assess that duplicates
  assessment's full scoring logic
- Both reference the same external pattern files

The uplift skill is ~763 lines and the assessment skill is ~564 lines. Merging
eliminates ~200 lines of duplication and creates a single entry point with a
cleaner flow: assess always runs, then optionally uplift.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Skill name | `plugin-portability` | Short, covers both modes |
| Intent detection | 2 upfront questions (mode + platforms) | Minimal user friction; everything else auto-derived from scores |
| Assessment depth | Always full | Scoring is read-only file checks, not expensive; ensures uplift decisions are fully informed |
| Incremental vs full | Auto-derived from scores | Viable+ platforms get incremental; no need to ask user |
| Pseudocode location | External files in `lib/patterns/` | Follows existing pattern; keeps SKILL.md as concise workflow orchestrator |
| `using-skill-portability` | Keep separate, update references | Serves different purpose (session-start injection); part of bootstrapping pattern |

## Design

### Phase Structure

```
Phase 0: Intent          — 2 upfront questions before any file scanning
Phase 1: Detect          — shared detection algorithm
Phase 2: Inventory       — unified inventory (new consolidated file)
Phase 3: Score           — full condition-driven assessment (always runs)
Phase 4: Report          — detailed assessment report (always emitted)
                          — IF mode == "assess": STOP
Phase 5: Generate        — uplift only: manifests, context files, sidecars
Phase 6: Port            — uplift only: hook adaptation
Phase 7: Document        — uplift only: install docs
Phase 8: Bootstrap       — uplift only: session-start injection
Phase 9: Summary         — uplift only: files created/skipped/flagged
```

### Phase 0: Intent

Two questions, asked before any file scanning:

```pseudocode
INTENT():
  mode = ASK "Assess only (diagnostic, read-only) or Uplift (generate missing artifacts)?"
    OPTIONS: ["assess", "uplift"]

  platforms = ASK "Which platforms?"
    OPTIONS: multi-select from [claude-code, cursor, gemini-cli, codex, antigravity, openclaw, all]
    DEFAULT: all

  RETURN { mode, platforms }
```

Everything else is auto-derived:
- Incremental vs full: from band scores (viable+ → incremental, partial/weak → full)
- Which artifacts to generate: from failing condition IDs
- Codex path: from repo shape (skill-discovery vs native-plugin)

### Phase 1: Detect

Unchanged. References `lib/patterns/detection-algorithm.md`.

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

### Phase 2: Inventory

New consolidated file at `lib/patterns/inventory.md`. Merges assessment's 7
detailed checks with uplift's asset discovery and conflict detection into a
single pass.

```pseudocode
INVENTORY(plugin_path, computed):
  # Assets (needed by both modes)
  computed.skills   = glob("skills/*/SKILL.md")
  computed.agents   = glob("agents/*.md")
  computed.commands  = glob("commands/*")
  computed.hooks    = { json: exists("hooks/hooks.json"),
                        cursor: exists("hooks/hooks-cursor.json") }

  # Platform manifests (needed by scoring)
  computed.manifest_results = check_manifests(plugin_path)

  # Context files (needed by scoring)
  computed.context_results = check_context_files(plugin_path)

  # Per-skill sidecars (needed by scoring)
  computed.sidecar_results = check_sidecars(plugin_path, computed.skills)

  # Frontmatter compatibility (needed by scoring)
  computed.frontmatter_results = check_frontmatter(plugin_path, computed.skills)

  # Hook details (needed by scoring)
  computed.hook_results = check_hooks(plugin_path)

  # Injection status (needed by scoring)
  computed.injection_results = check_injection(plugin_path, computed.metadata.name)

  # Existing files for conflict detection (needed by uplift)
  computed.existing_files = collect_existing_paths(plugin_path)
```

### Phase 3: Score

Always runs full condition-driven assessment. References
`lib/patterns/rubric-framework.md` and `lib/patterns/platforms/*.yaml`.

```pseudocode
SCORE(computed, platforms):
  FOR platform IN platforms:
    rubric = load_yaml("lib/patterns/platforms/" + platform + ".yaml")
    results = {}

    FOR category IN rubric.categories:
      FOR condition IN category.conditions:
        IF condition.type == "checkable":
          passed = jit_evaluate_checkable(condition.check, computed)
        ELSE:
          passed = evaluate_judgement(condition.check, computed)
        results[condition.id] = { passed, type: condition.type }

      category.score = compute_category_score(category.conditions, results)

    computed.scores[platform] = {
      categories: rubric.categories,
      band: compute_band(rubric.categories),
      percentage: compute_percentage(rubric.categories),
      results: results,
      failing: [c for c in all_conditions if not results[c.id].passed]
    }

  computed.blockers = detect_blockers(computed)
```

Auto-derives uplift strategy from scores:

```pseudocode
  IF intent.mode == "uplift":
    FOR platform IN platforms:
      IF computed.scores[platform].band IN ["strong", "viable"]:
        computed.recommendation_for[platform] = "incremental"
      ELSE:
        computed.recommendation_for[platform] = "full"
```

### Phase 4: Report

Always emitted. Shows per-platform scores with individual condition pass/fail,
blockers, and (if uplift mode) the derived uplift strategy per platform.

```pseudocode
REPORT(computed, intent):
  DISPLAY "## Repo Shape: " + computed.shape
  DISPLAY metadata summary

  FOR platform IN intent.platforms:
    score = computed.scores[platform]
    DISPLAY "## " + platform + " — " + score.band + " (" + score.percentage + "%)"
    FOR category IN score.categories:
      DISPLAY "### " + category.name + ": " + category.score + "/3"
      FOR condition IN category.conditions:
        status = "✓" IF score.results[condition.id].passed ELSE "✗"
        DISPLAY status + " " + condition.id

  DISPLAY blockers

  IF intent.mode == "uplift":
    DISPLAY "## Uplift Strategy"
    FOR platform IN intent.platforms:
      DISPLAY platform + ": " + computed.recommendation_for[platform]
    DISPLAY "## Artifacts to Generate"
    FOR platform IN intent.platforms:
      FOR condition IN computed.scores[platform].failing:
        IF condition.template:
          DISPLAY "- " + condition.template + " (fixes: " + condition.id + ")"

  IF intent.mode == "assess":
    STOP
```

### Phases 5-9: Uplift (unchanged logic, filtered by scores)

These phases are identical to the current uplift skill's Phases 4-8, with one
change: instead of their own recommendation logic, they use the strategy
derived in Phase 3.

```pseudocode
# Phase 5: Generate
FOR platform IN intent.platforms:
  IF computed.recommendation_for[platform] == "incremental":
    failing = computed.scores[platform].failing
    FOR condition IN failing:
      IF condition.template AND condition.target_path NOT IN computed.existing_files:
        render(condition.template, computed.metadata)
        # fixes: {condition.id}
  ELSE:
    execute_full_generation(platform, computed)

# Phase 6: Port — see lib/patterns/hook-merging.md
# Phase 7: Document — see lib/templates/install-docs/
# Phase 8: Bootstrap — see lib/patterns/bootstrapping.md
# Phase 9: Summary — files created, skipped, flagged
```

### External File References

The SKILL.md is a workflow orchestrator (~150-200 lines) referencing:

| Phase | External File |
|-------|--------------|
| Phase 1 | `lib/patterns/detection-algorithm.md` |
| Phase 2 | `lib/patterns/inventory.md` (NEW) |
| Phase 3 | `lib/patterns/rubric-framework.md` + `platforms/*.yaml` |
| Phase 5 | `lib/patterns/manifest-generation.md` |
| Phase 6 | `lib/patterns/hook-merging.md` |
| Phase 7 | `lib/templates/install-docs/` |
| Phase 8 | `lib/patterns/bootstrapping.md` |

Phases 0, 4, 9 are inline (short, skill-specific interaction).

## File Changes

### New Files

| File | Purpose |
|------|---------|
| `skills/plugin-portability/SKILL.md` | Merged skill (~150-200 lines) |
| `skills/plugin-portability/references/codex-tools.md` | Moved from old locations |
| `skills/plugin-portability/references/gemini-tools.md` | Moved from old locations |
| `lib/patterns/inventory.md` | Consolidated inventory pseudocode |

### Updated Files

| File | Change |
|------|--------|
| `skills/using-skill-portability/SKILL.md` | Reference `plugin-portability` instead of two separate skills |

### Removed Files

| File | Reason |
|------|--------|
| `skills/assessing-plugin-portability/SKILL.md` | Folded into merged skill |
| `skills/assessing-plugin-portability/references/codex-tools.md` | Moved |
| `skills/assessing-plugin-portability/references/gemini-tools.md` | Moved |
| `skills/uplifting-a-plugin/SKILL.md` | Folded into merged skill |
| `skills/uplifting-a-plugin/references/codex-tools.md` | Moved |
| `skills/uplifting-a-plugin/references/gemini-tools.md` | Moved |

## Migration Order

1. Create `lib/patterns/inventory.md` (consolidated pseudocode)
2. Create `skills/plugin-portability/SKILL.md` (merged workflow)
3. Move reference files to `skills/plugin-portability/references/`
4. Update `skills/using-skill-portability/SKILL.md`
5. Remove old skill directories
6. Validate: no remaining references to old skill names
