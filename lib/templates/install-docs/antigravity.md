## Antigravity

### Skill-only install

Copy the skills directory into your workspace or global config:

```bash
# Workspace-local (per-project)
cp -r /path/to/{{name}}/skills .agents/skills/{{name}}/

# Global (available in all workspaces)
cp -r /path/to/{{name}}/skills ~/.gemini/antigravity/skills/{{name}}/
```

### Extension install

Install from the OpenVSX registry or from a local `.vsix` package:

```bash
# From OpenVSX (if published)
antigravity --install-extension {{name}}

# From local .vsix file
antigravity --install-extension /path/to/{{name}}.vsix
```

### Verify

Start a new Antigravity session and check that skills from {{displayName}} appear in the skill listing at conversation start. Skills should be listed when the agent enumerates available capabilities.
