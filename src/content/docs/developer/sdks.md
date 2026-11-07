---
title: SDKs
description: In-app SDKs for Flutter, React Native, iOS, and Android to check for updates and prompt testers to install.
---

# SDKs

AirBuild offers in-app SDKs that let your app check for new binary builds and prompt testers to install them. The SDKs communicate with the AirBuild API to deliver a seamless update experience inside your app.

## Available SDKs

| Platform      | Package name                  | Package manager       | Status     |
| ------------- | ----------------------------- | --------------------- | ---------- |
| Flutter       | `airbuild`                    | pub.dev               | Available  |
| React Native  | `@airbuild/react-native`      | npm                   | Publishing |
| iOS           | `AirBuild`                    | CocoaPods / SPM       | Via git tag / SPM   |
| Android       | `dev.airbuild:airbuild-android`| Maven Central         | Via GitHub / JitPack |

## Features

All SDKs support the following:

- **Check for updates** — Query AirBuild for the latest build of your app and compare it to the installed version.
- **Default update dialog** — Shows a built-in dialog with the new version, release notes, and Update/Later buttons. No custom UI required.
- **Download & install** — Downloads the update and triggers installation (APK for Android, install URL for iOS).
- **Analytics reporting** — Reports events (prompt shown, accepted, declined, download started, install started) to AirBuild for monitoring.

## Configuration

All SDKs use the same configuration model:

1. **Distribution key** (`dk_xxx`) — a public, per-app identifier from the AirBuild dashboard (App Settings page). Safe to embed in distributed apps — it is not a secret.
2. **Base URL** — all SDKs talk to `https://airbuild.dev`. No configuration needed.

No secret token is needed. Secrets embedded in mobile apps get extracted from APK/IPA binaries, so the distribution key is public by design. Access control is handled server-side (password-protected builds, rate limiting, download quotas).

## Flutter

Install via pub.dev:

```bash
flutter pub add airbuild
```

The package ships **two independent libraries** — import either or both:

| Library | Feature | What it does |
| ------- | ------- | ------------ |
| `package:airbuild/airbuild.dart` | **Build distribution** | Checks for a **new binary build** (APK/IPA) and prompts the tester to install it |
| `package:airbuild/airbuild_code_push.dart` | **CodePush** | Receives **Dart-only patches** that apply on top of the installed build — no store re-submission |

### Binary build update check

Configure once at startup, then check anywhere:

```dart
import 'package:airbuild/airbuild.dart';

void main() {
  AirBuild.configure(
    distributionKey: 'dk_a1b2c3d4e5f6',
  );
  runApp(const MyApp());
}
```

```dart
// e.g. on app start or behind a "Check for Updates" button:
final info = await AirBuild.checkForUpdates(
  context: context,            // shows the built-in dialog; omit for a headless check
  currentVersion: '1.0.0',
  appName: 'My App',           // optional — dialog title becomes "My App update available"
);
```

`checkForUpdates` parameters:

| Parameter | Required | Description |
| --------- | -------- | ----------- |
| `currentVersion` | yes | Your app's version string (e.g. `'1.0.0'`). Compared against the latest build on the server. |
| `context` | no | Build context used to show the default dialog. Omit it to check silently and build your own UI from the returned `UpdateInfo`. |
| `currentBuildNumber` | no | Android `versionCode` / iOS `CFBundleVersion`. Auto-detected via `package_info_plus` when omitted — lets the server distinguish same-version builds (`1.0.0+1` vs `1.0.0+2`). |
| `appName` | no | App name shown in the dialog title. |
| `distributionKey` (on `configure`) | yes | Public `dk_xxx` key from the dashboard — safe to embed. |
| `baseUrl` (on `configure`) | no | Defaults to `https://airbuild.dev`. Override for self-hosted servers. |

#### `UpdateInfo`

`checkForUpdates` always returns an `UpdateInfo`, whether or not a dialog was shown — drive your own UI from it:

| Field | Type | Description |
| ----- | ---- | ----------- |
| `hasUpdate` | `bool` | `true` when a newer build exists — all other fields are only set when this is true |
| `latestVersion` | `String?` | Version of the latest build (e.g. `1.2.0`) |
| `latestBuildNumber` | `int?` | Build number of the latest build |
| `buildId` | `String?` | Server-side build id |
| `releaseNotes` | `String?` | Release notes for the build |
| `downloadUrl` | `String?` | Direct APK download URL (Android only) |
| `installUrl` | `String?` | Browser install URL (iOS — the SDK opens it in Safari) |
| `fileSizeBytes` | `int?` | Artifact size in bytes |
| `fileSizeDisplay` | `String` | Human-readable size, e.g. `"24.3 MB"` |
| `iconUrl` | `String?` | App icon shown in the dialog |
| `minOsVersion` | `String?` | Minimum OS version required |
| `isPasswordProtected` | `bool` | Build needs a password — handled by the web install flow, not the SDK |
| `createdAt` | `String?` | ISO timestamp of when the build was uploaded |

