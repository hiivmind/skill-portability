---
name: uplifting-a-plugin
description: >
  Use when you need to add multi-platform portability to any plugin. Accepts any
  starting state — Claude, Cursor, Gemini, Codex, Antigravity, OpenClaw, or bare
  SKILL.md files. Detects what exists, infers canonical metadata, generates every
  missing platform artifact, ports hooks, produces install documentation, and
  optionally configures session-start bootstrapping. Uses condition-linked generation
  where every artifact maps to specific rubric conditions via fixes: annotations.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Uplifting a Plugin to Multi-Platform Portability

Transform any plugin into a fully portable plugin. No platform is assumed.

**Inputs:**

- `plugin_path` (string, required) — Path to the plugin root directory.
- `platforms` (string, optional) — Comma-separated list of target platforms. If omitted, presents an interactive checklist. Valid: claude-code, cursor, gemini-cli, codex, antigravity, openclaw, all.

**Output:** Summary of created, skipped, and flagged files.

> **Detection Algorithm:** `lib/patterns/detection-algorithm.md`
> **Rubric Framework:** `lib/patterns/rubric-framework.md`
> **Platform Rubrics:** `lib/patterns/platforms/<platform>.yaml`
> **Lookup Tables:** `lib/references/platform-mappings.md`
> **Manifest Schemas:** `lib/patterns/manifest-generation.md`
> **Manifest Templates:** `lib/templates/manifests/`
> **Context File Templates:** `lib/templates/context-files/`
> **Hook Merging:** `lib/patterns/hook-merging.md`
> **Bootstrapping:** `lib/patterns/bootstrapping.md`
> **Platform References:** `lib/references/codex-tools.md`, `gemini-tools.md`
> **Hook Templates:** `lib/templates/hooks/session-start.sh`, `run-hook.cmd`
> **Install Doc Templates:** `lib/templates/install-docs/`

## Overview

| Phase | Description |
| ----- | ----------- |
| **Phase 1: Detect** | Scan metadata, elect canonical, build model, classify shape |
| **Phase 2: Inventory** | Discover assets, init tracking, check conflicts |
| **Phase 3: Recommend** | Recommend uplift target, optionally quick-assess, confirm with user |
| **Phase 4: Generate** | Write missing manifests, context files, sidecars — every action carries `# fixes:` |
| **Phase 5: Port** | Adapt hooks across platforms using lookup tables |
| **Phase 6: Document** | Generate install docs per platform in target repo |
| **Phase 7: Bootstrap** | Opt-in session-start injection |
| **Phase 8: Report** | Summary of created, skipped, flagged files |

**Minimum starting state:** At least one `skills/*/SKILL.md` with `name` + `description`
frontmatter, or any platform manifest file.

**Idempotent:** Running twice on the same repo produces no diff on the second run.

## 1. Phase 1: Detect

Run the shared detection algorithm. See `lib/patterns/detection-algorithm.md` for full detail.

### 1.1 Scan and Infer

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

## 2. Phase 2: Inventory

### 2.1 Discover Assets

```pseudocode
INVENTORY(plugin_path):
  raw_skills = Glob(plugin_path + "/skills/*/SKILL.md")
  computed.skills = [
    { path: s, dir: dirname(s), name: basename(dirname(s)) }
    FOR s IN raw_skills
  ]
  computed.commands       = Glob(plugin_path + "/commands/*.md")
  computed.agents         = Glob(plugin_path + "/agents/*.md")
  computed.existing_hooks = read_json_if_exists(plugin_path + "/hooks/hooks.json")

  computed.created = []   # list of { path, platform }
  computed.skipped = []   # list of { path, platform }
  computed.flagged = []   # list of strings
```

### 2.2 Check Conflicts

