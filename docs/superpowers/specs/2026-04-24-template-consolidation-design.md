# Template Consolidation: Merge assets/templates into lib/templates

**Date:** 2026-04-24
**Status:** Approved
**Scope:** Consolidate two parallel template systems (`assets/templates/` and `lib/patterns/manifest-generation.md` inline templates) into a single `lib/templates/` directory with clear subdirectory separation.

## Problem

Two template systems evolved independently:

- **`assets/templates/`** — standalone renderable `.tmpl` files with `{{placeholders}}`, seeded from superpowers v5.0.7. Includes manifests, context files, hook scaffolds, and tool mapping sidecars.
- **`lib/patterns/manifest-generation.md`** — inline template content embedded in a documentation file as code blocks. Not directly renderable without parsing.

The tool mapping sidecars are duplicated between `assets/templates/skill-references/` and `lib/references/`. Neither system is complete: `assets/` lacks Codex plugin and Copilot instructions templates; `lib/` lacks standalone renderable files.

## Solution

Merge into `lib/templates/` with four subdirectories, delete `assets/templates/`, and update `manifest-generation.md` to reference template files instead of containing inline content.

---

## Directory Structure

```
lib/templates/
  manifests/
    claude-plugin/
      plugin.json.tmpl
      marketplace.json.tmpl
    cursor-plugin/
      plugin.json.tmpl
    codex-plugin/
      plugin.json.tmpl           # NEW — from manifest-generation.md
    gemini-extension.json.tmpl
    package.json.tmpl
    opencode-plugin.js.tmpl
  context-files/
    CLAUDE.md.tmpl
    AGENTS.md.tmpl
    GEMINI.md.tmpl
    copilot-instructions.md.tmpl  # NEW — from manifest-generation.md
  hooks/
    session-start.sh              # existing
    run-hook.cmd                  # existing
    hooks.json.tmpl               # from assets/ — empty scaffold
    hooks-cursor.json.tmpl        # from assets/ — empty scaffold
  install-docs/
    claude-code.md                # existing
    cursor.md
    gemini-cli.md
    opencode.md
    copilot-cli.md
    codex.md
  UPSTREAM.md                     # moved from assets/UPSTREAM.md
```

---

## File Changes

### Created (new templates)

| File | Source |
|------|--------|
| `lib/templates/manifests/codex-plugin/plugin.json.tmpl` | From `codex-plugin` schema in `manifest-generation.md` |
| `lib/templates/context-files/copilot-instructions.md.tmpl` | From `copilot-instructions` schema in `manifest-generation.md` |

### Moved from `assets/templates/`

| From | To |
|------|-----|
| `assets/templates/claude-plugin/plugin.json.tmpl` | `lib/templates/manifests/claude-plugin/plugin.json.tmpl` |
| `assets/templates/claude-plugin/marketplace.json.tmpl` | `lib/templates/manifests/claude-plugin/marketplace.json.tmpl` |
| `assets/templates/cursor-plugin/plugin.json.tmpl` | `lib/templates/manifests/cursor-plugin/plugin.json.tmpl` |
| `assets/templates/gemini-extension.json.tmpl` | `lib/templates/manifests/gemini-extension.json.tmpl` |
| `assets/templates/package.json.tmpl` | `lib/templates/manifests/package.json.tmpl` |
| `assets/templates/opencode-plugin.js.tmpl` | `lib/templates/manifests/opencode-plugin.js.tmpl` |
| `assets/templates/CLAUDE.md.tmpl` | `lib/templates/context-files/CLAUDE.md.tmpl` |
| `assets/templates/AGENTS.md.tmpl` | `lib/templates/context-files/AGENTS.md.tmpl` |
| `assets/templates/GEMINI.md.tmpl` | `lib/templates/context-files/GEMINI.md.tmpl` |
| `assets/templates/hooks/hooks.json.tmpl` | `lib/templates/hooks/hooks.json.tmpl` |
| `assets/templates/hooks/hooks-cursor.json.tmpl` | `lib/templates/hooks/hooks-cursor.json.tmpl` |
| `assets/UPSTREAM.md` | `lib/templates/UPSTREAM.md` |

