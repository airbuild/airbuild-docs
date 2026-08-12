---
title: CLI Tool
description: The AirBuild CLI — a standalone Go binary for uploading builds and managing links from the terminal.
---

# AirBuild CLI

The AirBuild CLI is a standalone **Go binary** that lets you upload builds, list apps and builds, and manage install links from the terminal — no Node.js required. It's ideal for CI/CD pipelines and local automation.

## Installation

### Download from GitHub Releases

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

### Install with Go

If you have Go 1.21+ installed:

```bash
go install github.com/airbuild/cli@latest
```

## Authentication

Authenticate with an API key (see [API Keys](./api-keys/) for how to create one):

```bash
airbuild login --api-key airbuild_xxx
```

This stores your API key in the config file at `~/.airbuild/config.json`.

## Commands

### `airbuild login`

Authenticate with an API key.

```bash
airbuild login --api-key airbuild_xxx
```

### `airbuild upload`

Upload a build file.

```bash
airbuild upload ./app.apk --app-id clxxxxx
```

| Flag       | Description                          | Required |
| ---------- | ------------------------------------ | -------- |
| `--app-id` | The app ID to upload the build to.   | ✓        |

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

## Configuration

The CLI stores its configuration at:

```text
~/.airbuild/config.json
```

This file contains your API key and the default organization. You can edit it manually, but using `airbuild login` is recommended.

## CI/CD examples

### GitHub Actions

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
        run: |
          curl -L -o airbuild https://github.com/airbuild/cli/releases/latest/download/airbuild-linux-amd64
          chmod +x airbuild
          sudo mv airbuild /usr/local/bin/

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
    - curl -L -o airbuild https://github.com/airbuild/cli/releases/latest/download/airbuild-linux-amd64
    - chmod +x airbuild
    - sudo mv airbuild /usr/local/bin/
    - airbuild login --api-key $AIRBUILD_API_KEY
    - airbuild upload ./app/build/outputs/apk/release/app-release.apk --app-id $AIRBUILD_APP_ID
```

## Cross-platform support

Pre-built binaries are available for:

- **macOS** — Apple Silicon (`darwin-arm64`) and Intel (`darwin-amd64`)
- **Linux** — x86_64 (`linux-amd64`) and ARM64 (`linux-arm64`)
- **Windows** — x86_64 (`windows-amd64`)

## Next steps

- [API Keys](./api-keys/) — Create a key for CLI authentication.
- [API Reference](./api-reference/) — The underlying API the CLI uses.
- [Upload Builds](../guides/upload-builds/) — The dashboard upload flow.
