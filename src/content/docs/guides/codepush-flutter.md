---
title: Flutter CodePush
description: Push Dart code patches to Flutter apps without a store re-submission, with staged rollout, signing, and rollback.
---

# Flutter CodePush

Flutter CodePush lets you push **Dart-only code patches** to your Flutter app without a full store re-submission. Ship bug fixes and small tweaks in minutes, with staged rollout, on-device signature verification, and instant rollback.

AirBuild is the **control plane** — releases, patches, channels, rollouts, and metrics — while the on-device patching is done by an open-source updater runtime the CLI embeds into your build. Everything goes through your AirBuild server.

## When to use CodePush — and when not to

**CodePush works for:**

- Dart code changes — bug fixes, UI tweaks, copy changes, logic fixes
- Anything that compiles into the Dart snapshot: `lib/` changes, pubspec Dart dependency updates, `--dart-define` constants
- Both Android (APK/AAB, all ABIs) and iOS

**CodePush does NOT work for:**

- **Native code** — Kotlin/Java/Swift/Objective-C changes, new permissions, `AndroidManifest.xml`/`Info.plist` edits
- **Assets** — images, fonts, `.env` files, anything in `pubspec.yaml`'s `assets:` section or platform asset folders
- **Flutter/engine upgrades** — patches must be built on the same Flutter engine revision as the release
- **Plugins with native parts** — adding/upgrading a plugin whose Dart API is fine but that ships new native code won't deliver the native half

The CLI detects these at patch time and **warns** (native/asset/engine diffs are listed before upload), but the patch still ships — the unpatchable parts simply won't reach devices. Treat the warning as "this needs a new build + release", not "blocked".

**Rule of thumb:** if `git diff` touches anything outside `lib/` and Dart dependencies, ship a new binary build instead of a patch.

## Prerequisites

