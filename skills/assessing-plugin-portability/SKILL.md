---
name: assessing-plugin-portability
description: >
  Use when you need to assess a plugin for multi-platform portability. Classifies
  repo shape, scores readiness per platform using structured YAML rubric conditions
  (checkable and judgement types), detects structural blockers, and recommends an
  uplift target. Read-only — makes no changes.
allowed-tools: Read, Glob, Grep, Bash(readonly)
---

# Assessing Plugin Portability

Assess a plugin repo and report portability gaps across all platforms. Makes no changes.

**Input:** `plugin_path` (string, required) — Path to the plugin root directory.
**Output:** Complete portability assessment with per-platform scores and recommendation.

> **Detection Algorithm:** `lib/patterns/detection-algorithm.md`
> **Rubric Framework:** `lib/patterns/rubric-framework.md`
> **Platform Rubrics:** `lib/patterns/platforms/<platform>.yaml`
> **Lookup Tables:** `lib/references/platform-mappings.md`
> **Injection Checks:** `lib/patterns/injection-checks.md`

---

## Overview

| Phase | Description |
| ----- | ----------- |
| **Phase 1: Detect** | Scan metadata, elect canonical, build model, classify shape |
| **Phase 2: Inventory** | Discover all assets across all platform conventions |
| **Phase 3: Score** | Run per-platform condition-driven rubric, detect blockers |
| **Phase 4: Recommend** | Choose uplift target, per-platform recommendations |
| **Phase 5: Report** | Print full assessment with per-condition detail |

**Minimum starting state:** At least one `skills/*/SKILL.md` with frontmatter, or any platform manifest file.

---

## Phase 1: Detect

Follow the shared detection algorithm in `lib/patterns/detection-algorithm.md`.

### Step 1.1: Scan and Infer

```pseudocode
DETECT(plugin_path):
  computed.sources = scan_metadata_sources(plugin_path)         # D1
  IF len(computed.sources) == 0:
    DISPLAY "No recognisable plugin signals found in {plugin_path}."
    EXIT

  computed.canonical = elect_canonical(computed.sources)         # D2
  computed.metadata = build_metadata_model(computed.sources)     # D3
  print_inference_summary(computed.metadata, computed.canonical) # D4
  computed.shape = classify_shape(computed.sources)              # D5
```

---

## Phase 2: Inventory

### Step 2.1: Check Platform Manifests

Check all manifest paths across 6 platforms, recording `{ platform, path, status }`:

```pseudocode
INVENTORY_MANIFESTS(computed):
  manifest_checks = [
    { platform: "claude-code",  path: ".claude-plugin/plugin.json" },
    { platform: "claude-code",  path: ".claude-plugin/marketplace.json" },
    { platform: "cursor",       path: ".cursor-plugin/plugin.json" },
    { platform: "gemini-cli",   path: "gemini-extension.json" },
    { platform: "gemini-cli",   path: "GEMINI.md" },
    { platform: "codex",        path: ".codex-plugin/plugin.json" },
    { platform: "codex",        path: ".agents/plugins/marketplace.json" },
    { platform: "antigravity",  path: ".agents/skills/" },
    { platform: "antigravity",  path: "package.json" },
    { platform: "openclaw",     path: "openclaw.plugin.json" }
  ]

  computed.manifest_results = []
  FOR check IN manifest_checks:
    status = IF file_exists(plugin_path + "/" + check.path) THEN "PRESENT" ELSE "MISSING"
    computed.manifest_results.append({ platform: check.platform, path: check.path, status: status })
```

### Step 2.2: Check Context Files

```pseudocode
INVENTORY_CONTEXT_FILES(computed):
  context_checks = [
    "CLAUDE.md",
    "AGENTS.md",
    "GEMINI.md",
    ".codex/INSTALL.md"
  ]

  computed.context_results = []
  FOR path IN context_checks:
    status = IF file_exists(plugin_path + "/" + path) THEN "PRESENT" ELSE "MISSING"
    computed.context_results.append({ path: path, status: status })
```

