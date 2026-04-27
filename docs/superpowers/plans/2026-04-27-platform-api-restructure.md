# Platform API Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace duplicated prose-based reference files with a structured pseudocode library of typed PlatformSpec dictionaries and deterministic lookup functions.

**Architecture:** A shared `platform-api.md` defines the type system, canonical enums, and lookup functions. Six per-platform data files in `platforms/` each declare a complete PlatformSpec dictionary. All consumers (GEMINI.md, AGENTS.md, rubric YAMLs, pattern files, CI) are updated to reference the new paths and use the new lookup vocabulary.

**Tech Stack:** Markdown with pseudocode blocks. No runtime code.

---

## File Structure

**Create:**
- `lib/references/platform-api.md` — type system, enums, lookup functions
- `lib/references/platforms/claude-code.md` — REGISTRY["claude-code"] spec
- `lib/references/platforms/gemini-cli.md` — REGISTRY["gemini-cli"] spec
- `lib/references/platforms/codex.md` — REGISTRY["codex"] spec
- `lib/references/platforms/cursor.md` — REGISTRY["cursor"] spec
- `lib/references/platforms/antigravity.md` — REGISTRY["antigravity"] spec
- `lib/references/platforms/openclaw.md` — REGISTRY["openclaw"] spec
- `lib/patterns/subagent-dispatch.md` — relocated prose from codex-tools.md

**Modify:**
- `GEMINI.md` — update @includes
- `AGENTS.md` — update tool reference pointers
- `CLAUDE.md` — update accuracy constraint reference
- `lib/rubrics/claude-code.yaml` — LOOKUP → function call comments
- `lib/rubrics/codex.yaml` — LOOKUP → function call comments + file references
- `lib/rubrics/gemini-cli.yaml` — LOOKUP → function call comments + file references
- `lib/rubrics/cursor.yaml` — LOOKUP → function call comments
- `lib/rubrics/antigravity.yaml` — LOOKUP → function call comments + file references
- `lib/rubrics/openclaw.yaml` — LOOKUP → function call comments + file references
- `lib/rubrics/rubric-framework.md` — update lookup table pointer
- `lib/patterns/inventory.md` — update sidecar_files list
- `lib/patterns/injection-checks.md` — update Component 2 path
- `lib/patterns/bootstrapping.md` — update sidecar references
- `.github/workflows/ci.yml` — update file existence checks
- `CONTRIBUTING.md` — update skill authoring guidance

**Delete:**
- `lib/references/platform-mappings.md`
- `lib/references/gemini-tools.md`
- `lib/references/codex-tools.md`
- `lib/references/cursor-tools.md`
- `lib/references/antigravity-tools.md`
- `lib/references/openclaw-tools.md`

---

### Task 1: Create platform-api.md

**Files:**
- Create: `lib/references/platform-api.md`

- [ ] **Step 1: Create the directory**

```bash
ls lib/references/
```

Confirm directory exists (it does — contains the old files).

- [ ] **Step 2: Write platform-api.md**

Write `lib/references/platform-api.md` with this content:

````markdown
# Platform API

Structured type system and deterministic lookup functions for cross-platform
portability. Each platform declares a `PlatformSpec` dictionary in
`lib/references/platforms/<platform>.md`. This file defines the schema and API.

---

## Types

```pseudocode
TYPE ToolEntry = {
  name:  string | null,   # platform-native tool name; null = not supported
  notes: string | null,   # brief clarification when needed
}

TYPE HookEvent = {
  name:      string | null,   # platform-native event name; null = no equivalent
  can_block: bool,            # whether this hook can block execution
  notes:     string | null,
}

TYPE PlatformSpec = {
  id:           string,       # "gemini-cli", "codex", "cursor", "antigravity", "openclaw", "claude-code"
  display_name: string,

  # ── Tools ──
  tools:        Dict[Operation, ToolEntry],
  extra_tools:  List[{ name: string, purpose: string }],

  # ── Hooks ──
  hooks: {
    system:        "file" | "sdk" | "none",
    config_path:   string | null,
    event_case:    "PascalCase" | "camelCase" | "snake_case" | null,
    timeout_unit:  "seconds" | "milliseconds" | null,
    async_support: bool,
    structure:     "nested" | "flat" | "sdk" | null,
    output_key:    string | null,
    events:        Dict[CanonicalEvent, HookEvent],
    extra_events:  List[HookEvent],
  },

  # ── Context ──
  context: {
    primary_file:    string,
    secondary_files: List[string],
    priority_note:   string | null,
  },

  # ── Skills ──
  skills: {
    path:        string,
    agents_path: string,
    invocation:  string,
  },

  # ── Manifest ──
  manifest: {
    path:            string | null,
    required_fields: List[string],
  },

  # ── Frontmatter ──
  frontmatter: {
    strip:        List[string],
    keep:         List[string],
    model_format: string | null,
  },

  # ── MCP ──
  mcp: {
    config_path: string | null,
    notes:       string | null,
  },

  # ── Path Variables ──
  paths: {
    plugin_root:   string | null,
    hooks_scripts: string | null,
  },
}
```

---

## Canonical Enums

```pseudocode
Operation = ENUM(
  "file.read",
  "file.write",
  "file.edit",
  "shell.execute",
  "search.content",
  "search.files",
  "subagent.dispatch",
  "task.track",
  "skill.invoke",
  "web.search",
  "web.fetch",
  "user.ask",
)

CanonicalEvent = ENUM(
  "session.start",
  "tool.before",
  "tool.after",
  "tool.after_failure",
  "subagent.start",
  "subagent.stop",
  "compact.before",
  "session.stop",
  "prompt.before_submit",
)
```

---

## Registry

```pseudocode
REGISTRY: Dict[string, PlatformSpec] = {}
  # Populated by per-platform data files in lib/references/platforms/.
```

---

## Lookup Functions

```pseudocode
# ── Core lookups ──

FUNCTION tool_name(platform, op)
  RETURNS the platform-native tool name for a canonical operation, or null.
  LOOKUP REGISTRY[platform].tools[op].name

FUNCTION hook_event(platform, event)
  RETURNS the platform-native hook event name, or null.
  LOOKUP REGISTRY[platform].hooks.events[event].name

FUNCTION hook_can_block(platform, event)
  RETURNS whether the hook for this event can block execution.
  entry = REGISTRY[platform].hooks.events[event]
  RETURN entry.name IS NOT null AND entry.can_block

# ── Bulk queries ──

FUNCTION supported_tools(platform)
  RETURNS list of canonical operations this platform supports.
  FOR EACH op, entry IN REGISTRY[platform].tools:
    INCLUDE op WHERE entry.name IS NOT null

FUNCTION unsupported_tools(platform)
  RETURNS list of canonical operations this platform cannot perform.
  FOR EACH op, entry IN REGISTRY[platform].tools:
    INCLUDE op WHERE entry.name IS null

FUNCTION has_hooks(platform)
  RETURN REGISTRY[platform].hooks.system != "none"

FUNCTION strip_fields(platform)
  RETURN REGISTRY[platform].frontmatter.strip

# ── Cross-platform ──

FUNCTION platforms_supporting(op)
  RETURNS all platform IDs that support a given operation.
  FOR EACH pid, spec IN REGISTRY:
    INCLUDE pid WHERE spec.tools[op].name IS NOT null

FUNCTION tool_mapping_table(op)
  RETURNS { platform_id: tool_name } for one operation across all platforms.
  FOR EACH pid, spec IN REGISTRY:
    EMIT pid -> spec.tools[op].name

FUNCTION diff_from(source, target)
  RETURNS what changes when porting from source to target platform.
  src = REGISTRY[source]
  tgt = REGISTRY[target]
  renamed_tools:
    FOR EACH op IN Operation
      WHERE src.tools[op].name != tgt.tools[op].name
        AND tgt.tools[op].name IS NOT null:
      EMIT op -> { from: src.tools[op].name, to: tgt.tools[op].name }
  lost_tools:
    FOR EACH op IN Operation
      WHERE src.tools[op].name IS NOT null
        AND tgt.tools[op].name IS null:
      EMIT op
  strip_fields: tgt.frontmatter.strip
  model_format: tgt.frontmatter.model_format
```
````

