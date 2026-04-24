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
| `lib/patterns/manifest-generation.md` | Replace inline template content with references to `.tmpl` files. Keep schema names, conditional logic docs, and substitution variable docs. Remove duplicated JSON/markdown template blocks. |
| `skills/uplifting-a-plugin/SKILL.md` | Phase 4 `render_schema` becomes `Read(template_path) + substitute(content, metadata)`. Update reference block to include `lib/templates/manifests/` and `lib/templates/context-files/`. |

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

## Uplift Skill Phase 4 Change

Current pseudocode:
```pseudocode
content = render_schema(manifest.schema, computed.metadata)
```

New pseudocode:
```pseudocode
template = Read(schema_to_template_path(manifest.schema))
content = substitute(template, computed.metadata)
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
