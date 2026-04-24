## Claude Code

No public marketplace — distribution is via Git repositories.

### Publishing

Create a `.claude-plugin/marketplace.json` in your repo. No submission or review process — any Git repo with a valid marketplace manifest can be consumed.

### How users find and install {{displayName}}

1. Register the marketplace: `/plugin marketplace add {{repository}}`
2. Install: `/plugin install {{name}}@{{marketplaceName}}`

### Team distribution

Teams can auto-register the marketplace by adding to their project `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "{{marketplaceName}}": {
      "source": {
        "source": "github",
        "repo": "{{repository}}"
      }
    }
  }
}
```
