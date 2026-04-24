# Publishing & Discoverability Reference Doc

**Date:** 2026-04-24

## Problem

Marketplace publishing and discoverability information is scattered across 6 platform docs. The uplift skill can generate all the platform artifacts, but there's no consolidated reference for advising plugin authors on how to actually get their plugin discovered and installed on each platform.

## Scope

One new file: `lib/patterns/platforms/publishing-and-discoverability.md`

This is a patterns file in `lib/patterns/platforms/` where the skills already read platform-specific guidance. The uplift skill will use this when generating install documentation and advising on publishing steps for target plugins.

## Structure

Per platform, cover:
1. **Where to publish** — marketplace URL, CLI command, or filesystem convention
2. **Requirements** — open-source, manifest fields, review process, submission steps
3. **How users discover it** — search, browse, CLI commands
4. **How users install it** — exact commands/steps (full flow, not just prerequisites)
5. **Third-party registries** — if relevant (skills.sh, geminicli.com/extensions, etc.)
6. **Team/org distribution** — how to share within a team without going through a public marketplace

## Platform Coverage

### Claude Code

- No public marketplace/gallery — distribution is via Git repos
- Authors create `marketplace.json` in their repo
- Users register the marketplace: `/plugin marketplace add owner/repo`
- Users then install: `/plugin install plugin-name@marketplace-name`
- Team distribution: `extraKnownMarketplaces` in project `.claude/settings.json` (object format with `source.source: "github"`)
- npm source type also supported in marketplace entries

### Cursor

- Public marketplace at `cursor.com/marketplace` (curated, manually reviewed)
- Requirements: open-source, Git repository, `.cursor-plugin/plugin.json` manifest
- Submission at `cursor.com/marketplace/publish`
- Users can also install from GitHub via `/add-plugin owner/repo` in Agent chat
- Team/Enterprise: admins import GitHub repos as team marketplaces via Dashboard Settings
- Local dev: symlink to `~/.cursor/plugins/local/<name>/`

### Gemini CLI

- Extensions gallery at `geminicli.com/extensions` (897+ extensions)
- Not vetted by Google — users should review before installing
- Requirements: `gemini-extension.json` manifest with name, version, description
- Users install via `gemini extensions install <github-url>`
- Local dev via `gemini extensions link <path>`
- Official extensions org at `github.com/gemini-cli-extensions`

### Codex — Skill Discovery Path

For repos that are mostly instructions with no plugin UI metadata:

- Official curated catalog at `github.com/openai/skills` (`.curated/` and `.experimental/` folders)
- Authors submit PRs to `github.com/openai/skills` for inclusion
- Users install via `$skill-installer` built-in skill (by name from `.curated` or by GitHub URL)
- Users can also clone and symlink: `ln -s skills/ ~/.agents/skills/<name>`
- Required artifacts: `skills/<name>/SKILL.md` with name and description frontmatter

### Codex — Plugin Packaging Path

For first-class plugin packages with marketplace metadata:

- Plugin marketplace via `codex plugin marketplace add owner/repo`
- Repo-local marketplace: `.agents/plugins/marketplace.json`
- Home-local marketplace: `~/.agents/plugins/marketplace.json`
- Required artifacts: `.codex-plugin/plugin.json`, `marketplace.json` with plugin entries
- Public self-serve plugin publishing is "coming soon" per OpenAI docs

### Copilot CLI

- `gh skill publish [--fix]` validates and publishes skills (requires GitHub CLI v2.90.0+)
- `gh skill search <keyword>` for discovery
- `gh skill install <owner/repo> [skill-name]` for installation
- Third-party registry: skills.sh (300k+ monthly views, 1000+ skills)
- GitHub's curated collection: `github/awesome-copilot`
- Security: 36.82% of third-party skills have security issues (Snyk "ToxicSkills" study) — always `gh skill preview` first
- GitHub Marketplace for server-side Copilot Extensions (separate from file-based skills)

### OpenCode

- No marketplace — distribution is via npm packages or filesystem
- npm: add package name to `"plugin"` array in `opencode.json`, Bun auto-installs
- Filesystem: drop `.js`/`.ts` into `.opencode/plugins/` or `~/.config/opencode/plugins/`
- Skills discovered from `.opencode/skills/`, `.agents/skills/`, `.claude/skills/` (compatibility)
- No submission or review process — publish to npm and document install

## Summary Table

Include a quick-reference table at the top of the doc:

| Platform | Public marketplace | Submission | Review | Discovery | Install |
|----------|--------------------|------------|--------|-----------|---------|
| Claude Code | No (Git repos) | N/A | N/A | Share repo URL | 1. `/plugin marketplace add owner/repo` 2. `/plugin install name@marketplace` |
| Cursor | cursor.com/marketplace | cursor.com/marketplace/publish | Manual, open-source only | Marketplace search or `/add-plugin` | `/add-plugin owner/repo` |
| Gemini CLI | geminicli.com/extensions | Via gallery | Not vetted | Gallery search | `gemini extensions install <url>` |
| Codex (skills) | github.com/openai/skills | PR to repo | Curated | `$skill-installer` search | `$skill-installer <name>` |
| Codex (plugins) | Not yet public | N/A | N/A | `codex plugin marketplace add` | Via marketplace |
| Copilot CLI | skills.sh (3rd party) | `gh skill publish` | Not vetted | `gh skill search` | `gh skill install owner/repo` |
| OpenCode | npm | `npm publish` | N/A | npm search | Add to `opencode.json` `"plugin"` array |

## Files changed

- Create: `lib/patterns/platforms/publishing-and-discoverability.md`

## Files not changed

- `docs/platforms/` — existing platform docs stay as-is; this new file lives in `lib/patterns/platforms/` where skills read from
- Skills — no changes to skill logic in this spec (skill wiring is a follow-up)
- INSTALL.md, README.md — these document skill-portability's own install, not target plugin publishing
