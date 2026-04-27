# Rubric Check Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align all rubric `check:` pseudocode with the defined Platform API — fix wrong `tool_name()` arguments, inline opaque functions, unify retired synonyms, and create the pseudocode principles doc.

**Architecture:** Pure text edits across YAML rubrics and markdown files. No code, no tests, no new functions. One new markdown file (`pseudocode-principles.md`). Cross-reference added to `rubric-framework.md`.

**Tech Stack:** YAML, Markdown, grep for verification.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `lib/patterns/pseudocode-principles.md` | Create | Three-tier decision boundary for check pseudocode |
| `lib/rubrics/rubric-framework.md` | Modify (line 154) | Add cross-reference to principles doc |
| `lib/rubrics/codex.yaml` | Modify (lines 52, 112, 123, 237, 250, 310) | Fix tool_name args, unify find_file→find_first, count→len |
| `lib/rubrics/gemini-cli.yaml` | Modify (lines 111, 227, 281) | Fix tool_name arg, unify find_file→find_first |
| `lib/rubrics/openclaw.yaml` | Modify (lines 101, 230, 240) | Fix tool_name args, unify find_file→find_first |
| `lib/rubrics/cursor.yaml` | Modify (lines 64, 281) | Unify count→len, find_file→find_first |
| `lib/rubrics/claude-code.yaml` | Modify (lines 27, 113-118, 139-142, 150-154, 194, 247-249, 293-296, 305-308, 315-318) | Fix supported_tools comment, inline 7 opaque functions, unify field_present→in, has_key→in |
| `lib/rubrics/antigravity.yaml` | No changes | No affected patterns found |

---

### Task 1: Create pseudocode-principles.md

**Files:**
- Create: `lib/patterns/pseudocode-principles.md`

- [ ] **Step 1: Create the principles document**

```markdown
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
```

- [ ] **Step 2: Verify the file was created**

Run: `test -f lib/patterns/pseudocode-principles.md && echo OK`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add lib/patterns/pseudocode-principles.md
git commit -m "Add pseudocode principles doc for rubric check authoring"
```

---

### Task 2: Add cross-reference in rubric-framework.md

**Files:**
- Modify: `lib/rubrics/rubric-framework.md:153-154`

- [ ] **Step 1: Add cross-reference after the JIT section's existing text**

In `lib/rubrics/rubric-framework.md`, find this text at line 153:

```
each check. The pseudocode operations (`read_json`, `file_exists`,
`parse_frontmatter`, `glob`) map to read-only filesystem queries.
```

Replace with:

```
each check. The pseudocode operations (`read_json`, `file_exists`,
`parse_frontmatter`, `glob`) map to read-only filesystem queries.
See `lib/patterns/pseudocode-principles.md` for the full canonical
primitive list and the three-tier decision boundary (define / self-evident / inline).
```

- [ ] **Step 2: Verify**

Run: `grep 'pseudocode-principles' lib/rubrics/rubric-framework.md`
Expected: line containing the cross-reference

- [ ] **Step 3: Commit**

```bash
git add lib/rubrics/rubric-framework.md
git commit -m "Add cross-reference to pseudocode principles in rubric framework"
```

---

### Task 3: Fix tool_name() calls in codex.yaml

**Files:**
- Modify: `lib/rubrics/codex.yaml:112,123`

- [ ] **Step 1: Fix spawn_agent check (line 112)**

Find this text in `lib/rubrics/codex.yaml`:

```
          maps to Codex spawn_agent (tool_name("codex", "Task")). A lib/references/platforms/codex.md
```

Replace with:

```
          maps to Codex spawn_agent (tool_name("codex", "subagent.dispatch")). A lib/references/platforms/codex.md
```

- [ ] **Step 2: Fix update_plan check (line 123)**

Find this text in `lib/rubrics/codex.yaml`:

```
          Codex update_plan (tool_name("codex", "TodoWrite")).
```

Replace with:

```
          Codex update_plan (tool_name("codex", "task.track")).
```

- [ ] **Step 3: Verify no tool_name("codex", "Task") or "TodoWrite" remain**

Run: `grep -n 'tool_name.*"Task"\|tool_name.*"TodoWrite"' lib/rubrics/codex.yaml`
Expected: no output

- [ ] **Step 4: Commit**

```bash
git add lib/rubrics/codex.yaml
git commit -m "Fix tool_name() calls to use canonical operations in codex rubric"
```

---

### Task 4: Fix tool_name() call in gemini-cli.yaml

**Files:**
- Modify: `lib/rubrics/gemini-cli.yaml:111`

- [ ] **Step 1: Fix the tool_name call**

Find this text in `lib/rubrics/gemini-cli.yaml`:

```
          instead (tool_name("gemini-cli", "Task") = "@agent-name").