```pseudocode
CHECK_CONFLICTS(computed):
  conflict_checks = [
    { path: ".claude-plugin/plugin.json",                          platform: "claude-code" },
    { path: ".claude-plugin/marketplace.json",                     platform: "claude-code" },
    { path: ".cursor-plugin/plugin.json",                          platform: "cursor"      },
    { path: ".cursor-plugin/marketplace.json",                     platform: "cursor"      },
    { path: ".codex-plugin/plugin.json",                           platform: "codex"       },
    { path: ".agents/plugins/marketplace.json",                    platform: "codex"       },
    { path: "gemini-extension.json",                               platform: "gemini-cli"  },
    { path: "GEMINI.md",                                           platform: "gemini-cli"  },
    { path: "AGENTS.md",                                           platform: "cross"       },
    { path: "CLAUDE.md",                                           platform: "claude-code" },
    { path: "hooks/hooks-cursor.json",                             platform: "cursor"      },
    { path: "package.json",                                        platform: "antigravity" },
    { path: "openclaw.plugin.json",                                platform: "openclaw"    },
  ]

  FOR check IN conflict_checks:
    IF file_exists(check.path):
      computed.skipped.append({ path: check.path, platform: check.platform })
```

## 3. Phase 3: Recommend

Interactive uplift target recommendation and platform selection. Uses `computed.shape`
from Phase 1 to derive a recommendation, then optionally runs a quick rubric assessment
to determine whether any platforms are already viable and only need incremental fixes.

### 3.1 Quick Assessment for Incremental Uplift

```pseudocode
QUICK_ASSESS(computed, target_platforms):
  # Load rubric framework from lib/patterns/rubric-framework.md
  # Load per-platform rubrics from lib/patterns/platforms/<platform>.yaml
  scores = {}
  FOR platform IN target_platforms:
    rubric = load_rubric("lib/patterns/platforms/" + platform + ".yaml")
    result = quick_assess(rubric, computed.plugin_path)
    scores[platform] = result  # { band: "strong"|"viable"|"partial"|"weak", failing: [...] }
  RETURN scores
```

### 3.2 Recommend and Confirm Uplift Target

```pseudocode
RECOMMEND(computed, target_platforms):
  # Optional quick assessment for incremental uplift
  scores = QUICK_ASSESS(computed, target_platforms)

  # Shape-based recommendation (existing logic)
  IF computed.shape == "bare-skill-repo" AND len(computed.skills) <= 3:
    recommendation = "skill-first"
    rationale = "This repo has " + len(computed.skills) + " skill(s) and no platform manifests. Skill-first generates sidecars and context files without full plugin packaging."

  ELIF computed.shape == "single-platform-plugin":
    recommendation = "full-portable-plugin"
    rationale = "This repo already has one platform manifest. Full plugin packaging adds the remaining platforms."

  ELIF computed.shape == "multi-platform-source":
    recommendation = "full-portable-plugin"
    rationale = "This repo already targets multiple platforms. Full plugin packaging fills the remaining gaps."

  ELIF computed.shape == "curated-distribution":
    recommendation = "curated-note-only"
    rationale = "This repo is a marketplace distribution without upstream skills. Only install documentation and notes will be generated."

  ELSE:
    recommendation = "full-portable-plugin"
    rationale = "Repo shape could not be classified. Defaulting to full plugin packaging."

  # Override: incremental uplift for already-viable platforms
  recommendation_for = {}
  FOR platform IN target_platforms:
    IF platform IN scores AND scores[platform].band IN ["strong", "viable"]:
      recommendation_for[platform] = "incremental"
    ELSE:
      recommendation_for[platform] = recommendation

  # If platforms input was provided, auto-confirm
  IF inputs.platforms IS PROVIDED:
    computed.uplift_target = recommendation
    computed.recommendation_for = recommendation_for
    RETURN

  # Present to user
  DISPLAY "## Uplift Target"
  DISPLAY "Shape: " + computed.shape
  DISPLAY "Recommendation: **" + recommendation + "**"
  DISPLAY rationale
  DISPLAY ""
  FOR platform IN target_platforms:
    IF recommendation_for[platform] == "incremental":
      DISPLAY "  " + platform + ": **incremental** (already " + scores[platform].band + ")"
    ELSE:
      DISPLAY "  " + platform + ": **" + recommendation + "**"
  DISPLAY ""
  DISPLAY "Options:"
  DISPLAY "  1. skill-first — sidecars, context files, AGENTS.md only (no platform manifests)"
  DISPLAY "  2. full-portable-plugin — all platform manifests + context files + sidecars + install docs"
  DISPLAY "  3. curated-note-only — install notes only"

  response = ASK "Accept recommendation (" + recommendation + "), or choose 1/2/3?"

  IF response confirms recommendation:
    computed.uplift_target = recommendation
    computed.recommendation_for = recommendation_for
  ELSE:
    computed.uplift_target = parse_choice(response)
    # Reset incremental overrides if user chose differently
    FOR platform IN target_platforms:
      IF recommendation_for[platform] != "incremental":
        recommendation_for[platform] = computed.uplift_target
    computed.recommendation_for = recommendation_for
```

