---
title: SDKs
description: In-app SDKs for Flutter, React Native, iOS, and Android to check for updates and capture UDIDs.
---

# SDKs

AirBuild offers in-app SDKs that let your app check for updates, prompt users to install, register device UDIDs, and report crashes. The SDKs communicate with the AirBuild API to deliver a seamless update experience inside your app.

> ⚠️ The SDKs are currently **in development**. This page describes the planned feature set and will be updated as each SDK is released.

## Available SDKs

| Platform      | Package manager       | Status         |
| ------------- | --------------------- | -------------- |
| Flutter       | pub.dev               | In development |
| React Native  | npm                   | In development |
| iOS           | CocoaPods / SPM       | In development |
| Android       | Maven                 | In development |

## Features

All SDKs will support the following features:

- **Check for updates** — Query AirBuild for the latest build of your app and compare it to the installed version.
- **Download & install** — Download the update and trigger installation (APK for Android, OTA prompt for iOS).
- **UDID registration** — Programmatically capture and register the device UDID for ad-hoc iOS distribution.
- **Crash reporting** — Automatically report crashes to AirBuild for monitoring and triage.

## Flutter

Install via pub.dev:

```bash
flutter pub add airbuild
```

Repository: [github.com/airbuild/sdk-flutter](https://github.com/airbuild/sdk-flutter)

## React Native

Install via npm:

```bash
npm install @airbuild/react-native
```

Repository: [github.com/airbuild/sdk-react-native](https://github.com/airbuild/sdk-react-native)

## iOS

Install via CocoaPods:

```ruby
pod 'AirBuild'
```

Or via Swift Package Manager — add the repository URL in Xcode:

```text
https://github.com/airbuild/sdk-ios
```

Repository: [github.com/airbuild/sdk-ios](https://github.com/airbuild/sdk-ios)

## Android

Add to your `build.gradle`:

```groovy
implementation 'dev.airbuild:sdk-android:1.0.0'
```

Repository: [github.com/airbuild/sdk-android](https://github.com/airbuild/sdk-android)

## Next steps

- [API Reference](./api-reference/) — The API the SDKs use under the hood.
- [UDID Capture](../guides/udid-capture/) — Understand the UDID registration flow.
- [CLI Tool](./cli/) — Automate uploads from CI/CD.
