# Portability Overhaul: Assessment Rubric + Full Platform Coverage

**Date:** 2026-04-24
**Status:** Approved
**Scope:** Replace `auditing-plugin-portability` with `assessing-plugin-portability`, rewrite `uplifting-a-plugin`, add per-platform rubric scoring, Codex/Copilot artifact generation, and install doc generation.

## Problem

The current skills were built with knowledge of three platforms (Claude Code, Cursor, Gemini) and limited understanding of three others (OpenCode, Copilot CLI, Codex). The audit skill does binary PRESENT/MISSING checks with no scoring, no shape classification, no blocker detection, and no uplift recommendation. The uplift skill generates manifests for five platforms but ignores Codex plugin packaging, Copilot `.github/` conventions, and install documentation entirely.

Research into all six platform ecosystems (documented in `docs/platforms/`) revealed:
- Codex has two materially different consumption patterns (skill discovery vs native plugin packaging)
- Copilot CLI has no plugin manifest but uses `.github/` conventions for agents, hooks, instructions
- Gemini CLI has a policy engine, custom commands as `.toml`, and hooks in `settings.json` rather than standalone files
- OpenCode has code-based plugins with no manifest, a "first type wins" rule for context files, and experimental message transforms
- Each platform has distinct hook event names, output formats, and blocking semantics

## Solution

Two skills with a clean read/write split, backed by a shared library with per-platform scoring modules.

### Skill boundaries

| Skill | Purpose | Allowed tools |
|-------|---------|---------------|
| `assessing-plugin-portability` | Read-only analysis. Classify, score, detect blockers, recommend. | `Read`, `Glob`, `Grep` |
| `uplifting-a-plugin` | Write modifications. Generate artifacts, port hooks, produce install docs. | `Read`, `Write`, `Edit`, `Bash`, `Glob`, `Grep` |

The assess skill replaces the current audit skill entirely. The uplift skill is rewritten with expanded platform coverage and two new phases.

---

## Directory Structure

```
skill-portability/
  lib/
    patterns/
      detection-algorithm.md        # D1-D5 (adds shape classification)
      rubric-framework.md           # scoring scale, bands, blocker levels
      manifest-generation.md        # all manifest schemas (expanded)
      hook-merging.md               # hook porting logic (expanded)
      bootstrapping.md              # session-start injection
      injection-checks.md           # 8-component verification
      platforms/
        claude-code.md              # scoring rules + artifact checklist
        cursor.md
        gemini-cli.md
        opencode.md
        copilot-cli.md
        codex.md
    references/
      copilot-tools.md              # existing
      codex-tools.md                # existing
      gemini-tools.md               # existing
    templates/
      hooks/
        session-start.sh            # existing
        run-hook.cmd                # existing
      install-docs/
        claude-code.md              # per-platform install doc templates
        cursor.md
        gemini-cli.md
        opencode.md
        copilot-cli.md
        codex.md
  skills/
    assessing-plugin-portability/
      SKILL.md                      # NEW — replaces auditing skill
    uplifting-a-plugin/
      SKILL.md                      # REWRITTEN — 7 phases
```

---

## Assess Skill: Phase Hierarchy

### Frontmatter

```yaml
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
```

### Phase Overview

| Phase | Description |
|-------|-------------|
| **Phase 1: Detect** | Scan metadata, elect canonical, build model, classify shape |
| **Phase 2: Inventory** | Discover all assets across all platform conventions |
| **Phase 3: Score** | Run per-platform rubric, detect blockers |
| **Phase 4: Recommend** | Choose uplift target, per-platform recommendations |
| **Phase 5: Report** | Print full assessment report |

### Phase 1: Detect

References `lib/patterns/detection-algorithm.md` for D1-D4 plus new D5.

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

D5 shape classification:

```pseudocode
CLASSIFY_SHAPE(sources):
  manifest_platforms = count platforms with manifests in sources
    # Each of: .claude-plugin/, .cursor-plugin/, .codex-plugin/,
    #          gemini-extension.json, package.json, .opencode/

  has_skills = any source matches "skills/*/SKILL.md"
  has_marketplace = any source is a marketplace.json

  IF manifest_platforms == 0 AND has_skills:
    RETURN "bare-skill-repo"
  ELIF manifest_platforms == 1:
    RETURN "single-platform-plugin"
  ELIF manifest_platforms >= 2:
    RETURN "multi-platform-source"
  ELIF has_marketplace AND NOT has_skills:
    RETURN "curated-distribution"
  ELSE:
    RETURN "unclassified"
```

### Phase 2: Inventory

Discovers all assets across all platform conventions.

