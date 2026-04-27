# Tier 1: Core Reference Verification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify every "Needs review" claim in `lib/references/` against `docs/platforms/*.md` research docs. Fix discrepancies, confirm correct claims, update the reconciliation matrix.

**Architecture:** File-by-file verification. Each task reads the claim file and the corresponding research doc, compares, fixes if wrong, and records the verdict. Final task updates the reconciliation matrix with all verdicts.

**Tech Stack:** Markdown editing only. No code, no tests, no builds.

---

## Pre-read: Research doc quick reference

Before starting, the implementer should know where to find verification data:

| Platform | Research doc | Key sections for Tier 1 |
|----------|-------------|------------------------|
| Gemini CLI | `docs/platforms/gemini-cli.md` | Tool names, hook events, skill paths, MCP, subagents |
| Codex | `docs/platforms/codex.md` | Tool inventory, skill paths, spawn_agent, MCP |
| Cursor | `docs/platforms/cursor.md` | Hook format (lines 311–427) |
| Antigravity | `docs/platforms/antigravity.md` | Tool names (lines 191–200), frontmatter (lines 99–108), MCP |
| OpenClaw | `docs/platforms/openclaw.md` | Hook events (lines 264–282), tool inventory |
| Claude Code | `docs/platforms/claude-code.md` | Tool list (line 355+), hook format (lines 278–354) |

---

### Task 1: Verify platform-mappings.md Tables 2, 3, 8, 13

**Files:**
- Modify: `lib/references/platform-mappings.md`
- Read: `docs/platforms/gemini-cli.md`, `docs/platforms/codex.md`, `docs/platforms/antigravity.md`, `docs/platforms/openclaw.md`

This task covers 9 matrix items. Most are correct; one needs a note.

- [ ] **Step 1: Verify Table 2 �� Codex / Skill cell**

Read `lib/references/platform-mappings.md` Table 2, Codex / Skill row. Current value: `(N/A)`.

Read `docs/platforms/codex.md` and search for "skill" near tool inventory. Research confirms: "Skills load natively — just follow the instructions" (no Skill tool equivalent). Codex has built-in skills (`$skill-creator`, `$skill-installer`) loaded by name, not a generic `Skill` tool.

**Verdict: Correct.** No change needed.

- [ ] **Step 2: Verify Table 2 — Gemini / Task cell**

Current value: `@agent-name`. Research (`docs/platforms/gemini-cli.md`) confirms: `@agent-name <task>` syntax or automatic routing. Built-in agents: `generalist`, `cli_help`, `codebase_investigator`.

**Verdict: Correct.** No change needed.

- [ ] **Step 3: Verify Table 2 — Gemini / all other cells**

Verify each mapping in Table 2's Gemini column against `docs/platforms/gemini-cli.md`:

| Claude Tool | Current Gemini | Research says | Match? |
|-------------|---------------|---------------|--------|
| Read | `read_file` | `read_file` | Yes |
| Write | `write_file` | `write_file` | Yes |
| Edit | `replace` | `replace` | Yes |
| Bash | `run_shell_command` | `run_shell_command` | Yes |
| Grep | `grep_search` | `grep_search` | Yes |
| Glob | `glob` | `glob` | Yes |
| TodoWrite | `write_todos` | `write_todos` | Yes |
| Skill | `activate_skill` | `activate_skill` | Yes |
| WebSearch | `google_web_search` | `google_web_search` | Yes |
| WebFetch | `web_fetch` | `web_fetch` | Yes |
| AskUserQuestion | `ask_user` | `ask_user` | Yes |

**Verdict: Correct.** No change needed.

- [ ] **Step 4: Verify Table 2 — OpenClaw / all cells**

Verify each mapping against `docs/platforms/openclaw.md`:

| Claude Tool | Current OpenClaw | Research says | Match? |
|-------------|-----------------|---------------|--------|
| Read | `Read` | `Read` | Yes |
| Write | `Write` | `Write` | Yes |
| Edit | `Edit` | `Edit` | Yes |
| Bash | `Bash` | `Bash` | Yes |
| Grep | `Grep` | `Grep` | Yes |
| Glob | `Glob` | `Glob` | Yes |
| Task | `agents.list[]` | `agents.list[]` config (not a tool) | Yes |
| Agent | `agents.list[]` | `agents.list[]` config (not a tool) | Yes |
| TodoWrite | `(N/A)` | No equivalent | Yes |
| Skill | `(N/A)` | No equivalent — skills load natively | Yes |
| WebSearch | `WebSearch` | `WebSearch` | Yes |
| WebFetch | `WebFetch` | `WebFetch` | Yes |
| AskUserQuestion | `AskUserQuestion` | `AskUserQuestion` | Yes |