```

Replace with:

```
          instead (tool_name("gemini-cli", "subagent.dispatch") = "@agent-name").
```

- [ ] **Step 2: Verify**

Run: `grep -n 'tool_name.*"Task"' lib/rubrics/gemini-cli.yaml`
Expected: no output

- [ ] **Step 3: Commit**

```bash
git add lib/rubrics/gemini-cli.yaml
git commit -m "Fix tool_name() call to use canonical operation in gemini-cli rubric"
```

---

### Task 5: Fix tool_name() calls in openclaw.yaml

**Files:**
- Modify: `lib/rubrics/openclaw.yaml:101,230`

- [ ] **Step 1: Fix first tool_name call (line 101)**

Find this text in `lib/rubrics/openclaw.yaml`:

```
          agents.list[] in runtime config instead (tool_name("openclaw", "Task")).
```

Replace with:

```
          agents.list[] in runtime config instead (tool_name("openclaw", "subagent.dispatch")).
```

- [ ] **Step 2: Fix second tool_name call (line 230)**

Find this text in `lib/rubrics/openclaw.yaml`:

```
          tool_name("openclaw", "Task") = "agents.list[]".
```

Replace with:

```
          tool_name("openclaw", "subagent.dispatch") = "agents.list[]".
```

- [ ] **Step 3: Verify**

Run: `grep -n 'tool_name.*"Task"' lib/rubrics/openclaw.yaml`
Expected: no output

- [ ] **Step 4: Commit**

```bash
git add lib/rubrics/openclaw.yaml
git commit -m "Fix tool_name() calls to use canonical operations in openclaw rubric"
```

---

### Task 6: Unify synonyms in codex.yaml

**Files:**
- Modify: `lib/rubrics/codex.yaml:52,237,250,310`

- [ ] **Step 1: Replace count() with len() (line 52)**

Find:

```
            if count(glob(".agents/skills/*/SKILL.md")) > 1:
```

Replace:

```
            if len(glob(".agents/skills/*/SKILL.md")) > 1:
```

- [ ] **Step 2: Replace find_file() with find_first() (line 237)**

Find:

```
          sidecars = glob("**/platforms/codex.md") OR find_file("lib/references/platforms/codex.md")
```

Replace:

```
          sidecars = glob("**/platforms/codex.md") OR find_first("lib/references/platforms/codex.md")
```

- [ ] **Step 3: Replace find_file() with find_first() (line 250)**

Find:

```
          sidecars = glob("**/platforms/codex.md") OR find_file("lib/references/platforms/codex.md")
```

Note: This is a second occurrence of the same string. Use `replace_all` or target the second instance. The two occurrences are in conditions `codex.5_toolmap.sidecar.spawn_agent_mapped` (line 237) and `codex.5_toolmap.sidecar.update_plan_mapped` (line 250). After Step 2 replaces the first, this step replaces the remaining one.

Replace:

```
          sidecars = glob("**/platforms/codex.md") OR find_file("lib/references/platforms/codex.md")
```

With:

```
          sidecars = glob("**/platforms/codex.md") OR find_first("lib/references/platforms/codex.md")
```

- [ ] **Step 4: Replace find_file() with find_first() (line 310)**

Find:

```
          readme = find_file(["README.md", "INSTALL.md", ".codex/INSTALL.md"])
```

Replace:

```
          readme = find_first(["README.md", "INSTALL.md", ".codex/INSTALL.md"])
```

- [ ] **Step 5: Verify no find_file or count remain**

Run: `grep -n 'find_file\|count(' lib/rubrics/codex.yaml`
Expected: no output

- [ ] **Step 6: Commit**

```bash
git add lib/rubrics/codex.yaml
git commit -m "Unify synonyms in codex rubric: find_file→find_first, count→len"
```

---

### Task 7: Unify synonyms in cursor.yaml

**Files:**
- Modify: `lib/rubrics/cursor.yaml:64,281`

- [ ] **Step 1: Replace count() with len() (line 64)**

Find:

```
          if count(glob("skills/*/SKILL.md")) > 1 or dir_exists(".cursor-plugin/plugins/"):
```

Replace:

```
          if len(glob("skills/*/SKILL.md")) > 1 or dir_exists(".cursor-plugin/plugins/"):
```

- [ ] **Step 2: Replace find_file() with find_first() (line 281)**

Find:

```
          readme = find_file(["README.md", "INSTALL.md"])
```

Replace:

```
          readme = find_first(["README.md", "INSTALL.md"])
