---
title: Flutter CodePush
description: Push Dart code patches to Flutter apps without a store re-submission, with staged rollout and rollback.
---

# Flutter CodePush

Flutter CodePush lets you push **Dart-only code patches** to your Flutter app without a full store re-submission. Ship bug fixes and small tweaks in minutes, with staged rollout and instant rollback.

## Prerequisites

- An AirBuild account with the `codepush_flutter` feature flag enabled for your organization
- The [AirBuild CLI](/developer/cli/) installed
- Dart and Flutter SDK installed ([install guide](https://docs.flutter.dev/get-started/install))
- Your Flutter app built with the Shorebird updater embedded (see the [Shorebird docs](https://shorebird.dev/) for setup)

The AirBuild CLI can install the Shorebird CLI and configure your project automatically:

```bash
# One-time: authenticate and link this project to an app (creates .airbuild.json)
airbuild login --api-key airbuild_xxx
airbuild init

# Check what's needed
airbuild codepush flutter doctor

# Install missing dependencies (e.g. Shorebird CLI)
airbuild codepush flutter install

# Initialize project (creates shorebird.yaml with AirBuild config)
airbuild codepush flutter init
```

## How it works

1. You register a release with AirBuild (the CLI builds it for you)
2. You fix a bug in your Dart code
3. You create a patch with AirBuild (the CLI builds and diffs it for you)
4. Devices check AirBuild for updates and download the patch on next launch
5. You control rollout via channels and percentages

## Enable CodePush for your app

1. Go to your app's detail page in the AirBuild dashboard
2. Click **"Enable OTA Updates"** in the sidebar
3. Select **Flutter**
4. Click **Enable**

This generates a distribution key for your app. You'll need this for the device-side updater configuration.

## CLI commands

### `airbuild codepush flutter release`

Register a Flutter release. The CLI builds the release locally and uploads it to AirBuild.

```bash
airbuild codepush flutter release android \
  --app app_xxx \
  --version 1.0.0+1 \
  --channel production
```

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | ✓ | — | App ID |
| `--version` | ✓ | — | App version, e.g. `1.0.0+1` |
| `--architecture` | — | auto | Target architecture, e.g. `arm64-v8a` (Android) |
| `--channel` | — | `production` | Distribution channel |
| `--flutter-revision` | — | — | Flutter SDK version used to build |
| `--shorebird-app-id` | — | — | Shorebird app_id, if tracking one |
| `--release-notes` | — | — | Release notes |
| `--artifact` | — | auto-detect | Path to a pre-built release artifact (skips the build step) |
| `--skip-build` | — | `false` | Don't build — just upload `--artifact` |

**Example — upload a pre-built artifact:**

```bash
airbuild codepush flutter release android \
  --app app_xxx \
  --version 1.0.0+1 \
  --artifact path/to/release.artifact \
  --skip-build
```

### `airbuild codepush flutter patch`

Create a Flutter patch. The CLI builds your patched app, computes a diff against the release, and uploads the diff to AirBuild — no manual diffing required.

```bash
# 1. Fix your Dart bug
# 2. Create and upload the patch
airbuild codepush flutter patch android \
  --app app_xxx \
  --release-version 1.0.0+1 \
  --release-notes "Fixed login crash on Android 14"
```

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | ✓ | — | App ID |
| `--release-version` | ✓ | — | The release version this patch targets |
| `--architecture` | — | — | Target architecture, e.g. `arm64-v8a` |
| `--channel` | — | `production` | Distribution channel |
| `--release-notes` | — | — | Patch notes |
| `--artifact` | — | auto | Path to a pre-built patch diff (skips the build step) |
| `--skip-build` | — | `false` | Don't build — use existing build output or `--artifact` |

> **Note:** Android patch creation is fully automatic. On iOS, the CLI can't always locate the generated diff — if that happens, pass `--artifact` with a manually created diff.

### `airbuild codepush flutter promote`

Promote a patch to a channel at a specific rollout percentage.

```bash
# Promote to 25% of production devices
airbuild codepush flutter promote \
  --app app_xxx \
  --patch 1 \
  --channel production \
  --rollout 25
```

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | ✓ | — | App ID |
| `--update-id` | — | — | Update ID (alternative to patch number) |
| `--release-version` | — | — | Release version (with `--platform` and `--patch`) |
| `--platform` | — | — | `ANDROID` or `IOS` |
| `--patch` | — | — | Patch number (from `status`) |
| `--channel` | — | `production` | Channel to promote to |
| `--rollout` | — | `100` | Rollout percentage (0–100) |

### `airbuild codepush flutter rollback`

Rollback a patch. Devices will revert to the previous version on their next check-in.

```bash
airbuild codepush flutter rollback \
  --app app_xxx \
  --patch 1
```

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | ✓ | — | App ID |
| `--update-id` | — | — | Update ID (alternative to patch number) |
| `--release-version` | — | — | Release version |
| `--platform` | — | — | `ANDROID` or `IOS` |
| `--patch` | — | — | Patch number |
| `--channel` | — | `production` | Channel |

### `airbuild codepush flutter status`

Show all releases and patches for an app.

```bash
airbuild codepush flutter status --app app_xxx
```

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | ✓ | — | App ID |

Output shows channels, releases, and for each release its patches with status, rollout %, channel, and creation date.

## Device-side configuration

Run `airbuild codepush flutter init` to automatically configure your project — it writes `shorebird.yaml` with the AirBuild `base_url` and your app's `distribution_key` so the Shorebird updater checks AirBuild for updates.

If you prefer to configure manually, add this to your `shorebird.yaml` (your app's exact values are on the **OTA Updates** tab in the dashboard):

```yaml
app_id: <your-app-id>
base_url: https://airbuild.dev/api/codepush/flutter
distribution_key: dk_xxx
channel: production
auto_update: true
```

## Typical workflow

```bash
# 1. Register a release (first time or new version)
airbuild codepush flutter release android \
  --app app_xxx \
  --version 1.0.0+1

# 2. Fix a bug in your Dart code
# ...edit, test locally...

# 3. Create a patch (the CLI builds and diffs it for you)
airbuild codepush flutter patch android \
  --app app_xxx \
  --release-version 1.0.0+1 \
  --release-notes "Fixed login crash"

# 4. Promote to 25% of devices
airbuild codepush flutter promote \
  --app app_xxx \
  --patch 1 \
  --channel production \
  --rollout 25

# 5. Monitor — increase rollout if no issues
airbuild codepush flutter promote \
  --app app_xxx \
  --patch 1 \
  --channel production \
  --rollout 100

# 6. Rollback if something goes wrong
airbuild codepush flutter rollback \
  --app app_xxx \
  --patch 1
```

## Limitations

- **Dart code only** — patches can update Dart code, not native code, assets, or the Flutter framework itself
- **iOS patch creation may require `--artifact`** — Android patch creation is fully automatic; iOS may require `--artifact` with a manually created diff in some environments
- **Same release version** — patches must target an existing release version; you can't patch a version that hasn't been registered
- **Shorebird runtime required** — your app must be built with the Shorebird updater embedded; a standard Flutter build won't accept patches
