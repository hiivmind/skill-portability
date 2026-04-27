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
  IF NOT dir_exists("agents/"):
    delete parsed["agents"]
  IF NOT dir_exists("commands/"):
    delete parsed["commands"]
  IF NOT file_exists("hooks/hooks.json") AND NOT file_exists("hooks/hooks-cursor.json"):
    delete parsed["hooks"]
  RETURN JSON.stringify(parsed, indent=2)
```

### Mode 3: Builder logic

Template provides structure with `{{sectionPlaceholders}}`. Builder constructs dynamic sections from skill/agent/command inventory.

Applies to: `gemini-context`, `agents-context`

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

Schema-to-template mappings are defined in `lib/references/templates/registry.md`.
Use `template_for_schema(schema)` to look up template path, target path, and
rendering mode for a given schema. Use `template_for_path(template_ref)` to
resolve a rubric `condition.template` value to its registry entry.

---

## Per-Schema Generation

Each section below is a generation function. Paths come from the Template
Registry via `template_for_schema()`. Rendering mode is dispatched per the
entry's `mode` field.

### claude-plugin

```pseudocode
GENERATE(schema="claude-plugin", metadata, computed):
  entry = template_for_schema("claude-plugin")
  mkdir_p(dirname(entry.target_path))

  # {{keywords}} must be a JSON array literal (e.g. ["ai", "skills"])
  content = RENDER_PLAIN(entry.template_path, metadata)
  write(entry.target_path, content)
```

### claude-marketplace

```pseudocode
GENERATE(schema="claude-marketplace", metadata, computed):
  entry = template_for_schema("claude-marketplace")
  mkdir_p(dirname(entry.target_path))
  content = RENDER_PLAIN(entry.template_path, metadata)
  write(entry.target_path, content)
```

### claude-context

```pseudocode
GENERATE(schema="claude-context", metadata, computed):
  entry = template_for_schema("claude-context")
  content = RENDER_PLAIN(entry.template_path, metadata)
  write(entry.target_path, content)
```

### cursor-plugin

```pseudocode
GENERATE(schema="cursor-plugin", metadata, computed):
  entry = template_for_schema("cursor-plugin")
  mkdir_p(dirname(entry.target_path))

  content = RENDER_WITH_CONDITIONALS(entry.template_path, metadata, computed)
  write(entry.target_path, content)

  # Cursor auto-discovers components from default directories (skills/,
  # rules/, agents/, commands/, hooks/hooks.json, mcp.json). Only specify
  # explicit paths when overriding defaults.
  #
  # displayName is not part of the official Cursor manifest schema.
  # Use name (kebab-case identifier) and description for display purposes.
```

### cursor-marketplace

```pseudocode
GENERATE(schema="cursor-marketplace", metadata, computed):
  # Only for multi-plugin repositories
  IF len(computed.skills) <= 1 AND NOT dir_exists(".cursor-plugin/plugins/"): SKIP

  entry = template_for_schema("cursor-marketplace")
  mkdir_p(dirname(entry.target_path))
  content = RENDER_PLAIN(entry.template_path, metadata)
  write(entry.target_path, content)

  # Each entry lists source path, description, and optional metadata
  # (category, tags, logo).
```

### gemini-extension

```pseudocode
GENERATE(schema="gemini-extension", metadata, computed):
  entry = template_for_schema("gemini-extension")
  content = RENDER_PLAIN(entry.template_path, metadata)
  write(entry.target_path, content)

  # Required fields: name (kebab-case), version (semver).
  #
  # Optional fields (include conditionally):
  #   description       — always, from computed metadata
  #   contextFileName   — always "GEMINI.md"
  #   mcpServers        — when source has .mcp.json; use ${extensionPath} vars
  #   hooksDir          — when hooks exist in non-default path
  #   skillsDir         — when skills exist in non-default path
  #   settings          — when plugin requires user config
  #                       Array of { name, description, envVar, sensitive? }
  #   plan              — when plugin uses planning artifacts
  #                       { "directory": "<path>" }
  #   excludeTools      — when plugin restricts dangerous operations
  #
  # Variable substitution:
  #   ${extensionPath}  — absolute path to extension
  #   ${workspacePath}  — workspace-relative path
  #   ${/}              — OS path separator
```

### gemini-context

```pseudocode
GENERATE(schema="gemini-context", metadata, computed):
  entry = template_for_schema("gemini-context")
  content = RENDER_WITH_BUILDER(entry.template_path, metadata, computed)
  write(entry.target_path, content)

  # Output contains only @ include directives and no other prose.
```

### agents-context

```pseudocode
GENERATE(schema="agents-context", metadata, computed):
  entry = template_for_schema("agents-context")
  content = RENDER_WITH_BUILDER(entry.template_path, metadata, computed)
  write(entry.target_path, content)

  # {{skillIncludes}} — bullet list of skills
  # {{commandIncludes}} — bullet list of commands (omit section if none)
```

### codex-plugin

```pseudocode
GENERATE(schema="codex-plugin", metadata, computed):
  # Only for native-plugin-packaging recommendation
  IF computed.codex_rec != "native-plugin-packaging": SKIP

  entry = template_for_schema("codex-plugin")
  mkdir_p(dirname(entry.target_path))
  content = RENDER_PLAIN(entry.template_path, metadata)
  write(entry.target_path, content)
```

### codex-marketplace

```pseudocode
GENERATE(schema="codex-marketplace", metadata, computed):
  # Only for native-plugin-packaging recommendation
  IF computed.codex_rec != "native-plugin-packaging": SKIP

  entry = template_for_schema("codex-marketplace")
  mkdir_p(dirname(entry.target_path))
  content = RENDER_PLAIN(entry.template_path, metadata)
  write(entry.target_path, content)

  # For single-plugin upstream repos, this manifest points to the repo
  # root with source.path: "./"
```

### antigravity-package

```pseudocode
GENERATE(schema="antigravity-package", metadata, computed):
  entry = template_for_schema("antigravity-package")
  content = RENDER_PLAIN(entry.template_path, metadata)
  write(entry.target_path, content)
```

### openclaw-plugin

```pseudocode
GENERATE(schema="openclaw-plugin", metadata, computed):
  entry = template_for_schema("openclaw-plugin")
  content = RENDER_PLAIN(entry.template_path, metadata)
  write(entry.target_path, content)
```
