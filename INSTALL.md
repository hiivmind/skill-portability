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
claude plugin install skill-portability@skill-portability-marketplace
```

#### Local development

```bash
claude --plugin-dir ./path-to-skill-portability
```

#### Project install

Add to `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "skill-portability-marketplace": {
      "source": {
        "source": "github",
        "repo": "hiivmind/skill-portability"
      }
    }
  }
}
```

#### Verify

```bash
claude plugin list
```

Look for `skill-portability` in the output.

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
/add-plugin hiivmind/skill-portability
```

#### Local development

Symlink or copy the plugin directory to `~/.cursor/plugins/local/skill-portability/` and restart Cursor (Developer: Reload Window).

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
gemini extensions install https://github.com/hiivmind/skill-portability
```

#### Install from local path

```bash
gemini extensions link /path/to/skill-portability
```

#### Verify

```bash
gemini extensions list
```

Look for `skill-portability` in the output. Restart Gemini CLI if it was running during install.

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
antigravity --install-extension hiivmind/skill-portability
```

#### Using the skills

Antigravity discovers skills automatically. Mention a skill by name and the agent will activate it:

```
Run plugin-portability on /path/to/my-plugin
```

### OpenClaw

#### ClawHub install

```bash
openclaw plugins install skill-portability
```

#### npm install

```bash
npm install skill-portability
```

#### Local install

Add the plugin path to `openclaw.json`:

```json
{
  "plugins.load.paths": ["/path/to/skill-portability"]
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
codex marketplace add hiivmind/skill-portability
```

This adds a marketplace entry to `~/.codex/config.toml`.

Then open `/plugins` in Codex and install `skill-portability`.

Codex persists the plugin enablement as a separate config entry:

```toml
[plugins."skill-portability@skill-portability-marketplace"]
enabled = true
```

#### Local development install

Use this only when you are intentionally testing a local checkout rather than installing from GitHub.

```bash
codex marketplace add /path/to/skill-portability
```

Then open `/plugins` in Codex and install `skill-portability`.

#### Skill-discovery fallback

If you only want the raw skills and do not need Codex plugin packaging, clone the repo and expose the skills directory:

```bash
git clone https://github.com/hiivmind/skill-portability
ln -s $(pwd)/skill-portability/skills ~/.agents/skills/skill-portability
```

Use this as a fallback path, not the default install story for this repo.

#### Context file

Codex uses `AGENTS.md` as its primary context file.

#### Verify

Start a new Codex session and check one of:

- `/plugins` shows `skill-portability` as installed
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
claude --plugin-dir /path/to/existing/skill-portability
```

Or add to `.claude/settings.json` for persistent access:

```json
{
  "extraKnownMarketplaces": {
    "skill-portability-marketplace": {
      "source": {
        "source": "github",
        "repo": "hiivmind/skill-portability"
      }
    }
  }
}
```

### Cursor

Symlink your existing checkout into Cursor's plugin directory:

```bash
ln -s /path/to/existing/skill-portability ~/.cursor/plugins/local/skill-portability
```

Restart Cursor (Developer: Reload Window).

### Gemini CLI

Link Gemini to your existing checkout:

```bash
gemini extensions link /path/to/existing/skill-portability
```

### Antigravity

Copy skills from your existing checkout:

```bash
cp -r /path/to/existing/skill-portability/skills/ .agents/skills/
```

Or install as an extension:

```bash
antigravity --install-extension /path/to/existing/skill-portability
```

### OpenClaw

Add the checkout path to `openclaw.json`:

```json
{
  "plugins.load.paths": ["/path/to/existing/skill-portability"]
}
```

### Codex

For local development against an existing checkout, register the checkout itself as a marketplace:

```bash
codex marketplace add /path/to/existing/skill-portability
```

Then open `/plugins` in Codex and install `skill-portability`.

If you only want skill discovery, symlink the skills directory from your existing checkout:

```bash
ln -s /path/to/existing/skill-portability/skills ~/.agents/skills/skill-portability
```
