---
title: Flutter CodePush
description: Push Dart code patches to Flutter apps using Shorebird's open-source updater, managed by AirBuild.
---

# Flutter CodePush

Flutter CodePush lets you push **Dart-only code patches** to your Flutter app without a full store re-submission. It's built on [Shorebird's](https://shorebird.dev) open-source updater runtime, with AirBuild acting as the control plane for releases, patches, channels, and rollout.

## Prerequisites

- An AirBuild account with the `codepush_flutter` feature flag enabled for your organization
- The [AirBuild CLI](/developer/cli/) installed
- The [Shorebird CLI](https://pub.dev/packages/shorebird_cli) installed:

  ```bash
  dart pub global activate shorebird_cli
  ```

- Your Flutter app initialized with Shorebird (the Shorebird runtime embedded in your build)

## How it works

1. You build a release with `shorebird release` — this produces a `libapp.so` containing the Dart code
2. AirBuild stores the release artifact and registers it as a versioned release
3. You fix a bug in your Dart code
4. You create a patch with `shorebird patch` — this produces a binary diff
5. AirBuild stores the patch and makes it available to devices
6. Devices running the Shorebird updater check AirBuild for updates and download the patch
7. You control rollout via channels and percentages

## Enable CodePush for your app

1. Go to your app's detail page in the AirBuild dashboard
2. Click **"Enable OTA Updates"** in the sidebar
3. Select **Flutter**
4. Click **Enable**

This generates a distribution key for your app. You'll need this for the device-side updater configuration.

## CLI commands

### `airbuild codepush flutter release`

Register a Flutter release. Runs `shorebird release` locally, then uploads the artifact to AirBuild.

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
| `--artifact` | — | auto-detect | Path to the built libapp.so (skips build) |
| `--skip-build` | — | `false` | Don't run `shorebird release` — just upload `--artifact` |

**Example — skip the build, upload an existing artifact:**

```bash
airbuild codepush flutter release android \
  --app app_xxx \
  --version 1.0.0+1 \
  --artifact build/app/intermediates/flutter/release/arm64-v8a/libapp.so \
  --skip-build
```

### `airbuild codepush flutter patch`

Create a Flutter patch. Run `shorebird patch` locally first, then upload the resulting diff.

```bash
# 1. Fix your Dart bug
# 2. Run shorebird patch (produces the diff)
shorebird patch android --no-confirm

# 3. Upload the patch to AirBuild
airbuild codepush flutter patch android \
  --app app_xxx \
  --release-version 1.0.0+1 \
  --artifact path/to/patch.diff \
  --release-notes "Fixed login crash on Android 14"
```

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | ✓ | — | App ID |
| `--release-version` | ✓ | — | The release version this patch targets |
| `--architecture` | — | — | Target architecture, e.g. `arm64-v8a` |
| `--channel` | — | `production` | Distribution channel |
| `--release-notes` | — | — | Patch notes |
| `--artifact` | ✓ | — | Path to the patch diff file |
| `--skip-build` | — | `false` | Don't run `shorebird patch` — just upload |

> **Note:** The `--artifact` flag is required because Shorebird's `patch` command doesn't leave a stable, documented local file behind. Run `shorebird patch` yourself first, then pass the resulting artifact via `--artifact`.

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

The Shorebird updater in your app needs to point to AirBuild to check for updates. Configure the updater with your app's distribution key:

- **Check URL:** `https://airbuild.dev/api/codepush/flutter/check?key=<distribution_key>`
- **Download URL:** `https://airbuild.dev/api/codepush/flutter/patch/<id>/download?key=<distribution_key>`

The distribution key is available on the app's OTA Updates tab in the dashboard.

## Typical workflow

```bash
# 1. Register a release (first time or new version)
airbuild codepush flutter release android \
  --app app_xxx \
  --version 1.0.0+1

# 2. Fix a bug in your Dart code
# ...edit, test locally...

# 3. Create a patch
shorebird patch android --no-confirm
airbuild codepush flutter patch android \
  --app app_xxx \
  --release-version 1.0.0+1 \
  --artifact path/to/patch.diff \
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
- **Android first** — auto-detection of the release artifact is supported for Android (`libapp.so`); iOS requires `--artifact`
- **Same release version** — patches must target an existing release version; you can't patch a version that hasn't been registered
- **Shorebird runtime required** — your app must be built with the Shorebird runtime embedded; a standard Flutter build won't accept patches