```pseudocode
INVENTORY(plugin_path, computed):
  # Content
  computed.skills = Glob("skills/*/SKILL.md")
  computed.commands = Glob("commands/*.md")
  computed.agents = Glob("agents/*.md")

  # Platform manifests
  computed.manifests = {}
  manifest_checks = [
    { platform: "claude-code",  path: ".claude-plugin/plugin.json" },
    { platform: "claude-code",  path: ".claude-plugin/marketplace.json" },
    { platform: "cursor",       path: ".cursor-plugin/plugin.json" },
    { platform: "cursor",       path: ".cursor-plugin/marketplace.json" },
    { platform: "codex",        path: ".codex-plugin/plugin.json" },
    { platform: "codex",        path: ".agents/plugins/marketplace.json" },
    { platform: "gemini-cli",   path: "gemini-extension.json" },
    { platform: "opencode",     path: "package.json" },
    { platform: "opencode",     path: ".opencode/plugins/" + computed.metadata.name + ".js" },
  ]
  FOR check IN manifest_checks:
    status = IF file_exists(check.path) THEN "PRESENT" ELSE "MISSING"
    computed.manifests[check.path] = { platform: check.platform, status: status }

  # Context files
  computed.context_files = {}
  context_checks = [
    { platform: "claude-code",  path: "CLAUDE.md" },
    { platform: "cross",        path: "AGENTS.md" },
    { platform: "gemini-cli",   path: "GEMINI.md" },
    { platform: "copilot-cli",  path: ".github/copilot-instructions.md" },
    { platform: "codex",        path: ".codex/INSTALL.md" },
  ]
  FOR check IN context_checks:
    status = IF file_exists(check.path) THEN "PRESENT" ELSE "MISSING"
    computed.context_files[check.path] = { platform: check.platform, status: status }

  # Copilot-specific
  computed.copilot_instructions = Glob(".github/instructions/*.instructions.md")
  computed.copilot_agents = Glob(".github/agents/*.agent.md")

  # Gemini-specific
  computed.gemini_commands = Glob("commands/*.toml")
  computed.gemini_policies = Glob("policies/*.toml")

  # Per-skill sidecars
  computed.sidecars = {}
  platforms = ["copilot-tools.md", "codex-tools.md", "gemini-tools.md"]
  FOR skill IN computed.skills:
    FOR platform IN platforms:
      # Use skill.dir (directory basename), not skill.name (frontmatter)
      target = "skills/" + skill.dir + "/references/" + platform
      status = IF file_exists(target) THEN "PRESENT" ELSE "MISSING"
      computed.sidecars[target] = { skill: skill.dir, file: platform, status: status }

  # Hooks (all platform formats)
  computed.hooks = {}
  hook_checks = [
    { platform: "claude-code",  path: "hooks/hooks.json" },
    { platform: "cursor",       path: "hooks/hooks-cursor.json" },
    { platform: "copilot-cli",  path: ".github/hooks/" },
    { platform: "cross",        path: "hooks/run-hook.cmd" },
  ]
  FOR check IN hook_checks:
    IF check.path ends with "/":
      status = IF Glob(check.path + "*.json") THEN "PRESENT" ELSE "MISSING"
    ELSE:
      status = IF file_exists(check.path) THEN "PRESENT" ELSE "MISSING"
    computed.hooks[check.path] = { platform: check.platform, status: status }

  # MCP configs
  computed.mcp = {}
  mcp_checks = [
    { platform: "claude-code",  path: ".mcp.json" },
    { platform: "cursor",       path: "mcp.json" },
  ]
  FOR check IN mcp_checks:
    status = IF file_exists(check.path) THEN "PRESENT" ELSE "MISSING"
    computed.mcp[check.path] = { platform: check.platform, status: status }

  # Frontmatter quality
  computed.frontmatter = []
  FOR skill IN computed.skills:
    fm = parse_yaml_frontmatter(skill.content)
    IF fm.name AND fm.description:
      computed.frontmatter.append({ skill: skill.name, status: "COMPATIBLE" })
    ELSE:
      computed.frontmatter.append({ skill: skill.name, status: "MISSING FRONTMATTER" })

  # Session-start injection
  # See lib/patterns/injection-checks.md
  using_path = "skills/using-" + computed.metadata.name + "/SKILL.md"
  IF NOT file_exists(using_path):
    computed.injection_status = "NOT CONFIGURED"
  ELSE:
    computed.injection_results = check_injection_components(computed)
    computed.injection_summary = compute_injection_summary(computed.injection_results)

  # Context file completeness
  computed.context_issues = check_context_completeness(computed)
```

### Phase 3: Score