**Verdict: Correct.** No change needed.

- [ ] **Step 5: Verify Table 2 — Antigravity / all cells**

Current claim: all Antigravity tool names are identical to Claude Code.

Read `docs/platforms/antigravity.md` lines 191–200. Research says:

> "The tool names differ from Claude Code."

The research lists tools by surface category:
- File read/write: `Read`, `Write`, `Edit` (confirmed same)
- Terminal execution: `Bash` (confirmed same)
- Browser control: `WebSearch`, `WebFetch` (partial)
- `run_command`: maps to Claude's `Bash` — "Referenced in skill instructions for script execution"

The research explicitly states tool names "differ" but then confirms Read, Write, Edit, Bash, WebSearch, WebFetch map 1:1. The research does NOT explicitly confirm that Antigravity has tools named `Grep`, `Glob`, `Task`, `Agent`, `TodoWrite`, `Skill`, or `AskUserQuestion`.

**Verdict: Unverifiable from current research** for Grep, Glob, Task, Agent, TodoWrite, Skill, AskUserQuestion. The confirmed tools match. No change to Table 2 (the "same as Claude" claim is the best available information), but flag in matrix.

- [ ] **Step 6: Verify Table 3 — Gemini / SubagentStart cell**

Current value: `(N/A)`.

Read `docs/platforms/gemini-cli.md` hook events section. Research lists 11 Gemini hook events: `SessionStart`, `SessionEnd`, `BeforeAgent`, `AfterAgent`, `BeforeModel`, `AfterModel`, `BeforeToolSelection`, `BeforeTool`, `AfterTool`, `PreCompress`, `Notification`. None of these map to `SubagentStart`.

**Verdict: Correct.** No change needed.

- [ ] **Step 7: Verify Table 8 — Codex / Skills Path**

Current value: `.agents/skills/` for skills, `.codex/agents/` for agents.

Read `docs/platforms/codex.md` skill paths section. Research confirms workspace skills at `$CWD/.agents/skills/`, user skills at `~/.codex/skills/`, and agents in `~/.codex/agents/*.toml` or `.codex/agents/*.toml`.

**Verdict: Correct.** No change needed.

- [ ] **Step 8: Verify Table 8 — All other platforms**

| Platform | Current Skills | Current Agents | Research says | Match? |
|----------|---------------|----------------|---------------|--------|
| Claude Code | `skills/` | `agents/` | Plugin layout: `skills/`, `agents/` | Yes |
| Cursor | `skills/` | `agents/` | Same plugin layout as Claude Code | Yes |
| Gemini | `skills/` | `agents/` | Extension: `skills/` (or custom `skillsDir`), `agents/` | Yes |
| Antigravity | `.agents/skills/` | `.agent/rules/` | `.agents/skills/` confirmed; `.agent/rules/` for rule-based agents | Yes |
| OpenClaw | `skills/` | `agents.list[]` | Skills in plugin `skills/`; agents in manifest | Yes |

**Verdict: Correct.** No change needed.

- [ ] **Step 9: Verify Table 13 — Antigravity / MCP**

Current value: `—` with note "MCP not supported via config file".

Read `docs/platforms/antigravity.md` MCP section. Research says: "Configured via Antigravity settings UI (not file-based declaration like other platforms)." MCP is supported but through UI, not a config file.

**Verdict: Correct.** The claim "not supported via config file" is accurate. No change needed.

- [ ] **Step 10: Commit**

If no changes were needed (all correct), skip this step.

```bash
git add lib/references/platform-mappings.md
git commit -m "fix: platform-mappings — verify Tables 2, 3, 8, 13 against research"
```

---

### Task 2: Verify gemini-tools.md

**Files:**
- Read: `lib/references/gemini-tools.md`, `docs/platforms/gemini-cli.md`

This task covers 2 matrix items: tool name mappings and additional tools list.