### Step 2.3: Check Per-Skill Sidecars

Use `skill.dir` (directory basename) — not `skill.name` (frontmatter value) — for path construction.

```pseudocode
INVENTORY_SIDECARS(computed):
  computed.skills = Glob(plugin_path + "/skills/*/SKILL.md")
  sidecar_files = ["codex-tools.md", "gemini-tools.md"]
  computed.sidecar_results = []

  FOR skill IN computed.skills:
    FOR sidecar IN sidecar_files:
      target = "skills/" + skill.dir + "/references/" + sidecar
      status = IF file_exists(plugin_path + "/" + target) THEN "PRESENT" ELSE "MISSING"
      computed.sidecar_results.append({ skill: skill.dir, file: sidecar, status: status })
```

### Step 2.4: Check Hooks

```pseudocode
INVENTORY_HOOKS(computed):
  hook_checks = [
    "hooks/hooks.json",
    "hooks/hooks-cursor.json",
    ".github/hooks/",
    "hooks/run-hook.cmd"
  ]

  computed.hook_results = []
  FOR path IN hook_checks:
    status = IF file_exists(plugin_path + "/" + path) THEN "PRESENT" ELSE "MISSING"
    computed.hook_results.append({ path: path, status: status })
```

### Step 2.5: Check Frontmatter Compatibility

```pseudocode
INVENTORY_FRONTMATTER(computed):
  computed.frontmatter_results = []
  FOR skill IN computed.skills:
    frontmatter = parse_yaml_frontmatter(skill.content)
    IF frontmatter.name AND frontmatter.description:
      status = "COMPATIBLE"
    ELSE:
      status = "MISSING FRONTMATTER"
    computed.frontmatter_results.append({ skill: skill.dir, status: status })
```

### Step 2.6: Check Session-Start Injection

See `lib/patterns/injection-checks.md` for the 8-component verification.

```pseudocode
INVENTORY_INJECTION(computed):
  using_path = "skills/using-" + computed.metadata.name + "/SKILL.md"
  IF NOT file_exists(plugin_path + "/" + using_path):
    computed.injection_status = "NOT CONFIGURED"
    RETURN

  computed.injection_results = check_injection_components(computed)
  computed.injection_summary = compute_injection_summary(computed.injection_results)
```

### Step 2.7: Check Context File Completeness

```pseudocode
INVENTORY_CONTEXT_COMPLETENESS(computed):
  computed.completeness_issues = []

  IF file_exists(plugin_path + "/GEMINI.md"):
    content = Read(plugin_path + "/GEMINI.md")
    FOR skill IN computed.skills:
      IF "@./skills/" + skill.dir + "/SKILL.md" NOT IN content:
        computed.completeness_issues.append("GEMINI.md missing @include for " + skill.dir)
      IF "@./skills/" + skill.dir + "/references/gemini-tools.md" NOT IN content:
        computed.completeness_issues.append("GEMINI.md missing gemini-tools include for " + skill.dir)
  ELSE:
    computed.completeness_issues.append("GEMINI.md: MISSING — cannot check includes")

  IF file_exists(plugin_path + "/AGENTS.md"):
    content = Read(plugin_path + "/AGENTS.md")
    FOR skill IN computed.skills:
      IF "skills/" + skill.dir + "/SKILL.md" NOT IN content:
        computed.completeness_issues.append("AGENTS.md missing reference for " + skill.dir)
  ELSE:
    computed.completeness_issues.append("AGENTS.md: MISSING — cannot check skill references")

  # Gemini-specific
  computed.gemini_checks = [
    Glob(plugin_path + "/commands/*.toml"),
    Glob(plugin_path + "/policies/*.toml")
  ]

  # MCP configs
  computed.mcp_checks = []
  FOR path IN [".mcp.json", "mcp.json"]:
    IF file_exists(plugin_path + "/" + path):
      computed.mcp_checks.append({ path: path, status: "PRESENT" })
```

---

## Phase 3: Score

### Step 3.1: Run Per-Platform Condition-Driven Rubric

