# Installation

How to install **Plugin Portability** on each supported platform.

## Important: Whole-repo install required

This plugin uses shared hooks, context files, and platform manifests that live outside
individual skill directories. Installing via `npx skills` (which copies only the `skills/`
directory) will lose these shared files and break session-start injection.

Every install path below clones or references the full repo. See
[docs/ecosystem-landscape.md](docs/ecosystem-landscape.md) for background on why this is
necessary across today's agent platforms.

## Claude Code

### Install from GitHub

Register the plugin's marketplace, then install:

```bash
/plugin marketplace add hiivmind/plugin-portability
/plugin install plugin-portability@plugin-portability-marketplace
```

### Install from local clone

```bash
claude --plugin-dir /path/to/plugin-portability
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

### Verify

```bash
claude plugin list
```

Look for `plugin-portability` in the output.

## Cursor

### Install from registry

Search for **plugin-portability** in the Cursor marketplace panel, visit `cursor.com/marketplace`, or run in Agent chat:

```
/add-plugin plugin-portability@https://github.com/hiivmind/plugin-portability
```

### Install from GitHub

```
/add-plugin plugin-portability@https://github.com/hiivmind/plugin-portability
```

### Install from local clone

Symlink or copy the plugin directory and restart Cursor (Developer: Reload Window):

```bash
ln -s /path/to/plugin-portability ~/.cursor/plugins/local/plugin-portability
```

### Verify

Open Cursor and check that skills from plugin-portability appear when typing `/` in chat. Rules should appear in Cursor Settings > Rules with the plugin name prefix.

## Gemini CLI

### Install from registry

Browse the gallery at [geminicli.com/extensions](https://geminicli.com/extensions/) and search for **plugin-portability**, or install directly:

```bash
gemini extensions install hiivmind/plugin-portability
```

With version pin:

```bash
gemini extensions install hiivmind/plugin-portability --ref <tag>
```

### Install from GitHub

```bash
gemini extensions install hiivmind/plugin-portability
```

### Install from local clone

```bash
gemini extensions link /path/to/plugin-portability
```

Changes are reflected immediately without reinstalling.

### Verify

```bash
gemini extensions list
```

Look for `plugin-portability` in the output.

## Codex

### Install from registry

Open `/plugins` in Codex, search for **plugin-portability**, and install it.

### Install from GitHub

Register the repo as a marketplace source:

```bash
codex plugin marketplace add hiivmind/plugin-portability
```

Then open `/plugins` in Codex and install `plugin-portability`.

### Install from local clone

```bash
codex plugin marketplace add /path/to/plugin-portability
```

Then open `/plugins` in Codex and install `plugin-portability`.

### Platform notes

**Context file:** Codex uses `AGENTS.md` as its primary context file.

**Hooks:** If this plugin includes hooks, enable the Codex hooks feature flag:

```toml
# ~/.codex/config.toml
[features]
codex_hooks = true
```

Without this flag, hooks are silently ignored.

**Multi-agent:** If this plugin's skills use subagent dispatch, confirm multi-agent mode is enabled:

```toml
# ~/.codex/config.toml
[features]
multi_agent = true
```

### Verify

Start a new Codex session and check one of:

- `/plugins` shows `plugin-portability` as installed
- `~/.codex/config.toml` contains both the marketplace entry and the enabled plugin entry
- the relevant `$` skill resolves in a fresh session

## Antigravity

### Install from GitHub

```bash
git clone hiivmind/plugin-portability
cp -R plugin-portability/.agents/skills/plugin-portability .agents/skills/
```

Or for global scope:

```bash
cp -R plugin-portability/.agents/skills/plugin-portability ~/.gemini/antigravity/skills/
```

### Install from local clone

```bash
cp -R /path/to/plugin-portability/.agents/skills/plugin-portability .agents/skills/
```

Or for global scope:

```bash
cp -R /path/to/plugin-portability/.agents/skills/plugin-portability ~/.gemini/antigravity/skills/
```

### Verify

Start a new Antigravity session and check that skills from Plugin Portability appear in the skill listing at conversation start.

## OpenClaw

### Install from registry

Install from ClawHub:

```bash
openclaw plugins install clawhub:plugin-portability
```

Or from npm:

```bash
openclaw plugins install @org/plugin-portability
```

### Install from GitHub

Clone the repo and install locally:

```bash
git clone hiivmind/plugin-portability
openclaw plugins install -l ./plugin-portability
```

### Install from local clone

Add to `plugins.load.paths` in `~/.openclaw/openclaw.json`:

```json
{
  "plugins": {
    "load": {
      "paths": ["/path/to/plugin-portability"]
    }
  }
}
```

### Verify

```bash
openclaw plugins list
```

Skills from Plugin Portability should appear in the plugin listing.
