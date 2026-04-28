## Codex

### Install from registry

Open `/plugins` in Codex, search for **{{name}}**, and install it.

### Install from GitHub

Register the repo as a marketplace source:

```bash
codex plugin marketplace add {{repository}}
```

Then open `/plugins` in Codex and install `{{name}}`.

### Install from local clone

```bash
codex plugin marketplace add /path/to/{{name}}
```

Then open `/plugins` in Codex and install `{{name}}`.

### Platform notes

**Context file:** Codex uses `AGENTS.md` as its primary context file.

**Hooks:** If this plugin includes hooks, enable the Codex hooks feature flag:

```toml
# ~/.codex/config.toml
[features]
codex_hooks = true
```

Without this flag, hooks are silently ignored.

**Multi-agent:** If this plugin's skills use subagent dispatch, confirm multi-agent mode is enabled:

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
