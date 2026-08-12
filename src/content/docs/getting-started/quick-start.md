---
title: Quick Start
description: Get your first build online and share it with testers in five minutes.
---

# Quick Start

This guide walks you through signing up and distributing your first build on AirBuild.

## Prerequisites

- An iOS (`.ipa`) or Android (`.apk`) build file ready to upload.
- A modern web browser.
- (For iOS) A device enrolled in your provisioning profile, or use [UDID capture](../guides/udid-capture/) to register it first.

## Step 1 — Sign up

Go to [airbuild.dev](https://airbuild.dev) and create an account using email/password or Google sign-in.

## Step 2 — Create your first organization

An organization is a workspace for your team and apps. Your first organization is created automatically when you sign up. Give it a name that reflects your team or company.

## Step 3 — Create an app

1. Open the **Apps** page from the sidebar.
2. Click **Create App**.
3. Enter the app **name** and select the **platform** (iOS or Android).
4. Click **Create**.

## Step 4 — Upload a build

1. Select your app from the list.
2. Click **Upload Build**.
3. Drag and drop your `.ipa` or `.apk` file (or use the file picker).
4. Optionally add **release notes**.
5. Click **Upload**.

AirBuild will scan the file with ClamAV, extract metadata (bundle ID, version, build number, app icon, and more), and process the build. The status moves from `PROCESSING` to `READY` (or `FAILED` if something goes wrong).

## Step 5 — Get the install link

Once the build is `READY`, an install link is generated automatically (e.g. `airbuild.dev/i/abc123`). A scannable **QR code** is also generated for the link.

## Step 6 — Share with testers

Share the install link or QR code with your testers:

- **QR code** — Testers scan it with their phone camera to open the install page.
- **URL** — Send the link via email, Slack, or any messaging app.

Testers open the link on their device, tap **Install App** (iOS) or **Download** (Android), and the app installs over the air.

## Next steps

- [Upload Builds](../guides/upload-builds/) — Dive deeper into metadata, limits, and statuses.
- [iOS OTA Installation](../guides/ios-installation/) — Understand the plist manifest and provisioning profiles.
- [Install Links & QR Codes](../guides/install-links/) — Passwords, expiry, quotas, and revoking.
