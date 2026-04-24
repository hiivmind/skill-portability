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
  - name: platforms
    type: string
    required: false
    description: >
      Comma-separated list of target platforms. If omitted, the skill presents
      an interactive checklist. Valid values: claude-code, cursor, gemini-cli,
      opencode, copilot-cli, codex, all.
outputs:
  - name: report
    type: object
    description: Summary of created, skipped, and flagged files
---

# Uplifting a Plugin to Multi-Platform Portability

Transform any plugin into a fully portable plugin. No platform is assumed.

> **Detection Algorithm:** `lib/patterns/detection-algorithm.md`
> **Manifest Schemas:** `lib/patterns/manifest-generation.md`
> **Manifest Templates:** `lib/templates/manifests/`
> **Context File Templates:** `lib/templates/context-files/`
> **Hook Merging:** `lib/patterns/hook-merging.md`
> **Bootstrapping:** `lib/patterns/bootstrapping.md`
> **Platform References:** `lib/references/copilot-tools.md`, `codex-tools.md`, `gemini-tools.md`
> **Hook Templates:** `lib/templates/hooks/session-start.sh`, `run-hook.cmd`
> **Install Doc Templates:** `lib/templates/install-docs/`

---

## Overview

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

**Minimum starting state:** At least one `skills/*/SKILL.md` with `name` + `description`
frontmatter, or any platform manifest file.

**Idempotent:** Running twice on the same repo produces no diff on the second run.

---

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

---

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
    { path: ".codex-plugin/plugin.json",                           platform: "codex"       },
    { path: "gemini-extension.json",                               platform: "gemini-cli"  },
    { path: "GEMINI.md",                                           platform: "gemini-cli"  },
    { path: "AGENTS.md",                                           platform: "cross"       },
    { path: "CLAUDE.md",                                           platform: "claude-code" },
    { path: "package.json",                                        platform: "opencode"    },
    { path: ".opencode/plugins/" + computed.metadata.name + ".js", platform: "opencode"    },
    { path: ".github/copilot-instructions.md",                     platform: "copilot-cli" },
    { path: "hooks/hooks-cursor.json",                             platform: "cursor"      },
  ]

  FOR check IN conflict_checks:
    IF file_exists(check.path):
      computed.skipped.append({ path: check.path, platform: check.platform })
```

---

## 3. Phase 3: Recommend

Interactive uplift target recommendation and platform selection. Uses `computed.shape`
from Phase 1 to derive a recommendation, then asks the user to confirm and select
target platforms.

### 3.1 Recommend and Confirm Uplift Target

```pseudocode
RECOMMEND_AND_CONFIRM(computed):
  # Derive recommendation from shape
  IF computed.shape == "bare-skill-repo":
    IF len(computed.skills) <= 3:
      recommended = "skill-first"
      rationale = "This repo has " + len(computed.skills) + " skill(s) and no platform manifests. Skill-first generates sidecars and context files without full plugin packaging."
    ELSE:
      recommended = "full-portable-plugin"
      rationale = "This repo has " + len(computed.skills) + " skills. Full plugin packaging gives each platform a native manifest for better discoverability."

  ELIF computed.shape == "single-platform-plugin":
    recommended = "full-portable-plugin"
    rationale = "This repo already has one platform manifest. Full plugin packaging adds the remaining platforms."

  ELIF computed.shape == "multi-platform-source":
    recommended = "full-portable-plugin"
    rationale = "This repo already targets multiple platforms. Full plugin packaging fills the remaining gaps."

  ELIF computed.shape == "curated-distribution":
    recommended = "curated-note-only"
    rationale = "This repo is a marketplace distribution without upstream skills. Only install documentation and notes will be generated."

  ELSE:
    recommended = "full-portable-plugin"
    rationale = "Repo shape could not be classified. Defaulting to full plugin packaging."

  # If platforms input was provided, auto-confirm
  IF inputs.platforms IS PROVIDED:
    computed.uplift_target = recommended
    RETURN

  # Present to user
  DISPLAY "## Uplift Target"
  DISPLAY "Shape: " + computed.shape
  DISPLAY "Recommendation: **" + recommended + "**"
  DISPLAY rationale
  DISPLAY ""
  DISPLAY "Options:"
  DISPLAY "  1. skill-first — sidecars, context files, AGENTS.md only (no platform manifests)"
  DISPLAY "  2. full-portable-plugin — all platform manifests + context files + sidecars + install docs"
  DISPLAY "  3. curated-note-only — install notes only"

  response = ASK "Accept recommendation (" + recommended + "), or choose 1/2/3?"

  IF response confirms recommendation:
    computed.uplift_target = recommended
  ELSE:
    computed.uplift_target = parse_choice(response)
