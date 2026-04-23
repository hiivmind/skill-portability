---
name: uplifting-a-plugin
description: Use when you need to add multi-platform portability to a plugin. Accepts any starting state — a Claude plugin, a Cursor plugin, a Gemini extension, an npx skills repo, or a bare directory of SKILL.md files. Detects what is already present, infers a canonical metadata model, and emits every missing platform artifact: Claude Code, Cursor, Gemini CLI, OpenCode, AGENTS.md, per-skill tool-mapping sidecars.
---

# Uplifting a Plugin to Multi-Platform Portability

This skill transforms any plugin — regardless of its starting platform — into a fully portable plugin following the superpowers portability pattern. No platform is assumed to already exist. Claude Code manifests are an equally valid *target* as Cursor or Gemini manifests.

All template content is embedded inline in this skill. No external files are read from `assets/templates/` — this skill is fully self-contained and works whether installed as a Claude Code plugin or via `npx skills add`.

## What this skill produces

For a source plugin at `<plugin-path>`, this skill writes every missing artifact:

| Platform | Files written if missing |
|---|---|
| Claude Code | `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `CLAUDE.md` |
| Cursor | `.cursor-plugin/plugin.json` |
| Gemini CLI | `gemini-extension.json`, `GEMINI.md` |
| OpenCode | `package.json`, `.opencode/plugins/<name>.js` |
| Generic (Codex/Copilot CLI) | `AGENTS.md` |
| All skills | `skills/<name>/references/copilot-tools.md`, `codex-tools.md`, `gemini-tools.md` |
| Hook portability | `hooks/hooks-cursor.json` (if hooks exist) |
| npx skills compat | Validates every `skills/<name>/SKILL.md` has `name` + `description` frontmatter |
| Session-start bootstrapping | `skills/using-<name>/SKILL.md`, `hooks/session-start`, `hooks/run-hook.cmd` (opt-in) |

## Minimum starting state

At least ONE of the following must exist:
- One or more `skills/*/SKILL.md` files with `name` and `description` YAML frontmatter
- Any platform manifest: `.claude-plugin/plugin.json`, `.cursor-plugin/plugin.json`, `gemini-extension.json`, or `package.json`

If neither is found, stop and report an error (see Step 1).

## Detection Algorithm

Both phases below rely on a shared detection routine. Run it once at the start.

### Step D1: Scan for metadata sources

Check which of these exist at `<plugin-path>`:

| Source | Fields extractable |
|---|---|
| `.claude-plugin/plugin.json` | `name`, `description`, `version`, `author.name`, `author.email`, `homepage`, `repository`, `license`, `keywords` |
| `.cursor-plugin/plugin.json` | `name`, `displayName`, `description`, `version`, `author.name`, `author.email`, `homepage`, `repository`, `license`, `keywords` |
| `gemini-extension.json` | `name`, `description`, `version` |
| `package.json` | `name`, `version`, `description` |
| `AGENTS.md` | `name` (from H1 heading — first `# Heading` line), `description` (first non-heading paragraph) |
| `skills/*/SKILL.md` frontmatter | `name` (YAML `name:` field, or skill directory name as fallback), `description` (YAML `description:` field) |

If **none** of these are found, stop and report:
> "No recognisable plugin signals found in `<plugin-path>`. Provide at least one platform manifest or one `skills/*/SKILL.md` with `name` and `description` frontmatter."

### Step D2: Score and elect canonical source

For each present source, count the number of populated (non-empty) fields from the table above. The source with the **most populated fields** becomes the **canonical source**.

Tie-breaking order when scores are equal (highest priority first):
1. `.claude-plugin/plugin.json`
2. `.cursor-plugin/plugin.json`
3. `gemini-extension.json`
4. `package.json`
5. `AGENTS.md`
6. First `skills/*/SKILL.md` alphabetically by directory name

### Step D3: Build canonical metadata model

Start with all fields from the canonical source. For each field that is empty or absent, check the remaining sources in descending score order and take the first non-empty value found.

| Field | Hard fallback (used only when not found anywhere) |
|---|---|
| `name` | Directory basename of `<plugin-path>` |
| `displayName` | Title-case `name`: replace `-` and `_` with spaces, capitalise each word |
| `description` | `""` — flag as missing |
| `version` | `"0.1.0"` |
| `author.name` | `""` — flag as missing |
| `author.email` | `""` — flag as missing |
| `homepage` | `""` |
| `repository` | `""` |
| `license` | `"MIT"` |
| `keywords` | `[]` |

Always derive (never read from sources):
- `marketplaceName` = `<name>-dev`
- `opencodeMain` = `.opencode/plugins/<name>.js`

### Step D4: Print inference summary

Before writing any files, print:

```
## Metadata inferred
  canonical source: .claude-plugin/plugin.json  (9 fields)
  name:          my-plugin        (from .claude-plugin/plugin.json)
  description:   Does X for Y.   (from .claude-plugin/plugin.json)
  version:       1.2.0            (from .cursor-plugin/plugin.json)
  author.name:   [missing — not found in any source]
  author.email:  [missing — not found in any source]
  homepage:                       (empty string — not found)
  repository:                     (empty string — not found)
  license:       MIT              (hard fallback)
  keywords:      []               (hard fallback)