### 3.3 Select Target Platforms

```pseudocode
SELECT_PLATFORMS(computed):
  all_platforms = ["claude-code", "cursor", "gemini-cli", "codex", "antigravity", "openclaw"]

  # If platforms input was provided, use it directly
  IF inputs.platforms IS PROVIDED:
    IF inputs.platforms == "all":
      computed.target_platforms = all_platforms
    ELSE:
      computed.target_platforms = parse_csv(inputs.platforms)
      validate_platform_names(computed.target_platforms)
    RETURN

  # Pre-select based on uplift target and existing state
  IF computed.uplift_target == "skill-first":
    preselected = all_platforms
  ELIF computed.uplift_target == "curated-note-only":
    preselected = [p FOR p IN all_platforms
                   IF any(s.platform == p FOR s IN computed.skipped)]
    IF len(preselected) == 0:
      preselected = all_platforms
  ELSE:
    preselected = all_platforms

  # Present checklist
  DISPLAY "## Target Platforms"
  DISPLAY ""
  FOR p IN all_platforms:
    marker = "[x]" IF p IN preselected ELSE "[ ]"
    existing = " (manifest exists)" IF any(s.platform == p FOR s IN computed.skipped) ELSE ""
    DISPLAY "  " + marker + " " + p + existing
  DISPLAY ""

  response = ASK "Confirm platforms, or list the ones you want (e.g. 'claude-code, cursor, gemini-cli')?"

  IF response confirms:
    computed.target_platforms = preselected
  ELSE:
    computed.target_platforms = parse_platform_list(response)

  # Validate: at least one platform required
  IF len(computed.target_platforms) == 0:
    DISPLAY "At least one platform must be selected."
    GOTO SELECT_PLATFORMS
```

### 3.4 Derive Codex Path

```pseudocode
DERIVE_CODEX_PATH(computed):
  IF "codex" NOT IN computed.target_platforms:
    computed.codex_rec = None
    RETURN

  IF computed.uplift_target == "skill-first":
    computed.codex_rec = "native-skill-discovery"
  ELIF computed.uplift_target == "curated-note-only":
    computed.codex_rec = "curated-package-note"
  ELSE:
    computed.codex_rec = "native-plugin-packaging"
```

### 3.5 Early Exit for Curated-Note-Only

```pseudocode
IF computed.uplift_target == "curated-note-only":
  SKIP Phase 4 (Generate)
  SKIP Phase 5 (Port)
  RUN  Phase 6 (Document) — install docs only, for selected platforms
  SKIP Phase 7 (Bootstrap)
  RUN  Phase 8 (Report)
  RETURN
```

## 4. Phase 4: Generate

Every generation action carries a `# fixes:` annotation linking it to the condition
IDs it resolves from the platform rubrics in `lib/patterns/platforms/<platform>.yaml`.

### 4.1 Write Platform Manifests

Table-driven generation. See `lib/patterns/manifest-generation.md` for all schemas.