### Deleted

| File | Reason |
|------|--------|
| `assets/templates/` (entire directory) | Consolidated into `lib/templates/` |
| `assets/templates/skill-references/` | Duplicate of `lib/references/` |
| `assets/UPSTREAM.md` | Moved to `lib/templates/UPSTREAM.md` |
| `assets/` (directory, if empty after above) | No longer needed |

### Modified

| File | Change |
|------|--------|
| `lib/patterns/manifest-generation.md` | Replace inline template content with references to `.tmpl` files. Keep schema names, conditional logic docs, and substitution variable docs. Remove duplicated JSON/markdown template blocks. Add rendering contract section. |
| `skills/uplifting-a-plugin/SKILL.md` | Phase 4 `render_schema` becomes `Read(template_path) + render(content, metadata, computed)`. Update reference block to include `lib/templates/manifests/` and `lib/templates/context-files/`. |
| `docs/superpowers/2026-04-20-portable-plugin-uplift.md` | Replace all `assets/templates/` paths with `lib/templates/manifests/`, `lib/templates/context-files/`, `lib/templates/hooks/`. Replace `assets/templates/skill-references/` with `lib/references/`. |
| `docs/superpowers/plans/2026-04-20-platform-neutral-detection.md` | Replace all `assets/templates/` paths with new `lib/templates/` paths. |
| `docs/superpowers/specs/2026-04-20-platform-neutral-detection-design.md` | Replace `assets/templates/` references with new paths. |

---

## manifest-generation.md New Role

The file changes from "contains inline templates" to "documents the generation logic":

- **Keeps:** schema names, target paths, substitution variable definitions, conditional logic (e.g., Codex conditional on `codex_rec`), builder logic for GEMINI.md `@` includes and AGENTS.md skill bullet lists
- **Removes:** inline JSON/markdown template blocks (replaced by references to `.tmpl` files)
- **Adds:** template path mapping table:

```
| Schema | Template file |
|--------|---------------|
| claude-plugin | lib/templates/manifests/claude-plugin/plugin.json.tmpl |
| claude-marketplace | lib/templates/manifests/claude-plugin/marketplace.json.tmpl |
| claude-context | lib/templates/context-files/CLAUDE.md.tmpl |
| cursor-plugin | lib/templates/manifests/cursor-plugin/plugin.json.tmpl |
| gemini-extension | lib/templates/manifests/gemini-extension.json.tmpl |
| gemini-context | lib/templates/context-files/GEMINI.md.tmpl |
| agents-context | lib/templates/context-files/AGENTS.md.tmpl |
| opencode-package | lib/templates/manifests/package.json.tmpl |
| opencode-shim | lib/templates/manifests/opencode-plugin.js.tmpl |
| codex-plugin | lib/templates/manifests/codex-plugin/plugin.json.tmpl |
| copilot-instructions | lib/templates/context-files/copilot-instructions.md.tmpl |
```

---

## Rendering Contract

Not all templates can be rendered with simple `{{placeholder}}` substitution. Three rendering modes are needed:

### Mode 1: Plain substitution

Most manifests. Read template, replace `{{field}}` with metadata value, write output.

Applies to: `claude-plugin/plugin.json.tmpl`, `claude-plugin/marketplace.json.tmpl`, `gemini-extension.json.tmpl`, `package.json.tmpl`, `opencode-plugin.js.tmpl`, `codex-plugin/plugin.json.tmpl`, `CLAUDE.md.tmpl`

### Mode 2: Conditional key omission

Some manifests have keys that must be omitted when the corresponding directory does not exist. The template includes all possible keys; the renderer removes keys whose directory is absent.

Applies to: `cursor-plugin/plugin.json.tmpl`

Conditional rules:
- Omit `"agents"` key if `agents/` directory does not exist
- Omit `"commands"` key if `commands/` directory does not exist

```pseudocode
RENDER_WITH_CONDITIONALS(template, metadata, computed):
  content = substitute(template, metadata)
  parsed = JSON.parse(content)
  IF NOT directory_exists("agents/"):
    delete parsed["agents"]
  IF NOT directory_exists("commands/"):
    delete parsed["commands"]
  RETURN JSON.stringify(parsed, indent=2)
```

