---
title: CLI Tool
description: The AirBuild CLI — a standalone Go binary for uploading builds and managing links from the terminal.
---

# AirBuild CLI

The AirBuild CLI is a standalone **Go binary** that lets you upload builds, list apps and builds, and manage install links from the terminal — no Node.js required. It's ideal for CI/CD pipelines and local automation.

## Installation

### One-liner (macOS & Linux)

```bash
curl -fsSL https://raw.githubusercontent.com/airbuild/airbuild-cli/main/install.sh | bash
```

This downloads the latest binary, installs it to `~/.local/bin/airbuild`, and checks that the directory is in your PATH.

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/airbuild/airbuild-cli/main/install.ps1 | iex
```

This downloads the latest binary, installs it to `%LOCALAPPDATA%\AirBuild\airbuild.exe`, and adds the directory to your user PATH.

### Manual download

Pre-built binaries for macOS, Linux, and Windows are available on the [GitHub Releases page](https://github.com/airbuild/airbuild-cli/releases).

```bash
# macOS (Apple Silicon)
curl -L -o airbuild https://github.com/airbuild/airbuild-cli/releases/latest/download/airbuild-darwin-arm64
chmod +x airbuild
sudo mv airbuild /usr/local/bin/

# Linux (x86_64)
curl -L -o airbuild https://github.com/airbuild/airbuild-cli/releases/latest/download/airbuild-linux-amd64
chmod +x airbuild
sudo mv airbuild /usr/local/bin/
```

```powershell
# Windows (PowerShell)
$dir = "$env:LOCALAPPDATA\AirBuild"
New-Item -ItemType Directory -Path $dir -Force
Invoke-WebRequest "https://github.com/airbuild/airbuild-cli/releases/latest/download/airbuild-windows-amd64.exe" -OutFile "$dir\airbuild.exe"
[Environment]::SetEnvironmentVariable("Path", "$env:Path;$dir", "User")
```

### Install with Go

If you have Go 1.23+ installed:

```bash
go install github.com/airbuild/airbuild-cli@latest
```

## Authentication

Authenticate with an API key (see [API Keys](./api-keys/) for how to create one):

```bash
airbuild login --api-key airbuild_xxx
```

This stores your API key in the config file at `~/.airbuild/config.json` (on Windows: `%USERPROFILE%\.airbuild\config.json`).

## Quick start

The fastest way to get started is with `init` + `push`:

```bash
# 1. Authenticate
airbuild login --api-key airbuild_xxx

# 2. Initialize your project (creates .airbuild.json)
airbuild init

