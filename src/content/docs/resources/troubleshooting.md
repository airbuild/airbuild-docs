---
title: Troubleshooting
description: Solutions to common iOS, Android, upload, API, and webhook issues.
---

# Troubleshooting

This page covers common issues and how to resolve them. If your issue isn't listed here, contact support at [support@airbuild.dev](mailto:support@airbuild.dev).

## iOS

### "Cannot connect to airbuild.dev"

- Ensure the device has an active internet connection.
- Open the install link in **Safari** — other browsers may not support the `itms-services://` protocol.
- Check that the install link hasn't [expired](../guides/install-links/) or been revoked.

### "Untrusted App Developer"

For enterprise-distributed apps, iOS requires you to manually trust the developer certificate:

1. Open **Settings > General > VPN & Device Management**.
2. Tap the developer certificate under "Enterprise App".
3. Tap **Trust \<Developer\>**.
4. Confirm by tapping **Trust**.

### App won't install

- The device's **UDID is not in the provisioning profile**. Use [UDID capture](../guides/udid-capture/) to register the device, then add the UDID to your provisioning profile in the Apple Developer portal, rebuild, and re-upload.
- The **provisioning profile has expired**. Regenerate it, rebuild, and re-upload.
- The IPA was built for **App Store distribution** instead of ad-hoc or enterprise. Rebuild with the correct profile.

## Android

### "Parse error — There was a problem parsing the package"

- The APK file is **corrupt**. Re-download it and verify the SHA-256 checksum on the install page.
- The APK is built for the **wrong CPU architecture**. Build a universal APK or include the correct ABIs.
- The APK targets an **API level higher** than the device's Android version. Lower `minSdkVersion` or test on a newer device.

### "App not installed"

- **Signature conflict** — An existing app on the device is signed with a different key. Uninstall the existing app first.
- **Insufficient storage** — Free up space on the device.
- **Duplicate package** — A different app with the same package name is installed. Uninstall it first.

## Uploads

### Upload fails

- Check the **file size** against your [plan limit](../guides/upload-builds/). The hard cap is 2 GB.
- Check the **file extension** — only `.ipa` and `.apk` are supported (not `.aab`).
- Check your internet connection — large files may fail on unstable connections. Try the [CLI](../developer/cli/) for resumable uploads.

## Install links

### Install link expired

- Check the **expiry date** on the build detail page. Link expiry depends on your plan (7 days on Free, 30 days on Starter, never on Pro/Enterprise).
- Create a **new link** from the build detail page to restore access.

### Install link not working

- Check if the link has been **revoked**. Restore it from the build detail page.
- Check if the link is **password-protected**. Enter the password on the install page.

## API

### API key not working

- Check the **key format** — it must start with `airbuild_` followed by 32 hex characters.
- Check if the key has been **revoked** in **Settings > API Keys**.
- Ensure you're sending the key in the `Authorization: Bearer airbuild_xxx` header.
- Verify the key with `GET /api/cli/verify` — see [API Reference](../developer/api-reference/).

## Webhooks

### Webhook not receiving events

- Ensure the webhook URL is **publicly accessible** (not behind a VPN or firewall).
- Verify the configured **events** match what you expect — see [Webhooks](../developer/webhooks/) for the full event list.
- Check the **delivery history** on the webhook detail page for failed deliveries and response codes.
- Ensure your endpoint returns a **2xx status code** within 10 seconds.

## Next steps

- [FAQ](./faq/) — Common questions and answers.
- [iOS OTA Installation](../guides/ios-installation/) — iOS install flow details.
- [Android APK Installation](../guides/android-installation/) — Android install flow details.