### Mode 3: Builder logic

Context files where dynamic sections must be constructed from the skill/agent/command inventory. The template provides the structure; the builder fills `{{sectionPlaceholders}}`.

Applies to: `AGENTS.md.tmpl`, `GEMINI.md.tmpl`, `copilot-instructions.md.tmpl`

Builder rules:
- `{{skillIncludes}}` — one bullet per skill for AGENTS.md, one `@` include per skill for GEMINI.md
- `{{agentIncludes}}` — omit entire section if no agents exist
- `{{commandIncludes}}` — omit entire section if no commands exist

```pseudocode
RENDER_WITH_BUILDER(template, metadata, computed):
  # Build dynamic sections from inventory
  skill_lines = build_skill_includes(computed.skills, template_type)
  agent_lines = build_agent_includes(computed.agents) IF computed.agents ELSE ""
  command_lines = build_command_includes(computed.commands) IF computed.commands ELSE ""

  # Substitute metadata placeholders first
  content = substitute(template, metadata)

  # Then substitute builder placeholders
  content = content.replace("{{skillIncludes}}", skill_lines)

  # For sections with optional content, remove the entire section header if empty
  IF agent_lines == "":
    content = remove_section(content, "{{agentIncludes}}")
  ELSE:
    content = content.replace("{{agentIncludes}}", agent_lines)

  IF command_lines == "":
    content = remove_section(content, "{{commandIncludes}}")
  ELSE:
    content = content.replace("{{commandIncludes}}", command_lines)

  RETURN content
```

### Schema-to-mode mapping

| Schema | Mode | Template file |
|--------|------|---------------|
| claude-plugin | Plain | `manifests/claude-plugin/plugin.json.tmpl` |
| claude-marketplace | Plain | `manifests/claude-plugin/marketplace.json.tmpl` |
| claude-context | Plain | `context-files/CLAUDE.md.tmpl` |
| cursor-plugin | Conditional | `manifests/cursor-plugin/plugin.json.tmpl` |
| gemini-extension | Plain | `manifests/gemini-extension.json.tmpl` |
| gemini-context | Builder | `context-files/GEMINI.md.tmpl` |
| agents-context | Builder | `context-files/AGENTS.md.tmpl` |
| opencode-package | Plain | `manifests/package.json.tmpl` |
| opencode-shim | Plain | `manifests/opencode-plugin.js.tmpl` |
| codex-plugin | Plain | `manifests/codex-plugin/plugin.json.tmpl` |
| copilot-instructions | Plain | `context-files/copilot-instructions.md.tmpl` |

---

## Uplift Skill Phase 4 Change

Current pseudocode:
```pseudocode
content = render_schema(manifest.schema, computed.metadata)
```

New pseudocode:
```pseudocode
template_path = schema_to_template_path(manifest.schema)
mode = schema_to_mode(manifest.schema)
template = Read(template_path)

IF mode == "plain":
  content = substitute(template, computed.metadata)
ELIF mode == "conditional":
  content = render_with_conditionals(template, computed.metadata, computed)
ELIF mode == "builder":
  content = render_with_builder(template, computed.metadata, computed)
```

For context files with builder logic (GEMINI.md, AGENTS.md), the template provides the structure and the builder logic fills dynamic sections (`{{skillIncludes}}`, `{{commandIncludes}}`, `{{agentIncludes}}`).

---

## UPSTREAM.md Update

Update path references in the re-seeding instructions to reflect new locations. The version pin and re-seeding workflow stay the same.

---

## Tool Mapping Sidecars

`assets/templates/skill-references/` is confirmed as a duplicate of `lib/references/`. The `lib/references/` copies are authoritative. Delete the `assets/` copies. No other changes needed.

---

## Non-Goals

- **Changing template content**: All templates are moved verbatim. No content changes except the two new templates (codex-plugin, copilot-instructions).
- **Changing the assess skill**: It doesn't use templates (read-only).
- **Changing hook, install-doc, or bootstrapping templates**: Already in correct locations.