```

Fields still missing after all sources are checked are flagged here and repeated in the final report.

## Checklist

- [ ] **Step 1: Run Detection Algorithm (D1–D4)**

Execute Steps D1–D4 above. If no signals found, stop with the error message. Otherwise proceed with the inferred canonical metadata.

- [ ] **Step 2: Inventory source assets**

Detect which asset types exist at `<plugin-path>`:
- Does `skills/` exist? List all skill subdirectory names.
- Does `commands/` exist? List all `.md` filenames.
- Does `agents/` exist? List all `.md` filenames.
- Does `hooks/hooks.json` exist? Read and parse it.

- [ ] **Step 3: Check for conflicts (do not overwrite without --force)**

Before writing any file, check whether each target already exists. Skip and note in the final report any that do.

Full target file list:
```
.claude-plugin/plugin.json
.claude-plugin/marketplace.json
.cursor-plugin/plugin.json
gemini-extension.json
GEMINI.md
AGENTS.md
CLAUDE.md
package.json
.opencode/plugins/<name>.js
hooks/hooks-cursor.json
```

Also check each `skills/<skillname>/references/copilot-tools.md`, `codex-tools.md`, `gemini-tools.md`.

- [ ] **Step 4: Write `.claude-plugin/plugin.json`** (if missing)

Create `.claude-plugin/` directory if needed. Write the following content with all `{{fields}}` substituted from inferred metadata. `{{keywords}}` is a JSON array literal (e.g. `["ai", "skills"]`):

```json
{
  "name": "{{name}}",
  "description": "{{description}}",
  "version": "{{version}}",
  "author": {
    "name": "{{author.name}}",
    "email": "{{author.email}}"
  },
  "homepage": "{{homepage}}",
  "repository": "{{repository}}",
  "license": "{{license}}",
  "keywords": {{keywords}}
}
```

- [ ] **Step 5: Write `.claude-plugin/marketplace.json`** (if missing)

```json
{
  "name": "{{marketplaceName}}",
  "description": "Development marketplace for {{name}}",
  "owner": {
    "name": "{{author.name}}",
    "email": "{{author.email}}"
  },
  "plugins": [
    {
      "name": "{{name}}",
      "description": "{{description}}",
      "version": "{{version}}",
      "source": "./",
      "author": {
        "name": "{{author.name}}",
        "email": "{{author.email}}"
      }
    }
  ]
}
```

- [ ] **Step 6: Write `CLAUDE.md`** (if missing)

```markdown
# {{displayName}}

{{description}}

