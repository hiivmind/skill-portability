### OpenCode

Symlink the plugin entrypoint from your existing checkout (do not copy — it resolves paths relative to the repo root):

```bash
ln -s /path/to/existing/{{name}}/.opencode/plugins/{{name}}.js .opencode/plugins/{{name}}.js
```

Or add the checkout path to your `opencode.json`:

```json
{
  "plugin": ["/path/to/existing/{{name}}"]
}
```

Requires [Bun](https://bun.sh).
