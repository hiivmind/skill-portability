---
name: uplifting-a-plugin
description: >
  Add multi-platform portability to any plugin. Accepts any starting state —
  Claude, Cursor, Gemini, OpenCode, npx skills, or bare SKILL.md files. Detects
  what exists, infers canonical metadata, emits every missing platform artifact.
  Optionally generates session-start bootstrapping hooks.
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

# Uplifting a Plugin to Multi-Platform Portability

Transform any plugin into a fully portable plugin following the superpowers portability pattern.
No platform is assumed to already exist — Claude Code manifests are an equally valid target as
Cursor or Gemini manifests.

> **Detection Algorithm:** `lib/patterns/detection-algorithm.md`
> **Manifest Schemas:** `patterns/manifest-generation.md`
> **Hook Merging:** `patterns/hook-merging.md`
> **Bootstrapping:** `patterns/bootstrapping.md`
> **Platform References:** `lib/references/copilot-tools.md`, `codex-tools.md`, `gemini-tools.md`
> **Hook Templates:** `lib/templates/hooks/session-start.sh`, `run-hook.cmd`

---

## Overview

| Phase | Description |
|-------|-------------|
| **Phase 1: Detect** | Scan metadata sources, elect canonical, build metadata model |
| **Phase 2: Inventory** | List skills, commands, agents, existing hooks; init tracking |
| **Phase 3: Generate** | Write missing manifests, context files, sidecars; port hooks |
| **Phase 4: Bootstrap** | Opt-in session-start injection across all platforms |
| **Phase 5: Report** | Summary of created, skipped, and flagged files |

**Minimum starting state:** At least one `skills/*/SKILL.md` with `name` + `description`
frontmatter, or any platform manifest file.

**Idempotent:** Running twice on the same repo produces no diff on the second run.

---

## Phase 1: Detect

Run the shared detection algorithm. See `lib/patterns/detection-algorithm.md` for full detail.

### Step 1.1: Scan and Infer

```pseudocode
DETECT(plugin_path):
  computed.sources = scan_metadata_sources(plugin_path)        # D1

  IF len(computed.sources) == 0:
    DISPLAY "No recognisable plugin signals found in {plugin_path}."
    DISPLAY "Provide at least one platform manifest or one skills/*/SKILL.md"
    DISPLAY "with name and description frontmatter."
    EXIT

  computed.canonical = elect_canonical(computed.sources)        # D2
  computed.metadata = build_metadata_model(computed.sources)    # D3
  print_inference_summary(computed.metadata, computed.canonical) # D4
```

---

## Phase 2: Inventory

### Step 2.1: Discover Assets

```pseudocode
INVENTORY(plugin_path):
  computed.skills = Glob(plugin_path + "/skills/*/SKILL.md")
  computed.commands = Glob(plugin_path + "/commands/*.md")
  computed.agents = Glob(plugin_path + "/agents/*.md")
  computed.existing_hooks = read_json_if_exists(plugin_path + "/hooks/hooks.json")

  computed.created = []
  computed.skipped = []
  computed.flagged = []
```

### Step 2.2: Check Conflicts

```pseudocode
CHECK_CONFLICTS(computed):
  targets = [
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    ".cursor-plugin/plugin.json",
    "gemini-extension.json",
    "GEMINI.md",
    "AGENTS.md",
    "CLAUDE.md",
    "package.json",
    ".opencode/plugins/" + computed.metadata.name + ".js",
    "hooks/hooks-cursor.json"
  ]

  FOR target IN targets:
    IF file_exists(target):
      computed.skipped.append(target)
```

---

## Phase 3: Generate

### Step 3.1: Write Platform Manifests

Table-driven generation. See `patterns/manifest-generation.md` for all schemas.

```pseudocode
GENERATE_MANIFESTS(computed):
  manifests = [
    { target: ".claude-plugin/plugin.json",      schema: "claude-plugin"      },
    { target: ".claude-plugin/marketplace.json",  schema: "claude-marketplace" },
    { target: "CLAUDE.md",                        schema: "claude-context"     },
    { target: ".cursor-plugin/plugin.json",       schema: "cursor-plugin"      },
    { target: "gemini-extension.json",            schema: "gemini-extension"   },
    { target: "GEMINI.md",                        schema: "gemini-context"     },
    { target: "AGENTS.md",                        schema: "agents-context"     },
    { target: "package.json",                     schema: "opencode-package"   },
    { target: ".opencode/plugins/{{name}}.js",    schema: "opencode-shim"      },
  ]

  FOR manifest IN manifests:
    resolved = substitute(manifest.target, computed.metadata)
    IF resolved IN computed.skipped:
      CONTINUE
    content = render_schema(manifest.schema, computed.metadata)
    Write(resolved, content)
    computed.created.append(resolved)
```

### Step 3.2: Seed Tool-Mapping Sidecars