```pseudocode
SCORE(computed):
  platforms = ["claude-code", "cursor", "gemini-cli", "opencode", "copilot-cli", "codex"]

  # See lib/patterns/rubric-framework.md for scoring scale
  # See lib/patterns/platforms/<platform>.md for per-platform rules

  FOR platform IN platforms:
    rules = load_platform_rules(platform)
    computed.scores[platform] = {}

    FOR category IN rules.categories:
      computed.scores[platform][category.name] = evaluate(category, computed)

    computed.scores[platform].total = sum(category scores)
    computed.scores[platform].band = classify_band(computed.scores[platform].total)

  # Cross-platform blocker detection
  computed.blockers = []

  IF computed.canonical IS hard_fallback_only:
    computed.blockers.append({
      severity: "critical",
      description: "No trustworthy metadata source — cannot infer name or description"
    })

  FOR skill IN computed.skills:
    IF skill has unresolved tool assumptions AND no sidecar exists:
      computed.blockers.append({
        severity: "major",
        description: skill.name + " uses platform-specific tool names with no sidecar mapping"
      })

  IF computed.hooks["hooks/hooks.json"].status == "PRESENT":
    hooks_content = Read("hooks/hooks.json")
    IF hooks_content references platform-specific env vars without branching:
      computed.blockers.append({
        severity: "major",
        description: "Hook scripts reference platform-specific env vars without branching"
      })

  IF file_exists("README.md"):
    readme = Read("README.md")
    IF readme describes install paths that don't match actual structure:
      computed.blockers.append({
        severity: "major",
        description: "Install docs describe a layout the repo doesn't actually have"
      })

  # Gemini @-import completeness
  IF computed.context_files["GEMINI.md"].status == "PRESENT":
    gemini_content = Read("GEMINI.md")
    FOR skill IN computed.skills:
      IF "@./skills/" + skill.name + "/SKILL.md" NOT IN gemini_content:
        computed.blockers.append({
          severity: "minor",
          description: "GEMINI.md missing @-include for skill " + skill.name
        })
```

### Phase 4: Recommend

```pseudocode
RECOMMEND(computed):
  # Overall uplift recommendation
  IF computed.shape == "bare-skill-repo":
    IF len(computed.skills) > 3 OR computed has hooks/agents/commands:
      computed.recommendation = "full-portable-plugin"
    ELSE:
      computed.recommendation = "skill-first"
  ELIF computed.shape == "single-platform-plugin":
    computed.recommendation = "full-portable-plugin"
  ELIF computed.shape == "multi-platform-source":
    computed.recommendation = "hybrid"
  ELIF computed.shape == "curated-distribution":
    computed.recommendation = "curated-note-only"

  # Codex-specific recommendation (always explicit)
  IF computed.shape == "bare-skill-repo" AND no hooks/agents/apps:
    computed.codex_rec = "native-skill-discovery"
  ELIF computed.manifests[".codex-plugin/plugin.json"].status == "PRESENT":
    computed.codex_rec = "native-plugin-packaging"
  ELIF computed.shape == "curated-distribution":
    computed.codex_rec = "curated-package-note"
  ELSE:
    computed.codex_rec = "native-skill-discovery"

  # Per-platform action summary
  FOR platform IN platforms:
    IF computed.scores[platform].band == "strong":
      computed.platform_action[platform] = "No action needed"
    ELIF computed.scores[platform].band == "viable":
      computed.platform_action[platform] = "Minor gaps — uplift recommended"
    ELIF computed.scores[platform].band == "partial":
      computed.platform_action[platform] = "Significant gaps — uplift required"
    ELSE:
      computed.platform_action[platform] = "Minimal support — full uplift needed"
```

### Phase 5: Report

```
# Portability Assessment: {computed.metadata.name} v{computed.metadata.version}

## Repo Shape
{computed.shape}
Metadata inferred from: {computed.canonical.path}

## Metadata
{inference summary — name, description, version, author, etc. with sources}

## Platform Scores

| Platform | Score | Band | Action |
|----------|-------|------|--------|
{FOR platform IN platforms}
| {platform} | {total}/21 | {band} | {action} |
{/FOR}

### Per-Platform Detail
{FOR platform IN platforms}
#### {platform}  ({total}/21 — {band})
| Category | Score |
|----------|-------|
| Manifest packaging | {score}/3 |
| Skill compatibility | {score}/3 |
| Context delivery | {score}/3 |
| Hook portability | {score}/3 |
| Tool mapping | {score}/3 |
| Install readiness | {score}/3 |
| Runtime adapters | {score}/3 |
{/FOR}

## Blockers
{FOR blocker IN computed.blockers sorted by severity}
[{blocker.severity}] {blocker.description}
{/FOR}
{IF no blockers}
No structural blockers detected.
{/IF}

## Uplift Recommendation
Target: {computed.recommendation}
Codex path: {computed.codex_rec}

## Required Artifacts
{FOR platform IN platforms WHERE band != "strong"}
### {platform}
{FOR artifact IN missing artifacts for platform}
  MISSING  {artifact.path}
{/FOR}
{/FOR}

## Session-Start Injection
{computed.injection_status or computed.injection_summary}

## Summary
Run the uplifting-a-plugin skill to generate all missing artifacts automatically.
```