```

- [ ] **Step 3: Verify**

Run: `grep -n 'find_file\|count(' lib/rubrics/cursor.yaml`
Expected: no output

- [ ] **Step 4: Commit**

```bash
git add lib/rubrics/cursor.yaml
git commit -m "Unify synonyms in cursor rubric: find_file→find_first, count→len"
```

---

### Task 8: Unify synonyms in gemini-cli.yaml and openclaw.yaml

**Files:**
- Modify: `lib/rubrics/gemini-cli.yaml:227,281`
- Modify: `lib/rubrics/openclaw.yaml:240`

- [ ] **Step 1: Replace find_file() in gemini-cli.yaml (line 227)**

Find:

```
          sidecars = glob("**/platforms/gemini-cli.md") OR find_file("lib/references/platforms/gemini-cli.md")
```

Replace:

```
          sidecars = glob("**/platforms/gemini-cli.md") OR find_first("lib/references/platforms/gemini-cli.md")
```

- [ ] **Step 2: Replace find_file() in gemini-cli.yaml (line 281)**

Find:

```
          readme = find_file(["README.md", "INSTALL.md"])
```

Replace:

```
          readme = find_first(["README.md", "INSTALL.md"])
```

- [ ] **Step 3: Replace find_file() in openclaw.yaml (line 240)**

Find:

```
          readme = find_file(["README.md", "INSTALL.md"])
```

Replace:

```
          readme = find_first(["README.md", "INSTALL.md"])
```

- [ ] **Step 4: Verify**

Run: `grep -rn 'find_file(' lib/rubrics/gemini-cli.yaml lib/rubrics/openclaw.yaml`
Expected: no output

- [ ] **Step 5: Commit**

```bash
git add lib/rubrics/gemini-cli.yaml lib/rubrics/openclaw.yaml
git commit -m "Unify find_file→find_first in gemini-cli and openclaw rubrics"
```

---

### Task 9: Fix supported_tools() comment and inline opaque functions in claude-code.yaml

This is the largest task — all changes are in `lib/rubrics/claude-code.yaml`.

**Files:**
- Modify: `lib/rubrics/claude-code.yaml:27,113-118,139-142,150-154,194,247-249,293-296,305-308,315-318`

- [ ] **Step 1: Fix field_present → in (line 27)**

Find:

```
            assert field_present(json, field)
```

Replace:

```
            assert field in json
```

- [ ] **Step 2: Fix supported_tools() comment and inline extract_tool_references (lines 113-119)**

Find the entire check block for condition `claude.2_skills.tool_refs.builtin_only` (starting at line 112):

```
          builtin = supported_tools("claude-code")
          # [Read, Write, Edit, Bash, Grep, Glob, Task, Agent,
          #  TodoWrite, Skill, WebSearch, WebFetch]
          for skill in glob("skills/*/SKILL.md"):
            tool_refs = extract_tool_references(skill)
            for ref in tool_refs:
              assert ref in builtin
```

Replace with:

```
          builtin = supported_tools("claude-code")
          # [file.read, file.write, file.edit, shell.execute, search.content,
          #  search.files, subagent.dispatch, task.track, skill.invoke,
          #  web.search, web.fetch, user.ask]
          for skill in glob("skills/*/SKILL.md"):
            for tool_call in skill content:
              assert tool_call in builtin
```

- [ ] **Step 3: Inline skill_name_referenced (lines 139-142)**

Find:

```
          skills = glob("skills/*/SKILL.md")
          content = read("CLAUDE.md")
          for skill in skills:
            assert skill_name_referenced(content, skill)
```

Replace:

```
          skills = glob("skills/*/SKILL.md")
          content = read("CLAUDE.md")
          for skill in skills:
            name = parse_frontmatter(skill)["name"]
            assert name in content
```

- [ ] **Step 4: Inline scan_plugin_structure and content_matches_structure (lines 150-154)**

Find:

```
          content = read("CLAUDE.md")
          structure = scan_plugin_structure(".")
          assert content_matches_structure(content, structure)
          # CLAUDE.md describes the actual plugin layout accurately
```

Replace:

```
          content = read("CLAUDE.md")
          CLAUDE.md describes the actual plugin layout (skills, hooks, agents)
          accurately — no stale references to removed or renamed components.
```

- [ ] **Step 5: Fix has_key → key in (line 194)**

Find:

```
              assert has_key(config, "hooks")
```

Replace:

```
              assert "hooks" in config
```

- [ ] **Step 6: Inline remaps_claude_tools (lines 247-249)**

Find:

```
            for s in sidecars:
              content = read(s)
              assert not remaps_claude_tools(content)
```

Replace:

```
            for s in sidecars:
              content = read(s)
              for op in supported_tools("claude-code"):
                name = tool_name("claude-code", op)
                assert content does not map name to a different tool name
