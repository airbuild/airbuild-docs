---
title: FAQ
description: Frequently asked questions about AirBuild.
---

# FAQ

## Can I upload `.aab` files?

**No.** AirBuild only supports `.ipa` (iOS) and `.apk` (Android) files. Android App Bundles (`.aab`) are not supported. Export a universal APK from Android Studio or `bundletool` before uploading:

```bash
bundletool build-apks --bundle=app.aab --output=app.apks --mode=universal
```

## Is HTTPS required?

**Yes** for iOS OTA installation — the `itms-services://` protocol requires the manifest plist to be served over HTTPS. AirBuild handles this automatically on the hosted platform.

## How many testers can I have?

The number of team members you can invite is limited by your plan:

- **Free** — 2 members
- **Starter** — 5 members
- **Pro** — 20 members
- **Enterprise** — Unlimited

Install links can be shared with anyone — you don't need to add someone as a team member for them to install a build. See [Team Management](../guides/team-management/) for details.

## Do you support Firebase App Distribution migration?

**Not yet.** We're exploring a migration tool to import apps and testers from Firebase App Distribution. Contact support if this is important to you.

## Can I use my own domain?

**Yes**, on **Pro** and **Enterprise** plans. White-label branding (custom logo, color, and display name) is available on Pro and Enterprise. Custom domain support is available on Enterprise. See [Billing & Plans](../guides/billing/) for plan features.

## What's the max build size?

The **hard cap is 2 GB** for any plan. Plan-based limits apply below that:

- Free — 100 MB
- Starter — 300 MB
- Pro — 1 GB
- Enterprise — Custom

## Is there an API?

**Yes.** AirBuild provides a REST API, webhooks, and a CLI tool. See:

- [REST API Reference](../developer/api-reference/)
- [Webhooks](../developer/webhooks/)
- [CLI Tool](../developer/cli/)

## How does virus scanning work?

All uploads are scanned with **ClamAV** before being made available for download. If ClamAV is unavailable (e.g. the daemon is down), the scan **fails open** — the build is still processed and made available. This ensures uploads aren't blocked by scanner outages.

## Have another question?

Check the [Troubleshooting](./troubleshooting/) page or contact support at [support@airbuild.dev](mailto:support@airbuild.dev).
