## Antigravity

Public registry at [open-vsx.org](https://open-vsx.org/) (open, community-maintained).

### Publishing

1. Ensure `antigravity/package.json` manifest is present with all required fields
2. Package the extension: `antigravity package`
3. Create an account and namespace on [open-vsx.org](https://open-vsx.org/)
4. Publish: `antigravity publish` or upload the `.vsix` file via the web UI

### How users find and install {{displayName}}

- Search for **{{name}}** on [open-vsx.org](https://open-vsx.org/)
- Install via CLI: `antigravity --install-extension {{name}}`

### Team distribution

Share the `.vsix` file directly or host on a private extension registry.