```

- [ ] **Step 7: Inline contains_verification_guidance (lines 293-296)**

Find:

```
          readme = find_first(["README.md", "INSTALL.md", "docs/install.md"])
          content = read(readme)
          assert contains_verification_guidance(content)
          # Should include steps to verify the plugin loaded correctly
```

Replace:

```
          readme = find_first(["README.md", "INSTALL.md", "docs/install.md"])
          content = read(readme)
          assert content includes steps to verify the plugin loaded correctly
```

- [ ] **Step 8: Inline uses_mcp_servers (lines 305-308)**

Find:

```
          if uses_mcp_servers("."):
            assert file_exists(".mcp.json")
```

Replace:

```
          if file_exists(".mcp.json") or config references MCP servers:
            assert file_exists(".mcp.json")
```

- [ ] **Step 9: Inline has_agent_definitions (lines 315-319)**

Find:

```
          # Only required if plugin defines agents
          if has_agent_definitions("."):
            agents = glob("agents/*.md")
            assert len(agents) > 0
```

Replace:

```
          # Only required if plugin defines agents
          if dir_exists("agents/"):
            assert glob("agents/*.md") is non-empty

- [ ] **Step 10: Verify all opaque functions are gone**

Run: `grep -n 'extract_tool_references\|remaps_claude_tools\|scan_plugin_structure\|content_matches_structure\|has_agent_definitions\|uses_mcp_servers\|contains_verification_guidance\|skill_name_referenced\|field_present\|has_key(' lib/rubrics/claude-code.yaml`
Expected: no output

- [ ] **Step 11: Commit**

```bash
git add lib/rubrics/claude-code.yaml
git commit -m "Inline opaque functions and unify synonyms in claude-code rubric"
```

---

### Task 10: Final verification

- [ ] **Step 1: Run all spec verification commands**

```bash
echo "=== 1. tool_name Task ===" && grep -rn 'tool_name.*"Task"' lib/rubrics/
echo "=== 2. tool_name TodoWrite ===" && grep -rn 'tool_name.*"TodoWrite"' lib/rubrics/
echo "=== 3. find_file ===" && grep -rn 'find_file(' lib/rubrics/
echo "=== 4. count( ===" && grep -rn 'count(' lib/rubrics/
echo "=== 5. field_present ===" && grep -rn 'field_present(' lib/rubrics/
echo "=== 6. has_key( ===" && grep -rn 'has_key(' lib/rubrics/
echo "=== 7. opaque functions ===" && grep -rn 'extract_tool_references\|remaps_claude_tools\|scan_plugin_structure\|content_matches_structure\|has_agent_definitions\|uses_mcp_servers\|contains_verification_guidance\|skill_name_referenced' lib/rubrics/
echo "=== 8. pseudocode-principles exists ===" && test -f lib/patterns/pseudocode-principles.md && echo OK
echo "=== 9. framework cross-ref ===" && grep 'pseudocode-principles' lib/rubrics/rubric-framework.md
```

Expected: checks 1-7 return no output, check 8 prints OK, check 9 prints the cross-reference line.

- [ ] **Step 2: Update reconciliation matrix items 35-39 to fixed**

In `docs/reconciliation-matrix.md`, find the Rubric Check Alignment section and strike through all five items:

Find:

```
35. **Rubric YAMLs**: `tool_name()` called with tool names instead of canonical Operations (4 instances) — Needs fix
36. **claude-code.yaml**: `supported_tools()` comment lists tool names not canonical ops — Needs fix
37. **claude-code.yaml**: 7 opaque utility functions should be inlined as prose pseudocode — Needs fix
38. **All rubrics**: Synonym duplication (`find_file`/`find_first`, `count`/`len`, `field_present`/`in`) — Needs fix
39. **lib/patterns/pseudocode-principles.md**: Decision boundary doc missing — Needs creation
```

Replace:

```
35. ~~**Rubric YAMLs**: `tool_name()` called with tool names instead of canonical Operations (4 instances)~~ Fixed — all use canonical Operation enum values
36. ~~**claude-code.yaml**: `supported_tools()` comment lists tool names not canonical ops~~ Fixed — lists canonical operations
37. ~~**claude-code.yaml**: 7 opaque utility functions should be inlined as prose pseudocode~~ Fixed — all inlined
38. ~~**All rubrics**: Synonym duplication (`find_file`/`find_first`, `count`/`len`, `field_present`/`in`)~~ Fixed — unified to canonical names
39. ~~**lib/patterns/pseudocode-principles.md**: Decision boundary doc missing~~ Fixed — created with three-tier framework
```

- [ ] **Step 3: Commit**

```bash
git add docs/reconciliation-matrix.md
git commit -m "Mark rubric check alignment items 35-39 as fixed in reconciliation matrix"
```