#### Default dialog vs. custom UI

With `context` passed, the SDK shows its built-in `UpdateDialog` — app icon, new version, file size, release notes, and **Update**/**Later** buttons — then runs the platform install flow (APK download + system installer on Android, install URL in Safari on iOS) and reports analytics events automatically.

To use your own UI, omit `context` and render `UpdateInfo` yourself:

```dart
final info = await AirBuild.checkForUpdates(currentVersion: '1.0.0');
if (info.hasUpdate) {
  // Build any prompt you like from info.latestVersion,
  // info.releaseNotes, info.fileSizeDisplay, info.iconUrl, …
}
```

If you want the SDK's dialog but need to hook the buttons, call `showUpdateDialog` directly and use `AirBuild.installUpdate` for the install — on Android it downloads the APK **inside the app** (no browser redirect) and launches the system installer; on iOS it opens the install URL in Safari:

```dart
final accepted = await showUpdateDialog(
  context,
  update: info,
  appName: 'My App',
  onUpdate: () => AirBuild.installUpdate(info),
  onLater: () {/* optional — defaults to dismissing */},
);
// accepted == true → user tapped Update, false → Later, null → dismissed
```

`installUpdate` accepts `onProgress: (received, total)` so a custom UI can show download progress during the APK download. `total` is `-1` when the server doesn't send a content length — check `total > 0` before computing a percentage. `download_started`/`install_started` analytics events are reported automatically (`download_failed`/`install_failed` on failure).

(`UpdateDialog` is exported as a widget too if you'd rather embed it in your own route/sheet.)

### CodePush (OTA Dart patches)

> **Prerequisite:** the app binary must be produced by `airbuild codepush flutter release` — the CLI compiles the OTA updater runtime into it. A plain `flutter build` can't receive patches. See the [Flutter CodePush guide](../guides/codepush-flutter/) for CLI setup.

Import the second library:

```dart
import 'package:airbuild/airbuild_code_push.dart';

final codePush = AirBuildCodePush();
```

Two update modes — pick one in `shorebird.yaml`:

**Automatic (default, zero code):** `auto_update: true` — the engine's updater checks the production channel on every launch and applies patches on the next restart. No Dart code needed.

**Manual (channels + custom UX):** `auto_update: false` — your code drives everything:

```dart
// Fire-and-forget — don't await network calls in initState.
codePush.checkForUpdate().then((status) async {
  if (status == UpdateStatus.outdated) {
    await codePush.update();          // downloads + installs; applies on restart
    if (context.mounted) {
      showRestartBanner(context, onRestart: () {
        // The SDK can't restart the app for you — use what your app
        // already has, e.g. flutter_phoenix's Phoenix.rebirth(context).
      });
    }
  } else if (status == UpdateStatus.restartRequired) {
    // A downloaded patch is already waiting to boot — prompt to restart.
  }
});
```

`UpdateStatus` values: `upToDate` (nothing new), `outdated` (a patch is available — call `update()`), `restartRequired` (a downloaded patch is staged), `unavailable` (no updater runtime — debug builds, plain `flutter build`).

**Channels:** pass `channel:` to `checkForUpdate`/`update` (or `defaultChannel:` on the constructor) to check `staging` or any custom channel you promoted to. The boot-time auto-updater always uses production.

**Patch state:**

```dart
final current = await codePush.currentPatch(); // Patch? — booted now, null = base release
final next    = await codePush.nextPatch();    // Patch? — downloaded, awaiting restart
```

**Zero-wiring option — `AirBuildCodePushOverlay`:** wraps your app and runs check → download → restart-banner itself (still needs `auto_update: false`):

```dart
MaterialApp(
  builder: (context, child) => AirBuildCodePushOverlay(
    config: AirBuildCodePushConfig(
      channel: 'staging',                  // optional, default 'production'
      checkInterval: Duration(hours: 4),   // Duration.zero disables the timer
      onRestart: () => Phoenix.rebirth(context),
    ),
    child: child ?? const SizedBox.shrink(),
  ),
  home: const HomePage(),
)
```

It checks on launch, on resume, and on the interval; a staged patch shows a banner with **Later**/**Restart now**. `bannerBuilder` replaces the banner, `showDebugBar: true` adds a live status strip for dev builds, and `onUpdateReady` fires once per staged patch for analytics. `AirBuildCodePushOverlay.maybeOf(context)` exposes `status` and `checkNow()`.

**Play Store opt-out:** `AirBuildCodePush(disableOnPlayStoreInstalls: true)` (or the same flag on `AirBuildCodePushConfig`) skips Dart-driven checks on devices installed from Google Play — pair it with `auto_update: false` for a complete opt-out. `installerPackageName()`/`isPlayStoreInstall()` are exported for the raw value.

Every CodePush method no-ops gracefully when the updater runtime isn't present (`codePush.isAvailable` is `false`) — safe to call unconditionally.

Repository: [github.com/airbuild/airbuild-flutter](https://github.com/airbuild/airbuild-flutter)

## React Native

Install via npm:

```bash
npm install @airbuild/react-native
```

### Usage

```ts
import { AirBuild } from '@airbuild/react-native';