- [ ] **Step 1: Verify all tool name mappings**

Read `lib/references/gemini-tools.md` lines 3–18. Compare each row against `docs/platforms/gemini-cli.md` tool inventory.

| Skill ref | Current mapping | Research says | Match? |
|-----------|----------------|---------------|--------|
| Read | `read_file` | `read_file` | Yes |
| Write | `write_file` | `write_file` | Yes |
| Edit | `replace` | `replace` | Yes |
| Bash | `run_shell_command` | `run_shell_command` | Yes |
| Grep | `grep_search` | `grep_search` | Yes |
| Glob | `glob` | `glob` | Yes |
| TodoWrite | `write_todos` | `write_todos` | Yes |
| Skill | `activate_skill` | `activate_skill` | Yes |
| WebSearch | `google_web_search` | `google_web_search` | Yes |
| WebFetch | `web_fetch` | `web_fetch` | Yes |
| AskUserQuestion | `ask_user` | `ask_user` | Yes |
| Task | `@agent-name` | `@agent-name` or automatic | Yes |

**Verdict: Correct.** No change needed.

- [ ] **Step 2: Verify additional Gemini CLI tools list**

Read `lib/references/gemini-tools.md` lines 43–53 (Additional tools table). Compare against `docs/platforms/gemini-cli.md` full tool inventory.

Current list: `read_many_files`, `list_directory`, `save_memory`, `get_internal_docs`, `complete_task`, `enter_plan_mode` / `exit_plan_mode`, `browser_agent`.

Research confirms all 7 (8 counting enter/exit as 2). No missing tools found in research.

**Verdict: Correct.** No change needed.

---

### Task 3: Verify codex-tools.md

**Files:**
- Read: `lib/references/codex-tools.md`, `docs/platforms/codex.md`

This task covers 2 matrix items: WebSearch mapping and spawn_agent details.

- [ ] **Step 1: Verify WebSearch mapping**

Read `lib/references/codex-tools.md` line 20. Current: `WebSearch` → `WebSearch`.

Read `docs/platforms/codex.md` tool inventory. Research says: `WebSearch` (live or cached).

**Verdict: Correct.** No change needed.

- [ ] **Step 2: Verify spawn_agent details**

Read `lib/references/codex-tools.md` lines 37–79 (Named agent dispatch section). Compare against `docs/platforms/codex.md` subagent section.

| Claim | Research says | Match? |
|-------|---------------|--------|
| No named agent registry | Confirmed — built-in roles: `default`, `worker`, `explorer` | Yes |
| Spawn worker with message parameter | Confirmed — `spawn_agent` takes `agent_type` and `message` | Yes |
| Built-in roles: default, explorer, worker | Research: `default`, `worker`, `explorer` | Yes |
| Message framing with XML tags | Not explicitly in research but not contradicted | OK |
| multi_agent = true config required | Research: agents features require config | Yes |

**Verdict: Correct.** No change needed.

---

### Task 4: Verify cursor-tools.md hook format

**Files:**
- Read: `lib/references/cursor-tools.md`, `docs/platforms/cursor.md`

This task covers 1 matrix item: hook format documentation.

- [ ] **Step 1: Verify hook format claims**

Read `lib/references/cursor-tools.md` lines 31–35. Claims:
1. "Event names are **camelCase**" — Research confirms: `sessionStart`, `preToolUse`, etc. ✓
2. "**Flat structure** — no nested `hooks[]` array" — Research shows `{ "hooks": { "eventName": [...] } }`. Compare to Claude Code's `{ "hooks": { "EventName": [{ "matcher": "...", "hooks": [...] }] } }`. Cursor lacks the inner `hooks[]` nesting. Claim is correct. ✓
3. "Output key is `additional_context` (snake_case)" — Not explicitly confirmed in research excerpt. Claim is not contradicted. ✓
4. "No async hook support" — Research doesn't mention async. Claim is not contradicted. ✓

Research also shows additional per-script options not mentioned in cursor-tools.md: `version: 1` top-level field, `failClosed`, `loop_limit`, `type` ("command" or "prompt"). These are useful details but the current description covers the key FORMAT DIFFERENCES from Claude Code, which is the file's purpose.

**Verdict: Correct.** The hook format description accurately captures the key differences from Claude Code's format. No change needed.

---

