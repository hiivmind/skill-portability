# Uplift Report Template

The final phase emits a structured report summarising all uplift actions.

## Report Format

```
# Uplift Report: {name} v{version}

## Repo Shape
{shape}
Metadata inferred from: {canonical.path}

## Created
{FOR artifact IN computed.created}
  [{artifact.platform}]  {artifact.path}
{/FOR}

## Skipped (already exists)
{FOR artifact IN computed.skipped}
  [{artifact.platform}]  {artifact.path}
{/FOR}

## Needs Manual Review
{FOR item IN computed.flagged}
  {item}
{/FOR}

## Install Documentation
{FOR platform IN platforms_with_artifacts}
  {platform}: generated / flagged
{/FOR}

## Session-Start Bootstrapping
{bootstrap_status}
```

## State Flow

```
Phase 1          Phase 2              Phase 3              Phase 4–5            Phase 6            Phase 7            Phase 8
──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
computed         computed.skills      computed              computed.created     platforms_with     computed           Report
 .sources         .commands           .uplift_target         .skipped             _artifacts         .bootstrap        (displayed)
 .canonical       .agents             .target_platforms      .flagged              (= target         _status
 .metadata        .existing_hooks     .codex_rec                                   _platforms)
 .shape
```