---

## Uplift Skill: Phase Hierarchy

### Frontmatter

```yaml
---
name: uplifting-a-plugin
description: >
  Add multi-platform portability to any plugin. Accepts any starting state —
  Claude, Cursor, Gemini, OpenCode, Copilot, Codex, or bare SKILL.md files.
  Detects what exists, infers canonical metadata, generates every missing
  platform artifact, ports hooks, produces install documentation, and
  optionally configures session-start bootstrapping.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
inputs:
  - name: plugin_path
    type: string
    required: true
    description: Path to the plugin root directory
outputs:
  - name: report
    type: object
    description: Summary of created, skipped, and flagged files
---
```

### Phase Overview

| Phase | Description |
|-------|-------------|
| **Phase 1: Detect** | Scan metadata, elect canonical, build model, classify shape |
| **Phase 2: Inventory** | Discover assets, init tracking, check conflicts |
| **Phase 3: Recommend** | Choose uplift target and Codex packaging path |
| **Phase 4: Generate** | Write missing manifests, context files, sidecars per platform |
| **Phase 5: Port** | Adapt hooks across platforms |
| **Phase 6: Document** | Generate install docs per platform in target repo |
| **Phase 7: Bootstrap** | Opt-in session-start injection |
| **Phase 8: Report** | Summary of created, skipped, flagged files |

### Phase 1: Detect

Same as assess Phase 1. References `lib/patterns/detection-algorithm.md`.

```pseudocode
DETECT(plugin_path):
  computed.sources = scan_metadata_sources(plugin_path)
  IF len(computed.sources) == 0:
    DISPLAY "No recognisable plugin signals found in {plugin_path}."
    EXIT

  computed.canonical = elect_canonical(computed.sources)
  computed.metadata = build_metadata_model(computed.sources)
  computed.shape = classify_shape(computed.sources)
  print_inference_summary(computed.metadata, computed.canonical)
```

### Phase 2: Inventory

```pseudocode
INVENTORY(plugin_path, computed):
  computed.skills = Glob(plugin_path + "/skills/*/SKILL.md")
  # Each skill entry carries both frontmatter name and directory basename:
  #   skill.name = YAML frontmatter "name:" field (may differ from directory)
  #   skill.dir  = directory basename (e.g., "foo-bar" from "skills/foo-bar/SKILL.md")
  #   skill.path = full path to SKILL.md
  # Use skill.dir for filesystem paths; use skill.name for display and metadata.

  computed.commands = Glob(plugin_path + "/commands/*.md")
  computed.agents = Glob(plugin_path + "/agents/*.md")
  computed.existing_hooks = read_json_if_exists(plugin_path + "/hooks/hooks.json")

  # Artifact tracking uses structured records, not plain strings.
  # Each entry: { path: string, platform: string }
  computed.created = []
  computed.skipped = []
  computed.flagged = []

  # Check all potential targets for conflicts
  conflict_checks = [
    { path: ".claude-plugin/plugin.json",                            platform: "claude-code" },
    { path: ".claude-plugin/marketplace.json",                       platform: "claude-code" },
    { path: ".cursor-plugin/plugin.json",                            platform: "cursor"      },
    { path: ".codex-plugin/plugin.json",                             platform: "codex"       },
    { path: "gemini-extension.json",                                 platform: "gemini-cli"  },
    { path: "GEMINI.md",                                             platform: "gemini-cli"  },
    { path: "AGENTS.md",                                             platform: "cross"       },
    { path: "CLAUDE.md",                                             platform: "claude-code" },
    { path: "package.json",                                          platform: "opencode"    },
    { path: ".opencode/plugins/" + computed.metadata.name + ".js",   platform: "opencode"    },
    { path: ".github/copilot-instructions.md",                       platform: "copilot-cli" },
    { path: "hooks/hooks-cursor.json",                               platform: "cursor"      },
  ]
  FOR check IN conflict_checks:
    IF file_exists(check.path):
      computed.skipped.append({ path: check.path, platform: check.platform })
```

### Phase 3: Recommend

Derive the uplift target and Codex packaging decision before generation. This ensures `computed.codex_rec` is populated for conditional manifest generation in Phase 4.

```pseudocode
RECOMMEND(computed):
  # Codex-specific recommendation (drives conditional generation)
  IF computed.shape == "bare-skill-repo" AND NOT computed.existing_hooks AND len(computed.agents) == 0:
    computed.codex_rec = "native-skill-discovery"
  ELIF any(check.path == ".codex-plugin/plugin.json" AND check.status == "PRESENT"
           FOR check IN computed.skipped):
    computed.codex_rec = "native-plugin-packaging"
  ELIF computed.shape == "curated-distribution":
    computed.codex_rec = "curated-package-note"
  ELSE:
    computed.codex_rec = "native-skill-discovery"
```

