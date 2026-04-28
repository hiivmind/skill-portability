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
    marketplace_path: null,
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

## OpenClaw-specific notes

- Hooks are TypeScript SDK-based: `api.registerHook(event, handler)` or
  `api.on(event, handler)`. No file-based hook config.
- Non-bundled conversation hooks require
  `plugins.entries.<id>.hooks.allowConversationAccess=true`.
- Full plugins also need `package.json` with `openclaw.extensions` and
  `openclaw.compat`.
- Auto-detects Claude, Codex, and Cursor bundle layouts.