# 3. Build your app, then push
flutter build apk --release    # or your framework's build command
airbuild push                  # uploads the build and prints the install link
```

## Commands

### `airbuild init`

Create a `.airbuild.json` config file for your project. This enables `airbuild push` — a one-command workflow that reads build paths from config.

```bash
airbuild init                    # Interactive setup
airbuild init --app-id clxxxx    # Link an existing app by ID
```

The interactive flow:

1. **Choose app** — link an existing app or create a new one
2. **Configure platforms** — select which platforms (Android, iOS, or both) to configure
3. **Set build paths** — specify debug and release build output paths (auto-suggested based on detected framework)

Framework auto-detection supports:
- **Flutter** — detects `pubspec.yaml`
- **React Native** — detects `metro.config.js` + `package.json`
- **Android native** — detects `build.gradle` / `build.gradle.kts`
- **iOS native** — detects `Package.swift`

#### Config file format

`.airbuild.json` is created in your project root:

```json
{
  "appId": "clxxxx...",
  "builds": {
    "android": {
      "debug": "build/app/outputs/flutter-apk/app-debug.apk",
      "release": "build/app/outputs/flutter-apk/app-release.apk"
    },
    "ios": {
      "debug": "build/ios/ipa/app-debug.ipa",
      "release": "build/ios/ipa/app-release.ipa"
    }
  }
}
```

Add `.airbuild.json` to your `.gitignore` if your `appId` should not be shared, or commit it if you want shared config across your team.

### `airbuild push`

Upload a build using the `.airbuild.json` config file. Reads build output paths from config — no need to specify `--app-id` or `--file` each time.

```bash
airbuild push                              # Push release build (auto platform if only one configured)
airbuild push --platform android           # Push Android release
airbuild push --platform ios --debug       # Push iOS debug
airbuild push --all                        # Push both platforms sequentially
airbuild push --json                       # JSON output for CI/CD parsing
airbuild push --release-notes "Bug fixes"  # Include release notes
```

| Flag              | Description                                        | Default  |
| ----------------- | -------------------------------------------------- | -------- |
| `--platform`      | `android` or `ios` (required if both configured)   | auto     |
| `--release`       | Upload the release build                           | yes      |
| `--debug`         | Upload the debug build                             | no       |
| `--all`           | Upload all configured platforms                    | no       |
| `--json`          | Output results as JSON (for CI/CD)                | no       |
| `--release-notes` | Release notes for this build                       | none     |

If the build file doesn't exist at the configured path, you'll get a helpful error:

```
✗ File not found: build/app/outputs/flutter-apk/app-release.apk — did you run the build first?
```

#### JSON output

For CI/CD pipelines, use `--json` to get machine-readable output:

```bash
airbuild push --all --json
```

```json
[
  {
    "platform": "android",
    "buildType": "release",
    "filePath": "build/app/outputs/flutter-apk/app-release.apk",
    "success": true,
    "buildId": "clxxxx...",
    "version": "1.2.3",
    "slug": "abc123",
    "installUrl": "https://airbuild.dev/i/abc123"
  },
  {
    "platform": "ios",
    "buildType": "release",
    "filePath": "build/ios/ipa/app-release.ipa",
    "success": true,
    "buildId": "clyyyy...",
    "version": "1.2.3",
    "slug": "def456",
    "installUrl": "https://airbuild.dev/i/def456"
  }
]
```

### `airbuild upload`

Upload a build file directly without a project config. Platform is auto-detected from the file extension.

```bash
airbuild upload ./app.apk --app-id clxxxxx
```

| Flag             | Description                          | Required |
| ---------------- | ------------------------------------ | -------- |
| `--app-id`       | The app ID to upload the build to.   | Yes      |
| `--platform`     | `IOS` or `ANDROID` (auto-detected)   | No       |
| `--release-notes`| Release notes for this build         | No       |

### `airbuild apps list`

List all apps in your organization.

```bash
airbuild apps list
```

### `airbuild builds list`

List builds for a given app.

```bash
airbuild builds list --app-id clxxxxx
```

### `airbuild links list`

List install links for a given app.

```bash
airbuild links list --app-id clxxxxx
```

### `airbuild links create`

Create a new install link for a build.

```bash
airbuild links create --build-id clxxxxx
```

### `airbuild config show`

Show the current CLI configuration.

```bash
airbuild config show
```

### `airbuild config set`

Set the API key or API URL directly without running `airbuild login`. Useful for CI/CD pipelines where interactive login isn't possible.

```bash
airbuild config set --api-key airbuild_xxxxxxxxxxxx
airbuild config set --api-url https://airbuild.dev
```

| Flag        | Description                          | Default                |
| ----------- | ------------------------------------ | ---------------------- |
| `--api-key` | API key to authenticate with         | none                   |
| `--api-url` | AirBuild API base URL                | `https://airbuild.dev` |

### `airbuild version`

Print the current CLI version and platform info.

```bash
airbuild version
```

### `airbuild upgrade`

Check for a newer version and upgrade the CLI in place. Queries the GitHub Releases API, downloads the correct binary for your OS/architecture, and atomically replaces the running binary.

```bash
airbuild upgrade           # Upgrade to the latest version
airbuild upgrade --check   # Only check if an update is available
```

| Flag     | Description                                  | Default |
| -------- | -------------------------------------------- | ------- |
| `--check`| Only check if an update is available         | no      |

You can also check the version at any time with `airbuild version` or `airbuild --version`.

## CodePush / OTA updates

Push code-only updates to your apps without a store re-submission. AirBuild
CodePush supports **Flutter** and **React Native** with independent feature
flags, channels, staged rollout, and instant rollback.

> **Prerequisite:** Run `airbuild init` first. It creates `.airbuild.json`
> in your project root, linking your app so you don't need `--app` on every
> codepush command. All commands below assume this has been done — `--app`
> is shown as optional in the flag tables.

> **Feature flag:** CodePush must be enabled for your organization by an
> admin (Admin → Feature Flags → `codepush_flutter` / `codepush_react_native`).
> All CodePush endpoints return `403` when the flag is disabled.

