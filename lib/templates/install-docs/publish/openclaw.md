## OpenClaw

### Prerequisites

- `openclaw/openclaw.plugin.json` manifest with `id` and `configSchema` (required for native plugins)
- `package.json` with `openclaw.extensions` and `openclaw.compat` (required for npm distribution)
- Optional: `AGENTS.md` context file, `skills/*/SKILL.md` for skill-bearing plugins

### Submit to registry

**ClawHub:**

```bash
npm i -g clawhub
clawhub login
clawhub package publish your-org/{{name}}
```

**npm (alternative):**

```bash
npm publish --access public
```

Users can install from either registry. Bare names check ClawHub first, then npm.
