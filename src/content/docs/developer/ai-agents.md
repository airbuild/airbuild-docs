---
title: AI Coding Assistants
description: Let Claude Code, Cursor, Devin, Copilot and other AI agents ship builds and OTA updates through the AirBuild CLI.
---

# AI Coding Assistants

AI coding agents integrate with AirBuild through the **CLI and REST API** — no plugin or special integration required. If your agent can run shell commands and read repo files, it can upload builds, create install links, and manage CodePush releases.

This page covers the one-command setup, per-tool config, and safety rules.

## How it works

| Mechanism | What agents use it for |
| --------- | ---------------------- |
| `airbuild` CLI | All actions — upload, links, CodePush, status |
| `AIRBUILD_API_KEY` env var | Non-interactive auth (no `login` needed) |
| `--json` flag | Structured stdout; logs/errors go to stderr, failures exit non-zero |
| `AGENTS.md` / `CLAUDE.md` in the repo | Small always-on block: auth, `--json`, safety rules |
| Skills `airbuild-distribution` / `airbuild-codepush` | Loaded only when relevant; they run `airbuild guide <topic>` |
| `airbuild guide <topic>` | Version-matched runbooks embedded in the CLI |
| [OpenAPI spec](https://airbuild.dev/api/openapi) + [llms.txt](https://docs.airbuild.dev/llms.txt) | Machine-readable API + docs |
| In-app SDKs (pub.dev, npm, CocoaPods, Maven) | Update checks + install prompts inside the app — agents install and wire them |

## Quick setup: `airbuild init --agents`

The CLI writes everything an agent needs in one command:

```bash
airbuild init --agents        # AGENTS.md + CLAUDE.md block, and two skills
```

This creates:

| File | Purpose |
| ---- | ------- |
| `AGENTS.md`, `CLAUDE.md` | A small always-on block (auth, `--json`, safety rules) between `<!-- airbuild:start v=… -->` / `<!-- airbuild:end -->` markers. Existing content is preserved; re-running replaces only the AirBuild block. |
| `.agents/skills/airbuild-distribution/SKILL.md` | Loaded when the task is uploading builds, install links, UDIDs, in-app SDKs, CI or webhooks. |
| `.agents/skills/airbuild-codepush/SKILL.md` | Loaded when the task is an OTA hotfix: patch, rollout, rollback, for Flutter or React Native. |

If `.claude/`, `.devin/` or `.windsurf/` already exist in the project, the skills are also written to `.claude/skills/`, `.devin/skills/` and `.windsurf/skills/`. Skill files you wrote yourself (no `airbuild:skill` marker) are never overwritten.

If your project already has `.airbuild.json`, you can also run just:

```bash
airbuild init --yes --agents --app-id <your-app-id>
```

`--yes` makes `init` fully non-interactive — useful when the agent itself is running setup.

## How the skills stay current: `airbuild guide`

The skills are deliberately thin: a trigger description plus one instruction — run `airbuild guide <topic>`. The full runbooks are embedded in the CLI binary, so they always match the installed CLI version and never go stale inside a project.

```bash
airbuild guide                 # list topics
airbuild guide distribution    # upload, links, UDIDs, SDKs, CI, webhooks
airbuild guide codepush        # OTA shared rules: patch vs new binary, lifecycle, channels, rollout
airbuild guide flutter         # Flutter CodePush runbook (Android + iOS)
airbuild guide react-native    # React Native CodePush runbook (Expo Updates, Android + iOS)
airbuild guide flutter --json  # {"topic","version","content"}
```

Only the small core block and the skills' trigger text live in your repo. To refresh them after a CLI release:

```bash
airbuild agents sync    # updates only files AirBuild already manages; never creates files
airbuild agents check   # exits non-zero if they're older than the installed CLI (use in CI)
```

`airbuild upgrade` runs `agents sync` automatically for the project in your current directory, so the change shows up as a normal git diff to commit.

## What the always-on block says

This is the block `init --agents` writes into `AGENTS.md` / `CLAUDE.md`:

```markdown
## AirBuild

This project ships mobile builds to AirBuild — OTA app distribution for iOS and
Android (APK/IPA uploads, install links + QR codes, iOS ad-hoc UDID capture) and
CodePush OTA patches for Flutter and React Native. Everything is scriptable via
the `airbuild` CLI. Server: https://airbuild.dev

### Skills — load the one that matches the task

- `airbuild-distribution` — upload builds, install links/QR, iOS devices & UDIDs,
  in-app update SDKs, CI uploads, webhooks.
- `airbuild-codepush` — OTA hotfixes: patch, rollout, rollback for Flutter and
  React Native.

Each skill tells you to run `airbuild guide <topic>` for the full runbook; the
CLI generates it, so it always matches the installed version. No skill support?
Run it yourself: `airbuild guide distribution|codepush|flutter|react-native`.

### Always

- Auth: `AIRBUILD_API_KEY` env var (Dashboard → Settings → API Keys), or
  `airbuild login --api-key $AIRBUILD_API_KEY`. NEVER print or commit it,
  `~/.airbuild/config.json`, or any `airbuild_*` key (`dk_*` keys are public).
- Project config is `.airbuild.json` (created by `airbuild init --yes`); commands
  default `--app` from it.
- Always pass `--json` to `airbuild` commands and parse stdout — progress and
  errors go to stderr, and failures exit non-zero. A 402/403 means a plan limit
  or disabled feature: report it, don't retry blindly.
- Ask the user before: promoting an OTA update to 100%, rolling back, shipping
  to production channels, or changing shared install links.
- Docs: https://docs.airbuild.dev (agent index: /llms.txt) — OpenAPI spec:
  https://airbuild.dev/api/openapi.
```


## Where each tool reads it

| Tool | Always-on file | Skills |
| ---- | -------------- | ------ |
| Claude Code | `CLAUDE.md` (also reads `AGENTS.md`) | `.claude/skills/` |
| Cursor | `AGENTS.md` or `.cursor/rules/*.md` | run `airbuild guide <topic>` from the block |
| Windsurf | `AGENTS.md` or `.windsurf/rules/` | `.windsurf/skills/` |
| Devin | `AGENTS.md` | `.devin/skills/` |
| GitHub Copilot | `.github/copilot-instructions.md` | run `airbuild guide <topic>` from the block |
| Generic agents | `AGENTS.md` | `.agents/skills/` |

`init --agents` writes `AGENTS.md`, `CLAUDE.md` and `.agents/skills/`, plus the tool-specific skill folders that already exist. For Copilot, symlink or copy the block into `.github/copilot-instructions.md`. Tools without skill support still work: the block tells the agent to run `airbuild guide <topic>` itself.


## Non-interactive authentication

Agents shouldn't run `airbuild login` — export the key instead:

```bash
export AIRBUILD_API_KEY=airbuild_xxx   # Settings → API Keys in the dashboard
```

Every command picks these up — they take precedence over `~/.airbuild/config.json`. Keep the key in your agent's secret/env config, never in the repo.

## Example agent flow

```bash
# 1. Build the app (agent runs the framework build)
flutter build apk --release

# 2. Upload — returns install URL as JSON
airbuild push --json
# → [{"platform":"android","success":true,"buildId":"clx…","installUrl":"https://airbuild.dev/i/abc123"}]

# 3. Or poll a build's processing status
airbuild builds list --app-id clx… --json
```

For a Flutter CodePush hotfix:

```bash
airbuild codepush flutter patch android --release-version 1.4.2 --json
airbuild codepush flutter promote --release-version 1.4.2 --platform android --patch 7 --channel production --rollout 10 --json
airbuild codepush flutter status --json
```

For a React Native CodePush hotfix (publish and promote once per platform):

```bash
airbuild codepush react-native publish --platform android --runtime-version 1.4.2 --json
airbuild codepush react-native promote --platform android --runtime-version 1.4.2 --channel production --rollout 10 --json
airbuild codepush react-native status --json
```

## Adding update checks inside the app

Agents can also integrate the in-app SDKs themselves — install the package, call `configure` once with the distribution key, then call `checkForUpdates`. The distribution key (`dk_xxx`, from the app's Settings page in the dashboard) is **public by design** — it identifies which app to check and carries no write access, so it's safe for an agent to embed in source.

```dart
// Flutter — flutter pub add airbuild
import 'package:airbuild/airbuild.dart';

void main() {
  AirBuild.configure(distributionKey: 'dk_a1b2c3d4e5f6');
  runApp(MyApp());
}
// then: await AirBuild.checkForUpdates(currentVersion: '1.0.0');
```

```ts
// React Native — npm i @airbuild/react-native
import AirBuild from '@airbuild/react-native';

AirBuild.configure({ distributionKey: 'dk_a1b2c3d4e5f6' });
await AirBuild.checkForUpdates({ currentVersion: '1.0.0' });
```

Native targets use the same shape: `AirBuild.configure(...)` once, then `checkForUpdates`. See the [SDKs page](./sdks/) for iOS (`AirBuild` pod / SPM) and Android (`dev.airbuild:airbuild-android`) snippets.

## Safety rules for agents

- **Never put the API key in prompts, code, or committed files** — use `AIRBUILD_API_KEY` env or your agent's secret store.
- **Confirm before production actions** — promoting a patch to `--rollout 100` or running `rollback` affects live users; the agent should ask first.
- **Prefer staged rollouts** — start at `--rollout 10`, check `status --json`, then widen.
- **`push` and `upload` create externally visible artifacts** — install links are shareable URLs; treat them as public.

## Programmatic access

- **OpenAPI spec**: [`https://airbuild.dev/api/openapi`](https://airbuild.dev/api/openapi) — OpenAPI 3.0 JSON covering the REST API. Feed it to codegen tools or agents that speak OpenAPI.
- **REST API**: see the [API Reference](../api-reference/) — `Authorization: Bearer airbuild_xxx` works for every endpoint.

## Source repositories

All AirBuild repos are public — agents can clone them to inspect SDK internals or file issues:

| Component | Repository | Package |
| --------- | ---------- | ------- |
| CLI | [airbuild/airbuild-cli](https://github.com/airbuild/airbuild-cli) | binaries on Releases, `go install` |
| Flutter SDK | [airbuild/airbuild-flutter](https://github.com/airbuild/airbuild-flutter) | `airbuild` on pub.dev |
| React Native SDK | [airbuild/airbuild-react-native](https://github.com/airbuild/airbuild-react-native) | `@airbuild/react-native` on npm |
| iOS SDK | [airbuild/airbuild-ios](https://github.com/airbuild/airbuild-ios) | `AirBuild` — SPM / CocoaPods |
| Android SDK | [airbuild/airbuild-android](https://github.com/airbuild/airbuild-android) | `dev.airbuild:airbuild-android` |
| Docs | [airbuild/airbuild-docs](https://github.com/airbuild/airbuild-docs) | this site |

## Next steps

- [CLI Tool](./cli/) — full command reference
- [SDKs](./sdks/) — in-app update checks for Flutter, React Native, iOS, Android
- [API Keys](./api-keys/) — create a key for your agent
- [CodePush / OTA Updates](../guides/codepush/) — the patch workflow
- [Webhooks](./webhooks/) — notify your agent/pipeline on build events
