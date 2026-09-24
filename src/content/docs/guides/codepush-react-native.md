---
title: React Native CodePush
description: Push JS bundle updates to React Native apps without a store re-submission, with staged rollout and rollback.
---

# React Native CodePush

React Native CodePush lets you push **JS bundle updates** to your React Native app without a full store re-submission. Ship bug fixes and small tweaks in minutes, with staged rollout and instant rollback. It works with both Expo-managed and bare React Native apps using the standard `expo-updates` package.

## Prerequisites

- An AirBuild account with the `codepush_react_native` feature flag enabled for your organization
- The [AirBuild CLI](/developer/cli/) installed
- Node.js and `npx` available on your PATH ([install guide](https://nodejs.org/))
- Your React Native app (Expo-managed or bare)

The AirBuild CLI can install `expo-updates` and configure your project automatically:

```bash
# One-time: authenticate and link this project to an app (creates .airbuild.json)
airbuild login --api-key airbuild_xxx
airbuild init

# Check what's needed
airbuild codepush react-native doctor

# Install missing dependencies (e.g. expo-updates)
airbuild codepush react-native install

# Initialize project (installs expo-updates + configures app.json/app.config.js)
airbuild codepush react-native init
```

## How it works

1. You publish an update with AirBuild (the CLI exports your bundle and assets for you)
2. Your app checks AirBuild for updates on launch
3. If an update is available, the app downloads the new bundle and assets
4. On the next app launch, the new bundle is loaded
5. You control rollout via channels and percentages

## Enable CodePush for your app

1. Go to your app's detail page in the AirBuild dashboard
2. Click **"Enable OTA Updates"** in the sidebar
3. Select **React Native**
4. Click **Enable**

This generates a distribution key for your app. You'll need this for the `expo-updates` configuration.

## Configure expo-updates in your app

Run `airbuild codepush react-native init` to automatically configure your project — it installs `expo-updates` if missing and sets `updates.url` (with your distribution key) in `app.json`. If the project uses `app.config.js`/`app.config.ts`, it prints the snippet to add yourself.

If you prefer to configure manually, add the following to your `app.json` (Expo) or `app.config.js`:

```json
{
  "expo": {
    "updates": {
      "url": "https://airbuild.dev/api/codepush/react-native/manifest?key=your-distribution-key",
      "requestHeaders": {
        "expo-channel-name": "production"
      },
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 0
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
```

The distribution key goes in the `?key=` query parameter — it's a public identifier that's safe to embed in your app binary.

> **Important:** The `runtimeVersion` must match the `--runtime-version` you pass to the CLI. If you use `"policy": "appVersion"`, the runtime version will be your app's version string (e.g. `1.0.0`). A new binary build (with a new version) creates a new runtime version — updates published for the old runtime version won't apply to the new binary.

For bare React Native (not using Expo), configure `expo-updates` in your native code. See the [expo-updates documentation](https://docs.expo.dev/eas-update/getting-started/) for setup instructions.

## CLI commands

### `airbuild codepush react-native publish`

Publish a React Native update. The CLI exports your bundle and assets locally, then uploads them to AirBuild.

```bash
airbuild codepush react-native publish \
  --app app_xxx \
  --platform android \
  --runtime-version 1.0.0 \
  --channel production \
  --release-notes "Fixed navigation bug"
```

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | ✓ | — | App ID |
| `--platform` | ✓ | — | `android` or `ios` |
| `--runtime-version` | ✓ | — | Must match `expo.updates.runtimeVersion` in app.json |
| `--channel` | — | `production` | Distribution channel |
| `--release-notes` | — | — | Release notes |
| `--output-dir` | — | `dist` | Directory to export to / read from |
| `--skip-export` | — | `false` | Don't export — just read `--output-dir` |

**Example — skip export, use pre-exported bundle:**

```bash
npx expo export --output-dir ./build-output --platform android

airbuild codepush react-native publish \
  --app app_xxx \
  --platform android \
  --runtime-version 1.0.0 \
  --output-dir ./build-output \
  --skip-export
```

### `airbuild codepush react-native promote`

Promote an update to a channel at a specific rollout percentage.

```bash
# Promote to 25% of production devices
airbuild codepush react-native promote \
  --app app_xxx \
  --update-id update_xxx \
  --channel production \
  --rollout 25
```

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | ✓ | — | App ID |
| `--update-id` | — | — | Update ID (from `publish` response or `status`) |
| `--platform` | — | — | `ANDROID` or `IOS` (alternative to `--update-id`) |
| `--runtime-version` | — | — | Runtime version (with `--platform`) |
| `--channel` | — | `production` | Channel to promote to |
| `--rollout` | — | `100` | Rollout percentage (0–100) |

### `airbuild codepush react-native rollback`

Rollback an update. Devices will revert to the previous version on their next check-in.

```bash
airbuild codepush react-native rollback \
  --app app_xxx \
  --update-id update_xxx
```

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | ✓ | — | App ID |
| `--update-id` | ✓ | — | Update ID |

### `airbuild codepush react-native status`

Show all releases and updates for an app.

```bash
airbuild codepush react-native status --app app_xxx
```

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | ✓ | — | App ID |

Output shows channels, releases (grouped by runtime version), and for each release its updates with status, rollout %, channel, asset count, and creation date.

## Signing key

AirBuild generates a signing key pair for each app when CodePush is enabled. The **public key** is available on the OTA Updates tab in the dashboard and via the API:

```bash
curl https://airbuild.dev/api/apps/app_xxx/codepush/signing-key \
  -H "Authorization: Bearer airbuild_xxx"
```

Configure `expo-updates` to verify update signatures by adding the public key to your `app.json`:

```json
{
  "expo": {
    "updates": {
      "url": "https://airbuild.dev/api/codepush/react-native/manifest?key=your-distribution-key"
    }
  }
}
```

The signing key ensures that devices only install updates that were signed by AirBuild, preventing tampering.

## Typical workflow

```bash
# 1. Publish an update
airbuild codepush react-native publish \
  --app app_xxx \
  --platform android \
  --runtime-version 1.0.0 \
  --release-notes "Fixed navigation bug"

# 2. Promote to 25% of devices
airbuild codepush react-native promote \
  --app app_xxx \
  --update-id update_xxx \
  --channel production \
  --rollout 25

# 3. Monitor — increase rollout if no issues
airbuild codepush react-native promote \
  --app app_xxx \
  --update-id update_xxx \
  --channel production \
  --rollout 100

# 4. Rollback if something goes wrong
airbuild codepush react-native rollback \
  --app app_xxx \
  --update-id update_xxx
```

## CI/CD integration

CodePush works well in CI/CD pipelines. Example GitHub Actions step:

```yaml
- name: Publish OTA update
  env:
    AIRBUILD_API_KEY: ${{ secrets.AIRBUILD_API_KEY }}
  run: |
    airbuild codepush react-native publish \
      --app ${{ vars.AIRBUILD_APP_ID }} \
      --platform android \
      --runtime-version ${{ github.ref_name }} \
      --channel staging \
      --release-notes "CI build ${{ github.sha }}"
```

## Limitations

- **JS bundle only** — updates can change JavaScript code and assets, not native code (native modules, iOS/Android-specific code)
- **Runtime version must match** — updates only apply to devices running the same runtime version; a new binary build with a different version creates a new runtime version
- **expo-updates required** — your app must have `expo-updates` installed and configured; standard React Native without it won't check for updates
- **No rollback to specific version** — rollback disables the current update; devices revert to the previously active update or the bundled version
