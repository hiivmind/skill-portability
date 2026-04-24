## Codex

### Skill-discovery install

Clone the repo and expose the skills directory:

```bash
git clone {{repository}}
ln -s $(pwd)/{{name}}/skills ~/.agents/skills/{{name}}
```

Restart Codex. Skills will be discoverable through native skill discovery.

### Native plugin install

If packaged as a Codex plugin:

1. Ensure `.codex-plugin/plugin.json` exists in the plugin directory
2. Add a marketplace entry:

```json
{
  "plugins": [
    {
      "name": "{{name}}",
      "source": "./plugins/{{name}}"
    }
  ]
}
```

3. Place `marketplace.json` at `~/.agents/plugins/marketplace.json` (home-local) or `<repo>/.agents/plugins/marketplace.json` (repo-local)
4. Restart Codex

### Context file

Codex uses `AGENTS.md` as its primary context file.

### Multi-agent support

If this plugin's skills use subagent dispatch, enable multi-agent mode:

```toml
# ~/.codex/config.toml
[features]
multi_agent = true
```

### Verify

Start a new Codex session and check that skills are listed.
