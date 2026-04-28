# Publishing & Discoverability

How to get **Plugin Portability** listed and distributed on each platform.

See [INSTALL.md](INSTALL.md) for end-user installation instructions.

## Claude Code

### Prerequisites

Create `.claude-plugin/marketplace.json` listing the plugins the repo contains. No submission or review process — any Git repo with a valid marketplace manifest can be consumed.

### Team / org distribution

Add to the team's project `.claude/settings.json` so teammates get the marketplace automatically:

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

Auto-enable plugins via `"enabledPlugins"` in the same settings file.

## Cursor

### Prerequisites

- Plugin must be open-source in a Git repository
- `.cursor-plugin/plugin.json` manifest required (minimum: `name` field)

### Submit to registry

1. Go to `cursor.com/marketplace/publish`
2. Submit the plugin for review
3. Every plugin and update is manually reviewed before listing

### Team / org distribution

Cursor 2.6+ (Teams/Enterprise): admins import GitHub repos as team marketplaces via Dashboard Settings. Admins set plugins as required or optional.

## Gemini CLI

### Prerequisites

Include `gemini-extension.json` at the repo root with `name`, `version`, and `description` fields. The repo must be public on GitHub.

### Submit to registry

No manual submission process. To get listed in the gallery:

1. Add the `gemini-cli-extension` topic to the repository's About section on GitHub
2. The gallery crawler indexes tagged repos daily; listing appears within ~1 week

Browse existing extensions at [geminicli.com/extensions](https://geminicli.com/extensions/).

## Codex

### Prerequisites

- `.codex-plugin/plugin.json` manifest
- `.agents/plugins/marketplace.json` listing the plugin with source path, description, version
- For a single-plugin GitHub repo, the marketplace entry should point at the repo root with `source.path: "./"`

Self-serve publishing to the official Plugin Directory is coming soon. In the meantime, plugins are distributed via Git repos with marketplace manifests.

## Antigravity

### Prerequisites

- `.agents/skills/plugin-portability/SKILL.md` with standard frontmatter (`name`, `description`)
- Optional: `AGENTS.md` context file

Antigravity auto-discovers skills from `.agents/skills/` directories — no platform-specific manifest or registry submission required. Share the Git repository URL to distribute.

## OpenClaw

### Prerequisites

- `openclaw/openclaw.plugin.json` manifest with `id` and `configSchema` (required for native plugins)
- `package.json` with `openclaw.extensions` and `openclaw.compat` (required for npm distribution)
- Optional: `AGENTS.md` context file, `skills/*/SKILL.md` for skill-bearing plugins

### Submit to registry

**ClawHub:**

```bash
npm i -g clawhub
clawhub login
clawhub package publish your-org/plugin-portability
```

**npm (alternative):**

```bash
npm publish --access public
```

Users can install from either registry. Bare names check ClawHub first, then npm.
