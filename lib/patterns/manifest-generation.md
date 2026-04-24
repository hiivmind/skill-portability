# Manifest Generation Schemas

Templates for each platform manifest. All `{{fields}}` are substituted from the canonical metadata model (see `lib/patterns/detection-algorithm.md` Step D3).

---

## Rendering Contract

Three rendering modes handle different template complexity:

### Mode 1: Plain substitution

Read template, replace `{{field}}` with metadata value, write output.

### Mode 2: Conditional key omission

Template includes all possible keys. Renderer parses JSON after substitution and removes keys whose corresponding directory does not exist.

Applies to: `cursor-plugin`

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

Template provides structure with `{{sectionPlaceholders}}`. Builder constructs dynamic sections from skill/agent/command inventory.

Applies to: `gemini-context`, `agents-context`, `copilot-instructions`

```pseudocode
RENDER_WITH_BUILDER(template, metadata, computed):
  skill_lines = build_skill_includes(computed.skills, template_type)
  agent_lines = build_agent_includes(computed.agents) IF computed.agents ELSE ""
  command_lines = build_command_includes(computed.commands) IF computed.commands ELSE ""

  content = substitute(template, metadata)
  content = content.replace("{{skillIncludes}}", skill_lines)

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

---

## Schema-to-Template Mapping

| Schema | Mode | Template file |
|--------|------|---------------|
| claude-plugin | Plain | `lib/templates/manifests/claude-plugin/plugin.json.tmpl` |
| claude-marketplace | Plain | `lib/templates/manifests/claude-plugin/marketplace.json.tmpl` |
| claude-context | Plain | `lib/templates/context-files/CLAUDE.md.tmpl` |
| cursor-plugin | Conditional | `lib/templates/manifests/cursor-plugin/plugin.json.tmpl` |
| gemini-extension | Plain | `lib/templates/manifests/gemini-extension.json.tmpl` |
| gemini-context | Builder | `lib/templates/context-files/GEMINI.md.tmpl` |
| agents-context | Builder | `lib/templates/context-files/AGENTS.md.tmpl` |
| opencode-package | Plain | `lib/templates/manifests/package.json.tmpl` |
| opencode-shim | Plain | `lib/templates/manifests/opencode-plugin.js.tmpl` |
| codex-plugin | Plain | `lib/templates/manifests/codex-plugin/plugin.json.tmpl` |
| codex-marketplace | Plain | `lib/templates/manifests/codex-plugin/marketplace.json.tmpl` |
| copilot-instructions | Plain | `lib/templates/context-files/copilot-instructions.md.tmpl` |

---

## claude-plugin

**Target:** `.claude-plugin/plugin.json`

Create `.claude-plugin/` directory if needed. `{{keywords}}` is a JSON array literal (e.g. `["ai", "skills"]`).

> **Template:** `lib/templates/manifests/claude-plugin/plugin.json.tmpl`

---

## claude-marketplace

**Target:** `.claude-plugin/marketplace.json`

> **Template:** `lib/templates/manifests/claude-plugin/marketplace.json.tmpl`

---

## claude-context

**Target:** `CLAUDE.md`

> **Template:** `lib/templates/context-files/CLAUDE.md.tmpl`

---

## cursor-plugin

**Target:** `.cursor-plugin/plugin.json`

Create `.cursor-plugin/` directory if needed.

**Conditional logic:** Omit the `"agents"` key if `agents/` doesn't exist. Omit the `"commands"` key if `commands/` doesn't exist.

> **Template:** `lib/templates/manifests/cursor-plugin/plugin.json.tmpl`

---

## gemini-extension

**Target:** `gemini-extension.json`

> **Template:** `lib/templates/manifests/gemini-extension.json.tmpl`

---

## gemini-context

**Target:** `GEMINI.md`

Build the include blocks from the skills/agents/commands lists inventoried during discovery. The file contains only `@` include directives and no other prose.

> **Template:** `lib/templates/context-files/GEMINI.md.tmpl`

---

## agents-context

**Target:** `AGENTS.md`

Build skill bullet list for `{{skillIncludes}}` and command bullet list for `{{commandIncludes}}` (omit the entire Commands section if no commands exist).

> **Template:** `lib/templates/context-files/AGENTS.md.tmpl`

---

## opencode-package

**Target:** `package.json`

> **Template:** `lib/templates/manifests/package.json.tmpl`

---

## opencode-shim

**Target:** `.opencode/plugins/<name>.js`

Create `.opencode/plugins/` directory if needed. This is the minimal non-bootstrap version of the OpenCode plugin shim.

> **Template:** `lib/templates/manifests/opencode-plugin.js.tmpl`

---

## codex-plugin

**Target:** `.codex-plugin/plugin.json`

Create `.codex-plugin/` directory if needed. Only generated when Codex recommendation is `native-plugin-packaging`.

> **Template:** `lib/templates/manifests/codex-plugin/plugin.json.tmpl`

---

## codex-marketplace

**Target:** `.agents/plugins/marketplace.json`

Create `.agents/plugins/` directory if needed. Only generated when Codex recommendation is `native-plugin-packaging`.

For single-plugin upstream repos, this manifest points to the repo root with `source.path: "./"`.

> **Template:** `lib/templates/manifests/codex-plugin/marketplace.json.tmpl`

---

## copilot-instructions

**Target:** `.github/copilot-instructions.md`

Create `.github/` directory if needed.

> **Template:** `lib/templates/context-files/copilot-instructions.md.tmpl`