Load the YAML rubric for each platform and evaluate every condition. Conditions are either
`checkable` (deterministic — generate and run a read-only script) or `judgement` (requires
LLM interpretation of file contents).

```pseudocode
SCORE(computed):
  platforms = ["claude-code", "cursor", "gemini-cli", "codex", "antigravity", "openclaw"]

  FOR platform IN platforms:
    score_data = SCORE_PLATFORM(platform, plugin_path)
    computed.scores[platform] = score_data
```

```pseudocode
SCORE_PLATFORM(platform, plugin_path):
  rubric_path = "lib/patterns/platforms/" + platform + ".yaml"
  rubric = load_yaml(rubric_path)
  results = {}

  FOR category IN rubric.categories:
    FOR condition IN category.conditions:
      IF condition.type == "checkable":
        # JIT: generate read-only bash/python script from pseudocode
        # Execute it, record pass/fail from exit code
        passed = jit_evaluate_checkable(condition.check, plugin_path)
      ELSE:  # judgement
        # Read referenced files, apply interpretation
        passed = evaluate_judgement(condition.check, plugin_path)
      results[condition.id] = { passed: passed, type: condition.type }

    # Apply scoring formula from rubric-framework.md
    critical_count  = count(c for c in category.conditions if c.critical)
    optional_count  = count(c for c in category.conditions if not c.critical)
    critical_pass   = count(c for c in category.conditions if c.critical and results[c.id].passed)
    optional_pass   = count(c for c in category.conditions if not c.critical and results[c.id].passed)

    IF critical_count == 0:
      category.score = "N/A"
    ELIF critical_pass == critical_count:
      IF optional_count == 0 OR optional_pass / optional_count >= 0.75:
        category.score = 3
      ELSE:
        category.score = 2
    ELIF critical_pass / critical_count >= 0.50:
      category.score = 1
    ELSE:
      category.score = 0

  # Compute band
  scored = [c for c in rubric.categories if c.score != "N/A"]
  scored_count = len(scored)
  actual = sum(c.score for c in scored)
  max_possible = scored_count * 3
  percentage = actual / max_possible if max_possible > 0 else 0

  IF scored_count < 3: band_cap = "partial"
  IF percentage >= 0.85: band = "strong"
  ELIF percentage >= 0.60: band = "viable"
  ELIF percentage >= 0.35: band = "partial"
  ELSE: band = "weak"
  IF scored_count < 3: band = min(band, band_cap)

  RETURN { categories: rubric.categories, band: band, percentage: percentage, results: results }
```

### JIT Evaluation for Checkable Conditions

When evaluating a condition with `type: checkable`:

1. Read the condition's `check` pseudocode
2. Translate it to a read-only bash or python script
3. Execute the script against the plugin_path
4. Record pass (exit 0) or fail (non-zero exit)

The pseudocode uses these operations:
- `file_exists(path)` → `test -f "$plugin_path/path"`
- `dir_exists(path)` → `test -d "$plugin_path/path"`
- `read_json(path)` → `python3 -c "import json; ..."`
- `parse_frontmatter(path)` → read YAML between `---` markers
- `glob(pattern)` → `find` or `ls`
- `LOOKUP["table"]["platform"]` → reference `lib/references/platform-mappings.md`

Scripts are read-only — they must not modify files or access paths outside plugin_path.

### Step 3.2: Detect Blockers

