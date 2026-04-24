# Installation

## Important: Whole-repo install required

This plugin uses shared hooks, context files, and platform manifests that live outside
individual skill directories. Installing via `npx skills` (which copies only the `skills/`
directory) will lose these shared files and break session-start injection.

Every install path below clones or references the full repo. See
[docs/ecosystem-friction.md](docs/ecosystem-friction.md) for background on why this is
necessary across today's agent platforms.

## Fresh Install

### Claude Code

#### Marketplace install

```bash
claude plugin install skill-portability@skill-portability-dev
```

#### Local development

```bash
claude --plugin-dir ./path-to-skill-portability
```

#### Project install

Add to `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": ["./path-to-marketplace"]
}
```

#### Verify

```bash
claude plugin list
```

Look for `skill-portability` in the output.

### Cursor

#### Marketplace install

Search for **Skill Portability** in the Cursor marketplace panel or visit `cursor.com/marketplace`.

#### Local development

Copy the plugin directory to `~/.cursor/plugins/local/skill-portability/` and restart Cursor (Developer: Reload Window).

#### Verify

Open Cursor and check that skills from Skill Portability appear when typing `/` in chat.

### Gemini CLI

#### Install from GitHub

```bash
gemini extensions install https://github.com/nathanielramm/skill-portability
```

#### Install from local path

```bash
gemini extensions install /path/to/skill-portability
```

#### Verify

```bash
gemini extensions list
```

Look for `skill-portability` in the output. Restart Gemini CLI if it was running during install.

### OpenCode

#### Local plugin install

Copy `.opencode/plugins/skill-portability.js` to your project's `.opencode/plugins/` directory, or to `~/.config/opencode/plugins/` for global install.

#### npm install (if published)

Add to your `opencode.json`:

```json
{
  "plugin": ["skill-portability"]
}
```

#### Context file

OpenCode uses `AGENTS.md` as its primary context file. If both `AGENTS.md` and `CLAUDE.md` exist, only `AGENTS.md` is loaded.

#### Verify

Restart OpenCode and check that skills are listed when the agent invokes the `skill` tool.

#### Requirements

OpenCode requires [Bun](https://bun.sh) for plugin loading.

### Copilot CLI

#### Skill install

Skills are auto-discovered from the `skills/` directory. Clone the repo and skills will be available:

```bash
git clone https://github.com/nathanielramm/skill-portability
```

Alternatively, install individual skills:

```bash
gh skill install https://github.com/nathanielramm/skill-portability
```

#### Context

Copilot reads `.github/copilot-instructions.md` for repo-wide context. It also reads `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` from the project root.

#### Verify

Start Copilot CLI in the repo directory and check that skills appear:

```bash
copilot
```

Type `/` to see available skills.

### Codex

#### Skill-discovery install

Clone the repo and expose the skills directory:

```bash
git clone https://github.com/nathanielramm/skill-portability
ln -s $(pwd)/skill-portability/skills ~/.agents/skills/skill-portability
```

Restart Codex. Skills will be discoverable through native skill discovery.

#### Context file

Codex uses `AGENTS.md` as its primary context file.

#### Verify

Start a new Codex session and check that skills are listed.

## Adding Another Platform

Already have the repo cloned for one platform? Add others by pointing them at the same checkout.

### Claude Code

Point Claude Code at your existing checkout:

```bash
claude --plugin-dir /path/to/existing/skill-portability
```

Or add to `.claude/settings.json` for persistent access:

```json
{
  "extraKnownMarketplaces": ["/path/to/existing/skill-portability"]
}
```

### Cursor

Symlink your existing checkout into Cursor's plugin directory:

```bash
ln -s /path/to/existing/skill-portability ~/.cursor/plugins/local/skill-portability
```

Restart Cursor (Developer: Reload Window).

### Gemini CLI

Point Gemini at your existing checkout:

```bash
gemini extensions install /path/to/existing/skill-portability
```

### OpenCode

Symlink the plugin entrypoint from your existing checkout (do not copy — it resolves paths relative to the repo root):

```bash
ln -s /path/to/existing/skill-portability/.opencode/plugins/skill-portability.js .opencode/plugins/skill-portability.js
```

Or add the checkout path to your `opencode.json`:

```json
{
  "plugin": ["/path/to/existing/skill-portability"]
}
```

Requires [Bun](https://bun.sh).

### Copilot CLI

Work from the cloned directory — skills are auto-discovered from `skills/`. Or symlink into your project:

```bash
ln -s /path/to/existing/skill-portability/skills skills/skill-portability
```

### Codex

Symlink the skills directory from your existing checkout:

```bash
ln -s /path/to/existing/skill-portability/skills ~/.agents/skills/skill-portability
```

Restart Codex.
