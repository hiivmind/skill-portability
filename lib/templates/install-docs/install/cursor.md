## Cursor

### Install from registry

Search for **{{name}}** in the Cursor marketplace panel, visit `cursor.com/marketplace`, or run in Agent chat:

```
/add-plugin {{name}}@https://github.com/{{repository}}
```

### Install from GitHub

```
/add-plugin {{name}}@https://github.com/{{repository}}
```

### Install from local clone

Symlink or copy the plugin directory and restart Cursor (Developer: Reload Window):

```bash
ln -s /path/to/{{name}} ~/.cursor/plugins/local/{{name}}
```

### Verify

Open Cursor and check that skills from {{name}} appear when typing `/` in chat. Rules should appear in Cursor Settings > Rules with the plugin name prefix.
