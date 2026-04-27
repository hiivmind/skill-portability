# Pseudocode & Registry Principles

Decision frameworks for how structured data and pseudocode are organized
in this repo. Two concerns: when to create a registry, and how to write
pseudocode in rubric checks and pattern files.

---

## Registries

### When to create a registry

A registry is warranted when the same structured data — same shape, multiple
entries — is referenced from more than one file. The test: **is this fact
stated more than once?** If yes, state it once in a registry and look it up
everywhere else.

### Structure

Each registry lives in its own directory under `lib/references/`:

```
lib/references/<concept>/
  registry.md     # TYPE + DATA + FUNCTION definitions
```

A registry file has three sections:

1. **Type** — a pseudocode `TYPE` defining the shape of each entry
2. **Data** — a named dictionary or list populated with all entries
3. **Lookup Functions** — deterministic `FUNCTION` definitions that query
   the data by key, platform, path, or other criteria

### When NOT to create a registry

- Data used by only one file — keep it inline
- Algorithm logic (branching, loops, scoring) — that's a pattern, not data
- Prose documentation — belongs in pattern files or research docs

### Consumers

Consumer files (patterns, rubrics, SKILL.md) call lookup functions instead
of hardcoding data. When a consumer needs a fact from a registry, it calls
the function — it never duplicates the data inline.

---

## Pseudocode

Three tiers determine how to express logic in rubric `check:` blocks and
pattern file algorithms.

### Tier 1: Define as a lookup function

Functions that access a registry's data. These have a formal `FUNCTION`
definition in the registry file.

**Test:** Does the function query structured data from a named registry
(REGISTRY, UPLIFT_TARGETS, TEMPLATE_REGISTRY, etc.)? If yes, define it
in the corresponding registry file.

### Tier 2: Self-evident primitives

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

### Tier 3: Inline as prose

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
