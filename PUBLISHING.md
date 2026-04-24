# Publishing & Discoverability

How to get **Skill Portability** discovered and installed on each platform.

See [INSTALL.md](INSTALL.md) for end-user installation instructions.

## Claude Code

No public marketplace — distribution is via Git repositories.

### Publishing

Create a `.claude-plugin/marketplace.json` in your repo. No submission or review process — any Git repo with a valid marketplace manifest can be consumed.

### How users find and install Skill Portability

1. Register the marketplace: `/plugin marketplace add hiivmind/skill-portability`
2. Install: `/plugin install skill-portability@skill-portability-marketplace`

### Team distribution

Teams can auto-register the marketplace by adding to their project `.claude/settings.json`:

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

## Cursor

Public marketplace at `cursor.com/marketplace` (curated, manually reviewed).

### Publishing

1. Ensure the plugin is open-source in a Git repository
2. `.cursor-plugin/plugin.json` manifest must be present
3. Submit at `cursor.com/marketplace/publish`
4. Every plugin and update is manually reviewed

### How users find and install Skill Portability

- Browse the marketplace at `cursor.com/marketplace`
- In Agent chat: `/add-plugin hiivmind/skill-portability`

### Team distribution

Cursor 2.6+ (Teams/Enterprise): admins import GitHub repos as team marketplaces via Dashboard Settings.

## Gemini CLI

Extensions gallery at [geminicli.com/extensions](https://geminicli.com/extensions/).

### Publishing

Publish as a GitHub repository with a `gemini-extension.json` manifest (requires `name`, `version`, `description`). Extensions are not vetted by Google.

### How users find and install Skill Portability

```bash
gemini extensions install hiivmind/skill-portability
```

Users can browse the gallery or install directly from the GitHub URL.

## OpenCode

No marketplace. Distribution via npm or filesystem.

### Publishing

Publish the plugin as an npm package. No submission or review process.

### How users find and install Skill Portability

**npm:**
Add to `opencode.json`:

```json
{
  "plugin": ["skill-portability"]
}
```

**Local files:**
Copy `.opencode/plugins/skill-portability.js` to `.opencode/plugins/` (project) or `~/.config/opencode/plugins/` (global).

Requires [Bun](https://bun.sh) for plugin loading.

## Copilot CLI

Skills published via GitHub CLI (v2.90.0+).

### Publishing

```bash
gh skill publish [--fix]
```

Validates against the Agent Skills spec. No formal review — skills are published to the GitHub repository.

### How users find and install Skill Portability

```bash
gh skill search skill-portability
gh skill preview hiivmind/skill-portability skill-portability
gh skill install hiivmind/skill-portability
```

### Third-party registries

- [skills.sh](https://skills.sh) — community directory with 300k+ monthly views
- [github/awesome-copilot](https://github.com/github/awesome-copilot) — GitHub's curated collection

### Security note

Always recommend users run `gh skill preview` before installing. GitHub does not vet third-party skills.

## Codex

Two publishing paths — choose based on what you're distributing.

### Skill discovery (lightweight)

For repos that are mostly instructions with no plugin UI metadata:

- Submit a PR to `github.com/openai/skills` for inclusion in the curated catalog
- Or publish as a standalone GitHub repo — users install via `$skill-installer install hiivmind/skill-portability`

### Plugin packaging (full)

For first-class plugin packages with marketplace metadata:

- Create `.codex-plugin/plugin.json` and a `marketplace.json` listing the plugin
- Users register via `codex plugin marketplace add hiivmind/skill-portability`
- Public self-serve plugin publishing is coming soon per OpenAI docs

### How users find and install Skill Portability

**Skills path:**

```bash
$skill-installer install hiivmind/skill-portability
```

**Plugin path:**

```bash
codex plugin marketplace add hiivmind/skill-portability
```
