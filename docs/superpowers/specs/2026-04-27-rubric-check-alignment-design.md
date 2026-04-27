# Rubric Check Alignment

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align all rubric `check:` pseudocode with the defined Platform API, eliminate undefined opaque functions, and document the pseudocode/prose boundary.

**Architecture:** No new functions in platform-api.md — existing lookup functions already cover all platform-dependent needs. Opaque utility functions that hide 1-2 lines of simple logic get inlined as prose pseudocode. A new principles document codifies the decision boundary for future rubric authors.

**Tech Stack:** YAML rubrics, pseudocode in platform-api.md, markdown principles doc.

---

## Deliverables

1. **`lib/patterns/pseudocode-principles.md`** (new) — Three-tier decision boundary for rubric check pseudocode
2. **6 rubric YAMLs** (edit) — Fix `tool_name()` args, fix `supported_tools()` comment, inline opaque functions, unify synonyms
3. **`lib/references/platform-api.md`** (no changes expected) — Existing functions are sufficient

## Pseudocode Principles (new doc content)

The principles doc establishes three tiers:

### Tier 1: Define in platform-api.md

Functions that look up platform-specific data from REGISTRY. These depend on
the PlatformSpec type system and canonical enums. Examples: `tool_name()`,
`supported_tools()`, `strip_fields()`, `hook_event()`, `has_hooks()`.

**Test:** Does the function access `REGISTRY[platform]`? If yes, define it.

### Tier 2: Self-evident primitives

Generic filesystem, data, and parsing operations whose names carry their
semantics. No definition needed — any LLM performing JIT evaluation understands
them from the name alone.

Canonical list (use these names, not synonyms):
- **Filesystem:** `file_exists`, `dir_exists`, `read`, `read_json`, `valid_json`, `glob`, `glob_dirs`, `find_first`
- **Parsing:** `parse_frontmatter`, `parse_toml`, `parse_toml_field`
- **Data:** `has_keys`, `len`, `basename`, `project_root`, `is_array`, `match`
- **Operators:** `in` for single-key membership, `not in` for absence

Retired synonyms (do not use):
- `find_file` → use `find_first`
- `count` → use `len`
- `field_present(obj, field)` → use `field in obj`
- `has_key(obj, key)` → use `key in obj`

### Tier 3: Inline as prose

When logic is 1-2 lines and only appears in one or two checks, write it
inline rather than naming a function. Hiding simple intent behind a named
function obscures what the check actually does.

Examples of inlining:
- `extract_tool_references(skill)` → `for tool_call in skill content:`
- `remaps_claude_tools(content)` → `content maps any tool in supported_tools("claude-code") to a different name`
- `has_agent_definitions(".")` → `glob("agents/*.md") is non-empty`
- `uses_mcp_servers(".")` → `file_exists(".mcp.json") or config references MCP servers`
- `contains_verification_guidance(content)` → `content includes steps to verify the plugin loaded`
- `skill_name_referenced(content, skill)` → `name from parse_frontmatter(skill) appears in content`
- `scan_plugin_structure(".")` / `content_matches_structure(content, structure)` → describe expected structure in prose

## Rubric Changes

### A. Fix `tool_name()` calls to use canonical Operations

The `tool_name(platform, op)` function takes a canonical Operation enum value,
not a Claude Code tool name. Four calls pass tool names instead of operations:

| File | Current | Corrected |
|------|---------|-----------|
| codex.yaml (2_skills.tool_refs.spawn_agent) | `tool_name("codex", "Task")` | `tool_name("codex", "subagent.dispatch")` |
| codex.yaml (2_skills.tool_refs.update_plan) | `tool_name("codex", "TodoWrite")` | `tool_name("codex", "task.track")` |
| gemini-cli.yaml (2_skills.tool_refs.no_task_tool) | `tool_name("gemini-cli", "Task")` | `tool_name("gemini-cli", "subagent.dispatch")` |
| openclaw.yaml (2_skills.tool_refs.no_unresolved) | `tool_name("openclaw", "Task")` | `tool_name("openclaw", "subagent.dispatch")` |

### B. Fix `supported_tools()` comment

In claude-code.yaml condition `claude.2_skills.tool_refs.builtin_only`, the
comment after `supported_tools("claude-code")` lists tool names:
```
# [Read, Write, Edit, Bash, Grep, Glob, Task, Agent, TodoWrite, Skill, WebSearch, WebFetch]
```

Should list canonical operations:
```
# [file.read, file.write, file.edit, shell.execute, search.content, search.files,
#  subagent.dispatch, task.track, skill.invoke, web.search, web.fetch, user.ask]
```

### C. Inline opaque functions

Seven functions in claude-code.yaml that hide simple logic behind names:

| Current | Inlined replacement |
|---------|-------------------|
| `extract_tool_references(skill)` | `for tool_call in skill content:` |
| `remaps_claude_tools(content)` | `content maps any tool in supported_tools("claude-code") to a different name` |
| `scan_plugin_structure(".")` | Remove — the judgement prose already says what to check |
| `content_matches_structure(content, structure)` | `CLAUDE.md describes the actual plugin layout (skills, hooks, agents) accurately` |
| `has_agent_definitions(".")` | `glob("agents/*.md") is non-empty` |
| `uses_mcp_servers(".")` | `file_exists(".mcp.json") or config references MCP servers` |
| `contains_verification_guidance(content)` | `content includes steps to verify the plugin loaded correctly` |
| `skill_name_referenced(content, skill)` | `name from parse_frontmatter(skill) appears in content` |

### D. Unify synonyms across all 6 rubrics

| Retired | Replacement | Files affected |
|---------|-------------|---------------|
| `find_file(...)` | `find_first(...)` | codex.yaml, cursor.yaml, gemini-cli.yaml, openclaw.yaml |
| `count(...)` | `len(...)` | codex.yaml, cursor.yaml |
| `field_present(json, field)` | `field in json` | claude-code.yaml |
| `has_key(obj, key)` | `key in obj` | claude-code.yaml |

`has_keys(obj, keys)` is retained — checking multiple keys at once is a distinct
operation from single-key membership.

## What Does NOT Change

- **platform-api.md** — No new functions. Existing `tool_name`, `supported_tools`, `strip_fields`, `hook_event`, `hook_can_block`, `has_hooks`, `unsupported_tools`, `platforms_supporting`, `tool_mapping_table`, `diff_from` are sufficient.
- **Self-evident primitives** — `file_exists`, `glob`, `read_json`, `parse_frontmatter`, `len`, `basename`, etc. remain undefined. Their names carry the semantics.
- **Judgement conditions** — These are prose by nature. No pseudocode alignment needed.
- **rubric-framework.md** — JIT section (line 153) already acknowledges primitives exist. Add a cross-reference to the new principles doc.

## Verification

After all edits:
1. `grep -rn 'tool_name.*"Task"' lib/rubrics/` returns zero matches
2. `grep -rn 'tool_name.*"TodoWrite"' lib/rubrics/` returns zero matches
3. `grep -rn 'find_file(' lib/rubrics/` returns zero matches
4. `grep -rn 'count(' lib/rubrics/` returns zero matches
5. `grep -rn 'field_present(' lib/rubrics/` returns zero matches
6. `grep -rn 'has_key(' lib/rubrics/` returns zero matches
7. `grep -rn 'extract_tool_references\|remaps_claude_tools\|scan_plugin_structure\|content_matches_structure\|has_agent_definitions\|uses_mcp_servers\|contains_verification_guidance\|skill_name_referenced' lib/rubrics/` returns zero matches
8. All `tool_name()` calls use canonical Operation enum values