```pseudocode
GENERATE_MANIFESTS(computed, target_platforms):
  FOR platform IN target_platforms:
    IF computed.recommendation_for[platform] == "incremental":
      # Only fix failing conditions from assessment
      failing = get_failing_conditions(platform, "1_manifest")
      FOR condition IN failing:
        IF condition.template:
          render(condition.template, computed.metadata)
          # fixes: {condition.id}
      CONTINUE

    # Full generation — render all manifest templates for platform
    # Skill-first: skip platform manifests, only generate context files
    IF computed.uplift_target == "skill-first":
      CONTINUE

    IF platform == "claude-code":
      IF NOT file_exists(".claude-plugin/plugin.json"):
        template_path = "lib/templates/manifests/claude-plugin.json.tmpl"
        render(template_path, computed.metadata)
        # fixes: claude.1_manifest.plugin_json.exists
        # fixes: claude.1_manifest.plugin_json.required_fields
      IF is_multi_plugin_repo AND NOT file_exists(".claude-plugin/marketplace.json"):
        template_path = "lib/templates/manifests/claude-marketplace.json.tmpl"
        render(template_path, computed.metadata)
        # fixes: claude.1_manifest.marketplace_json.exists
        # fixes: claude.1_manifest.marketplace_json.valid_entries
        # fixes: claude.1_manifest.marketplace_json.source_paths

    ELIF platform == "cursor":
      IF NOT file_exists(".cursor-plugin/plugin.json"):
        template_path = "lib/templates/manifests/cursor-plugin.json.tmpl"
        render(template_path, computed.metadata)
        # fixes: cursor.1_manifest.plugin_json.exists
        # fixes: cursor.1_manifest.plugin_json.required_fields
      IF is_multi_plugin_repo AND NOT file_exists(".cursor-plugin/marketplace.json"):
        template_path = "lib/templates/manifests/cursor-marketplace.json.tmpl"
        render(template_path, computed.metadata)
        # fixes: cursor.1_manifest.marketplace_json.exists

    ELIF platform == "gemini-cli":
      IF NOT file_exists("gemini-extension.json"):
        template_path = "lib/templates/manifests/gemini-extension.json.tmpl"
        render(template_path, computed.metadata)
        # fixes: gemini.1_manifest.extension_json.exists
        # fixes: gemini.1_manifest.extension_json.required_fields
        # fixes: gemini.1_manifest.extension_json.context_filename

    ELIF platform == "codex":
      IF computed.codex_rec == "native-plugin-packaging":
        IF NOT file_exists(".codex-plugin/plugin.json"):
          template_path = "lib/templates/manifests/codex-plugin.json.tmpl"
          render(template_path, computed.metadata)
          # fixes: codex.1_manifest.plugin_json.exists
          # fixes: codex.1_manifest.plugin_json.required_fields
        IF NOT file_exists(".agents/plugins/marketplace.json"):
          template_path = "lib/templates/manifests/codex-marketplace.json.tmpl"
          render(template_path, computed.metadata)
          # fixes: codex.1_manifest.marketplace_json.exists

    ELIF platform == "antigravity":
      IF NOT file_exists("package.json"):
        template_path = "lib/templates/manifests/antigravity-package.json.tmpl"
        render(template_path, computed.metadata)
        # fixes: antigravity.1_manifest.package_json.exists
        # fixes: antigravity.1_manifest.package_json.required_fields
        # fixes: antigravity.1_manifest.package_json.publisher

    ELIF platform == "openclaw":
      IF NOT file_exists("openclaw.plugin.json"):
        template_path = "lib/templates/manifests/openclaw-plugin.json.tmpl"
        render(template_path, computed.metadata)
        # fixes: openclaw.1_manifest.openclaw_json.exists
        # fixes: openclaw.1_manifest.openclaw_json.required_fields
        # fixes: openclaw.1_manifest.openclaw_json.skills_array

    computed.created.append({ path: target_path, platform: platform })
```

The `is_manifest()` predicate classifies schemas as packaging vs context:

