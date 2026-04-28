## OpenClaw

### Install from registry

Install from ClawHub:

```bash
openclaw plugins install clawhub:{{name}}
```

Or from npm:

```bash
openclaw plugins install @org/{{name}}
```

### Install from GitHub

Clone the repo and install locally:

```bash
git clone {{repository}}
openclaw plugins install -l ./{{name}}
```

### Install from local clone

Add to `plugins.load.paths` in `~/.openclaw/openclaw.json`:

```json
{
  "plugins": {
    "load": {
      "paths": ["/path/to/{{name}}"]
    }
  }
}
```

### Verify

```bash
openclaw plugins list
```

Skills from {{displayName}} should appear in the plugin listing.
