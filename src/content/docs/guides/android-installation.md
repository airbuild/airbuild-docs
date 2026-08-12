---
title: Android APK Installation
description: How testers install APK builds directly from AirBuild install links.
---

# Android APK Installation

Installing an Android build from AirBuild is straightforward — testers download the APK and install it directly. This page covers the steps and common issues.

## How Android installation works

Unlike iOS, Android doesn't require a special protocol or manifest. Testers simply download the `.apk` file and open it to install. AirBuild serves the APK via a direct download link on the install page.

## Installation steps

1. Open the install link (`airbuild.dev/i/abc123`) in any browser on the Android device.
2. Review the app details on the install page.
3. Tap **Download**.
4. Once the download completes, open the APK file from the notification or the Downloads folder.
5. If prompted, allow the browser to install unknown apps (see below).
6. Tap **Install**.
7. The app installs and is ready to open.

## Enabling "Install unknown apps"

On Android 8.0 (Oreo) and later, you need to grant the browser permission to install apps from unknown sources. This is a per-app setting, not a global one.

1. When you first try to install an APK, Android shows a prompt: **"For your security, your phone is not allowed to install unknown apps from this source."**
2. Tap **Settings** on the prompt.
3. Toggle **Allow from this source** to **on**.
4. Go back and tap **Install** again.

Alternatively, you can set this in advance:

1. Open **Settings > Apps**.
2. Find and tap your browser (e.g. Chrome, Firefox).
3. Tap **Install unknown apps**.
4. Toggle **Allow from this source** to **on**.

## Troubleshooting

### "Parse error — There was a problem parsing the package"

- The APK file is **corrupt** — re-download it. Check the SHA-256 checksum on the install page against the downloaded file.
- The APK is built for the **wrong CPU architecture** (e.g. an x86-only APK on an ARM device). Build a universal APK or include the correct ABIs.
- The APK targets an **API level higher** than the device's Android version. Lower your `minSdkVersion` or test on a newer device.

### "App not installed"

- **Signature conflict** — An existing app on the device is signed with a different key. Uninstall the existing app first, then try again.
- **Insufficient storage** — Free up space on the device.
- **Duplicate package** — A different app with the same package name is already installed. Uninstall it first.

### Download doesn't start

- Check your internet connection.
- Ensure the install link hasn't expired or been revoked.
- If the link is password-protected, enter the password first.

## Next steps

- [Install Links & QR Codes](./install-links/) — Configure passwords, expiry, and quotas.
- [iOS OTA Installation](./ios-installation/) — The iOS equivalent.
- [Troubleshooting](../resources/troubleshooting/) — Full list of common issues.
