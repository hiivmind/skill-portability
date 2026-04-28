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
| `using-plugin-portability` | Keep separate, update references | Serves different purpose (session-start injection); part of bootstrapping pattern |

## Design

### Phase Structure

```
Phase 0a: Intent         — Q1 (mode) + Q2 (platforms) before any file scanning
Phase 1:  Detect         — shared detection algorithm
Phase 2:  Inventory      — unified inventory (merges both skills' Phase 2)
Phase 0b: Uplift Target  — Q3 (uplift target, shape-informed) — uplift mode only
Phase 3:  Score          — full condition-driven assessment (always runs)
Phase 4:  Report         — detailed assessment report (always emitted)
                          — IF mode == "assess": STOP
Phase 5:  Generate       — uplift only: manifests, context files, sidecars
Phase 6:  Port           — uplift only: hook adaptation
Phase 7:  Document       — uplift only: install docs
Phase 8:  Bootstrap      — uplift only: session-start injection
Phase 9:  Summary        — uplift only: files created/skipped/flagged
```

### Phase 0a: Intent (before file scanning)

Two questions via structured UI. On Claude Code, use `AskUserQuestion` tool
for structured multi-select. On other platforms, use the platform-equivalent
structured input (Gemini CLI prompts, Cursor input, etc.). Fall back to text
prompts only if structured input is unavailable.

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

### Phase 0b: Uplift Target (after detection, uplift mode only)

Q3 runs AFTER Phase 1 (Detect) and Phase 2 (Inventory) because it needs
shape classification to make a recommendation. Uses structured UI with the
shape-derived recommendation marked as "(Recommended)".

```pseudocode
INTENT_UPLIFT_TARGET(computed):
  IF intent.mode != "uplift":
    RETURN  # assess mode skips this

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

  # Q3: Confirm or override shape-derived recommendation
  # Place recommended option first with "(Recommended)" suffix
  options = [
    { label: "Skill-first",          description: "Sidecars, tool mapping, context files only. No platform manifests." },
    { label: "Full portable plugin", description: "Manifests, context, hooks, install docs — everything." },
    { label: "Curated note only",    description: "Documentation only. No generated artifacts." }
  ]

  # Mark recommended option
  FOR opt IN options:
    IF opt.label.lower().startswith(recommended.replace("-", " ")):
      opt.label = opt.label + " (Recommended)"
      # Move to first position
      options = [opt] + [o for o in options if o != opt]

  uplift_target = AskUserQuestion(
    question: "Repo detected as: " + reason + ". What level of uplift?",
    header: "Uplift target",
    options: options,
    multiSelect: false
  )

  computed.uplift_target = uplift_target
```

### Auto-derived (no user questions needed)

These are determined by the system from scores and shape:
- **Incremental vs full per-platform:** from band scores (viable+ → incremental)
- **Which specific artifacts to generate:** from failing condition IDs + rubric `template` field
- **Codex path:** from repo shape (bare-skill-repo → skill-discovery, else → native-plugin)

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

Auto-derives per-platform repair depth from scores:

```pseudocode
  IF intent.mode == "uplift":
    # Shape-based uplift target already set in Phase 0b (user confirmed)
    # Now derive per-platform depth from scores
    FOR platform IN platforms:
      IF computed.scores[platform].band IN ["strong", "viable"]:
        computed.recommendation_for[platform] = "incremental"
      ELSE:
        computed.recommendation_for[platform] = "full"
```

**Two-layer uplift strategy:**
- **Layer 1 (Phase 0b):** Shape-based uplift target — user-confirmed via
  AskUserQuestion. Controls WHAT CLASS of artifacts are in scope.
  - `skill-first`: sidecars, tool mapping, context files only. No manifests.
  - `full-portable-plugin`: manifests, context, hooks, install docs — everything.
  - `curated-note-only`: documentation only, no generated artifacts.
- **Layer 2 (Phase 3):** Per-platform repair depth — auto-derived from scores.
  Controls HOW MUCH within the chosen target.
  - `incremental`: only fix failing conditions (for viable+ platforms)
  - `full`: generate all missing artifacts for that platform

### Condition-to-Artifact Mapping

The `template` field in each rubric YAML condition IS the mapping. No JIT
scanning, no separate index file.

**Rule:** Every fixable condition MUST populate the `template` field:

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
  template: manifests/cursor-plugin/plugin.json.tmpl    # ← REQUIRED for fixable conditions
```

Conditions that are assessment-only (no artifact can fix them, e.g.,
`judgement` conditions about documentation quality) leave `template` empty.

**Drift detection** becomes a simple rubric validation:
- Condition has `template` but file doesn't exist → stale rubric
- Template has `{{! fixes: }}` but no condition references it → orphan template annotation

The `{{! fixes: }}` annotations in templates remain as documentation (which
conditions a template resolves), but the rubric `template` field is the
authoritative mapping used by Phases 4 and 5.

**Implementation note for rubric tightening:** The 6 platform YAML rubrics
created in the prior spec need to be updated to populate `template` on every
fixable condition. This is part of the migration order for this spec.

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
        IF condition.template:  # from rubric YAML template field
          DISPLAY "- " + condition.template + " → fixes: " + condition.id

  IF intent.mode == "assess":
    STOP
```

### Phases 5-9: Uplift (filtered by shape target + per-platform depth)

