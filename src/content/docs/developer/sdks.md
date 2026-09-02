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
| React Native  | `@airbuild/react-native`      | npm                   | Available  |
| iOS           | `AirBuild`                    | CocoaPods / SPM       | Available  |
| Android       | `io.airbuild:airbuild-android`| Maven Central         | Available  |

## Features

All SDKs support the following:

- **Check for updates** — Query AirBuild for the latest build of your app and compare it to the installed version.
- **Default update dialog** — Shows a built-in dialog with the new version, release notes, and Update/Later buttons. No custom UI required.
- **Download & install** — Downloads the update and triggers installation (APK for Android, install URL for iOS).
- **Analytics reporting** — Reports events (prompt shown, accepted, declined, download started, install started) to AirBuild for monitoring.

## Configuration

All SDKs use the same configuration model:

1. **Distribution key** (`dk_xxx`) — a public, per-app identifier from the AirBuild dashboard (App Settings page). Safe to embed in distributed apps — it is not a secret.
2. **Base URL** (optional) — defaults to `https://airbuild.dev`. Override for self-hosted or staging environments.

No secret token is needed. Secrets embedded in mobile apps get extracted from APK/IPA binaries, so the distribution key is public by design. Access control is handled server-side (password-protected builds, rate limiting, download quotas).

## Flutter

Install via pub.dev:

```bash
flutter pub add airbuild
```

### Usage

```dart
import 'package:airbuild/airbuild.dart';

void main() {
  AirBuild.configure(
    distributionKey: 'dk_a1b2c3d4e5f6',
  );
  runApp(MyApp());
}

// Later, anywhere in your app:
await AirBuild.checkForUpdates(
  context: context,
  currentVersion: '1.0.0',
);
```

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

Repository: [github.com/airbuild/airbuild-react-native](https://github.com/airbuild/airbuild-react-native)

## iOS

Install via CocoaPods:

```ruby
pod 'AirBuild', :git => 'https://github.com/airbuild/airbuild-ios.git', :tag => '0.1.0'
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
implementation 'io.airbuild:airbuild-android:0.1.0'
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
   - **Android**: Downloads the APK to the cache directory and launches the system PackageInstaller via an Intent.
   - **iOS**: Opens the install URL in Safari/SFSafariViewController (iOS does not allow sideloading IPAs in-app).
4. **Analytics** — Reports events throughout the flow: `update_prompt_shown`, `update_accepted`, `update_declined`, `download_started`, `install_started`.

## Self-hosted / staging

Override the base URL to point at your own AirBuild server:

| SDK | Code |
|-----|------|
| Flutter | `AirBuild.configure(distributionKey: '...', baseUrl: 'https://staging.airbuild.dev')` |
| React Native | `AirBuild.configure({ distributionKey: '...', baseUrl: 'https://staging.airbuild.dev' })` |
| iOS | `AirBuild.configure(distributionKey: "...", baseUrl: URL(string: "https://staging.airbuild.dev")!)` |
| Android | `AirBuild.configure(distributionKey = "...", baseUrl = "https://staging.airbuild.dev")` |

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
