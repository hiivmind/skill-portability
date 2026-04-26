# Publishing & Discoverability

How to get a plugin discovered and installed on each platform. Use this reference when generating install documentation and advising plugin authors on publishing steps.

## Quick Reference

| Platform | Public marketplace | Submission | Review | Discovery | Install |
|----------|--------------------|------------|--------|-----------|---------|
| Claude Code | No (Git repos) | N/A | N/A | Share repo URL | 1. `/plugin marketplace add owner/repo` 2. `/plugin install name@marketplace` |
| Cursor | cursor.com/marketplace | cursor.com/marketplace/publish | Manual, open-source only | Marketplace search or `/add-plugin` | `/add-plugin owner/repo` |
| Gemini CLI | geminicli.com/extensions | Via gallery | Not vetted | Gallery search | `gemini extensions install <url>` |
| Codex (skills) | github.com/openai/skills | PR to repo | Curated | `$skill-installer` search | `$skill-installer <name>` |
| Codex (plugins) | Not yet public | N/A | N/A | `codex plugin marketplace add` | Via marketplace |
| Antigravity | antigravity.dev/plugins | Submit via site | Community-reviewed | Plugin directory search | `antigravity plugin add <name>` |
| OpenClaw | openclaw.dev/registry | PR to registry repo | Curated | Registry search | `openclaw install <name>` |

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

- Submit a PR to `github.com/openai/skills` for inclusion in the curated catalog
- Skills go into `.curated/` (vetted) or `.experimental/` (community/developmental)
- Alternatively, publish as a standalone GitHub repo

### Requirements

`skills/<name>/SKILL.md` with `name` and `description` in YAML frontmatter.

### Discovery and install

- `$skill-installer <name>` — install from the curated catalog by name
- `$skill-installer install <name> from the .experimental folder`
- `$skill-installer install <github-url>` — install by URL
- Manual: clone and symlink `skills/` to `~/.agents/skills/<name>`

Skills install into `~/.codex/skills/<name>/` by default.

### Third-party registries

SkillsMP.com and Smithery.ai have emerged as community skill directories.

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

Plugin directory at [antigravity.dev/plugins](https://antigravity.dev/plugins/).

### Publishing

Plugins are published as GitHub repositories and submitted to the Antigravity plugin directory. Community members can review and rate plugins.

### Requirements

- `AGENTS.md` context file describing the plugin
- `skills/*/SKILL.md` with standard frontmatter

Antigravity auto-discovers skills from the `skills/` directory and context from `AGENTS.md`. No platform-specific manifest is required.

### Discovery and install

- Browse the directory at `antigravity.dev/plugins`
- Install: `antigravity plugin add <name>`
- Install from URL: `antigravity plugin add <github-url>`

### Local development

`antigravity plugin link <path>` for local development. Changes are picked up on next session start.

## OpenClaw

Plugin registry at [openclaw.dev/registry](https://openclaw.dev/registry/).

### Publishing

Plugins are published by submitting a PR to the OpenClaw registry repository. Registry entries are curated and reviewed before inclusion.

### Requirements

- `AGENTS.md` context file describing the plugin
- `skills/*/SKILL.md` with standard frontmatter

OpenClaw auto-discovers skills from the `skills/` directory and context from `AGENTS.md`. No platform-specific manifest is required.

### Discovery and install

- Browse the registry at `openclaw.dev/registry`
- Install: `openclaw install <name>`
- Install from URL: `openclaw install <github-url>`

### Local development

`openclaw link <path>` for local development.