```pseudocode
DETECT_BLOCKERS(computed):
  computed.blockers = []

  # Critical: no trustworthy metadata
  IF all metadata fields derived from hard fallbacks only:
    computed.blockers.append({
      severity: "critical",
      description: "No trustworthy metadata source — all fields from hard fallbacks"
    })

  # Major: unresolved tool assumptions
  FOR skill IN computed.skills:
    IF skill references platform-specific tools AND skill.dir not in sidecar_results with status PRESENT:
      computed.blockers.append({
        severity: "major",
        description: "Unresolved tool assumptions in skills/" + skill.dir
      })

  # Major: hook env hard-coding
  FOR hook_file IN ["hooks/hooks.json", "hooks/hooks-cursor.json"]:
    IF file_exists(hook_file):
      content = Read(plugin_path + "/" + hook_file)
      IF "CLAUDE_PLUGIN_ROOT" IN content AND env_branching_absent(content):
        computed.blockers.append({
          severity: "major",
          description: "Hook env hard-coding in " + hook_file + " (no env branching)"
        })

  # Major: docs/structure mismatch
  IF install_docs_reference_paths_that_dont_exist(computed):
    computed.blockers.append({
      severity: "major",
      description: "Install docs describe paths that don't exist in repo"
    })

  # Minor: GEMINI.md import gaps
  gemini_gaps = [i for i IN computed.completeness_issues if "GEMINI.md missing" IN i]
  IF len(gemini_gaps) > 0:
    computed.blockers.append({
      severity: "minor",
      description: "GEMINI.md import gaps: " + str(len(gemini_gaps)) + " missing includes"
    })
```

---

## Phase 4: Recommend

### Step 4.1: Choose Uplift Target

```pseudocode
RECOMMEND_TARGET(computed):
  IF computed.shape == "bare-skill-repo":
    IF len(computed.skills) <= 3:
      computed.recommendation = "skill-first"
    ELSE:
      computed.recommendation = "full-portable-plugin"

  ELIF computed.shape == "single-platform-plugin":
    computed.recommendation = "full-portable-plugin"

  ELIF computed.shape == "multi-platform-source":
    computed.recommendation = "full-portable-plugin"

  ELIF computed.shape == "curated-distribution":
    computed.recommendation = "curated-note-only"

  ELSE:
    computed.recommendation = "full-portable-plugin"
```

### Step 4.2: Choose Codex Path

```pseudocode
RECOMMEND_CODEX(computed):
  IF ".codex-plugin/plugin.json" PRESENT in computed.manifest_results:
    computed.codex_rec = "native-plugin-packaging"
  ELIF computed.shape == "bare-skill-repo" AND len(computed.skills) > 0:
    computed.codex_rec = "native-skill-discovery"
  ELIF computed.shape IN ["single-platform-plugin", "multi-platform-source"]:
    computed.codex_rec = "native-plugin-packaging"
  ELIF computed.shape == "curated-distribution":
    computed.codex_rec = "curated-package-note"
  ELSE:
    computed.codex_rec = "native-plugin-packaging"
```

### Step 4.3: Per-Platform Action Summary

```pseudocode
SUMMARISE_ACTIONS(computed):
  computed.actions = {}
  FOR platform IN platforms:
    band = computed.scores[platform].band
    IF band == "strong":
      computed.actions[platform] = "No action required"
    ELIF band == "viable":
      computed.actions[platform] = "Minor gaps — review category detail"
    ELIF band == "partial":
      computed.actions[platform] = "Significant gaps — uplift recommended"
    ELSE:  # weak
      computed.actions[platform] = "Full uplift required"
```

---

## Phase 5: Report

### Step 5.1: Print Assessment

```pseudocode
REPORT(computed, platform_scores):
  # 1. Repo shape
  DISPLAY "## Repo Shape: " + computed.shape

  # 2. Metadata
  DISPLAY "## Canonical Metadata"
  DISPLAY table of computed.metadata fields with source provenance

  # 3. Per-platform scores with condition detail
  FOR platform, score_data IN platform_scores:
    DISPLAY "## " + platform + " — " + score_data.band + " (" + format_pct(score_data.percentage) + ")"
    FOR category IN score_data.categories:
      DISPLAY "### " + category.name + ": " + category.score + "/3"
      FOR condition IN category.conditions:
        status = "✓" if score_data.results[condition.id].passed else "✗"
        DISPLAY status + " " + condition.id + " (" + condition.type + ")"

  # 4. Blockers
  DISPLAY "## Blockers"
  IF len(computed.blockers) == 0:
    DISPLAY "None detected."
  ELSE:
    FOR blocker IN computed.blockers:
      DISPLAY blocker.severity + ": " + blocker.description

  # 5. Recommendation
  DISPLAY "## Uplift Recommendation"
  DISPLAY "Target: " + computed.recommendation

  # 6. Codex recommendation
  DISPLAY "Codex path: " + computed.codex_rec

  # 7. Required artifacts (mapped to failing condition IDs)
  DISPLAY "## Required Uplift Artifacts"
  FOR platform IN target_platforms:
    failing = [c for c in all_conditions(platform) if not score_data.results[c.id].passed]
    IF len(failing) > 0:
      DISPLAY "### " + platform + " — " + computed.scores[platform].band
      FOR condition IN failing:
        IF condition.template:
          DISPLAY "- " + condition.template + " (fixes: " + condition.id + ")"
        ELSE:
          DISPLAY "- [manual] " + condition.id

  # 8. Injection status
  DISPLAY "## Session-Start Injection"
  DISPLAY computed.injection_status OR computed.injection_summary
  IF computed.injection_results:
    DISPLAY component-by-component status table
```