```pseudocode
MANIFEST_SCHEMAS = [
  "claude-plugin", "claude-marketplace", "cursor-plugin",
  "gemini-extension", "codex-plugin",
  "codex-marketplace", "antigravity-package", "openclaw-plugin"
]
CONTEXT_SCHEMAS = [
  "claude-context", "gemini-context", "agents-context"
]

FUNCTION is_manifest(schema):
  RETURN schema IN MANIFEST_SCHEMAS
```

Under `skill-first`, only context schemas are generated (plus sidecars). Under `full-portable-plugin`, both manifest and context schemas are generated.

### 4.2 Generate Context Files

```pseudocode
GENERATE_CONTEXT_FILES(computed, target_platforms):
  FOR platform IN target_platforms:
    IF computed.recommendation_for[platform] == "incremental":
      # Only fix failing conditions from assessment
      failing = get_failing_conditions(platform, "3_context")
      FOR condition IN failing:
        IF condition.template:
          render(condition.template, computed.metadata)
          # fixes: {condition.id}
      CONTINUE

    # Full generation per platform
    IF platform == "claude-code":
      IF NOT file_exists("CLAUDE.md"):
        render("lib/templates/context-files/CLAUDE.md.tmpl", computed.metadata)
        # fixes: claude.3_context.claude_md.exists
        computed.created.append({ path: "CLAUDE.md", platform: "claude-code" })

    IF platform == "gemini-cli" OR platform == "antigravity":
      IF NOT file_exists("GEMINI.md"):
        render("lib/templates/context-files/GEMINI.md.tmpl", computed.metadata)
        # fixes: gemini.3_context.gemini_md.exists
        # fixes: gemini.3_context.gemini_md.at_includes_skills
        # fixes: gemini.3_context.gemini_md.at_includes_sidecars
        computed.created.append({ path: "GEMINI.md", platform: platform })

    IF platform IN ["cursor", "codex", "antigravity", "openclaw"]:
      IF NOT file_exists("AGENTS.md"):
        render("lib/templates/context-files/AGENTS.md.tmpl", computed.metadata)
        # fixes: cursor.3_context.agents_md.exists
        # fixes: codex.1_manifest.agents_md.exists
        # fixes: antigravity.3_context.agents_md.exists
        # fixes: openclaw.3_context.agents_md.exists
        computed.created.append({ path: "AGENTS.md", platform: "cross" })
```

### 4.3 Seed Tool-Mapping Sidecars

```pseudocode
GENERATE_SIDECARS(computed, target_platforms):
  sidecar_platform_map = {
    "gemini-tools.md":  "gemini-cli",
    "codex-tools.md":   "codex",
  }

  FOR platform IN ["gemini-cli", "codex"]:
    IF platform NOT IN target_platforms:
      CONTINUE
    sidecar_name = "gemini-tools.md" IF platform == "gemini-cli" ELSE "codex-tools.md"
    FOR skill IN computed.skills:
      sidecar_path = skill.dir + "/references/" + sidecar_name
      IF NOT file_exists(sidecar_path):
        copy_from("lib/references/" + sidecar_name, sidecar_path)
        IF platform == "gemini-cli":
          # fixes: gemini.5_toolmap.sidecar.exists
          # fixes: gemini.5_toolmap.sidecar.read_mapping
          # fixes: gemini.5_toolmap.sidecar.edit_mapping
          # fixes: gemini.5_toolmap.sidecar.bash_mapping
          pass
        ELIF platform == "codex":
          # fixes: codex.5_toolmap.sidecar.exists
          # fixes: codex.5_toolmap.sidecar.spawn_agent_mapped
          # fixes: codex.5_toolmap.sidecar.update_plan_mapped
          pass
        computed.created.append({ path: sidecar_path, platform: platform })
```

### 4.4 Validate Skills Frontmatter

