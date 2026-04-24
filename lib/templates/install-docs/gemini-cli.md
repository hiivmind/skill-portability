## Gemini CLI

### Install from GitHub

```bash
gemini extensions install {{repository}}
```

### Install from local path

```bash
gemini extensions install /path/to/{{name}}
```

### Verify

```bash
gemini extensions list
```

Look for `{{name}}` in the output. Restart Gemini CLI if it was running during install.

### Hook configuration

Gemini CLI hooks are configured in your user `settings.json`, not in the repo. If this plugin includes hooks, add the following to `~/.gemini/settings.json`:

(See the hook guidance section in the generated install docs for the specific configuration to copy.)
