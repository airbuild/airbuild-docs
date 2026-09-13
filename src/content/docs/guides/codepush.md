---
title: CodePush / OTA Updates
description: Push code-only updates to Flutter and React Native apps without a store re-submission, with staged rollout and rollback.
---

# CodePush / OTA Updates

AirBuild CodePush lets you push **code-only updates** to your mobile apps without going through the App Store or Play Store review process. This is useful for shipping bug fixes, small feature tweaks, and critical patches quickly.

## How it works

AirBuild acts as the **control plane** — it stores your releases and patches, manages channels and rollout percentages, and decides which update each device receives. The build step happens locally on your machine using the standard tooling for your framework.

### Two frameworks, one dashboard

| Framework | What you push | Build tool |
| --------- | ------------ | ---------- |
| **Flutter** | Dart code patches | `airbuild codepush flutter` |
| **React Native** | JS bundle + assets | `airbuild codepush react-native` |

Both frameworks share the same dashboard UI — the **OTA Updates** tab on each app's detail page — but use separate CLI commands and have independent feature flags.

## Feature flags

CodePush is gated by **two independent feature flags**:

| Flag | Controls |
| ---- | -------- |
| `codepush_flutter` | Flutter OTA — release, patch, promote, rollback, check, download |
| `codepush_react_native` | React Native OTA — publish, manifest, asset download, promote, rollback, status |

Both flags default to **disabled globally**. To enable CodePush for your organization:

1. An admin enables the flag globally via **Admin → Feature Flags**, or
2. An admin enables it per-organization via **Admin → Organizations → [org] → Feature Flags**

When a flag is disabled for your org:
- The OTA Updates tab is hidden from the app detail page
- The "Enable OTA Updates" card is not shown
- All CodePush API endpoints return `403` (including device-facing endpoints like manifest/check/download)
- Existing releases remain stored but are not delivered to devices

## Enabling CodePush for an app

Once the feature flag is enabled for your organization:

1. Go to your app's detail page in the dashboard
2. Click **"Enable OTA Updates"** in the sidebar
3. Choose your framework (Flutter or React Native)
4. Click **Enable**

This generates a **distribution key** for your app, which is used by the device-side updater to fetch updates.

## Channels and rollout

CodePush uses **channels** to control which updates go to which devices:

- **`production`** — the default channel, all devices receive updates from this channel
- **`staging`** — for internal testing before promoting to production
- Custom channels — create as many as you need

### Staged rollout

When you promote a patch/update to a channel, you can specify a **rollout percentage** (0–100). AirBuild uses a deterministic hash of the device ID to decide whether a device receives the update, ensuring stable rollout — a device that gets the update will keep it, and a device that doesn't will get it once you increase the percentage.

```bash
# Promote to 25% of devices
airbuild codepush flutter promote --app app_xxx --patch 1 --channel production --rollout 25

# Increase to 50%
airbuild codepush flutter promote --app app_xxx --patch 1 --channel production --rollout 50

# Full rollout
airbuild codepush flutter promote --app app_xxx --patch 1 --channel production --rollout 100
```

### Rollback

If an update causes issues, you can instantly roll it back:

```bash
# Flutter
airbuild codepush flutter rollback --app app_xxx --patch 1

# React Native
airbuild codepush react-native rollback --app app_xxx --update-id update_xxx
```

Rollback disables the update immediately — devices will revert to the previous version on their next check-in.

## Dashboard

The **OTA Updates** tab on each app's detail page shows:

- **Setup instructions** — how to integrate the updater into your app
- **Release history** — all releases and their patches/updates
- **Patch history** — status, rollout %, channel, and creation date for each patch
- **Channels** — current active update per channel
- **Signing key** — public key for verifying update integrity (React Native)
- **Actions** — promote, rollback, and adjust rollout from the UI

## CLI overview

All CodePush operations are available via the AirBuild CLI under the `codepush` subcommand:

```bash
# Flutter commands
airbuild codepush flutter release <android|ios> [flags]
airbuild codepush flutter patch <android|ios> [flags]
airbuild codepush flutter promote [flags]
airbuild codepush flutter rollback [flags]
airbuild codepush flutter status [flags]

# React Native commands
airbuild codepush react-native publish [flags]
airbuild codepush react-native promote [flags]
airbuild codepush react-native rollback [flags]
airbuild codepush react-native status [flags]
```

See the framework-specific guides for detailed setup and usage:

- [Flutter CodePush →](/guides/codepush-flutter/)
- [React Native CodePush →](/guides/codepush-react-native/)

## API reference

All CodePush endpoints require an API key (`Authorization: Bearer airbuild_xxx`) and are gated by the corresponding feature flag. The CLI wraps these endpoints — you only need them directly if you're writing your own automation.

### Flutter endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `POST` | `/api/codepush/flutter/release` | Register a release |
| `POST` | `/api/codepush/flutter/patch` | Create a patch |
| `POST` | `/api/codepush/flutter/promote` | Promote a patch to a channel |
| `POST` | `/api/codepush/flutter/rollback` | Rollback a patch |
| `GET` | `/api/codepush/flutter/status?appId=xxx` | List releases and patches |

### React Native endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `POST` | `/api/codepush/react-native/publish` | Publish an update |
| `POST` | `/api/codepush/react-native/promote` | Promote an update to a channel |
| `POST` | `/api/codepush/react-native/rollback` | Rollback an update |
| `GET` | `/api/codepush/react-native/status?appId=xxx` | List releases and updates |

All endpoints return `403 OTA Updates are not available for your organization yet.` when the feature flag is disabled.
