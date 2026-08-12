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