### Phase 4: Generate

Table-driven generation. See `lib/patterns/manifest-generation.md` for all schemas.

```pseudocode
GENERATE_MANIFESTS(computed):
  manifests = [
    # Claude Code
    { target: ".claude-plugin/plugin.json",      platform: "claude-code", schema: "claude-plugin"      },
    { target: ".claude-plugin/marketplace.json", platform: "claude-code", schema: "claude-marketplace" },
    { target: "CLAUDE.md",                       platform: "claude-code", schema: "claude-context"     },
    # Cursor
    { target: ".cursor-plugin/plugin.json",      platform: "cursor",     schema: "cursor-plugin"      },
    # Gemini CLI
    { target: "gemini-extension.json",           platform: "gemini-cli", schema: "gemini-extension"   },
    { target: "GEMINI.md",                       platform: "gemini-cli", schema: "gemini-context"     },
    # OpenCode
    { target: "package.json",                    platform: "opencode",   schema: "opencode-package"   },
    { target: ".opencode/plugins/{{name}}.js",   platform: "opencode",   schema: "opencode-shim"      },
    # Codex (conditional on codex recommendation)
    { target: ".codex-plugin/plugin.json",       platform: "codex",      schema: "codex-plugin",
      condition: "computed.codex_rec == 'native-plugin-packaging'"                                    },
    # Cross-platform context
    { target: "AGENTS.md",                       platform: "cross",      schema: "agents-context"     },
    # Copilot
    { target: ".github/copilot-instructions.md", platform: "copilot-cli", schema: "copilot-instructions" },
  ]

  FOR manifest IN manifests:
    IF manifest.condition AND NOT evaluate(manifest.condition):
      CONTINUE
    resolved = substitute(manifest.target, computed.metadata)
    IF any(s.path == resolved FOR s IN computed.skipped):
      CONTINUE
    content = render_schema(manifest.schema, computed.metadata)
    Write(resolved, content)
    computed.created.append({ path: resolved, platform: manifest.platform })

GENERATE_SIDECARS(computed):
  sidecar_files = ["copilot-tools.md", "codex-tools.md", "gemini-tools.md"]
  FOR skill IN computed.skills:
    FOR sidecar IN sidecar_files:
      # Use skill.dir (directory basename), not skill.name (frontmatter)
      target = "skills/" + skill.dir + "/references/" + sidecar
      IF NOT file_exists(target):
        source = Read("lib/references/" + sidecar)
        Write(target, source)
        computed.created.append({ path: target, platform: "cross" })

VALIDATE_FRONTMATTER(computed):
  FOR skill IN computed.skills:
    fm = parse_yaml_frontmatter(skill.content)
    IF NOT fm.name OR NOT fm.description:
      computed.flagged.append(
        skill.path + " — missing frontmatter. Add name: and description: in YAML frontmatter."
      )
```

### Phase 5: Port

Hook porting across platforms. See `lib/patterns/hook-merging.md`.

```pseudocode
PORT_HOOKS(computed):
  # Claude Code → Cursor (existing logic)
  IF computed.existing_hooks:
    IF NOT any(s.path == "hooks/hooks-cursor.json" FOR s IN computed.skipped):
      generate_cursor_hooks(computed.existing_hooks)
      computed.created.append({ path: "hooks/hooks-cursor.json", platform: "cursor" })

  # Claude Code → Copilot (NEW)
  IF computed.existing_hooks:
    IF NOT Glob(".github/hooks/*.json"):
      generate_copilot_hooks(computed.existing_hooks)
      # Separate bash/powershell fields, no matcher, filtering in script
      computed.created.append({ path: ".github/hooks/hooks.json", platform: "copilot-cli" })

  # Gemini hook guidance (NEW)
  # Gemini hooks live in user settings.json — cannot write into target repo
  # Guidance is included in install docs (Phase 6)
  IF computed.existing_hooks:
    computed.gemini_hook_guidance = generate_gemini_hook_config(computed.existing_hooks)

  # Windows support
  IF NOT file_exists("hooks/run-hook.cmd"):
    source = Read("lib/templates/hooks/run-hook.cmd")
    Write("hooks/run-hook.cmd", source)
    computed.created.append({ path: "hooks/run-hook.cmd", platform: "cross" })
```

### Phase 6: Document

Generate install documentation. See `lib/templates/install-docs/`.

