# Pseudocode & Registry Principles

Decision frameworks for how structured data, pseudocode, and external
references are organized in this repo. Three concerns: when to create a
registry, how to write pseudocode, and how to enforce that external
references are actually read.

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

---

## Verification Gates

When a skill or pattern file delegates to an external reference ("follow
detection-algorithm.md", "see hook-merging.md"), the executing LLM may
skip reading the file and hallucinate the algorithm. A prose hint like
"Follow X" is not a directive — it's a suggestion the LLM can ignore.

### The principle

Every phase that depends on an external reference must **read the file,
prove it read it, and then follow the instructions**. No phase logic
executes before its gate passes.

### Two patterns

**LOAD_AND_VERIFY** — for files. Read the file, extract a proof value
that can only come from actually reading it (function names, entry counts,
structural markers), display a checkpoint.

**GLOB_AND_VERIFY** — for directories. Glob for expected files, verify
the list is non-empty and covers the expected scope, display what was found.

### What makes a good proof

The proof must be **specific enough that it cannot be guessed**. Bad proofs:
"file exists" (trivially true). Good proofs: "content contains FUNCTION
definitions for X, Y, Z" or "YAML parses with N conditions across 7
categories."

### When to use

- A skill phase says "follow" or "see" an external file — add a gate
- A pseudocode block calls functions defined in another file — gate that file
- A phase iterates over files in a directory — GLOB_AND_VERIFY first
- A phase only uses self-contained logic (no external refs) — no gate needed
