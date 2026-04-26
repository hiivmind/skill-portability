### OpenClaw

Create `openclaw/openclaw.plugin.json` with your plugin metadata (id, name, description, version, skills list).

Add the plugin to your local OpenClaw config for testing:

```bash
openclaw plugins install --path /path/to/existing/{{name}}
```

Verify with `openclaw plugins list` to confirm the plugin loads correctly.
