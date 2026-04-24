## Claude Code

### Marketplace install

```bash
claude plugin install {{name}}@{{marketplaceName}}
```

### Local development

```bash
claude --plugin-dir ./path-to-{{name}}
```

### Project install

Add to `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": ["./path-to-marketplace"]
}
```

### Verify

```bash
claude plugin list
```

Look for `{{name}}` in the output.
