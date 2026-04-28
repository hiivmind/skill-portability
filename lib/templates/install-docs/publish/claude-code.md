## Claude Code

### Prerequisites

Create `.claude-plugin/marketplace.json` listing the plugins the repo contains. No submission or review process — any Git repo with a valid marketplace manifest can be consumed.

### Team / org distribution

Add to the team's project `.claude/settings.json` so teammates get the marketplace automatically:

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

Auto-enable plugins via `"enabledPlugins"` in the same settings file.
