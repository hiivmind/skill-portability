# Publishing & Discoverability

How to get **Skill Portability** discovered and installed on each platform.

See [INSTALL.md](INSTALL.md) for end-user installation instructions.

## Claude Code

No public marketplace — distribution is via Git repositories.

### Publishing

Create a `.claude-plugin/marketplace.json` in your repo. No submission or review process — any Git repo with a valid marketplace manifest can be consumed.

### How users find and install Skill Portability

1. Register the marketplace: `/plugin marketplace add hiivmind/plugin-portability`
2. Install: `/plugin install plugin-portability@plugin-portability-marketplace`

### Team distribution

Teams can auto-register the marketplace by adding to their project `.claude/settings.json`:

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

## Cursor

Public marketplace at `cursor.com/marketplace` (curated, manually reviewed).

### Publishing

1. Ensure the plugin is open-source in a Git repository
2. `.cursor-plugin/plugin.json` manifest must be present
3. Submit at `cursor.com/marketplace/publish`
4. Every plugin and update is manually reviewed

### How users find and install Skill Portability

- Browse the marketplace at `cursor.com/marketplace`
- In Agent chat: `/add-plugin hiivmind/plugin-portability`

### Team distribution

Cursor 2.6+ (Teams/Enterprise): admins import GitHub repos as team marketplaces via Dashboard Settings.

## Gemini CLI

Extensions gallery at [geminicli.com/extensions](https://geminicli.com/extensions/).

### Publishing

Publish as a GitHub repository with a `gemini-extension.json` manifest (requires `name`, `version`, `description`). Extensions are not vetted by Google.

### How users find and install Skill Portability

```bash
gemini extensions install hiivmind/plugin-portability
```

Users can browse the gallery or install directly from the GitHub URL.

## Antigravity

Published to the [OpenVSX](https://open-vsx.org/) registry.

### Publishing

Package the plugin as a VSIX extension and publish to OpenVSX:

```bash
antigravity publish
```

Extensions are reviewed by the OpenVSX team before listing.

### How users find and install Skill Portability

```bash
antigravity --install-extension hiivmind.plugin-portability
```

Users can also browse and install from the OpenVSX web registry.

## OpenClaw

Published to [ClawHub](https://clawhub.dev/) and via npm.

### Publishing

Publish as an npm package and register on ClawHub:

```bash
npm publish
```

Then submit to ClawHub for listing. No formal review process.

### How users find and install Skill Portability

**npm:**

```bash
npm install -g @hiivmind/plugin-portability
```

**ClawHub:**

Browse [clawhub.dev](https://clawhub.dev/) and install directly from the listing.

## Codex

Two publishing paths — choose based on what you're distributing.

### Skill discovery (lightweight)

For repos that are mostly instructions with no plugin UI metadata:

- Submit a PR to `github.com/openai/skills` for inclusion in the curated catalog
- Or publish as a standalone GitHub repo — users install through Codex skill discovery
- Only recommend `$skill-installer install hiivmind/plugin-portability` when the distributed artifact is truly a skill-only repo and does not depend on root-level plugin manifests, hooks, or shared context files

### Plugin packaging (full)

For first-class plugin packages with marketplace metadata:

- Create `.codex-plugin/plugin.json` and `.agents/plugins/marketplace.json`
- For a single-plugin GitHub repo, the marketplace entry should point at the repo root with `source.path: "./"`
- Users register via `codex marketplace add hiivmind/plugin-portability`
- Users then enable the plugin from `/plugins`
- Public self-serve plugin publishing is coming soon per OpenAI docs

### How users find and install Skill Portability

**Skill-only repo:**

```bash
git clone hiivmind/plugin-portability
ln -s $(pwd)/plugin-portability/skills ~/.agents/skills/plugin-portability
```

**Plugin repo:**

```bash
codex marketplace add hiivmind/plugin-portability
```

Then enable `plugin-portability` from `/plugins`.