This plugin is loaded via Claude Code's plugin system. Skills are invoked via the `Skill` tool.
```

- [ ] **Step 7: Write `.cursor-plugin/plugin.json`** (if missing)

Create `.cursor-plugin/` directory if needed. Write the following content. **Omit the `"agents"` key if `agents/` doesn't exist. Omit the `"commands"` key if `commands/` doesn't exist.**

```json
{
  "name": "{{name}}",
  "displayName": "{{displayName}}",
  "description": "{{description}}",
  "version": "{{version}}",
  "author": {
    "name": "{{author.name}}",
    "email": "{{author.email}}"
  },
  "homepage": "{{homepage}}",
  "repository": "{{repository}}",
  "license": "{{license}}",
  "keywords": {{keywords}},
  "skills": "./skills/",
  "agents": "./agents/",
  "commands": "./commands/",
  "hooks": "./hooks/hooks-cursor.json"
}
```

- [ ] **Step 8: Write `gemini-extension.json`** (if missing)

```json
{
  "name": "{{name}}",
  "description": "{{description}}",
  "version": "{{version}}",
  "contextFileName": "GEMINI.md"
}
```

- [ ] **Step 9: Write `GEMINI.md`** (if missing)

Build the include blocks from the skills/agents/commands lists inventoried in Step 2.

`{{skillIncludes}}` — one line per skill:
```
@./skills/<skillname>/SKILL.md
@./skills/<skillname>/references/gemini-tools.md
```

`{{agentIncludes}}` — one line per agent file (omit this block entirely if no agents):
```
@./agents/<agentfile>.md
```

`{{commandIncludes}}` — one line per command file (omit this block entirely if no commands):
```
@./commands/<commandfile>.md
```

Write the assembled result to `<plugin-path>/GEMINI.md`. The file contains only the `@` include directives and no other prose.

- [ ] **Step 10: Write `AGENTS.md`** (if missing)

Build skill bullet list for `{{skillIncludes}}`:
```
- skills/<skillname>/SKILL.md
```

Build command bullet list for `{{commandIncludes}}` (omit the entire Commands section if no commands exist):
```
- commands/<commandfile>.md
```

Write:

```markdown
# {{displayName}}

{{description}}

## Skills

This plugin provides the following skills. Read the SKILL.md files listed to understand how to invoke each skill:

{{skillIncludes}}

## Commands

{{commandIncludes}}

## Tool Name Mapping

Skills use Claude Code tool names. Platform equivalents:

- `Read` → your platform's file-read tool
- `Write` → your platform's file-write tool
- `Edit` → your platform's file-edit tool
- `Bash` → your platform's shell/command tool
- `Grep` → your platform's content-search tool
- `Glob` → your platform's file-search tool
- `Skill` tool → your platform's skill-invoke tool (or follow instructions directly)
- `Task` tool → your platform's subagent-dispatch tool (if supported)

See each skill's `references/` directory for platform-specific tool mapping tables.
```

- [ ] **Step 11: Write `package.json`** (if missing)

```json
{
  "name": "{{name}}",
  "version": "{{version}}",
  "type": "module",
  "main": "{{opencodeMain}}"
}
```

- [ ] **Step 12: Write OpenCode plugin shim** (if missing)

Create `<plugin-path>/.opencode/plugins/` if needed. Write to `<plugin-path>/.opencode/plugins/<name>.js`:

```javascript
// OpenCode plugin registration for {{name}}
// Skills are loaded from ./skills/ by the OpenCode runtime.
export default {
  name: "{{name}}",
  description: "{{description}}",
  skills: "./skills/",
};
```

- [ ] **Step 13: Port hooks** (if source has hooks)

If `<plugin-path>/hooks/hooks.json` exists and has non-empty entries:

Map Claude hook events to Cursor equivalents:

| Claude event | Cursor event |
|---|---|
| `SessionStart` | `sessionStart` |
| `UserPromptSubmit` | `userMessage` |
| `PostToolUse` | `postToolUse` |
| `Stop` | `agentStop` |

Build and write `<plugin-path>/hooks/hooks-cursor.json`:
```json
{
  "version": 1,
  "hooks": {
    "<cursorEventName>": [
      { "command": "<same command as in hooks.json>" }
    ]
  }
}
```

**Flag in report:** Any hook command containing `$CLAUDE_PLUGIN_ROOT` needs manual review — Cursor uses a different env var.

If no hooks exist, write empty `hooks/hooks-cursor.json`:
```json
{
  "version": 1,
  "hooks": {}
}
```

- [ ] **Step 14: Validate `npx skills` frontmatter**

For each skill detected in Step 2, read `skills/<skillname>/SKILL.md` and verify:
- YAML frontmatter block (`---` delimiters) present at top of file
- `name:` field present and non-empty
- `description:` field present and non-empty

Flag any failures in the "Needs manual review" section of the final report:
> `skills/<skillname>/SKILL.md` missing frontmatter field(s): `<name|description>`. Add:
> ```yaml
> ---
> name: <skillname>
> description: <what this skill does and when to invoke it>
> ---
> ```
Do NOT auto-write — frontmatter descriptions require human authorship.

- [ ] **Step 15: Seed per-skill tool-mapping sidecars**

For each skill from Step 2, check whether each sidecar is present. For each missing sidecar, write the content below to `<plugin-path>/skills/<skillname>/references/<platform>-tools.md`. Create `references/` directory if needed.

**`copilot-tools.md`:**

```markdown
# Copilot CLI Tool Mapping