```pseudocode
GENERATE_INSTALL_DOCS(computed):
  # Determine which platforms have artifacts (from structured records)
  all_artifacts = computed.created + computed.skipped
  platforms_with_artifacts = deduplicate([a.platform FOR a IN all_artifacts
                                         WHERE a.platform != "cross"])

  # Render and write per-platform install docs
  computed.install_sections = {}
  FOR platform IN platforms_with_artifacts:
    template = Read("lib/templates/install-docs/" + platform + ".md")
    rendered = substitute(template, computed.metadata)

    # Append Gemini hook guidance if applicable
    IF platform == "gemini-cli" AND computed.gemini_hook_guidance:
      rendered += "\n" + computed.gemini_hook_guidance

    computed.install_sections[platform] = rendered

  # Codex-specific install doc (standalone file in target repo)
  IF "codex" IN platforms_with_artifacts:
    codex_rendered = computed.install_sections["codex"]
    # Filter to chosen Codex path
    IF computed.codex_rec == "native-skill-discovery":
      codex_rendered = filter_to_skill_discovery_section(codex_rendered)
    Write(".codex/INSTALL.md", codex_rendered)
    computed.created.append({ path: ".codex/INSTALL.md", platform: "codex" })

  # Copilot install doc (standalone file in target repo)
  IF "copilot-cli" IN platforms_with_artifacts:
    Write(".github/INSTALL.md", computed.install_sections["copilot-cli"])
    computed.created.append({ path: ".github/INSTALL.md", platform: "copilot-cli" })

  # Composite install doc for remaining platforms
  # Written to docs/INSTALL.md with all platform sections
  remaining = [p FOR p IN platforms_with_artifacts
               WHERE p NOT IN ["codex", "copilot-cli"]]
  IF len(remaining) > 0:
    composite = "# Installation Guide\n\n"
    FOR platform IN remaining:
      composite += computed.install_sections[platform] + "\n\n---\n\n"
    Write("docs/INSTALL.md", composite)
    computed.created.append({ path: "docs/INSTALL.md", platform: "cross" })

  # README check
  IF file_exists("README.md"):
    readme = Read("README.md")
    IF "## Installation" NOT IN readme AND "## Install" NOT IN readme:
      computed.flagged.append(
        "README.md has no Installation section. " +
        "Per-platform install instructions have been written to docs/INSTALL.md — " +
        "consider linking or including them in README.md."
      )
  ELSE:
    computed.flagged.append(
      "No README.md found. Consider creating one with install instructions."
    )
```

### Phase 7: Bootstrap

Opt-in session-start injection. See `lib/patterns/bootstrapping.md`. Unchanged from current design.

```pseudocode
BOOTSTRAP(computed):
  IF file_exists("skills/using-" + computed.metadata.name + "/SKILL.md"):
    computed.bootstrap_status = "already-configured"
    RETURN

  response = ASK "Generate session-start bootstrapping hooks? (y/n)"
  IF response == "no":
    computed.bootstrap_status = "declined"
    RETURN

  generate_using_skill(computed)
  generate_using_sidecars(computed)
  generate_session_start(computed)
  generate_run_hook_cmd(computed)
  merge_session_start_hooks(computed)
  enhance_opencode_plugin(computed)
  update_gemini_md(computed)
  computed.bootstrap_status = "configured"
```

### Phase 8: Report

```
# Uplift Report: {computed.metadata.name} v{computed.metadata.version}

## Repo Shape
{computed.shape}
Metadata inferred from: {computed.canonical.path}

## Metadata
{inference summary}

## Created
{FOR artifact IN computed.created}
  [{artifact.platform}]  {artifact.path}
{/FOR}

## Skipped (already exists)
{FOR artifact IN computed.skipped}
  [{artifact.platform}]  {artifact.path}
{/FOR}

## Needs Manual Review
{FOR item IN computed.flagged}
  {item}
{/FOR}

## Install Documentation
{FOR platform IN platforms_with_artifacts}
  {platform}: {IF install doc generated THEN "generated" ELSE "flagged"}
{/FOR}

## Session-Start Bootstrapping
{computed.bootstrap_status}
```

---

## Rubric Framework

See `lib/patterns/rubric-framework.md`.

### Scoring Scale

| Score | Meaning |
|-------|---------|
| 0 | Missing — no artifact or capability present |
| 1 | Partial — exists but fragile, incomplete, or tightly coupled |
| 2 | Usable — works but has gaps |
| 3 | Strong — fully portable, complete, correctly structured |

### Seven Categories (per platform)

| # | Category | What it measures |
|---|----------|-----------------|
| 1 | Manifest packaging | Platform manifest present, correct schema, complete fields |
| 2 | Skill compatibility | Skills discoverable, frontmatter correct, no unresolved tool assumptions |
| 3 | Context delivery | Platform context file present, accurate, includes all skills |
| 4 | Hook portability | Hooks adapted to platform format, correct event names, cross-platform scripts |
| 5 | Tool mapping | Per-skill sidecar present, tool name translation documented |
| 6 | Install readiness | Install docs exist, match structure, include verification steps |
| 7 | Runtime adapters | MCP, agents, commands adapted or documented for platform |

### Bands

