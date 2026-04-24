# Installation

## Claude Code

### Marketplace install

```bash
claude plugin install skill-portability@skill-portability-dev
```

### Local development

```bash
claude --plugin-dir ./path-to-skill-portability
```

### Project install

Add to `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": ["./path-to-marketplace"]
}
```

### Verify

```bash
claude plugin list
```

Look for `skill-portability` in the output.

## Cursor

### Marketplace install

Search for **Skill Portability** in the Cursor marketplace panel or visit `cursor.com/marketplace`.

### Local development

Copy the plugin directory to `~/.cursor/plugins/local/skill-portability/` and restart Cursor (Developer: Reload Window).

### Verify

Open Cursor and check that skills from Skill Portability appear when typing `/` in chat.

## Gemini CLI

### Install from GitHub

```bash
gemini extensions install https://github.com/nathanielramm/skill-portability
```

### Install from local path

```bash
gemini extensions install /path/to/skill-portability
```

### Verify

```bash
gemini extensions list
```

Look for `skill-portability` in the output. Restart Gemini CLI if it was running during install.

## OpenCode

### Local plugin install

Copy `.opencode/plugins/skill-portability.js` to your project's `.opencode/plugins/` directory, or to `~/.config/opencode/plugins/` for global install.

### npm install (if published)

Add to your `opencode.json`:

```json
{
  "plugin": ["skill-portability"]
}
```

### Context file

OpenCode uses `AGENTS.md` as its primary context file. If both `AGENTS.md` and `CLAUDE.md` exist, only `AGENTS.md` is loaded.

### Verify

Restart OpenCode and check that skills are listed when the agent invokes the `skill` tool.

### Requirements

OpenCode requires [Bun](https://bun.sh) for plugin loading.

## Codex

### Skill-discovery install

Clone the repo and expose the skills directory:

```bash
git clone https://github.com/nathanielramm/skill-portability
ln -s $(pwd)/skill-portability/skills ~/.agents/skills/skill-portability
```

Restart Codex. Skills will be discoverable through native skill discovery.

### Context file

Codex uses `AGENTS.md` as its primary context file.

### Verify

Start a new Codex session and check that skills are listed.