- [ ] **Step 3: Verify the file**

```bash
wc -l lib/references/platform-api.md
```

Expected: ~155 lines.

- [ ] **Step 4: Commit**

```bash
git add lib/references/platform-api.md
git commit -m "feat: create platform-api.md with type system and lookup functions"
```

---

### Task 2: Create claude-code.md platform spec

**Files:**
- Create: `lib/references/platforms/claude-code.md`

- [ ] **Step 1: Create the platforms directory**

```bash
mkdir -p lib/references/platforms
```

- [ ] **Step 2: Write claude-code.md**

Write `lib/references/platforms/claude-code.md` with this content:

````markdown
# Claude Code Platform Specification

```pseudocode
REGISTRY["claude-code"] = {

  id: "claude-code",
  display_name: "Claude Code",

  # ── Tools ──

  tools: {
    "file.read":          { name: "Read",             notes: null },
    "file.write":         { name: "Write",            notes: null },
    "file.edit":          { name: "Edit",             notes: null },
    "shell.execute":      { name: "Bash",             notes: null },
    "search.content":     { name: "Grep",             notes: null },
    "search.files":       { name: "Glob",             notes: null },
    "subagent.dispatch":  { name: "Agent",            notes: "also Task for background dispatch" },
    "task.track":         { name: "TodoWrite",        notes: null },
    "skill.invoke":       { name: "Skill",            notes: null },
    "web.search":         { name: "WebSearch",        notes: null },
    "web.fetch":          { name: "WebFetch",         notes: null },
    "user.ask":           { name: "AskUserQuestion",  notes: null },
  },

  extra_tools: [
    { name: "Monitor",       purpose: "run background command, stream output lines back" },
    { name: "NotebookEdit",  purpose: "modify Jupyter notebook cells" },
    { name: "LSP",           purpose: "code intelligence: jump to def, find refs, type errors" },
    { name: "EnterWorktree", purpose: "create/switch to git worktree" },
    { name: "ExitWorktree",  purpose: "return to main worktree" },
    { name: "CronCreate",    purpose: "schedule recurring/one-shot prompt" },
    { name: "TaskCreate",    purpose: "create task in session checklist" },
    { name: "ToolSearch",    purpose: "search and load deferred tools" },
  ],

  # ── Hooks ──

  hooks: {
    system: "file",
    config_path: "hooks/hooks.json",
    event_case: "PascalCase",
    timeout_unit: "seconds",
    async_support: true,
    structure: "nested",
    output_key: "hookSpecificOutput.additionalContext",

    events: {
      "session.start":        { name: "SessionStart",        can_block: false, notes: null },
      "tool.before":          { name: "PreToolUse",          can_block: true,  notes: null },
      "tool.after":           { name: "PostToolUse",         can_block: false, notes: null },
      "tool.after_failure":   { name: "PostToolUseFailure",  can_block: false, notes: null },
      "subagent.start":       { name: "SubagentStart",       can_block: false, notes: null },
      "subagent.stop":        { name: "SubagentStop",        can_block: false, notes: null },
      "compact.before":       { name: "PreCompact",          can_block: false, notes: null },
      "session.stop":         { name: "Stop",                can_block: false, notes: null },
      "prompt.before_submit": { name: "UserPromptSubmit",    can_block: false, notes: null },
    },

    extra_events: [],
  },

  # ── Context ──

  context: {
    primary_file: "CLAUDE.md",
    secondary_files: [],
    priority_note: null,
  },

  # ── Skills ──

  skills: {
    path: "skills/",
    agents_path: "agents/",
    invocation: "Skill tool",
  },

  # ── Manifest ──

  manifest: {
    path: ".claude-plugin/plugin.json",
    required_fields: ["name", "version", "description", "author.name", "author.email"],
  },

  # ── Frontmatter ──

  frontmatter: {
    strip: [],
    keep: ["disable-model-invocation", "allowed-tools", "user-invocable"],
    model_format: "claude-shortname",
    # opus, sonnet, haiku
  },

  # ── MCP ──

  mcp: {
    config_path: ".mcp.json",
    notes: "dot-prefixed; supports resources and tools",
  },

  # ── Path Variables ──

  paths: {
    plugin_root: "${CLAUDE_PLUGIN_ROOT}",
    hooks_scripts: "/hooks/scripts/",
  },
}
```
````

- [ ] **Step 3: Commit**

```bash
git add lib/references/platforms/claude-code.md
git commit -m "feat: create claude-code.md platform spec"
```

---

### Task 3: Create gemini-cli.md platform spec

**Files:**
- Create: `lib/references/platforms/gemini-cli.md`

- [ ] **Step 1: Write gemini-cli.md**

Write `lib/references/platforms/gemini-cli.md` with this content:

````markdown
# Gemini CLI Platform Specification

