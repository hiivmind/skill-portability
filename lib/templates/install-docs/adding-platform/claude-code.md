### Claude Code

Point Claude Code at your existing checkout:

```bash
claude --plugin-dir /path/to/existing/{{name}}
```

Or add to `.claude/settings.json` for persistent access:

```json
{
  "extraKnownMarketplaces": ["/path/to/existing/{{name}}"]
}
```
