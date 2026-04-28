# Publishing & Discoverability

How to get a plugin discovered and installed on each platform. Use this reference when generating install documentation and advising plugin authors on publishing steps.

## Quick Reference

| Platform | Registry | How to list | How to install |
|----------|----------|-------------|----------------|
| Claude Code | None (Git repos) | Share repo URL | `/plugin marketplace add owner/repo` then `/plugin install name@marketplace` |
| Cursor | cursor.com/marketplace | Submit at cursor.com/marketplace/publish (manual review, open-source only) | `/add-plugin owner/repo` |
| Gemini CLI | geminicli.com/extensions (908+) | Add `gemini-cli-extension` topic to GitHub repo; auto-indexed daily | `gemini extensions install <github-url>` |
| Codex (skills) | None | Publish as GitHub repo with `SKILL.md` | `$skill-installer <name>` or copy to `~/.codex/skills/` |
| Codex (plugins) | Official directory (self-serve coming soon) | Browse via `/plugins` in Codex | `codex plugin marketplace add owner/repo` |
| Antigravity | None | Share repo URL | Copy to `.agents/skills/` |
| OpenClaw | ClawHub (clawhub.ai) | `clawhub package publish` or `clawhub skill publish` | `openclaw plugins install clawhub:<pkg>` |

## Claude Code

No public marketplace. Distribution is via Git repositories.

### Publishing

Create `.claude-plugin/marketplace.json` listing the plugins the repo contains. No submission or review process — any Git repo with a valid marketplace manifest can be consumed.

Marketplace entry sources:
- `"source": "github"` with `"repo": "owner/repo"`
- `"source": "url"` with a Git URL
- `"source": "git-subdir"` for monorepos
- `"source": "npm"` for npm-published packages

### Install

Register the marketplace, then install from it:

```
/plugin marketplace add owner/repo
/plugin install plugin-name@marketplace-name
```

### Team distribution

Add to project `.claude/settings.json` so teammates get the marketplace automatically:

```json
{
  "extraKnownMarketplaces": {
    "marketplace-name": {
      "source": {
        "source": "github",
        "repo": "owner/repo"
      }
    }
  }
}
```

Auto-enable plugins via `"enabledPlugins"` in the same settings file.

## Cursor

Public marketplace at `cursor.com/marketplace`. Every plugin and update is manually reviewed.

### Publishing

1. Plugin must be open-source in a Git repository
2. `.cursor-plugin/plugin.json` manifest required (minimum: `name` field)
3. Submit at `cursor.com/marketplace/publish`

### Install

- Browse `cursor.com/marketplace`
- In Agent chat: `/add-plugin owner/repo` (GitHub shorthand or full URL)

### Team distribution

Cursor 2.6+ (Teams/Enterprise): admins import GitHub repos as team marketplaces via Dashboard Settings. Admins set plugins as required or optional.

### Local development

Symlink to `~/.cursor/plugins/local/<name>/`. Restart required (Developer: Reload Window).

## Gemini CLI

Extensions gallery at [geminicli.com/extensions](https://geminicli.com/extensions/) with 908+ extensions. Google does not vet or endorse listed extensions.

### Publishing

No manual submission process. To get listed:

1. Host extension in a **public GitHub repository**
2. Add the `gemini-cli-extension` topic to the repository's About section
3. Include `gemini-extension.json` at repo root with `name`, `version`, `description`
4. The gallery crawler indexes tagged repos daily; listing appears within ~1 week

Official extensions org: `github.com/gemini-cli-extensions`.

### Install

```bash
gemini extensions install <github-url>
gemini extensions install <github-url> --ref <tag>   # version pin
gemini extensions install <source> --auto-update
```

Scopes: user-level (`~/.gemini/extensions/`) or workspace (`.gemini/extensions/`). Toggle with `gemini extensions enable/disable <name> [--scope workspace]`.

### Local development

`gemini extensions link <path>` creates a symlink. Changes are reflected immediately without reinstalling.

## Codex — Skills

For repos that are mostly instructions with no plugin metadata needed.

### Publishing

Publish as a GitHub repo with `SKILL.md` frontmatter (`name` and `description` in YAML).

### Install

```bash
$skill-installer <name>

# Manual alternatives
cp -R skill-folder/ ~/.codex/skills/<name>/
ln -s /path/to/skill-folder ~/.agents/skills/<name>
```

Restart Codex after adding new skills.

## Codex — Plugins

For packages with marketplace metadata and bundled components (hooks, MCP, apps).

### Publishing

Self-serve publishing to the official Plugin Directory is coming soon. Currently plugins are distributed via Git repos with marketplace manifests.

Requirements:
- `.codex-plugin/plugin.json` manifest
- `marketplace.json` listing the plugin with source path, description, version

### Install

```bash
codex plugin marketplace add owner/repo
codex plugin marketplace add owner/repo --ref main
codex plugin marketplace add <url> --sparse .agents/plugins
codex plugin marketplace add ./local-marketplace-root
```

Browse and search via `/plugins` in the Codex interactive UI.

Repo-local marketplace: `<repo>/.agents/plugins/marketplace.json`
Home-local marketplace: `~/.agents/plugins/marketplace.json`

### Upgrade

`codex plugin marketplace upgrade [marketplace-name]`

## Antigravity

No official marketplace or registry. Distribution is via Git repositories and manual sharing.

### Publishing

Publish skills as GitHub repositories with `.agents/skills/<name>/SKILL.md` (standard frontmatter). Antigravity auto-discovers skills from `.agents/skills/` directories — no platform-specific manifest required.

Optional: `AGENTS.md` context file.

### Install

```bash
# Workspace scope
cp -R /path/to/skill-name .agents/skills/

# Global scope
cp -R /path/to/skill-name ~/.gemini/antigravity/skills/
```

Changes are picked up on next session start.

## OpenClaw

Public registry at [ClawHub](https://clawhub.ai). Also supports npm distribution.

### Publishing

Via ClawHub CLI or npm:

```bash
npm i -g clawhub
clawhub login
clawhub package publish your-org/your-plugin
clawhub skill publish ./my-skill-pack
```

Alternatively, publish to npm with `openclaw.extensions` in `package.json`.

### Requirements

- `openclaw.plugin.json` manifest with `id` and `configSchema` (required for native plugins)
- `package.json` with `openclaw.extensions` and `openclaw.compat` (required for npm distribution)
- Optional: `AGENTS.md` context file, `skills/*/SKILL.md` for skill-bearing plugins

### Install

- ClawHub: `openclaw plugins install clawhub:<package>`
- Skills: `openclaw skills install <slug>`
- npm: `openclaw plugins install @org/plugin-name`
- Bare names check ClawHub first, then npm

### Local development

`openclaw plugins install -l ./my-plugin` for linked local development. Or add to `plugins.load.paths` in `~/.openclaw/openclaw.json`.
