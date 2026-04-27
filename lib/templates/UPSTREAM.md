# Template Upstream Source

Templates in `lib/templates/` are seeded from [superpowers](https://github.com/obra/superpowers) v5.0.7.

## Re-seeding after a superpowers release

1. Install the new superpowers version: update your Claude Code plugin config to the new version.
2. Locate the new cache path: `~/.claude/plugins/cache/claude-plugins-official/superpowers/<version>/`
3. Review platform specs in `lib/references/platforms/` against any tool
   name changes in the new superpowers release. The structured `PlatformSpec`
   dictionaries replace the old per-tool sidecar files.

4. Compare manifest templates in `lib/templates/manifests/` and context-file templates in `lib/templates/context-files/` against the new superpowers manifests (`.claude-plugin/`, `.cursor-plugin/`, `gemini-extension.json`, `GEMINI.md`, hooks files) and update accordingly.
5. Update this file with the new version pin.

## Why templates stay in this repo

Templates are checked in so the uplift skill works offline and produces deterministic output regardless of what version of superpowers is currently installed.
