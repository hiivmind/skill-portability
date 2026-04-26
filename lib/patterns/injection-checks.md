# Injection Checks

8-component verification for session-start bootstrapping infrastructure.
Only runs when `skills/using-<name>/SKILL.md` exists.

---

## Components

| # | Component | Check | Status Values |
|---|-----------|-------|---------------|
| 1 | `skills/using-{{name}}/SKILL.md` | File exists | PRESENT / MISSING |
| 2 | `skills/using-{{name}}/references/gemini-tools.md` | File exists | PRESENT / MISSING |
| 3 | `hooks/session-start` | File exists and is executable | PRESENT / MISSING |
| 4 | `hooks/run-hook.cmd` | File exists and is executable | PRESENT / MISSING |
| 5 | `hooks/hooks.json` | Contains `SessionStart` entry with command containing `session-start` | PRESENT / MISSING |
| 6 | `hooks/hooks-cursor.json` | Contains `sessionStart` entry with command containing `session-start` | PRESENT / MISSING |
| 7 | `GEMINI.md` | First `@./skills/` include is `using-{{name}}` | PRESENT / MISSING / NOT_FIRST |

---

## Verification Algorithm

```pseudocode
CHECK_INJECTION_COMPONENTS(computed):
  name = computed.metadata.name
  results = []

  # 1. using-skill SKILL.md
  results.append(check_file_exists("skills/using-" + name + "/SKILL.md"))

  # 2. using-skill gemini sidecar
  results.append(check_file_exists("skills/using-" + name + "/references/gemini-tools.md"))

  # 3. session-start script
  path = "hooks/session-start"
  IF file_exists(path) AND is_executable(path):
    results.append({ component: path, status: "PRESENT" })
  ELSE:
    results.append({ component: path, status: "MISSING" })

  # 4. run-hook.cmd
  path = "hooks/run-hook.cmd"
  IF file_exists(path) AND is_executable(path):
    results.append({ component: path, status: "PRESENT" })
  ELSE:
    results.append({ component: path, status: "MISSING" })

  # 5. hooks.json SessionStart entry
  IF file_exists("hooks/hooks.json"):
    content = Read("hooks/hooks.json")
    IF content contains "SessionStart" AND content contains "session-start":
      results.append({ component: "hooks/hooks.json (SessionStart)", status: "PRESENT" })
    ELSE:
      results.append({ component: "hooks/hooks.json (SessionStart)", status: "MISSING" })
  ELSE:
    results.append({ component: "hooks/hooks.json (SessionStart)", status: "MISSING" })

  # 6. hooks-cursor.json sessionStart entry
  IF file_exists("hooks/hooks-cursor.json"):
    content = Read("hooks/hooks-cursor.json")
    IF content contains "sessionStart" AND content contains "session-start":
      results.append({ component: "hooks/hooks-cursor.json (sessionStart)", status: "PRESENT" })
    ELSE:
      results.append({ component: "hooks/hooks-cursor.json (sessionStart)", status: "MISSING" })
  ELSE:
    results.append({ component: "hooks/hooks-cursor.json (sessionStart)", status: "MISSING" })

  # 7. GEMINI.md ordering
  IF file_exists("GEMINI.md"):
    content = Read("GEMINI.md")
    first_skill_include = first_line_matching(content, /^@\.\/skills\//)
    IF first_skill_include contains "using-" + name:
      results.append({ component: "GEMINI.md (using-" + name + " first)", status: "PRESENT" })
    ELSE:
      results.append({ component: "GEMINI.md (using-" + name + " first)", status: "NOT_FIRST" })
  ELSE:
    results.append({ component: "GEMINI.md (using-" + name + " first)", status: "MISSING" })

  RETURN results

COMPUTE_INJECTION_SUMMARY(results):
  present = count(r for r in results if r.status == "PRESENT")
  total = len(results)
  IF present == total:
    RETURN "COMPLETE"
  ELIF present == 0:
    RETURN "MISSING"
  ELSE:
    RETURN "PARTIAL (" + str(present) + " of " + str(total) + " components)"
```
