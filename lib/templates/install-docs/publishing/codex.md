## Codex

Two publishing paths — choose based on what you're distributing.

### Skill discovery (lightweight)

For repos that are mostly instructions with no plugin UI metadata:

- Submit a PR to `github.com/openai/skills` for inclusion in the curated catalog
- Or publish as a standalone GitHub repo — users install via `$skill-installer install {{repository}}`

### Plugin packaging (full)

For first-class plugin packages with marketplace metadata:

- Create `.codex-plugin/plugin.json` and a `marketplace.json` listing the plugin
- Users register via `codex plugin marketplace add {{repository}}`
- Public self-serve plugin publishing is coming soon per OpenAI docs

### How users find and install {{displayName}}

**Skills path:**
```bash
$skill-installer install {{repository}}
```

**Plugin path:**
```bash
codex plugin marketplace add {{repository}}
```
