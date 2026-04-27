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
    marketplace_path: null,
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