- An AirBuild account with the `codepush_flutter` feature flag enabled for your organization
- The [AirBuild CLI](/developer/cli/) installed and authenticated (`airbuild login --api-key airbuild_xxx`)
- A Flutter project (the AirBuild CLI installs everything it needs — see setup below)
- Java 17+ for Android builds (e.g. Android Studio's bundled JBR); Xcode for iOS builds

## Setup (one-time per project)

```bash
airbuild login --api-key airbuild_xxx
airbuild init                              # links project → creates .airbuild.json
airbuild codepush flutter doctor           # verify environment
airbuild codepush flutter install          # install the CodePush build toolchain
airbuild codepush flutter init             # write shorebird.yaml + add it to pubspec assets
```

`init` writes `shorebird.yaml` with your `app_id`, `base_url`, `distribution_key`, `channel`, and `auto_update`, and adds the file to `pubspec.yaml`'s `flutter.assets` so it's bundled into your app.

## The update lifecycle

1. **`release`** — builds your app and registers the release artifacts with AirBuild. Install this exact build on devices.
2. **`patch`** — you change Dart code; the CLI rebuilds, diffs against the release artifacts, and uploads the diff as a draft.
3. **`promote`** — activates the patch on a channel at a rollout percentage.
4. **Devices** — the embedded updater checks AirBuild on app launch (or when your code asks), downloads the diff, verifies hash + signature, and applies it on the next launch.
5. **`rollback`** — stops serving a patch and tells already-patched devices to revert.

### Release

```bash
airbuild codepush flutter release android --version 1.0.0+1
airbuild codepush flutter release ios     --version 1.0.0+1
```

- **Android:** builds `app-release.apk` (or `.aab` with `--format aab`), extracts `libapp.so` for every ABI present (typically `arm64-v8a`, `armeabi-v7a`, `x86_64`), and uploads them all under one release.
- **iOS:** builds a **signed** `.app`, zips the `App` binary plus its link supplements, and uploads. **Install this exact `.app` on devices** — an AOT snapshot from a different build can never be patched (the diff base won't match). Re-signing the same `.app` later is safe; recompiling is not. Use `--no-codesign` only when a CI step signs that same binary afterwards.

### Patch

```bash
# change Dart code, then:
airbuild codepush flutter patch android --release-version 1.0.0+1
airbuild codepush flutter patch ios     --release-version 1.0.0+1
```

- Android: builds the APK, diffs each ABI's `libapp.so` against the release, uploads all diffs as **one** patch.
- iOS: builds the app, runs the full local pipeline (`app.dill` → `gen_snapshot` → `aot-tools link` → `dump_blobs` → binary diff) — fully automatic, same as Android.
- The patch is created as a **DRAFT at 0% rollout** — nothing reaches devices until you promote it.

### Promote

```bash
airbuild codepush flutter promote \
  --release-version 1.0.0+1 --platform android \
  --patch 1 --channel production --rollout 25
```

Rollouts are **deterministic** — each device hashes into a stable bucket, so the same device gets the same verdict on every check-in, and ramping 25% → 100% cleanly adds the remaining devices. Re-promoting the same patch changes only the rollout percentage.

### Rollback

```bash
airbuild codepush flutter rollback \
  --release-version 1.0.0+1 --platform android --patch 1
```

The patch stops being served immediately and its number is broadcast in `rolled_back_patch_numbers`, so devices that already installed it revert to the base release on their next launch.

### Status

```bash
airbuild codepush flutter status
```

Lists releases, patches, channels, rollout %, and metrics (check-ins, downloads, installs, install failures) per patch.

## Channels

Every app has `production` and `staging` by default; custom channels are created implicitly by promoting to a new name.

**Important:** the `channel:` key in `shorebird.yaml` is **stripped at build time** — the compiled-in updater always reports `stable`, which AirBuild maps to `production`. So:

- **Automatic updates always come from production.** You cannot point a device at staging via the yaml.
- **To test staging on a device**, use the [Flutter SDK](/developer/sdks/) with `auto_update: false` and manual checks:

```yaml
# shorebird.yaml — manual update mode
auto_update: false
```

```dart
final codePush = AirBuildCodePush(defaultChannel: 'staging');
final status = await codePush.checkForUpdate();
if (status == UpdateStatus.outdated) await codePush.update();
```

With `auto_update: false` the engine's boot thread does nothing — `checkForUpdate`/`update` are the only update path, and the channel name is sent verbatim to the server (`"staging"`, `"internal-qa"`, anything you promote to).

For a batteries-included option, `AirBuildCodePushOverlay` runs the whole lifecycle (check on launch/resume/timer → download → restart banner) from a single widget — see the [Flutter SDK reference](/developer/sdks/):

```dart
MaterialApp(
  builder: (context, child) => AirBuildCodePushOverlay(
    config: AirBuildCodePushConfig(
      channel: 'staging',
      onRestart: () => restartMyApp(),
    ),
    child: child ?? const SizedBox.shrink(),
  ),
  home: const HomePage(),
)
```

If the same binary is also distributed via Google Play, `disableOnPlayStoreInstalls: true` (on `AirBuildCodePush` or the overlay config) skips patch checks/downloads on Play-installed devices. It only gates Dart-driven checks — the `auto_update` boot thread is unaffected, so combine it with `auto_update: false`.

## Patch signing

Every patch response carries `hash_signature` (RSA-PKCS1v15-SHA256 over the artifact hash). The CLI **automatically** fetches your org's public key at build time and injects it via `SHOREBIRD_PUBLIC_KEY` — builds made through `airbuild codepush flutter release|patch` verify patch signatures on-device by default. Devices built without the key skip signature checks (hash integrity still applies).

> **Gotcha:** the Gradle daemon caches its environment. If a signing key was just added/rotated, run `cd android && ./gradlew --stop` before rebuilding, or the build won't see the new `SHOREBIRD_PUBLIC_KEY`.

## Multi-architecture support

Android fat builds ship `libapp.so` per ABI. Release registers all detected ABIs (shown as `Architectures: arm64-v8a, armeabi-v7a, x86_64`), and each patch carries one diff per ABI. Devices automatically receive the diff matching their architecture; unsupported architectures get no patch. Use `--architecture` to restrict to a single ABI.

## --dart-define support

Both `release` and `patch` forward `--dart-define` and `--dart-define-from-file` to `flutter build`:

```bash
airbuild codepush flutter release android --version 1.0.0+1 \
  --dart-define=API_URL=https://api.example.com \
  --dart-define-from-file=env.json    # JSON object: {"KEY":"value"}
```

Dart-define constants compile into `libapp.so`, so they **are patchable** — a patch can change them on devices. The CLI records the release's define set (value hashes only — secrets are never persisted) and **warns if a patch's defines drift** (`+added`, `~changed`, `-reverts to default`), since a patch built without a define silently reverts it to the `fromEnvironment` default.

## Safety nets

- **Boundary detection** — the CLI fingerprints the packaged release and warns at patch time when native code, assets, or the engine differ (i.e. things a patch can't deliver).
- **dart-define drift** — warns when patch defines differ from the release's.
- **Metrics** — per-patch check-ins, downloads, successful installs, and install failures (from `/api/v1/patches/events`).
- **Auto-pause** — once ≥10 install reports exist for a patch, a ≥30% failure rate auto-pauses it: it stops being served, downloads return 410, and a webhook + audit entry fire. Re-promoting resets it.
- **Rollback** — device-side revert via `rolled_back_patch_numbers`.
- **Bad-patch memory** — the updater remembers a patch that failed to apply and skips it on future launches.

## CLI reference

### `airbuild codepush flutter release <android|ios>`

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | — | `.airbuild.json` | App ID |
| `--version` | ✓ | — | App version, e.g. `1.0.0+1` |
| `--channel` | — | `production` | Channel to register the release under |
| `--architecture` | — | all detected | Restrict to one ABI, e.g. `arm64-v8a` |
| `--format` | — | `apk` | Android build format: `apk` or `aab` |
| `--flutter-revision` | — | detected | Flutter SDK revision used to build |
| `--shorebird-app-id` | — | — | Upstream runtime app_id, if tracking one |
| `--release-notes` | — | — | Release notes |
| `--artifact` | — | auto-detect | Pre-built artifact (skips the build) |
| `--skip-build` | — | `false` | Don't build — upload `--artifact`/detected output |
| `--no-codesign` | — | `false` | iOS: build unsigned (CI re-signs the same `.app` later) |
| `--dart-define` | — | — | `KEY=VALUE` compile-time constant (repeatable) |
| `--dart-define-from-file` | — | — | JSON file of dart-define values (repeatable) |

### `airbuild codepush flutter patch <android|ios>`

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | — | `.airbuild.json` | App ID |
| `--release-version` | ✓ | — | Release version this patch targets |
| `--channel` | — | `production` | Channel the release was registered under |
| `--architecture` | — | all | Restrict diff to one ABI |
| `--release-notes` | — | — | Patch notes |
| `--artifact` | — | auto-diff | Pre-built diff file |
| `--artifact-sha256` | with `--artifact` | — | sha256 of the *patched* artifact (what devices verify) |
| `--skip-build` | — | `false` | Diff from existing build output, don't rebuild |
| `--dart-define` | — | — | `KEY=VALUE` constant (repeatable) |
| `--dart-define-from-file` | — | — | JSON file of dart-define values (repeatable) |

### `airbuild codepush flutter promote`

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | — | `.airbuild.json` | App ID |
| `--update-id` | — | — | Update ID (alternative lookup) |
| `--release-version` + `--platform` + `--patch` | — | — | Identify the patch by number |
| `--channel` | — | `production` | Channel to promote to |
| `--rollout` | — | `100` | Rollout percentage (0–100) |

### `airbuild codepush flutter rollback`

| Flag | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `--app` | — | `.airbuild.json` | App ID |
| `--update-id` | — | — | Update ID (alternative lookup) |
| `--release-version` + `--platform` + `--patch` | — | — | Identify the patch |
| `--channel` | — | `production` | Channel |

### Setup commands

| Command | Description |
| ------- | ----------- |
| `airbuild codepush flutter doctor` | Verify toolchain, config, API reachability |
| `airbuild codepush flutter install [--yes]` | Install the CodePush build toolchain (`~/.shorebird`) |
| `airbuild codepush flutter init` | Write `shorebird.yaml` + add it to `pubspec.yaml` assets |

## Typical workflow

```bash
# 1. Register the release — install this exact build on devices
airbuild codepush flutter release android --version 1.0.0+1

# 2. Fix a bug in Dart code, then create the patch (draft at 0%)
airbuild codepush flutter patch android --release-version 1.0.0+1 \
  --release-notes "Fixed login crash"

# 3. Stage it
airbuild codepush flutter promote --release-version 1.0.0+1 --platform android \
  --patch 1 --channel staging --rollout 100
# verify on a device via the SDK's manual staging channel...

# 4. Canary, then ramp
airbuild codepush flutter promote --release-version 1.0.0+1 --platform android \
  --patch 1 --channel production --rollout 25
airbuild codepush flutter promote --release-version 1.0.0+1 --platform android \
  --patch 1 --channel production --rollout 100

# 5. Or roll back instantly
airbuild codepush flutter rollback --release-version 1.0.0+1 --platform android --patch 1
```

## shorebird.yaml reference

Only these keys survive into the compiled app — everything else is stripped at build time:

| Key | Effect |
| --- | ------ |
| `app_id` | Your AirBuild app ID (required) |
| `base_url` | `https://airbuild.dev` (written by `init`) — the updater calls `{base_url}/api/v1/patches/check` |
| `auto_update` | `true` (default): engine auto-checks `stable`→production at launch. `false`: no boot check — drive updates from Dart (required for channel selection) |
| `patch_verification` | Optional updater verifier flag, passed through if set |
| `patch_public_key` | **Not read from the yaml** — injected from `SHOREBIRD_PUBLIC_KEY` env at build time (the CLI does this automatically) |
| `channel`, `distribution_key` | Stripped — informational only |

## Troubleshooting

| Symptom | Likely cause |
| ------- | ------------ |
| Patch never arrives on device | Patch is still a DRAFT — promote it. Or the device isn't in the rollout bucket — check `status` metrics |
| "Update rejected: hash mismatch" | Release artifact ≠ the binary installed on the device. Re-register the release from the exact build you installed |
| iOS patch won't apply | The installed `.app` came from a different compilation — always install the `.app` produced by `release ios` |
| Warning about `classes.dex`/assets | A non-Dart change snuck into the patch — the warning lists the files; ship a new build for those changes |
| Channel check returns nothing | `channel:` in `shorebird.yaml` is stripped — use `AirBuildCodePush` + `auto_update: false` for non-production channels |
| Signature not verified | Build ran before `SHOREBIRD_PUBLIC_KEY` was visible — `cd android && ./gradlew --stop`, rebuild |
