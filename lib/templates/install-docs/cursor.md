## Cursor

### Marketplace install

Search for **{{name}}** in the Cursor marketplace panel, visit `cursor.com/marketplace`, or run `/add-plugin {{name}}` in Cursor chat.

### Local development

Copy or symlink the plugin directory to `~/.cursor/plugins/local/{{name}}/` and restart Cursor (Developer: Reload Window).

```bash
# Symlink (recommended for development)
ln -s /path/to/{{name}} ~/.cursor/plugins/local/{{name}}

# Or copy
cp -r /path/to/{{name}} ~/.cursor/plugins/local/{{name}}/
```

### Verify

Open Cursor and check that skills from {{name}} appear when typing `/` in chat. Rules should appear in Cursor Settings > Rules with the plugin name prefix.