```pseudocode
VALIDATE_FRONTMATTER(computed):
  FOR skill IN computed.skills:
    frontmatter = parse_yaml_frontmatter(Read(skill.path))
    IF NOT frontmatter.name OR NOT frontmatter.description:
      computed.flagged.append(
        skill.path + " — missing frontmatter field(s). Add name: and description: in YAML frontmatter."
      )
      # Would fix: claude.2_skills.frontmatter.required_fields
      # Would fix: cursor.2_skills.frontmatter.required_fields
      # Would fix: gemini.2_skills.frontmatter.required_fields
      # Would fix: codex.2_skills.frontmatter.required_fields
      # Would fix: antigravity.2_skills.frontmatter.required_fields
      # Would fix: openclaw.2_skills.frontmatter.required_fields
```

Do NOT auto-write — frontmatter descriptions require human authorship.

## 5. Phase 5: Port

Adapt hooks from any source platform to all target platforms.
See `lib/patterns/hook-merging.md` for event mapping and merge logic.
Uses `LOOKUP` tables from `lib/references/platform-mappings.md` for all mappings.

Hook porting is filtered by `computed.target_platforms`. Each subsection only
runs if its target platform is selected.

### 5.1 Claude Code → Cursor Hooks

```pseudocode
PORT_CURSOR_HOOKS(computed):
  IF "cursor" NOT IN computed.target_platforms:
    RETURN
  IF any(s.path == "hooks/hooks-cursor.json" FOR s IN computed.skipped):
    RETURN
  IF computed.existing_hooks:
    # Convert Claude hooks to Cursor format
    # Uses LOOKUP["hook_events"]["cursor"] for event name mapping (Table 3)
    #   PascalCase → camelCase (e.g. SessionStart → sessionStart)
    # Uses LOOKUP["hook_format"]["cursor"] for structure flattening (Table 7)
    #   Nested matcher → hooks[] becomes flat structure
    # Uses LOOKUP["path_variables"]["cursor"] for path variable substitution (Table 4)
    #   ${CLAUDE_PLUGIN_ROOT} → ${CURSOR_PLUGIN_ROOT}
    claude_hooks = read_json("hooks/hooks.json")
    cursor_hooks = convert_hooks(claude_hooks, "cursor")
    write_json("hooks/hooks-cursor.json", cursor_hooks)
    # fixes: cursor.4_hooks.hooks_json.exists
    # fixes: cursor.4_hooks.event_names.camelcase
    # fixes: cursor.4_hooks.hooks_json.flat_structure
  ELSE:
    Write("hooks/hooks-cursor.json", '{ "version": 1, "hooks": {} }')
    # fixes: cursor.4_hooks.hooks_json.exists
  computed.created.append({ path: "hooks/hooks-cursor.json", platform: "cursor" })
```

### 5.2 Gemini Hook Guidance

Gemini CLI hooks are configured interactively by users via `settings.json` —
they cannot be written as repo files. Capture guidance text to include in install docs.

```pseudocode
GEMINI_HOOK_GUIDANCE(computed):
  IF "gemini-cli" NOT IN computed.target_platforms:
    RETURN
  IF computed.existing_hooks:
    # Uses LOOKUP["hook_events"]["gemini"] for event name mapping (Table 3)
    #   PascalCase stays PascalCase but some names differ
    #   (e.g. PreToolUse → BeforeTool, PostToolUse → AfterTool)
    computed.gemini_hook_text = render_gemini_hook_instructions(computed.existing_hooks)
    # fixes: gemini.4_hooks.hooks_json.guidance_present
  ELSE:
    computed.gemini_hook_text = NULL
```

### 5.3 OpenClaw Hook SDK Guidance

OpenClaw hooks use TypeScript plugin SDK (`api.registerHook()`), not file-based config.

```pseudocode
OPENCLAW_HOOK_GUIDANCE(computed):
  IF "openclaw" NOT IN computed.target_platforms:
    RETURN
  IF computed.existing_hooks:
    # Uses LOOKUP["hook_events"]["openclaw"] for event name mapping (Table 3)
    #   PascalCase → snake_case SDK names
    #   (e.g. SessionStart → gateway:startup, PreToolUse → before_tool_call)
    computed.openclaw_hook_text = render_openclaw_sdk_instructions(computed.existing_hooks)
    # fixes: openclaw.4_hooks.hooks_json.sdk_guidance
    # fixes: openclaw.4_hooks.hooks_json.typescript_wrapper
  ELSE:
    computed.openclaw_hook_text = NULL
```

