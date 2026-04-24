---
name: assessing-plugin-portability
description: >
  Assess a plugin for multi-platform portability. Classifies repo shape, scores
  readiness per platform using a 7-category rubric, detects structural blockers,
  and recommends an uplift target. Read-only — makes no changes.
allowed-tools: Read, Glob, Grep
inputs:
  - name: plugin_path
    type: string
    required: true
    description: Path to the plugin root directory
outputs:
  - name: assessment
    type: object
    description: Complete portability assessment with per-platform scores and recommendation
---

# Assessing Plugin Portability

Assess a plugin repo and report portability gaps across all platforms. Makes no changes.

> **Detection Algorithm:** `lib/patterns/detection-algorithm.md`
> **Rubric Framework:** `lib/patterns/rubric-framework.md`
> **Platform Rules:** `lib/patterns/platforms/<platform>.md`
> **Injection Checks:** `lib/patterns/injection-checks.md`

---

## Overview

| Phase | Description |
|-------|-------------|
| **Phase 1: Detect** | Scan metadata, elect canonical, build model, classify shape |
| **Phase 2: Inventory** | Discover all assets across all platform conventions |
| **Phase 3: Score** | Run per-platform rubric, detect blockers |
| **Phase 4: Recommend** | Choose uplift target, per-platform recommendations |
| **Phase 5: Report** | Print full assessment report |

**Minimum starting state:** At least one `skills/*/SKILL.md` with frontmatter, or any platform manifest file.

---

## Phase 1: Detect

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

Check all 9 manifest paths across 5 platforms, recording `{ platform, path, status }`:

```pseudocode
INVENTORY_MANIFESTS(computed):
  manifest_checks = [
    { platform: "claude-code",  path: ".claude-plugin/plugin.json" },
    { platform: "claude-code",  path: ".claude-plugin/marketplace.json" },
    { platform: "cursor",       path: ".cursor-plugin/plugin.json" },
    { platform: "gemini-cli",   path: "gemini-extension.json" },
    { platform: "gemini-cli",   path: "GEMINI.md" },
    { platform: "opencode",     path: ".opencode/plugins/" + computed.metadata.name + ".js" },
    { platform: "codex",        path: ".codex-plugin/plugin.json" },
    { platform: "copilot-cli",  path: "package.json" },
    { platform: "copilot-cli",  path: ".github/copilot-instructions.md" }
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
    ".github/copilot-instructions.md",
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
  sidecar_files = ["copilot-tools.md", "codex-tools.md", "gemini-tools.md"]
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

  # Copilot-specific
  computed.copilot_checks = [
    Glob(plugin_path + "/.github/instructions/*.instructions.md"),
    Glob(plugin_path + "/.github/agents/*.agent.md")
  ]

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

### Step 3.1: Run Per-Platform Rubric

See `lib/patterns/rubric-framework.md` for category definitions and scoring scale (0-3 per category, max 21 per platform).

```pseudocode
SCORE(computed):
  platforms = ["claude-code", "cursor", "gemini-cli", "opencode", "copilot-cli", "codex"]

  FOR platform IN platforms:
    rules = load_platform_rules(platform)  # from lib/patterns/platforms/
    computed.scores[platform] = {}
    FOR category IN rules.categories:
      computed.scores[platform][category.name] = evaluate(category, computed)
    computed.scores[platform].total = sum(computed.scores[platform][c] for c IN rules.categories)
    computed.scores[platform].band = classify_band(computed.scores[platform].total)
```

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

  ELIF computed.shape == "single-platform":
    computed.recommendation = "full-portable-plugin"

  ELIF computed.shape == "multi-platform":
    computed.recommendation = "hybrid"

  ELIF computed.shape == "curated":
    computed.recommendation = "curated-note-only"

  ELSE:
    computed.recommendation = "full-portable-plugin"
```

### Step 4.2: Choose Codex Path

```pseudocode
RECOMMEND_CODEX(computed):
  IF ".codex-plugin/plugin.json" PRESENT in computed.manifest_results:
    computed.codex_rec = "native-plugin-packaging"
  ELIF computed.shape IN ["bare-skill-repo", "single-platform"] AND len(computed.skills) > 0:
    computed.codex_rec = "native-skill-discovery"
  ELSE:
    computed.codex_rec = "curated-package-note"
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

```
# Portability Assessment: {name} v{version}

## Repo Shape
{shape}
Metadata inferred from: {canonical.path}

## Platform Scores
| Platform    | Score | Band    | Action                             |
|-------------|-------|---------|------------------------------------|
| claude-code | X/21  | {band}  | {action}                           |
| cursor      | X/21  | {band}  | {action}                           |
| gemini-cli  | X/21  | {band}  | {action}                           |
| opencode    | X/21  | {band}  | {action}                           |
| copilot-cli | X/21  | {band}  | {action}                           |
| codex       | X/21  | {band}  | {action}                           |

### Per-Platform Detail

#### {platform}
| Category            | Score |
|---------------------|-------|
| Manifest packaging  | X/3   |
| Skill compatibility | X/3   |
| Context delivery    | X/3   |
| Hook portability    | X/3   |
| Tool mapping        | X/3   |
| Install readiness   | X/3   |
| Runtime adapters    | X/3   |
| **Total**           | X/21  |

(repeat for each platform)

## Blockers
{severity}: {description}
(one entry per blocker; "None detected." if empty)

## Uplift Recommendation
Target: {recommendation}
Codex path: {codex_rec}

## Required Artifacts
(per platform where band != strong: list missing artifacts)

### {platform} — {band}
- {missing artifact path}
- ...

## Session-Start Injection
{status}
(IF configured: component-by-component status table)

## Summary
Run the uplifting-a-plugin skill to generate all missing artifacts automatically.
```

---

## State Flow

```
Phase 1               Phase 2                       Phase 3
─────────────────────────────────────────────────────────────
computed              computed.manifest_results     computed.scores[platform]
 .sources              .context_results              .blockers
 .canonical            .sidecar_results
 .metadata             .hook_results
 .shape                .frontmatter_results
                       .injection_results
                       .completeness_issues
                       .copilot_checks
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
- **Platform Rules:** `lib/patterns/platforms/claude-code.md`
- **Platform Rules:** `lib/patterns/platforms/cursor.md`
- **Platform Rules:** `lib/patterns/platforms/gemini-cli.md`
- **Platform Rules:** `lib/patterns/platforms/opencode.md`
- **Platform Rules:** `lib/patterns/platforms/copilot-cli.md`
- **Platform Rules:** `lib/patterns/platforms/codex.md`
- **Injection Checks:** `lib/patterns/injection-checks.md`

---

## Related Skills

- **Uplift plugin:** `skills/uplifting-a-plugin/SKILL.md`