### CodePush setup commands

Before using CodePush, run `doctor` to check your environment, `install` to install missing dependencies, and `init` to configure your project. These commands eliminate the manual setup steps.

#### `airbuild codepush flutter doctor`

Check that all Flutter CodePush dependencies and configuration are in place.

```bash
airbuild codepush flutter doctor
```

Checks performed:
- `dart` on PATH
- `flutter` on PATH
- `shorebird` CLI installed
- `shorebird.yaml` exists and points to AirBuild
- `.airbuild.json` project config exists
- API key configured
- AirBuild API reachable

#### `airbuild codepush flutter install`

Install missing Flutter CodePush dependencies.

```bash
airbuild codepush flutter install
```

Currently installs:
- Shorebird CLI (via `dart pub global activate shorebird_cli`)

#### `airbuild codepush flutter init`

Initialize the current project for Flutter CodePush.

```bash
airbuild codepush flutter init
```

Creates `shorebird.yaml` with the AirBuild `base_url` if missing, and verifies `.airbuild.json` exists. Run `airbuild init` first if you haven't already.

#### `airbuild codepush react-native doctor`

Check that all React Native CodePush dependencies and configuration are in place.

```bash
airbuild codepush react-native doctor
```

Checks performed:
- `node` and `npx` on PATH
- `expo-updates` installed in `package.json`
- `app.json`/`app.config.js` configured with AirBuild manifest URL
- `.airbuild.json` project config exists
- API key configured
- AirBuild API reachable

#### `airbuild codepush react-native install`

Install missing React Native CodePush dependencies.

```bash
airbuild codepush react-native install
```

Currently installs:
- `expo-updates` (via `npx expo install` or `npm install`)

#### `airbuild codepush react-native init`

Initialize the current project for React Native CodePush.

```bash
airbuild codepush react-native init
```

Installs `expo-updates` if missing, configures `app.json`/`app.config.js` with the AirBuild manifest URL and `runtimeVersion` policy, and verifies `.airbuild.json` exists.

### Flutter CodePush

