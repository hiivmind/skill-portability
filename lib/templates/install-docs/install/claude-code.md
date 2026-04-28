## Claude Code

### Install from GitHub

Register the plugin's marketplace, then install:

```bash
/plugin marketplace add {{repository}}
/plugin install {{name}}@{{marketplaceName}}
```

### Install from local clone

```bash
claude --plugin-dir /path/to/{{name}}
```

Or add to `.claude/settings.json` for persistent access:

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

### Verify

```bash
claude plugin list
```

Look for `{{name}}` in the output.
