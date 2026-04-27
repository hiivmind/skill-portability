## OpenClaw

Public registries: [ClawHub](https://clawhub.ai) (curated) and npm (open).

### Publishing to ClawHub

1. Ensure `openclaw/openclaw.plugin.json` manifest is present with required fields (`id`, `configSchema`)
2. Install the ClawHub CLI: `npm i -g clawhub`
3. Authenticate: `clawhub login`
4. Publish: `clawhub package publish your-org/{{name}}`
5. Submissions are reviewed before appearing in the registry

### Publishing to npm

1. Add an npm-compatible `package.json` with `openclaw.extensions` and `openclaw.compat`
2. Publish: `npm publish --access public`
3. Users install with: `openclaw plugins install @org/{{name}}`

### How users find and install {{displayName}}

- Browse [ClawHub](https://clawhub.ai) or search npm for `{{name}}`
- Install via ClawHub: `openclaw plugins install clawhub:{{name}}`
- Install via npm: `openclaw plugins install @org/{{name}}`