```pseudocode
GENERATE_SIDECARS(computed):
  platforms = ["copilot-tools.md", "codex-tools.md", "gemini-tools.md"]
  FOR skill IN computed.skills:
    FOR platform IN platforms:
      target = "skills/" + skill.name + "/references/" + platform
      IF NOT file_exists(target):
        source = Read("lib/references/" + platform)
        Write(target, source)
        computed.created.append(target)
```

### Step 3.3: Port Hooks

See `patterns/hook-merging.md` for event mapping and merge logic.

```pseudocode
PORT_HOOKS(computed):
  IF computed.existing_hooks:
    generate_cursor_hooks(computed.existing_hooks)
    computed.created.append("hooks/hooks-cursor.json")
  ELSE:
    Write("hooks/hooks-cursor.json", '{ "version": 1, "hooks": {} }')
    computed.created.append("hooks/hooks-cursor.json")
```

### Step 3.4: Validate npx Skills Frontmatter

```pseudocode
VALIDATE_FRONTMATTER(computed):
  FOR skill IN computed.skills:
    frontmatter = parse_yaml_frontmatter(skill.content)
    IF NOT frontmatter.name OR NOT frontmatter.description:
      computed.flagged.append(
        skill.path + " — missing frontmatter field(s). Add name: and description: in YAML frontmatter."
      )
```

Do NOT auto-write — frontmatter descriptions require human authorship.

---

## Phase 4: Bootstrap (opt-in)

Session-start injection. See `patterns/bootstrapping.md` for full generation logic.

### Step 4.1: Prompt

```pseudocode
BOOTSTRAP(computed):
  IF file_exists("skills/using-" + computed.metadata.name + "/SKILL.md"):
    computed.bootstrap_status = "already-configured"
    RETURN

  response = ASK "Would you like to generate session-start bootstrapping hooks? " +
    "This creates a using-{name} skill that gets force-injected at session start " +
    "on Claude Code, Cursor, Copilot CLI, OpenCode, and Gemini CLI. (y/n)"

  IF response == "no":
    computed.bootstrap_status = "declined"
    RETURN

  # Execute bootstrapping steps — see patterns/bootstrapping.md
  generate_using_skill(computed)           # 4.2
  generate_using_sidecars(computed)        # 4.3
  generate_session_start(computed)         # 4.4 — from lib/templates/hooks/
  generate_run_hook_cmd(computed)          # 4.5 — from lib/templates/hooks/
  merge_session_start_hooks(computed)      # 4.6 — see patterns/hook-merging.md
  enhance_opencode_plugin(computed)        # 4.7
  update_gemini_md(computed)              # 4.8
  computed.bootstrap_status = "configured"
```

---

## Phase 5: Report

### Step 5.1: Emit Final Report

```pseudocode
REPORT(computed):
  DISPLAY "# Uplift Report: {computed.metadata.name} v{computed.metadata.version}"
  DISPLAY "Metadata inferred from: {computed.canonical.path}"
  DISPLAY ""

  DISPLAY "## Metadata inferred"
  print_inference_summary(computed.metadata, computed.canonical)
  DISPLAY ""

  DISPLAY "## Created"
  FOR path IN computed.created:
    DISPLAY "  " + path
  DISPLAY ""

  DISPLAY "## Skipped (already exists)"
  FOR path IN computed.skipped:
    DISPLAY "  " + path
  DISPLAY ""

  DISPLAY "## Needs manual review"
  FOR item IN computed.flagged:
    DISPLAY "  " + item
  DISPLAY ""

  DISPLAY "## Session-start bootstrapping"
  SWITCH computed.bootstrap_status:
    CASE "configured":
      DISPLAY "  Session-start injection configured."
    CASE "declined":
      DISPLAY "  Session-start injection: not configured (user declined)"
    CASE "already-configured":
      DISPLAY "  Session-start injection: already configured"
```

---

## State Flow

```
Phase 1          Phase 2            Phase 3            Phase 4            Phase 5
──────────────────────────────────────────────────────────────────────────────────
computed         computed.skills    computed.created   computed           Report
 .sources        .commands          .skipped           .bootstrap        (displayed)
 .canonical      .agents            .flagged           _status
 .metadata       .existing_hooks
```

---

## Reference Documentation

- **Detection Algorithm:** `lib/patterns/detection-algorithm.md` (shared)
- **Manifest Schemas:** `patterns/manifest-generation.md` (local)
- **Hook Merging:** `patterns/hook-merging.md` (local)
- **Bootstrapping:** `patterns/bootstrapping.md` (local)
- **Copilot Tool Mapping:** `lib/references/copilot-tools.md` (shared)
- **Codex Tool Mapping:** `lib/references/codex-tools.md` (shared)
- **Gemini Tool Mapping:** `lib/references/gemini-tools.md` (shared)
- **Session-Start Template:** `lib/templates/hooks/session-start.sh` (shared)
- **Run-Hook Template:** `lib/templates/hooks/run-hook.cmd` (shared)

---

## Related Skills

- **Audit portability:** `skills/auditing-plugin-portability/SKILL.md`