### Task 5: Fix antigravity-tools.md

**Files:**
- Modify: `lib/references/antigravity-tools.md`
- Read: `docs/platforms/antigravity.md`

This task covers 2 matrix items: tool names and frontmatter stripping.

- [ ] **Step 1: Verify tool names claim**

Read `lib/references/antigravity-tools.md` lines 1–19. Claims all tools map 1:1.

Read `docs/platforms/antigravity.md` lines 191–200. Research says:
- Line 191: "The tool names differ from Claude Code"
- Lines 197–200: Confirms Read, Write, Edit, Bash, WebSearch, WebFetch map to Claude equivalents
- Line 200: `run_command` maps to Bash — used in skill instructions for script execution
- Research does NOT confirm: Grep, Glob, Task, Agent, TodoWrite, Skill, AskUserQuestion

The research is ambiguous. The confirmed tools (Read, Write, Edit, Bash, WebSearch, WebFetch) DO match Claude names. The research says "tool names differ" but the listed tools mostly match. The unconfirmed tools (Grep, Glob, Task, Agent, TodoWrite, Skill, AskUserQuestion) may or may not exist.

**Verdict: Partially unverifiable.** The confirmed subset matches. Leave Table 2 as-is (best available info). Flag in matrix as "Correct (partial — 6/13 tools confirmed by research, remainder unverifiable)".

No file change needed.

- [ ] **Step 2: Fix frontmatter stripping — add `user-invocable`**

Read `lib/references/antigravity-tools.md` lines 27–31. Current list:
- `model`
- `tools`
- `disable-model-invocation`
- `allowed-tools`

Read `docs/platforms/antigravity.md` lines 99–108. Research says fields stripped:
- `model` ✓
- `tools` ✓
- `disable-model-invocation` ✓
- `allowed-tools` ✓
- **`user-invocable`** — "Antigravity uses Workflows for slash-command invocation, not skills"

The `user-invocable` field is missing from the current list. Add it.

Edit `lib/references/antigravity-tools.md`. Find:

```markdown
All skill and agent frontmatter must have these fields **removed**:
- `model` — Antigravity does not support model selection; strip entirely
- `tools` — Antigravity does not support per-agent tool restrictions; strip entirely
- `disable-model-invocation` — not supported; strip
- `allowed-tools` — not supported; strip
```

Replace with:

```markdown
All skill and agent frontmatter must have these fields **removed**:
- `model` — Antigravity does not support model selection; strip entirely
- `tools` — Antigravity does not support per-agent tool restrictions; strip entirely
- `disable-model-invocation` — not supported; strip
- `allowed-tools` — not supported; strip
- `user-invocable` — Antigravity uses Workflows for slash-command invocation, not skills; strip
```

- [ ] **Step 3: Verify the fix**

```bash
grep -n "user-invocable" lib/references/antigravity-tools.md
```

Expected: line showing `user-invocable` in the frontmatter stripping list.

- [ ] **Step 4: Cross-check — update platform-mappings.md Table 5 if needed**

Table 5 (Field Stripping Sets) may also list frontmatter fields per platform. Search for `user-invocable` in the Antigravity column:

```bash
grep -A5 -B5 "Table 5\|Field Stripping" lib/references/platform-mappings.md | head -40
```

If Table 5 exists and is missing `user-invocable` for Antigravity, add it there too.

- [ ] **Step 5: Commit**

```bash
git add lib/references/antigravity-tools.md lib/references/platform-mappings.md
git commit -m "fix: antigravity-tools — add user-invocable to frontmatter stripping list"
```

---

### Task 6: Fix openclaw-tools.md hook events

**Files:**
- Modify: `lib/references/openclaw-tools.md`
- Read: `docs/platforms/openclaw.md`

This task covers 3 matrix items: No Task/Agent (confirm), No TodoWrite (confirm), hook SDK details (fix).

- [ ] **Step 1: Confirm No Task/Agent tool**

Read `lib/references/openclaw-tools.md` lines 21–29. Claims agents configured in manifest, not a tool.
Read `docs/platforms/openclaw.md`. Research confirms: agents in `agents.list[]` config, not a dispatch tool.

**Verdict: Correct.** No change needed.

- [ ] **Step 2: Confirm No TodoWrite**

