## Codex

Codex supports two different install shapes. Use the one that matches what this repo ships.

### Native plugin packaging

If the repo includes both `.codex-plugin/plugin.json` and `.agents/plugins/marketplace.json`, install it as a Codex plugin:

```bash
codex marketplace add {{repository}}
```

Then open `/plugins` in Codex and install `{{name}}`.

Codex persists the plugin enablement as a separate config entry:

```toml
[plugins."{{name}}@{{marketplaceName}}"]
enabled = true
```

### Local development for plugin repos

Use this only when you are intentionally testing a local checkout rather than installing from GitHub:

```bash
codex marketplace add /path/to/{{name}}
```

Then open `/plugins` in Codex and install `{{name}}`.

### Skill discovery

If the repo is published as raw skills only, or you only want the skills and do not need Codex plugin packaging, clone the repo and expose the skills directory:

```bash
git clone {{repository}}
ln -s $(pwd)/{{name}}/skills ~/.agents/skills/{{name}}
```

Use this path when the repo does not ship Codex plugin manifests, or when you intentionally want skills without plugin packaging.

### Context file

Codex uses `AGENTS.md` as its primary context file.

### Hooks

If this plugin includes hooks (`hooks/hooks.json`), enable the Codex hooks feature flag:

```toml
# ~/.codex/config.toml
[features]
codex_hooks = true
```

Without this flag, hooks are silently ignored. Codex uses the same `hooks/hooks.json` format as Claude Code — no separate hook file is needed.

### Multi-agent support

If this plugin's skills use subagent dispatch, confirm multi-agent mode is enabled:

```toml
# ~/.codex/config.toml
[features]
multi_agent = true
```

### Verify

Start a new Codex session and check one of:

- `/plugins` shows `{{name}}` as installed
- `~/.codex/config.toml` contains both the marketplace entry and the enabled plugin entry
- the relevant `$` skill resolves in a fresh session