// One-time setup
AirBuild.configure({
  distributionKey: 'dk_a1b2c3d4e5f6',
});

// Check for updates
await AirBuild.checkForUpdates({
  currentVersion: '1.0.0',
});
```

### CodePush (OTA JS updates)

The same package also exposes `AirBuildCodePush` for OTA bundle updates (see the [React Native CodePush guide](../guides/codepush-react-native/)):

```ts
import { AirBuild, AirBuildCodePush } from '@airbuild/react-native';

AirBuild.configure({ distributionKey: 'dk_a1b2c3d4e5f6' });

// Reports launch outcomes (installs / startup crashes) to AirBuild —
// powers install metrics and crash-rate auto-pause. Call once, early.
// Reuses AirBuild.configure()'s key + base URL.
AirBuildCodePush.enableTelemetry();

// Optional manual control:
const info = AirBuildCodePush.currentUpdate; // running update metadata
const check = await AirBuildCodePush.checkForUpdate();
await AirBuildCodePush.fetchUpdate();   // download; applies next launch
await AirBuildCodePush.reload();        // restart into a pending update
```

Every method no-ops when the OTA runtime isn't installed or enabled (dev builds, Expo Go). Apps that only use binary distribution don't need it.

Repository: [github.com/airbuild/airbuild-react-native](https://github.com/airbuild/airbuild-react-native)

## Capacitor

**Coming soon.** Web-content OTA updates for Capacitor apps — staged rollouts, instant rollback, and the same install funnel as Flutter and React Native — are on the roadmap.

## iOS

Install via CocoaPods:

```ruby
pod 'AirBuild', :git => 'https://github.com/airbuild/airbuild-ios.git', :tag => '0.1.1'
```

Or via Swift Package Manager — add the repository URL in Xcode:

```text
https://github.com/airbuild/airbuild-ios
```

### Usage

```swift
import AirBuild

// One-time setup (e.g. in AppDelegate)
AirBuild.configure(distributionKey: "dk_a1b2c3d4e5f6")

// Check for updates
await AirBuild.shared.checkForUpdates(currentVersion: "1.0.0")
```

Repository: [github.com/airbuild/airbuild-ios](https://github.com/airbuild/airbuild-ios)

## Android

Add to your `build.gradle`:

```groovy
implementation 'dev.airbuild:airbuild-android:0.1.1'
```

### Usage

```kotlin
import dev.airbuild.airbuild_android.AirBuild

// One-time setup (e.g. in Application.onCreate())
AirBuild.configure(
    distributionKey = "dk_a1b2c3d4e5f6",
)

// Check for updates
AirBuild.checkForUpdates(context, currentVersion = "1.0.0")
```

Repository: [github.com/airbuild/airbuild-android](https://github.com/airbuild/airbuild-android)

## How the update flow works

All SDKs handle the full flow automatically:

1. **Check** — Calls `GET /api/sdk/check-update` with the distribution key, current version, and platform.
2. **Prompt** — If a newer build is available, shows a default dialog with the version, release notes, and file size.
3. **Install** — On "Update" tap:
   - **Android**: Downloads the APK in-app and launches the system installer. On Android 12+ (API 31+) it uses a `PackageInstaller` session — when your app is its own installer of record, the update applies with no confirmation at all; otherwise the standard install sheet opens (one tap on "Install"). On Android 11 and below the install sheet always opens.
   - **iOS**: Opens the install URL in Safari/SFSafariViewController (iOS does not allow sideloading IPAs in-app).
4. **Analytics** — Reports events throughout the flow: `update_prompt_shown`, `update_accepted`, `update_declined`, `download_started`, `install_started`.

## Where to find your distribution key

1. Open the AirBuild dashboard.
2. Navigate to your app's detail page.
3. The **Integration Keys** card in the sidebar shows both:
   - **App ID** — used with the `--app-id` flag in the AirBuild CLI.
   - **Distribution Key** — used to configure the SDK in your app.

You can copy the key with the copy button, or regenerate it if needed (regenerating invalidates the old key — all deployed SDKs using the old key will stop receiving updates until updated).

## Next steps

- [API Reference](./api-reference/) — The API the SDKs use under the hood.
- [UDID Capture](../guides/udid-capture/) — Understand the UDID registration flow.
- [CLI Tool](./cli/) — Automate uploads from CI/CD.
