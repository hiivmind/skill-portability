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
| Copilot CLI | skills.sh (3rd party) | `gh skill publish` | Not vetted | `gh skill search` | `gh skill install owner/repo` |
| OpenCode | npm | `npm publish` | N/A | npm search | Add to `opencode.json` `"plugin"` array |

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

## Copilot CLI

Skills published and discovered via GitHub CLI (v2.90.0+).

### Publishing

```bash
gh skill publish [--fix]
```

Validates skills against the Agent Skills specification. No formal review — skills are published to the GitHub repository.

### Requirements

`skills/<name>/SKILL.md` with `name` and `description` in YAML frontmatter.

### Discovery and install

```bash
gh skill search <keyword>
gh skill preview owner/repo skill-name    # inspect before installing
gh skill install owner/repo [skill-name]
gh skill install owner/repo skill-name@tag  # pin to version
```

Key flags: `--agent` (target specific host), `--scope` (user or project), `--pin` (lock version).

### Security

GitHub does not vet third-party skills. A Snyk study ("ToxicSkills") found that 36.82% of 3,984 skills from third-party registries carry security issues (prompt injections, hidden instructions, malicious scripts). Always run `gh skill preview` before installing.

### Third-party registries

- **skills.sh** — 300k+ monthly views, 1000+ skills with install counts
- **github/awesome-copilot** — GitHub's curated community collection
- **tech-leads-club/agent-skills** — "secure, validated skill registry"
- **VoltAgent/awesome-agent-skills** — 1000+ curated skills

### Server-side extensions

GitHub Marketplace also hosts server-side Copilot Extensions (invoked via `@extension-name`). These are GitHub App-based integrations requiring HTTPS endpoints — separate from file-based skills.

## OpenCode

No marketplace. Distribution via npm packages or filesystem.

### Publishing

Publish the plugin as an npm package. No submission or review process.

### Requirements

Plugin is a `.js` or `.ts` file exporting plugin functions. For npm distribution, standard `package.json` with the plugin as the entry point.

### Discovery and install

**npm packages:**
Add to `opencode.json`:
```json
{
  "plugin": ["package-name"]
}
```
Bun auto-installs at startup. Cached in `~/.cache/opencode/node_modules/`.

**Local files:**
Drop `.js`/`.ts` into `.opencode/plugins/` (project) or `~/.config/opencode/plugins/` (global). Auto-loaded at startup.

**Skills:**
Discovered from `.opencode/skills/`, `.agents/skills/`, `.claude/skills/` (compatibility). No install step — filesystem placement is sufficient.