### Report Format

```text
# Portability Assessment: {name} v{version}

## Repo Shape
{shape}
Metadata inferred from: {canonical.path}

## Canonical Metadata
| Field       | Value          | Source                        |
|-------------|----------------|-------------------------------|
| name        | {name}         | {source}                      |
| description | {description}  | {source}                      |
| version     | {version}      | {source}                      |
| ...         | ...            | ...                           |

## Platform Scores
| Platform    | Band    | Pct  | Action                             |
|-------------|---------|------|------------------------------------|
| claude-code | {band}  | {%}  | {action}                           |
| cursor      | {band}  | {%}  | {action}                           |
| gemini-cli  | {band}  | {%}  | {action}                           |
| codex       | {band}  | {%}  | {action}                           |
| antigravity | {band}  | {%}  | {action}                           |
| openclaw    | {band}  | {%}  | {action}                           |

### {platform} — {band} ({percentage}%)

#### {category_name}: {score}/3
✓ condition.id (checkable)
✗ condition.id (judgement)
...

(repeat for each category, for each platform)

## Blockers
{severity}: {description}
(one entry per blocker; "None detected." if empty)

## Uplift Recommendation
Target: {recommendation}
Codex path: {codex_rec}

## Required Uplift Artifacts

### {platform} — {band}
- {template_path} (fixes: {condition.id})
- [manual] {condition.id}
...

## Session-Start Injection
{status}
(IF configured: component-by-component status table)

## Summary
Run the uplifting-a-plugin skill to generate all missing artifacts automatically.
```

---

## State Flow

```text
Phase 1               Phase 2                       Phase 3
─────────────────────────────────────────────────────────────
computed              computed.manifest_results     computed.scores[platform]
 .sources              .context_results              .categories[]
 .canonical            .sidecar_results              .band
 .metadata             .hook_results                 .percentage
 .shape                .frontmatter_results          .results{}
                       .injection_results           computed.blockers
                       .completeness_issues
                       .gemini_checks
                       .mcp_checks

Phase 4               Phase 5
──────────────────────────────
computed              Report
 .recommendation      (displayed)
 .codex_rec
 .actions
```

---

## Reference Documentation

- **Detection Algorithm:** `lib/patterns/detection-algorithm.md` (shared)
- **Rubric Framework:** `lib/patterns/rubric-framework.md`
- **Platform Rubrics:** `lib/patterns/platforms/claude-code.yaml`
- **Platform Rubrics:** `lib/patterns/platforms/cursor.yaml`
- **Platform Rubrics:** `lib/patterns/platforms/gemini-cli.yaml`
- **Platform Rubrics:** `lib/patterns/platforms/codex.yaml`
- **Platform Rubrics:** `lib/patterns/platforms/antigravity.yaml`
- **Platform Rubrics:** `lib/patterns/platforms/openclaw.yaml`
- **Lookup Tables:** `lib/references/platform-mappings.md`
- **Injection Checks:** `lib/patterns/injection-checks.md`

---

## Related Skills

- **Uplift plugin:** `skills/uplifting-a-plugin/SKILL.md`
