---
title: CLI Tool
description: The AirBuild CLI — a standalone Go binary for uploading builds and managing links from the terminal.
---

# AirBuild CLI

The AirBuild CLI is a standalone **Go binary** that lets you upload builds, list apps and builds, and manage install links from the terminal — no Node.js required. It's ideal for CI/CD pipelines and local automation.

## Installation

### One-liner (macOS & Linux)

```bash
curl -fsSL https://raw.githubusercontent.com/airbuild/cli/main/install.sh | bash
```

This downloads the latest binary, installs it to `~/.local/bin/airbuild`, and checks that the directory is in your PATH.

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/airbuild/cli/main/install.ps1 | iex
```

This downloads the latest binary, installs it to `%LOCALAPPDATA%\AirBuild\airbuild.exe`, and adds the directory to your user PATH.

### Manual download

Pre-built binaries for macOS, Linux, and Windows are available on the [GitHub Releases page](https://github.com/airbuild/cli/releases).

```bash
# macOS (Apple Silicon)
curl -L -o airbuild https://github.com/airbuild/cli/releases/latest/download/airbuild-darwin-arm64
chmod +x airbuild
sudo mv airbuild /usr/local/bin/

# Linux (x86_64)
curl -L -o airbuild https://github.com/airbuild/cli/releases/latest/download/airbuild-linux-amd64
chmod +x airbuild
sudo mv airbuild /usr/local/bin/
```

```powershell
# Windows (PowerShell)
$dir = "$env:LOCALAPPDATA\AirBuild"
New-Item -ItemType Directory -Path $dir -Force
Invoke-WebRequest "https://github.com/airbuild/cli/releases/latest/download/airbuild-windows-amd64.exe" -OutFile "$dir\airbuild.exe"
[Environment]::SetEnvironmentVariable("Path", "$env:Path;$dir", "User")
```

### Install with Go

If you have Go 1.23+ installed:

```bash
go install github.com/airbuild/cli@latest
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
airbuild push --release --expiry 30        # Push with 30-day link expiry
airbuild push --json                       # JSON output for CI/CD parsing
airbuild push --release-notes "Bug fixes"  # Include release notes
```

| Flag              | Description                                        | Default  |
| ----------------- | -------------------------------------------------- | -------- |
| `--platform`      | `android` or `ios` (required if both configured)   | auto     |
| `--release`       | Upload the release build                           | yes      |
| `--debug`         | Upload the debug build                             | no       |
| `--all`           | Upload all configured platforms                    | no       |
| `--expiry`        | Install link expiry in days (0 = plan default)     | 0        |
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
        run: curl -fsSL https://raw.githubusercontent.com/airbuild/cli/main/install.sh | bash

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
        run: curl -fsSL https://raw.githubusercontent.com/airbuild/cli/main/install.sh | bash

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
    - curl -fsSL https://raw.githubusercontent.com/airbuild/cli/main/install.sh | bash
    - airbuild login --api-key $AIRBUILD_API_KEY
    - airbuild push --json
```

### Azure Pipelines (Windows)

```yaml
- script: |
    irm https://raw.githubusercontent.com/airbuild/cli/main/install.ps1 | iex
    airbuild login --api-key $(AIRBUILD_API_KEY)
    airbuild push --platform android --release
```

## Cross-platform support

Pre-built binaries are available for:

- **macOS** — Apple Silicon (`darwin-arm64`) and Intel (`darwin-amd64`)
- **Linux** — x86_64 (`linux-amd64`) and ARM64 (`linux-arm64`)
- **Windows** — x86_64 (`windows-amd64`) and ARM64 (`windows-arm64`)

The CLI auto-enables ANSI colors on Windows 10+ (VT processing) and falls back to plain text on legacy terminals.

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
