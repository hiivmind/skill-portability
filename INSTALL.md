# Installation

## Important: Whole-repo install required

This plugin uses shared hooks, context files, and platform manifests that live outside
individual skill directories. Installing via `npx skills` (which copies only the `skills/`
directory) will lose these shared files and break session-start injection.

Every install path below clones or references the full repo. See
[docs/ecosystem-landscape.md](docs/ecosystem-landscape.md) for background on why this is
necessary across today's agent platforms.

## Fresh Install

### Claude Code

#### Marketplace install

```bash
claude plugin install plugin-portability@plugin-portability-marketplace
```

#### Local development

```bash
claude --plugin-dir ./path-toplugin-portability
```

#### Project install

Add to `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "plugin-portability-marketplace": {
      "source": {
        "source": "github",
        "repo": "hiivmind/plugin-portability"
      }
    }
  }
}
```

#### Verify

```bash
claude plugin list
```

Look for `plugin-portability` in the output.

#### Using the skills

In Claude Code, invoke skills by describing what you want in natural language:

```
Assess the portability of /path/to/my-plugin
```

```
Use the plugin-portability skill on /path/to/my-plugin
```

### Cursor

#### Install from GitHub

In Cursor's Agent chat:

```
/add-plugin hiivmind/plugin-portability
```

#### Local development

Symlink or copy the plugin directory to `~/.cursor/plugins/local/plugin-portability/` and restart Cursor (Developer: Reload Window).

#### Verify

Open Cursor and check that skills from Skill Portability appear when typing `/` in chat.

#### Using the skills

In Cursor's chat, invoke skills with the `/` prefix:

```
/plugin-portability
```

### Gemini CLI

#### Install from GitHub

```bash
gemini extensions install https://github.com/hiivmind/plugin-portability
```

#### Install from local path

```bash
gemini extensions link /path/to/plugin-portability
```

#### Verify

```bash
gemini extensions list
```

Look for `plugin-portability` in the output. Restart Gemini CLI if it was running during install.

#### Using the skills

Gemini CLI activates skills automatically when it determines they are relevant. You can also mention a skill by name:

```
Assess the portability of /path/to/my-plugin using plugin-portability
```

List available skills with `/skills list`.

### Antigravity

#### Skill-only install

Copy skills to the Antigravity skills directory:

```bash
cp -r skills/ .agents/skills/
```

Or for global install:

```bash
cp -r skills/ ~/.gemini/antigravity/skills/
```

#### Extension install

```bash
antigravity --install-extension hiivmind/plugin-portability
```

#### Using the skills

Antigravity discovers skills automatically. Mention a skill by name and the agent will activate it:

```
Run plugin-portability on /path/to/my-plugin
```

### OpenClaw

#### ClawHub install

```bash
openclaw plugins install plugin-portability
```

#### npm install

```bash
npm install plugin-portability
```

#### Local install

Add the plugin path to `openclaw.json`:

```json
{
  "plugins.load.paths": ["/path/to/plugin-portability"]
}
```

#### Using the skills

OpenClaw discovers skills automatically. Mention a skill by name and the agent will activate it:

```
Run plugin-portability on /path/to/my-plugin
```

### Codex

#### GitHub marketplace install

Register the repo as a Codex marketplace:

```bash
codex marketplace add hiivmind/plugin-portability
```

This adds a marketplace entry to `~/.codex/config.toml`.

Then open `/plugins` in Codex and install `plugin-portability`.

Codex persists the plugin enablement as a separate config entry:

```toml
[plugins."plugin-portability@plugin-portability-marketplace"]
enabled = true
```

#### Local development install

Use this only when you are intentionally testing a local checkout rather than installing from GitHub.

```bash
codex marketplace add /path/to/plugin-portability
```

Then open `/plugins` in Codex and install `plugin-portability`.

#### Skill-discovery fallback

If you only want the raw skills and do not need Codex plugin packaging, clone the repo and expose the skills directory:

```bash
git clone https://github.com/hiivmind/plugin-portability
ln -s $(pwd)/plugin-portability/skills ~/.agents/skills/plugin-portability
```

Use this as a fallback path, not the default install story for this repo.

#### Context file

Codex uses `AGENTS.md` as its primary context file.

#### Verify

Start a new Codex session and check one of:

- `/plugins` shows `plugin-portability` as installed
- `~/.codex/config.toml` contains both the marketplace entry and the enabled plugin entry
- `$plugin-portability` resolves in a fresh session

#### Using the skills

In Codex, invoke skills with the `$` prefix:

```
$plugin-portability
$plugin-portability
```

## Adding Another Platform

Already have the repo cloned for one platform? Add others by pointing them at the same checkout.

### Claude Code

Point Claude Code at your existing checkout:

```bash
claude --plugin-dir /path/to/existing/plugin-portability
```

Or add to `.claude/settings.json` for persistent access:

```json
{
  "extraKnownMarketplaces": {
    "plugin-portability-marketplace": {
      "source": {
        "source": "github",
        "repo": "hiivmind/plugin-portability"
      }
    }
  }
}
```

### Cursor

Symlink your existing checkout into Cursor's plugin directory:

```bash
ln -s /path/to/existing/plugin-portability ~/.cursor/plugins/local/plugin-portability
```

Restart Cursor (Developer: Reload Window).

### Gemini CLI

Link Gemini to your existing checkout:

```bash
gemini extensions link /path/to/existing/plugin-portability
```

### Antigravity

Copy skills from your existing checkout:

```bash
cp -r /path/to/existing/plugin-portability/skills/ .agents/skills/
```

Or install as an extension:

```bash
antigravity --install-extension /path/to/existing/plugin-portability
```

### OpenClaw

Add the checkout path to `openclaw.json`:

```json
{
  "plugins.load.paths": ["/path/to/existing/plugin-portability"]
}
```

### Codex

For local development against an existing checkout, register the checkout itself as a marketplace:

```bash
codex marketplace add /path/to/existing/plugin-portability
```

Then open `/plugins` in Codex and install `plugin-portability`.

If you only want skill discovery, symlink the skills directory from your existing checkout:

```bash
ln -s /path/to/existing/plugin-portability/skills ~/.agents/skills/plugin-portability
```