```pseudocode
REGISTRY["gemini-cli"] = {

  id: "gemini-cli",
  display_name: "Gemini CLI",

  # ── Tools ──

  tools: {
    "file.read":          { name: "read_file",           notes: null },
    "file.write":         { name: "write_file",          notes: null },
    "file.edit":          { name: "replace",             notes: null },
    "shell.execute":      { name: "run_shell_command",   notes: null },
    "search.content":     { name: "grep_search",         notes: null },
    "search.files":       { name: "glob",                notes: null },
    "subagent.dispatch":  { name: "@agent-name",         notes: "mention in prompt or automatic routing" },
    "task.track":         { name: "write_todos",         notes: null },
    "skill.invoke":       { name: "activate_skill",      notes: null },
    "web.search":         { name: "google_web_search",   notes: null },
    "web.fetch":          { name: "web_fetch",           notes: null },
    "user.ask":           { name: "ask_user",            notes: null },
  },

  extra_tools: [
    { name: "read_many_files",   purpose: "read multiple files at once (triggered by @path)" },
    { name: "list_directory",    purpose: "list files and subdirectories" },
    { name: "save_memory",       purpose: "persist facts to GEMINI.md across sessions" },
    { name: "get_internal_docs", purpose: "access Gemini CLI own documentation" },
    { name: "complete_task",     purpose: "subagent-only: finalize and return result" },
    { name: "enter_plan_mode",   purpose: "switch to read-only research mode" },
    { name: "exit_plan_mode",    purpose: "leave plan mode" },
    { name: "browser_agent",     purpose: "experimental web browser automation" },
  ],

  # ── Hooks ──

  hooks: {
    system: "file",
    config_path: "settings.json or extension manifest hooks field",
    event_case: "PascalCase",
    timeout_unit: "milliseconds",
    async_support: false,
    structure: "nested",
    output_key: "hookSpecificOutput",

    events: {
      "session.start":        { name: "SessionStart",        can_block: false, notes: null },
      "tool.before":          { name: "BeforeTool",          can_block: true,  notes: "can rewrite args" },
      "tool.after":           { name: "AfterTool",           can_block: true,  notes: "supports tail calls" },
      "tool.after_failure":   { name: null,                  can_block: false, notes: null },
      "subagent.start":       { name: null,                  can_block: false, notes: null },
      "subagent.stop":        { name: null,                  can_block: false, notes: null },
      "compact.before":       { name: "PreCompress",         can_block: false, notes: null },
      "session.stop":         { name: "AfterAgent",          can_block: false, notes: null },
      "prompt.before_submit": { name: null,                  can_block: false, notes: null },
    },

    extra_events: [
      { name: "BeforeModel",         can_block: true,  notes: "before LLM request" },
      { name: "AfterModel",          can_block: true,  notes: "after LLM response" },
      { name: "BeforeToolSelection", can_block: true,  notes: "filter available tools" },
      { name: "Notification",        can_block: false, notes: "system notifications" },
    ],
  },

  # ── Context ──

  context: {
    primary_file: "GEMINI.md",
    secondary_files: [],
    priority_note: null,
  },

  # ── Skills ──

  skills: {
    path: "skills/",
    agents_path: "agents/",
    invocation: "activate_skill tool",
  },

  # ── Manifest ──

  manifest: {
    path: "gemini-extension.json",
    required_fields: ["name", "version", "description", "contextFileName"],
  },

  # ── Frontmatter ──

  frontmatter: {
    strip: ["disable-model-invocation", "allowed-tools", "user-invocable"],
    keep: [],
    model_format: "platform-native",
    # gemini-2.5-pro, gemini-2.5-flash, gemini-2.0-flash-lite
  },

  # ── MCP ──

  mcp: {
    config_path: "gemini-extension.json -> mcpServers",
    notes: "extension-bundled MCP servers",
  },

  # ── Path Variables ──

  paths: {
    plugin_root: "${extensionPath}${/}",
    hooks_scripts: "/scripts/",
  },
}
```
````

- [ ] **Step 2: Commit**

```bash
git add lib/references/platforms/gemini-cli.md
git commit -m "feat: create gemini-cli.md platform spec"
```

---

### Task 4: Create codex.md platform spec

**Files:**
- Create: `lib/references/platforms/codex.md`

- [ ] **Step 1: Write codex.md**

Write `lib/references/platforms/codex.md` with this content:

````markdown
# Codex Platform Specification

```pseudocode
REGISTRY["codex"] = {

  id: "codex",
  display_name: "Codex",

  # ── Tools ──

  tools: {
    "file.read":          { name: "Read",              notes: "built-in, no named tool in some contexts" },
    "file.write":         { name: "Write",             notes: "uses apply_patch internally" },
    "file.edit":          { name: "apply_patch",       notes: "unified file write mechanism" },
    "shell.execute":      { name: "Bash",              notes: "sandboxed execution" },
    "search.content":     { name: "Grep",              notes: null },
    "search.files":       { name: "Glob",              notes: null },
    "subagent.dispatch":  { name: "spawn_agent",       notes: "generic roles: default, worker, explorer" },
    "task.track":         { name: "update_plan",       notes: null },
    "skill.invoke":       { name: null,                notes: "skills load natively via $skill-name" },
    "web.search":         { name: "WebSearch",         notes: "live or cached mode" },
    "web.fetch":          { name: null,                notes: "no direct equivalent; use MCP" },
    "user.ask":           { name: "AskUserQuestion",   notes: null },
  },

  extra_tools: [
    { name: "report_agent_job_result", purpose: "worker result reporting for CSV batch jobs" },
  ],

  # ── Hooks ──

  hooks: {
    system: "file",
    config_path: "hooks.json or config.toml [hooks]",
    event_case: "PascalCase",
    timeout_unit: "seconds",
    async_support: false,
    structure: "nested",
    output_key: "permissionDecision / decision",

    events: {
      "session.start":        { name: "SessionStart",       can_block: false, notes: null },
      "tool.before":          { name: "PreToolUse",         can_block: true,  notes: "permissionDecision: deny" },
      "tool.after":           { name: "PostToolUse",        can_block: true,  notes: "decision: block replaces output" },
      "tool.after_failure":   { name: null,                 can_block: false, notes: null },
      "subagent.start":       { name: null,                 can_block: false, notes: null },
      "subagent.stop":        { name: null,                 can_block: false, notes: null },
      "compact.before":       { name: null,                 can_block: false, notes: null },
      "session.stop":         { name: "Stop",               can_block: true,  notes: "decision: block continues session" },
      "prompt.before_submit": { name: "UserPromptSubmit",   can_block: false, notes: "matcher ignored" },
    },

    extra_events: [
      { name: "PermissionRequest", can_block: true, notes: "controls approval flow; no Claude Code equivalent" },
    ],
  },

  # ── Context ──

  context: {
    primary_file: "AGENTS.md",
    secondary_files: [".codex/INSTALL.md"],
    priority_note: null,
  },

  # ── Skills ──

  skills: {
    path: ".agents/skills/",
    agents_path: ".codex/agents/",
    invocation: "native loading via $skill-name",
  },

  # ── Manifest ──

  manifest: {
    path: ".codex-plugin/plugin.json",
    required_fields: ["name", "version", "description"],
  },

  # ── Frontmatter ──

  frontmatter: {
    strip: ["disable-model-invocation", "allowed-tools", "user-invocable"],
    keep: [],
    model_format: "codex-native",
    # gpt-5.4, gpt-5.4-mini
  },

  # ── MCP ──

  mcp: {
    config_path: ".mcp.json or config.toml [mcp]",
    notes: "supports stdio and SSE transports",
  },

  # ── Path Variables ──

  paths: {
    plugin_root: null,
    hooks_scripts: null,
  },
}
```

### Codex-specific notes

- Hooks require `codex_hooks = true` feature flag in `config.toml`.
- Subagent dispatch requires `multi_agent = true` feature flag.
- See `lib/patterns/subagent-dispatch.md` for message framing and named
  agent dispatch patterns.