| Band | Score | Interpretation |
|------|-------|----------------|
| Strong | 18-21 | Platform fully supported |
| Viable | 13-17 | Moderate gaps, straightforward to complete |
| Partial | 8-12 | Significant work needed |
| Weak | 0-7 | Minimal or no support |

### Blocker Severity

| Level | Meaning |
|-------|---------|
| Critical | Uplift cannot proceed safely without resolving |
| Major | Uplift can proceed but output will be partial or fragile |
| Minor | Uplift can proceed normally |

### Blocker Detection Rules

| Blocker | Severity |
|---------|----------|
| No trustworthy metadata source | Critical |
| Skills use platform-specific tool names with no sidecar mapping | Major |
| Hook scripts reference platform-specific env vars without branching | Major |
| Install docs describe a layout the repo doesn't have | Major |
| Whole-repo install required but single-skill docs shipped | Minor |
| Skills dispatch subagents but no codex-tools/copilot-tools mapping | Minor |
| GEMINI.md missing @-includes for some skills | Minor |

---

## Per-Platform Scoring Rules

Each `lib/patterns/platforms/<platform>.md` file defines what constitutes each score level. Key platform-specific differences:

### Claude Code
- Manifest: checks `plugin.json` field completeness (name, version, description, author, keywords)
- Hooks: checks all four handler types; PreToolUse vs PostToolUse output format consistency
- Runtime: checks `.mcp.json`, `.lsp.json`, `monitors/`, `bin/`, `settings.json`

### Cursor
- Manifest: checks `displayName`, `logo` field, conditional `agents`/`commands` keys
- Context: scores `.cursor/rules/*.mdc` alongside `AGENTS.md`
- Hooks: camelCase event names, `additional_context` (snake_case output), `hooks-cursor.json`
- MCP: `mcp.json` (not `.mcp.json`), no Resources support

### Gemini CLI
- Manifest: `gemini-extension.json` with `name` matching directory name, `contextFileName` set
- Context: `GEMINI.md` with `@` includes for every skill (SKILL.md + gemini-tools.md)
- Hooks: in `settings.json`, not standalone file — assess checks guidance exists
- Tools: flags `Task`/subagent dispatch (Gemini uses `@agent-name` syntax)
- Runtime: `agents/*.md` with mandatory frontmatter, `commands/*.toml`, `policies/*.toml`

### OpenCode
- Manifest: `.opencode/plugins/<name>.js` + `package.json` with correct `main`
- Context: `AGENTS.md` is primary ("first type wins" — `CLAUDE.md` ignored if `AGENTS.md` exists)
- Hooks: code-based — checks `experimental.chat.messages.transform` for session-start
- Tools: lowercase names (`read`, `edit`, `bash`)
- MCP: in `opencode.json` (not `.mcp.json`); `config` hook injects servers programmatically

### Copilot CLI
- Manifest: no plugin manifest — scored on `.github/copilot-instructions.md`
- Context: repo-wide + path-specific `*.instructions.md` + `AGENTS.md`/`CLAUDE.md`
- Hooks: `.github/hooks/*.json`, separate `bash`/`powershell` fields, no `matcher`
- Skills: `.github/skills/` or cross-platform `skills/` paths
- Runtime: `.github/agents/*.agent.md` with `description` required, `tools` allowlist, `target` field

### Codex
- Manifest: depends on chosen path — plugin (`codex-plugin/plugin.json` + marketplace) or skill-discovery (`AGENTS.md` + `.codex/INSTALL.md`)
- Tools: `spawn_agent` vs `Task`, `update_plan` vs `TodoWrite`, message framing
- Install: most critical category — must document chosen consumption path
- Runtime: multi-agent config flag awareness, sandbox/detached-HEAD handling

---

## Manifest Generation Additions

Added to `lib/patterns/manifest-generation.md`:

### codex-plugin

**Target:** `.codex-plugin/plugin.json`

```json
{
  "name": "{{name}}",
  "description": "{{description}}",
  "version": "{{version}}",
  "skills": "./skills/",
  "hooks": "./hooks/"
}
```

### copilot-instructions

**Target:** `.github/copilot-instructions.md`

