## OpenCode

### Local plugin install

Copy `.opencode/plugins/{{name}}.js` to your project's `.opencode/plugins/` directory, or to `~/.config/opencode/plugins/` for global install.

### npm install (if published)

Add to your `opencode.json`:

```json
{
  "plugin": ["{{name}}"]
}
```

### Context file

OpenCode uses `AGENTS.md` as its primary context file. If both `AGENTS.md` and `CLAUDE.md` exist, only `AGENTS.md` is loaded.

### Verify

Restart OpenCode and check that skills are listed when the agent invokes the `skill` tool.

### Requirements

OpenCode requires [Bun](https://bun.sh) for plugin loading.
