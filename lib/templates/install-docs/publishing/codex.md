## Codex

Two publishing paths — choose based on what you're distributing.

### Skill discovery (lightweight)

For repos that are mostly instructions with no plugin UI metadata:

- Submit a PR to `github.com/openai/skills` for inclusion in the curated catalog
- Or publish as a standalone GitHub repo — users install through Codex skill discovery
- Only recommend `$skill-installer install {{repository}}` when the distributed artifact is truly a skill-only repo and does not depend on root-level plugin manifests, hooks, or shared context files

### Plugin packaging (full)

For first-class plugin packages with marketplace metadata:

- Create `.codex-plugin/plugin.json` and `.agents/plugins/marketplace.json`
- For a single-plugin GitHub repo, the marketplace entry should point at the repo root with `source.path: "."`
- Users register via `codex marketplace add {{repository}}`
- Users then enable the plugin from `/plugins`
- Public self-serve plugin publishing is coming soon per OpenAI docs

### How users find and install {{displayName}}

**Skill-only repo:**

```bash
git clone {{repository}}
ln -s $(pwd)/{{name}}/skills ~/.agents/skills/{{name}}
```

**Plugin repo:**

```bash
codex marketplace add {{repository}}
```

Then enable `{{name}}` from `/plugins`.
