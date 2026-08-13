---
title: Upload Builds
description: Upload IPA and APK builds, extract metadata, and share install links.
---

# Upload Builds

Uploading a build is the core action in AirBuild. Once uploaded, AirBuild scans it, extracts metadata, generates an install link, and notifies your team.

## How to upload

1. Go to **Apps** in the sidebar.
2. Select the app you want to upload to.
3. Click **Upload Build**.
4. Drag and drop your file (or use the file picker).
5. Optionally enter **release notes**.
6. Click **Upload**.

## Supported files

| Platform | Extension | Supported |
| -------- | --------- | --------- |
| iOS      | `.ipa`    | ✓         |
| Android  | `.apk`    | ✓         |
| Android  | `.aab`    | ✗         |

> `.aab` (Android App Bundle) is **not** supported. Export a universal APK from Android Studio or `bundletool` before uploading.

## File size limits

File size limits depend on your plan. There is a **2 GB hard cap** regardless of plan.

| Plan        | Max build size |
| ----------- | -------------- |
| Free        | 100 MB         |
| Starter     | 300 MB         |
| Pro         | 1 GB           |
| Enterprise  | Custom         |
| **Hard cap**| **2 GB**       |

## Auto-extracted metadata

When you upload a build, AirBuild parses the file and extracts the following metadata automatically:

- **Bundle ID** / package name
- **Version** (e.g. `1.4.2`)
- **Build number** (e.g. `42`)
- **Minimum OS version**
- **App icon**
- **Provisioning profile info** (iOS only) — name, expiry date, and team ID

## Bundle ID validation

AirBuild enforces **per-platform bundle ID consistency** to prevent accidentally uploading builds from different apps to the same AirBuild app.

### How it works

- The **first build** uploaded for a platform (iOS or Android) sets the canonical bundle ID for that platform on the app.
- Subsequent builds for the **same platform** must match the bundle ID exactly.
- iOS and Android can have **different** bundle IDs on the same AirBuild app — they are tracked independently.

For example, if your first iOS upload has bundle ID `com.example.myapp`, all future iOS uploads to that app must also use `com.example.myapp`. An upload with `com.example.myapp.dev` will be rejected.

### What happens on mismatch

If you upload a build whose bundle ID doesn't match the one locked in for that platform, the upload is rejected with an error:

> Bundle ID mismatch for iOS. This app's iOS builds use bundle ID "com.example.myapp", but the uploaded file has "com.example.myapp.dev". If you need to use a different bundle ID, archive this app and create a new one.

### Changing a bundle ID

Bundle IDs are locked once set. To use a different bundle ID for a platform:

1. **Archive** the current app (from the app detail page).
2. **Create a new app** with the desired platforms.
3. Upload builds to the new app.

This prevents accidental cross-app contamination while keeping the history of each app's builds clean.

### Where bundle IDs are shown

- **App detail page** — shows `iOS: com.example.app` and `Android: com.example.app` separately
- **Admin organization page** — shows both bundle IDs with platform labels
- **Install page** — shows the build's bundle ID
- **CLI** — `airbuild apps list` displays both bundle IDs

## Release notes

Release notes are optional. Enter a short description of what's new in this build. Release notes are shown on the install page and included in email notifications.

## Virus scanning

Every upload is scanned with **ClamAV** before it becomes available for download. If ClamAV is unavailable, the scan fails open (the build is still processed) — see [Troubleshooting](../resources/troubleshooting/) for details.

## Build statuses

A build moves through the following statuses:

```text
PROCESSING ──▶ READY
          └──▶ FAILED
```

- **PROCESSING** — The build is being scanned and metadata is being extracted.
- **READY** — The build is available for download and install links are active.
- **FAILED** — Something went wrong (corrupt file, virus detected, parse error). Check the error message on the build detail page.

## Install link

An install link is **auto-generated** as soon as the build is uploaded. You'll find it on the build detail page along with a QR code. See [Install Links & QR Codes](./install-links/) for configuration options.

## Notifications

- **Email** — Org members receive an email notification when a new build is uploaded.
- **Webhook** — The `build.uploaded` webhook event is fired. See [Webhooks](../developer/webhooks/) for details.

## Next steps

- [Install Links & QR Codes](./install-links/) — Configure passwords, expiry, and quotas.
- [iOS OTA Installation](./ios-installation/) — How iOS installs work over the air.
- [API Reference](../developer/api-reference/) — Upload builds via the REST API.