Generation is gated by TWO filters: the shape-based uplift target controls
which categories of artifacts are in scope, and the per-platform depth
controls whether to generate everything or only fix failing conditions.

#### Template action types

Each rubric condition's `template` field maps to one of three action types:

```yaml
template: manifests/cursor-plugin/plugin.json.tmpl          # action: create
template: manifests/cursor-plugin/plugin.json.tmpl?merge     # action: merge (update existing)
template: null                                                # action: none (assessment-only)
```

- **create**: Render template to target path. Only if file doesn't exist.
- **merge**: Read existing file, apply template as structured update (add missing
  fields, update stale values). Used for manifests with missing fields, context
  files with missing skill references, etc.
- **none** (no template): Assessment-only condition. Cannot be fixed by generation.
  Emitted as a manual action item in the report.

#### Allowed categories by uplift target

```pseudocode
ALLOWED_CATEGORIES = {
  "skill-first":          ["2_skills", "3_context", "5_toolmap", "6_install"],
  "full-portable-plugin": ["1_manifest", "2_skills", "3_context", "4_hooks",
                           "5_toolmap", "6_install", "7_runtime"],
  "curated-note-only":    ["6_install"]
}
```

#### Phase 5: Generate

```pseudocode
allowed = ALLOWED_CATEGORIES[computed.uplift_target]

FOR platform IN intent.platforms:
  failing = computed.scores[platform].failing

  FOR condition IN failing:
    # Filter 1: Shape target — enforced for ALL depths including full
    IF condition.category NOT IN allowed:
      SKIP

    # Filter 2: Has fixable template?
    IF NOT condition.template:
      computed.manual_actions.append(condition)  # Report as manual item
      CONTINUE

    target_path = resolve_target_path(condition.template, platform)
    action = parse_action(condition.template)  # "create" or "merge"

    IF action == "create" AND target_path NOT IN computed.existing_files:
      render(condition.template, computed.metadata)
      # fixes: {condition.id}
    ELIF action == "merge" AND target_path IN computed.existing_files:
      merge_update(condition.template, target_path, computed.metadata)
      # fixes: {condition.id}
    ELIF action == "create" AND target_path IN computed.existing_files:
      # File exists but condition fails — needs merge, not create
      computed.manual_actions.append(condition)
      # Report: "{target_path} exists but fails {condition.id} — manual review needed"
    ELSE:
      render(condition.template, computed.metadata)
      # fixes: {condition.id}

# Phase 6: Port — see lib/patterns/hook-merging.md
#   Skipped if "4_hooks" NOT IN allowed
# Phase 7: Document — see lib/templates/install-docs/
#   Always runs ("6_install" is in all allowed sets)
# Phase 8: Bootstrap — see lib/patterns/bootstrapping.md
#   Skipped if uplift_target == "curated-note-only"
# Phase 9: Summary — files created, merged, skipped, manual actions
```

#### Phase 9: Summary

```pseudocode
SUMMARY(computed):
  DISPLAY "## Files Created"
  FOR file IN computed.created_files:
    DISPLAY "- " + file

  DISPLAY "## Files Merged/Updated"
  FOR file IN computed.merged_files:
    DISPLAY "- " + file

  DISPLAY "## Manual Actions Required"
  FOR condition IN computed.manual_actions:
    DISPLAY "- " + condition.id + ": " + condition.check
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
| `skills/using-plugin-portability/SKILL.md` | Reference `plugin-portability` instead of two separate skills |

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

1. Populate `template` field on fixable conditions in all 6 platform YAML rubrics
2. Create `lib/patterns/inventory.md` (consolidated pseudocode)
3. Create `skills/plugin-portability/SKILL.md` (merged workflow)
4. Move reference files to `skills/plugin-portability/references/`
5. Update `skills/using-plugin-portability/SKILL.md`
6. Remove old skill directories
7. Validate: no remaining references to old skill names, all fixable conditions have `template`

## Addendum: Codex Adversarial Review Response (2026-04-26)

**[high] Incremental uplift has no condition-to-template mapping** — Fixed.
The `template` field in each rubric YAML condition is now required for every
fixable condition. The rubric IS the mapping — no JIT scanning, no separate
index. Phase 5 reads `condition.template` directly. Conditions without a
template are assessment-only (skipped during generation). The 6 platform YAML
rubrics need `template` fields populated as part of implementation.

**[high] Score-only strategy removes shape-based safe modes** — Fixed.
Restored two-layer decision: Layer 1 is shape-based uplift target
(`skill-first`, `full-portable-plugin`, `curated-note-only`) confirmed with
user. Layer 2 is per-platform repair depth (`incremental` vs `full`) derived
from scores. Phase 5 generation is gated by both filters — shape target
controls which categories are in scope, depth controls how much.

## Addendum: Codex Adversarial Review #2 Response (2026-04-26)

**[high] Incremental uplift skips broken existing files** — Fixed.
Added template action types: `create` (new files only) vs `merge` (update
existing files with missing fields/entries). Conditions targeting existing
files that fail use `merge` action. Files that exist and fail but have no
merge template are reported as manual action items — never silently skipped.

**[high] Skill-first full generation can still generate manifests** — Fixed.
Replaced `execute_full_generation` with `ALLOWED_CATEGORIES` table keyed by
uplift target. The category filter is enforced for ALL depths including full
— `skill-first` can never create manifests (`1_manifest`), hooks (`4_hooks`),
or runtime adapters (`7_runtime`) regardless of per-platform depth.