- Default hook timeout: 600 seconds (vs Claude Code's 60 seconds).
````

- [ ] **Step 2: Commit**

```bash
git add lib/references/platforms/codex.md
git commit -m "feat: create codex.md platform spec"
```

---

### Task 5: Create cursor.md platform spec

**Files:**
- Create: `lib/references/platforms/cursor.md`

- [ ] **Step 1: Write cursor.md**

Write `lib/references/platforms/cursor.md` with this content:

````markdown
# Cursor Platform Specification

```pseudocode
REGISTRY["cursor"] = {

  id: "cursor",
  display_name: "Cursor",

  # ── Tools ──

  tools: {
    "file.read":          { name: "Read",             notes: null },
    "file.write":         { name: "Write",            notes: null },
    "file.edit":          { name: "Edit",             notes: null },
    "shell.execute":      { name: "Bash",             notes: null },
    "search.content":     { name: "Grep",             notes: null },
    "search.files":       { name: "Glob",             notes: null },
    "subagent.dispatch":  { name: "Agent",            notes: "also Task; full subagent support" },
    "task.track":         { name: "TodoWrite",        notes: null },
    "skill.invoke":       { name: "Skill",            notes: "/add-plugin installs, skills load natively" },
    "web.search":         { name: "WebSearch",        notes: null },
    "web.fetch":          { name: "WebFetch",         notes: null },
    "user.ask":           { name: "AskUserQuestion",  notes: null },
  },

  extra_tools: [],

  # ── Hooks ──

  hooks: {
    system: "file",
    config_path: "hooks/hooks-cursor.json",
    event_case: "camelCase",
    timeout_unit: "seconds",
    async_support: false,
    structure: "flat",
    output_key: "additional_context",

    events: {
      "session.start":        { name: "sessionStart",        can_block: false, notes: null },
      "tool.before":          { name: "preToolUse",          can_block: true,  notes: null },
      "tool.after":           { name: "postToolUse",         can_block: false, notes: null },
      "tool.after_failure":   { name: "postToolUseFailure",  can_block: false, notes: null },
      "subagent.start":       { name: "subagentStart",       can_block: true,  notes: null },
      "subagent.stop":        { name: "subagentStop",        can_block: false, notes: "can trigger followup_message" },
      "compact.before":       { name: "preCompact",          can_block: false, notes: null },
      "session.stop":         { name: "stop",                can_block: false, notes: "can trigger followup_message" },
      "prompt.before_submit": { name: "beforeSubmitPrompt",  can_block: true,  notes: null },
    },

    extra_events: [
      { name: "sessionEnd",           can_block: false, notes: "fire-and-forget" },
      { name: "beforeShellExecution",  can_block: true,  notes: "before shell command" },
      { name: "afterShellExecution",   can_block: false, notes: "after shell command" },
      { name: "beforeMCPExecution",    can_block: true,  notes: "before MCP tool call" },
      { name: "afterMCPExecution",     can_block: false, notes: "after MCP tool call" },
      { name: "beforeReadFile",        can_block: true,  notes: "before file read" },
      { name: "afterFileEdit",         can_block: false, notes: "after file edit" },
      { name: "afterAgentResponse",    can_block: false, notes: "after assistant message" },
      { name: "afterAgentThought",     can_block: false, notes: "after thinking block" },
      { name: "beforeTabFileRead",     can_block: true,  notes: "Tab: before file read" },
      { name: "afterTabFileEdit",      can_block: false, notes: "Tab: after file edit" },
    ],
  },

  # ── Context ──

  context: {
    primary_file: "AGENTS.md",
    secondary_files: [".cursor/rules/*.mdc"],
    priority_note: null,
  },

  # ── Skills ──

  skills: {
    path: "skills/",
    agents_path: "agents/",
    invocation: "Skill tool",
  },

  # ── Manifest ──

  manifest: {
    path: ".cursor-plugin/plugin.json",
    required_fields: ["name", "displayName", "description", "version", "author"],
  },

  # ── Frontmatter ──

  frontmatter: {
    strip: ["allowed-tools", "user-invocable"],
    keep: ["disable-model-invocation"],
    model_format: "inherit",
    # always "inherit" — defers to user's model selection
  },

  # ── MCP ──

  mcp: {
    config_path: "mcp.json",
    notes: "no dot prefix; no MCP Resources support",
  },

  # ── Path Variables ──

  paths: {
    plugin_root: "${CURSOR_PLUGIN_ROOT}",
    hooks_scripts: "/scripts/",
  },
}
```

### Cursor-specific notes

- Cursor hooks use `"version": 1` at top level of hooks-cursor.json.
- Flat hook structure: no nested `hooks[]` array; each entry has `event`,
  `matcher`, `command` at top level.
- Custom agents: `.cursor/agents/*.md` (project) or `~/.cursor/agents/`
  (global). Frontmatter fields: name, description, model, readonly,
  is_background.
- Built-in subagents: explore, bash, browser.
- Async subagents available in Cursor 2.5+.
````

- [ ] **Step 2: Commit**

```bash
git add lib/references/platforms/cursor.md
git commit -m "feat: create cursor.md platform spec"
```

---

### Task 6: Create antigravity.md platform spec

**Files:**
- Create: `lib/references/platforms/antigravity.md`

- [ ] **Step 1: Write antigravity.md**

Write `lib/references/platforms/antigravity.md` with this content:

````markdown
# Antigravity Platform Specification

```pseudocode
REGISTRY["antigravity"] = {

  id: "antigravity",
  display_name: "Antigravity",

  # ── Tools ──

  tools: {
    "file.read":          { name: "view_file",              notes: null },
    "file.write":         { name: "write_to_file",          notes: null },
    "file.edit":          { name: "replace_file_content",   notes: "also multi_replace_file_content" },
    "shell.execute":      { name: "run_command",            notes: "PowerShell on Windows" },
    "search.content":     { name: "grep_search",            notes: "ripgrep-based" },
    "search.files":       { name: "find_by_name",           notes: "fd with glob patterns" },
    "subagent.dispatch":  { name: null,                     notes: "browser_subagent for browser tasks only" },
    "task.track":         { name: null,                     notes: null },
    "skill.invoke":       { name: null,                     notes: "skills auto-activate via semantic matching" },
    "web.search":         { name: "search_web",             notes: "with citations" },
    "web.fetch":          { name: "read_url_content",       notes: null },
    "user.ask":           { name: null,                     notes: null },
  },

  extra_tools: [
    { name: "codebase_search",       purpose: "semantic code search (not pattern-based)" },
    { name: "search_in_file",        purpose: "semantic search within a specific file" },
    { name: "view_code_item",        purpose: "view specific code node/function by name" },
    { name: "view_file_outline",     purpose: "show file structure/outline" },
    { name: "view_content_chunk",    purpose: "view document chunks by position" },
    { name: "list_dir",              purpose: "list directory contents" },
    { name: "command_status",        purpose: "check status of background terminal commands" },
    { name: "read_terminal",         purpose: "read terminal output by process ID" },
    { name: "send_command_input",    purpose: "send stdin to running processes" },
    { name: "generate_image",        purpose: "create or edit images from text prompts" },
    { name: "list_resources",        purpose: "show available MCP server resources" },
    { name: "read_resource",         purpose: "retrieve MCP resource contents" },
    { name: "browser_subagent",      purpose: "browser automation (click, scroll, type, screenshots, recording)" },
  ],

  # ── Hooks ──

  hooks: {
    system: "none",
    config_path: null,
    event_case: null,
    timeout_unit: null,
    async_support: false,
    structure: null,
    output_key: null,

    events: {
      "session.start":        { name: null, can_block: false, notes: null },
      "tool.before":          { name: null, can_block: false, notes: null },
      "tool.after":           { name: null, can_block: false, notes: null },
      "tool.after_failure":   { name: null, can_block: false, notes: null },
      "subagent.start":       { name: null, can_block: false, notes: null },
      "subagent.stop":        { name: null, can_block: false, notes: null },
      "compact.before":       { name: null, can_block: false, notes: null },
      "session.stop":         { name: null, can_block: false, notes: null },
      "prompt.before_submit": { name: null, can_block: false, notes: null },
    },

    extra_events: [],
  },

  # ── Context ──

  context: {
    primary_file: "AGENTS.md",
    secondary_files: [".agents/rules/*.md"],
    priority_note: "GEMINI.md is also loaded if present (Antigravity-native)",
  },

  # ── Skills ──

  skills: {
    path: ".agents/skills/",
    agents_path: ".agent/rules/",
    invocation: "auto-discover via semantic matching",
  },

  # ── Manifest ──

  manifest: {
    path: "package.json",
    required_fields: ["name", "displayName", "version", "description", "publisher"],
  },

  # ── Frontmatter ──

  frontmatter: {
    strip: ["model", "tools", "disable-model-invocation", "allowed-tools", "user-invocable"],
    keep: [],
    model_format: null,
    # model field stripped entirely
  },

  # ── MCP ──

  mcp: {
    config_path: null,
    notes: "MCP configured via Antigravity settings UI, not file-based",
  },

  # ── Path Variables ──

  paths: {
    plugin_root: null,
    hooks_scripts: null,
  },
}
```

### Antigravity-specific notes

- ALL tool names differ from Claude Code (every single one is renamed).
- No hook system at all.
- Antigravity uses Workflows (`.agents/workflows/*.md`) for slash-command
  style invocation instead of `user-invocable` frontmatter.
- Skills auto-activate via semantic matching against descriptions.
- Legacy path `.agent/` (singular) also works but `.agents/` (plural)
  is preferred.
````

- [ ] **Step 2: Commit**

```bash
git add lib/references/platforms/antigravity.md
git commit -m "feat: create antigravity.md platform spec"
```

---

### Task 7: Create openclaw.md platform spec

**Files:**
- Create: `lib/references/platforms/openclaw.md`

- [ ] **Step 1: Write openclaw.md**

Write `lib/references/platforms/openclaw.md` with this content:

````markdown
# OpenClaw Platform Specification

```pseudocode
REGISTRY["openclaw"] = {

  id: "openclaw",
  display_name: "OpenClaw",

  # ── Tools ──

  tools: {
    "file.read":          { name: "Read",             notes: null },
    "file.write":         { name: "Write",            notes: null },
    "file.edit":          { name: "Edit",             notes: null },
    "shell.execute":      { name: "Bash",             notes: null },
    "search.content":     { name: "Grep",             notes: null },
    "search.files":       { name: "Glob",             notes: null },
    "subagent.dispatch":  { name: null,               notes: "agents declared in agents.list[] manifest config" },
    "task.track":         { name: null,               notes: null },
    "skill.invoke":       { name: null,               notes: "skills load natively into prompt" },
    "web.search":         { name: "WebSearch",        notes: null },
    "web.fetch":          { name: "WebFetch",         notes: null },
    "user.ask":           { name: "AskUserQuestion",  notes: null },
  },

  extra_tools: [],

  # ── Hooks ──

  hooks: {
    system: "sdk",
    config_path: null,
    event_case: "snake_case",
    timeout_unit: null,
    async_support: true,
    structure: "sdk",
    output_key: null,

    events: {
      "session.start":        { name: "gateway:startup",          can_block: false, notes: null },
      "tool.before":          { name: "before_tool_call",         can_block: true,  notes: "{ block: true } is terminal" },
      "tool.after":           { name: "after_tool_call",          can_block: false, notes: null },
      "tool.after_failure":   { name: null,                       can_block: false, notes: null },
      "subagent.start":       { name: null,                       can_block: false, notes: null },
      "subagent.stop":        { name: null,                       can_block: false, notes: null },
      "compact.before":       { name: "session:compact:before",   can_block: false, notes: null },
      "session.stop":         { name: null,                       can_block: false, notes: null },
      "prompt.before_submit": { name: null,                       can_block: false, notes: null },
    },

    extra_events: [
      { name: "tool_result_persist",     can_block: false, notes: "tool result persistence" },
      { name: "llm_input",              can_block: false, notes: "before LLM call; requires allowConversationAccess" },
      { name: "llm_output",             can_block: false, notes: "after LLM produces output" },
      { name: "message_received",       can_block: false, notes: "inbound message; typed threadId" },
      { name: "message_sent",           can_block: false, notes: "outbound message" },
      { name: "message_sending",        can_block: true,  notes: "{ cancel: true } is terminal" },
      { name: "before_agent_finalize",  can_block: false, notes: "requires allowConversationAccess" },
      { name: "agent_end",             can_block: false, notes: "requires allowConversationAccess" },
      { name: "before_model_resolve",   can_block: false, notes: "model switching" },
      { name: "before_compaction",      can_block: false, notes: null },
      { name: "after_compaction",       can_block: false, notes: null },
      { name: "before_install",         can_block: true,  notes: "{ block: true } is terminal" },
      { name: "command",                can_block: false, notes: "slash command issued" },
    ],
  },

  # ── Context ──

  context: {
    primary_file: "AGENTS.md",
    secondary_files: [],
    priority_note: "also loads SOUL.md, TOOLS.md, IDENTITY.md, USER.md, HEARTBEAT.md, MEMORY.md (user workspace files, not plugin output)",
  },

  # ── Skills ──

  skills: {
    path: "skills/",
    agents_path: "agents.list[] in manifest",
    invocation: "native loading into prompt",
  },

  # ── Manifest ──

  manifest: {
    path: "openclaw.plugin.json",
    required_fields: ["id", "configSchema"],
  },

  # ── Frontmatter ──

  frontmatter: {
    strip: ["disable-model-invocation", "allowed-tools"],
    keep: [],
    model_format: "provider/model",
    # anthropic/claude-opus-4-6, anthropic/claude-sonnet-4-5, anthropic/claude-haiku-4-5
  },

  # ── MCP ──

  mcp: {
    config_path: "openclaw.plugin.json -> mcp block",
    notes: "embedded in manifest",
  },

  # ── Path Variables ──

  paths: {
    plugin_root: null,
    hooks_scripts: null,
  },
}
```

### OpenClaw-specific notes

- Hooks are TypeScript SDK-based: `api.registerHook(event, handler)` or
  `api.on(event, handler)`. No file-based hook config.
- Non-bundled conversation hooks require
  `plugins.entries.<id>.hooks.allowConversationAccess=true`.
- Full plugins also need `package.json` with `openclaw.extensions` and
  `openclaw.compat`.
- Auto-detects Claude, Codex, and Cursor bundle layouts.
````

- [ ] **Step 2: Commit**

```bash
git add lib/references/platforms/openclaw.md
git commit -m "feat: create openclaw.md platform spec"
```

---

### Task 8: Create subagent-dispatch.md

**Files:**
- Create: `lib/patterns/subagent-dispatch.md`
- Source: `lib/references/codex-tools.md:24-109` (relocate prose)

- [ ] **Step 1: Write subagent-dispatch.md**

Write `lib/patterns/subagent-dispatch.md` with the content from `lib/references/codex-tools.md` sections "Subagent dispatch requires multi-agent support", "Named agent dispatch", "Environment Detection", and "Codex App Finishing":

```markdown
# Subagent Dispatch Patterns

Cross-platform patterns for dispatching subagents from skills that use
Claude Code's `Task` or `Agent` tools. Referenced by rubric conditions and
skill pseudocode.

---

## Codex: Named Agent Dispatch

Claude Code skills reference named agent types like `superpowers:code-reviewer`.
Codex does not have a named agent registry — `spawn_agent` creates generic agents
from built-in roles (`default`, `explorer`, `worker`).

When a skill says to dispatch a named agent type:

1. Find the agent's prompt file (e.g., `agents/code-reviewer.md` or the skill's
   local prompt template like `code-quality-reviewer-prompt.md`)
2. Read the prompt content
3. Fill any template placeholders (`{BASE_SHA}`, `{WHAT_WAS_IMPLEMENTED}`, etc.)
4. Spawn a `worker` agent with the filled content as the `message`

| Skill instruction | Codex equivalent |
| ----------------- | ---------------- |
| `Task tool (superpowers:code-reviewer)` | `spawn_agent(agent_type="worker", message=...)` with `code-reviewer.md` content |
| `Task tool (general-purpose)` with inline prompt | `spawn_agent(message=...)` with the same prompt |

### Message framing

The `message` parameter is user-level input, not a system prompt. Structure it
for maximum instruction adherence:

    Your task is to perform the following. Follow the instructions below exactly.

    <agent-instructions>
    [filled prompt content from the agent's .md file]
    </agent-instructions>

    Execute this now. Output ONLY the structured response following the format
    specified in the instructions above.

- Use task-delegation framing ("Your task is...") rather than persona framing ("You are...")
- Wrap instructions in XML tags — the model treats tagged blocks as authoritative
- End with an explicit execution directive to prevent summarization of the instructions

### When this workaround can be removed

This approach compensates for Codex's plugin system not yet supporting an `agents`
field in `plugin.json`. When `RawPluginManifest` gains an `agents` field, the
plugin can symlink to `agents/` (mirroring the existing `skills/` symlink) and
skills can dispatch named agent types directly.

---

## Codex: Multi-Agent Feature Flag

Subagent dispatch requires the multi-agent feature flag:

    # ~/.codex/config.toml
    [features]
    multi_agent = true

This enables `spawn_agent`, `wait`, and `close_agent`.

---

## Environment Detection

Skills that create worktrees or finish branches should detect their
environment with read-only git commands before proceeding:

    GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
    GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
    BRANCH=$(git branch --show-current)

- `GIT_DIR != GIT_COMMON` → already in a linked worktree (skip creation)
- `BRANCH` empty → detached HEAD (cannot branch/push/PR from sandbox)

See `using-git-worktrees` Step 0 and `finishing-a-development-branch`
Step 1 for how each skill uses these signals.

---

## Codex App Finishing

When the sandbox blocks branch/push operations (detached HEAD in an
externally managed worktree), the agent commits all work and informs
the user to use the App's native controls:

- **"Create branch"** — names the branch, then commit/push/PR via App UI
- **"Hand off to local"** — transfers work to the user's local checkout

The agent can still run tests, stage files, and output suggested branch
names, commit messages, and PR descriptions for the user to copy.
```

- [ ] **Step 2: Commit**

```bash
git add lib/patterns/subagent-dispatch.md
git commit -m "feat: create subagent-dispatch.md with relocated Codex patterns"
```

---

### Task 9: Update context files (GEMINI.md, AGENTS.md, CLAUDE.md)

**Files:**
- Modify: `GEMINI.md:7-16`
- Modify: `AGENTS.md:28-45`
- Modify: `CLAUDE.md:17`

- [ ] **Step 1: Update GEMINI.md**

Replace the Tool References section (lines 10-16):

**Before:**
```markdown
## Tool References

@./lib/references/gemini-tools.md
@./lib/references/codex-tools.md
@./lib/references/cursor-tools.md
@./lib/references/antigravity-tools.md
@./lib/references/openclaw-tools.md
```

**After:**
```markdown
## Platform API

@./lib/references/platform-api.md
@./lib/references/platforms/gemini-cli.md
@./lib/references/platforms/codex.md
@./lib/references/platforms/cursor.md
@./lib/references/platforms/antigravity.md
@./lib/references/platforms/openclaw.md
```

- [ ] **Step 2: Update AGENTS.md**

Replace the tool references section (lines 28-45):

**Before:**
```markdown
See `lib/references/` for platform-specific tool mapping tables:
- `codex-tools.md` — Codex (spawn_agent, update_plan, message framing)
- `gemini-tools.md` — Gemini CLI (read_file, replace, run_shell_command, etc.)
- `cursor-tools.md` — Cursor (same names, different hooks/model/context)
- `antigravity-tools.md` — Antigravity (same names, stripped frontmatter)
- `openclaw-tools.md` — OpenClaw (agents.list[], no TodoWrite/Skill, SDK hooks)

## Platform Accuracy Constraint

Every platform-specific claim in this repo must be consistent with the researched
platform reference docs. Before changing any file that makes platform-specific
claims, cross-reference:

1. **Research docs** — `docs/platforms/*.md` (sourced, with inline citations)
2. **Reconciliation matrix** — `docs/reconciliation-matrix.md` (tracks known
   discrepancies and their fix status)
3. **Canonical lookup tables** — `lib/references/platform-mappings.md` (single
   source of truth consumed by rubrics)
```

**After:**
```markdown
Platform-specific tool names, hooks, manifests, and frontmatter rules are defined
as structured `PlatformSpec` dictionaries in `lib/references/platforms/`. The type
system and lookup functions are in `lib/references/platform-api.md`.

Use `tool_name(platform, op)` for tool mappings, `hook_event(platform, event)`
for hook events, and `strip_fields(platform)` for frontmatter stripping.

## Platform Accuracy Constraint

Every platform-specific claim in this repo must be consistent with the researched
platform reference docs. Before changing any file that makes platform-specific
claims, cross-reference:

1. **Research docs** — `docs/platforms/*.md` (sourced, with inline citations)
2. **Reconciliation matrix** — `docs/reconciliation-matrix.md` (tracks known
   discrepancies and their fix status)
3. **Platform API** — `lib/references/platform-api.md` and `lib/references/platforms/*.md`
   (structured PlatformSpec dictionaries consumed by rubrics)
```

- [ ] **Step 3: Update CLAUDE.md**

Replace line 17:

**Before:**
```markdown
3. **Canonical lookup tables** — `lib/references/platform-mappings.md` (single
   source of truth consumed by rubrics)
```

**After:**
```markdown
3. **Platform API** — `lib/references/platform-api.md` and `lib/references/platforms/*.md`
   (structured PlatformSpec dictionaries consumed by rubrics)
```

- [ ] **Step 4: Commit**

```bash
git add GEMINI.md AGENTS.md CLAUDE.md
git commit -m "refactor: update context files to reference platform API"
```

---

### Task 10: Update rubric YAML files

**Files:**
- Modify: `lib/rubrics/claude-code.yaml`
- Modify: `lib/rubrics/codex.yaml`
- Modify: `lib/rubrics/gemini-cli.yaml`
- Modify: `lib/rubrics/cursor.yaml`
- Modify: `lib/rubrics/antigravity.yaml`
- Modify: `lib/rubrics/openclaw.yaml`
- Modify: `lib/rubrics/rubric-framework.md`

All changes are comment/reference updates. No scoring logic changes.

- [ ] **Step 1: Update all LOOKUP comments to function calls**

Apply these replacements across all 6 YAML files. Each replacement is a comment text change inside a `check:` or `condition:` block.

**Pattern 1 — manifest_required_fields:**
Replace all instances of:
```
LOOKUP["manifest_required_fields"]["<platform>"]
```
With:
```
REGISTRY["<platform>"].manifest.required_fields
```

**Pattern 2 — field_stripping:**
Replace all instances of:
```
LOOKUP["field_stripping"]["<platform>"]
```
With:
```
strip_fields("<platform>")
```

**Pattern 3 — tool_mapping:**
Replace all instances of:
```
LOOKUP["tool_mapping"]["<platform>"]["<Tool>"]
```
With the canonical form, e.g.:
```
tool_name("<platform>", "file.edit")    # for Edit
tool_name("<platform>", "subagent.dispatch")  # for Task
tool_name("<platform>", "task.track")   # for TodoWrite
```

**Pattern 4 — hook_events:**
Replace all instances of:
```
LOOKUP["hook_events"]["<platform>"]
```
With:
```
REGISTRY["<platform>"].hooks.events
```

**Pattern 5 — model_mapping:**
Replace all instances of:
```
LOOKUP["model_mapping"]["<platform>"]
```
With:
```
REGISTRY["<platform>"].frontmatter.model_format
```

**Pattern 6 — path_variables:**
Replace:
```
LOOKUP["path_variables"]["cursor"]
```
With:
```
REGISTRY["cursor"].paths.plugin_root
```

**Pattern 7 — hook_format_rules:**
Replace:
```
LOOKUP["hook_format_rules"]["cursor"]
```
With:
```
REGISTRY["cursor"].hooks.output_key
```

**Pattern 8 — agent_output_format:**
Replace:
```
LOOKUP["agent_output_format"]["gemini"]
```
With:
```
REGISTRY["gemini-cli"].skills.agents_path
```

**Pattern 9 — tool_names:**
Replace:
```
LOOKUP["tool_names"]["claude-code"]
```
With:
```
supported_tools("claude-code")
```

- [ ] **Step 2: Update file references in rubric conditions**

In `codex.yaml`, replace all references to `codex-tools.md`:
- `sidecars = glob("**/codex-tools.md")` → `spec = find_file("lib/references/platforms/codex.md") OR glob("**/codex.md")`
- `"No codex-tools.md found"` → `"No Codex platform spec found"`
- `references/codex-tools.md` → `lib/references/platforms/codex.md`
- Add reference to `lib/patterns/subagent-dispatch.md` where message framing is mentioned

In `gemini-cli.yaml`, replace all references to `gemini-tools.md`:
- `"gemini-tools.md" in content` → `"platforms/gemini-cli.md" in content` (for GEMINI.md @include check)
- `sidecars = glob("**/gemini-tools.md")` → `spec = find_file("lib/references/platforms/gemini-cli.md") OR glob("**/gemini-cli.md")`
- `"No gemini-tools.md found"` → `"No Gemini CLI platform spec found"`
- `skills/{name}/references/gemini-tools.md` → `lib/references/platforms/gemini-cli.md`

In `antigravity.yaml`, replace:
- `antigravity-tools.md reference` → `lib/references/platforms/antigravity.md`

In `openclaw.yaml`, replace:
- `openclaw-tools.md` references → `lib/references/platforms/openclaw.md`

In `cursor.yaml`, replace:
- `cursor-tools.md reference` → `lib/references/platforms/cursor.md`

- [ ] **Step 3: Update rubric-framework.md**

Replace line 5:
```
Lookup tables are in `lib/references/platform-mappings.md`.
```
With:
```
Platform specs are in `lib/references/platforms/*.md`. Lookup functions are in `lib/references/platform-api.md`.
```

Replace line 144 reference:
```
Missing subagent translation | Minor | Skills dispatch via `Task`/`Agent` but no codex-tools or gemini-tools sidecar
```
With:
```
Missing subagent translation | Minor | Skills dispatch via `Task`/`Agent` but no platform spec documents the mapping
```

- [ ] **Step 4: Commit**

```bash
git add lib/rubrics/*.yaml lib/rubrics/rubric-framework.md
git commit -m "refactor: update rubric LOOKUP comments to platform API function calls"
```

---

### Task 11: Update pattern files

**Files:**
- Modify: `lib/patterns/inventory.md:65-88`
- Modify: `lib/patterns/injection-checks.md:13,33`
- Modify: `lib/patterns/bootstrapping.md:76-87,273,281`

- [ ] **Step 1: Update inventory.md**

Replace the `sidecar_files` list and surrounding logic (lines 65-88):

**Before:**
```pseudocode
  sidecar_files = ["codex-tools.md", "gemini-tools.md", "cursor-tools.md",
                   "antigravity-tools.md", "openclaw-tools.md"]
```

**After:**
```pseudocode
  platform_spec_files = ["codex.md", "gemini-cli.md", "cursor.md",
                         "antigravity.md", "openclaw.md"]
```

Update the bare-skill branch (lines 69-75):
```pseudocode
  IF computed.shape IN ["bare-skill-repo", "skill-first"]:
    FOR skill IN computed.skills:
      FOR spec_file IN platform_spec_files:
        target = "skills/" + skill.dir + "/references/" + spec_file
        status = IF file_exists(plugin_path + "/" + target) THEN "PRESENT" ELSE "MISSING"
        computed.sidecar_results.append({ skill: skill.dir, file: spec_file, status: status })
```

Update the plugin branch (lines 77-88):
```pseudocode
  ELIF computed.shape == "full-portable-plugin":
    shared_paths = ["lib/references/platforms/", "references/platforms/", "lib/references/"]
    FOR spec_file IN platform_spec_files:
      found = false
      FOR shared IN shared_paths:
        IF file_exists(plugin_path + "/" + shared + spec_file):
          found = true
          computed.sidecar_results.append({ skill: "(shared)", file: shared + spec_file, status: "PRESENT" })
          BREAK
      IF NOT found:
        computed.sidecar_results.append({ skill: "(shared)", file: spec_file, status: "MISSING" })
```

Also update the `sidecar_platform` helper (line 158):
```
| `sidecar_platform(file)` | `"gemini-tools.md" → "gemini-cli"`, `"codex-tools.md" → "codex"` |
```
Replace with:
```
| `spec_platform(file)` | `"gemini-cli.md" → "gemini-cli"`, `"codex.md" → "codex"` |
```

- [ ] **Step 2: Update injection-checks.md**

Replace Component 2 in the table (line 13):
```
| 2 | `lib/references/gemini-tools.md` | File exists (shared tool reference) | PRESENT / MISSING |
```
With:
```
| 2 | `lib/references/platforms/gemini-cli.md` | File exists (platform spec) | PRESENT / MISSING |
```

Replace the pseudocode check (line 33):
```
  results.append(check_file_exists("lib/references/gemini-tools.md"))
```
With:
```
  results.append(check_file_exists("lib/references/platforms/gemini-cli.md"))
```

- [ ] **Step 3: Update bootstrapping.md**

Replace lines 82-83:
```
  - using-{{name}}/references/codex-tools.md
  - using-{{name}}/references/gemini-tools.md
```
With:
```
  # Per-skill sidecars are no longer generated. Shared platform specs
  # in lib/references/platforms/ are loaded via context file @includes.
```

Replace line 273:
```
  @./skills/using-{{name}}/references/gemini-tools.md
```
With:
```
  @./lib/references/platforms/gemini-cli.md
```

Replace line 281 reference to "gemini-tools.md sidecar" with "platform spec".

- [ ] **Step 4: Commit**

```bash
git add lib/patterns/inventory.md lib/patterns/injection-checks.md lib/patterns/bootstrapping.md
git commit -m "refactor: update pattern files to reference platform specs"
```

---

### Task 12: Update CI, CONTRIBUTING.md

**Files:**
- Modify: `.github/workflows/ci.yml:86-88`
- Modify: `CONTRIBUTING.md:40`

- [ ] **Step 1: Update CI workflow**

Replace lines 86-88:

**Before:**
```yaml
          echo ""
          echo "=== Shared Tool References ==="
          for sidecar in codex-tools.md gemini-tools.md cursor-tools.md antigravity-tools.md openclaw-tools.md; do
            check_file "lib/references/${sidecar}"
          done
```

**After:**
```yaml
          echo ""
          echo "=== Platform Specs ==="
          check_file "lib/references/platform-api.md"
          for spec in codex.md gemini-cli.md cursor.md antigravity.md openclaw.md claude-code.md; do
            check_file "lib/references/platforms/${spec}"
          done
```

- [ ] **Step 2: Update CONTRIBUTING.md**

Replace line 40:
```
See existing skills in `skills/` for examples. Each skill should also have a `references/` subdirectory containing platform-specific tool mappings (`codex-tools.md`, `gemini-tools.md`, `antigravity-tools.md`, `openclaw-tools.md`).
```
With:
```
See existing skills in `skills/` for examples. Platform-specific tool mappings are in `lib/references/platforms/`. See `lib/references/platform-api.md` for the type system and lookup functions.
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml CONTRIBUTING.md
git commit -m "refactor: update CI checks and CONTRIBUTING for platform specs"
```

---

### Task 13: Delete old files and update reconciliation matrix

**Files:**
- Delete: `lib/references/platform-mappings.md`
- Delete: `lib/references/gemini-tools.md`
- Delete: `lib/references/codex-tools.md`
- Delete: `lib/references/cursor-tools.md`
- Delete: `lib/references/antigravity-tools.md`
- Delete: `lib/references/openclaw-tools.md`
- Modify: `docs/reconciliation-matrix.md`

- [ ] **Step 1: Delete old reference files**

```bash
git rm lib/references/platform-mappings.md
git rm lib/references/gemini-tools.md
git rm lib/references/codex-tools.md
git rm lib/references/cursor-tools.md
git rm lib/references/antigravity-tools.md
git rm lib/references/openclaw-tools.md
```

- [ ] **Step 2: Verify new files exist**

```bash
ls lib/references/platform-api.md
ls lib/references/platforms/
```

Expected: `platform-api.md` present, `platforms/` contains 6 `.md` files.

- [ ] **Step 3: Run CI checks locally**

```bash
# Verify all platform specs exist
for spec in codex.md gemini-cli.md cursor.md antigravity.md openclaw.md claude-code.md; do
  test -f "lib/references/platforms/${spec}" && echo "OK: ${spec}" || echo "FAIL: ${spec}"
done

# Verify platform-api.md exists
test -f lib/references/platform-api.md && echo "OK: platform-api.md" || echo "FAIL: platform-api.md"

# Verify no old files remain
for old in platform-mappings.md gemini-tools.md codex-tools.md cursor-tools.md antigravity-tools.md openclaw-tools.md; do
  test -f "lib/references/${old}" && echo "FAIL: ${old} still exists" || echo "OK: ${old} removed"
done
```

Expected: All OK, no FAIL.

- [ ] **Step 4: Update reconciliation matrix**

Add a new section to `docs/reconciliation-matrix.md` noting the restructure.
The old Sections 1 and 6 (which referenced the deleted files) should note that
the content has migrated to the platform API structure.

- [ ] **Step 5: Commit**

```bash
git add -A lib/references/ docs/reconciliation-matrix.md
git commit -m "refactor: delete old reference files, complete platform API migration

Removes platform-mappings.md and 5 *-tools.md files, replaced by
platform-api.md + 6 structured PlatformSpec files in platforms/."
```

---

### Task 14: Verify and clean up

- [ ] **Step 1: Grep for stale references**

```bash
grep -rn 'platform-mappings\|gemini-tools\.md\|codex-tools\.md\|cursor-tools\.md\|antigravity-tools\.md\|openclaw-tools\.md' --include='*.md' --include='*.yaml' --include='*.yml' --include='*.json' | grep -v 'docs/superpowers/' | grep -v 'docs/reconciliation' | grep -v '.git/' | grep -v 'CHANGELOG'
```

Expected: No output (all references updated).

- [ ] **Step 2: Fix any remaining references**

If grep finds stale references, update them to point to the new paths.

- [ ] **Step 3: Run markdown lint**

```bash
npx markdownlint-cli2 "lib/references/**/*.md"
```

Fix any lint issues.

- [ ] **Step 4: Final commit if needed**

```bash
git add -A
git commit -m "chore: fix remaining stale references to old platform files"
```