### 5.4 Codex and Antigravity

Codex and Antigravity have no hook systems. No hook porting is needed.

### 5.5 Windows Support

```pseudocode
PORT_WINDOWS_HOOKS(computed):
  IF file_exists("lib/templates/hooks/run-hook.cmd"):
    source = Read("lib/templates/hooks/run-hook.cmd")
    Write("hooks/run-hook.cmd", source)
    computed.created.append({ path: "hooks/run-hook.cmd", platform: "cross" })
    # fixes: cursor.4_hooks.scripts.cross_platform
```

### 5.6 Hook Script Path Variables

```pseudocode
PORT_HOOK_SCRIPTS(computed):
  FOR script IN Glob("hooks/scripts/*"):
    content = Read(script)
    IF "${CLAUDE_PLUGIN_ROOT}" IN content:
      # Add env branching for all platforms with path variables
      # Uses LOOKUP["path_variables"] (Table 4) for variable names
      IF "${CURSOR_PLUGIN_ROOT}" NOT IN content:
        add_env_branching(script, "CURSOR_PLUGIN_ROOT")
        # fixes: cursor.4_hooks.scripts.no_claude_paths
      IF "${extensionPath}" NOT IN content:
        add_env_branching(script, "extensionPath")
```

## 6. Phase 6: Document

Generate install documentation for every platform that received artifacts.
See `lib/templates/install-docs/` for section templates.

### 6.1 Determine Platforms With Artifacts

```pseudocode
DETERMINE_PLATFORMS(computed):
  platforms_with_artifacts = computed.target_platforms
```

### 6.2 Render Per-Platform Install Sections

```pseudocode
RENDER_INSTALL_SECTIONS(computed, platforms_with_artifacts):
  sections = {}
  FOR platform IN platforms_with_artifacts:
    template = Read("lib/templates/install-docs/" + platform + ".md")
    sections[platform] = render(template, computed.metadata)
    # fixes: {platform_prefix}.6_install.install_docs.exists
    # where platform_prefix maps:
    #   claude-code → claude, cursor → cursor, gemini-cli → gemini,
    #   codex → codex, antigravity → antigravity, openclaw → openclaw

  IF computed.gemini_hook_text:
    sections["gemini-cli"] += "\n\n### Hook Setup\n\n" + computed.gemini_hook_text
  IF computed.openclaw_hook_text:
    sections["openclaw"] += "\n\n### Hook Setup (SDK)\n\n" + computed.openclaw_hook_text
  RETURN sections
```

### 6.3 Write Install Docs