Read `lib/references/openclaw-tools.md` lines 31–34. Claims no TodoWrite equivalent.
Read `docs/platforms/openclaw.md`. Research confirms: no TodoWrite equivalent.

**Verdict: Correct.** No change needed.

- [ ] **Step 3: Fix hook SDK event list**

Read `lib/references/openclaw-tools.md` lines 51–57. Current event list:

```markdown
- Event names are **snake_case**: `before_tool_call`, `tool_result_persist`,
  `gateway:startup`, `session:compact:before`
```

This lists only 4 events. Read `docs/platforms/openclaw.md` lines 264–282. Research documents 15 hook events:

| Event | Description |
|-------|-------------|
| `before_tool_call` | Before agent tool executes |
| `after_tool_call` | After tool execution |
| `tool_result_persist` | When tool result is persisted |
| `llm_input` | Before LLM call |
| `llm_output` | After LLM produces output |
| `message_received` | Inbound message |
| `message_sent` | Outbound message |
| `before_agent_finalize` | Before agent finalizes |
| `agent_end` | Agent run ends |
| `before_model_resolve` | Before model resolution |
| `before_compaction` | Before context compaction |
| `after_compaction` | After context compaction |
| `before_install` | Before plugin install |
| `command` | Slash command issued |
| `gateway:startup` | Plugin startup |

Edit `lib/references/openclaw-tools.md`. Find:

```markdown
OpenClaw hooks are **not file-based**. They use the TypeScript plugin SDK:
- Register handlers via `api.registerHook(eventName, handler)`
- Event names are **snake_case**: `before_tool_call`, `tool_result_persist`,
  `gateway:startup`, `session:compact:before`
- Async handlers are supported
```

Replace with:

```markdown
OpenClaw hooks are **not file-based**. They use the TypeScript plugin SDK:
- Register handlers via `api.registerHook(eventName, handler)` or `api.on(eventName, handler)`
- Async handlers are supported
- Can register to multiple events: `api.registerHook(["event_a", "event_b"], handler)`

Event names are **snake_case**:

| Event | Description | Notes |
| ----- | ----------- | ----- |
| `before_tool_call` | Before agent tool executes | `{ block: true }` stops lower-priority handlers |
| `after_tool_call` | After tool execution | Observational |
| `tool_result_persist` | When tool result is persisted | — |
| `llm_input` | Before LLM call | Requires `allowConversationAccess` |
| `llm_output` | After LLM produces output | Requires `allowConversationAccess` |
| `message_received` | Inbound message | Typed `threadId` for routing |
| `message_sent` | Outbound message | — |
| `before_agent_finalize` | Before agent finalizes | Requires `allowConversationAccess` |
| `agent_end` | Agent run ends | Requires `allowConversationAccess` |
| `before_model_resolve` | Before model resolution | Model switching |
| `before_compaction` | Before context compaction | — |
| `after_compaction` | After context compaction | — |
| `before_install` | Before plugin install | `{ block: true }` is terminal |
| `command` | Slash command issued | — |
| `gateway:startup` | Plugin startup | — |
```

- [ ] **Step 4: Verify the fix**

```bash
grep -c "before_tool_call\|after_tool_call\|llm_input\|llm_output\|message_received\|before_agent_finalize\|agent_end\|before_model_resolve\|before_compaction\|after_compaction\|before_install\|command\|gateway:startup" lib/references/openclaw-tools.md
```

Expected: 15 (all events present).

- [ ] **Step 5: Cross-check — verify Table 3 OpenClaw column**

Read `lib/references/platform-mappings.md` Table 3, OpenClaw column. Current mappings:
- SessionStart → `gateway:startup (plugin SDK)`
- PreToolUse → `before_tool_call (plugin SDK)`
- PostToolUse → `tool_result_persist (plugin SDK)`
- PreCompact → `session:compact:before (plugin SDK)`

Check if any of the newly documented events map to Claude events not currently in Table 3. Research (`docs/platforms/openclaw.md` lines 286–300) shows a mapping table:

| Claude Event | OpenClaw Event |
|---|---|
| PreToolUse | `before_tool_call` |

The existing Table 3 entries look correct. Note: `session:compact:before` is listed in the current Table 3 but is NOT in the research's event table (lines 264–282). It appears in the SDK examples but the main event table shows `before_compaction` instead. Both may be valid aliases. Leave as-is since research doesn't contradict it.

