# Publishing & Discoverability

How to get a plugin discovered and installed on each platform. Use this reference when generating install documentation and advising plugin authors on publishing steps.

## Quick Reference

| Platform | Public marketplace | Submission | Review | Discovery | Install |
|----------|--------------------|------------|--------|-----------|---------|
| Claude Code | No (Git repos) | N/A | N/A | Share repo URL | 1. `/plugin marketplace add owner/repo` 2. `/plugin install name@marketplace` |
| Cursor | cursor.com/marketplace | cursor.com/marketplace/publish | Manual, open-source only | Marketplace search or `/add-plugin` | `/add-plugin owner/repo` |
| Gemini CLI | geminicli.com/extensions | Via gallery | Not vetted | Gallery search | `gemini extensions install <url>` |
| Codex (skills) | Community directories | GitHub repo | N/A | `$skill-installer` search | `$skill-installer <name>` |
| Codex (plugins) | Not yet public | N/A | N/A | `codex plugin marketplace add` | Via marketplace |
| Antigravity | No (Git repos + npm) | N/A | N/A | Community collections | Copy to `.agents/skills/` |
| OpenClaw | ClawHub (clawhub.ai) | ClawHub CLI or npm | Curated | ClawHub search | `openclaw plugins install clawhub:<pkg>` |

## Claude Code

No public marketplace or gallery. Distribution is via Git repositories.

### Publishing

Authors create a `.claude-plugin/marketplace.json` in their repo listing the plugins it contains. There is no submission or review process — any Git repo with a valid marketplace manifest can be consumed.

Marketplace entry sources:
- `"source": "github"` with `"repo": "owner/repo"`
- `"source": "url"` with a Git URL
- `"source": "git-subdir"` for monorepos
- `"source": "npm"` for npm-published packages

### Discovery and install

Users register the marketplace, then install:

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

Can also auto-enable plugins via `"enabledPlugins"` in the same settings file.

## Cursor

Public marketplace at `cursor.com/marketplace`. Curated and manually reviewed.

### Publishing

1. Plugin must be open-source in a Git repository
2. `.cursor-plugin/plugin.json` manifest required (minimum: `name` field)
3. Submit at `cursor.com/marketplace/publish`
4. Every plugin and update is manually reviewed

### Discovery and install

- Browse the marketplace at `cursor.com/marketplace`
- In Agent chat: `/add-plugin owner/repo` (GitHub shorthand or full URL)

### Team distribution

Cursor 2.6+ (Teams/Enterprise plans): admins import GitHub repos as team marketplaces via Dashboard Settings. Admins set plugins as required or optional.

### Local development

Symlink to `~/.cursor/plugins/local/<name>/`. Restart required (Developer: Reload Window).

## Gemini CLI

Extensions gallery at [geminicli.com/extensions](https://geminicli.com/extensions/) with 897+ extensions.

### Publishing

Extensions are published as GitHub repositories. The gallery lists them but Google does not vet, endorse, or guarantee functionality or security. Users should review extensions before installing.

Official extensions org: `github.com/gemini-cli-extensions` (43+ repos from Google).

### Requirements

`gemini-extension.json` manifest with `name`, `version`, and `description` fields.

### Discovery and install

- Browse the gallery at `geminicli.com/extensions`
- Install: `gemini extensions install <github-url>`
- Install with version pin: `gemini extensions install <url> --ref <tag>`

### Local development

`gemini extensions link <path>` creates a symlink for local dev. Changes require CLI restart.

## Codex — Skill Discovery Path

For repos that are mostly instructions with no plugin UI metadata needed.

### Publishing

- Publish as a standalone GitHub repo with `SKILL.md` frontmatter

### Requirements

`skills/<name>/SKILL.md` with `name` and `description` in YAML frontmatter.

### Discovery and install

- `$skill-installer <name>` — install by name
- `$skill-installer install <github-url>` — install by URL
- Manual: copy or symlink to `~/.codex/skills/<name>/` or `~/.agents/skills/<name>/`

Skills install into `~/.codex/skills/<name>/` by default. Restart Codex after adding new skills.

## Codex — Plugin Packaging Path

For first-class plugin packages with marketplace metadata and bundled components (hooks, MCP, apps).

### Publishing

Public self-serve plugin publishing is "coming soon" per OpenAI docs. Currently, plugins are distributed via Git repos with marketplace manifests.

### Requirements

- `.codex-plugin/plugin.json` manifest
- `marketplace.json` listing the plugin with source path, description, version

### Discovery and install

- Register a marketplace source: `codex plugin marketplace add owner/repo`
- Also accepts: `--ref <branch>`, `--sparse <path>`, SSH URLs, local paths
- Repo-local marketplace: `<repo>/.agents/plugins/marketplace.json`
- Home-local marketplace: `~/.agents/plugins/marketplace.json`

### Upgrade

`codex plugin marketplace upgrade [marketplace-name]`

## Antigravity

No official skill marketplace or registry. Distribution is via Git repositories, community npm installers, and manual sharing.

### Publishing

Skills are published as GitHub repositories. Community skill collections (e.g., `antigravity-awesome-skills` with 1,400+ skills) provide npm-based cross-platform installers.

### Requirements

- `.agents/skills/<name>/SKILL.md` with standard frontmatter
- `AGENTS.md` context file (optional but recommended)

Antigravity auto-discovers skills from `.agents/skills/` directories. No platform-specific manifest is required for skill distribution.

### Discovery and install

- Community collections: [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)
- npm installer: `npx antigravity-awesome-skills` (installs to `~/.gemini/antigravity/skills/`)
- Manual: copy skill directory into `.agents/skills/` (workspace) or `~/.gemini/antigravity/skills/` (global)

### Local development

Copy or symlink skill directory into `.agents/skills/`. Changes are picked up on next session start.

### VS Code extensions

As a VS Code fork, Antigravity uses **OpenVSX** for IDE extensions (separate from the skill system). Install via `--install-extension <path-to-vsix>`.

## OpenClaw

Public registry at [ClawHub](https://clawhub.ai). Also supports npm distribution.

### Publishing

Plugins are published via ClawHub CLI or npm:

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
- `AGENTS.md` context file (optional but recommended)
- `skills/*/SKILL.md` with standard frontmatter (for skill-bearing plugins)

### Discovery and install

- ClawHub: `openclaw plugins install clawhub:<package>`
- Skills: `openclaw skills install <slug>`
- npm: `openclaw plugins install @org/plugin-name`
- Bare names check ClawHub first, then npm

### Local development

`openclaw plugins install -l ./my-plugin` for linked local development. Or add to `plugins.load.paths` in `~/.openclaw/openclaw.json`.
