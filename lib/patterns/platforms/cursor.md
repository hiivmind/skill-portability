# Cursor Scoring Rules

Platform-specific scoring criteria for the 7-category rubric.
See `lib/patterns/rubric-framework.md` for the shared scoring scale.

---

## Artifact Checklist

| File | Category |
|------|----------|
| `.cursor-plugin/plugin.json` | Manifest Packaging |
| `.cursor/rules/*.mdc` | Context Delivery |
| `hooks/hooks-cursor.json` | Hook Portability |
| `mcp.json` | Runtime Adapters |
| `AGENTS.md` | Context Delivery |

---

## Category 1: Manifest Packaging

Score 3 when:
- `.cursor-plugin/plugin.json` present with `name`, `displayName`, `description`, `version`, `author`
- `logo` field present for marketplace visibility
- Conditional `agents` and `commands` keys only when applicable
- Skills discoverable from `.cursor/skills/`, `.agents/skills/`, or `skills/` directories
- One-way compatibility with Claude Code (`.claude/skills/` recognized)

Score 2 when:
- `plugin.json` exists but missing `displayName` or `logo`
- `agents`/`commands` fields present but not conditional
- Skills mix multiple discovery paths inconsistently

Score 1 when:
- No manifest file but components in default locations
- Manifest exists but non-standard or incomplete
- Only legacy formats discoverable

Score 0 when:
- No recognizable Cursor plugin structure
- No manifest or skills directories

---

## Category 2: Skill Compatibility

Score 3 when:
- Standard SKILL.md format with proper frontmatter (name, description, when_to_use)
- Skills discoverable from `.cursor/skills/`, `.agents/skills/`, `skills/`, and `.claude/skills/` (compat)
- No unresolved tool assumptions
- Tools match Cursor's built-in set (same as Claude Code plus Cursor-specific enhancements)

Score 2 when:
- Most skills properly formatted but 1-2 missing frontmatter fields
- Skills discoverable but in inconsistent locations
- Minimal one-way Claude Code compatibility

Score 1 when:
- Skills present but with inconsistent frontmatter
- Discovery paths partially documented
- Limited platform documentation

Score 0 when:
- No skills found
- Skills lack frontmatter or are unstructured

---

## Category 3: Context Delivery

Score 3 when:
- `.cursor/rules/*.mdc` files present with complete rule definitions
- Activation modes documented (per-file context activation)
- `AGENTS.md` present listing all agents and skills
- Supplemental `CLAUDE.md` if needed for non-Cursor context
- All skills referenced with their context requirements

Score 2 when:
- `.cursor/rules/` present but incomplete rule definitions
- `AGENTS.md` exists but missing some skill listings
- Context partially documented across multiple files

Score 1 when:
- Minimal rule files in `.cursor/rules/`
- `AGENTS.md` missing or bare
- Context documentation sparse

Score 0 when:
- No context files present
- `.cursor/rules/` and `AGENTS.md` both missing

---

## Category 4: Hook Portability

Score 3 when:
- `hooks/hooks-cursor.json` uses camelCase event names (not snake_case)
- `additional_context` output uses snake_case (per Cursor spec)
- All scripts are cross-platform or Cursor-specific
- Hook output matches Cursor's expected format

Score 2 when:
- `hooks/hooks-cursor.json` present with mostly correct format
- Minor case inconsistencies in event or output names
- Scripts mostly portable

Score 1 when:
- Hook file present but inconsistent formatting
- Event names partially incorrect
- Scripts are Cursor-specific without porting guide

Score 0 when:
- No hook file present
- Hooks unusable on Cursor platform

---

## Category 5: Tool Mapping

Score 3 when:
- Tool names documented for Cursor (reference `lib/references/`)
- All skills use Cursor-standard tool names
- Compat note if importing from Claude Code skills
- Per-skill tool assumptions documented

Score 2 when:
- Tool names mostly clear from context
- Some skills have undocumented tool usage
- Partial compat documentation

Score 1 when:
- Tool usage implicit or minimal documentation
- Unclear if tools translate from Claude Code
- No reference material

Score 0 when:
- No tool consistency across skills
- Tool mapping missing

---

## Category 6: Install Readiness

Score 3 when:
- README documents Cursor marketplace install
- Local install to `~/.cursor/plugins/local/<name>/` documented
- Verification steps included (restart requirement noted)
- Paths match actual repository structure

Score 2 when:
- Install documented for one method (marketplace or local)
- Instructions lack verification or restart guidance
- Minor path discrepancies

Score 1 when:
- Minimal install documentation
- Instructions incomplete or partially inaccurate
- No guidance on restart requirement

Score 0 when:
- No install documentation
- Instructions severely inaccurate

---

## Category 7: Runtime Adapters

Score 3 when:
- `mcp.json` (not `.mcp.json`) present with valid MCP configurations (if needed)
- Note: Cursor does NOT support MCP Resources
- `agents/` directory with complete frontmatter (no unsupported fields)
- Optional `commands/` documented if present

Score 2 when:
- `mcp.json` present but incomplete configuration
- `agents/` exists with mostly complete frontmatter
- Mix of supported and unsupported configurations

Score 1 when:
- `mcp.json` or `agents/` minimal or partially configured
- Agent frontmatter inconsistent
- Deprecated formats still used

Score 0 when:
- No `mcp.json` or `agents/` present
- Runtime configuration missing