```markdown
# {{displayName}}

{{description}}

## Skills

This project provides agent skills in the `skills/` directory. Skills follow the open SKILL.md standard and are auto-discovered.

## Tool Name Mapping

Skills use Claude Code tool names. Platform equivalents:

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

---

## Hook Merging Additions

Added to `lib/patterns/hook-merging.md`:

### Claude Code → Copilot event mapping

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

### Copilot hook format

```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      {
        "type": "command",
        "bash": "./hooks/scripts/validate.sh",
        "powershell": ".\\hooks\\scripts\\validate.ps1",
        "timeoutSec": 30
      }
    ]
  }
}
```

Key differences: separate `bash`/`powershell` fields (not `command`), no `matcher` (filtering in script body), default 30s timeout, only `preToolUse` can block.

### Gemini hook guidance format

Generated as text for install docs, not as a file:

```json
{
  "hooks": {
    "BeforeTool": [
      {
        "matcher": "write_file",
        "sequential": true,
        "hooks": [
          {
            "name": "validate-writes",
            "type": "command",
            "command": "./hooks/scripts/validate.sh",
            "timeout": 60000
          }
        ]
      }
    ]
  }
}
```

Note: Gemini hooks go in user `settings.json`, not in the repo. Install docs should include this config for users to copy.

---

## Detection Algorithm Addition: D5

Added to `lib/patterns/detection-algorithm.md`:

### Step D5: Classify Repo Shape

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

---

## File Changes

### Deleted

| File | Reason |
|------|--------|
| `skills/auditing-plugin-portability/SKILL.md` | Replaced by assessing skill |
| `skills/auditing-plugin-portability/patterns/injection-checks.md` | Moves to `lib/patterns/` |
| `skills/auditing-plugin-portability/references/*` | Shared via `lib/references/` |
| `skills/uplifting-a-plugin/patterns/manifest-generation.md` | Moves to `lib/patterns/` |
| `skills/uplifting-a-plugin/patterns/hook-merging.md` | Moves to `lib/patterns/` |
| `skills/uplifting-a-plugin/patterns/bootstrapping.md` | Moves to `lib/patterns/` |
| `skills/uplifting-a-plugin/references/*` | Shared via `lib/references/` |

### Moved to `lib/patterns/`

| From | To |
|------|-----|
| `skills/uplifting-a-plugin/patterns/manifest-generation.md` | `lib/patterns/manifest-generation.md` |
| `skills/uplifting-a-plugin/patterns/hook-merging.md` | `lib/patterns/hook-merging.md` |
| `skills/uplifting-a-plugin/patterns/bootstrapping.md` | `lib/patterns/bootstrapping.md` |
| `skills/auditing-plugin-portability/patterns/injection-checks.md` | `lib/patterns/injection-checks.md` |

### Created

| File | Description |
|------|-------------|
| `skills/assessing-plugin-portability/SKILL.md` | 5-phase assessment skill |
| `lib/patterns/rubric-framework.md` | Scoring scale, bands, blocker levels |
| `lib/patterns/platforms/claude-code.md` | Claude Code scoring rules |
| `lib/patterns/platforms/cursor.md` | Cursor scoring rules |
| `lib/patterns/platforms/gemini-cli.md` | Gemini CLI scoring rules |
| `lib/patterns/platforms/opencode.md` | OpenCode scoring rules |
| `lib/patterns/platforms/copilot-cli.md` | Copilot CLI scoring rules |
| `lib/patterns/platforms/codex.md` | Codex scoring rules |
| `lib/templates/install-docs/claude-code.md` | Install doc template |
| `lib/templates/install-docs/cursor.md` | Install doc template |
| `lib/templates/install-docs/gemini-cli.md` | Install doc template |
| `lib/templates/install-docs/opencode.md` | Install doc template |
| `lib/templates/install-docs/copilot-cli.md` | Install doc template |
| `lib/templates/install-docs/codex.md` | Install doc template |

### Modified

| File | Changes |
|------|---------|
| `lib/patterns/detection-algorithm.md` | Add D5 (shape classification) |
| `lib/patterns/manifest-generation.md` | Add `codex-plugin`, `copilot-instructions` schemas |
| `lib/patterns/hook-merging.md` | Add Copilot hook generation, Gemini hook guidance |
| `skills/uplifting-a-plugin/SKILL.md` | Rewrite — 7 phases |

---

## Non-Goals

- **Changing bootstrapping behavior**: Session-start injection is unchanged.
- **Writing Gemini settings.json**: Gemini hooks are user config — we generate guidance in install docs, not the file itself.
- **Auto-modifying README.md**: Too risky. We flag the gap and provide rendered install sections.
- **Copilot Extensions (server-side)**: GitHub App-based extensions require HTTPS endpoints — not file-based portability.
- **Writing Cursor rules**: `.mdc` rules are project-specific conventions — we assess their presence but don't generate them.

---

## Size Estimates

| File | Estimated lines |
|------|----------------|
| `skills/assessing-plugin-portability/SKILL.md` | ~350 |
| `skills/uplifting-a-plugin/SKILL.md` | ~350 |
| `lib/patterns/rubric-framework.md` | ~100 |
| `lib/patterns/platforms/*.md` (6 files) | ~150 each, ~900 total |
| `lib/templates/install-docs/*.md` (6 files) | ~50 each, ~300 total |
| `lib/patterns/detection-algorithm.md` (expanded) | ~210 (from 172) |
| `lib/patterns/manifest-generation.md` (expanded) | ~280 (from 222) |
| `lib/patterns/hook-merging.md` (expanded) | ~250 (from 153) |
