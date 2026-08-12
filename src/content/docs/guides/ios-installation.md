---
title: iOS OTA Installation
description: How AirBuild delivers IPA builds to iOS devices over the air.
---

# iOS OTA Installation

AirBuild lets testers install iOS apps over the air (OTA) without cables, Xcode, or TestFlight. This page explains how it works and how to troubleshoot common issues.

## How iOS OTA installation works

iOS supports OTA installation of ad-hoc and enterprise builds via the `itms-services://` protocol. When a tester taps "Install App" on the AirBuild install page, Safari opens a URL like:

```text
itms-services://?action=download-manifest&url=https://airbuild.dev/api/dl/abc123/manifest
```

Safari downloads the manifest plist, which tells iOS where to fetch the IPA and how to install it. AirBuild generates the manifest automatically.

## Prerequisites

- An **iOS device** running a supported OS version.
- An **IPA built for ad-hoc or enterprise distribution** (not App Store distribution).
- The device's **UDID must be included in the provisioning profile** embedded in the IPA.
- **HTTPS** is required for the manifest URL. AirBuild handles this automatically on the hosted platform.

## Installation steps

1. Open the install link (`airbuild.dev/i/abc123`) in **Safari** on the iOS device.
2. Review the app details on the install page.
3. Tap **Install App**.
4. Safari shows a prompt asking to install the app — tap **Install**.
5. The app icon appears on the home screen with a progress indicator.
6. Once downloaded, the app is installed and ready to open.

## Manifest plist

AirBuild generates the manifest plist automatically for every iOS build. The plist contains:

- The app name and bundle ID
- The IPA download URL
- The software version and build number
- The display image (app icon)

You don't need to create or host a plist yourself.

## Provisioning profile

For ad-hoc builds, the **provisioning profile** embedded in the IPA must include the tester's device UDID. If the UDID is not in the profile, the install will fail silently or show an "Unable to install" error.

Use [UDID capture](./udid-capture/) to collect device UDIDs from testers, then add them to your provisioning profile in the Apple Developer portal, regenerate the profile, rebuild the app, and re-upload.

## UDID capture flow

If a tester's device isn't registered yet, the install page shows a **Register Device** button. Tapping it installs a temporary `.mobileconfig` profile that sends the device's UDID back to AirBuild. See [UDID Capture](./udid-capture/) for the full flow.

## Troubleshooting

### "Cannot connect to airbuild.dev"

- Ensure the device has an internet connection.
- Ensure the install link is opened in **Safari** (other browsers may not support `itms-services://`).
- Check that the link hasn't expired or been revoked.

### "Unable to install \<App\>"

- The device's **UDID is not in the provisioning profile**. Use [UDID capture](./udid-capture/) to register the device, then rebuild and re-upload.
- The **provisioning profile has expired**. Regenerate it in the Apple Developer portal, rebuild, and re-upload.
- The IPA was built for **App Store distribution** instead of ad-hoc or enterprise. Rebuild with the correct profile.

### "Untrusted App Developer" (enterprise builds)

For enterprise-distributed apps, iOS requires you to manually trust the developer certificate:

1. Open **Settings > General > VPN & Device Management**.
2. Tap the developer certificate under "Enterprise App".
3. Tap **Trust \<Developer\>**.
4. Confirm by tapping **Trust**.

The app should now open without the untrusted developer warning.

## Next steps

- [UDID Capture](./udid-capture/) — Register iOS devices for ad-hoc distribution.
- [Android APK Installation](./android-installation/) — The Android equivalent.
- [Troubleshooting](../resources/troubleshooting/) — Full list of common issues.