```

### 3.2 Select Target Platforms

```pseudocode
SELECT_PLATFORMS(computed):
  all_platforms = ["claude-code", "cursor", "gemini-cli", "opencode", "copilot-cli", "codex"]

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

### 3.3 Derive Codex Path

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

### 3.4 Early Exit for Curated-Note-Only

```pseudocode
IF computed.uplift_target == "curated-note-only":
  SKIP Phase 4 (Generate)
  SKIP Phase 5 (Port)
  RUN  Phase 6 (Document) — install docs only, for selected platforms
  SKIP Phase 7 (Bootstrap)
  RUN  Phase 8 (Report)
  RETURN
```

---

## 4. Phase 4: Generate

### 4.1 Write Platform Manifests

Table-driven generation. See `lib/patterns/manifest-generation.md` for all schemas.

```pseudocode
GENERATE_MANIFESTS(computed):
  manifests = [
    { target: ".claude-plugin/plugin.json",      platform: "claude-code", schema: "claude-plugin"         },
    { target: ".claude-plugin/marketplace.json", platform: "claude-code", schema: "claude-marketplace"    },
    { target: "CLAUDE.md",                       platform: "claude-code", schema: "claude-context"        },
    { target: ".cursor-plugin/plugin.json",      platform: "cursor",      schema: "cursor-plugin"         },
    { target: "gemini-extension.json",           platform: "gemini-cli",  schema: "gemini-extension"      },
    { target: "GEMINI.md",                       platform: "gemini-cli",  schema: "gemini-context"        },
    { target: "package.json",                    platform: "opencode",    schema: "opencode-package"      },
    { target: ".opencode/plugins/{{name}}.js",   platform: "opencode",    schema: "opencode-shim"         },
    { target: ".codex-plugin/plugin.json",       platform: "codex",       schema: "codex-plugin",
      condition: "computed.codex_rec == 'native-plugin-packaging'"                                        },
    { target: "AGENTS.md",                       platform: "cross",       schema: "agents-context"        },
    { target: ".github/copilot-instructions.md", platform: "copilot-cli", schema: "copilot-instructions"  },
  ]

  FOR manifest IN manifests:
    # Skip if platform not targeted (cross-platform always included)
    IF manifest.platform != "cross" AND manifest.platform NOT IN computed.target_platforms:
      CONTINUE

    IF manifest.condition AND NOT eval(manifest.condition):
      CONTINUE

    resolved = substitute(manifest.target, computed.metadata)
    IF any(s.path == resolved FOR s IN computed.skipped):
      CONTINUE

    # Skill-first: skip platform manifests, only generate context files
    IF computed.uplift_target == "skill-first" AND is_manifest(manifest.schema):
      CONTINUE

    template_path = schema_to_template_path(manifest.schema)
    mode = schema_to_mode(manifest.schema)
    template = Read(template_path)

    IF mode == "plain":
      content = substitute(template, computed.metadata)
    ELIF mode == "conditional":
      content = render_with_conditionals(template, computed.metadata, computed)
    ELIF mode == "builder":
      content = render_with_builder(template, computed.metadata, computed)

    Write(resolved, content)
    computed.created.append({ path: resolved, platform: manifest.platform })
```

The `is_manifest()` predicate classifies schemas as packaging vs context:

```pseudocode
MANIFEST_SCHEMAS = [
  "claude-plugin", "claude-marketplace", "cursor-plugin",
  "gemini-extension", "opencode-package", "opencode-shim", "codex-plugin"
]
CONTEXT_SCHEMAS = [
  "claude-context", "gemini-context", "agents-context", "copilot-instructions"
]

FUNCTION is_manifest(schema):
  RETURN schema IN MANIFEST_SCHEMAS
```

Under `skill-first`, only context schemas are generated (plus sidecars). Under `full-portable-plugin`, both manifest and context schemas are generated.

### 4.2 Seed Tool-Mapping Sidecars

```pseudocode
GENERATE_SIDECARS(computed):
  sidecar_platform_map = {
    "copilot-tools.md": "copilot-cli",
    "codex-tools.md":   "codex",
    "gemini-tools.md":  "gemini-cli",
  }

  FOR skill IN computed.skills:
    FOR sidecar, platform IN sidecar_platform_map:
      IF platform NOT IN computed.target_platforms:
        CONTINUE
      target = skill.dir + "/references/" + sidecar
      IF NOT file_exists(target):
        source = Read("lib/references/" + sidecar)
        Write(target, source)
        computed.created.append({ path: target, platform: platform })
```

### 4.3 Validate npx Skills Frontmatter

```pseudocode
VALIDATE_FRONTMATTER(computed):
  FOR skill IN computed.skills:
    frontmatter = parse_yaml_frontmatter(Read(skill.path))
    IF NOT frontmatter.name OR NOT frontmatter.description:
      computed.flagged.append(
        skill.path + " — missing frontmatter field(s). Add name: and description: in YAML frontmatter."
      )
```

Do NOT auto-write — frontmatter descriptions require human authorship.

---

## 5. Phase 5: Port

Adapt hooks from any source platform to all target platforms.
See `lib/patterns/hook-merging.md` for event mapping and merge logic.

### 5.1 Claude Code → Cursor Hooks

```pseudocode
PORT_CURSOR_HOOKS(computed):
  IF any(s.path == "hooks/hooks-cursor.json" FOR s IN computed.skipped):
    RETURN
  IF computed.existing_hooks:
    generate_cursor_hooks(computed.existing_hooks)
  ELSE:
    Write("hooks/hooks-cursor.json", '{ "version": 1, "hooks": {} }')
  computed.created.append({ path: "hooks/hooks-cursor.json", platform: "cursor" })
```

### 5.2 Claude Code → Copilot Hooks

Copilot uses separate `bash` / `powershell` fields, no `matcher`, stored under `.github/hooks/`.

```pseudocode
PORT_COPILOT_HOOKS(computed):
  IF NOT computed.existing_hooks:
    RETURN
  copilot_hooks = adapt_hooks_copilot(computed.existing_hooks)  # see hook-merging.md
  FOR hook IN copilot_hooks:
    target = ".github/hooks/" + hook.event + ".sh"
    IF NOT file_exists(target):
      Write(target, hook.bash)
      computed.created.append({ path: target, platform: "copilot-cli" })
    win_target = ".github/hooks/" + hook.event + ".ps1"
    IF NOT file_exists(win_target):
      Write(win_target, hook.powershell)
      computed.created.append({ path: win_target, platform: "copilot-cli" })
```

### 5.3 Gemini Hook Guidance

Gemini CLI hooks are configured interactively by users via `GEMINI.md` instructions —
they cannot be written as files. Capture guidance text to include in install docs.

```pseudocode
GEMINI_HOOK_GUIDANCE(computed):
  IF computed.existing_hooks:
    computed.gemini_hook_text = render_gemini_hook_instructions(computed.existing_hooks)
  ELSE:
    computed.gemini_hook_text = NULL
```

### 5.4 Windows Support

```pseudocode
PORT_WINDOWS_HOOKS(computed):
  IF file_exists("lib/templates/hooks/run-hook.cmd"):
    source = Read("lib/templates/hooks/run-hook.cmd")
    Write("hooks/run-hook.cmd", source)
    computed.created.append({ path: "hooks/run-hook.cmd", platform: "cross" })
```

---

## 6. Phase 6: Document

Generate install documentation for every platform that received artifacts.
See `lib/templates/install-docs/` for section templates.