Requires the [Shorebird CLI](https://pub.dev/packages/shorebird_cli). The CLI can install it for you:

```bash
airbuild codepush flutter install
```

Your app must be built with the Shorebird updater embedded. See the [Shorebird docs](https://shorebird.dev/) for setup.

#### `airbuild codepush flutter release`

Register a Flutter release. The CLI builds the release locally and uploads it to AirBuild.

```bash
airbuild codepush flutter release android --version 1.0.0+1
```

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | no | `.airbuild.json` | App ID (read from config if omitted) |
| `--version` | yes | — | App version, e.g. `1.0.0+1` |
| `--architecture` | no | auto | Target architecture, e.g. `arm64-v8a` |
| `--channel` | no | `production` | Distribution channel |
| `--flutter-revision` | no | — | Flutter SDK version used |
| `--shorebird-app-id` | no | — | Shorebird app_id |
| `--release-notes` | no | — | Release notes |
| `--artifact` | no | auto-detect | Path to a pre-built release artifact (skips the build step) |
| `--skip-build` | no | `false` | Don't build — just upload `--artifact` |

#### `airbuild codepush flutter patch`

Create a Flutter patch. The CLI builds your patched app, computes a diff against the release, and uploads it — no manual diffing required.

```bash
airbuild codepush flutter patch android --release-version 1.0.0+1
```

If the CLI can't locate the generated diff (e.g. on iOS in some environments), pass `--artifact` with a pre-built diff:

```bash
airbuild codepush flutter patch ios --release-version 1.0.0+1 --artifact path/to/patch.diff
```

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | no | `.airbuild.json` | App ID (read from config if omitted) |
| `--release-version` | yes | — | Release version this patch targets |
| `--architecture` | no | — | Target architecture |
| `--channel` | no | `production` | Distribution channel |
| `--release-notes` | no | — | Patch notes |
| `--artifact` | no | auto | Path to a pre-built diff (skips the build step) |
| `--skip-build` | no | `false` | Don't build — use existing build output or `--artifact` |


#### `airbuild codepush flutter promote`

Promote a patch to a channel at a rollout percentage.

```bash
airbuild codepush flutter promote --patch 1 --channel production --rollout 25
```

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | no | `.airbuild.json` | App ID |
| `--update-id` | no | — | Update ID (alternative to patch number) |
| `--release-version` | no | — | Release version (with `--platform` + `--patch`) |
| `--platform` | no | — | `ANDROID` or `IOS` |
| `--patch` | no | — | Patch number (from `status`) |
| `--channel` | no | `production` | Channel to promote to |
| `--rollout` | no | `100` | Rollout percentage (0–100) |

#### `airbuild codepush flutter rollback`

Rollback a patch — devices revert on next check-in.

```bash
airbuild codepush flutter rollback --patch 1
```

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | no | `.airbuild.json` | App ID |
| `--update-id` | no | — | Update ID (alternative to patch number) |
| `--release-version` | no | — | Release version |
| `--platform` | no | — | `ANDROID` or `IOS` |
| `--patch` | no | — | Patch number |
| `--channel` | no | `production` | Channel |

#### `airbuild codepush flutter status`

Show all releases and patches for an app.

```bash
airbuild codepush flutter status
```

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | no | `.airbuild.json` | App ID |

### React Native CodePush

Requires `expo-updates` in your app and `npx` on your PATH. The CLI can install it for you:

```bash
airbuild codepush react-native install
```

#### `airbuild codepush react-native publish`

Publish an update. The CLI exports your bundle and assets locally, then uploads them to AirBuild.

```bash
airbuild codepush react-native publish --platform android --runtime-version 1.0.0
```

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | no | `.airbuild.json` | App ID |
| `--platform` | yes | — | `android` or `ios` |
| `--runtime-version` | yes | — | Must match `expo.updates.runtimeVersion` |
| `--channel` | no | `production` | Distribution channel |
| `--release-notes` | no | — | Release notes |
| `--output-dir` | no | `dist` | Export directory |
| `--skip-export` | no | `false` | Don't export — read `--output-dir` |

#### `airbuild codepush react-native promote`

Promote an update to a channel at a rollout percentage.

```bash
airbuild codepush react-native promote --update-id update_xxx --channel production --rollout 25
```

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | no | `.airbuild.json` | App ID |
| `--update-id` | no | — | Update ID (alternative to `--platform` + `--runtime-version`) |
| `--platform` | no | — | `ANDROID` or `IOS` |
| `--runtime-version` | no | — | Runtime version |
| `--channel` | no | `production` | Channel to promote to |
| `--rollout` | no | `100` | Rollout percentage (0–100) |

#### `airbuild codepush react-native rollback`

Rollback an update — devices revert on next check-in.

```bash
airbuild codepush react-native rollback --update-id update_xxx
```

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | no | `.airbuild.json` | App ID |
| `--update-id` | yes | — | Update ID |

#### `airbuild codepush react-native status`

Show all releases and updates for an app.

```bash
airbuild codepush react-native status
```

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | no | `.airbuild.json` | App ID |

### CodePush limitations

- **iOS patch creation may require `--artifact`.** On iOS, the CLI can't always locate the generated diff automatically. If that happens, pass `--artifact` with a pre-built diff file.
- **Multi-architecture releases.** When you upload multiple architectures for the same release (e.g. `arm64-v8a` + `armeabi-v7a`), only the last-uploaded architecture is retained. For multi-arch setups, either upload one architecture per release or use `--artifact` to target a specific arch.
- **Patches are Dart-only (Flutter).** Native code changes and asset changes cannot be patched — you need a new release for those.
- **One release per version + channel.** Re-registering the same version on the same channel appends architectures to the existing release rather than creating a new one.

### Typical CodePush workflow

```bash
# --- Flutter ---
airbuild codepush flutter doctor                    # check environment
airbuild codepush flutter install                   # install missing deps
airbuild codepush flutter init                      # configure project
airbuild init                                       # one-time: link app
airbuild codepush flutter release android --version 1.0.0+1
# ...fix a Dart bug...
airbuild codepush flutter patch android --release-version 1.0.0+1
airbuild codepush flutter promote --patch 1 --channel production --rollout 25
airbuild codepush flutter rollback --patch 1

# --- React Native ---
airbuild codepush react-native doctor               # check environment
airbuild codepush react-native install              # install missing deps
airbuild codepush react-native init                 # configure project
airbuild init                                       # one-time: link app
airbuild codepush react-native publish --platform android --runtime-version 1.0.0
airbuild codepush react-native promote --update-id update_xxx --rollout 25
airbuild codepush react-native rollback --update-id update_xxx
```

See the integration guides for setup instructions, device-side
configuration, and compliance details:
- [Flutter CodePush](../guides/codepush-flutter/)
- [React Native CodePush](../guides/codepush-react-native/)

## Configuration

### CLI config (`~/.airbuild/config.json`)

Stores your API key and organization info. Created by `airbuild login`.

```text
~/.airbuild/config.json          # macOS / Linux
%USERPROFILE%\.airbuild\config.json   # Windows
```

### Project config (`.airbuild.json`)

Stores the app ID and build output paths for the current project. Created by `airbuild init`. Used by `airbuild push`.

```text
.airbuild.json   # in your project root
```

## CI/CD examples

### GitHub Actions (with init + push)

```yaml
name: Distribute Build

on:
  push:
    tags:
      - 'v*'

jobs:
  distribute:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install AirBuild CLI
        run: curl -fsSL https://raw.githubusercontent.com/airbuild/airbuild-cli/main/install.sh | bash

      - name: Login
        run: airbuild login --api-key ${{ secrets.AIRBUILD_API_KEY }}

      - name: Build
        run: flutter build apk --release

      - name: Push to AirBuild
        run: airbuild push --json
```

### GitHub Actions (direct upload)

```yaml
name: Distribute Build

on:
  push:
    tags:
      - 'v*'

jobs:
  distribute:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install AirBuild CLI
        run: curl -fsSL https://raw.githubusercontent.com/airbuild/airbuild-cli/main/install.sh | bash

      - name: Login
        run: airbuild login --api-key ${{ secrets.AIRBUILD_API_KEY }}

      - name: Upload build
        run: airbuild upload ./app/build/outputs/apk/release/app-release.apk --app-id ${{ secrets.AIRBUILD_APP_ID }}
```

### GitLab CI

```yaml
stages:
  - distribute

distribute:
  stage: distribute
  only:
    - tags
  script:
    - curl -fsSL https://raw.githubusercontent.com/airbuild/airbuild-cli/main/install.sh | bash
    - airbuild login --api-key $AIRBUILD_API_KEY
    - airbuild push --json
```

### Azure Pipelines (Windows)

```yaml
- script: |
    irm https://raw.githubusercontent.com/airbuild/airbuild-cli/main/install.ps1 | iex
    airbuild login --api-key $(AIRBUILD_API_KEY)
    airbuild push --platform android --release
```

## Cross-platform support

Pre-built binaries are available for:

- **macOS** — Apple Silicon (`darwin-arm64`) and Intel (`darwin-amd64`)
- **Linux** — x86_64 (`linux-amd64`) and ARM64 (`linux-arm64`)
- **Windows** — x86_64 (`windows-amd64`) and ARM64 (`windows-arm64`)

The CLI auto-enables ANSI colors on Windows 10+ (VT processing) and falls back to plain text on legacy terminals.

### Windows Defender false positive

Go binaries are not code-signed by default, which can cause Windows Defender or other antivirus software to flag them as suspicious. This is a **false positive** — the AirBuild CLI is open source and contains no malicious code.

To resolve:

1. **Verify the checksum** — compare the SHA-256 of your downloaded binary with `checksums.txt` from the [release page](https://github.com/airbuild/airbuild-cli/releases).
2. **Add an exclusion** — in Windows Security > Virus & threat protection > Manage settings > Add or remove exclusions, add the `airbuild.exe` path.
3. **Build from source** — if you prefer, build from source with Go:
   ```bash
   go install github.com/airbuild/airbuild-cli@latest
   ```

We are working on code signing for future releases to eliminate this issue.

## Releasing

Releases are automated via GitHub Actions. To create a new release:

```bash
git tag cli-v1.0.0
git push origin cli-v1.0.0
```

This triggers the release workflow which cross-compiles binaries for all 6 platforms, generates SHA-256 checksums, and creates a GitHub Release with all binaries attached.

## Next steps

- [API Keys](./api-keys/) — Create a key for CLI authentication.
- [API Reference](./api-reference/) — The underlying API the CLI uses.
- [Upload Builds](../guides/upload-builds/) — The dashboard upload flow.