Skills use Claude Code tool names. When you encounter these in a skill, use your platform equivalent:

| Skill references | Copilot CLI equivalent |
|-----------------|----------------------|
| `Read` (file reading) | `view` |
| `Write` (file creation) | `create` |
| `Edit` (file editing) | `edit` |
| `Bash` (run commands) | `bash` |
| `Grep` (search file content) | `grep` |
| `Glob` (search files by name) | `glob` |
| `Skill` tool (invoke a skill) | `skill` |
| `WebFetch` | `web_fetch` |
| `Task` tool (dispatch subagent) | `task` (see [Agent types](#agent-types)) |
| Multiple `Task` calls (parallel) | Multiple `task` calls |
| Task status/output | `read_agent`, `list_agents` |
| `TodoWrite` (task tracking) | `sql` with built-in `todos` table |
| `WebSearch` | No equivalent — use `web_fetch` with a search engine URL |
| `EnterPlanMode` / `ExitPlanMode` | No equivalent — stay in the main session |

## Agent types

Copilot CLI's `task` tool accepts an `agent_type` parameter:

| Claude Code agent | Copilot CLI equivalent |
|-------------------|----------------------|
| `general-purpose` | `"general-purpose"` |
| `Explore` | `"explore"` |
| Named plugin agents (e.g. `superpowers:code-reviewer`) | Discovered automatically from installed plugins |

## Async shell sessions

Copilot CLI supports persistent async shell sessions, which have no direct Claude Code equivalent:

| Tool | Purpose |
|------|---------|
| `bash` with `async: true` | Start a long-running command in the background |
| `write_bash` | Send input to a running async session |
| `read_bash` | Read output from an async session |
| `stop_bash` | Terminate an async session |
| `list_bash` | List all active shell sessions |

## Additional Copilot CLI tools

| Tool | Purpose |
|------|---------|
| `store_memory` | Persist facts about the codebase for future sessions |
| `report_intent` | Update the UI status line with current intent |
| `sql` | Query the session's SQLite database (todos, metadata) |
| `fetch_copilot_cli_documentation` | Look up Copilot CLI documentation |
| GitHub MCP tools (`github-mcp-server-*`) | Native GitHub API access (issues, PRs, code search) |
```

**`codex-tools.md`:**

```markdown
# Codex Tool Mapping

Skills use Claude Code tool names. When you encounter these in a skill, use your platform equivalent:

| Skill references | Codex equivalent |
|-----------------|------------------|
| `Task` tool (dispatch subagent) | `spawn_agent` (see [Named agent dispatch](#named-agent-dispatch)) |
| Multiple `Task` calls (parallel) | Multiple `spawn_agent` calls |
| Task returns result | `wait` |
| Task completes automatically | `close_agent` to free slot |
| `TodoWrite` (task tracking) | `update_plan` |
| `Skill` tool (invoke a skill) | Skills load natively — just follow the instructions |
| `Read`, `Write`, `Edit` (files) | Use your native file tools |
| `Bash` (run commands) | Use your native shell tools |

## Subagent dispatch requires multi-agent support

Add to your Codex config (`~/.codex/config.toml`):

```toml
[features]
multi_agent = true
```

This enables `spawn_agent`, `wait`, and `close_agent` for skills like `dispatching-parallel-agents` and `subagent-driven-development`.

## Named agent dispatch

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
|-------------------|------------------|
| `Task tool (superpowers:code-reviewer)` | `spawn_agent(agent_type="worker", message=...)` with `code-reviewer.md` content |
| `Task tool (general-purpose)` with inline prompt | `spawn_agent(message=...)` with the same prompt |

### Message framing

The `message` parameter is user-level input, not a system prompt. Structure it
for maximum instruction adherence:

```
Your task is to perform the following. Follow the instructions below exactly.

<agent-instructions>
[filled prompt content from the agent's .md file]
</agent-instructions>

Execute this now. Output ONLY the structured response following the format
specified in the instructions above.
```

- Use task-delegation framing ("Your task is...") rather than persona framing ("You are...")
- Wrap instructions in XML tags — the model treats tagged blocks as authoritative
- End with an explicit execution directive to prevent summarization of the instructions

### When this workaround can be removed

This approach compensates for Codex's plugin system not yet supporting an `agents`
field in `plugin.json`. When `RawPluginManifest` gains an `agents` field, the
plugin can symlink to `agents/` (mirroring the existing `skills/` symlink) and
skills can dispatch named agent types directly.

## Environment Detection

Skills that create worktrees or finish branches should detect their
environment with read-only git commands before proceeding:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

- `GIT_DIR != GIT_COMMON` → already in a linked worktree (skip creation)
- `BRANCH` empty → detached HEAD (cannot branch/push/PR from sandbox)

See `using-git-worktrees` Step 0 and `finishing-a-development-branch`
Step 1 for how each skill uses these signals.

## Codex App Finishing

When the sandbox blocks branch/push operations (detached HEAD in an
externally managed worktree), the agent commits all work and informs
the user to use the App's native controls:

- **"Create branch"** — names the branch, then commit/push/PR via App UI
- **"Hand off to local"** — transfers work to the user's local checkout

The agent can still run tests, stage files, and output suggested branch
names, commit messages, and PR descriptions for the user to copy.
```

**`gemini-tools.md`:**

```markdown
# Gemini CLI Tool Mapping

Skills use Claude Code tool names. When you encounter these in a skill, use your platform equivalent:

| Skill references | Gemini CLI equivalent |
|-----------------|----------------------|
| `Read` (file reading) | `read_file` |
| `Write` (file creation) | `write_file` |
| `Edit` (file editing) | `replace` |
| `Bash` (run commands) | `run_shell_command` |
| `Grep` (search file content) | `grep_search` |
| `Glob` (search files by name) | `glob` |
| `TodoWrite` (task tracking) | `write_todos` |
| `Skill` tool (invoke a skill) | `activate_skill` |
| `WebSearch` | `google_web_search` |
| `WebFetch` | `web_fetch` |
| `Task` tool (dispatch subagent) | No equivalent — Gemini CLI does not support subagents |

## No subagent support

Gemini CLI has no equivalent to Claude Code's `Task` tool. Skills that rely on subagent dispatch (`subagent-driven-development`, `dispatching-parallel-agents`) will fall back to single-session execution via `executing-plans`.

## Additional Gemini CLI tools

These tools are available in Gemini CLI but have no Claude Code equivalent:

| Tool | Purpose |
|------|---------|
| `list_directory` | List files and subdirectories |
| `save_memory` | Persist facts to GEMINI.md across sessions |
| `ask_user` | Request structured input from the user |
| `tracker_create_task` | Rich task management (create, update, list, visualize) |
| `enter_plan_mode` / `exit_plan_mode` | Switch to read-only research mode before making changes |
```

- [ ] **Step 16: Emit final report**

Print a summary with four sections:

**Metadata inferred:**
Repeat the D4 inference summary. List any fields that fell back to hard defaults or were left blank.

**Created:**
Every file written in this run, relative to `<plugin-path>`.

**Skipped (already exists):**
Every file that was present and therefore not overwritten.

**Needs manual review:**
- Any hook command containing `$CLAUDE_PLUGIN_ROOT`
- Any skill with missing `name` or `description` frontmatter
- Any metadata field that could not be inferred from any source

- [ ] **Step 17: Prompt for bootstrapping**

After completing Steps 1-15 but before emitting the final report, ask:

> "Would you like to generate session-start bootstrapping hooks? This creates a `using-{{name}}` skill that gets force-injected at session start on Claude Code, Cursor, Copilot CLI, OpenCode, and Gemini CLI. (y/n)"

If the user declines, skip Steps 18-24 and proceed to Step 25 (final report).

If `skills/using-{{name}}/SKILL.md` already exists, skip the prompt and all bootstrapping steps — the user has already configured bootstrapping (possibly with custom content).

## Running the skill

Invoke with: `"Use the uplifting-a-plugin skill on <path/to/plugin>"`

The skill is idempotent: running it twice on the same repo produces no diff on the second run.
