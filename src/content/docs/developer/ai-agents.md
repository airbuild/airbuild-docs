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
| `AGENTS.md` / `CLAUDE.md` in the repo | Teaches the agent the AirBuild workflow |
| [OpenAPI spec](https://airbuild.dev/api/openapi) + [llms.txt](https://docs.airbuild.dev/llms.txt) | Machine-readable API + docs |
| In-app SDKs (pub.dev, npm, CocoaPods, Maven) | Update checks + install prompts inside the app — agents install and wire them |

## Quick setup: `airbuild init --agents`

The CLI can write agent instruction files for you:

```bash
airbuild init --agents        # writes/updates AGENTS.md and CLAUDE.md
```

This inserts a managed block into `AGENTS.md` and `CLAUDE.md` in the project root (between `<!-- airbuild:start -->` / `<!-- airbuild:end -->` markers). Existing content is preserved, and re-running replaces only the AirBuild block.

If your project already has `.airbuild.json`, you can also run just:

```bash
airbuild init --yes --agents --app-id <your-app-id>
```

`--yes` makes `init` fully non-interactive — useful when the agent itself is running setup.

## What the agent needs to know

Paste this block into your agent's instruction file (this is exactly what `init --agents` writes):

```markdown
## AirBuild

This project ships mobile builds to AirBuild (OTA distribution: APK/IPA
uploads, install links, and CodePush OTA patches for Flutter / React Native).

### Setup

- CLI: https://docs.airbuild.dev/developer/cli — install once, then
  `airbuild login --api-key $AIRBUILD_API_KEY` or just export the key.
- Auth: `AIRBUILD_API_KEY` env var (Dashboard → Settings → API Keys).
  NEVER commit it, `~/.airbuild/config.json`, or any `airbuild_*` key.
- Project config lives in `.airbuild.json` (app ID + build paths,
  created by `airbuild init`).

### In-app SDKs (update prompts inside the app)

When the task is to check for updates inside the app itself, use the
AirBuild SDK — it shows testers a newer-build dialog and reports install
analytics. Auth is a PUBLIC distribution key (`dk_xxx`, from the app's
Settings page — safe to embed; NOT the `airbuild_*` API key).

- Flutter: `flutter pub add airbuild` → `AirBuild.configure(distributionKey: 'dk_…')`,
  then `await AirBuild.checkForUpdates(currentVersion: 'x.y.z')`.
- React Native: `npm i @airbuild/react-native` → `AirBuild.configure({ distributionKey: 'dk_…' })`,
  then `await AirBuild.checkForUpdates({ currentVersion: 'x.y.z' })`.
- iOS: pod `AirBuild` or SPM → `AirBuild.configure(distributionKey: 'dk_…')`.
- Android: Gradle dep `dev.airbuild:airbuild-android` →
  `AirBuild.configure(distributionKey = "dk_…")`, then `AirBuild.checkForUpdates(context, version)`.
- Full guide: https://docs.airbuild.dev/developer/sdks/
- Source repos: github.com/airbuild/{airbuild-cli, airbuild-flutter,
  airbuild-react-native, airbuild-ios, airbuild-android} — file SDK bugs
  against the matching repo.

### Rules for agents

- Always pass `--json` to `airbuild` commands and parse stdout — progress and
  errors go to stderr, and failures exit non-zero.
- Ship a build: `airbuild push --json` (uses .airbuild.json), or
  `airbuild upload <file.apk|.ipa> --app-id <id> --json`.
- New install link: `airbuild links create --build-id <id> --json` → the
  install URL is `https://airbuild.dev/i/<slug>`.
- Inspect state: `airbuild apps list --json`,
  `airbuild builds list --app-id <id> --json` — poll builds until
  `status` is `READY` before sharing a link.
- CodePush Flutter: `airbuild codepush flutter release|patch|promote|rollback|status`.
  React Native: `airbuild codepush react-native publish|promote|rollback|status`.
- Prefer staged rollout: `--rollout 10`, verify, then 50, then 100. Ask the
  user before promoting a patch to 100% or rolling back.
- Docs: https://docs.airbuild.dev (agent index: /llms.txt) — OpenAPI spec:
  https://airbuild.dev/api/openapi.
```

## Where to put it per tool

| Tool | File(s) it reads |
| ---- | ---------------- |
| Claude Code | `CLAUDE.md` (also reads `AGENTS.md`) |
| Cursor | `AGENTS.md` or `.cursor/rules/*.md` |
| Windsurf | `AGENTS.md` or `.windsurf/rules/` |
| Devin | `AGENTS.md` or `.devin/skills/` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Generic agents | `AGENTS.md` |

`init --agents` writes both `AGENTS.md` and `CLAUDE.md`. For Copilot, symlink or copy the block into `.github/copilot-instructions.md`.

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

For a CodePush hotfix:

```bash
airbuild codepush flutter patch android --release-version 1.4.2 --json
airbuild codepush flutter promote --patch 7 --channel production --rollout 10 --json
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
