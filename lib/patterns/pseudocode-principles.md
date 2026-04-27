# Pseudocode Principles

Decision boundary for rubric `check:` pseudocode. Determines whether a
function needs a formal definition, is self-evident, or should be inlined.

---

## Tier 1: Define in platform-api.md

Functions that look up platform-specific data from REGISTRY. These depend on
the PlatformSpec type system and canonical enums.

**Test:** Does the function access `REGISTRY[platform]`? If yes, define it.

Defined functions: `tool_name`, `hook_event`, `hook_can_block`,
`supported_tools`, `unsupported_tools`, `has_hooks`, `strip_fields`,
`platforms_supporting`, `tool_mapping_table`, `diff_from`.

---

## Tier 2: Self-evident primitives

Generic operations whose names carry their semantics. No definition needed —
any LLM performing JIT evaluation understands them from the name alone.

Canonical names (use these, not synonyms):

- **Filesystem:** `file_exists`, `dir_exists`, `read`, `read_json`, `valid_json`, `glob`, `glob_dirs`, `find_first`
- **Parsing:** `parse_frontmatter`, `parse_toml`, `parse_toml_field`
- **Data:** `has_keys`, `len`, `basename`, `project_root`, `is_array`, `match`
- **Operators:** `in` for single-key membership, `not in` for absence

Retired synonyms — do not use in new checks:

| Retired | Use instead |
|---------|-------------|
| `find_file(...)` | `find_first(...)` |
| `count(...)` | `len(...)` |
| `field_present(obj, field)` | `field in obj` |
| `has_key(obj, key)` | `key in obj` |

---

## Tier 3: Inline as prose

When logic is 1-2 lines and only appears in one or two checks, write it
inline rather than naming a function. Hiding simple intent behind a named
function obscures what the check actually does.

Inlining examples:

| Instead of | Write |
|------------|-------|
| `extract_tool_references(skill)` | `for tool_call in skill content:` |
| `has_agent_definitions(".")` | `glob("agents/*.md") is non-empty` |
| `uses_mcp_servers(".")` | `file_exists(".mcp.json") or config references MCP servers` |
| `contains_verification_guidance(content)` | `content includes steps to verify the plugin loaded` |
| `skill_name_referenced(content, skill)` | `name from parse_frontmatter(skill) appears in content` |