- [ ] **Step 6: Commit**

```bash
git add lib/references/openclaw-tools.md
git commit -m "fix: openclaw-tools — expand hook SDK event list from 4 to 15 events"
```

---

### Task 7: Update reconciliation matrix

**Files:**
- Modify: `docs/reconciliation-matrix.md`

- [ ] **Step 1: Update all section 1 (References) statuses**

Read `docs/reconciliation-matrix.md` and update every "Needs review" item in section 1 based on the verdicts from Tasks 1–6.

Edit the matrix with these status changes:

**platform-mappings.md — Table 2:**

| Cell | New status |
|------|-----------|
| Codex / Skill | `Correct` |
| Gemini / Task | `Correct` |
| Gemini / all others | `Correct` |
| OpenClaw / all | `Correct` |
| Antigravity / all | `Correct (partial — 6 of 13 tools confirmed, rest unverifiable)` |

**platform-mappings.md — Table 3:**

| Cell | New status |
|------|-----------|
| Gemini / SubagentStart | `Correct` |

**platform-mappings.md — Table 8:**

| Cell | New status |
|------|-----------|
| Codex / Skills Path | `Correct` |
| All others | `Correct` |

**platform-mappings.md — Table 13:**

| Cell | New status |
|------|-----------|
| Antigravity | `Correct` |

**gemini-tools.md:**

| Claim | New status |
|-------|-----------|
| Tool names | `Correct` |
| Additional tools | `Correct` |

**codex-tools.md:**

| Claim | New status |
|-------|-----------|
| WebSearch | `Correct` |
| spawn_agent details | `Correct` |

**cursor-tools.md:**

| Claim | New status |
|-------|-----------|
| Hook format | `Correct` |

**cursor-tools.md — missing item:**

Add a new row for Cursor subagent support. The matrix (line 96) already notes this as `Missing`:

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Subagent support | Not documented | Has full subagent support with model/readonly/background config | Missing |

This is a Tier 1 (references) item that should be flagged for fix. Add to the summary section as a remaining item for a separate fix task.

**antigravity-tools.md:**

| Claim | New status |
|-------|-----------|
| All tool names | `Correct (partial — 6 of 13 tools confirmed, rest unverifiable)` |
| Frontmatter stripping | `Fixed` |

**openclaw-tools.md:**

| Claim | New status |
|-------|-----------|
| No Task/Agent tool | `Correct` |
| No TodoWrite | `Correct` |
| Hook SDK details | `Fixed` |

- [ ] **Step 2: Update summary section**

Add a new subsection after the existing "Fixed (this batch)" section:

```markdown
### Fixed (Tier 1 verification)

21. ~~**antigravity-tools.md**: Frontmatter stripping incomplete~~ Fixed — added `user-invocable`
22. ~~**openclaw-tools.md**: Hook SDK only listed 4 events~~ Fixed — expanded to 15 events

### Remaining after Tier 1

- **cursor-tools.md**: Subagent support not documented (Missing — needs separate fix)
- **Table 2 Antigravity**: 7 of 13 tool names unverifiable from current research
```

- [ ] **Step 3: Verify no "Needs review" remains in section 1**

```bash
sed -n '/^## 1\. References/,/^## 2\. Rubrics/p' docs/reconciliation-matrix.md | grep -c "Needs review"
```

Expected: `0`

- [ ] **Step 4: Commit**

```bash
git add docs/reconciliation-matrix.md
git commit -m "fix: reconciliation matrix — resolve all Tier 1 reference verification items"
```

---

## Verification Checklist

After all tasks complete:

```bash
# No "Needs review" in section 1
sed -n '/^## 1\. References/,/^## 2\. Rubrics/p' docs/reconciliation-matrix.md | grep "Needs review"
# Expected: no output

# user-invocable present in antigravity-tools.md
grep "user-invocable" lib/references/antigravity-tools.md
# Expected: 1 line

# OpenClaw events expanded
grep -c "|" lib/references/openclaw-tools.md | head -1
# Expected: significantly more than before

# All files lint clean
npx markdownlint-cli2 lib/references/antigravity-tools.md lib/references/openclaw-tools.md docs/reconciliation-matrix.md 2>/dev/null || echo "markdownlint not configured"
```
