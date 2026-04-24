## OpenCode

No marketplace. Distribution via npm or filesystem.

### Publishing

Publish the plugin as an npm package. No submission or review process.

### How users find and install {{displayName}}

**npm:**
Add to `opencode.json`:
```json
{
  "plugin": ["{{name}}"]
}
```

**Local files:**
Copy `.opencode/plugins/{{name}}.js` to `.opencode/plugins/` (project) or `~/.config/opencode/plugins/` (global).

Requires [Bun](https://bun.sh) for plugin loading.
