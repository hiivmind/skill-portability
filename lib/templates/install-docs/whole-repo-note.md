## Important: Whole-repo install required

This plugin uses shared hooks, context files, and platform manifests that live outside
individual skill directories. Installing via `npx skills` (which copies only the `skills/`
directory) will lose these shared files and break session-start injection.

Every install path below clones or references the full repo. See
[docs/ecosystem-landscape.md](docs/ecosystem-landscape.md) for background on why this is
necessary across today's agent platforms.
