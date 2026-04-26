## OpenClaw

Public registries: [ClawHub](https://clawhub.dev) (curated) and npm (open).

### Publishing to ClawHub

1. Ensure `openclaw/openclaw.plugin.json` manifest is present with all required fields
2. Authenticate: `openclaw auth login`
3. Publish: `openclaw plugins publish`
4. Submissions are reviewed before appearing in the registry

### Publishing to npm

1. Add an npm-compatible `package.json` to the `openclaw/` directory
2. Publish: `npm publish --access public`
3. Users install with: `openclaw plugins install @org/openclaw-{{name}}`

### How users find and install {{displayName}}

- Browse [ClawHub](https://clawhub.dev) or search npm for `openclaw-{{name}}`
- Install via CLI: `openclaw plugins install {{name}}`
