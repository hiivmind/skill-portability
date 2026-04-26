## OpenClaw

### ClawHub install

Install directly from the ClawHub registry:

```bash
openclaw plugins install {{name}}
```

### npm install

If published to npm under an org scope:

```bash
openclaw plugins install @org/openclaw-{{name}}
```

### Local install

Add the plugin path to `plugins.load.paths` in your `openclaw.json` config:

```json
{
  "plugins": {
    "load": {
      "paths": ["/path/to/{{name}}"]
    }
  }
}
```

### Bundle detection

OpenClaw can auto-detect plugins that use the `.claude-plugin/` directory layout. If your plugin already has a `.claude-plugin/plugin.json`, OpenClaw may load it without conversion. Test with a local install first.

### Verify

Check that the plugin loads successfully in the gateway logs:

```bash
openclaw plugins list
openclaw logs --filter="plugin:{{name}}"
```

Skills from {{displayName}} should appear in the plugin listing and be invocable from chat.