### 6.1 Determine Platforms With Artifacts

```pseudocode
DETERMINE_PLATFORMS(computed):
  all_records = computed.created + computed.skipped
  platforms_with_artifacts = deduplicate([
    r.platform FOR r IN all_records IF r.platform != "cross"
  ])
```

### 6.2 Render Per-Platform Install Sections

```pseudocode
RENDER_INSTALL_SECTIONS(computed, platforms_with_artifacts):
  sections = {}
  FOR platform IN platforms_with_artifacts:
    template = Read("lib/templates/install-docs/" + platform + ".md")
    sections[platform] = render(template, computed.metadata)
  IF computed.gemini_hook_text:
    sections["gemini-cli"] += "\n\n### Hook Setup\n\n" + computed.gemini_hook_text
  RETURN sections
```

### 6.3 Write Install Docs

```pseudocode
WRITE_INSTALL_DOCS(computed, sections, platforms_with_artifacts):
  # Codex gets its own install doc
  IF "codex" IN platforms_with_artifacts AND computed.codex_rec != "native-skill-discovery":
    Write(".codex/INSTALL.md", sections["codex"])
    computed.created.append({ path: ".codex/INSTALL.md", platform: "codex" })

  # Copilot gets its own install doc under .github
  IF "copilot-cli" IN platforms_with_artifacts:
    Write(".github/INSTALL.md", sections["copilot-cli"])
    computed.created.append({ path: ".github/INSTALL.md", platform: "copilot-cli" })

  # Composite doc for remaining platforms
  remaining = [p FOR p IN platforms_with_artifacts IF p NOT IN ["codex", "copilot-cli"]]
  IF remaining:
    composite = join_sections([sections[p] FOR p IN remaining])
    Write("docs/INSTALL.md", composite)
    computed.created.append({ path: "docs/INSTALL.md", platform: "cross" })

  # Flag missing Installation section in README
  IF file_exists("README.md"):
    readme = Read("README.md")
    IF "## Installation" NOT IN readme AND "## Install" NOT IN readme:
      computed.flagged.append(
        "README.md — no Installation section found. Add install instructions or link to docs/INSTALL.md."
      )
```

---

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
  generate_using_sidecars(computed)
  generate_session_start(computed)
  generate_run_hook_cmd(computed)
  merge_session_start_hooks(computed)
  enhance_opencode_plugin(computed)
  update_gemini_md(computed)
  computed.bootstrap_status = "configured"
```

---

## 8. Phase 8: Report

### 8.1 Emit Final Report

```
# Uplift Report: {name} v{version}

## Repo Shape
{shape}
Metadata inferred from: {canonical.path}

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
  {platform}: generated / flagged
{/FOR}

## Session-Start Bootstrapping
{bootstrap_status}
```

---

## State Flow

```
Phase 1          Phase 2              Phase 3          Phase 4–5            Phase 6            Phase 7            Phase 8
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
computed         computed.skills      computed         computed.created     platforms_with     computed           Report
 .sources         .commands           .codex_rec        .skipped             _artifacts         .bootstrap        (displayed)
 .canonical       .agents                               .flagged                                _status
 .metadata        .existing_hooks
 .shape
```

---

## Reference Documentation

- **Detection Algorithm:** `lib/patterns/detection-algorithm.md`
- **Manifest Schemas:** `lib/patterns/manifest-generation.md`
- **Hook Merging:** `lib/patterns/hook-merging.md`
- **Bootstrapping:** `lib/patterns/bootstrapping.md`
- **Copilot Tool Mapping:** `lib/references/copilot-tools.md`
- **Codex Tool Mapping:** `lib/references/codex-tools.md`
- **Gemini Tool Mapping:** `lib/references/gemini-tools.md`
- **Session-Start Template:** `lib/templates/hooks/session-start.sh`
- **Run-Hook Template:** `lib/templates/hooks/run-hook.cmd`
- **Install Doc Templates:** `lib/templates/install-docs/`

---

## Related Skills

- **Audit portability:** `skills/auditing-plugin-portability/SKILL.md`