```pseudocode
WRITE_INSTALL_DOCS(computed, sections, platforms_with_artifacts):
  # Whole-repo note: only include when plugin has shared assets that require
  # whole-repo install (hooks, session-start bootstrapping, root context files,
  # or platform manifests). Bare skill repos without these can use npx skills.
  has_shared_assets = (
    computed.existing_hooks
    OR file_exists("skills/using-" + computed.metadata.name + "/SKILL.md")
    OR any(file_exists(p) FOR p IN ["CLAUDE.md", "AGENTS.md", "GEMINI.md"])
    OR computed.uplift_target == "full-portable-plugin"
  )
  IF has_shared_assets:
    whole_repo_note = render(Read("lib/templates/install-docs/whole-repo-note.md"), computed.metadata)
  ELSE:
    whole_repo_note = ""

  fresh_install = ""
  adding_platform = ""
  FOR platform IN platforms_with_artifacts:
    fresh_install += sections[platform] + "\n\n"
    adding_tmpl = read_if_exists("lib/templates/install-docs/adding-platform/" + platform + ".md")
    IF adding_tmpl:
      adding_platform += render(adding_tmpl, computed.metadata) + "\n\n"

  content = "# Installation\n\n"
  IF whole_repo_note:
    content += whole_repo_note + "\n\n"
  content += "## Fresh Install\n\n" + fresh_install
  content += "## Adding Another Platform\n\n"
  content += "Already have the repo cloned for one platform? Add others by pointing them at the same checkout.\n\n"
  content += adding_platform

  Write("INSTALL.md", content)
  computed.created.append({ path: "INSTALL.md", platform: "cross" })
  # fixes: claude.6_install.install_docs.exists
  # fixes: cursor.6_install.install_docs.exists
  # fixes: gemini.6_install.install_docs.exists
  # fixes: codex.6_install.install_docs.exists
  # fixes: antigravity.6_install.install_docs.exists
  # fixes: openclaw.6_install.install_docs.exists

  # Platform-specific pointers (not full docs)
  IF "codex" IN platforms_with_artifacts:
    Write(".codex/INSTALL.md", "See [INSTALL.md](../INSTALL.md) for installation instructions.\n")
    computed.created.append({ path: ".codex/INSTALL.md", platform: "codex" })

  # Flag missing Installation and Publishing sections in README
  IF file_exists("README.md"):
    readme = Read("README.md")
    IF "## Installation" NOT IN readme AND "## Install" NOT IN readme:
      computed.flagged.append(
        "README.md — no Installation section found. Add install instructions or link to INSTALL.md."
      )
    IF "PUBLISHING.md" NOT IN readme:
      computed.flagged.append(
        "README.md — no link to PUBLISHING.md. Add a link so plugin authors can find publishing guidance."
      )
```

### 6.4 Write Publishing Docs

```pseudocode
WRITE_PUBLISHING_DOCS(computed, platforms_with_artifacts):
  header = render(Read("lib/templates/install-docs/publishing.md"), computed.metadata)
  sections = ""
  FOR platform IN platforms_with_artifacts:
    template = read_if_exists("lib/templates/install-docs/publishing/" + platform + ".md")
    IF template:
      sections += render(template, computed.metadata) + "\n\n"

  IF sections:
    content = header + "\n\n" + sections
    Write("PUBLISHING.md", content)
    computed.created.append({ path: "PUBLISHING.md", platform: "cross" })
```

## 7. Phase 7: Bootstrap (opt-in)

Session-start injection. See `lib/patterns/bootstrapping.md` for full generation logic.

### 7.1 Prompt and Execute

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
  generate_using_sidecars(computed)        # filtered by target_platforms (same as Phase 4.3)
  generate_session_start(computed)
  generate_run_hook_cmd(computed)

  # Hook merging gated on platform targeting
  IF "claude-code" IN computed.target_platforms:
    merge_session_start_hooks_claude(computed)
    # fixes: claude.4_hooks.hooks_json.exists
  IF "cursor" IN computed.target_platforms:
    merge_session_start_hooks_cursor(computed)
    # fixes: cursor.4_hooks.hooks_json.exists

  # Platform-specific enhancements
  IF "gemini-cli" IN computed.target_platforms:
    update_gemini_md(computed)
    # fixes: gemini.3_context.gemini_md.at_includes_skills

  IF "antigravity" IN computed.target_platforms:
    update_agents_md_for_antigravity(computed)
    # fixes: antigravity.3_context.agents_md.skill_coverage

  computed.bootstrap_status = "configured"
```

## 8. Phase 8: Report

Emit the final uplift report. See `lib/patterns/report-template.md` for the full report format and state flow diagram.

The report includes:

1. **Created files** — every file written, with platform and condition IDs fixed
2. **Skipped files** — pre-existing files that were not overwritten
3. **Flagged items** — issues requiring human attention (missing frontmatter, README gaps)
4. **Incremental vs full** — which platforms got incremental uplift vs full generation
5. **Bootstrap status** — configured, declined, or already-configured
6. **Next steps** — remaining manual actions (frontmatter authorship, README updates)

## Related Skills

- **Assess portability:** `skills/assessing-plugin-portability/SKILL.md`
