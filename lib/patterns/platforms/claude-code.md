# Claude Code Scoring Rules

Platform-specific scoring criteria for the 7-category rubric.
See `lib/patterns/rubric-framework.md` for the shared scoring scale.

---

## Artifact Checklist

| File | Category |
|------|----------|
| `.claude-plugin/plugin.json` | Manifest Packaging |
| `.claude-plugin/marketplace.json` | Manifest Packaging |
| `CLAUDE.md` | Context Delivery |
| `hooks/hooks.json` | Hook Portability |
| `.mcp.json` | Runtime Adapters |

---

## Category 1: Manifest Packaging

Score 3 when:
- `.claude-plugin/plugin.json` present with all fields: `name`, `version`, `description`, `author` (with `name` and `email`), `keywords`
- `.claude-plugin/marketplace.json` present with complete plugin entries and valid source paths
- Skills discoverable in `skills/<name>/SKILL.md` format
- No reliance on legacy `commands/` format

Score 2 when:
- `plugin.json` exists but is missing 1-2 fields (e.g., no `author.email`, no `keywords`)
- `marketplace.json` exists but entries lack version pins or descriptions
- Mix of `skills/` and legacy `commands/` formats present

Score 1 when:
- No manifest file but components exist in default locations (`skills/`, `agents/`)
- Manifest exists but is non-standard (wrong path, incomplete schema)
- Only legacy `commands/` format present

Score 0 when:
- No recognizable plugin structure or manifest
- No `skills/` or `commands/` directories

---

## Category 2: Skill Compatibility

Score 3 when:
- All skills in `skills/<name>/SKILL.md` format with proper frontmatter
- Frontmatter includes: `name`, `description`, `when_to_use`
- No unresolved tool assumptions (tools match Claude Code built-in set: Read, Write, Edit, Bash, Grep, Glob, Skill, Agent/Task, TodoWrite, WebSearch, WebFetch)
- No platform-specific tool references without documentation

Score 2 when:
- Most skills have frontmatter but 1-2 are missing fields
- One skill references a tool not in Claude Code's built-in set without sidecar documentation
- Some use legacy `commands/` format alongside standard skills

Score 1 when:
- Skills present but lack consistent frontmatter
- Multiple tool assumptions unresolved
- Heavy reliance on legacy `commands/` format

Score 0 when:
- No skills found
- Skills are unstructured or lack any frontmatter

---

## Category 3: Context Delivery

Score 3 when:
- `CLAUDE.md` present at project root with accurate, complete plugin description
- SessionStart hooks configured for always-on context (if needed)
- All skills referenced or contextualized in CLAUDE.md
- Context is up-to-date with current plugin functionality

Score 2 when:
- `CLAUDE.md` exists but is incomplete or outdated
- Context covers main skills but misses 1-2 secondary ones
- No SessionStart hooks but context is self-contained in CLAUDE.md

Score 1 when:
- `CLAUDE.md` present but is minimal or inaccurate
- Context only covers one skill or main feature
- No hooks and minimal context documentation

Score 0 when:
- No CLAUDE.md or context file present
- Context file is empty or unrelated to plugin

---

## Category 4: Hook Portability

Score 3 when:
- `hooks/hooks.json` uses standard Claude Code event names (SessionStart, PreToolUse, PostToolUse, etc.)
- All scripts in `scripts/` are cross-platform (use `run-hook.cmd` polyglot wrapper or bash with Windows path handling)
- No hardcoded paths with platform-specific separators
- Exit codes and output formats match Claude Code spec

Score 2 when:
- Hooks exist and use standard event names
- Scripts are mostly cross-platform but lack `run-hook.cmd` wrapper
- Some hardcoded paths or environment variable assumptions
- Output formats mostly match spec

Score 1 when:
- Hooks exist but are platform-specific (bash-only with no Windows adaptation)
- References to `${CLAUDE_PLUGIN_ROOT}` without env branching
- Non-standard event names or output formats

Score 0 when:
- No hooks or hooks are unusable outside Claude Code
- Hooks reference unknown or obsolete Claude Code features

---

## Category 5: Tool Mapping

Score 3 when:
- No sidecar needed (Claude Code is reference platform)
- Tool mappings to other platforms documented in central reference (`lib/references/`)
- All skill tool usage matches Claude Code built-in names
- Per-skill tool assumptions documented if any

Score 2 when:
- Some skills reference tools clearly used on multiple platforms
- Tool mapping partially documented
- One skill has ambiguous tool usage

Score 1 when:
- Tool usage is implicit or undocumented
- Skills reference custom or unclear tool names
- No reference material for other platforms

Score 0 when:
- No tool consistency across skills
- Unresolved platform-specific tool usage

---

## Category 6: Install Readiness

Score 3 when:
- README documents marketplace install (`/plugin install plugin-name@marketplace-name`)
- README documents local dev install (`claude --plugin-dir ./path`)
- Install instructions include verification steps (list plugins, check hooks)
- Paths match actual repository structure

Score 2 when:
- Install documented for marketplace or local, but not both
- Instructions exist but lack verification steps
- Minor path discrepancies

Score 1 when:
- Minimal install documentation
- Instructions don't match actual structure
- No verification steps

Score 0 when:
- No install documentation
- Instructions are missing or severely inaccurate

---

## Category 7: Runtime Adapters

Score 3 when:
- `.mcp.json` present with valid MCP server configurations (if needed)
- `agents/` directory populated with frontmatter-compliant agent definitions
- Optional `commands/` legacy format documented as deprecated
- No unsupported frontmatter fields in agents (agents don't use `hooks`, `mcpServers`, `permissionMode`)

Score 2 when:
- `.mcp.json` present but configuration is incomplete
- `agents/` exists but missing some agents or have incomplete frontmatter
- Mix of supported and unsupported agent configurations

Score 1 when:
- `.mcp.json` or `agents/` minimal or partially configured
- Agent frontmatter inconsistent or missing key fields
- Deprecated formats still primary

Score 0 when:
- No runtime configuration files
- `.mcp.json` or `agents/` missing entirely
