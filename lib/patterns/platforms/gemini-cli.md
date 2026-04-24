# Gemini CLI Scoring Rules

Platform-specific scoring criteria for the 7-category rubric.
See `lib/patterns/rubric-framework.md` for the shared scoring scale.

---

## Artifact Checklist

| File | Category |
|------|----------|
| `gemini-extension.json` | Manifest Packaging |
| `GEMINI.md` | Context Delivery |
| `agents/*.md` | Runtime Adapters |
| `commands/*.toml` | Runtime Adapters |
| `references/gemini-tools.md` | Tool Mapping |

---

## Category 1: Manifest Packaging

Score 3 when:
- `gemini-extension.json` present with `name` (lowercase dashes only, matches directory name), `version`, `description`, `contextFileName`
- Author, homepage, repository fields populated
- No forbidden characters in `name` field

Score 2 when:
- `gemini-extension.json` present but missing `contextFileName` or author info
- `name` field has minor formatting issues
- Version or description incomplete

Score 1 when:
- Manifest exists but non-standard or incomplete schema
- Missing critical fields like `contextFileName`
- `name` field has major formatting issues

Score 0 when:
- No manifest file present
- Manifest cannot be parsed as valid JSON

---

## Category 2: Skill Compatibility

Score 3 when:
- Standard SKILL.md format with proper frontmatter
- `references/gemini-tools.md` sidecar present documenting Gemini tool mapping
- Skills flag `Task`/`Agent` tool usage (Gemini uses `@agent-name` syntax, not `Task`)
- All tool references resolvable to Gemini equivalents

Score 2 when:
- Skills properly formatted but sidecar incomplete
- Most tool usage clear but 1-2 unresolved references
- Agent/Task usage partially documented

Score 1 when:
- Skills present but sidecar minimal or missing
- Tool mapping sparse or unclear
- Limited guidance on `@` agent syntax

Score 0 when:
- No skills found
- No sidecar documentation
- Unresolved tool references

---

## Category 3: Context Delivery

Score 3 when:
- `GEMINI.md` present with complete descriptions
- `@` includes for every skill in both SKILL.md and gemini-tools.md
- All agent references marked with `@` syntax
- Context up-to-date with current functionality

Score 2 when:
- `GEMINI.md` exists but missing includes for some skills
- Most `@` includes present but incomplete coverage
- Context mostly up-to-date

Score 1 when:
- `GEMINI.md` minimal or sparse
- `@` includes only for primary skills
- Context incomplete or outdated

Score 0 when:
- No `GEMINI.md` present
- Context file is empty

---

## Category 4: Hook Portability

Score 3 when:
- Hooks documented in user `settings.json` (not standalone file)
- Event names correct: `BeforeTool`, `AfterTool` (camelCase)
- Guidance on tool checks included
- Built-in `gemini hooks migrate --from-claude` guidance provided
- Scripts are portable or Gemini-specific with clear adaption path

Score 2 when:
- Hook configuration in settings.json but incomplete
- Event names mostly correct
- Some guidance provided but incomplete

Score 1 when:
- Minimal hook documentation
- Event names partially incorrect
- Scripts Gemini-specific without adaption guidance

Score 0 when:
- No hook configuration
- Hooks unusable on Gemini

---

## Category 5: Tool Mapping

Score 3 when:
- `references/gemini-tools.md` thoroughly documents mapping:
  - Claude Code `Read` -> Gemini `read_file`
  - Claude Code `Edit` -> Gemini `replace`
  - Claude Code `Write` -> Gemini `write_file`
  - Claude Code `Grep` -> Gemini `grep_search`
  - Claude Code `Bash` -> Gemini `run_shell_command`
- Note: Gemini does NOT have `Task` tool (use `@agent-name` instead)
- All skills reviewed for tool usage consistency

Score 2 when:
- Reference document exists but incomplete mappings
- Most tools correctly mapped but 1-2 unclear
- Limited `@agent-name` syntax guidance

Score 1 when:
- Minimal tool mapping documentation
- Unclear how Task/Agent should translate
- Limited reference material

Score 0 when:
- No tool mapping sidecar
- Tool usage unresolved

---

## Category 6: Install Readiness

Score 3 when:
- README documents `gemini extensions install` from GitHub
- Local install from filesystem documented with path
- Three tiers explained: system, user, project scope
- Verification steps included (restart requirement noted)
- Paths match actual repository structure

Score 2 when:
- Install documented for GitHub or local, not both
- Instructions lack scope or restart guidance
- Minor path discrepancies

Score 1 when:
- Minimal install documentation
- Instructions incomplete or partially inaccurate
- No restart guidance

Score 0 when:
- No install documentation
- Instructions severely inaccurate

---

## Category 7: Runtime Adapters

Score 3 when:
- `agents/*.md` files present with mandatory frontmatter (description required, plus name, tools, etc.)
- `commands/*.toml` files properly formatted if commands used
- `policies/*.toml` if policies defined
- MCP configuration documented in manifest if applicable
- All adapters follow Gemini conventions (camelCase for field names where applicable)

Score 2 when:
- `agents/` or `commands/` present but incomplete frontmatter
- `.toml` files present but missing some required fields
- MCP partially documented

Score 1 when:
- Minimal agent or command definitions
- Frontmatter incomplete or inconsistent
- MCP undocumented

Score 0 when:
- No agents or commands present
- No runtime configuration found
