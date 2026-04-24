### Codex

For local development against an existing checkout, register the checkout itself as a marketplace:

```bash
codex marketplace add /path/to/existing/{{name}}
```

Then open `/plugins` in Codex and install `{{name}}`.

If you only want skill discovery, symlink the skills directory from your existing checkout:

```bash
ln -s /path/to/existing/{{name}}/skills ~/.agents/skills/{{name}}
```
