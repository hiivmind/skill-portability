## Gemini CLI

### Install from registry

Browse the gallery at [geminicli.com/extensions](https://geminicli.com/extensions/) and search for **{{name}}**, or install directly:

```bash
gemini extensions install {{repository}}
```

With version pin:

```bash
gemini extensions install {{repository}} --ref <tag>
```

### Install from GitHub

```bash
gemini extensions install {{repository}}
```

### Install from local clone

```bash
gemini extensions link /path/to/{{name}}
```

Changes are reflected immediately without reinstalling.

### Verify

```bash
gemini extensions list
```

Look for `{{name}}` in the output.
